import { JSDOM } from "jsdom";

interface Body {
 svg: string;
 filename?: string;
}

const ORDERS_QUERY = `query TplOrders {
 viewer { roles { nodes { name } } }
 customer { orders(first: 100) { nodes { status lineItems { nodes { product { node { ... on Product { databaseId } } } } } } } }
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
   const orders = res?.data?.customer?.orders?.nodes ?? [];
   if (!allowed && pid) {
    allowed = orders.some(
     (o: any) =>
      paid.includes(o?.status) &&
      (o?.lineItems?.nodes ?? []).some(
       (li: any) => String(li?.product?.node?.databaseId) === pid,
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

 // SVG -> PDF (primary: jsdom). See RISKS; swap to puppeteer if text fails.
 // svg2pdf.js registers a `.svg()` instance method on jsPDF; using it avoids
 // named-export interop issues between the ES and UMD builds server-side.
 const [{ jsPDF }] = await Promise.all([import("jspdf"), import("svg2pdf.js")]);
 const dom = new JSDOM(`<!DOCTYPE html><body>${svg}</body>`, {
  contentType: "text/html",
 });
 // jsdom does not implement getBBox for <text>, which svg2pdf.js uses to measure
 // text width (jsdom also lacks canvas, so the faster canvas path is unavailable).
 // Approximate the width from character count and font size so the footer text
 // renders without a headless browser (see RISKS).
 const svgProto = (dom.window as any).SVGElement?.prototype;
 if (svgProto && typeof svgProto.getBBox !== "function") {
  svgProto.getBBox = function () {
   const text = this.textContent || "";
   const fontSize = parseFloat(this.getAttribute?.("font-size") || "16") || 16;
   return { x: 0, y: 0, width: text.length * fontSize * 0.5, height: fontSize };
  };
 }
 const svgEl = dom.window.document.querySelector("svg") as unknown as SVGSVGElement;
 const g = globalThis as any;
 const prev = { document: g.document, window: g.window };
 g.document = dom.window.document;
 g.window = dom.window; // svg2pdf DOM shim
 const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" });
 try {
  await pdf.svg(svgEl, { x: 0, y: 0, width: 215.9, height: 279.4 });
 } finally {
  g.document = prev.document;
  g.window = prev.window;
 }

 const filename = (body.filename || "Calligraphy-Template.pdf").replace(
  /[^a-zA-Z0-9._-]+/g,
  "-",
 );
 const buffer = new Uint8Array(pdf.output("arraybuffer"));
 setHeader(event, "Content-Type", "application/pdf");
 setHeader(event, "Content-Disposition", `attachment; filename="${filename}"`);
 return buffer;
});
