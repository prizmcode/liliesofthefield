<template>
 <div class="container mx-auto page">
  <h1>About Us.</h1>
  <h2>This is where the story begins.</h2>
  <p>Lilies of the Field is the result of a life of interest in the arts.</p>
  <div class="content-section">
   <div class="flex-1">
    <h2>Calligraphy</h2>
    <p>
     As a child, our family hosted many Japanese exchange students in the
     summer. They all were so talented, and many practiced calligraphy. I fell
     in love with Japanese calligraphy - the smell of the ink, the crunch of the
     paper, the meditative flow of emotion through bold brush strokes. Each
     stroke must be confident and continuous, making each piece a raw reflection
     of the focus and emotion of the artist. I create Japanese-inspired scrolls
     and artworks using traditional rice paper and wet mounting techniques.
    </p>
    <p>
     My love of calligraphy coupled with my desire to commit God's Word to
     memory has led me to start creating calligraphy scrolls to get '<strong
      class="font-bold"
      >Words on the Wall</strong
     >'.
    </p>
   </div>
   <div class="flex-1">
    <video
     src="https://player.mediadelivery.net/play/672581/0e194d74-d308-4bfb-9211-1d480c0b1783"
     autoplay
     muted
     loop
     playsinline
     class="w-full md:w-[300px] mx-auto"
    />
   </div>
  </div>

  <div class="content-section">
   <div class="flex-1">
    <h2>Portraits</h2>
    <p>
     When I was a kid, I was referred to as 'that weird girl that doesn't talk,
     but she draws really good'. I can't tell you how I learned to draw because
     it was instinctual. Speaking may not have been easy for me, but studying
     and observing shapes and patterns was. Portraits were always my favorite
     things to draw and paint as I loved the challenge, and there is so much
     expression portraits.
    </p>
    <p></p>
   </div>
   <div class="flex-1">
    <video
     src="https://player.mediadelivery.net/play/672581/4a64c01e-2b84-405e-99b6-03a4a08076a0"
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
    <h2>Florals</h2>
    <p>
     Fresh or dried, flowers are God's way of smiling. Whether arranging or
     painting, I will always hold flowers dear to my heart. Here I am making a
     dried flower panel. What is your favorite flower?
    </p>
    <p></p>
   </div>
   <div class="flex-1">
    <video
     src="https://player.mediadelivery.net/play/672581/7124c9de-5338-4ede-a1bc-8ac8d1dcf077"
     autoplay
     muted
     loop
     playsinline
     class="w-full mx-auto"
    />
   </div>
  </div>
 </div>
</template>

<style lang="postcss" scoped>
@reference "#tailwind";

.content-section {
 @apply md:flex justify-between border-b border-b-gray-300 py-8;
}
img,
video {
 @apply md:px-8;
}
</style>
