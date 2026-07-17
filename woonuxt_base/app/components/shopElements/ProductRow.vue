<script setup>
const props = defineProps({
  products: { type: Array, default: null },
});
</script>

<template>
  <div v-if="products" class="flex justify-center gap-2 md:gap-3">
    <ProductCard
      v-for="(node, i) in products"
      :key="node.databaseId"
      class="flex-1 min-w-0"
      :node="node"
      :index="i"
      :class="{
        hidden: i === products.length - 1,
        'lg:block': i === products.length - 1,
      }" />
  </div>
</template>
