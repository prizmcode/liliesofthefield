<script setup lang="ts">
import type { AddToCartInput } from "#types/gql";
import { GOOGLE_FONTS, type GuideFont } from "../../shared/utils/guideFonts";
import {
 AccordionContent,
 AccordionHeader,
 AccordionItem,
 AccordionRoot,
 AccordionTrigger,
} from "reka-ui";

const runtimeConfig = useRuntimeConfig();
const router = useRouter();
const route = useRoute();
const { addToCart, cart } = useCart();

const TEMPLATE_PRODUCT_ID = Number(runtimeConfig.public.templateProductId);
const TEMPLATE_VARIATION_PDF_ONLY = Number(
 runtimeConfig.public.templateVariationPdfOnly,
);
const TEMPLATE_VARIATION_PDF_AND_PNG = Number(
 runtimeConfig.public.templateVariationPdfAndPng,
);

const LETTER_W = 215.9; // 8.5" in mm
const LETTER_H = 279.4; // 11" in mm
const orientation = ref<"portrait" | "landscape">("portrait");
const isLandscape = computed(() => orientation.value === "landscape");
const PAGE_W = computed(() => (isLandscape.value ? LETTER_H : LETTER_W));
const PAGE_H = computed(() => (isLandscape.value ? LETTER_W : LETTER_H));

const margin = ref(12.7);
const autoFill = ref(true);
const numLines = ref(8);
const ascenderH = ref(5);
const xHeight = ref(5);
const descenderH = ref(5);
const lineGap = ref(10);
const showSlant = ref(true);
const slantAngle = ref(20);
const slantSpacing = ref(10);
const showCenterLine = ref(false);
const showRulers = ref(true);

// GOOGLE_FONTS / GuideFont come from shared/utils/guideFonts.ts (auto-imported)
// so the client page and the server PDF endpoint stay in sync on what's
// offered — add, remove, or swap fonts there, not here.
const showGuideText = ref(true);
const guideText = ref("");
const guideFontId = ref(GOOGLE_FONTS[0]!.id);
const guideFont = computed(
 () =>
  GOOGLE_FONTS.find((f) => f.id === guideFontId.value) ?? GOOGLE_FONTS[0]!,
);
const guideFontFamilyCss = computed(() => `'${guideFont.value.family}', cursive`);
const guideTextAlign = ref<"left" | "center" | "right">("left");
const printGuideText = ref(false);
const includeGuideTextInDownload = ref(false);
const guideTextX = computed(() => {
 if (guideTextAlign.value === "center")
  return margin.value + writingAreaW.value / 2;
 if (guideTextAlign.value === "right") return PAGE_W.value - margin.value;
 return margin.value;
});
const guideTextAnchor = computed(() => {
 if (guideTextAlign.value === "center") return "middle";
 if (guideTextAlign.value === "right") return "end";
 return "start";
});

type Preset = {
 name: string;
 ascenderH: number;
 xHeight: number;
 descenderH: number;
 lineGap: number;
 showSlant: boolean;
 slantAngle: number;
 slantSpacing: number;
};

const presets: Preset[] = [
 {
  name: "Copperplate",
  ascenderH: 3,
  xHeight: 6,
  descenderH: 3,
  lineGap: 5,
  showSlant: true,
  slantAngle: 55,
  slantSpacing: 6,
 },
 {
  name: "Spencerian",
  ascenderH: 3,
  xHeight: 5,
  descenderH: 3,
  lineGap: 5,
  showSlant: true,
  slantAngle: 52,
  slantSpacing: 5,
 },
 {
  name: "Italic",
  ascenderH: 4,
  xHeight: 5,
  descenderH: 4,
  lineGap: 5,
  showSlant: true,
  slantAngle: 7,
  slantSpacing: 5,
 },
 {
  name: "Blackletter",
  ascenderH: 3,
  xHeight: 6,
  descenderH: 3,
  lineGap: 5,
  showSlant: true,
  slantAngle: 0,
  slantSpacing: 6,
 },
 {
  name: "Modern Brush",
  ascenderH: 12,
  xHeight: 6,
  descenderH: 12,
  lineGap: 6,
  showSlant: true,
  slantAngle: 17,
  slantSpacing: 12,
 },
];

function applyPreset(p: Preset) {
 ascenderH.value = p.ascenderH;
 xHeight.value = p.xHeight;
 descenderH.value = p.descenderH;
 lineGap.value = p.lineGap;
 showSlant.value = p.showSlant;
 slantAngle.value = p.slantAngle;
 slantSpacing.value = p.slantSpacing;
}

const groupHeight = computed(
 () => ascenderH.value + xHeight.value + descenderH.value,
);
const writingAreaW = computed(() => PAGE_W.value - margin.value * 2);
const writingAreaH = computed(() => PAGE_H.value - margin.value * 2);

const FOOTER_STRIP = 12.7;
const effectiveBottomMargin = computed(() =>
 Math.max(margin.value, FOOTER_STRIP),
);

const maxLines = computed(() => {
 const denom = groupHeight.value + lineGap.value;
 if (groupHeight.value <= 0 || denom <= 0) return 1;
 const usableH = PAGE_H.value - margin.value - effectiveBottomMargin.value;
 return Math.max(1, Math.floor((usableH + lineGap.value) / denom));
});

watchEffect(() => {
 if (numLines.value > maxLines.value) numLines.value = maxLines.value;
});

const ruleGroups = computed(() => {
 const groups: {
  top: number;
  waist: number;
  baseline: number;
  bottom: number;
 }[] = [];
 if (groupHeight.value <= 0) return groups;
 const topBound = margin.value;
 const bottomBound = PAGE_H.value - effectiveBottomMargin.value;
 const usableH = bottomBound - topBound;

 // Determine how many groups fit within the usable vertical area.
 const denom = groupHeight.value + lineGap.value;
 let lineCount = Math.floor((usableH + lineGap.value) / denom);
 if (lineCount < 0) lineCount = 0;
 if (!autoFill.value) lineCount = Math.min(lineCount, numLines.value);
 if (lineCount <= 0) return groups;

 // Vertically center the whole block within the usable area.
 const blockHeight =
  lineCount * groupHeight.value + (lineCount - 1) * lineGap.value;
 let y = topBound + (usableH - blockHeight) / 2;

 for (let count = 0; count < lineCount; count++) {
  groups.push({
   top: y,
   waist: y + ascenderH.value,
   baseline: y + ascenderH.value + xHeight.value,
   bottom: y + groupHeight.value,
  });
  y += groupHeight.value + lineGap.value;
 }
 return groups;
});

