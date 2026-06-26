import type { Track } from "./types";

export interface StreamingLinks {
  /** Apple Music — a real deep link straight from the chart feed. */
  appleMusic?: string;
  /** Spotify search (no API key/OAuth needed). */
  spotify: string;
  /** YouTube Music search (no API key needed). */
  youtubeMusic: string;
}

/**
 * Build "hear the full song" links for a track. Apple Music is an exact deep
 * link (provided by the RSS feed); Spotify and YouTube Music are search deep
 * links — key-less and reliable, landing the listener on the track to play in
 * full once the 30-second preview ends.
 */
export function buildStreamingLinks(track: Track): StreamingLinks {
  const query = encodeURIComponent(`${track.title} ${track.artist}`);
  return {
    appleMusic: track.url || undefined,
    spotify: `https://open.spotify.com/search/${query}`,
    youtubeMusic: `https://music.youtube.com/search?q=${query}`,
  };
}
