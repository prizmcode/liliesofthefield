interface IGMedia {
 id: string;
 caption?: string;
 media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
 media_url: string;
 thumbnail_url?: string;
 permalink: string;
 timestamp: string;
}

export default defineCachedEventHandler(
 async () => {
  const config = useRuntimeConfig();
  const token = config.instagramAccessToken;

  if (!token) {
   return { media: [] as IGMedia[] };
  }

  const url = new URL("https://graph.instagram.com/me/media");
  url.searchParams.set(
   "fields",
   "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp",
  );
  url.searchParams.set("limit", "12");
  url.searchParams.set("access_token", token);

  try {
   const res = await $fetch<{ data: IGMedia[] }>(url.toString());
   return { media: res.data ?? [] };
  } catch (err: unknown) {
   const e = err as {
    data?: { error?: { message?: string } };
    message?: string;
   };
   const detail = e?.data?.error?.message || e?.message || "Unknown";
   console.error("[instagram] fetch error:", detail);
   return { media: [] as IGMedia[] };
  }
 },
 {
  maxAge: 60 * 15,
  name: "instagram-feed",
  getKey: () => "latest-12",
 },
);