// Bumped once the browser finishes loading the guide fonts, so the wrap
// below (which measures text with the canvas API) re-runs with accurate
// metrics instead of whatever fallback font was available immediately.
const fontsReadyTick = ref(0);
onMounted(() => {
 if (typeof document === "undefined" || !("fonts" in document)) return;
 document.fonts.ready.then(() => {
  fontsReadyTick.value++;
 });
});

let measureCtx: CanvasRenderingContext2D | null | undefined;
function getMeasureCtx(): CanvasRenderingContext2D | null {
 if (measureCtx !== undefined) return measureCtx;
 measureCtx =
  typeof document === "undefined"
   ? null
   : (document.createElement("canvas").getContext("2d") ?? null);
 return measureCtx;
}

// Greedy word-wrap: fits as many words per line as `maxWidth` allows.
function wrapWords(
 text: string,
 maxWidth: number,
 measure: (s: string) => number,
): string[] {
 const words = text.split(/\s+/).filter(Boolean);
 const lines: string[] = [];
 let current = "";
 for (const word of words) {
  const candidate = current ? `${current} ${word}` : word;
  if (!current || measure(candidate) <= maxWidth) {
   current = candidate;
  } else {
   lines.push(current);
   current = word;
  }
 }
 if (current) lines.push(current);
 return lines;
}

// One entry per ruled line. If the guide text has manual line breaks, each
// break maps 1:1 to the next ruled line (unchanged). Otherwise it's treated
// as one paragraph and word-wrapped to fill however many ruled lines are
// available. Positioned at the bottom of the x-height band (`baseline`),
// where the ruled baseline itself sits.
const guideTextLines = computed(() => {
 if (!showGuideText.value || !guideText.value) return [];
 fontsReadyTick.value;

 const ctx = getMeasureCtx();
 if (ctx)
  ctx.font = `${groupHeight.value}px '${guideFont.value.family}', cursive`;
 const measure = ctx ? (s: string) => ctx.measureText(s).width : null;

 // Each manual line break still starts a new ruled line, but a paragraph
 // that's too wide to fit wraps onto however many additional ruled lines
 // it needs, rather than just getting clipped.
 const segments: string[] = [];
 for (const paragraph of guideText.value.split("\n")) {
  if (!paragraph.trim()) {
   segments.push("");
  } else if (measure) {
   segments.push(...wrapWords(paragraph, writingAreaW.value, measure));
  } else {
   segments.push(paragraph);
  }
 }

 return segments
  .slice(0, ruleGroups.value.length)
  .map((text, i) => ({ text, y: ruleGroups.value[i]!.baseline }));
});

const MM_PER_INCH = 25.4;
const TICK_STEP = MM_PER_INCH / 4;
const TICK_MAJOR_LEN = 2.5;
const TICK_MINOR_LEN = 1.2;
const RULER_THICKNESS = 5;

type Tick = { pos: number; major: boolean; label?: number };

const horizontalTicks = computed<Tick[]>(() => {
 const ticks: Tick[] = [];
 for (let i = 0; i * TICK_STEP <= PAGE_W.value + 0.001; i++) {
  const major = i % 4 === 0;
  ticks.push({
   pos: i * TICK_STEP,
   major,
   label: major && i > 0 ? i / 4 : undefined,
  });
 }
 return ticks;
});

const verticalTicks = computed<Tick[]>(() => {
 const ticks: Tick[] = [];
 for (let i = 0; i * TICK_STEP <= PAGE_H.value + 0.001; i++) {
  const major = i % 4 === 0;
  ticks.push({
   pos: i * TICK_STEP,
   major,
   label: major && i > 0 ? i / 4 : undefined,
  });
 }
 return ticks;
});

const horizontalLabels = computed(() =>
 horizontalTicks.value.filter((t) => t.label !== undefined),
);
const verticalLabels = computed(() =>
 verticalTicks.value.filter((t) => t.label !== undefined),
);

const slantLines = computed(() => {
 if (!showSlant.value) return [];
 const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
 const angleRad = (slantAngle.value * Math.PI) / 180;
 const dx = -writingAreaH.value * Math.tan(angleRad);
 const startX = margin.value - Math.max(dx, 0);
 const endX = margin.value + writingAreaW.value - Math.min(dx, 0);
 for (let x = startX; x <= endX; x += slantSpacing.value) {
  lines.push({
   x1: x,
   y1: margin.value,
   x2: x + dx,
   y2: margin.value + writingAreaH.value,
  });
 }
 return lines;
});

const CUSTOM_MIN_IN = 2;
const PAGE_W_IN = computed(() => PAGE_W.value / MM_PER_INCH);
const PAGE_H_IN = computed(() => PAGE_H.value / MM_PER_INCH);
const customWidthIn = ref<number | null>(null);
const customHeightIn = ref<number | null>(null);

const customOverlay = computed(() => {
 const w = customWidthIn.value;
 const h = customHeightIn.value;
 if (
  w === null ||
  h === null ||
  Number.isNaN(w) ||
  Number.isNaN(h) ||
  w < CUSTOM_MIN_IN ||
  h < CUSTOM_MIN_IN ||
  w > PAGE_W_IN.value ||
  h > PAGE_H_IN.value
 )
  return null;
 const width = w * MM_PER_INCH;
 const height = h * MM_PER_INCH;
 return {
  x: (PAGE_W.value - width) / 2,
  y: (PAGE_H.value - height) / 2,
  width,
  height,
 };
});

const settingsLabel = computed(() => {
 const parts = [
  orientation.value === "landscape" ? "Landscape" : "Portrait",
  `A ${ascenderH.value}mm`,
  `X ${xHeight.value}mm`,
  `D ${descenderH.value}mm`,
  `Gap ${lineGap.value}mm`,
  `Margin ${margin.value}mm`,
 ];
 if (showSlant.value)
  parts.push(`Slant ${slantAngle.value}° @ ${slantSpacing.value}mm`);
 if (showCenterLine.value) parts.push("Center line");
 parts.push(`${ruleGroups.value.length} lines`);
 return parts.join(" · ");
});

