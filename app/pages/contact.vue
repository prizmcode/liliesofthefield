<script setup lang="ts">
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
 isSubmitting.value = true;
 try {
  await $fetch("/api/contact", {
   method: "POST",
   body: { ...form },
  });
  submitted.value = true;
 } catch (err: any) {
  errorMessage.value =
   err?.statusMessage ||
   err?.data?.statusMessage ||
   "Something went wrong. Please try again.";
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
