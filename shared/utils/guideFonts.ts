// Example Google Fonts for the templates generator's guide-text overlay. Add,
// remove, or swap entries here to change what's offered — each needs a label,
// the CSS font-family name, the matching Google Fonts `family=` query param
// (for the on-screen preview), and a self-hosted .ttf under /public/fonts
// (for PDF export — jsPDF/svg2pdf can only embed a font it can read as a real
// TTF file, which is why we don't just point it at the Google Fonts
// CSS/woff2). Shared between the client page and the server PDF endpoint so
// both always agree on what's available.
export type GuideFont = {
 id: string;
 label: string;
 family: string;
 googleFamilyParam: string;
 ttfFile: string;
 // Real x-height ÷ unitsPerEm, measured from each font's OS/2.sxHeight table
 // (via fontTools) — used to size the guide text off the actual x-height
 // instead of assuming a generic ~0.5 ratio, which left script fonts (whose
 // x-height usually runs closer to 0.3–0.4) sitting well short of the ruled
 // x-height line.
 xHeightRatio: number;
 // Suggested slant-guide angle (degrees from vertical, matching this app's
 // slantAngle) that roughly matches this font's own natural stroke angle —
 // measured visually against a reference grid, not a precise metric like
 // xHeightRatio. Applied when the guide font is picked from the dropdown;
 // the slant slider can still be adjusted afterward.
 defaultSlantAngle: number;
};

export const GOOGLE_FONTS: GuideFont[] = [
 {
  id: "great-vibes",
  label: "Great Vibes",
  family: "Great Vibes",
  googleFamilyParam: "Great+Vibes",
  ttfFile: "/fonts/GreatVibes-Regular.ttf",
  xHeightRatio: 0.328,
  defaultSlantAngle: 25,
 },
 {
  id: "sacramento",
  label: "Sacramento",
  family: "Sacramento",
  googleFamilyParam: "Sacramento",
  ttfFile: "/fonts/Sacramento-Regular.ttf",
  xHeightRatio: 0.306,
  defaultSlantAngle: 0,
 },
 {
  id: "parisienne",
  label: "Parisienne",
  family: "Parisienne",
  googleFamilyParam: "Parisienne",
  ttfFile: "/fonts/Parisienne-Regular.ttf",
  xHeightRatio: 0.353,
  defaultSlantAngle: 30,
 },
 {
  id: "pinyon-script",
  label: "Pinyon Script",
  family: "Pinyon Script",
  googleFamilyParam: "Pinyon+Script",
  ttfFile: "/fonts/PinyonScript-Regular.ttf",
  xHeightRatio: 0.371,
  defaultSlantAngle: 34,
 },
 {
  id: "unifraktur-maguntia",
  label: "UnifrakturMaguntia",
  family: "UnifrakturMaguntia",
  googleFamilyParam: "UnifrakturMaguntia",
  ttfFile: "/fonts/UnifrakturMaguntia-Book.ttf",
  xHeightRatio: 0.535,
  defaultSlantAngle: 0,
 },
 {
  id: "monsieur-la-doulaise",
  label: "Monsieur La Doulaise",
  family: "Monsieur La Doulaise",
  googleFamilyParam: "Monsieur+La+Doulaise",
  ttfFile: "/fonts/MonsieurLaDoulaise-Regular.ttf",
  xHeightRatio: 0.164,
  defaultSlantAngle: 45,
 },
 {
  id: "ballet",
  label: "Ballet",
  family: "Ballet",
  googleFamilyParam: "Ballet",
  ttfFile: "/fonts/Ballet-Regular.ttf",
  xHeightRatio: 0.339,
  defaultSlantAngle: 42,
 },
 {
  id: "pirata-one",
  label: "Pirata One",
  family: "Pirata One",
  googleFamilyParam: "Pirata+One",
  ttfFile: "/fonts/PirataOne-Regular.ttf",
  xHeightRatio: 0.594,
  defaultSlantAngle: 0,
 },
];

// Matches a saved guide-text SVG element's `font-family` attribute (e.g.
// `"'Monsieur La Doulaise', cursive"`) back to its GuideFont entry, the same
// way the server (renderTemplateFile.ts) detects which font a saved design
// uses when it wasn't generated with one live in memory.
export function matchGuideFontFromFamilyAttr(
 fontFamilyAttr: string | null | undefined,
): GuideFont | undefined {
 const name = fontFamilyAttr
  ?.split(",")[0]
  ?.trim()
  .replace(/^['"]|['"]$/g, "");
 return name ? GOOGLE_FONTS.find((f) => f.family === name) : undefined;
}

// jsPDF/svg2pdf only render a font it has embedded via addFont — the CSS
// @font-face used for the on-screen preview doesn't carry over. Fetch the
// self-hosted .ttf and register it under the exact CSS family name so
// svg2pdf's font lookup matches it. `pdf` is a jsPDF instance (typed `any`
// here since jsPDF ships no usable public type for it).
export async function registerGuideFont(
 pdf: any,
 font: GuideFont,
): Promise<void> {
 const res = await fetch(font.ttfFile);
 const bytes = new Uint8Array(await res.arrayBuffer());
 let binary = "";
 const chunkSize = 0x8000;
 for (let i = 0; i < bytes.length; i += chunkSize) {
  binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
 }
 const vfsName = font.ttfFile.split("/").pop()!;
 pdf.addFileToVFS(vfsName, btoa(binary));
 pdf.addFont(vfsName, font.family, "normal");
}
