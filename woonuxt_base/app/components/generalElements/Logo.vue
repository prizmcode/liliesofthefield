<script setup lang="ts">
const { siteName } = useAppConfig();
const runtimeConfig = useRuntimeConfig();
const img = useImage();

const logoUrl = runtimeConfig?.public?.LOGO ? img(runtimeConfig?.public?.LOGO) : null;
const faviconUrl = '/liliesofthefield.webp';
</script>

<template>
  <div class="relative">
    <section
      class="absolute -top-14 -left-10 sm:left-2 lg:-top-20 lg:left-0 xl:left-6 bg-white rounded-full h-30 w-30 lg:h-40 lg:w-40 border-1 border-primary shadow-xl">
      <div class="flex h-full w-full items-center justify-center">
        <NuxtLink to="/" class="flex h-full w-full items-center justify-center p-2">
          <img v-if="logoUrl" :src="logoUrl" alt="Logo" class="" />
          <div v-else class="flex items-center gap-2 text-lg font-bold">
            <img :src="faviconUrl" alt="Logo" />
          </div>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
