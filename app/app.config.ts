/**
 * User-layer app config.
 * Overrides values from `woonuxt_base/app/app.config.ts` via Nuxt's app config merging.
 * Only specify the keys you want to change.
 */
export default defineAppConfig({
 logoUrl: "/images/lilies-logo-colored.png",
 darkLogoUrl: "/images/lilies-logo-dark.png",
 // Navbar-only logo (footer keeps logoUrl)
 navLogoUrl: "/images/lilies-logo.jpg",
 //logoUrl: "/images/liliesofthefield.webp",
 storeSettings: {
  // Set to `true` to re-enable star ratings, the reviews tab, the rating filter,
  // and the "Sort by rating" option site-wide.
  showReviews: false,
 },
});
