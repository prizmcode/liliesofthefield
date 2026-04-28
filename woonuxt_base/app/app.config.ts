/**
 * App configuration.
 * This file is used to configure the app settings.
 * Below are the default values.
 */
export default defineAppConfig({
  siteName: 'Lilies of the Field',
  shortDescription:
    'Lilies of the Field is a curated creative studio specializing in calligraphy, original artwork, and handcrafted ceramics. Combining timeless elegance with organic beauty, we create mindful, intentional pieces designed to bring warmth and elevated artistry into the home.',
  description: `Lilies of the Field is a curated creative studio specializing in calligraphy, original artwork, and handcrafted ceramics designed to bring intentional beauty into everyday life. 
From custom, hand-lettered commissions for special occasions to thoughtful, handcrafted ceramic pieces and original paintings, every item is designed and produced with meticulous care. `,
  baseUrl: 'https://liliesofthefield.co',
  siteImage: 'https://user-images.githubusercontent.com/5116925/218879668-f4c1f9fd-bef4-44b0-bc7f-e87d994aa3a1.png',
  stripePaymentMethod: 'payment', // 'card' or 'payment'
  // Stripe Payment Method Options:
  // - 'card': Traditional single card input field (legacy but still supported)
  // - 'payment': Modern Payment Element with tabs for multiple payment methods (recommended)
  storeSettings: {
    autoOpenCart: false,
    // cartMode: 'optimistic' updates UI immediately; 'safe' waits for the server response.
    cartMode: 'optimistic',
    showReviews: true,
    showFilters: true,
    showOrderByDropdown: true,
    showSKU: true,
    showRelatedProducts: true,
    showProductCategoriesOnSingleProduct: true,
    showBreadcrumbOnSingleProduct: true,
    showMoveToWishlist: true,
    hideBillingAddressForVirtualProducts: false,
    initStoreOnUserActionToReduceServerLoad: true,
    saleBadge: 'percent', // 'percent', 'onSale' or 'hidden'
    socialLoginsDisplay: 'buttons', // 'buttons' or 'icons'
  },
});
