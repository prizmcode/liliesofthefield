<script setup lang="ts">
useSeoMeta({
 title: "Terms & Conditions",
 description:
  "The terms that apply when you shop with or use the Lilies of the Field website.",
});

const lastUpdated = "October 22, 2026";
</script>

<template>
 <div class="container my-6 md:my-12">
  <article class="policy mx-auto max-w-2xl">
   <h1>Terms &amp; Conditions</h1>
   <p class="text-sm text-gray-500 dark:text-forest-400">
    Last updated {{ lastUpdated }}
   </p>

   <p>
    These terms apply to your use of
    <a href="https://liliesofthefield.co">liliesofthefield.co</a> and to any
    purchase you make from Lilies of the Field, a DBA of Prizm Studio, LLC
    ("we," "us," or "our"). By using the site or placing an order, you agree
    to these terms.
   </p>

   <h2>Orders and pricing</h2>
   <p>
    All prices are listed in U.S. dollars. We work to keep product details and
    prices accurate, but mistakes can happen. If an item is priced or
    described incorrectly, we may cancel the order and refund you in full. An
    order is accepted once we send your order confirmation email.
   </p>
   <p>
    Payment is due at checkout and is processed securely by Stripe.
   </p>

   <h2>Handmade work</h2>
   <p>
    Our pieces are made by hand, so small variations in color, texture, and
    lettering are part of their character and not defects. Product photos may
    look slightly different depending on your screen.
   </p>

   <h2>Custom commissions</h2>
   <p>
    For custom calligraphy, artwork, and portraits, we'll confirm the details,
    price, and timeline with you before starting. Most calligraphy
    commissions are completed within 2–3 weeks of confirmation. Original
    artwork and portraits typically take 4–6 weeks, depending on size,
    complexity, and reference materials. Please check names, dates, and
    spelling carefully, because we work from the text you approve.
   </p>

   <h2>Calligraphy templates</h2>
   <p>
    Templates from our template generator are digital downloads for your
    personal use, such as practicing, tracing, or making a gift. You may not
    resell, share, or redistribute the template files, or sell products made
    with them, without our written permission. Free previews include a
    watermark. Purchased templates can be downloaded again from your
    account.
   </p>

   <h2>Shipping</h2>
   <p>
    We ship within the U.S. and internationally. Shipping rates are
    calculated at checkout based on destination and package size. Delivery
    times are estimates and aren't guaranteed. International customers are
    responsible for any customs duties or import taxes.
   </p>

   <h2>Returns and refunds</h2>
   <ul>
    <li>
     <strong>Custom and commissioned work</strong> can't be returned, because
     each piece is made specifically for you.
    </li>
    <li>
     <strong>Digital downloads</strong>, including calligraphy templates,
     can't be returned or refunded once they've been delivered.
    </li>
    <li>
     <strong>Other items</strong> can be returned within 14 days of delivery
     in their original condition.
    </li>
   </ul>
   <p>
    If your order arrives damaged, please
    <NuxtLink to="/contact">contact us</NuxtLink> within 7 days of delivery
    with photos, and we'll make it right.
   </p>

   <h2>Your account</h2>
   <p>
    You're responsible for keeping your account sign-in details secure and
    for activity under your account. Please let us know right away if you
    think someone else has accessed it.
   </p>

   <h2>Intellectual property</h2>
   <p>
    All artwork, calligraphy, photos, text, and designs on this site belong
    to Lilies of the Field and are protected by copyright. Buying a physical
    piece gives you ownership of that piece, not the right to reproduce it.
    Please don't copy or use our work without written permission.
   </p>

   <h2>Limitation of liability</h2>
   <p>
    The site and our products are provided "as is." To the fullest extent
    allowed by law, we are not liable for any indirect or consequential
    damages arising from your use of the site or our products. Our total
    liability for any order is limited to the amount you paid for it.
   </p>

   <h2>Privacy</h2>
   <p>
    How we handle your personal information is explained in our
    <NuxtLink to="/privacy-policy">Privacy Policy</NuxtLink>.
   </p>

   <h2>Changes to these terms</h2>
   <p>
    We may update these terms from time to time. The version posted here
    when you place an order is the one that applies to that order.
   </p>

   <h2>Contact us</h2>
   <p>
    Questions about these terms? Reach us through our
    <NuxtLink to="/contact">contact page</NuxtLink>.
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
.policy p {
 @apply py-2;
}
.policy ul {
 @apply list-disc pl-6 py-2 space-y-1;
}
.policy a {
 @apply underline underline-offset-2 hover:text-primary;
}
</style>
