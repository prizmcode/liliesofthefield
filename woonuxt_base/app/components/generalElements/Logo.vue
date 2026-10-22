<script setup lang="ts">
const { siteName } = useAppConfig();
const appConfig = useAppConfig();
const img = useImage();
const colorMode = useColorMode();

const logoUrl = computed(() => (colorMode.value === 'dark' && appConfig.darkLogoUrl ? appConfig.darkLogoUrl : appConfig.navLogoUrl || appConfig.logoUrl));
const faviconUrl = '/liliesofthefield.webp';
</script>

<template>
  <div id="top-logo" class="flex items-center shrink-0">
    <NuxtLink to="/" class="flex items-center hover:no-underline">
      <img v-if="logoUrl" :src="logoUrl" alt="Logo" class="h-12 md:h-14 w-auto object-contain" />
      <div v-else class="flex items-center gap-2 text-lg font-bold">
        <img :src="faviconUrl" alt="Logo" class="h-12 md:h-14 w-auto object-contain" />
      </div>
    </NuxtLink>
  </div>
</template>
