<script setup lang="ts">
export interface CalligraphyLineItem {
 text?: string | null;
 letters?: number | null;
 sizeId?: string | null;
 sizeLabel?: string | null;
 sizeDims?: string | null;
 notes?: string | null;
 unitPrice?: number | string | null;
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
</script>

<template>
 <div
  v-if="hasData"
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
 </div>
</template>