useSeoMeta({
 title: "Calligraphy Template Generator",
 description:
  "Design and print custom calligraphy practice sheets with adjustable x-height, ascender, descender, line spacing, and slant guides.",
});

// Load every guide-text font up front so switching the selector is instant.
useHead({
 link: [
  {
   rel: "stylesheet",
   href: `https://fonts.googleapis.com/css2?${GOOGLE_FONTS.map((f) => `family=${f.googleFamilyParam}`).join("&")}&display=swap`,
  },
 ],
});

// Inject print dimensions so the SVG fills the page correctly when printing.
// The @page rules (named pages) handle the page orientation; these styles
// ensure the print area and SVG match the page dimensions.
useHead(() => ({
 style: [
  {
   innerHTML: `@media print { .calligraphy-print-area { width: ${PAGE_W_IN.value}in; height: ${PAGE_H_IN.value}in; } .calligraphy-print-area svg { width: ${PAGE_W_IN.value}in; height: ${PAGE_H_IN.value}in; } }`,
  },
 ],
}));

const svgEl = ref<SVGSVGElement | null>(null);
const showWatermark = ref(true);

const brandingTextX = computed(() => PAGE_W.value - FOOTER_STRIP);

// Restore a previously saved design from a `?restore=<settings JSON>` query,
// e.g. when a customer reopens the template from a past order. Only known,
// correctly-typed keys are applied so a malformed URL can't break the page.
function restoreFromQuery() {
 const raw = route.query.restore;
 if (typeof raw !== "string" || !raw.trim()) return;
 let parsed: Record<string, unknown>;
 try {
  parsed = JSON.parse(raw);
 } catch {
  return;
 }
 if (!parsed || typeof parsed !== "object") return;
 const num = (v: unknown) =>
  typeof v === "number" && Number.isFinite(v) ? v : null;
 const bool = (v: unknown) => (typeof v === "boolean" ? v : null);
 const apply = (r: { value: number }, v: unknown) => {
  const n = num(v);
  if (n !== null) r.value = n;
 };
 const applyBool = (r: { value: boolean }, v: unknown) => {
  const b = bool(v);
  if (b !== null) r.value = b;
 };
 apply(margin, parsed.margin);
 applyBool(autoFill, parsed.autoFill);
 apply(numLines, parsed.numLines);
 apply(ascenderH, parsed.ascenderH);
 apply(xHeight, parsed.xHeight);
 apply(descenderH, parsed.descenderH);
 apply(lineGap, parsed.lineGap);
 applyBool(showSlant, parsed.showSlant);
 apply(slantAngle, parsed.slantAngle);
 apply(slantSpacing, parsed.slantSpacing);
 applyBool(showCenterLine, parsed.showCenterLine);
 const o = parsed.orientation;
 if (o === "portrait" || o === "landscape") orientation.value = o;
}

// Vue Router reuses this component instance for query-only navigations (e.g.
// clicking a different cart item's restore link while already on this page),
// so onMounted alone won't re-apply a new ?restore= value — watch it instead.
watch(
 () => route.query.restore,
 () => restoreFromQuery(),
);

onMounted(() => {
 restoreFromQuery();
});

function handlePrint() {
 window.print();
}

function buildFilename() {
 const slug = settingsLabel.value
  .replace(/·/g, "-")
  .replace(/[°@]/g, "")
  .replace(/[^a-zA-Z0-9-]+/g, "-")
  .replace(/-+/g, "-")
  .replace(/^-|-$/g, "");
 return `Calligraphy-Template-${slug}.pdf`;
}

