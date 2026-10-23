<script setup lang="ts">
useSeoMeta({
 title: "Commissions",
 description:
  "Commissioned portraiture, large-scale murals, and custom ceramic work at an affordable rate.",
});

const portraits = [
 {
  src: "/images/commissions/terrier-portrait.jpg",
  alt: "Watercolor portrait of two terriers sitting together",
 },
 {
  src: "/images/commissions/portrait-woman.jpg",
  alt: "Watercolor portrait of a smiling woman with curly auburn hair",
 },
 {
  src: "/images/commissions/portrait-child.jpg",
  alt: "Watercolor portrait of a young child in overalls",
 },
 {
  src: "/images/commissions/portrait-man.jpg",
  alt: "Watercolor portrait of a man with tousled curly hair",
 },
];
</script>

<template>
 <div class="commissions">
  <!-- Intro -->
  <section class="container max-w-3xl text-center pt-6 md:pt-12 pb-16 px-8">
   <p class="text-xs uppercase tracking-[0.3em] text-gold-700 dark:text-gold-400">
    Murals · Portraits · Ceramics
   </p>
   <h1 class="text-center! py-4!">Commissions</h1>
   <p class="text-lg leading-relaxed text-gray-700 dark:text-forest-200">
    I take commissions to do portraiture, large scale murals, and custom
    ceramic work at an affordable rate.
   </p>
   <Button to="/contact" size="lg" class="mt-8">Start a commission</Button>
  </section>

  <!-- Featured: The Gospel and Race -->
  <section class="bg-forest-800 text-white">
   <div class="container grid md:grid-cols-2 gap-10 items-center py-16 px-8">
    <img
     src="/images/commissions/gospel-and-race-cover.jpg"
     alt="Cover of The Gospel and Race by Ken Riley, featuring a watercolor of clergy linking arms on the steps of Notre Dame"
     class="w-full max-w-sm mx-auto shadow-2xl"
    />
    <div>
     <p class="text-xs uppercase tracking-[0.3em] text-gold-400">
      Featured commission
     </p>
     <h2 class="text-white">
      Cover art for Ken Riley's new book “The Gospel and Race”
     </h2>
     <p class="leading-relaxed text-forest-100">
      Ken selected a powerful image, taken on the steps of Notre Dame during
      civil rights riots when the clergy stood hand-in-hand singing “We Shall
      Overcome”. I found the source of the photograph, from the Notre Dame
      archives, who granted permission to do a derivative watercolor
      painting.
     </p>
    </div>
   </div>
   <div class="container grid sm:grid-cols-2 gap-6 pb-16 px-8">
    <figure>
     <img
      src="/images/commissions/gospel-and-race-progress.jpg"
      alt="The cover watercolor in progress beside the archival reference photograph"
      loading="lazy"
      class="w-full aspect-4/3 object-cover"
     />
     <figcaption>The watercolor in progress, with the archival photo for reference</figcaption>
    </figure>
    <figure>
     <img
      src="/images/commissions/ken-riley-book.jpg"
      alt="Ken Riley and the artist holding a copy of The Gospel and Race"
      loading="lazy"
      class="w-full aspect-4/3 object-cover"
     />
     <figcaption>With Ken Riley and the finished book</figcaption>
    </figure>
   </div>
  </section>

  <!-- Portraits -->
  <section class="container py-16 px-8">
   <h2 class="text-center">Portraits</h2>
   <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
    <img
     v-for="portrait in portraits"
     :key="portrait.src"
     :src="portrait.src"
     :alt="portrait.alt"
     loading="lazy"
     class="w-full aspect-4/5 object-cover shadow-md"
    />
   </div>
  </section>

  <!-- Murals & Ceramics -->
  <section class="container grid md:grid-cols-2 gap-10 pb-16 px-8">
   <div>
    <h2>Murals</h2>
    <figure>
     <img
      src="/images/commissions/svdp-playspace-mural.jpg"
      alt="Painted mural of a deer drinking from a mountain stream beneath autumn trees, in a children's playspace with bean bags and a small table"
      loading="lazy"
      class="w-full aspect-4/3 object-cover shadow-md"
     />
     <figcaption class="text-gray-600! dark:text-forest-200!">
      Children's playspace mural for Saint Vincent de Paul in Bremerton
     </figcaption>
    </figure>
   </div>
   <div>
    <h2>Ceramics</h2>
    <img
     src="/images/commissions/ceramics.jpg"
     alt="Handmade stoneware mugs and bowls with carved designs on a table by the water"
     loading="lazy"
     class="w-full aspect-4/3 object-cover shadow-md"
    />
   </div>
  </section>

  <!-- Call to action -->
  <section class="bg-forest-700 text-white text-center">
   <div class="container max-w-2xl py-16 px-8">
    <h2 class="text-white text-center!">Have a piece in mind?</h2>
    <p class="text-forest-100">
     Tell me about the subject, size, and any timing details, and we'll go
     from there.
    </p>
    <Button to="/contact" size="lg" class="mt-6">Get in touch</Button>
   </div>
  </section>
 </div>
</template>

<style scoped>
@reference "#tailwind";

figcaption {
 @apply mt-2 text-sm text-forest-200;
}
</style>
