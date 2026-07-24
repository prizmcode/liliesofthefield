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
};

export const GOOGLE_FONTS: GuideFont[] = [
 {
  id: "dancing-script",
  label: "Dancing Script",
  family: "Dancing Script",
  googleFamilyParam: "Dancing+Script:wght@400;700",
  ttfFile: "/fonts/DancingScript-Regular.ttf",
 },
 {
  id: "great-vibes",
  label: "Great Vibes",
  family: "Great Vibes",
  googleFamilyParam: "Great+Vibes",
  ttfFile: "/fonts/GreatVibes-Regular.ttf",
 },
 {
  id: "sacramento",
  label: "Sacramento",
  family: "Sacramento",
  googleFamilyParam: "Sacramento",
  ttfFile: "/fonts/Sacramento-Regular.ttf",
 },
 {
  id: "allura",
  label: "Allura",
  family: "Allura",
  googleFamilyParam: "Allura",
  ttfFile: "/fonts/Allura-Regular.ttf",
 },
 {
  id: "parisienne",
  label: "Parisienne",
  family: "Parisienne",
  googleFamilyParam: "Parisienne",
  ttfFile: "/fonts/Parisienne-Regular.ttf",
 },
 {
  id: "pinyon-script",
  label: "Pinyon Script",
  family: "Pinyon Script",
  googleFamilyParam: "Pinyon+Script",
  ttfFile: "/fonts/PinyonScript-Regular.ttf",
 },
];
