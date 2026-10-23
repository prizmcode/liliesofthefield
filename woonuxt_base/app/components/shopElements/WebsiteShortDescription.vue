<script setup lang="ts">
const { description } = useAppConfig();
</script>

<template>
  <p class="mt-4 text-sm text-white xl:max-w-md">{{ description }}</p>
</template>
