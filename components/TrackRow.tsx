"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import type { Track } from "@/lib/types";
import Equalizer from "./Equalizer";

interface TrackRowProps {
  track: Track;
  isActive: boolean;
  isPlaying: boolean;
  onPlay: (track: Track) => void;
}

// Entrance variant — parent staggers these in sequence.
const rowVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

function TrackRowBase({ track, isActive, isPlaying, onPlay }: TrackRowProps) {
  const hasPreview = Boolean(track.previewUrl);

  return (
    <motion.button
      type="button"
      variants={rowVariants}
      onClick={() => hasPreview && onPlay(track)}
      disabled={!hasPreview}
      whileHover={hasPreview ? { x: 4 } : undefined}
      whileTap={hasPreview ? { scale: 0.99 } : undefined}
      aria-label={`Play ${track.title} by ${track.artist}`}
      className={`group flex w-full items-center gap-3 rounded-2xl px-2.5 py-2 text-left transition-colors ${
        isActive
          ? "bg-accent/10 ring-1 ring-accent/40"
          : "hover:bg-white/[0.06]"
      } ${hasPreview ? "" : "cursor-not-allowed opacity-55"}`}
    >
      {/* Rank */}
      <div className="w-6 shrink-0 text-center">
        {isActive ? (
          <div className="mx-auto flex h-4 items-end justify-center">
            <Equalizer active={isPlaying} bars={4} />
          </div>
        ) : (
          <span
            className={`font-display text-sm font-semibold tabular-nums ${
              track.rank <= 3 ? "text-accent" : "text-white/40"
            }`}
          >
            {track.rank}
          </span>
        )}
      </div>

      {/* Album art */}
      <div className="relative shrink-0">
        <motion.div
          whileHover={hasPreview ? { scale: 1.06, rotate: -1.5 } : undefined}
          transition={{ type: "spring", stiffness: 320, damping: 18 }}
          className="relative h-12 w-12 overflow-hidden rounded-xl"
          style={{
            boxShadow: isActive
              ? "0 0 22px -4px rgba(56,232,255,0.7)"
              : "0 4px 14px -6px rgba(0,0,0,0.6)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={track.artwork}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
            draggable={false}
          />
          {isActive && (
            <div className="absolute inset-0 ring-1 ring-inset ring-accent/60" />
          )}
        </motion.div>
        {/* Play overlay on hover */}
        {hasPreview && !isActive && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40 opacity-0 backdrop-blur-[1px] transition-opacity group-hover:opacity-100">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white drop-shadow">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        )}
      </div>

      {/* Title + artist */}
      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-sm font-semibold ${
            isActive ? "text-accent-soft" : "text-white"
          }`}
        >
          {track.title}
        </p>
        <p className="truncate text-xs text-white/55">{track.artist}</p>
      </div>

      {/* Right-side hint */}
      <div className="shrink-0 pr-1">
        {!hasPreview ? (
          <span className="text-[10px] font-medium uppercase tracking-wide text-white/30">
            No preview
          </span>
        ) : isActive ? (
          <span className="text-[10px] font-semibold uppercase tracking-wide text-accent">
            {isPlaying ? "Playing" : "Paused"}
          </span>
        ) : null}
      </div>
    </motion.button>
  );
}

export default memo(TrackRowBase);
