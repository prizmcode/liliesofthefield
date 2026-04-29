<script setup lang="ts">
import {
 AccordionContent,
 AccordionHeader,
 AccordionItem,
 AccordionRoot,
 AccordionTrigger,
} from "reka-ui";

interface FaqItem {
 q: string;
 a: string;
}

const faqs: FaqItem[] = [
 {
  q: "Do you take custom calligraphy commissions?",
  a: "Yes — I love working on bespoke pieces for weddings, gifts, and personal scriptures. Reach out via the contact page with the wording, size, and any timing details and we'll go from there.",
 },
 {
  q: "How long does a custom piece take?",
  a: "Most calligraphy commissions are completed within 2–3 weeks of confirmation. Larger ceramic pieces or paintings can take 4–6 weeks depending on drying, firing, and finishing time.",
 },
 {
  q: "Do you ship internationally?",
  a: "Yes. Shipping rates are calculated at checkout based on destination and package size. International customers are responsible for any customs duties or import taxes.",
 },
 {
  q: "What is your return policy?",
  a: "Because each piece is handmade, we don't accept returns on custom or commissioned work. For non-custom items, returns are accepted within 14 days of delivery in original condition.",
 },
 {
  q: "Are your ceramics food-safe?",
  a: "All glazed pieces marked as food-safe use lead-free, dishwasher-safe glazes.",
 },
];

useSeoMeta({
 title: "FAQ",
 description: "Answers to common questions about Lilies of the Field.",
});
</script>

<template>
 <div class="container my-12 max-w-3xl">
  <h1 class="mb-2 text-5xl font-display">Frequently Asked Questions</h1>
  <p class="mb-8 text-gray-600 dark:text-gray-300">
   Can't find what you're looking for?
   <NuxtLink to="/contact" class="underline">Get in touch</NuxtLink>.
  </p>

  <AccordionRoot
   type="single"
   :collapsible="true"
   class="divide-y divide-gray-200 dark:divide-gray-700 border-y border-gray-200 dark:border-gray-700"
  >
   <AccordionItem
    v-for="(item, idx) in faqs"
    :key="idx"
    :value="`item-${idx}`"
    class="group"
   >
    <AccordionHeader class="bg-white px-6">
     <AccordionTrigger
      class="flex w-full items-center justify-between gap-4 py-2 text-left text-lg font-medium hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-sm cursor-pointer"
     >
      <span class="font-bold text-lg">{{ item.q }}</span>
      <Icon
       name="ion:chevron-down"
       size="20"
       class="shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
      />
     </AccordionTrigger>
    </AccordionHeader>
    <AccordionContent class="accordion-content overflow-hidden p-8 bg-gray-200">
     <p class="pb-5 pr-8 text-gray-600 dark:text-gray-300 leading-relaxed">
      {{ item.a }}
     </p>
    </AccordionContent>
   </AccordionItem>
  </AccordionRoot>
 </div>
</template>

<style lang="postcss">
@reference "#tailwind";

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
</style>