// jsPDF/svg2pdf only render a font it has embedded via addFont — loading the
// browser's CSS @font-face (for the on-screen preview) isn't enough. Fetch
// the self-hosted .ttf and register it under the exact CSS family name so
// svg2pdf's font lookup matches it.
async function registerGuideFont(pdf: any, font: GuideFont) {
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

async function handleDownloadPdf() {
 if (!svgEl.value) return;
 const [{ jsPDF }, { svg2pdf }] = await Promise.all([
  import("jspdf"),
  import("svg2pdf.js"),
 ]);
 // Guide text is a layout aid only — hide it for the export so it doesn't
 // end up baked into the downloaded PDF, unless the customer explicitly
 // wants it included.
 const keepingGuideText =
  guideTextLines.value.length > 0 && includeGuideTextInDownload.value;
 const wasShowingGuide = showGuideText.value && !includeGuideTextInDownload.value;
 if (wasShowingGuide) {
  showGuideText.value = false;
  await nextTick();
 }
 try {
  const pdf = new jsPDF({
   orientation: orientation.value,
   unit: "mm",
   format: "letter",
  });
  if (keepingGuideText) await registerGuideFont(pdf, guideFont.value);
  await svg2pdf(svgEl.value, pdf, {
   x: 0,
   y: 0,
   width: PAGE_W.value,
   height: PAGE_H.value,
  });
  pdf.save(buildFilename());
 } finally {
  if (wasShowingGuide) {
   showGuideText.value = true;
   await nextTick();
  }
 }
}

const cleanPdfMessage = ref("");

// Serialize the current preview as a clean (unwatermarked) SVG string.
function serializeCleanSvg(): string | null {
 if (!svgEl.value) return null;
 const clone = svgEl.value.cloneNode(true) as SVGSVGElement;
 const stripSelector = includeGuideTextInDownload.value
  ? "[data-watermark]"
  : "[data-watermark], [data-guide-text]";
 clone.querySelectorAll(stripSelector).forEach((n) => n.remove());
 return new XMLSerializer().serializeToString(clone);
}

// The current template settings, persisted alongside the saved SVG.
function currentSettings() {
 return {
  orientation: orientation.value,
  margin: margin.value,
  autoFill: autoFill.value,
  numLines: numLines.value,
  ascenderH: ascenderH.value,
  xHeight: xHeight.value,
  descenderH: descenderH.value,
  lineGap: lineGap.value,
  showSlant: showSlant.value,
  slantAngle: slantAngle.value,
  slantSpacing: slantSpacing.value,
  showCenterLine: showCenterLine.value,
 };
}

async function requestCleanPdf(includePng = false) {
 const svg = serializeCleanSvg();
 if (!svg) return;
 cleanPdfMessage.value = "";
 // useGqlToken is a setter (returns void); read the stored token from its cookie.
 const token = useCookie("gql:default").value;
 const headers: Record<string, string> = {};
 if (token) headers.Authorization = `Bearer ${token}`;
 try {
  const blob = await $fetch<Blob>("/api/generate-template-pdf", {
   method: "POST",
   headers,
   responseType: "blob",
   body: {
    svg,
    filename: buildFilename(),
    orientation: orientation.value,
    includePng,
   },
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  // If a zip was returned, use .zip extension
  const isZip = includePng;
  a.download = isZip
   ? buildFilename().replace(/\.pdf$/i, "") + ".zip"
   : buildFilename();
  a.click();
  URL.revokeObjectURL(url);
 } catch (e: any) {
  const code = e?.statusCode || e?.response?.status;
  cleanPdfMessage.value =
   code === 401 || code === 403
    ? "Purchase required to download the clean template."
    : "Could not generate the file. Please try again.";
 }
}

// Tracks which specific variant is in flight so only the clicked button shows
// the "Adding to cart…" state; the other stays untouched.
const addingVariant = ref<"pdf" | "pdf-png" | null>(null);
const isAddingTemplate = computed(() => addingVariant.value !== null);
// Add the template product (with the saved SVG + settings) to the cart, then
// send the customer to checkout. The SVG is stored so it stays in the cart on
// return and is available on the resulting order.
async function buyCleanTemplate(includePng = false) {
 const svg = serializeCleanSvg();
 if (!svg || isAddingTemplate.value) return;
 cleanPdfMessage.value = "";
 if (!Number.isFinite(TEMPLATE_PRODUCT_ID) || TEMPLATE_PRODUCT_ID <= 0) {
  cleanPdfMessage.value = "Template product is not configured.";
  return;
 }
 const variationId = includePng
  ? TEMPLATE_VARIATION_PDF_AND_PNG
  : TEMPLATE_VARIATION_PDF_ONLY;
 if (!variationId) {
  cleanPdfMessage.value = "Template variation is not configured.";
  return;
 }
 addingVariant.value = includePng ? "pdf-png" : "pdf";
 const beforeCount = cart.value?.contents?.itemCount ?? 0;
 try {
  const input: AddToCartInput = {
   productId: TEMPLATE_PRODUCT_ID,
   quantity: 1,
   variationId,
   variation: [
    {
     attributeName: "pdf-download",
     attributeValue: "PDF Printable Download",
    },
    {
     // WooCommerce only defines one term for this attribute, so it must always
     // be sent (even for the PDF-only variation, which has it set to "Any") —
     // an empty value is rejected as a required field.
     attributeName: "pdf-download-transparent-png",
     attributeValue:
      "Both a PDF Printable Download and transparent PNG file for working with digital assets.",
    },
   ],
   extraData: JSON.stringify({
    calligraphy_text: settingsLabel.value,
    calligraphy_notes: buildFilename(),
    calligraphy_settings: JSON.stringify(currentSettings()),
    calligraphy_svg: svg,
    calligraphy_include_png: includePng,
   }),
  };
  await addToCart(input);
  const afterCount = cart.value?.contents?.itemCount ?? 0;
  if (afterCount <= beforeCount) {
   cleanPdfMessage.value =
    "Could not add the template to your cart. Please try again.";
   return;
  }
  await router.push("/checkout");
 } catch {
  cleanPdfMessage.value =
   "Could not add the template to your cart. Please try again.";
 } finally {
  addingVariant.value = null;
 }
}
</script>

<template>
 <div class="container my-12">
  <div class="no-print">
   <h1 class="mb-2 text-4xl font-display">Calligraphy Template Generator</h1>
   <p class="mb-8 text-gray-600 dark:text-gray-300">
    Design your practice sheet, then print at actual size on US Letter (8.5" ×
    11") paper.
   </p>
  </div>

  <div class="grid gap-8 lg:grid-cols-[320px_1fr]">
   <aside class="space-y-5 no-print">
    <AccordionRoot
     type="multiple"
     :default-value="['presets', 'page-setup']"
     class="space-y-3"
    >
     <AccordionItem
      value="presets"
      class="group border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800"
     >
      <AccordionHeader>
       <AccordionTrigger
        class="flex w-full items-center justify-between gap-4 px-4 py-1.5 text-left text-sm font-semibold cursor-pointer"
       >
        <span>Presets</span>
        <Icon
         name="ion:chevron-down"
         size="18"
         class="shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
        />
       </AccordionTrigger>
      </AccordionHeader>
      <AccordionContent class="accordion-content overflow-hidden bg-gray-100 dark:bg-gray-900/40">
       <div class="grid grid-cols-2 gap-2 px-4 pt-3 pb-4">
        <button
         v-for="p in presets"
         :key="p.name"
         type="button"
         @click="applyPreset(p)"
         class="px-3 py-1.5 text-sm border border-gray-400 hover:bg-gray-100 rounded-lg cursor-pointer"
        >
         {{ p.name }}
        </button>
       </div>
      </AccordionContent>
     </AccordionItem>

     <AccordionItem
      value="page-setup"
      class="group border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800"
     >
      <AccordionHeader>
       <AccordionTrigger
        class="flex w-full items-center justify-between gap-4 px-4 py-1.5 text-left text-sm font-semibold cursor-pointer"
       >
        <span>Page Setup</span>
        <Icon
         name="ion:chevron-down"
         size="18"
         class="shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
        />
       </AccordionTrigger>
      </AccordionHeader>
      <AccordionContent class="accordion-content overflow-hidden bg-gray-100 dark:bg-gray-900/40">
       <div class="space-y-4 px-4 pt-3 pb-4">
        <div>
         <p class="text-sm font-medium mb-2">Orientation</p>
         <div class="grid grid-cols-2 gap-2">
          <button
           type="button"
           @click="orientation = 'portrait'"
           :class="[
            'px-3 py-1.5 text-sm border rounded-lg cursor-pointer',
            orientation === 'portrait'
             ? 'bg-gray-800 text-white border-gray-800'
             : 'border-gray-400 hover:bg-gray-100',
           ]"
          >
           Portrait
          </button>
          <button
           type="button"
           @click="orientation = 'landscape'"
           :class="[
            'px-3 py-1.5 text-sm border rounded-lg cursor-pointer',
            orientation === 'landscape'
             ? 'bg-gray-800 text-white border-gray-800'
             : 'border-gray-400 hover:bg-gray-100',
           ]"
          >
           Landscape
          </button>
         </div>
        </div>

        <div class="space-y-3">
         <label class="flex items-center gap-2 text-sm font-medium cursor-pointer">
          <span>Number of lines</span>
          <input v-model="autoFill" type="checkbox" />
          <span>Auto-fill page</span>
         </label>
         <div v-if="!autoFill">
          <label class="flex justify-between text-sm font-medium">
           <span class="text-gray-500">{{ numLines }} / {{ maxLines }}</span>
          </label>
          <input
           v-model.number="numLines"
           type="range"
           min="1"
           :max="maxLines"
           step="1"
          />
         </div>
        </div>

        <div>
         <label class="flex justify-between text-sm font-medium">
          <span>Page margin</span>
          <span class="text-gray-500">{{ margin }} mm</span>
         </label>
         <input
          v-model.number="margin"
          type="range"
          min="5"
          max="80"
          step="0.5"
         />
        </div>
       </div>
      </AccordionContent>
     </AccordionItem>

     <AccordionItem
      value="lettering"
      class="group border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800"
     >
      <AccordionHeader>
       <AccordionTrigger
        class="flex w-full items-center justify-between gap-4 px-4 py-1.5 text-left text-sm font-semibold cursor-pointer"
       >
        <span>Lettering Guides</span>
        <Icon
         name="ion:chevron-down"
         size="18"
         class="shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
        />
       </AccordionTrigger>
      </AccordionHeader>
      <AccordionContent class="accordion-content overflow-hidden bg-gray-100 dark:bg-gray-900/40">
       <div class="space-y-4 px-4 pt-3 pb-4">
        <div>
         <label class="flex justify-between text-sm font-medium">
          <span>Ascender height</span>
          <span class="text-gray-500">{{ ascenderH }} mm</span>
         </label>
         <input
          v-model.number="ascenderH"
          type="range"
          min="0"
          max="40"
          step="0.5"
         />
        </div>

        <div>
         <label class="flex justify-between text-sm font-medium">
          <span>X-height</span>
          <span class="text-gray-500">{{ xHeight }} mm</span>
         </label>
         <input
          v-model.number="xHeight"
          type="range"
          min="2"
          max="50"
          step="0.5"
         />
        </div>

        <div>
         <label class="flex justify-between text-sm font-medium">
          <span>Descender height</span>
          <span class="text-gray-500">{{ descenderH }} mm</span>
         </label>
         <input
          v-model.number="descenderH"
          type="range"
          min="0"
          max="40"
          step="0.5"
         />
        </div>

        <div>
         <label class="flex justify-between text-sm font-medium">
          <span>Space between lines</span>
          <span class="text-gray-500">{{ lineGap }} mm</span>
         </label>
         <input
          v-model.number="lineGap"
          type="range"
          min="0"
          max="80"
          step="0.5"
         />
        </div>
       </div>
      </AccordionContent>
     </AccordionItem>

     <AccordionItem
      value="slant"
      class="group border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800"
     >
      <AccordionHeader>
       <AccordionTrigger
        class="flex w-full items-center justify-between gap-4 px-4 py-1.5 text-left text-sm font-semibold cursor-pointer"
       >
        <span>Slant Guides</span>
        <Icon
         name="ion:chevron-down"
         size="18"
         class="shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
        />
       </AccordionTrigger>
      </AccordionHeader>
      <AccordionContent class="accordion-content overflow-hidden bg-gray-100 dark:bg-gray-900/40">
       <div class="space-y-4 px-4 pt-3 pb-4">
        <label class="flex items-center gap-2 text-sm font-medium cursor-pointer">
         <input v-model="showSlant" type="checkbox" class="accent-current" />
         <span>Show slant guides</span>
        </label>
        <template v-if="showSlant">
         <div>
          <label class="flex justify-between text-sm font-medium">
           <span>Slant angle</span>
           <span class="text-gray-500">{{ slantAngle }}°</span>
          </label>
          <input
           v-model.number="slantAngle"
           type="range"
           min="0"
           max="55"
           step="1"
          />
         </div>
         <div>
          <label class="flex justify-between text-sm font-medium">
           <span>Slant spacing</span>
           <span class="text-gray-500">{{ slantSpacing }} mm</span>
          </label>
          <input
           v-model.number="slantSpacing"
           type="range"
           min="3"
           max="30"
           step="0.5"
          />
         </div>
        </template>
       </div>
      </AccordionContent>
     </AccordionItem>

     <AccordionItem
      value="display"
      class="group border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800"
     >
      <AccordionHeader>
       <AccordionTrigger
        class="flex w-full items-center justify-between gap-4 px-4 py-1.5 text-left text-sm font-semibold cursor-pointer"
       >
        <span>Display Options</span>
        <Icon
         name="ion:chevron-down"
         size="18"
         class="shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
        />
       </AccordionTrigger>
      </AccordionHeader>
      <AccordionContent class="accordion-content overflow-hidden bg-gray-100 dark:bg-gray-900/40">
       <div class="space-y-4 px-4 pt-3 pb-4">
        <label class="flex items-center gap-2 text-sm font-medium cursor-pointer">
         <input
          v-model="showCenterLine"
          type="checkbox"
          class="accent-current"
         />
         <span>Show center line</span>
        </label>

        <label class="flex items-center gap-2 text-sm font-medium cursor-pointer">
         <input v-model="showRulers" type="checkbox" class="accent-current" />
         <span>Show rulers</span>
        </label>
       </div>
      </AccordionContent>
     </AccordionItem>

     <AccordionItem
      value="guide-text"
      class="group border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800"
     >
      <AccordionHeader>
       <AccordionTrigger
        class="flex w-full items-center justify-between gap-4 px-4 py-1.5 text-left text-sm font-semibold cursor-pointer"
       >
        <span>Guide Text</span>
        <Icon
         name="ion:chevron-down"
         size="18"
         class="shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
        />
       </AccordionTrigger>
      </AccordionHeader>
      <AccordionContent class="accordion-content overflow-hidden bg-gray-100 dark:bg-gray-900/40">
       <div class="space-y-3 px-4 pt-3 pb-4">
        <label class="flex items-center gap-2 text-sm font-medium cursor-pointer">
         <input
          v-model="showGuideText"
          type="checkbox"
          class="accent-current"
         />
         <span>Show guide text</span>
        </label>
        <template v-if="showGuideText">
         <div>
          <label class="block mb-1 text-sm font-medium">Guide text</label>
          <textarea
           v-model="guideText"
           rows="4"
           placeholder="Type your wording, one line per ruled line…"
           class="w-full px-3 py-2 text-sm border border-gray-400 rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
          <p class="mt-1 text-xs text-gray-500">
           Each line break lands on the next ruled line. Shown at 50% opacity
           as a layout guide only — it's left out of your printed sheet and
           any downloaded or purchased file unless you check the boxes
           below.
          </p>
         </div>
         <div>
          <label class="block mb-1 text-sm font-medium">Guide font</label>
          <select
           v-model="guideFontId"
           class="w-full px-3 py-2 text-sm border border-gray-400 rounded-lg dark:bg-gray-700 dark:border-gray-600"
          >
           <option v-for="f in GOOGLE_FONTS" :key="f.id" :value="f.id">
            {{ f.label }}
           </option>
          </select>
         </div>
         <div>
          <label class="block mb-1 text-sm font-medium">Text alignment</label>
          <div class="grid grid-cols-3 gap-2">
           <button
            type="button"
            @click="guideTextAlign = 'left'"
            :class="[
             'px-3 py-1.5 text-sm border rounded-lg cursor-pointer',
             guideTextAlign === 'left'
              ? 'bg-gray-800 text-white border-gray-800'
              : 'border-gray-400 hover:bg-gray-100',
            ]"
           >
            Left
           </button>
           <button
            type="button"
            @click="guideTextAlign = 'center'"
            :class="[
             'px-3 py-1.5 text-sm border rounded-lg cursor-pointer',
             guideTextAlign === 'center'
              ? 'bg-gray-800 text-white border-gray-800'
              : 'border-gray-400 hover:bg-gray-100',
            ]"
           >
            Center
           </button>
           <button
            type="button"
            @click="guideTextAlign = 'right'"
            :class="[
             'px-3 py-1.5 text-sm border rounded-lg cursor-pointer',
             guideTextAlign === 'right'
              ? 'bg-gray-800 text-white border-gray-800'
              : 'border-gray-400 hover:bg-gray-100',
            ]"
           >
            Right
           </button>
          </div>
         </div>
         <label class="flex items-center gap-2 text-sm font-medium cursor-pointer">
          <input
           v-model="printGuideText"
           type="checkbox"
           class="accent-current"
          />
          <span>Print guide text</span>
         </label>
         <label class="flex items-center gap-2 text-sm font-medium cursor-pointer">
          <input
           v-model="includeGuideTextInDownload"
           type="checkbox"
           class="accent-current"
          />
          <span>Include guide text in download</span>
         </label>
        </template>
       </div>
      </AccordionContent>
     </AccordionItem>

     <AccordionItem
      value="overlay"
      class="group border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800"
     >
      <AccordionHeader>
       <AccordionTrigger
        class="flex w-full items-center justify-between gap-4 px-4 py-1.5 text-left text-sm font-semibold cursor-pointer"
       >
        <span>Custom Overlay</span>
        <Icon
         name="ion:chevron-down"
         size="18"
         class="shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
        />
       </AccordionTrigger>
      </AccordionHeader>
      <AccordionContent class="accordion-content overflow-hidden bg-gray-100 dark:bg-gray-900/40">
       <div class="space-y-3 px-4 pt-3 pb-4">
        <div class="grid grid-cols-2 gap-3">
         <label class="text-sm">
          <span class="block mb-1 text-gray-600 dark:text-gray-300"
           >Width</span
          >
          <input
           v-model.number="customWidthIn"
           type="number"
           :min="CUSTOM_MIN_IN"
           :max="PAGE_W_IN"
           step="0.25"
           placeholder="in"
           class="w-full px-3 py-2 text-sm border border-gray-400 rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
         </label>
         <label class="text-sm">
          <span class="block mb-1 text-gray-600 dark:text-gray-300"
           >Height</span
          >
          <input
           v-model.number="customHeightIn"
           type="number"
           :min="CUSTOM_MIN_IN"
           :max="PAGE_H_IN"
           step="0.25"
           placeholder="in"
           class="w-full px-3 py-2 text-sm border border-gray-400 rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
         </label>
        </div>
        <p class="text-xs text-gray-500">
         Min {{ CUSTOM_MIN_IN }}", max {{ PAGE_W_IN }}" × {{ PAGE_H_IN }}".
         Overlay appears once both are set.
        </p>
       </div>
      </AccordionContent>
     </AccordionItem>
    </AccordionRoot>

    <button
     type="button"
     @click="handlePrint"
     class="w-full px-6 py-3 font-bold text-white bg-gray-800 hover:bg-gray-900 rounded-xl cursor-pointer"
    >
     Print
    </button>

    <button
     type="button"
     @click="handleDownloadPdf"
     class="w-full px-6 py-3 font-bold text-gray-800 bg-white border border-gray-800 hover:bg-gray-100 rounded-xl cursor-pointer"
    >
     Download (watermarked)
    </button>

    <div class="border-t border-gray-200 pt-5 space-y-3">
     <p class="text-sm font-medium">Download Clean Template</p>
     <button
      type="button"
      @click="buyCleanTemplate(false)"
      :disabled="isAddingTemplate"
      class="w-full px-6 py-3 font-bold text-white bg-gray-800 hover:bg-gray-900 rounded-xl cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
     >
      {{ addingVariant === "pdf" ? "Adding to cart…" : "PDF Only — $1.99" }}
     </button>
     <button
      type="button"
      @click="buyCleanTemplate(true)"
      :disabled="isAddingTemplate"
      class="w-full px-6 py-3 font-bold text-white bg-gray-800 hover:bg-gray-900 rounded-xl cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
     >
      {{
       addingVariant === "pdf-png"
        ? "Adding to cart…"
        : "PDF + Transparent PNG — $2.99"
      }}
     </button>
     <p class="text-xs text-gray-500">
      The PDF+PNG option includes a high-resolution transparent PNG file for use
      with digital design tools, bundled together in a zip archive.
     </p>
    </div>
    <p v-if="cleanPdfMessage" class="text-sm text-red-600">
     {{ cleanPdfMessage }}
    </p>
   </aside>

   <div
    :class="[
     'calligraphy-print-area',
     'lg:sticky lg:top-[88px] lg:self-start lg:h-[calc(100vh-112px)]',
     orientation === 'portrait'
      ? 'orientation-portrait'
      : 'orientation-landscape',
    ]"
   >
    <div class="preview-grid lg:h-full lg:w-fit lg:mx-auto">
     <div v-if="showRulers" class="ruler ruler-top no-print">
      <svg
       :viewBox="`0 0 ${PAGE_W} ${RULER_THICKNESS}`"
       preserveAspectRatio="none"
      >
       <line
        v-for="(t, i) in horizontalTicks"
        :key="`rt-${i}`"
        :x1="t.pos"
        :y1="RULER_THICKNESS"
        :x2="t.pos"
        :y2="RULER_THICKNESS - (t.major ? TICK_MAJOR_LEN : TICK_MINOR_LEN)"
        stroke="#1f2937"
        stroke-width="0.4"
        vector-effect="non-scaling-stroke"
       />
      </svg>
      <span
       v-for="t in horizontalLabels"
       :key="`lt-${t.pos}`"
       class="ruler-label ruler-label-h"
       :style="{ left: `${(t.pos / PAGE_W) * 100}%` }"
      >
       {{ t.label }}
      </span>
     </div>
     <div v-if="showRulers" class="ruler ruler-left no-print">
      <svg
       :viewBox="`0 0 ${RULER_THICKNESS} ${PAGE_H}`"
       preserveAspectRatio="none"
      >
       <line
        v-for="(t, i) in verticalTicks"
        :key="`rl-${i}`"
        :x1="RULER_THICKNESS"
        :y1="t.pos"
        :x2="RULER_THICKNESS - (t.major ? TICK_MAJOR_LEN : TICK_MINOR_LEN)"
        :y2="t.pos"
        stroke="#1f2937"
        stroke-width="0.4"
        vector-effect="non-scaling-stroke"
       />
      </svg>
      <span
       v-for="t in verticalLabels"
       :key="`ll-${t.pos}`"
       class="ruler-label ruler-label-v"
       :style="{ top: `${(t.pos / PAGE_H) * 100}%` }"
      >
       {{ t.label }}
      </span>
     </div>
     <svg
      ref="svgEl"
      :viewBox="`0 0 ${PAGE_W} ${PAGE_H}`"
      xmlns="http://www.w3.org/2000/svg"
      class="paper w-full h-auto lg:w-auto lg:h-full lg:max-w-full bg-white border border-gray-300 shadow-sm"
      preserveAspectRatio="none"
     >
      <defs>
       <pattern
        id="wmPattern"
        patternUnits="userSpaceOnUse"
        width="135"
        height="56"
        patternTransform="rotate(-30)"
       >
        <text
         x="0"
         y="34"
         font-family="Inter, sans-serif"
         font-size="7"
         fill="#111827"
         opacity="0.15"
        >
         liliesofthefield.co/templates
        </text>
       </pattern>
       <clipPath id="ruleGroupsClip">
        <rect
         v-for="(g, i) in ruleGroups"
         :key="`clip-${i}`"
         :x="margin"
         :y="g.top"
         :width="writingAreaW"
         :height="g.bottom - g.top"
        />
       </clipPath>
       <clipPath v-if="customOverlay" id="overlayClip">
        <rect
         :x="customOverlay.x"
         :y="customOverlay.y"
         :width="customOverlay.width"
         :height="customOverlay.height"
        />
       </clipPath>
      </defs>
      <rect
       v-if="showWatermark"
       data-watermark="true"
       x="0"
       y="0"
       :width="PAGE_W"
       :height="PAGE_H"
       fill="url(#wmPattern)"
       pointer-events="none"
      />
      <g :clip-path="customOverlay ? 'url(#overlayClip)' : undefined">
       <g
        v-if="showSlant"
        clip-path="url(#ruleGroupsClip)"
        stroke="#6b7280"
        stroke-width="0.2"
        stroke-dasharray="0.8,0.6"
       >
        <line
         v-for="(l, i) in slantLines"
         :key="`s-${i}`"
         :x1="l.x1"
         :y1="l.y1"
         :x2="l.x2"
         :y2="l.y2"
        />
       </g>
       <g v-for="(g, i) in ruleGroups" :key="`g-${i}`">
        <line
         :x1="margin"
         :y1="g.top"
         :x2="PAGE_W - margin"
         :y2="g.top"
         stroke="#4b5563"
         stroke-width="0.25"
        />
        <line
         :x1="margin"
         :y1="g.waist"
         :x2="PAGE_W - margin"
         :y2="g.waist"
         stroke="#374151"
         stroke-width="0.3"
        />
        <line
         :x1="margin"
         :y1="g.baseline"
         :x2="PAGE_W - margin"
         :y2="g.baseline"
         stroke="#111827"
         stroke-width="0.4"
        />
        <line
         :x1="margin"
         :y1="g.bottom"
         :x2="PAGE_W - margin"
         :y2="g.bottom"
         stroke="#4b5563"
         stroke-width="0.25"
        />
       </g>
       <g
        v-if="guideTextLines.length"
        :class="{ 'no-print': !printGuideText }"
        data-guide-text="true"
        clip-path="url(#ruleGroupsClip)"
        pointer-events="none"
       >
        <text
         v-for="(line, i) in guideTextLines"
         :key="`guide-${i}`"
         :x="guideTextX"
         :y="line.y"
         :text-anchor="guideTextAnchor"
         :font-family="guideFontFamilyCss"
         :font-size="groupHeight"
         fill="#78350f"
         opacity="0.5"
        >{{ line.text }}</text>
       </g>
       <line
        v-if="showCenterLine"
        :x1="PAGE_W / 2"
        :y1="margin"
        :x2="PAGE_W / 2"
        :y2="PAGE_H - effectiveBottomMargin"
        stroke="#4b5563"
        stroke-width="0.25"
       />
      </g>
      <rect
       v-if="customOverlay"
       :x="customOverlay.x"
       :y="customOverlay.y"
       :width="customOverlay.width"
       :height="customOverlay.height"
       fill="none"
       stroke="#111827"
       stroke-width="0.35"
       stroke-dasharray="1.5,1.2"
      />
      <text
       :x="FOOTER_STRIP"
       :y="PAGE_H - FOOTER_STRIP / 2"
       font-family="sans-serif"
       font-size="2.2"
       fill="#6b7280"
      >
       {{ settingsLabel }}
      </text>
      <text
       :x="brandingTextX"
       :y="PAGE_H - FOOTER_STRIP / 2"
       text-anchor="end"
       font-family="sans-serif"
       font-size="2.2"
       fill="#6b7280"
      >
       Lilies of the Field Calligraphy Templates · liliesofthefield.co/templates
      </text>
     </svg>
     <div v-if="showRulers" class="ruler ruler-right no-print">
      <svg
       :viewBox="`0 0 ${RULER_THICKNESS} ${PAGE_H}`"
       preserveAspectRatio="none"
      >
       <line
        v-for="(t, i) in verticalTicks"
        :key="`rr-${i}`"
        :x1="0"
        :y1="t.pos"
        :x2="t.major ? TICK_MAJOR_LEN : TICK_MINOR_LEN"
        :y2="t.pos"
        stroke="#1f2937"
        stroke-width="0.4"
        vector-effect="non-scaling-stroke"
       />
      </svg>
      <span
       v-for="t in verticalLabels"
       :key="`lr-${t.pos}`"
       class="ruler-label ruler-label-v"
       :style="{ top: `${(t.pos / PAGE_H) * 100}%` }"
      >
       {{ t.label }}
      </span>
     </div>
     <div v-if="showRulers" class="ruler ruler-bottom no-print">
      <svg
       :viewBox="`0 0 ${PAGE_W} ${RULER_THICKNESS}`"
       preserveAspectRatio="none"
      >
       <line
        v-for="(t, i) in horizontalTicks"
        :key="`rb-${i}`"
        :x1="t.pos"
        :y1="0"
        :x2="t.pos"
        :y2="t.major ? TICK_MAJOR_LEN : TICK_MINOR_LEN"
        stroke="#1f2937"
        stroke-width="0.4"
        vector-effect="non-scaling-stroke"
       />
      </svg>
      <span
       v-for="t in horizontalLabels"
       :key="`lb-${t.pos}`"
       class="ruler-label ruler-label-h"
       :style="{ left: `${(t.pos / PAGE_W) * 100}%` }"
      >
       {{ t.label }}
      </span>
     </div>
    </div>
   </div>
  </div>
 </div>
