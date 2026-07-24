interface Body {
 svg: string;
 filename?: string;
 orientation?: "portrait" | "landscape";
 includePng?: boolean;
}

const ORDERS_QUERY = `query TplOrders {
  viewer { roles { nodes { name } } }
  customer { orders(first: 100) { nodes { status lineItems { nodes { product { node { ... on Product { databaseId } } } variation { node { databaseId } } } } } } }
}`;

export default defineEventHandler(async (event) => {
 const config = useRuntimeConfig();
 const body = await readBody<Body>(event);
 const svg = body?.svg?.trim() ?? "";
 if (!svg || !svg.startsWith("<svg") || svg.length > 2_000_000) {
  throw createError({ statusCode: 400, statusMessage: "Invalid SVG payload." });
 }

 const host = (config.public["graphql-client"] as any).clients.default.host;
 const authHeader = getHeader(event, "authorization");
 const wooSession = getCookie(event, "woocommerce-session");
 const adminSecret = getHeader(event, "x-admin-secret");

 const headers: Record<string, string> = { "Content-Type": "application/json" };
 if (authHeader) headers.Authorization = authHeader;
 if (wooSession) headers["woocommerce-session"] = `Session ${wooSession}`;

 let allowed = false;
 // Admin fallback via secret
 if (
  config.templateAdminSecret &&
  adminSecret &&
  adminSecret === config.templateAdminSecret
 )
  allowed = true;

 if (!allowed) {
  try {
   const res = await $fetch<{ data?: any }>(host, {
    method: "POST",
    headers,
    body: { query: ORDERS_QUERY },
   });
   const roles = res?.data?.viewer?.roles?.nodes?.map((r: any) => r.name) ?? [];
   if (roles.includes("administrator")) allowed = true;
   const paid = ["COMPLETED", "PROCESSING"];
   const pid = String(config.templateProductId);
   const pdfPngVariationId = String(config.templateVariationPdfAndPng);
   const orders = res?.data?.customer?.orders?.nodes ?? [];
   if (!allowed && pid) {
    allowed = orders.some(
     (o: any) =>
      paid.includes(o?.status) &&
      (o?.lineItems?.nodes ?? []).some(
       (li: any) =>
        String(li?.product?.node?.databaseId) === pid ||
        String(li?.variation?.node?.databaseId) === pid ||
        String(li?.variation?.node?.databaseId) === pdfPngVariationId,
      ),
    );
   }
  } catch (err) {
   console.error("[generate-template-pdf] auth query failed:", err);
  }
 }

 if (!allowed) {
  throw createError({
   statusCode: 403,
   statusMessage: "Not authorized to download the clean template.",
  });
 }

 const result = await renderTemplateFile({
  svg,
  filename: body.filename,
  orientation: body.orientation,
  includePng: body.includePng,
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
