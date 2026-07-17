<template>
  <div class="relative mx-auto">
    <NuxtImg
      width="1400"
      height="800"
      class="object-cover w-full"
      src="https://prizmstudio.com/wp-content/uploads/2023/10/IMG_1121-scaled.jpeg"
      alt="Hero image"
      loading="eager"
      sizes="sm:100vw md:1400px"
      :preload="{ fetchPriority: 'high' }"
      placeholder
      placeholder-class="blur-xl" />
    <div class="container absolute inset-0 flex flex-col items-start justify-center bg-linear-to-l from-gray-200 sm:bg-none dark:text-gray-700">
      <h1 class="text-2xl font-bold md:mb-4 md:text-4xl lg:text-6xl font-display">Just landed.</h1>
      <div class="max-w-sm mb-8 text-md font-light lg:max-w-md text-balance">
        <p>Cooking up some beautiful stuff.</p>
      </div>
      <NuxtLink class="px-6 py-3 font-bold text-white bg-gray-800 rounded-xl hover:bg-gray-800" to="/products">Shop now</NuxtLink>
    </div>
  </div>
</template>
