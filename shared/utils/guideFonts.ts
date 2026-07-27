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
  defaultSlantAngle: 20,
 },
 {
  id: "sacramento",
  label: "Sacramento",
  family: "Sacramento",
  googleFamilyParam: "Sacramento",
  ttfFile: "/fonts/Sacramento-Regular.ttf",
  xHeightRatio: 0.306,
  defaultSlantAngle: 15,
 },
 {
  id: "parisienne",
  label: "Parisienne",
  family: "Parisienne",
  googleFamilyParam: "Parisienne",
  ttfFile: "/fonts/Parisienne-Regular.ttf",
  xHeightRatio: 0.353,
  defaultSlantAngle: 20,
 },
 {
  id: "pinyon-script",
  label: "Pinyon Script",
  family: "Pinyon Script",
  googleFamilyParam: "Pinyon+Script",
  ttfFile: "/fonts/PinyonScript-Regular.ttf",
  xHeightRatio: 0.371,
  defaultSlantAngle: 30,
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
  defaultSlantAngle: 23,
 },
 {
  id: "ballet",
  label: "Ballet",
  family: "Ballet",
  googleFamilyParam: "Ballet",
  ttfFile: "/fonts/Ballet-Regular.ttf",
  xHeightRatio: 0.339,
  defaultSlantAngle: 28,
 },
];
