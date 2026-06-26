// Shared domain types for Sonic Globe.

/** A country entry on the globe. */
export interface Country {
  /** ISO 3166-1 alpha-2 code, lowercase (also the Apple storefront code). */
  code: string;
  /** Display name. */
  name: string;
  /** Flag emoji. */
  flag: string;
  /** Centroid latitude. */
  lat: number;
  /** Centroid longitude. */
  lng: number;
}

/** A single track, merged from Apple RSS + iTunes lookup. */
export interface Track {
  /** Apple track id. */
  id: string;
  /** Chart rank (1-based). */
  rank: number;
  /** Song title. */
  title: string;
  /** Primary artist. */
  artist: string;
  /** 512px (or best available) artwork URL. */
  artwork: string;
  /** 30-second preview URL, or null when unavailable. */
  previewUrl: string | null;
  /** Apple Music web link. */
  url: string;
  /** Album / collection name when known. */
  album?: string;
  /** Primary genre when known. */
  genre?: string;
}

/** API response for a country's top tracks. */
export interface TopTracksResponse {
  country: string;
  /** Human-readable feed title from Apple. */
  title?: string;
  tracks: Track[];
  /** Set when the country has no usable data. */
  error?: string;
}
