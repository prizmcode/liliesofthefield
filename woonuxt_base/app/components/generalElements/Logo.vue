<script setup lang="ts">
const { siteName } = useAppConfig();
const appConfig = useAppConfig();
const img = useImage();
const colorMode = useColorMode();

const logoUrl = computed(() => (colorMode.value === 'dark' && appConfig.darkLogoUrl ? appConfig.darkLogoUrl : appConfig.logoUrl));
const faviconUrl = '/liliesofthefield.webp';
</script>

<template>
  <div id="top-logo" class="relative w-40 md:w-60 lg:w-70">
    <section class="absolute z-50 -top-8 w-40 md:w-60 lg:w-70 bg-white dark:bg-gray-800 border-1 dark:border-gray-600 border-amber-900 shadow-xl">
      <div class="flex items-center flex-col justify-center">
        <NuxtLink to="/" class="flex h-full items-center justify-center hover:no-underline p-4 lg:p-6">
          <img v-if="logoUrl" :src="logoUrl" alt="Logo" class="" />
          <div v-else class="flex items-center gap-2 text-lg font-bold">
            <img :src="faviconUrl" alt="Logo" />
          </div>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
