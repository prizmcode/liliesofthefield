import { createResolver } from "@nuxt/kit";

const { resolve } = createResolver(import.meta.url);

export default defineNuxtConfig({
 // Get all the pages, components, composables and plugins from the parent theme
 extends: ["./woonuxt_base"],

 components: [
  { path: resolve("./app/components"), pathPrefix: false, priority: 10 },
 ],

 modules: ["nuxt-gtag"],

 gtag: {
  id: "G-L4PCRT3MWR",
 },

 runtimeConfig: {
  instagramAccessToken: process.env.INSTAGRAM_ACCESS_TOKEN || "",
  templateProductId: process.env.TEMPLATE_PRODUCT_ID || "",
  templateAdminSecret: process.env.TEMPLATE_ADMIN_SECRET || "",
  public: {
   templateProductId: process.env.TEMPLATE_PRODUCT_ID || "",
  },
 },

 /**
  * Depending on your servers capabilities, you may need to adjust the following settings.
  * It will affect the build time but also increase the reliability of the build process.
  * If you have a server with a lot of memory and CPU, you can remove the following settings.
  * @property {number} concurrency - How many pages to prerender at once
  * @property {number} interval - How long to wait between prerendering pages
  * @property {boolean} failOnError - This stops the build from failing but the page will not be statically generated
  */
 nitro: {
  prerender: {
   concurrency: 10,
   interval: 1000,
   failOnError: false,
  },
 },
 vite: {
  optimizeDeps: {
   include: [
    "@vue/devtools-core",
    "@vue/devtools-kit",
    "tailwind-merge",
    "@vueuse/core",
   ],
  },
 },
});
