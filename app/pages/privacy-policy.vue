<script setup lang="ts">
useSeoMeta({
 title: "Privacy Policy",
 description:
  "How Lilies of the Field collects, uses, and protects your personal information.",
});

const lastUpdated = "October 22, 2026";
</script>

<template>
 <div class="container my-6 md:my-12">
  <article class="policy mx-auto max-w-2xl">
   <h1>Privacy Policy</h1>
   <p class="text-sm text-gray-500 dark:text-forest-400">
    Last updated {{ lastUpdated }}
   </p>

   <p>
    Lilies of the Field is a DBA of Prizm Studio, LLC ("we," "us," or "our").
    This policy explains what information we collect when you visit
    <a href="https://liliesofthefield.co">liliesofthefield.co</a>, shop with
    us, or get in touch, and how we use it. We only collect what we need to
    run the shop and fulfill your orders, and we never sell your personal
    information.
   </p>

   <h2>Information we collect</h2>

   <h3>When you place an order</h3>
   <p>
    We collect your name, email address, phone number, and billing and
    shipping addresses so we can process payment, ship your order, and send
    you order updates. Card payments are handled by Stripe. Your full card
    number goes directly to Stripe and is never stored on our site.
   </p>

   <h3>When you create an account</h3>
   <p>
    If you create an account, we store your name, email address, saved
    addresses, and order history so you can check out faster and re-download
    purchases. You can sign in with a password or with your Google account.
    If you use Google, we receive your name and email address from Google.
    We never receive your Google password.
   </p>

   <h3>Custom calligraphy templates</h3>
   <p>
    When you design a template with our template generator, the text and
    options you choose are used to create your PDF (and PNG, if selected).
    When you purchase a template, your design is saved with your order so you
    can download it again from your account. The download link in your
    order email expires after a limited time.
   </p>

   <h3>When you contact us</h3>
   <p>
    The contact form collects your name, email address, subject, and message.
    These are emailed to us so we can reply, and you'll receive an automatic
    confirmation email.
   </p>

   <h3>When you browse the site</h3>
   <p>
    We use Google Analytics to understand how visitors use the site, such as
    which pages are viewed, how you arrived, your browser and device type,
    and your approximate location (city or region). This helps us improve the
    shop. It does not tell us who you are.
   </p>

   <h2>Cookies and browser storage</h2>
   <p>We use a small number of cookies and browser storage items to:</p>
   <ul>
    <li>keep track of your shopping cart (<code>woocommerce-session</code>);</li>
    <li>keep you signed in to your account;</li>
    <li>remember your wishlist and your light or dark mode preference;</li>
    <li>measure site traffic with Google Analytics.</li>
   </ul>
   <p>
    You can clear or block cookies in your browser settings. If you do, your
    cart and sign-in will not persist between visits.
   </p>

   <h2>Who we share your information with</h2>
   <p>
    We share information only with the services that help us run the shop,
    and only what each one needs:
   </p>
   <ul>
    <li><strong>Stripe</strong> processes card payments.</li>
    <li>
     <strong>Google</strong> provides site analytics and, if you choose it,
     sign-in with Google.
    </li>
    <li>
     <strong>Twilio SendGrid</strong> delivers contact form messages and
     confirmation emails.
    </li>
    <li>
     <strong>Shipping carriers</strong> receive your name and shipping address
     to deliver physical orders.
    </li>
    <li>
     <strong>Our hosting and store providers</strong> store order and account
     data on our behalf.
    </li>
   </ul>
   <p>
    Our homepage shows recent posts from our Instagram account. Those images
    load from Instagram (Meta), which may receive your IP address and browser
    information under its own privacy policy.
   </p>
   <p>
    We may also disclose information if required by law. We do not sell,
    rent, or trade your personal information.
   </p>

   <h2>How long we keep your information</h2>
   <ul>
    <li>
     Order records are kept as long as needed for tax, accounting, and legal
     purposes.
    </li>
    <li>Account information is kept until you ask us to delete your account.</li>
    <li>
     Contact form messages are kept in our email for as long as they're
     useful for helping you.
    </li>
   </ul>

   <h2>Your choices</h2>
   <p>
    You can view and update your account details and addresses at any time
    in <NuxtLink to="/my-account">My Account</NuxtLink>. To request a copy of
    your personal information, or to have it corrected or deleted,
    <NuxtLink to="/contact">contact us</NuxtLink>. We may need to keep some
    information, such as order records, where the law requires it.
   </p>
   <p>
    To opt out of Google Analytics, you can use the
    <a href="https://tools.google.com/dlpage/gaoptout" rel="noopener"
     >Google Analytics opt-out browser add-on</a
    >
    or a content blocker.
   </p>

   <h2>Children's privacy</h2>
   <p>
    This site is not directed to children under 13, and we do not knowingly
    collect personal information from them.
   </p>

   <h2>Changes to this policy</h2>
   <p>
    If we update this policy, we'll post the new version here and change the
    date at the top.
   </p>

   <h2>Contact us</h2>
   <p>
    Questions about this policy or your information? Reach us through our
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
.policy h3 {
 @apply text-lg font-display text-gray-900 dark:text-white pt-4 pb-1;
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
.policy code {
 @apply text-sm;
}
</style>
