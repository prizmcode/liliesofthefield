<script setup lang="ts">
import type { ProductCategory } from '#types/gql';

const { wishlistLink } = useAuth();
const runtimeConfig = useRuntimeConfig();
const img = useImage();
const logoUrl = runtimeConfig?.public?.LOGO ? img(runtimeConfig?.public?.LOGO) : null;
const faviconUrl = '/liliesofthefield.webp';

const { data } = await useAsyncGql('getProductCategories');
const productCategories = ((data.value?.productCategories?.nodes as ProductCategory[]) || []).filter(
  (category) => category.slug?.toLowerCase() !== 'uncategorized',
);
</script>

<template>
  <footer class="bg-white dark:bg-gray-800 order-last">
    <div class="container flex flex-wrap lg:flex-nowrap justify-between gap-12 mt-12 mb-24 md:gap-24">
      <div class="mr-auto">
        <div class="max-w-[300px] mx-auto">
          <NuxtLink to="/" class="flex h-full w-full items-center justify-center p-2">
            <img v-if="logoUrl" :src="logoUrl" alt="Logo" class="" />
            <div v-else class="flex items-center gap-2 text-lg font-bold">
              <img :src="faviconUrl" alt="Logo" />
            </div>
          </NuxtLink>
        </div>
        <div class="text-center"><WebsiteShortDescription /></div>
        <div class="flex gap-2 justify-center mt-8 mx-auto text-center">
          <ClientOnly>
            <ColorModeSwitcher />
          </ClientOnly>
        </div>
      </div>
      <div class="w-[42.857%] lg:w-auto">
        <div class="mb-1 font-semibold text-gray-900 dark:text-white">{{ $t('general.information') }}</div>
        <div class="text-sm text-gray-700 dark:text-gray-300">
          <ClientOnly>
            <NuxtLink to="/about" class="py-1.5 block">{{ $t('general.about') }}</NuxtLink>
            <template #fallback>
              <a href="/about" class="py-1.5 block">{{ $t('general.about') }}</a>
            </template>
          </ClientOnly>
          <ClientOnly>
            <NuxtLink to="/faq" class="py-1.5 block">FAQ's</NuxtLink>
            <template #fallback>
              <a href="/faq" class="py-1.5 block">FAQ's</a>
            </template>
          </ClientOnly>
        </div>
      </div>
      <div class="w-[42.857%] lg:w-auto">
        <div class="mb-1 font-semibold text-gray-900 dark:text-white">{{ $t('general.products') }}</div>
        <div class="text-sm text-gray-700 dark:text-gray-300">
          <ClientOnly>
            <NuxtLink
              v-for="category in productCategories"
              :key="category.slug || ''"
              :to="`/product-category/${decodeURIComponent(category.slug || '')}`"
              class="py-1.5 block capitalize"
              >{{ category.name }}</NuxtLink
            >
            <template #fallback>
              <a
                v-for="category in productCategories"
                :key="category.slug || ''"
                :href="`/product-category/${decodeURIComponent(category.slug || '')}`"
                class="py-1.5 block capitalize"
                >{{ category.name }}</a
              >
            </template>
          </ClientOnly>
          <NuxtLink to="/templates" class="py-1.5 block">Calligraphy Template<br />Generator</NuxtLink>
        </div>
      </div>
      <div class="w-[42.857%] lg:w-auto">
        <div class="mb-1 font-semibold text-gray-900 dark:text-white">{{ $t('general.customerService') }}</div>
        <div class="text-sm text-gray-700 dark:text-gray-300">
          <ClientOnly>
            <NuxtLink to="/contact" class="py-1.5 block">{{ $t('general.contactUs') }}</NuxtLink>
            <template #fallback>
              <a href="/contact" class="py-1.5 block">{{ $t('general.contactUs') }}</a>
            </template>
          </ClientOnly>
          <a href="/shipping-returns" class="py-1.5 block">{{ $t('general.shippingReturns') }}</a>
          <a href="/privacy-policy" class="py-1.5 block">{{ $t('general.privacyPolicy') }}</a>
          <a href="/terms-conditions" class="py-1.5 block">{{ $t('general.termsConditions') }}</a>
        </div>
      </div>
      <div class="w-[42.857%] lg:w-auto">
        <div class="mb-1 font-semibold text-gray-900 dark:text-white">{{ $t('account.myAccount') }}</div>
        <div class="text-sm text-gray-700 dark:text-gray-300">
          <ClientOnly>
            <NuxtLink to="/my-account/" class="py-1.5 block">{{ $t('account.myAccount') }}</NuxtLink>
            <template #fallback>
              <a href="/my-account/" class="py-1.5 block">{{ $t('account.myAccount') }}</a>
            </template>
          </ClientOnly>
          <ClientOnly>
            <NuxtLink to="/my-account/?tab=orders" class="py-1.5 block">{{ $t('shop.orderHistory') }}</NuxtLink>
            <template #fallback>
              <a href="/my-account/?tab=orders" class="py-1.5 block">{{ $t('shop.orderHistory') }}</a>
            </template>
          </ClientOnly>
          <ClientOnly>
            <NuxtLink :to="wishlistLink" class="py-1.5 block">{{ $t('shop.wishlist') }}</NuxtLink>
            <template #fallback>
              <a href="/wishlist" class="py-1.5 block">{{ $t('shop.wishlist') }}</a>
            </template>
          </ClientOnly>
          <a href="/" class="py-1.5 block">{{ $t('general.newsletter') }}</a>
        </div>
      </div>
    </div>
    <div class="bg-amber-900 text-center p-4 my-4 text-amber-300 uppercase text-xs">
      10% of all proceeds donated to <a href="https://www.atlasfree.org/" class="text-white!">Atlas Free</a>
    </div>
    <div class="container dark:border-gray-700 flex items-center justify-center mb-8">
      <div class="copywrite">
        <p class="py-4 text-xs text-center text-gray-400 dark:text-gray-400">
          Website Design & Development by <a href="https://prizmstudio.com" title="Prizm Studio">Prizm Studio</a>
        </p>
      </div>
      <SocialIcons class="ml-auto" />
    </div>
  </footer>
</template>

<style scoped>
a:hover {
  text-decoration: underline;
}
</style>
