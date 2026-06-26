"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import type { GlobeHandle, HoverInfo } from "@/components/GlobeScene";
import type { Country, Track, TopTracksResponse } from "@/lib/types";
import {
  COUNTRIES,
  COUNTRY_BY_CODE,
  getCountry,
  randomCountry,
} from "@/lib/countries";
import { useAudioPlayer } from "@/lib/useAudioPlayer";
import { useIsMobile } from "@/lib/useMediaQuery";

import StarField from "@/components/StarField";
import TopBar from "@/components/TopBar";
import SpinButton from "@/components/SpinButton";
import MusicPanel from "@/components/MusicPanel";
import Player from "@/components/Player";
import LoadingScreen from "@/components/LoadingScreen";

// The globe is heavy + needs the DOM — load it client-only.
const GlobeScene = dynamic(() => import("@/components/GlobeScene"), {
  ssr: false,
  loading: () => null,
});

export default function Home() {
  const isMobile = useIsMobile();
  const player = useAudioPlayer();

  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [data, setData] = useState<TopTracksResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [globeReady, setGlobeReady] = useState(false);
  const [loaderDone, setLoaderDone] = useState(false);
  const [hovered, setHovered] = useState<HoverInfo | null>(null);

  // Refs for use inside async / imperative code paths.
  const globeHandle = useRef<GlobeHandle | null>(null);
  const cacheRef = useRef<Map<string, TopTracksResponse>>(new Map());
  const reqIdRef = useRef(0);
  const globeReadyRef = useRef(false);
  const selectedCodeRef = useRef<string | null>(null);
  const pendingFlyRef = useRef<Country | null>(null);

  const selectedCountry = useMemo(
    () => (selectedCode ? getCountry(selectedCode) ?? null : null),
    [selectedCode],
  );

  // ---- URL state helpers ----
  const updateUrl = useCallback((code: string | null) => {
    const url = new URL(window.location.href);
    if (code) url.searchParams.set("c", code);
    else url.searchParams.delete("c");
    window.history.replaceState({}, "", url.toString());
  }, []);

  // ---- Camera fly-to (defers until the globe is ready) ----
  const flyToCountry = useCallback((country: Country, dramatic: boolean) => {
    if (globeReadyRef.current && globeHandle.current) {
      globeHandle.current.flyTo(country.lat, country.lng, { dramatic });
    } else {
      pendingFlyRef.current = country;
    }
  }, []);

  // ---- Data fetching with session cache + stale-response guarding ----
  const fetchCountry = useCallback(
    async (code: string): Promise<TopTracksResponse | null> => {
      const cached = cacheRef.current.get(code);
      if (cached) {
        setData(cached);
        setError(cached.error ?? null);
        setLoading(false);
        return cached;
      }

      const reqId = ++reqIdRef.current;
      setLoading(true);
      setError(null);
      setData(null);

      try {
        const res = await fetch(`/api/top/${code}`);
        const json = (await res.json()) as TopTracksResponse;
        if (reqId !== reqIdRef.current) return null; // a newer request won
        cacheRef.current.set(code, json);
        setData(json);
        setError(json.error ?? null);
        setLoading(false);
        return json;
      } catch {
        if (reqId !== reqIdRef.current) return null;
        setLoading(false);
        setError("Something went wrong loading this country.");
        return null;
      }
    },
    [],
  );

  // ---- Select a country (from globe click, URL, or spin) ----
  const selectCountry = useCallback(
    async (
      code: string,
      opts: { dramatic?: boolean; autoplay?: boolean } = {},
    ) => {
      const country = getCountry(code);
      if (!country) return;

      setSelectedCode(country.code);
      selectedCodeRef.current = country.code;
      updateUrl(country.code);
      flyToCountry(country, opts.dramatic ?? false);

      const result = await fetchCountry(country.code);
      if (opts.autoplay && result) {
        const first = result.tracks.find((t) => t.previewUrl);
        if (first) player.play(first, result.tracks);
      }
    },
    [updateUrl, flyToCountry, fetchCountry, player],
  );

  // ---- Globe ready: flush any pending deep-link fly-to + dismiss loader ----
  const handleGlobeReady = useCallback(() => {
    globeReadyRef.current = true;
    setGlobeReady(true);
    if (pendingFlyRef.current) {
      const c = pendingFlyRef.current;
      pendingFlyRef.current = null;
      globeHandle.current?.flyTo(c.lat, c.lng, { dramatic: false });
    }
  }, []);

  // Dismiss the loading screen shortly after the globe is interactive.
  useEffect(() => {
    if (!globeReady) return;
    const t = setTimeout(() => setLoaderDone(true), 500);
    return () => clearTimeout(t);
  }, [globeReady]);

  // ---- Deep-link: read ?c= on first mount ----
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("c");
    const country = getCountry(code);
    if (country) {
      setSelectedCode(country.code);
      selectedCodeRef.current = country.code;
      pendingFlyRef.current = country;
      void fetchCountry(country.code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Handlers ----
  const handleSelect = useCallback(
    (code: string) => {
      void selectCountry(code);
    },
    [selectCountry],
  );

  const handleSpin = useCallback(() => {
    if (spinning) return;
    const next = randomCountry(selectedCodeRef.current ?? undefined);
    setSpinning(true);
    void selectCountry(next.code, { dramatic: true, autoplay: true }).finally(
      () => {
        // Keep the spinning label through the camera swoop.
        setTimeout(() => setSpinning(false), 700);
      },
    );
  }, [spinning, selectCountry]);

  const handleClosePanel = useCallback(() => {
    setSelectedCode(null);
    selectedCodeRef.current = null;
    updateUrl(null);
  }, [updateUrl]);

  const handlePlay = useCallback(
    (track: Track, queue: Track[]) => {
      player.play(track, queue);
    },
    [player],
  );

  const handleRetry = useCallback(() => {
    if (!selectedCode) return;
    cacheRef.current.delete(selectedCode);
    void fetchCountry(selectedCode);
  }, [selectedCode, fetchCountry]);

  const activeTrackId = player.state.track?.id ?? null;

  return (
    <main className="relative h-[100dvh] w-full overflow-hidden">
      {/* Backdrop layers */}
      <div className="app-backdrop" />
      <StarField />

      {/* Globe */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: globeReady ? 1 : 0, scale: globeReady ? 1 : 0.92 }}
        transition={{ duration: 1.1, ease: "easeOut" }}
        className="absolute inset-0 z-[2]"
      >
        <GlobeScene
          countries={COUNTRIES}
          selectedCode={selectedCode}
          onSelect={handleSelect}
          onHover={setHovered}
          onReady={handleGlobeReady}
          handleRef={globeHandle}
        />
      </motion.div>

      {/* Top-left wordmark */}
      <div className="pointer-events-none absolute left-5 top-5 z-20 sm:left-8 sm:top-7">
        <TopBar />
      </div>

      {/* Spin button — top-right (kept clear of the wordmark on phones) */}
      <div className="absolute right-4 top-4 z-20 sm:right-8 sm:top-7">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
        >
          <SpinButton onSpin={handleSpin} spinning={spinning} />
        </motion.div>
      </div>

      {/* Hovered-country HUD (desktop) — names the country under the cursor */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            key={hovered.code}
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 360, damping: 26 }}
            className="pointer-events-none absolute left-1/2 top-5 z-20 hidden -translate-x-1/2 md:block"
          >
            <div className="glass flex items-center gap-3 rounded-2xl px-5 py-2.5 shadow-glass">
              {COUNTRY_BY_CODE[hovered.code]?.flag && (
                <span className="text-3xl drop-shadow">
                  {COUNTRY_BY_CODE[hovered.code].flag}
                </span>
              )}
              <div className="leading-tight">
                <p className="font-display text-lg font-bold text-white">
                  {COUNTRY_BY_CODE[hovered.code]?.name ?? hovered.name}
                </p>
                <p
                  className={`text-[11px] font-semibold uppercase tracking-wide ${
                    hovered.supported ? "text-accent" : "text-white/40"
                  }`}
                >
                  {hovered.supported
                    ? "Click to hear top songs"
                    : "No charts available"}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint when nothing is selected */}
      {!selectedCountry && globeReady && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="pointer-events-none absolute bottom-7 left-1/2 z-10 -translate-x-1/2 text-center text-xs font-medium text-white/40"
        >
          Hover to explore · tap a glowing country to hear its top songs
        </motion.p>
      )}

      {/* Music panel */}
      <MusicPanel
        country={selectedCountry}
        data={data}
        loading={loading}
        error={error}
        isMobile={isMobile}
        activeTrackId={activeTrackId}
        isPlaying={player.state.isPlaying}
        onPlay={handlePlay}
        onClose={handleClosePanel}
        onRetry={handleRetry}
      />

      {/* Mini player */}
      <Player
        state={player.state}
        isMobile={isMobile}
        onToggle={player.toggle}
        onNext={player.next}
        onPrev={player.prev}
        onSeek={player.seek}
        onClose={player.stop}
      />

      {/* Intro loading screen */}
      <LoadingScreen show={!loaderDone} />
    </main>
  );
}
