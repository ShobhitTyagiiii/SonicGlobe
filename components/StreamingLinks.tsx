"use client";

import type { Track } from "@/lib/types";
import { buildStreamingLinks } from "@/lib/streamingLinks";

/** Spotify glyph. */
function SpotifyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-full w-full fill-current">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm4.59 14.43a.62.62 0 0 1-.86.21c-2.35-1.44-5.3-1.76-8.79-.96a.62.62 0 1 1-.28-1.21c3.81-.87 7.08-.5 9.72 1.11.3.18.39.57.21.85zm1.22-2.72a.78.78 0 0 1-1.07.26c-2.69-1.65-6.79-2.13-9.97-1.17a.78.78 0 1 1-.45-1.49c3.63-1.1 8.15-.56 11.24 1.33.37.22.49.7.25 1.07zm.11-2.84C14.8 8.16 9.4 7.99 6.3 8.93a.93.93 0 1 1-.54-1.78c3.56-1.08 9.52-.87 13.29 1.36a.93.93 0 0 1-.95 1.6z" />
    </svg>
  );
}

/** YouTube Music glyph (circle + play triangle). */
function YouTubeMusicIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-full w-full fill-current">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18.5A8.5 8.5 0 1 1 12 3.5a8.5 8.5 0 0 1 0 17zM9.75 8.2l6 3.8-6 3.8V8.2z" />
    </svg>
  );
}

/** Apple Music glyph (eighth note). */
function AppleMusicIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-full w-full fill-current">
      <path d="M17 3.2 9 5v9.07A3.2 3.2 0 1 0 11 17V8.6l4-.9V12a3.2 3.2 0 1 0 2 2.97V3.2z" />
    </svg>
  );
}

interface StreamingLinksProps {
  track: Track;
  /** Adds a soft accent glow + ring to draw the eye (used when a preview ends). */
  highlight?: boolean;
}

/**
 * "Hear the full song" links for the now-playing track. Icon-only buttons keep
 * the player compact; brand color appears on hover so the UI stays calm.
 */
export default function StreamingLinks({ track, highlight }: StreamingLinksProps) {
  const links = buildStreamingLinks(track);

  const items = [
    {
      key: "spotify",
      label: "Spotify",
      href: links.spotify,
      color: "#1DB954",
      Icon: SpotifyIcon,
    },
    {
      key: "ytm",
      label: "YouTube Music",
      href: links.youtubeMusic,
      color: "#FF3B30",
      Icon: YouTubeMusicIcon,
    },
    ...(links.appleMusic
      ? [
          {
            key: "apple",
            label: "Apple Music",
            href: links.appleMusic,
            color: "#FA2D48",
            Icon: AppleMusicIcon,
          },
        ]
      : []),
  ];

  return (
    <div className="flex items-center gap-1.5">
      {items.map(({ key, label, href, color, Icon }) => (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          title={`Hear the full track on ${label}`}
          aria-label={`Open "${track.title}" by ${track.artist} on ${label}`}
          className={`group flex h-8 w-8 items-center justify-center rounded-full border transition-all hover:scale-110 ${
            highlight
              ? "border-accent/40 bg-accent/10"
              : "border-white/10 bg-white/5 hover:bg-white/10"
          }`}
          style={
            highlight
              ? { boxShadow: "0 0 14px -3px rgba(56,232,255,0.5)" }
              : undefined
          }
        >
          <span
            className="h-4 w-4 text-white/65 transition-colors group-hover:text-[var(--brand)]"
            style={{ ["--brand" as string]: color }}
          >
            <Icon />
          </span>
        </a>
      ))}
    </div>
  );
}
