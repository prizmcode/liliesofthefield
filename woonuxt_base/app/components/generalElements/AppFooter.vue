<script setup lang="ts">
const { wooNuxtVersionInfo } = useHelpers();
const { wishlistLink } = useAuth();
</script>

<template>
  <footer class="bg-white dark:bg-gray-800 order-last">
    <div class="container flex flex-wrap justify-between gap-12 my-24 md:gap-24">
      <div class="mr-auto">
        <div class="max-w-[300px] mx-auto"><Logo /></div>
        <div class="text-center"><WebsiteShortDescription /></div>
        <div class="flex gap-2 justify-center mt-8 mx-auto text-center">
          <LangSwitcher />
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
            <NuxtLink to="/products" class="py-1.5 block">{{ $t('shop.newArrivals') }}</NuxtLink>
            <template #fallback>
              <a href="/products" class="py-1.5 block">{{ $t('shop.newArrivals') }}</a>
            </template>
          </ClientOnly>
          <ClientOnly>
            <NuxtLink to="/products?filter=sale[true]" class="py-1.5 block">{{ $t('shop.onSale') }}</NuxtLink>
            <template #fallback>
              <a href="/products?filter=sale[true]" class="py-1.5 block">{{ $t('shop.onSale') }}</a>
            </template>
          </ClientOnly>
          <ClientOnly>
            <NuxtLink to="/products?orderby=rating&order=ASC&filter=rating[1]" class="py-1.5 block">{{ $t('shop.topRated') }}</NuxtLink>
            <template #fallback>
              <a href="/products?orderby=rating&order=ASC&filter=rating[1]" class="py-1.5 block">{{ $t('shop.topRated') }}</a>
            </template>
          </ClientOnly>
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
    <div
      class="bg-linear-to-b from-gray-200 to-gray-300 text-center p-4 my-4 text-gray-400 uppercase dark:text-white dark:from-gray-600 dark:to-gray-800 text-sm md:text-base">
      10% of all proceeds donated to <a href="https://www.atlasfree.org/">Atlas Free</a>
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
