<script setup>
const { updateItemQuantity } = useCart();
const { addToWishlist } = useWishlist();
const { FALLBACK_IMG } = useHelpers();
const { storeSettings } = useAppConfig();
const runtimeConfig = useRuntimeConfig();

const { item } = defineProps({
 item: { type: Object, required: true },
});

const TEMPLATE_VARIATION_PDF_ONLY = Number(
 runtimeConfig.public.templateVariationPdfOnly,
);
const TEMPLATE_VARIATION_PDF_AND_PNG = Number(
 runtimeConfig.public.templateVariationPdfAndPng,
);

const productType = computed(() =>
 item.variation ? item.variation?.node : item.product?.node,
);
const productSlug = computed(
 () => `/product/${decodeURIComponent(item.product.node.slug)}`,
);
const isLowStock = computed(() =>
 productType.value.stockQuantity
  ? productType.value.lowStockAmount >= productType.value.stockQuantity
  : false,
);
const imgScr = computed(
 () =>
  productType.value.image?.cartSourceUrl ||
  productType.value.image?.sourceUrl ||
  item.product.image?.sourceUrl ||
  FALLBACK_IMG,
);
const regularPrice = computed(() =>
 parseFloat(productType.value.rawRegularPrice),
);
const salePrice = computed(() => parseFloat(productType.value.rawSalePrice));
const salePercentage = computed(
 () =>
  Math.round(
   ((regularPrice.value - salePrice.value) / regularPrice.value) * 100,
  ) + "%",
);
const isOptimisticItem = computed(() =>
 String(item.key || "").startsWith("optimistic:"),
);

// The customer's saved template design travels on the cart item's extraData
// (calligraphy_svg). When present, it is shown as the line-item thumbnail in
// place of the generic product image.
const designSvg = computed(() => {
 const entry = item.extraData?.find((d) => d.key === "calligraphy_svg");
 const svg = entry?.value;
 return typeof svg === "string" && svg.trim().startsWith("<svg") ? svg : null;
});

// When the item carries saved template settings, link back to the generator so
// the customer can reopen and re-edit their design instead of the product page.
const restoreLink = computed(() => {
 const entry = item.extraData?.find((d) => d.key === "calligraphy_settings");
 const settings = entry?.value;
 if (typeof settings !== "string" || !settings.trim()) return null;
 return `/templates?restore=${encodeURIComponent(settings)}`;
});
const itemLink = computed(() => restoreLink.value || productSlug.value);

// A readable summary of the template settings the customer chose, parsed from
// the cart item's extraData (calligraphy_settings). Shown below the product
// name so the cart reflects the specific design that was added.
const customizations = computed(() => {
 const entry = item.extraData?.find((d) => d.key === "calligraphy_settings");
 const raw = entry?.value;
 if (typeof raw !== "string" || !raw.trim()) return [];
 let s;
 try {
  s = JSON.parse(raw);
 } catch {
  return [];
 }
 if (!s || typeof s !== "object") return [];
 const num = (v) => (typeof v === "number" && Number.isFinite(v) ? v : null);
 const list = [];
 const push = (label, value) => {
  if (value !== null && value !== undefined && value !== "") list.push({ label, value });
 };
 push("Margin", num(s.margin) !== null ? `${s.margin}mm` : null);
 push("Lines", s.autoFill ? "Auto-fill" : num(s.numLines));
 push("Ascender", num(s.ascenderH) !== null ? `${s.ascenderH}mm` : null);
 push("x-height", num(s.xHeight) !== null ? `${s.xHeight}mm` : null);
 push("Descender", num(s.descenderH) !== null ? `${s.descenderH}mm` : null);
 push("Line gap", num(s.lineGap) !== null ? `${s.lineGap}mm` : null);
 if (s.showSlant) {
  push("Slant", num(s.slantAngle) !== null ? `${s.slantAngle}°` : "On");
  push("Slant spacing", num(s.slantSpacing) !== null ? `${s.slantSpacing}mm` : null);
 }
 push("Center line", s.showCenterLine ? "On" : null);
 return list;
});

