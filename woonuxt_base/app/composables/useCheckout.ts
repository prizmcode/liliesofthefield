import type { CheckoutInput, CreateAccountInput, UpdateCustomerInput } from '#types/gql';

export function useCheckout() {
  const { customer, loginUser } = useAuth();
  const { cart, refreshCart, isUpdatingCart } = useCart();

  const orderInput = useState<any>('orderInput', () => {
    return {
      customerNote: '',
      paymentMethod: '',
      shipToDifferentAddress: false,
      metaData: [{ key: 'order_via', value: 'WooNuxt' }],
    };
  });

  const isProcessingOrder = useState<boolean>('isProcessingOrder', () => false);
  const checkoutError = ref<string | null>(null);

  // Helper function to build checkout payload
  const buildCheckoutPayload = (isPaid = false): CheckoutInput => {
    const { username, password, shipToDifferentAddress } = orderInput.value;
    const shippingSource = customer.value?.shipping ?? customer.value?.billing;
    const billingSource = shipToDifferentAddress ? customer.value?.billing : shippingSource;
    // The email is only ever captured on `customer.billing.email` (the contact
    // field). When not shipping to a different address, `billingSource` is the
    // shipping object, which has no email — so the order would be created with a
    // null billing email and never link to the guest's session. Always carry the
    // billing email through so the order is associated with the customer.
    const billing = { ...billingSource, email: customer.value?.billing?.email ?? billingSource?.email ?? null };
    const shipping = shipToDifferentAddress ? shippingSource : billingSource;

    const payload: CheckoutInput = {
      billing,
      shipping,
      shippingMethod: cart.value?.chosenShippingMethods,
      metaData: orderInput.value.metaData,
      paymentMethod: orderInput.value.paymentMethod.id,
      customerNote: orderInput.value.customerNote,
      shipToDifferentAddress,
      transactionId: orderInput.value.transactionId,
      isPaid,
    };

    // Handle account creation
    if (orderInput.value.createAccount) {
      payload.account = { username, password } as CreateAccountInput;
    } else {
      payload.account = null;
    }

    return payload;
  };

  // Helper function to check if payment method is PayPal
  const isPayPalPayment = (): boolean => {
    const paymentId = orderInput.value.paymentMethod.id;
    return paymentId === 'paypal' || paymentId === 'ppcp-gateway';
  };

  // Helper function to handle PayPal redirect
  const handlePayPalRedirect = async (checkout: any, orderId: string, orderKey: string): Promise<void> => {
    const { replaceQueryParam } = useHelpers();
    const router = useRouter();

    const frontEndUrl = window.location.origin;
    let redirectUrl = checkout?.redirect ?? '';

    const payPalReturnUrl = `${frontEndUrl}/checkout/order-received/${orderId}/?key=${orderKey}&from_paypal=true`;
    const payPalCancelUrl = `${frontEndUrl}/checkout/?cancel_order=true&from_paypal=true`;

    redirectUrl = replaceQueryParam('return', payPalReturnUrl, redirectUrl);
    redirectUrl = replaceQueryParam('cancel_return', payPalCancelUrl, redirectUrl);
    redirectUrl = replaceQueryParam('bn', 'WooNuxt_Cart', redirectUrl);

    const isPayPalWindowClosed = await openPayPalWindow(redirectUrl);

    if (isPayPalWindowClosed) {
      router.push(`/checkout/order-received/${orderId}/?key=${orderKey}&fetch_delay=true`);
    }
  };

  // Helper function to handle post-checkout account creation
  const handleAccountCreation = async (): Promise<void> => {
    if (orderInput.value.createAccount) {
      const { username, password } = orderInput.value;
      await loginUser({ username, password });
    }
  };

  // Helper function to finalize checkout
  const finalizeCheckout = async (checkout: any): Promise<void> => {
    if (checkout?.result !== 'success' && !checkout?.order?.databaseId) {
      checkoutError.value = 'There was an error processing your order. Please try again.';
    }
  };

  // if Country or State are changed, calculate the shipping rates again
  async function updateShippingLocation() {
    isUpdatingCart.value = true;

    try {
      const pickLocation = (address: any) => {
        if (!address) return {};
        const { address1, address2, city, country, postcode, state } = address;
        return { address1, address2, city, country, postcode, state };
      };

      const shippingSource = customer.value?.shipping ?? customer.value?.billing;
      const billingSource = orderInput.value.shipToDifferentAddress ? customer.value?.billing : shippingSource;

      if (!orderInput.value.shipToDifferentAddress && customer.value?.billing && shippingSource) {
        Object.assign(customer.value.billing, {
          ...shippingSource,
          email: customer.value.billing.email,
        });
      }

      const shipping = pickLocation(shippingSource);
      const billing = pickLocation(billingSource);

      const { updateCustomer } = await GqlUpdateCustomer({
        input: {
          shipping,
          billing,
        } as UpdateCustomerInput,
      });

      if (!updateCustomer) {
        console.warn('[updateShippingLocation] updateCustomer returned null/false');
      }

      await refreshCart();
    } catch (error) {
      console.error('Error updating shipping location:', error);
    } finally {
      isUpdatingCart.value = false;
    }
  }

  async function openPayPalWindow(redirectUrl: string): Promise<boolean> {
    return new Promise((resolve) => {
      const width = 750;
      const height = 750;
      const left = window.innerWidth / 2 - width / 2;
      const top = window.innerHeight / 2 - height / 2 + 80;
      const payPalWindow = window.open(redirectUrl, '', `width=${width},height=${height},top=${top},left=${left}`);
      const timer = setInterval(() => {
        if (payPalWindow && payPalWindow.closed) {
          clearInterval(timer);
          resolve(true);
        }
      }, 500);
    });
  }

  const processCheckout = async (isPaid = false): Promise<any> => {
    const router = useRouter();

    isProcessingOrder.value = true;
    checkoutError.value = null;

    try {
      // Build checkout payload
      const checkoutPayload = buildCheckoutPayload(isPaid);

      // WooGraphQL only exposes a guest's order through `customer.orders` when the
      // billing email is set on the WooCommerce session AT THE TIME THE ORDER IS
      // CREATED. Set it BEFORE checkout so the order is linked to this session at
      // creation, making it readable on the order-received page. (Setting it after
      // checkout rotates the session to a new one that never owned the order.)
      // Skipped when an account is being created (order links to the account).
      const billingEmail = customer.value?.billing?.email;
      if (billingEmail && !orderInput.value.createAccount) {
        try {
          await GqlUpdateCustomer({ input: { billing: { email: billingEmail } } as UpdateCustomerInput });
        } catch (e) {
          console.warn('[checkout] failed to set billing email on session:', e);
        }
      }

      // Process the checkout
      const { checkout } = await GqlCheckout(checkoutPayload);

      // Handle account creation if requested
      await handleAccountCreation();

      let orderId = checkout?.order?.databaseId as number | string | undefined;
      let orderKey = checkout?.order?.orderKey as string | undefined;

      // WooGraphQL returns null for databaseId/orderKey on orders that complete
      // immediately (needsPayment=false, needsProcessing=false), but the redirect
      // URL still contains them: .../order-received/{id}/?key={key}
      if ((!orderId || !orderKey) && checkout?.redirect) {
        const redirectMatch = String(checkout.redirect).match(/order-received\/(\d+)\/?\?[^#]*\bkey=([^&#]+)/i);
        if (redirectMatch) {
          if (!orderId) orderId = redirectMatch[1];
          if (!orderKey) orderKey = decodeURIComponent(redirectMatch[2]);
        }
      }

      // Ensure we have required order details
      if (!orderId || !orderKey) {
        throw new Error('Order ID or order key is missing from checkout response');
      }

      // Handle PayPal redirect if needed
      if (checkout?.redirect && isPayPalPayment()) {
        await handlePayPalRedirect(checkout, String(orderId), orderKey);
      } else {
        // Standard redirect to order received page
        router.push(`/checkout/order-received/${orderId}/?key=${orderKey}`);
      }

      // Finalize the checkout
      await finalizeCheckout(checkout);

      return checkout;
    } catch (error: unknown) {
      console.error('Checkout error:', error);
      checkoutError.value = error instanceof Error && error.message ? error.message : 'An error occurred during checkout. Please try again.';
      return null;
    } finally {
      isProcessingOrder.value = false;
    }
  };

  return {
    orderInput,
    isProcessingOrder,
    checkoutError,
    processCheckout,
    updateShippingLocation,
  };
}