</template>

<style scoped>
@reference "#tailwind";

input[type="range"] {
 @apply w-full h-2 mt-2 bg-gray-300 rounded-lg appearance-none cursor-pointer;
 accent-color: var(--color-primary);
}

.preview-grid {
 position: relative;
 padding: 22px;
}

.ruler {
 position: absolute;
}

.ruler > svg {
 display: block;
 width: 100%;
 height: 100%;
}

.ruler-label {
 position: absolute;
 font-family: sans-serif;
 font-size: 9px;
 line-height: 1;
 color: #1f2937;
 pointer-events: none;
}

.ruler-label-h {
 transform: translateX(-50%);
}

.ruler-label-v {
 transform: translateY(-50%);
}

.ruler-top {
 top: 0;
 left: 22px;
 right: 22px;
 height: 22px;
}
.ruler-top .ruler-label-h {
 top: 2px;
}

.ruler-bottom {
 bottom: 0;
 left: 22px;
 right: 22px;
 height: 22px;
}
.ruler-bottom .ruler-label-h {
 bottom: 2px;
}

.ruler-left {
 top: 22px;
 bottom: 22px;
 left: 0;
 width: 22px;
}
.ruler-left .ruler-label-v {
 left: 2px;
}

.ruler-right {
 top: 22px;
 bottom: 22px;
 right: 0;
 width: 22px;
}
.ruler-right .ruler-label-v {
 right: 2px;
}

