import { GraphQLClient } from 'graphql-request';

/**
 * WooCommerce (WooGraphQL) rotates the `woocommerce-session` token on mutations
 * such as `checkout` and `updateCustomer`, returning the new token in the HTTP
 * RESPONSE header `woocommerce-session`. nuxt-graphql-client only ever reads a
 * token from the response BODY (customer.sessionToken), so header rotations are
 * silently lost — every later request then uses a stale session and the just-
 * placed guest order returns "Not authorized to access this order".
 *
 * This plugin installs a `responseMiddleware` on the graphql-request client that
 * captures the rotated token from the response header and writes it back to both
 * the cookie and the outgoing request header, keeping the session in sync.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const { getDomain } = useHelpers();

  const applyToken = (rawToken: string) => {
    const token = rawToken.replace(/^Session\s+/i, '').trim();
    if (!token) return;
    const cookie = useCookie('woocommerce-session', { domain: getDomain(window.location.href) });
    if (cookie.value === token) return;
    cookie.value = token;
    useGqlHeaders({ 'woocommerce-session': `Session ${token}` });
  };

  const installMiddleware = () => {
    const state = (nuxtApp as any)._gqlState?.value;
    if (!state) return false;
    let installedAny = false;
    for (const key of Object.keys(state)) {
      const instance = state[key]?.instance as GraphQLClient | undefined;
      if (!instance || (instance as any).__wooSessionCapture) continue;
      const cfg = (instance as any).requestConfig || ((instance as any).requestConfig = {});
      cfg.responseMiddleware = (response: any) => {
        try {
          const headers = response?.headers;
          const rotated = headers && typeof headers.get === 'function' ? headers.get('woocommerce-session') : undefined;
          if (rotated) applyToken(rotated);
        } catch {}
      };
      (instance as any).__wooSessionCapture = true;
      installedAny = true;
    }
    return installedAny;
  };

  // Try installing immediately, and also on app mount as a fallback.
  installMiddleware();
  nuxtApp.hook('app:mounted', () => {
    installMiddleware();
  });

  // `gql:auth:init` fires just before every GraphQL request, once `_gqlState`
  // exists. This guarantees the response middleware is installed before the
  // first real request (e.g. the checkout mutation) is sent.
  nuxtApp.hook('gql:auth:init', () => {
    installMiddleware();
  });
});
