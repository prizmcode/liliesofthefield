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
 points?: { label: string; text: string }[];
}

const faqs: FaqItem[] = [
 {
  q: "Do you take custom commissions?",
  a: "Yes — I love working on bespoke calligraphy, original artwork, and portraits for weddings, gifts, and personal scriptures. Reach out via the contact page with the subject, size, and any timing details and we'll go from there.",
 },
 {
  q: "How long does a custom piece take?",
  a: "Most calligraphy commissions are completed within 2–3 weeks of confirmation. Original artwork and portraits typically take 4–6 weeks depending on size, complexity, and reference materials.",
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
  q: "How should I care for my original artwork?",
  a: "Keep pieces out of direct sunlight and away from high-humidity areas to preserve color and paper. For framed artwork, dust the glass with a soft, dry cloth — avoid spraying cleaners directly on the frame.",
 },
 {
  q: "How should I print my digital art?",
  a: "To get the best results from your digital scripture art, keep these recommendations in mind:",
  points: [
   {
    label: "Paper",
    text: "For wall art, heavy cardstock (80 lb / 110 lb, or 220 gsm and up) with a matte or textured linen finish looks best. If you're trimming edges or mounting the art in a custom frame, a sturdy heavyweight paper is highly recommended.",
   },
   {
    label: "Color",
    text: "Colors can vary slightly between screens and printers. For rich, deep blacks and precise lettering tones, choose \"High Quality\" or \"Fine Art\" in your printer settings.",
   },
   {
    label: "Size and margins",
    text: "Files are formatted with standard print margins. Set your printer scale to \"Actual Size\" or \"100%\" rather than \"Fit to Page\" to keep the intended layout.",
   },
  ],
 },
 {
  q: "Can I share or sell prints of my digital files?",
  a: "Your purchase includes a non-exclusive, personal-use license. You may print your file as many times as you like for your own home decor or to give as physical gifts to family and friends. You may not resell, share, or redistribute the digital files themselves, or use them to mass-produce products for commercial sale.",
 },
 {
  q: "Which Bible translation do you use?",
  a: "Unless otherwise noted, scripture quotations are from the ESV® Bible (The Holy Bible, English Standard Version®), © 2001 by Crossway, a publishing ministry of Good News Publishers. Used by permission. All rights reserved.",
 },
];

useSeoMeta({
 title: "FAQ",
 description: "Answers to common questions about Lilies of the Field.",
});
</script>

<template>
 <div class="container my-6 md:my-12 max-w-3xl" style="padding: 0 32px">
  <h1 class="mb-2 text-5xl font-display">Frequently Asked Questions</h1>
  <p class="mb-8 text-gray-600 dark:text-forest-300">
   Can't find what you're looking for?
   <NuxtLink to="/contact" class="underline">Get in touch</NuxtLink>.
  </p>

  <AccordionRoot
   type="single"
   :collapsible="true"
   class="divide-y divide-gray-200 dark:divide-forest-700 border-y border-gray-200 dark:border-forest-700"
  >
   <AccordionItem
    v-for="(item, idx) in faqs"
    :key="idx"
    :value="`item-${idx}`"
    class="group"
   >
    <AccordionHeader class="bg-stone-200 hover:bg-stone-300 text-forest-900 px-6 transition-colors">
     <AccordionTrigger
      class="flex w-full items-center justify-between gap-4 py-2 text-left text-lg font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-700/50 rounded-sm cursor-pointer"
     >
      <span class="font-bold text-lg">{{ item.q }}</span>
      <Icon
       name="ion:chevron-down"
       size="20"
       class="shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
      />
     </AccordionTrigger>
    </AccordionHeader>
    <AccordionContent class="accordion-content overflow-hidden p-8 bg-linen dark:bg-forest-800">
     <p class="pb-5 pr-8 text-gray-600 dark:text-forest-300 leading-relaxed">
      {{ item.a }}
     </p>
     <ul
      v-if="item.points"
      class="pb-5 pr-8 pl-5 list-disc space-y-2 text-gray-600 dark:text-forest-300 leading-relaxed"
     >
      <li v-for="point in item.points" :key="point.label">
       <strong class="text-forest-900 dark:text-forest-100">{{ point.label }}:</strong>
       {{ point.text }}
      </li>
     </ul>
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
