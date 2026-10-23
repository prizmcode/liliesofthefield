<script setup lang="ts">
useSeoMeta({
 title: "Shipping & Returns",
 description:
  "Shipping rates, delivery times, and the return policy for Lilies of the Field orders.",
});

const lastUpdated = "October 22, 2026";
</script>

<template>
 <div class="container my-6 md:my-12">
  <article class="policy mx-auto max-w-2xl">
   <h1>Shipping &amp; Returns</h1>
   <p class="text-sm text-gray-500 dark:text-forest-400">
    Last updated {{ lastUpdated }}
   </p>

   <h2>Processing times</h2>
   <p>
    Ready-made items usually ship within 3–5 business days. Every piece is
    packed carefully by hand to make sure it arrives safely.
   </p>
   <p>
    Custom commissions ship once they're finished. Most calligraphy
    commissions are completed within 2–3 weeks of confirmation, and original
    artwork and portraits typically take 4–6 weeks.
   </p>
   <p>
    Calligraphy templates are digital downloads, so nothing ships. You can
    download them right after purchase, from your order email or from
    <NuxtLink to="/my-account/?tab=orders">your account</NuxtLink>.
   </p>

   <h2>Shipping rates</h2>
   <p>
    Shipping is calculated at checkout based on your destination and the size
    of your package. You'll see the exact cost before you pay.
   </p>

   <h2>International orders</h2>
   <p>
    We ship internationally. Customs duties, import taxes, and fees charged
    by your country are not included in your order total. They are the
    buyer's responsibility and are usually collected on delivery.
   </p>

   <h2>Delivery</h2>
   <p>
    Delivery times depend on the carrier and your location and are
    estimates, not guarantees. Please double-check your shipping address at
    checkout. We can't be responsible for orders sent to an incorrect address
    entered at checkout.
   </p>

   <h2>Returns</h2>
   <ul>
    <li>
     <strong>Ready-made items</strong> can be returned within 14 days of
     delivery, unused and in their original condition and packaging.
    </li>
    <li>
     <strong>Custom and commissioned work</strong> can't be returned, because
     each piece is made specifically for you.
    </li>
    <li>
     <strong>Digital downloads</strong>, including calligraphy templates,
     can't be returned or refunded once they've been delivered.
    </li>
   </ul>

   <h3>How to start a return</h3>
   <ol>
    <li>
     <NuxtLink to="/contact">Contact us</NuxtLink> within 14 days of delivery
     with your order number and the item you'd like to return.
    </li>
    <li>We'll reply with the return address and instructions.</li>
    <li>
     Pack the item securely and send it back. Return shipping costs are your
     responsibility, and we recommend a tracked service.
    </li>
   </ol>
   <p>
    Once we receive and inspect the item, we'll refund the item price to
    your original payment method. Original shipping charges aren't
    refundable.
   </p>

   <h2>Damaged or incorrect orders</h2>
   <p>
    If your order arrives damaged, or you received the wrong item, please
    <NuxtLink to="/contact">contact us</NuxtLink> within 7 days of delivery
    with photos of the item and the packaging. We'll send a replacement or a
    full refund, and you won't pay for return shipping.
   </p>

   <h2>Questions</h2>
   <p>
    Have a question about your order? Reach us through our
    <NuxtLink to="/contact">contact page</NuxtLink>. You can also read our
    full <NuxtLink to="/terms-conditions">Terms &amp; Conditions</NuxtLink>.
   </p>
  </article>
 </div>
</template>

<style scoped>
@reference "#tailwind";

.policy {
 @apply leading-relaxed text-gray-700 dark:text-forest-200;
}
.policy h1 {
 @apply text-4xl md:text-5xl text-gray-900 dark:text-white pb-2;
}
.policy h2 {
 @apply text-2xl md:text-3xl text-gray-900 dark:text-white pt-8 pb-2;
}
.policy h3 {
 @apply text-lg font-display text-gray-900 dark:text-white pt-4 pb-1;
}
.policy p {
 @apply py-2;
}
.policy ul {
 @apply list-disc pl-6 py-2 space-y-1;
}
.policy ol {
 @apply list-decimal pl-6 py-2 space-y-1;
}
.policy a {
 @apply underline underline-offset-2 hover:text-primary;
}
</style>
