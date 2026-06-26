import type { Track, TopTracksResponse } from "./types";
import { COUNTRY_BY_CODE } from "./countries";

/**
 * Server-side data layer. Merges two free, key-less Apple endpoints:
 *  1. Marketing RSS "most-played" feed  -> ranked songs + artwork + links
 *  2. iTunes Lookup (batched by track id) -> 30s previewUrl + richer metadata
 *
 * Everything here runs only inside Route Handlers, so the browser never sees
 * CORS issues and never holds Apple URLs directly.
 */

const RSS_BASE = "https://rss.applemarketingtools.com/api/v2";
const ITUNES_LOOKUP = "https://itunes.apple.com/lookup";

/** Cache window (seconds) for upstream fetches + the route itself. */
export const REVALIDATE_SECONDS = 60 * 60; // 1 hour

/** Raw shape of an Apple RSS feed entry (only fields we use). */
interface RssEntry {
  id: string;
  name: string;
  artistName: string;
  artworkUrl100?: string;
  url: string;
  genres?: { name: string }[];
}

/** Raw shape of an iTunes lookup result (only fields we use). */
interface LookupResult {
  trackId?: number;
  collectionId?: number;
  previewUrl?: string;
  artworkUrl100?: string;
  collectionName?: string;
  primaryGenreName?: string;
}

/** Upgrade an Apple artwork URL (…/100x100bb.jpg) to a crisp 512px version. */
function upgradeArtwork(url: string | undefined, size = 512): string {
  if (!url) return "";
  return url.replace(/\/\d+x\d+bb/, `/${size}x${size}bb`);
}

/**
 * Fetch JSON with a per-attempt timeout, Next.js cache hints, and a couple of
 * retries — so a single transient hiccup (cold start, brief Apple blip) never
 * surfaces as an error to the user.
 */
async function fetchJson<T>(url: string, attempts = 3): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
        next: { revalidate: REVALIDATE_SECONDS },
      });
      if (!res.ok) throw new Error(`Upstream ${res.status} for ${url}`);
      return (await res.json()) as T;
    } catch (e) {
      lastErr = e;
      if (i < attempts - 1) {
        await new Promise((r) => setTimeout(r, 300 * (i + 1)));
      }
    } finally {
      clearTimeout(timeout);
    }
  }
  throw lastErr;
}

/**
 * Batch-resolve preview URLs + metadata for a set of track ids in ONE request.
 * Returns a map keyed by id. Failures degrade gracefully to an empty map.
 */
async function lookupPreviews(
  ids: string[],
  country: string,
): Promise<Map<string, LookupResult>> {
  const map = new Map<string, LookupResult>();
  if (ids.length === 0) return map;

  const url = `${ITUNES_LOOKUP}?id=${ids.join(",")}&country=${country}&entity=song&limit=200`;
  try {
    const data = await fetchJson<{ results: LookupResult[] }>(url);
    for (const r of data.results ?? []) {
      const key = String(r.trackId ?? r.collectionId ?? "");
      if (key) map.set(key, r);
    }
  } catch {
    // Previews are an enhancement — never let a lookup failure break the feed.
  }
  return map;
}

/**
 * Get the top tracks for a country, merged + enriched.
 * `code` must be a known storefront; callers should validate first.
 */
export async function getTopTracks(code: string): Promise<TopTracksResponse> {
  const country = code.toLowerCase();

  let feed: { title?: string; results?: RssEntry[] };
  try {
    const data = await fetchJson<{
      feed?: { title?: string; results?: RssEntry[] };
    }>(`${RSS_BASE}/${country}/music/most-played/25/songs.json`);
    feed = data.feed ?? {};
  } catch {
    return {
      country,
      tracks: [],
      error: "We couldn't reach Apple's charts for this country right now.",
    };
  }

  const entries = feed.results ?? [];
  if (entries.length === 0) {
    return {
      country,
      title: feed.title,
      tracks: [],
      error: "No chart data is available for this country yet.",
    };
  }

  // One batched lookup for all 25 ids.
  const previews = await lookupPreviews(
    entries.map((e) => e.id),
    country,
  );

  const tracks: Track[] = entries.map((entry, i) => {
    const extra = previews.get(entry.id);
    const artwork =
      upgradeArtwork(extra?.artworkUrl100) ||
      upgradeArtwork(entry.artworkUrl100) ||
      entry.artworkUrl100 ||
      "";
    return {
      id: entry.id,
      rank: i + 1,
      title: entry.name,
      artist: entry.artistName,
      artwork,
      previewUrl: extra?.previewUrl ?? null,
      url: entry.url,
      album: extra?.collectionName,
      genre: extra?.primaryGenreName ?? entry.genres?.[0]?.name,
    };
  });

  return { country, title: feed.title, tracks };
}

/** Whether a code is a supported storefront. */
export function isSupportedCountry(code: string): boolean {
  return Boolean(COUNTRY_BY_CODE[code.toLowerCase()]);
}
