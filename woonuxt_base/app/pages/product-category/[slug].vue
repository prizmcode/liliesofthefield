<script setup lang="ts">
import type { Product, ProductCategory } from '#types/gql';

const { setProducts, updateProductList } = useProducts();
const { isQueryEmpty } = useHelpers();
const { storeSettings } = useAppConfig();
const route = useRoute();
const slug = route.params.slug;

const { data } = await useAsyncGql('getProducts', { slug });
const productsInCategory = (data.value?.products?.nodes || []) as Product[];
setProducts(productsInCategory);

const { data: categoryData } = await useAsyncGql('getProductCategories');
const categoryName = computed(() => {
  const categories = (categoryData.value?.productCategories?.nodes || []) as ProductCategory[];
  const match = categories.find((category) => category.slug === slug);
  return match?.name || String(slug).replace(/-/g, ' ');
});

onMounted(() => {
  if (!isQueryEmpty.value) updateProductList();
});

watch(
  () => route.query,
  () => {
    if (route.name !== 'product-category-slug') return;
    updateProductList();
  },
);

useHead({
  title: categoryName,
  meta: [{ name: 'description', content: categoryName }],
});
</script>

<template>
  <main>
    <div class="container mt-6 md:mt-12">
      <h1 class="capitalize">{{ categoryName }}</h1>
    </div>
    <div class="container flex items-start gap-16" v-if="productsInCategory.length">
      <Filters v-if="storeSettings.showFilters" :hide-categories="true" />

      <div class="w-full">
        <div class="flex items-center justify-between w-full gap-4 md:gap-8">
          <ProductResultCount />
          <OrderByDropdown class="hidden md:inline-flex" v-if="storeSettings.showOrderByDropdown" />
          <ShowFilterTrigger v-if="storeSettings.showFilters" class="md:hidden" />
        </div>
        <ProductGrid />
      </div>
    </div>
  </main>
</template>
