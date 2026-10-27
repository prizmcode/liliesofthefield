<script setup lang="ts">
import {
 SelectContent,
 SelectGroup,
 SelectItem,
 SelectItemIndicator,
 SelectItemText,
 SelectLabel,
 SelectPortal,
 SelectRoot,
 SelectTrigger,
 SelectViewport,
} from "reka-ui";
import {
 GOOGLE_FONTS,
 GUIDE_FONT_OPTIONS,
 type GuideFont,
} from "#shared/utils/guideFonts";

const props = defineProps<{
 modelValue: string;
 sampleText?: string;
}>();

const emit = defineEmits<{
 (e: "update:modelValue", value: string): void;
}>();

const selectedFont = computed(() =>
 GOOGLE_FONTS.find((f) => f.id === props.modelValue),
);

// Preview each font with the first line of the customer's own wording.
const sample = computed(
 () =>
  props.sampleText
   ?.split("\n")
   .find((line) => line.trim())
   ?.trim() || "Lilies of the field",
);

// Scripts vary widely in x-height (Monsieur La Doulaise is ~0.16 of its em,
// Petit Formal Script ~0.58), so size each preview by x-height rather than
// em size to keep the lowercase letters comparable across fonts.
const PREVIEW_X_HEIGHT = 9;
function previewStyle(font: GuideFont) {
 const size = Math.min(36, Math.max(16, PREVIEW_X_HEIGHT / font.xHeightRatio));
 return {
  fontFamily: `'${font.family}', cursive`,
  fontStyle: font.style ?? "normal",
  fontSize: `${size}px`,
 };
}
</script>

<template>
 <SelectRoot
  :model-value="modelValue"
  @update:model-value="(id) => emit('update:modelValue', id as string)"
 >
  <SelectTrigger
   aria-label="Guide font"
   class="flex w-full items-center justify-between gap-3 px-3 py-1.5 text-left bg-white border border-gray-400 rounded-lg cursor-pointer dark:bg-forest-700 dark:border-forest-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-500/50"
  >
   <span v-if="selectedFont" class="min-w-0">
    <span class="block text-xs text-gray-500 dark:text-forest-300">
     {{ selectedFont.label }}
    </span>
    <span class="preview" :style="previewStyle(selectedFont)">{{ sample }}</span>
   </span>
   <Icon name="ion:chevron-down" size="18" class="shrink-0" />
  </SelectTrigger>

  <SelectPortal>
   <SelectContent
    position="popper"
    :side-offset="4"
    class="z-50 w-(--reka-select-trigger-width) max-h-[min(70vh,var(--reka-select-content-available-height))] overflow-hidden bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-forest-800 dark:border-forest-600"
   >
    <SelectViewport class="p-1">
     <SelectGroup v-for="option in GUIDE_FONT_OPTIONS" :key="option.group">
      <SelectLabel
       class="px-3 pt-3 pb-1 text-xs font-semibold tracking-widest uppercase text-gray-500 dark:text-forest-300"
      >
       {{ option.group }}
      </SelectLabel>
      <SelectItem
       v-for="font in option.fonts"
       :key="font.id"
       :value="font.id"
       :text-value="font.label"
       class="flex items-center gap-3 px-3 py-1 rounded-md cursor-pointer outline-none select-none data-highlighted:bg-linen dark:data-highlighted:bg-forest-700"
      >
       <span class="min-w-0 flex-1">
        <SelectItemText class="block text-xs text-gray-500 dark:text-forest-300">
         {{ font.label }}
        </SelectItemText>
        <span class="preview" :style="previewStyle(font)">{{ sample }}</span>
       </span>
       <SelectItemIndicator class="shrink-0 text-forest-700 dark:text-gold-400">
        <Icon name="ion:checkmark" size="18" />
       </SelectItemIndicator>
      </SelectItem>
     </SelectGroup>
    </SelectViewport>
   </SelectContent>
  </SelectPortal>
 </SelectRoot>
</template>

<style scoped>
/* Generous line height so flourished ascenders and descenders aren't clipped
   by the single-line overflow handling. */
.preview {
 display: block;
 overflow: hidden;
 white-space: nowrap;
 text-overflow: ellipsis;
 line-height: 1.6;
}
</style>
