<script setup lang="ts">
export interface CalligraphyLineItem {
 text?: string | null;
 letters?: number | null;
 notes?: string | null;
 svg?: string | null;
 includePng?: boolean | null;
}

const props = defineProps<{
 calligraphy?: CalligraphyLineItem | null;
 compact?: boolean;
}>();

const hasData = computed(
 () =>
  !!props.calligraphy && (props.calligraphy.text || props.calligraphy.notes),
);

// The saved design is only offered as a download in full (non-compact) views,
// e.g. the order summary, where a customer returns to retrieve their PDF.
const savedSvg = computed<string | null>(() => {
 const svg = props.calligraphy?.svg;
 return typeof svg === "string" && svg.trim().startsWith("<svg") ? svg : null;
});

const isDownloading = ref(false);
const downloadError = ref("");

// When the purchased variation bundled a transparent PNG, the saved design must
// be delivered as a zip archive (PDF + PNG) rather than a lone PDF.
const includePng = computed<boolean>(() => !!props.calligraphy?.includePng);

function designFilename() {
 const label = (props.calligraphy?.notes || props.calligraphy?.text || "Calligraphy-Template")
  .replace(/[^a-zA-Z0-9._-]+/g, "-")
  .replace(/-+/g, "-")
  .replace(/^-|-$/g, "");
 return `${label || "Calligraphy-Template"}.pdf`.replace(/\.pdf\.pdf$/i, ".pdf");
}

// The saved SVG's viewBox encodes the page orientation (landscape => width > height),
// so the PDF/PNG are generated to match rather than defaulting to portrait.
function svgOrientation(): "portrait" | "landscape" {
 const match = (savedSvg.value || "").match(/viewBox\s*=\s*["']\s*[\d.]+\s+[\d.]+\s+([\d.]+)\s+([\d.]+)/i);
 if (match) {
  const w = parseFloat(match[1]);
  const h = parseFloat(match[2]);
  if (w && h) return w > h ? "landscape" : "portrait";
 }
 return "portrait";
}

// Generate the PDF entirely in the browser (no PNG requested).
async function downloadPdf() {
 // svg2pdf relies on getBBox(), which only works for elements attached to the
 // document, so the parsed SVG is mounted off-screen for the render.
 let host: HTMLDivElement | null = null;
 try {
  const [{ jsPDF }, { svg2pdf }] = await Promise.all([
   import("jspdf"),
   import("svg2pdf.js"),
  ]);
  const doc = new DOMParser().parseFromString(savedSvg.value!, "image/svg+xml");
  const svgEl = doc.documentElement as unknown as SVGSVGElement;
  host = document.createElement("div");
  host.style.cssText = "position:fixed;left:-99999px;top:0;width:0;height:0;overflow:hidden;";
  host.appendChild(svgEl);
  document.body.appendChild(host);
  const orientation = svgOrientation();
  const isLandscape = orientation === "landscape";
  const pdf = new jsPDF({ orientation, unit: "mm", format: "letter" });
  await svg2pdf(svgEl, pdf, {
   x: 0,
   y: 0,
   width: isLandscape ? 279.4 : 215.9,
   height: isLandscape ? 215.9 : 279.4,
  });
  pdf.save(designFilename());
 } finally {
  if (host) host.remove();
 }
}

// Request the zip archive (PDF + transparent PNG) from the server, which renders
// the PNG with sharp and bundles both files.
async function downloadArchive() {
 // useGqlToken is a setter (returns void); read the stored token from its cookie.
 const token = useCookie("gql:default").value;
 const headers: Record<string, string> = {};
 if (token) headers.Authorization = `Bearer ${token}`;
 const blob = await $fetch<Blob>("/api/generate-template-pdf", {
  method: "POST",
  headers,
  responseType: "blob",
  body: {
   svg: savedSvg.value,
   filename: designFilename(),
   orientation: svgOrientation(),
   includePng: true,
  },
 });
 const url = URL.createObjectURL(blob);
 const a = document.createElement("a");
 a.href = url;
 a.download = designFilename().replace(/\.pdf$/i, "") + ".zip";
 a.click();
 URL.revokeObjectURL(url);
}

async function downloadDesign() {
 if (!savedSvg.value || isDownloading.value) return;
 downloadError.value = "";
 isDownloading.value = true;
 try {
  if (includePng.value) {
   await downloadArchive();
  } else {
   await downloadPdf();
  }
 } catch (e: any) {
  const code = e?.statusCode || e?.response?.status;
  downloadError.value =
   code === 401 || code === 403
    ? "Purchase required to download this file."
    : "Could not generate the file. Please try again.";
 } finally {
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
  <div v-if="calligraphy?.notes" class="flex gap-1">
   <span class="text-gray-400 dark:text-gray-500 shrink-0">Notes:</span>
   <span
    class="line-clamp-2 wrap-break-word"
    :title="calligraphy.notes || undefined"
   >
    {{ calligraphy.notes }}
   </span>
  </div>
  <div v-if="!compact && savedSvg" class="pt-1">
   <button
    type="button"
    :disabled="isDownloading"
    class="inline-flex items-center gap-1 text-primary hover:text-primary-dark hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
    @click="downloadDesign"
   >
    <Icon name="ion:download-outline" />
    <span>{{
     isDownloading
      ? "Preparing…"
      : includePng
       ? "Download design (PDF + PNG)"
       : "Download design (PDF)"
    }}</span>
   </button>
   <p v-if="downloadError" class="mt-1 text-red-500 dark:text-red-400">
    {{ downloadError }}
   </p>
  </div>
 </div>
</template>
