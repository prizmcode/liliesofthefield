<script setup lang="ts">
export interface CalligraphyConfig {
 enabled: boolean;
}

export interface CalligraphyInputValue {
 text: string;
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

const text = computed({
 get: () => props.modelValue.text,
 set: (v: string) =>
  emit("update:modelValue", { ...props.modelValue, text: v }),
});
const notes = computed({
 get: () => props.modelValue.notes,
 set: (v: string) =>
  emit("update:modelValue", { ...props.modelValue, notes: v }),
});

const letters = computed(() => text.value.match(/\p{L}/gu)?.length ?? 0);

const isValid = computed<boolean>(() => letters.value >= 1);

watch(isValid, (v) => emit("update:isValid", v), { immediate: true });
</script>

<template>
 <fieldset class="mt-6 mb-8 grid gap-4 border-t border-gray-300 dark:border-gray-600 pt-6">
  <legend class="sr-only">Calligraphy options</legend>

  <div>
   <label for="calligraphy-text" class="block text-sm font-medium mb-1 dark:text-gray-200">
    Your text <span class="text-red-500">*</span>
   </label>
   <textarea
    id="calligraphy-text"
    v-model="text"
    maxlength="1000"
    rows="3"
    class="w-full p-2 bg-white border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
    placeholder="Enter the exact wording you'd like calligraphed"
   />
   <div class="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
    <span>{{ letters }} letter{{ letters === 1 ? "" : "s" }} counted</span>
    <span>{{ text.length }} / 1000</span>
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
    class="w-full p-2 bg-white border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
    placeholder="Ink color, style preferences, delivery timing, etc."
   />
   <div class="mt-1 text-right text-xs text-gray-500 dark:text-gray-400">{{ notes.length }} / 2000</div>
  </div>
 </fieldset>
</template>
