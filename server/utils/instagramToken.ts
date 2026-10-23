import { createHash } from "node:crypto";

// Instagram long-lived tokens expire 60 days after they're issued or last
// refreshed, and can only be refreshed once they're at least 24 hours old.
// We keep the latest token in Nitro's `data` storage (.data/kv on the server)
// and swap it for a fresh one weekly, so it never reaches its expiry as long
// as the feed is requested now and then.
//
// The token from runtime config (INSTAGRAM_ACCESS_TOKEN) only seeds the store.
// We remember a hash of it, so setting a new one in the environment replaces
// whatever was stored.

const STORAGE_KEY = "instagram:token";
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const REFRESH_EVERY = 7 * DAY;
const RETRY_AFTER_FAILURE = 6 * HOUR;

interface StoredToken {
 token: string;
 seedHash: string;
 expiresAt: number | null;
 nextRefreshAt: number;
}

interface RefreshResponse {
 access_token: string;
 expires_in: number;
}

let pending: Promise<string | null> | null = null;

const hash = (value: string) =>
 createHash("sha256").update(value).digest("hex");

async function resolveToken(): Promise<string | null> {
 const seed = useRuntimeConfig().instagramAccessToken as string;
 const storage = useStorage("data");
 let stored = await storage.getItem<StoredToken>(STORAGE_KEY);

 if (seed && stored?.seedHash !== hash(seed)) {
  // New token from the environment: start over from it. It may have just been
  // issued, so wait a day before the first refresh.
  stored = {
   token: seed,
   seedHash: hash(seed),
   expiresAt: null,
   nextRefreshAt: Date.now() + DAY,
  };
  await storage.setItem(STORAGE_KEY, stored);
 }

 if (!stored) return null;
 if (Date.now() < stored.nextRefreshAt) return stored.token;

 const url = new URL("https://graph.instagram.com/refresh_access_token");
 url.searchParams.set("grant_type", "ig_refresh_token");
 url.searchParams.set("access_token", stored.token);

 try {
  const res = await $fetch<RefreshResponse>(url.toString());
  stored = {
   ...stored,
   token: res.access_token,
   expiresAt: Date.now() + res.expires_in * 1000,
   nextRefreshAt: Date.now() + REFRESH_EVERY,
  };
  console.info(
   `[instagram] token refreshed, expires ${new Date(stored.expiresAt!).toISOString()}`,
  );
 } catch (err: unknown) {
  const e = err as { data?: { error?: { message?: string } }; message?: string };
  console.error(
   "[instagram] token refresh failed:",
   e?.data?.error?.message || e?.message || "Unknown",
  );
  stored = { ...stored, nextRefreshAt: Date.now() + RETRY_AFTER_FAILURE };
 }

 await storage.setItem(STORAGE_KEY, stored);
 return stored.token;
}

/** Current Instagram access token, refreshed automatically when due. */
export function getInstagramToken(): Promise<string | null> {
 // Concurrent requests share one lookup so the token is only refreshed once.
 pending ??= resolveToken().finally(() => {
  pending = null;
 });
 return pending;
}