// Which download variant was purchased — the purchased variation id is the
// source of truth, falling back to the extraData flag in case the variation
// id is ever unavailable (e.g. the parent product ID was passed instead).
const templateVariantLabel = computed(() => {
 const variationId = Number(item.variation?.node?.databaseId);
 if (variationId === TEMPLATE_VARIATION_PDF_AND_PNG) return "PDF + Transparent PNG";
 if (variationId === TEMPLATE_VARIATION_PDF_ONLY) return "PDF Only";
 const flag = item.extraData?.find((d) => d.key === "calligraphy_include_png");
 if (!flag) return null;
 return ["1", "true", "yes"].includes(
  String(flag.value ?? "").trim().toLowerCase(),
 )
  ? "PDF + Transparent PNG"
  : "PDF Only";
});

const removeItem = () => {
 if (isOptimisticItem.value) return;
 updateItemQuantity(item.key, 0);
};

const moveToWishList = () => {
 addToWishlist(item.product.node);
 removeItem();
};
</script>

<template>
 <SwipeCard :disabled="isOptimisticItem" @remove="removeItem">
  <div v-if="productType" class="flex items-center gap-3 group">
   <NuxtLink :to="itemLink">
    <div
     v-if="designSvg"
     class="w-16 h-16 rounded-md bg-white p-1 border border-gray-200 dark:border-gray-700 overflow-hidden [&>svg]:w-full [&>svg]:h-full"
     :title="productType.name"
     v-html="designSvg"
    />
    <NuxtImg
     v-else
     width="64"
     height="64"
     class="w-16 h-16 rounded-md skeleton"
     :src="imgScr"
     :alt="productType.image?.altText || productType.name"
     :title="productType.image?.title || productType.name"
     loading="lazy"
    />
   </NuxtLink>
   <div class="flex-1">
    <div class="flex gap-x-2 gap-y-1 flex-wrap items-center">
     <NuxtLink
      class="leading-tight line-clamp-2 text-gray-900 dark:text-gray-100 hover:text-primary dark:hover:text-primary"
      :to="itemLink"
      >{{ productType.name }}</NuxtLink
     >
     <span
      v-if="productType.salePrice"
      class="text-[10px] border-green-200 dark:border-green-800 leading-none bg-green-100 dark:bg-green-900/30 inline-block p-0.5 rounded-sm text-green-600 dark:text-green-400 border"
     >
      Save {{ salePercentage }}
     </span>
     <span
      v-if="isLowStock"
      class="text-[10px] border-yellow-200 dark:border-yellow-800 leading-none bg-yellow-100 dark:bg-yellow-900/30 inline-block p-0.5 rounded-sm text-orange-500 dark:text-orange-400 border"
     >
      Low Stock
     </span>
    </div>
    <p
     v-if="templateVariantLabel"
     class="text-xs font-bold leading-tight text-gray-600 dark:text-gray-300"
    >
     {{ templateVariantLabel }}
    </p>
    <ul
     v-if="customizations.length"
     class="mt-0.5 text-[11px] leading-tight text-gray-500 dark:text-gray-400"
    >
     <li v-for="c in customizations" :key="c.label" class="flex gap-1">
      <span class="text-gray-400 dark:text-gray-500">{{ c.label }}:</span>
      <span class="text-gray-600 dark:text-gray-300">{{ c.value }}</span>
     </li>
    </ul>
    <ProductPrice
     class="mt-1 text-xs"
     :sale-price="productType.salePrice"
     :regular-price="productType.regularPrice"
    />
    <CalligraphyLineItemMeta
     v-if="item.calligraphy"
     :calligraphy="item.calligraphy"
     compact
    />
   </div>
   <div class="inline-flex gap-2 flex-col items-end">
    <QuantityInput :item />
    <div
     class="text-xs text-gray-400 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 flex leading-none items-center"
    >
     <button
      v-if="storeSettings.showMoveToWishlist"
      class="mr-2 pr-2 border-r border-gray-300 dark:border-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
      :disabled="isOptimisticItem"
      @click="moveToWishList"
      type="button"
     >
      Move to Wishlist
     </button>
     <button
      title="Remove Item"
      aria-label="Remove Item"
      @click="removeItem"
      type="button"
      :disabled="isOptimisticItem"
      class="flex items-center gap-1 hover:text-red-500 dark:hover:text-red-400 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
     >
      <Icon name="ion:trash" class="hidden md:inline-block" size="12" />
     </button>
    </div>
   </div>
  </div>
 </SwipeCard>
</template>
