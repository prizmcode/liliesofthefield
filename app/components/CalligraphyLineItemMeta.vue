<script setup lang="ts">
export interface CalligraphyLineItem {
 text?: string | null;
 letters?: number | null;
 sizeId?: string | null;
 sizeLabel?: string | null;
 sizeDims?: string | null;
 notes?: string | null;
 unitPrice?: number | string | null;
 svg?: string | null;
}

const props = defineProps<{
 calligraphy?: CalligraphyLineItem | null;
 compact?: boolean;
}>();

const { formatPrice } = useHelpers();

const hasData = computed(
 () =>
  !!props.calligraphy &&
  (props.calligraphy.text ||
   props.calligraphy.sizeLabel ||
   props.calligraphy.notes),
);

const unitPriceDisplay = computed<string | null>(() => {
 const raw = props.calligraphy?.unitPrice;
 if (raw === null || raw === undefined || raw === "") return null;
 return formatPrice(String(raw));
});

// The saved design is only offered as a download in full (non-compact) views,
// e.g. the order summary, where a customer returns to retrieve their PDF.
const savedSvg = computed<string | null>(() => {
 const svg = props.calligraphy?.svg;
 return typeof svg === "string" && svg.trim().startsWith("<svg") ? svg : null;
});

const isDownloading = ref(false);
const downloadError = ref("");

function designFilename() {
 const label = (props.calligraphy?.notes || props.calligraphy?.text || "Calligraphy-Template")
  .replace(/[^a-zA-Z0-9._-]+/g, "-")
  .replace(/-+/g, "-")
  .replace(/^-|-$/g, "");
 return `${label || "Calligraphy-Template"}.pdf`.replace(/\.pdf\.pdf$/i, ".pdf");
}

async function downloadDesign() {
 if (!savedSvg.value || isDownloading.value) return;
 downloadError.value = "";
 isDownloading.value = true;
 // svg2pdf relies on getBBox(), which only works for elements attached to the
 // document, so the parsed SVG is mounted off-screen for the render.
 let host: HTMLDivElement | null = null;
 try {
  const [{ jsPDF }, { svg2pdf }] = await Promise.all([
   import("jspdf"),
   import("svg2pdf.js"),
  ]);
  const doc = new DOMParser().parseFromString(savedSvg.value, "image/svg+xml");
  const svgEl = doc.documentElement as unknown as SVGSVGElement;
  host = document.createElement("div");
  host.style.cssText = "position:fixed;left:-99999px;top:0;width:0;height:0;overflow:hidden;";
  host.appendChild(svgEl);
  document.body.appendChild(host);
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" });
  await svg2pdf(svgEl, pdf, { x: 0, y: 0, width: 215.9, height: 279.4 });
  pdf.save(designFilename());
 } catch {
  downloadError.value = "Could not generate the PDF. Please try again.";
 } finally {
  if (host) host.remove();
  isDownloading.value = false;
 }
}
</script>

<template>
 <div
  v-if="hasData || savedSvg"
  class="mt-1 text-xs text-gray-600 dark:text-gray-300 space-y-0.5"
  :class="compact ? '' : 'sm:text-sm'"
 >
  <div v-if="calligraphy?.text" class="flex gap-1">
   <span class="text-gray-400 dark:text-gray-500 shrink-0">Text:</span>
   <span
    class="italic line-clamp-2 wrap-break-word"
    :title="calligraphy.text || undefined"
   >
    &ldquo;{{ calligraphy.text }}&rdquo;
   </span>
  </div>
  <div v-if="calligraphy?.sizeLabel" class="flex gap-1">
   <span class="text-gray-400 dark:text-gray-500 shrink-0">Size:</span>
   <span>
    {{ calligraphy.sizeLabel }}
    <span v-if="calligraphy.sizeDims" class="text-gray-400 dark:text-gray-500">
     ({{ calligraphy.sizeDims }})
    </span>
   </span>
  </div>
  <div v-if="calligraphy?.notes" class="flex gap-1">
   <span class="text-gray-400 dark:text-gray-500 shrink-0">Notes:</span>
   <span
    class="line-clamp-2 wrap-break-word"
    :title="calligraphy.notes || undefined"
   >
    {{ calligraphy.notes }}
   </span>
  </div>
  <div v-if="unitPriceDisplay" class="flex gap-1">
   <span class="text-gray-400 dark:text-gray-500 shrink-0"> Calligraphy: </span>
   <span class="tabular-nums">{{ unitPriceDisplay }}</span>
  </div>
  <div v-if="!compact && savedSvg" class="pt-1">
   <button
    type="button"
    :disabled="isDownloading"
    class="inline-flex items-center gap-1 text-primary hover:text-primary-dark hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
    @click="downloadDesign"
   >
    <Icon name="ion:download-outline" />
    <span>{{ isDownloading ? "Preparing…" : "Download design (PDF)" }}</span>
   </button>
   <p v-if="downloadError" class="mt-1 text-red-500 dark:text-red-400">
    {{ downloadError }}
   </p>
  </div>
 </div>
</template>
