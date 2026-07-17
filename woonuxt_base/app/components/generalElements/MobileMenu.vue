<script setup lang="ts">
const { toggleMobileMenu, wooNuxtVersionInfo } = useHelpers();
</script>

<template>
  <div class="bg-white dark:bg-gray-800 flex flex-col max-w-lg shadow-lg dark:shadow-gray-900/50 top-0 bottom-0 right-0 w-11/12 z-50 fixed overflow-x-hidden">
    <CloseIcon class="bg-white dark:bg-gray-700 rounded-xl shadow-xl p-1.5 left-auto! right-8" @click="toggleMobileMenu(false)" />
    <div class="mt-8 text-center text-gray-900 dark:text-white">{{ $t('general.menu') }}</div>
    <MainMenu class="m-4 grid p-4 text-gray-500 dark:text-gray-400 gap-6" />
  </div>
</template>
