<script setup lang="ts">
const route = useRoute();
const isDebug = computed(() => route.query.debug !== undefined);

interface DebugInfo {
 ok: boolean;
 keys: Record<string, boolean>;
 nodeEnv: string;
 timestamp: string;
}
const debugInfo = ref<DebugInfo | null>(null);
const debugError = ref("");

const loadDebug = async () => {
 try {
  debugInfo.value = await $fetch<DebugInfo>("/api/contact/debug");
 } catch (err: any) {
  debugError.value =
   err?.statusMessage || err?.message || "Failed to load debug info.";
 }
};
if (isDebug.value) loadDebug();

const form = reactive({
 name: "",
 email: "",
 subject: "",
 message: "",
 company: "", // honeypot
});

const isSubmitting = ref(false);
const submitted = ref(false);
const errorMessage = ref("");
const lastErrorStatus = ref<number | null>(null);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isValid = computed(
 () =>
  form.name.trim().length > 0 &&
  EMAIL_RE.test(form.email.trim()) &&
  form.message.trim().length > 0,
);

const handleSubmit = async () => {
 if (!isValid.value || isSubmitting.value) return;
 errorMessage.value = "";
 lastErrorStatus.value = null;
 isSubmitting.value = true;
 try {
  await $fetch("/api/contact", {
   method: "POST",
   body: { ...form },
  });
  submitted.value = true;
 } catch (err: any) {
  lastErrorStatus.value = err?.statusCode || err?.response?.status || null;
  errorMessage.value =
   err?.statusMessage ||
   err?.data?.statusMessage ||
   "Something went wrong. Please try again.";
  if (isDebug.value) loadDebug();
 } finally {
  isSubmitting.value = false;
 }
};

useSeoMeta({
 title: "Contact",
 description: "Get in touch with Lilies of the Field.",
});
</script>

<template>
 <div class="container my-12 max-w-2xl">
  <h1 class="mb-2 text-5xl font-display">Contact</h1>
  <p class="mb-8 text-gray-600 dark:text-gray-300">
   Have a question or commission in mind? Send us a message and we'll get back
   to you within 1–2 business days.
  </p>

  <!-- Debug panel: only shown when ?debug is in the URL -->
  <div
   v-if="isDebug"
   class="mb-8 p-4 border border-yellow-300 bg-yellow-50 text-yellow-900 rounded-lg text-sm font-mono dark:bg-yellow-900/20 dark:border-yellow-700 dark:text-yellow-100"
  >
   <div class="flex items-center justify-between mb-2">
    <strong class="font-bold">Contact form debug</strong>
    <button type="button" class="underline cursor-pointer" @click="loadDebug">
     Refresh
    </button>
   </div>
   <div v-if="debugError" class="text-red-600 dark:text-red-400">
    Debug endpoint error: {{ debugError }}
   </div>
   <div v-else-if="debugInfo">
    <div>
     Overall:
     <span
      :class="
       debugInfo.ok
        ? 'text-green-700 dark:text-green-400'
        : 'text-red-700 dark:text-red-400'
      "
     >
      {{
       debugInfo.ok ? "✓ all required env vars are set" : "✗ missing env vars"
      }}
     </span>
    </div>
    <div>NODE_ENV: {{ debugInfo.nodeEnv }}</div>
    <div>Server time: {{ debugInfo.timestamp }}</div>
    <ul class="mt-2">
     <li v-for="(present, key) in debugInfo.keys" :key="key">
      <span
       :class="
        present
         ? 'text-green-700 dark:text-green-400'
         : 'text-red-700 dark:text-red-400'
       "
       >{{ present ? "✓" : "✗" }}</span
      >
      {{ key }}
     </li>
    </ul>
    <div v-if="lastErrorStatus" class="mt-2">
     Last submit error status: <strong>{{ lastErrorStatus }}</strong>
    </div>
   </div>
   <div v-else>Loading…</div>
  </div>

  <div
   v-if="submitted"
   class="p-6 border border-green-200 bg-green-50 text-green-900 rounded-lg dark:bg-green-900/20 dark:border-green-700 dark:text-green-100"
  >
   <h2 class="text-xl font-semibold mb-2 font-display text-4xl">Thank you!</h2>
   <p>
    Your message has been sent. We've also emailed you a confirmation — please
    check your inbox.
   </p>
  </div>

  <form
   v-else
   class="wn-form grid gap-4"
   novalidate
   @submit.prevent="handleSubmit"
  >
   <!-- Honeypot: hidden from users, visible to bots -->
   <div class="hidden" aria-hidden="true">
    <label>
     Company
     <input
      v-model="form.company"
      type="text"
      tabindex="-1"
      autocomplete="off"
     />
    </label>
   </div>

   <div>
    <label for="contact-name">Name <span class="text-red-500">*</span></label>
    <input
     id="contact-name"
     v-model="form.name"
     type="text"
     required
     maxlength="200"
     autocomplete="name"
    />
   </div>

   <div>
    <label for="contact-email">Email <span class="text-red-500">*</span></label>
    <input
     id="contact-email"
     v-model="form.email"
     type="email"
     required
     maxlength="200"
     autocomplete="email"
    />
   </div>

   <div>
    <label for="contact-subject">Subject</label>
    <input
     id="contact-subject"
     v-model="form.subject"
     type="text"
     maxlength="200"
    />
   </div>

   <div>
    <label for="contact-message"
     >Message <span class="text-red-500">*</span></label
    >
    <textarea
     id="contact-message"
     v-model="form.message"
     rows="6"
     required
     maxlength="5000"
    />
   </div>

   <div v-if="errorMessage" class="text-sm text-red-600 dark:text-red-400">
    {{ errorMessage }}
   </div>

   <div class="flex justify-end">
    <Button
     type="submit"
     :loading="isSubmitting"
     :disabled="!isValid || isSubmitting"
    >
     {{ isSubmitting ? "Sending…" : "Send Message" }}
    </Button>
   </div>
  </form>
 </div>
</template>
