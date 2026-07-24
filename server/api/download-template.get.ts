// Backs the direct download link emailed to customers in the WooCommerce
// "order completed" email (see the `calligraphy-pricing` plugin's
// Calligraphy_Pricing_Download_Links class in the prizm-studio-wp-content
// repo). The token itself is the credential — WordPress mints an unguessable
// token per line item and stores the design behind it in a transient that
// expires on its own, so this endpoint doesn't need any additional secret or
// customer session to authorize the request.
interface TemplatePayload {
 svg?: string;
 filename?: string;
 orientation?: "portrait" | "landscape";
 includePng?: boolean;
}

function expiredResponse(event: any) {
 setResponseStatus(event, 410);
 setHeader(event, "Content-Type", "text/html; charset=utf-8");
 return `<!doctype html>
<html>
<head><meta charset="utf-8"><title>Download link expired</title></head>
<body style="font-family: sans-serif; max-width: 32rem; margin: 4rem auto; text-align: center; color: #374151;">
  <h1 style="font-size: 1.25rem;">This download link has expired</h1>
  <p>Please log in to your account to re-download your design from your order history.</p>
  <p><a href="/my-account?tab=orders" style="color: #925200;">Go to My Account</a></p>
</body>
</html>`;
}

export default defineEventHandler(async (event) => {
 const query = getQuery(event);
 const token = typeof query.token === "string" ? query.token.trim() : "";
 if (!token || !/^[a-f0-9]{32,64}$/i.test(token)) {
  throw createError({ statusCode: 400, statusMessage: "Invalid download link." });
 }

 const config = useRuntimeConfig();
 const graphqlHost = (config.public["graphql-client"] as any).clients.default
  .host as string;
 const wpOrigin = graphqlHost.replace(/\/graphql\/?$/, "");

 let payload: TemplatePayload | null = null;
 try {
  payload = await $fetch<TemplatePayload>(
   `${wpOrigin}/wp-json/calligraphy/v1/download/${encodeURIComponent(token)}`,
  );
 } catch (err: any) {
  if (err?.response?.status === 404) return expiredResponse(event);
  console.error("[download-template] token lookup failed:", err);
  throw createError({
   statusCode: 502,
   statusMessage: "Could not reach the design store.",
  });
 }

 if (!payload?.svg) return expiredResponse(event);

 const result = await renderTemplateFile({
  svg: payload.svg,
  filename: payload.filename,
  orientation: payload.orientation,
  includePng: payload.includePng,
  requestOrigin: getRequestURL(event).origin,
 });

 setHeader(event, "Content-Type", result.contentType);
 setHeader(
  event,
  "Content-Disposition",
  `attachment; filename="${result.downloadFilename}"`,
 );
 return result.buffer;
});
