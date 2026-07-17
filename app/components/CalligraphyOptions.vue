<script setup lang="ts">
export interface CalligraphyPaperSize {
 id: string;
 label: string;
 dimensions?: string | null;
 multiplier: number;
}

export interface CalligraphyConfig {
 enabled: boolean;
 rate: number;
 minimumCharge: number;
 paperSizes: CalligraphyPaperSize[];
}

export interface CalligraphyInputValue {
 text: string;
 sizeId: string | null;
 notes: string;
}

const props = defineProps<{
 modelValue: CalligraphyInputValue;
 config: CalligraphyConfig;
}>();

const emit = defineEmits<{
 (e: "update:modelValue", value: CalligraphyInputValue): void;
 (e: "update:isValid", value: boolean): void;
}>();

const { formatPrice } = useHelpers();

const text = computed({
 get: () => props.modelValue.text,
 set: (v: string) =>
  emit("update:modelValue", { ...props.modelValue, text: v }),
});
const sizeId = computed({
 get: () => props.modelValue.sizeId,
 set: (v: string | null) =>
  emit("update:modelValue", { ...props.modelValue, sizeId: v }),
});
const notes = computed({
 get: () => props.modelValue.notes,
 set: (v: string) =>
  emit("update:modelValue", { ...props.modelValue, notes: v }),
});

const letters = computed(() => text.value.match(/\p{L}/gu)?.length ?? 0);
const selectedSize = computed(
 () => props.config.paperSizes.find((s) => s.id === sizeId.value) ?? null,
);
const hasSizes = computed(() => props.config.paperSizes.length > 0);

const previewPrice = computed<number | null>(() => {
 if (!selectedSize.value || letters.value < 1) return null;
 const raw = letters.value * props.config.rate * selectedSize.value.multiplier;
 return Math.max(raw, props.config.minimumCharge);
});

const isValid = computed<boolean>(
 () => hasSizes.value && letters.value >= 1 && !!sizeId.value,
);

watch(isValid, (v) => emit("update:isValid", v), { immediate: true });

// Reset sizeId if it no longer matches a valid option (config change)
watch(
 () => props.config.paperSizes,
 (sizes) => {
  if (sizeId.value && !sizes.some((s) => s.id === sizeId.value)) {
   sizeId.value = null;
  }
 },
);
</script>

<template>
 <fieldset class="mt-6 mb-8 grid gap-4 border-t border-gray-300 dark:border-gray-600 pt-6">
  <legend class="sr-only">Calligraphy options</legend>

  <div v-if="!hasSizes" class="p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
   Calligraphy pricing isn't configured for this product yet. Please contact us before ordering.
  </div>

  <div>
   <label for="calligraphy-text" class="block text-sm font-medium mb-1 dark:text-gray-200">
    Your text <span class="text-red-500">*</span>
   </label>
   <textarea
    id="calligraphy-text"
    v-model="text"
    maxlength="1000"
    rows="3"
    :disabled="!hasSizes"
    class="w-full p-2 bg-white border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
    placeholder="Enter the exact wording you'd like calligraphed"
   />
   <div class="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
    <span>{{ letters }} letter{{ letters === 1 ? "" : "s" }} counted</span>
    <span>{{ text.length }} / 1000</span>
   </div>
  </div>

  <div v-if="hasSizes">
   <p class="block text-sm font-medium mb-2 dark:text-gray-200">
    Paper size <span class="text-red-500">*</span>
   </p>
   <div class="grid gap-2 sm:grid-cols-2">
    <label
     v-for="s in config.paperSizes"
     :key="s.id"
     class="flex items-center gap-2 p-2 border rounded-lg cursor-pointer text-sm hover:border-primary dark:hover:border-primary"
     :class="sizeId === s.id ? 'border-primary bg-primary/5 dark:border-primary' : 'border-gray-300 dark:border-gray-600'"
    >
     <input v-model="sizeId" type="radio" :value="s.id" :name="`calligraphy-size`" class="accent-primary" />
     <span class="flex-1">
      <span class="font-medium dark:text-gray-100">{{ s.label }}</span>
      <span v-if="s.dimensions" class="block text-xs text-gray-500 dark:text-gray-400">{{ s.dimensions }}</span>
     </span>
    </label>
   </div>
  </div>

  <div>
   <label for="calligraphy-notes" class="block text-sm font-medium mb-1 dark:text-gray-200">
    Special instructions <span class="text-gray-400 font-normal">(optional)</span>
   </label>
   <textarea
    id="calligraphy-notes"
    v-model="notes"
    maxlength="2000"
    rows="2"
    :disabled="!hasSizes"
    class="w-full p-2 bg-white border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
    placeholder="Ink color, style preferences, delivery timing, etc."
   />
   <div class="mt-1 text-right text-xs text-gray-500 dark:text-gray-400">{{ notes.length }} / 2000</div>
  </div>

  <div v-if="hasSizes" class="flex items-baseline justify-between text-sm">
   <span class="text-gray-600 dark:text-gray-300">Estimated calligraphy price</span>
   <span class="text-lg font-semibold text-primary dark:text-primary-light tabular-nums">
    {{ previewPrice !== null ? formatPrice(String(previewPrice)) : "—" }}
   </span>
  </div>
  <p v-if="hasSizes" class="text-xs text-gray-500 dark:text-gray-400 -mt-2">
   Final price confirmed on the next step. Minimum charge {{ formatPrice(String(config.minimumCharge)) }}.
  </p>
 </fieldset>
</template>
