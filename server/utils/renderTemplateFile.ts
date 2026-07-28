import { JSDOM } from "jsdom";
import { GOOGLE_FONTS } from "#shared/utils/guideFonts";

// Renders the PNG via WASM (resvg), not sharp/libvips. Some managed hosting
// tiers (e.g. Hostinger's shared/cloud Node.js hosting) hard-block dlopen()
// of custom native .so binaries as a platform security policy — confirmed
// directly with their support, not fixable by any file placement on our
// end. WASM runs sandboxed inside Node's own runtime, no native binary
// loading involved, so it isn't subject to that restriction. The module can
// only be initialized once per process, so the init promise is cached.
let resvgReady: Promise<typeof import("@resvg/resvg-wasm")> | null = null;
async function getResvg() {
 if (!resvgReady) {
  resvgReady = (async () => {
   const resvg = await import("@resvg/resvg-wasm");
   const { readFile } = await import("node:fs/promises");
   const { createRequire } = await import("node:module");
   // `import.meta.resolve` doesn't survive Nitro's Rollup bundling — its
   // import.meta shim only implements `.url`, not `.resolve()`. Node's
   // `require.resolve` (via createRequire) is genuine runtime machinery
   // Rollup leaves untouched, so it resolves this correctly even bundled.
   // The file itself is force-included in the build via
   // nitro.externals.traceInclude in nuxt.config.ts, since normal
   // dependency tracing only sees this computed path, not a static import.
   const wasmPath = createRequire(import.meta.url).resolve(
    "@resvg/resvg-wasm/index_bg.wasm",
   );
   await resvg.initWasm(await readFile(wasmPath));
   return resvg;
  })();
 }
 return resvgReady;
}

// resvg-wasm's `loadSystemFonts` does not actually discover any host fonts
// in this runtime (confirmed by testing: text using a generic family like
// "sans-serif" renders as nothing at all unless a real font buffer is
// supplied) — so unlike the guide font, this is needed on every PNG render,
// not just when a custom guide font is in play. Cached per-process since
// it's a fixed asset, not per-request data.
let baseFontReady: Promise<Buffer> | null = null;
function getBaseFont(requestOrigin: string): Promise<Buffer> {
 if (!baseFontReady) {
  baseFontReady = fetch(`${requestOrigin}/fonts/Inter-Regular.ttf`).then(
   async (res) => {
    if (!res.ok) {
     throw new Error(`Failed to fetch base font: ${res.status}`);
    }
    return Buffer.from(await res.arrayBuffer());
   },
  );
 }
 return baseFontReady;
}

// 300 DPI US Letter, matching the page orientation so landscape designs
// aren't squeezed into a portrait canvas. The SVG paints no page-fill rect
// (the white paper background is CSS-only), so the render stays transparent.
async function renderSvgToPng(params: {
 svg: string;
 orientation: "portrait" | "landscape";
 requestOrigin: string;
 guideFontBuffer?: Buffer;
}): Promise<Buffer> {
 const [resvg, baseFont] = await Promise.all([
  getResvg(),
  getBaseFont(params.requestOrigin),
 ]);
 const pngWidth = params.orientation === "landscape" ? 3300 : 2550;
 // resvg can't discover our @font-face-only guide fonts on its own (same
 // reasoning as the jsPDF addFont step above) — hand it the buffer directly,
 // alongside the base Inter font every generic "sans-serif"/footer text
 // needs (see getBaseFont above).
 const fontBuffers = [new Uint8Array(baseFont)];
 if (params.guideFontBuffer) {
  fontBuffers.push(new Uint8Array(params.guideFontBuffer));
 }
 const rendered = new resvg.Resvg(params.svg, {
  fitTo: { mode: "width", value: pngWidth },
  font: { fontBuffers, loadSystemFonts: false } as any,
 }).render();
 return Buffer.from(rendered.asPng());
}

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
 // Hoisted so the PNG path below can reuse the same fetched font buffer
 // instead of fetching it a second time.
 let matchedGuideFont: (typeof GOOGLE_FONTS)[number] | undefined;
 let guideFontBuffer: Buffer | undefined;
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
  matchedGuideFont = guideFamilyName
   ? GOOGLE_FONTS.find((f) => f.family === guideFamilyName)
   : undefined;
  if (matchedGuideFont) {
   const fontUrl = `${params.requestOrigin}${matchedGuideFont.ttfFile}`;
   // This fetch hairpins back to the server's own domain (managed hosting
   // here gives no direct filesystem access to public/ from server code —
   // see getBaseFont above), which is occasionally flaky on a cold-starting
   // instance. A non-ok response otherwise fails silently: the PDF still
   // generates, just without the custom font, so a customer's download can
   // quietly come out wrong. One retry covers a transient blip without
   // risking a real failure looking like it hung.
   let fontRes = await fetch(fontUrl);
   if (!fontRes.ok) {
    console.error(
     "[renderTemplateFile] failed to fetch guide font (attempt 1):",
     matchedGuideFont.ttfFile,
     fontRes.status,
    );
    fontRes = await fetch(fontUrl);
   }
   if (fontRes.ok) {
    guideFontBuffer = Buffer.from(await fontRes.arrayBuffer());
    const vfsName = matchedGuideFont.ttfFile.split("/").pop()!;
    pdf.addFileToVFS(vfsName, guideFontBuffer.toString("base64"));
    pdf.addFont(vfsName, matchedGuideFont.family, "normal");
   } else {
    console.error(
     "[renderTemplateFile] failed to fetch guide font (attempt 2):",
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

 // archiver is only needed for the zip path, dynamically imported (like
 // jsPDF/svg2pdf above) so it's only loaded when this path is actually hit —
 // Nitro auto-imports everything in server/utils/ into the eager startup
 // bundle, so a static top-level import here would load on every server
 // start, not just when someone requests a PNG/zip.
 const { ZipArchive } = await import("archiver");
 const pngBuffer = await renderSvgToPng({
  svg,
  orientation,
  guideFontBuffer,
  requestOrigin: params.requestOrigin,
 });
 const pngFilename = baseFilename.replace(/\.pdf$/i, "") + ".png";

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
