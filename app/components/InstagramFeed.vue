<script setup lang="ts">
interface IGMedia {
 id: string;
 caption?: string;
 media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
 media_url: string;
 thumbnail_url?: string;
 permalink: string;
 timestamp: string;
}

const { data, pending } = await useFetch<{ media: IGMedia[] }>(
 "/api/instagram",
 { default: () => ({ media: [] }) },
);

function imageUrl(m: IGMedia) {
 return m.media_type === "VIDEO" && m.thumbnail_url
  ? m.thumbnail_url
  : m.media_url;
}

function captionPreview(c?: string) {
 if (!c) return "";
 return c.length > 90 ? c.slice(0, 90).trim() + "…" : c;
}
</script>

<template>
 <section
  v-if="pending || data?.media?.length"
  class="container my-16 md:my-24"
 >
  <div class="mb-6 md:mb-8 text-center">
   <h2 class="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
    Follow on Instagram
   </h2>
   <a
    href="https://www.instagram.com/liliesofthefield.co"
    target="_blank"
    rel="noopener noreferrer"
    class="mt-1 inline-block text-sm text-gray-500 hover:text-primary"
   >
    @liliesofthefield.co
   </a>
  </div>
  <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
   <template v-if="pending">
    <div
     v-for="i in 12"
     :key="`skel-${i}`"
     class="aspect-square bg-gray-100 animate-pulse rounded"
    />
   </template>

   <a
    v-for="post in data?.media"
    v-else
    :key="post.id"
    :href="post.permalink"
    target="_blank"
    rel="noopener noreferrer"
    class="relative block aspect-square overflow-hidden bg-gray-100 rounded group"
   >
    <img
     :src="imageUrl(post)"
     :alt="post.caption || 'Instagram post'"
     loading="lazy"
     class="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
    />

    <span
     v-if="post.media_type === 'VIDEO'"
     class="absolute top-2 right-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-black/50 text-white"
     aria-label="Video"
    >
     <svg viewBox="0 0 24 24" class="w-3 h-3 fill-current">
      <path d="M8 5v14l11-7z" />
     </svg>
    </span>
    <span
     v-else-if="post.media_type === 'CAROUSEL_ALBUM'"
     class="absolute top-2 right-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-black/50 text-white"
     aria-label="Album"
    >
     <svg viewBox="0 0 24 24" class="w-3 h-3 fill-current">
      <path
       d="M19 3H8c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM4 7H2v13c0 1.1.9 2 2 2h13v-2H4V7z"
      />
     </svg>
    </span>

    <div
     class="absolute inset-0 flex items-end p-3 bg-linear-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
    >
     <p class="text-white text-xs leading-snug line-clamp-3">
      {{ captionPreview(post.caption) }}
     </p>
    </div>
   </a>
  </div>
 </section>
</template>
