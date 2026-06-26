"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Howl } from "howler";
import type { Track } from "./types";

export interface AudioState {
  /** Currently loaded track, or null. */
  track: Track | null;
  /** Whether audio is actively playing. */
  isPlaying: boolean;
  /** Whether the current preview is buffering/loading. */
  isLoading: boolean;
  /** Playback progress 0..1. */
  progress: number;
  /** Seconds elapsed. */
  elapsed: number;
  /** Total preview duration in seconds (previews are ~30s). */
  duration: number;
  /** True once the 30s preview has played to the end (until replay/next). */
  hasEnded: boolean;
}

const FADE_MS = 280;
const VOLUME = 0.9;

/** Tracks that can actually be previewed. */
const playable = (t: Track) => Boolean(t.previewUrl);

/**
 * Single-instance audio player built on Howler. Guarantees only one preview
 * plays at a time, crossfades between tracks, and exposes a small queue for
 * next/prev that automatically skips tracks without previews.
 */
export function useAudioPlayer() {
  const [state, setState] = useState<AudioState>({
    track: null,
    isPlaying: false,
    isLoading: false,
    progress: 0,
    elapsed: 0,
    duration: 30,
    hasEnded: false,
  });

  const howlRef = useRef<Howl | null>(null);
  const queueRef = useRef<Track[]>([]);
  const indexRef = useRef<number>(-1);
  const rafRef = useRef<number | null>(null);

  const stopRaf = () => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const tick = useCallback(() => {
    const howl = howlRef.current;
    if (!howl) return;
    const dur = howl.duration() || 30;
    const seek = (howl.seek() as number) || 0;
    setState((s) => ({
      ...s,
      elapsed: seek,
      duration: dur,
      progress: dur > 0 ? Math.min(1, seek / dur) : 0,
    }));
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  /** Tear down the active Howl, optionally with a quick fade. */
  const teardown = useCallback((fade: boolean) => {
    const prev = howlRef.current;
    howlRef.current = null;
    stopRaf();
    if (!prev) return;
    if (fade) {
      prev.fade(prev.volume(), 0, FADE_MS);
      prev.once("fade", () => prev.unload());
      // Safety net in case the fade event is missed.
      setTimeout(() => prev.unload(), FADE_MS + 120);
    } else {
      prev.unload();
    }
  }, []);

  const playByIndex = useCallback(
    (index: number) => {
      const queue = queueRef.current;
      if (index < 0 || index >= queue.length) return;
      const track = queue[index];
      if (!track || !track.previewUrl) return;

      indexRef.current = index;
      teardown(true);

      const howl = new Howl({
        src: [track.previewUrl],
        html5: true, // stream remote audio; start fast
        format: ["aac", "m4a", "mp4"],
        volume: 0,
        onplay: () => {
          stopRaf();
          rafRef.current = requestAnimationFrame(tick);
          setState((s) => ({
            ...s,
            isPlaying: true,
            isLoading: false,
            hasEnded: false,
          }));
          howl.fade(0, VOLUME, FADE_MS);
        },
        onpause: () => {
          stopRaf();
          setState((s) => ({ ...s, isPlaying: false }));
        },
        onend: () => {
          // Don't auto-advance: park on the finished track so the "hear the
          // full song" links are front-and-centre at the 30-second mark.
          stopRaf();
          setState((s) => ({
            ...s,
            isPlaying: false,
            progress: 1,
            hasEnded: true,
          }));
        },
        onloaderror: () =>
          setState((s) => ({ ...s, isLoading: false, isPlaying: false })),
        onplayerror: () => {
          // Mobile autoplay can reject; recover on the next user gesture.
          howl.once("unlock", () => howl.play());
        },
      });

      howlRef.current = howl;
      setState((s) => ({
        ...s,
        track,
        isLoading: true,
        isPlaying: false,
        progress: 0,
        elapsed: 0,
      }));
      howl.play();
    },
    [teardown, tick],
  );

  /** Start a track within (an optional) queue. Falls back to a single-item queue. */
  const play = useCallback(
    (track: Track, queue?: Track[]) => {
      const q = queue && queue.length ? queue : [track];
      queueRef.current = q;
      const idx = q.findIndex((t) => t.id === track.id);
      playByIndex(idx >= 0 ? idx : 0);
    },
    [playByIndex],
  );

  const toggle = useCallback(() => {
    const howl = howlRef.current;
    if (!howl) return;
    if (howl.playing()) howl.pause();
    else howl.play();
  }, []);

  const next = useCallback(() => {
    const q = queueRef.current;
    let i = indexRef.current + 1;
    while (i < q.length && !playable(q[i])) i++;
    if (i < q.length) playByIndex(i);
  }, [playByIndex]);

  const prev = useCallback(() => {
    const howl = howlRef.current;
    // If we're past the first couple seconds, restart current track first.
    if (howl && (howl.seek() as number) > 2.5) {
      howl.seek(0);
      return;
    }
    const q = queueRef.current;
    let i = indexRef.current - 1;
    while (i >= 0 && !playable(q[i])) i--;
    if (i >= 0) playByIndex(i);
  }, [playByIndex]);

  const seek = useCallback((fraction: number) => {
    const howl = howlRef.current;
    if (!howl) return;
    const dur = howl.duration() || 30;
    howl.seek(Math.max(0, Math.min(1, fraction)) * dur);
  }, []);

  const stop = useCallback(() => {
    teardown(true);
    setState((s) => ({ ...s, isPlaying: false, track: null, progress: 0 }));
  }, [teardown]);

  // Clean up on unmount.
  useEffect(() => {
    return () => {
      stopRaf();
      howlRef.current?.unload();
      howlRef.current = null;
    };
  }, []);

  return { state, play, toggle, next, prev, seek, stop };
}

export type AudioPlayer = ReturnType<typeof useAudioPlayer>;
