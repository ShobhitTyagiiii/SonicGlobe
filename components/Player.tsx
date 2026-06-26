"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { AudioState } from "@/lib/useAudioPlayer";
import Equalizer from "./Equalizer";
import StreamingLinks from "./StreamingLinks";

const NOTES = ["♪", "♫", "♬", "♩", "♪"];

interface PlayerProps {
  state: AudioState;
  isMobile: boolean;
  onToggle: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (fraction: number) => void;
  onClose: () => void;
}

function fmt(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) seconds = 0;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Sleek floating mini-player: album art with glow, animated equalizer,
 * transport controls and a scrubable progress bar. Crossfades are handled
 * upstream in the audio hook; here we just reflect + control state.
 */
export default function Player({
  state,
  isMobile,
  onToggle,
  onNext,
  onPrev,
  onSeek,
  onClose,
}: PlayerProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { track, isPlaying, isLoading, progress, elapsed, duration, hasEnded } =
    state;

  // Cursor-tracked 3D tilt on the album art.
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const onArtMove = (e: React.PointerEvent) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ rx: -py * 16, ry: px * 16 });
  };
  const resetTilt = () => setTilt({ rx: 0, ry: 0 });

  // Musical-note burst whenever a new track starts.
  const [burst, setBurst] = useState(0);
  useEffect(() => {
    if (track && isPlaying && !reduce) setBurst((b) => b + 1);
  }, [track?.id, isPlaying, reduce]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleScrub = (clientX: number) => {
    const el = barRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    onSeek((clientX - rect.left) / rect.width);
  };

  return (
    <AnimatePresence>
      {track && (
        <motion.div
          key="player"
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 280, damping: 26 }}
          className={
            isMobile
              ? "glass-strong np-aura fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 rounded-2xl p-3"
              : "glass-strong np-aura fixed bottom-6 left-6 z-40 w-[380px] max-w-[calc(100vw-3rem)] rounded-2xl p-3.5"
          }
        >
          <div className="flex items-center gap-3">
            {/* Album art with dynamic glow, cursor tilt + note burst */}
            <div
              className="relative shrink-0"
              style={{ perspective: 500 }}
              onPointerMove={onArtMove}
              onPointerLeave={resetTilt}
            >
              <div
                className="absolute -inset-1.5 rounded-2xl opacity-80 blur-md"
                style={{
                  background:
                    "radial-gradient(circle, rgba(var(--np-color), 0.6), transparent 70%)",
                  animation: isPlaying
                    ? "pulse-glow 2.4s ease-in-out infinite"
                    : "none",
                }}
              />
              <div
                className="relative h-14 w-14 transition-transform duration-150 ease-out"
                style={{
                  transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
                  transformStyle: "preserve-3d",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={track.artwork}
                  alt=""
                  className="h-14 w-14 rounded-xl object-cover"
                  draggable={false}
                />
                <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/15" />
                {/* Glare */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-xl"
                  style={{
                    background: `linear-gradient(${
                      125 + tilt.ry * 3
                    }deg, rgba(255,255,255,0.28), transparent 45%)`,
                  }}
                />
              </div>

              {/* Floating musical notes on play */}
              {burst > 0 && !reduce && (
                <div key={burst} className="pointer-events-none absolute inset-0">
                  {NOTES.map((n, i) => (
                    <span
                      key={i}
                      className="absolute left-1/2 top-1 text-sm"
                      style={
                        {
                          color: "rgba(var(--np-color), 0.9)",
                          ["--nx" as string]: `${(i - 2) * 14}px`,
                          ["--nr" as string]: `${(i - 2) * 18}deg`,
                          animation: `note-float ${1.5 + i * 0.12}s ease-out ${
                            i * 0.08
                          }s forwards`,
                          opacity: 0,
                        } as React.CSSProperties
                      }
                    >
                      {n}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Meta + equalizer */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="h-3.5 w-6 shrink-0">
                  <Equalizer active={isPlaying} bars={4} />
                </div>
                <p className="truncate text-sm font-semibold text-white">
                  {track.title}
                </p>
              </div>
              <p className="mt-0.5 truncate text-xs text-white/55">
                {track.artist}
              </p>
            </div>

            {/* Transport controls */}
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={onPrev}
                aria-label="Previous track"
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                </svg>
              </button>

              <motion.button
                type="button"
                onClick={onToggle}
                whileTap={{ scale: 0.9 }}
                aria-label={isPlaying ? "Pause" : hasEnded ? "Replay preview" : "Play"}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-void shadow-glow transition-transform"
              >
                {isLoading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-void/40 border-t-void" />
                ) : isPlaying ? (
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                    <path d="M6 5h4v14H6zm8 0h4v14h-4z" />
                  </svg>
                ) : hasEnded ? (
                  // Replay the preview from the start
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                    <path d="M12 5V2L7 7l5 5V8a4 4 0 1 1-4 4H6a6 6 0 1 0 6-7z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-5 w-5 translate-x-[1px] fill-current">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </motion.button>

              <button
                type="button"
                onClick={onNext}
                aria-label="Next track"
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                  <path d="M16 6h2v12h-2zM6 6l8.5 6L6 18z" />
                </svg>
              </button>

              <button
                type="button"
                onClick={onClose}
                aria-label="Stop and close player"
                className="ml-0.5 flex h-8 w-8 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/10 hover:text-white"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 stroke-current" fill="none" strokeWidth={2} strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Progress bar (scrubable) */}
          <div className="mt-3 flex items-center gap-2">
            <span className="w-8 text-right text-[10px] tabular-nums text-white/45">
              {fmt(elapsed)}
            </span>
            <div
              ref={barRef}
              onClick={(e) => handleScrub(e.clientX)}
              className="group relative h-2 flex-1 cursor-pointer"
            >
              <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-white/12" />
              <div
                className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-accent"
                style={{ width: `${progress * 100}%`, boxShadow: "0 0 10px rgba(56,232,255,0.7)" }}
              />
              <div
                className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 shadow-glow transition-opacity group-hover:opacity-100"
                style={{ left: `${progress * 100}%` }}
              />
            </div>
            <span className="w-8 text-[10px] tabular-nums text-white/45">
              {fmt(duration)}
            </span>
          </div>

          {/* "Hear the full song" — always available, spotlit when the
              30-second preview has ended. */}
          <div className="mt-2.5 flex items-center justify-between gap-2">
            <AnimatePresence mode="wait" initial={false}>
              {hasEnded ? (
                <motion.span
                  key="ended"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex items-center gap-1.5 text-[11px] font-semibold text-accent"
                >
                  <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                  Preview ended — hear it in full
                </motion.span>
              ) : (
                <motion.span
                  key="hint"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[11px] font-medium uppercase tracking-wide text-white/35"
                >
                  Full song
                </motion.span>
              )}
            </AnimatePresence>
            <StreamingLinks track={track} highlight={hasEnded} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
