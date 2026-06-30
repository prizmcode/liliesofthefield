<script setup lang="ts">
import type { Toast } from "../composables/useToast";

const { toasts, dismiss } = useToast();

function handleBodyClick(t: Toast): void {
 if (!t.onClick) return;
 t.onClick();
 dismiss(t.id);
}

function handleActionClick(t: Toast): void {
 t.action?.onClick?.();
 dismiss(t.id);
}
</script>

<template>
 <div
  class="fixed bottom-4 left-0 right-0 z-50 flex flex-col items-center gap-2 px-4 pointer-events-none"
  aria-live="polite"
  aria-atomic="true"
 >
  <TransitionGroup name="toast">
   <div
    v-for="t in toasts"
    :key="t.id"
    class="toast pointer-events-auto flex items-center gap-3 w-full max-w-xl rounded-lg shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 pl-3 pr-2 py-2"
    :class="{
     'border-l-4 border-l-green-500': t.type === 'success',
     'border-l-4 border-l-red-500': t.type === 'error',
     'border-l-4 border-l-primary': t.type === 'info',
    }"
    role="status"
   >
    <button
     type="button"
     class="flex flex-1 min-w-0 items-center gap-3 text-left cursor-pointer disabled:cursor-default"
     :disabled="!t.onClick"
     @click="handleBodyClick(t)"
    >
     <img
      v-if="t.image"
      :src="t.image"
      alt=""
      class="w-10 h-10 object-cover rounded shrink-0"
     />
     <div class="flex-1 min-w-0">
      <div
       v-if="t.title"
       class="text-sm font-semibold text-gray-900 dark:text-white truncate"
      >
       {{ t.title }}
      </div>
      <div class="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
       {{ t.message }}
      </div>
     </div>
    </button>

    <NuxtLink
     v-if="t.action?.href"
     :to="t.action.href"
     class="shrink-0 text-sm font-semibold text-primary hover:text-primary-dark whitespace-nowrap"
     @click="dismiss(t.id)"
    >
     {{ t.action.label }} →
    </NuxtLink>
    <button
     v-else-if="t.action"
     type="button"
     class="shrink-0 text-sm font-semibold text-primary hover:text-primary-dark whitespace-nowrap cursor-pointer"
     @click="handleActionClick(t)"
    >
     {{ t.action.label }}
    </button>

    <button
     type="button"
     class="shrink-0 p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer"
     aria-label="Dismiss notification"
     @click="dismiss(t.id)"
    >
     <svg
      xmlns="http://www.w3.org/2000/svg"
      class="w-4 h-4"
      viewBox="0 0 20 20"
      fill="currentColor"
     >
      <path
       fill-rule="evenodd"
       d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 011.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
       clip-rule="evenodd"
      />
     </svg>
    </button>
   </div>
  </TransitionGroup>
 </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
 transition:
  opacity 200ms ease,
  transform 200ms ease;
}
.toast-enter-from {
 opacity: 0;
 transform: translateY(16px);
}
.toast-leave-to {
 opacity: 0;
 transform: translateY(8px);
}
</style>