.paper {
 display: block;
}
</style>

<style>
.accordion-content[data-state="open"] {
 animation: accordion-down 200ms ease-out;
}
.accordion-content[data-state="closed"] {
 animation: accordion-up 200ms ease-out;
}

@keyframes accordion-down {
 from {
  height: 0;
 }
 to {
  height: var(--reka-accordion-content-height);
 }
}

@keyframes accordion-up {
 from {
  height: var(--reka-accordion-content-height);
 }
 to {
  height: 0;
 }
}

/* A single portrait named page is used for both orientations. Print engines
   often ignore `@page { size: letter landscape }`, so landscape content is
   instead rotated 90° to fit this portrait sheet (see the print rules below).
   Named pages selected via the `page` property are reliably honored. */
@page portrait-page {
 size: letter portrait;
 margin: 0;
}

@media print {
 header,
 footer,
 .no-print {
  display: none !important;
 }
 html,
 body {
  margin: 0 !important;
  padding: 0 !important;
  background: white !important;
 }
 .calligraphy-print-area {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
  background: #fff !important;
  z-index: 10 !important;
  page-break-after: avoid !important;
  page-break-inside: avoid !important;
 }
 .calligraphy-print-area.orientation-portrait {
  page: portrait-page;
 }
 /* Print engines frequently ignore `@page { size: letter landscape }`, so the
     landscape sheet comes out portrait with the content squished. Instead we
     keep the paper portrait and rotate the landscape content 90° so it fills
     the page. The area is 11in × 8.5in, so rotating it about the top-left and
     shifting up by its own height lands it exactly on the 8.5in × 11in sheet. */
 .calligraphy-print-area.orientation-landscape {
  page: portrait-page;
  transform-origin: top left;
  transform: rotate(90deg) translateY(-100%);
 }
 .instagram-feed {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  z-index: -1 !important;
 }
 .calligraphy-print-area svg {
  display: block !important;
  border: none !important;
  box-shadow: none !important;
 }
 .preview-grid {
  display: block !important;
  padding: 0 !important;
 }
}
</style>
