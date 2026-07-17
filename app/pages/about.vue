<script setup lang="ts">
import InstagramFeed from "~/components/InstagramFeed.vue";
</script>

<template>
 <div class="container mx-auto page">
  <h1>About Us.</h1>
  <p>
   Lilies of the Field is inspired by a passage in Matthew. A reminder of God's
   provision when we are tempted to be anxious. LOTF aims to create beautiful
   things with the time, talent and treasure I have been given, while trusting
   in God's provision.
  </p>

  <section class="verse text-sm">
   <p>
    27 And which of you by being anxious can add a single hour to his span of
    life?[a] 28 And why are you anxious about clothing? Consider the
    <span class="font-display text-2xl bg-amber-200">lilies of the field</span>,
    how they grow: they neither toil nor spin, 29 yet I tell you, even Solomon
    in all his glory was not arrayed like one of these. 30 But if God so clothes
    the grass of the field, which today is alive and tomorrow is thrown into the
    oven, will he not much more clothe you, O you of little faith?
   </p>
   <p class="font-black uppercase">Matthew 6:27-30</p>
  </section>
 </div>
 <div>
  <div class="content-section">
   <div class="flex-1 object-cover">
    <video
     src="https://vz-da671964-974.b-cdn.net/0e194d74-d308-4bfb-9211-1d480c0b1783/play_720p.mp4"
     autoplay
     muted
     loop
     playsinline
     class="w-full object-cover"
    />
   </div>
   <div class="flex-1">
    <div class="p-8 block">
     <h2>Calligraphy</h2>
     <p>
      Our family hosted many Japanese exchange students in the summertime. They
      all were so talented, and many practiced calligraphy. I fell in love with
      calligraphy - the smell of the ink, the crunch of the paper, the
      meditative flow of emotion through bold brush strokes. I create
      Japanese-inspired scrolls and artworks using traditional rice paper and
      wet mounting techniques, as well as pointed pen calligraphy.
     </p>
     <p>
      My love of calligraphy coupled with my desire to commit God's Word to
      memory has led me to start creating calligraphy scrolls and custom pieces
      to get '<strong class="font-bold">Words on the Wall</strong>'.
     </p>
    </div>
   </div>
  </div>

  <div class="content-section flex flex-col-reverse md:block md:flex-row">
   <div class="flex-1 bg-black text-white">
    <div class="p-8">
     <h2>Portraits</h2>
     <p>
      Since I was a kid, I loved drawing portraits. Nothing is more challenging
      or expressive than the human face. I work in a loose watercolor style and
      aim to capture the complexity and beauty of the human spirit.
     </p>
     <p></p>
    </div>
   </div>
   <div class="flex-1">
    <video
     src="https://vz-da671964-974.b-cdn.net/4a64c01e-2b84-405e-99b6-03a4a08076a0/play_720p.mp4"
     autoplay
     muted
     loop
     playsinline
     class="w-full mx-auto"
    />
   </div>
  </div>

  <div class="content-section">
   <div class="flex-1">
    <video
     src="https://vz-da671964-974.b-cdn.net/7124c9de-5338-4ede-a1bc-8ac8d1dcf077/play_720p.mp4"
     autoplay
     muted
     loop
     playsinline
     class="w-full mx-auto"
    />
   </div>
   <div class="flex-1">
    <div class="p-8">
     <h2>Florals</h2>
     <p>
      Flowers are God's way of smiling. Flowers have been a life long passion
      and a medium that I love to work in. I offer floral services for weddings,
      corporate parties, milestones or just because.
     </p>
     <p></p>
    </div>
   </div>
  </div>
 </div>
</template>

<style scoped>
@reference "#tailwind";

.content-section {
 @apply md:flex justify-between border-b border-b-gray-300 bg-white;
}
.content-section div {
 @apply aspect-square flex flex-col justify-center;
}
.content-section div:nth-child {
 @apply bg-black;
}
.content-section p {
 @apply mb-6;
}
img,
video {
 @apply w-full h-full object-cover m-0 p-0;
}
.verse {
 @apply bg-white my-8 p-8 border-r-primary border-l-2 text-gray-700 leading-relaxed;
}
</style>
