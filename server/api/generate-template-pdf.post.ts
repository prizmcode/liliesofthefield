import { JSDOM } from "jsdom";
import sharp from "sharp";
import { ZipArchive } from "archiver";

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
 const svgEl = dom.window.document.querySelector(
  "svg",
 ) as unknown as SVGSVGElement;
 const g = globalThis as any;
 const prev = { document: g.document, window: g.window };
 g.document = dom.window.document;
 g.window = dom.window; // svg2pdf DOM shim
 const orientation =
  body.orientation === "landscape" ? "landscape" : "portrait";
 const pageW = orientation === "landscape" ? 279.4 : 215.9;
 const pageH = orientation === "landscape" ? 215.9 : 279.4;
 const pdf = new jsPDF({ orientation, unit: "mm", format: "letter" });
 try {
  await pdf.svg(svgEl, { x: 0, y: 0, width: pageW, height: pageH });
 } finally {
  g.document = prev.document;
  g.window = prev.window;
 }

 const baseFilename = (body.filename || "Calligraphy-Template.pdf").replace(
  /[^a-zA-Z0-9._-]+/g,
  "-",
 );
 const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));

 // If PNG is not requested, return the PDF directly (original behavior).
 if (!body.includePng) {
  setHeader(event, "Content-Type", "application/pdf");
  setHeader(
   event,
   "Content-Disposition",
   `attachment; filename="${baseFilename}"`,
  );
  return pdfBuffer;
 }

 // Generate a transparent PNG from the SVG using sharp.
 // The SVG has no background rect (the white bg is a CSS class in the browser),
 // so the PNG will naturally have a transparent background.
 const pngFilename = baseFilename.replace(/\.pdf$/i, "") + ".png";
 const pngBuffer = await sharp(Buffer.from(svg))
  .resize({
   width: 2550, // 300 DPI at 8.5"
   height: 3300, // 300 DPI at 11"
   fit: "contain",
   background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toBuffer();

 // Create a zip archive containing both the PDF and PNG.
 const zipFilename = baseFilename.replace(/\.pdf$/i, "") + ".zip";
 const zipBuffer = await new Promise<Buffer>((resolve, reject) => {
  const archive = new ZipArchive({ zlib: { level: 9 } });
  const chunks: Buffer[] = [];
  archive.on("data", (chunk: Buffer) => chunks.push(chunk));
  archive.on("end", () => resolve(Buffer.concat(chunks)));
  archive.on("error", reject);
  archive.append(pdfBuffer, { name: baseFilename });
  archive.append(pngBuffer, { name: pngFilename });
  archive.finalize();
 });

 setHeader(event, "Content-Type", "application/zip");
 setHeader(
  event,
  "Content-Disposition",
  `attachment; filename="${zipFilename}"`,
 );
 return zipBuffer;
});
