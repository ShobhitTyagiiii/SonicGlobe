"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Country, Track, TopTracksResponse } from "@/lib/types";
import TrackRow from "./TrackRow";

interface MusicPanelProps {
  country: Country | null;
  data: TopTracksResponse | null;
  loading: boolean;
  error: string | null;
  isMobile: boolean;
  activeTrackId: string | null;
  isPlaying: boolean;
  onPlay: (track: Track, queue: Track[]) => void;
  onClose: () => void;
  onRetry: () => void;
}

// Container that staggers its children (the track rows) into view.
const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045, delayChildren: 0.05 } },
};

function LoadingRows() {
  return (
    <div className="space-y-2 px-2">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-2.5 py-2">
          <div className="h-4 w-4 rounded skeleton" />
          <div className="h-12 w-12 rounded-xl skeleton" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-2/3 rounded skeleton" />
            <div className="h-2.5 w-1/3 rounded skeleton" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-8 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-3xl">
        🎧
      </div>
      <p className="text-sm leading-relaxed text-white/60">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-xs font-semibold text-accent transition-colors hover:bg-accent/20"
      >
        Try again
      </button>
    </div>
  );
}

/**
 * The music panel. Right-docked glass panel on desktop, draggable bottom sheet
 * on mobile. Shows the Top 25 tracks with a staggered entrance, plus graceful
 * loading / empty / error states.
 */
export default function MusicPanel({
  country,
  data,
  loading,
  error,
  isMobile,
  activeTrackId,
  isPlaying,
  onPlay,
  onClose,
  onRetry,
}: MusicPanelProps) {
  const open = Boolean(country);
  const tracks = data?.tracks ?? [];

  // Slide in from the right on desktop, up from the bottom on mobile.
  const initial = isMobile ? { y: "100%" } : { x: "110%", opacity: 0 };
  const animate = isMobile ? { y: 0 } : { x: 0, opacity: 1 };
  const exit = isMobile ? { y: "100%" } : { x: "110%", opacity: 0 };

  return (
    <AnimatePresence>
      {open && country && (
        <motion.aside
          key="panel"
          initial={initial}
          animate={animate}
          exit={exit}
          transition={{ type: "spring", stiffness: 260, damping: 30 }}
          drag={isMobile ? "y" : false}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.6 }}
          onDragEnd={(_, info) => {
            if (info.offset.y > 130 || info.velocity.y > 600) onClose();
          }}
          className={
            isMobile
              ? "glass-strong glass-edge fixed inset-x-0 bottom-0 z-30 flex max-h-[64vh] flex-col overflow-hidden rounded-t-3xl shadow-glass"
              : "glass-strong glass-edge fixed inset-y-0 right-0 z-30 flex w-[400px] max-w-[90vw] flex-col overflow-hidden shadow-glass"
          }
          style={{ touchAction: isMobile ? "none" : undefined }}
        >
          {/* Mobile grab handle */}
          {isMobile && (
            <div className="flex justify-center pt-3">
              <div className="h-1.5 w-12 rounded-full bg-white/25" />
            </div>
          )}

          {/* Header */}
          <header className="relative flex items-center gap-3 px-5 pb-4 pt-5">
            <motion.span
              key={country.code}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 18 }}
              className="text-4xl drop-shadow"
            >
              {country.flag}
            </motion.span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-accent/80">
                Top Songs
              </p>
              <h2 className="truncate font-display text-xl font-bold text-white">
                {country.name}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close panel"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 stroke-current" fill="none" strokeWidth={2} strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </header>

          {/* Body (extra bottom padding on mobile so the floating player
              never hides the last rows) */}
          <div
            className={`scroll-fade min-h-0 flex-1 overflow-y-auto ${
              isMobile && activeTrackId ? "pb-28" : "pb-6"
            }`}
          >
            {loading ? (
              <LoadingRows />
            ) : error ? (
              <EmptyState message={error} onRetry={onRetry} />
            ) : tracks.length === 0 ? (
              <EmptyState
                message="No tracks found for this country right now."
                onRetry={onRetry}
              />
            ) : (
              <motion.ul
                key={country.code}
                variants={listVariants}
                initial="hidden"
                animate="show"
                className="space-y-1 px-3"
              >
                {tracks.map((track) => (
                  <li key={track.id}>
                    <TrackRow
                      track={track}
                      isActive={activeTrackId === track.id}
                      isPlaying={isPlaying && activeTrackId === track.id}
                      onPlay={(t) => onPlay(t, tracks)}
                    />
                  </li>
                ))}
              </motion.ul>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
