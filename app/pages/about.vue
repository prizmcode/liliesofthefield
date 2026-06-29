<template>
 <div class="container mx-auto page">
  <h1>About Us.</h1>
  <p>
   Lilies of the Field is inspired by Matthew 6:26-34. A reminder of God's
   provision in anxious times. LOTF is working with my hands, aiming to create
   beautiful things with the time, talent and treasure God has given me.
  </p>

  <section class="verse">
   <p>
    26 Look at the birds of the air: they neither sow nor reap nor gather into
    barns, and yet your heavenly Father feeds them. Are you not of more value
    than they? 27 And which of you by being anxious can add a single hour to his
    span of life?[a] 28 And why are you anxious about clothing? Consider the
    lilies of the field, how they grow: they neither toil nor spin, 29 yet I
    tell you, even Solomon in all his glory was not arrayed like one of these.
    30 But if God so clothes the grass of the field, which today is alive and
    tomorrow is thrown into the oven, will he not much more clothe you, O you of
    little faith? 31 Therefore do not be anxious, saying, ‘What shall we eat?’
    or ‘What shall we drink?’ or ‘What shall we wear?’ 32 For the Gentiles seek
    after all these things, and your heavenly Father knows that you need them
    all. 33 But seek first the kingdom of God and his righteousness, and all
    these things will be added to you.
   </p>

   <p>
    34 “Therefore do not be anxious about tomorrow, for tomorrow will be anxious
    for itself. Sufficient for the day is its own trouble.
   </p>
  </section>
 </div>
 <div class="bg-stone-900">
  <div class="content-section">
   <div class="flex-1 object-cover">
    <video
     src="https://vz-da671964-974.b-cdn.net/0e194d74-d308-4bfb-9211-1d480c0b1783/play_720p.mp4"
     autoplay
     muted
     loop
     playsinline
     class="w-full md:w-[300px] object-cover"
    />
   </div>
   <div class="flex-1">
    <div class="p-8">
     <h2>Calligraphy</h2>
     <p>
      As a child, our family hosted many Japanese exchange students in the
      summer. They all were so talented, and many practiced calligraphy. I fell
      in love with Japanese calligraphy - the smell of the ink, the crunch of
      the paper, the meditative flow of emotion through bold brush strokes. I
      create Japanese-inspired scrolls and artworks using traditional rice paper
      and wet mounting techniques, as well as pointed pen calligraphy.
     </p>
     <p>
      My love of calligraphy coupled with my desire to commit God's Word to
      memory has led me to start creating calligraphy scrolls to get '<strong
       class="font-bold"
       >Words on the Wall</strong
      >'.
     </p>
    </div>
   </div>
  </div>

  <div class="content-section flex flex-col-reverse md:block md:flex-row">
   <div class="flex-1">
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
      Fresh or dried, flowers are God's way of smiling. Whether arranging or
      painting, I will always hold flowers dear to my heart. Here I am making a
      dried flower panel. What is your favorite flower?
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
 @apply md:flex justify-between border-b border-b-gray-300 mb-20 bg-white;
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
