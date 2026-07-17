<template>
 <div class="relative mx-auto">
  <!-- <video
   src="https://res.cloudinary.com/dxy1zozat/video/upload/v1777412025/IMG_6155_eqbw0k.mov"
   autoplay
   muted
   loop
   playsinline
   class="object-cover w-full h-[420px] lg:h-[560px] xl:h-[640px]"
  /> -->
  <div
   class="cover bg-center bg-cover h-[80vh] w-full relative -top-24"
   style="
    background-image: url('https://prizmstudio.com/wp-content/uploads/2023/10/IMG_1121-scaled.jpeg'"
   );
  ></div>
  <div
   class="container absolute inset-0 -top-24 flex flex-col items-center justify-center text-white"
  >
   <div class="bg-gray-900/75 px-6 pt-6 pb-14 text-center m-10">
    <h1
     class="text-2xl font-bold md:mb-4 md:text-4xl lg:text-6xl font-display text-center!"
    >
     Just landed.
    </h1>

    <div class="max-w-sm mb-8 text-md font-light lg:max-w-md text-balance">
     <p>Bespoke works of art to add beauty and inspiration to your home.</p>
    </div>
    <NuxtLink
     class="px-6 py-3 font-bold text-white bg-primary hover:bg-gray-800"
     to="/products"
     >Shop now</NuxtLink
    >
   </div>
  </div>
 </div>
</template>
