<script setup lang="ts">
const { isShowingSearch } = useSearching();
</script>

<template>
  <header class="sticky top-0 z-40 bg-white dark:bg-gray-800 shadow-sm shadow-gray-200 dark:shadow-gray-900 border-b border-transparent dark:border-gray-700">
    <div class="container flex items-center justify-center py-4">
      <MenuTrigger class="lg:hidden" />
      <div class="flex items-center ml-14 sm:ml-0">
        <Logo class="w-40 md:w-50" />
      </div>
      <MainMenu class="justify-items-end hidden gap-6 text-sm text-gray-500 dark:text-gray-400 lg:flex flex-1 lg:px-4 ml-auto" />
      <div class="flex justify-end items-center md:w-40 md:flex-1 ml-auto gap-4 md:gap-6">
        <ProductSearch class="hidden sm:inline-flex max-w-80 w-[40%]" />
        <SearchTrigger />
        <div class="flex gap-4 items-center">
          <SignInLink />
          <CartTrigger />
        </div>
      </div>
    </div>
    <Transition name="scale-y" mode="out-in">
      <div class="container mb-3 -mt-1 sm:hidden" v-if="isShowingSearch">
        <ProductSearch class="flex w-full" />
      </div>
    </Transition>
  </header>
</template>
