import { JSDOM } from "jsdom";
import { GOOGLE_FONTS } from "#shared/utils/guideFonts";

export interface RenderTemplateFileParams {
 svg: string;
 filename?: string;
 orientation?: "portrait" | "landscape";
 includePng?: boolean;
 requestOrigin: string;
}

export interface RenderTemplateFileResult {
 buffer: Buffer;
 contentType: string;
 downloadFilename: string;
}

// Shared by the direct download endpoint (POST, SVG supplied by the client)
// and the emailed magic-link endpoint (GET, SVG looked up from the order) so
// both stay in sync on how the PDF/PNG/zip is produced.
export async function renderTemplateFile(
 params: RenderTemplateFileParams,
): Promise<RenderTemplateFileResult> {
 const svg = params.svg.trim();
 if (!svg || !svg.startsWith("<svg") || svg.length > 2_000_000) {
  throw createError({ statusCode: 400, statusMessage: "Invalid SVG payload." });
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
 // Orientation is encoded in the saved SVG's viewBox (landscape => width > height).
 // Trust it over the caller-supplied value so the PDF and PNG match the design
 // as designed.
 let orientation: "portrait" | "landscape" =
  params.orientation === "landscape" ? "landscape" : "portrait";
 const viewBox = svgEl?.getAttribute?.("viewBox");
 if (viewBox) {
  const parts = viewBox.split(/[\s,]+/).map(Number);
  const vbW = parts[2];
  const vbH = parts[3];
  if (vbW && vbH) orientation = vbW > vbH ? "landscape" : "portrait";
 }
 const pageW = orientation === "landscape" ? 279.4 : 215.9;
 const pageH = orientation === "landscape" ? 215.9 : 279.4;
 const pdf = new jsPDF({ orientation, unit: "mm", format: "letter" });
 try {
  // jsPDF/svg2pdf only render a font it has embedded via addFont — the guide
  // text's CSS font-family alone isn't enough here (no browser to resolve
  // @font-face). Detect which guide font (if any) the SVG actually uses and
  // register its self-hosted .ttf under the same family name so svg2pdf's
  // font lookup matches it.
  const guideTextEl = dom.window.document.querySelector(
   "[data-guide-text] text",
  );
  const guideFamilyName = guideTextEl
   ?.getAttribute("font-family")
   ?.split(",")[0]
   ?.trim()
   .replace(/^['"]|['"]$/g, "");
  const matchedGuideFont = guideFamilyName
   ? GOOGLE_FONTS.find((f) => f.family === guideFamilyName)
   : undefined;
  if (matchedGuideFont) {
   const fontRes = await fetch(
    `${params.requestOrigin}${matchedGuideFont.ttfFile}`,
   );
   if (fontRes.ok) {
    const fontBuffer = Buffer.from(await fontRes.arrayBuffer());
    const vfsName = matchedGuideFont.ttfFile.split("/").pop()!;
    pdf.addFileToVFS(vfsName, fontBuffer.toString("base64"));
    pdf.addFont(vfsName, matchedGuideFont.family, "normal");
   } else {
    console.error(
     "[renderTemplateFile] failed to fetch guide font:",
     matchedGuideFont.ttfFile,
     fontRes.status,
    );
   }
  }
  await pdf.svg(svgEl, { x: 0, y: 0, width: pageW, height: pageH });
 } finally {
  g.document = prev.document;
  g.window = prev.window;
 }

 const baseFilename = (params.filename || "Calligraphy-Template.pdf").replace(
  /[^a-zA-Z0-9._-]+/g,
  "-",
 );
 const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));

 // If PNG is not requested, return the PDF directly (original behavior).
 if (!params.includePng) {
  return {
   buffer: pdfBuffer,
   contentType: "application/pdf",
   downloadFilename: baseFilename,
  };
 }

 // sharp/archiver are only needed for the PNG+zip path, and are dynamically
 // imported (like jsPDF/svg2pdf above) so a broken sharp native binary can't
 // crash the whole server at boot — Nitro auto-imports everything in
 // server/utils/ into the eager startup bundle, so a static top-level import
 // here would run on every server start, not just when this path is hit.
 const [{ default: sharp }, { ZipArchive }] = await Promise.all([
  import("sharp"),
  import("archiver"),
 ]);

 // Generate a transparent PNG from the SVG using sharp.
 // The SVG has no background rect (the white bg is a CSS class in the browser),
 // so the PNG will naturally have a transparent background.
 const pngFilename = baseFilename.replace(/\.pdf$/i, "") + ".png";
 // 300 DPI US Letter, matching the page orientation so landscape designs are not
 // squeezed into a portrait canvas. The transparent background is preserved
 // because the SVG paints no page fill (the white paper is a CSS-only class).
 const pngWidth = orientation === "landscape" ? 3300 : 2550;
 const pngHeight = orientation === "landscape" ? 2550 : 3300;
 const pngBuffer = await sharp(Buffer.from(svg))
  .resize({
   width: pngWidth,
   height: pngHeight,
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

 return {
  buffer: zipBuffer,
  contentType: "application/zip",
  downloadFilename: zipFilename,
 };
}
