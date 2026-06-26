"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Globe, { type GlobeMethods } from "react-globe.gl";
import { useReducedMotion } from "framer-motion";
import type { Country } from "@/lib/types";

export interface GlobeHandle {
  /** Fly the camera to a coordinate, optionally with a dramatic swoop. */
  flyTo: (
    lat: number,
    lng: number,
    opts?: { altitude?: number; ms?: number; dramatic?: boolean },
  ) => void;
}

/** What the globe reports to the parent when a country is hovered. */
export interface HoverInfo {
  code: string;
  name: string;
  supported: boolean;
}

/** A trimmed country-boundary feature from public/data/world-countries.json. */
interface CountryFeature {
  type: "Feature";
  properties: { code: string; name: string; supported: boolean };
  geometry: { type: string; coordinates: unknown };
}

interface GlobeSceneProps {
  countries: Country[];
  selectedCode: string | null;
  onSelect: (code: string) => void;
  onHover: (info: HoverInfo | null) => void;
  onReady: () => void;
  /** Now-playing accent as an "r, g, b" triplet (drives arcs + selection glow). */
  accentTriplet?: string;
  /** True while a preview is playing — makes the selected country pulse/pop. */
  playing?: boolean;
  /**
   * Receives the imperative handle. Passed as a plain ref object (not a React
   * ref) because next/dynamic does not forward refs to lazily-loaded children.
   */
  handleRef?: React.MutableRefObject<GlobeHandle | null>;
}

interface ArcDatum {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: [string, string];
  speed: number;
}

const ACCENT = "#38e8ff";
const ACCENT_SOFT = "#7af3ff";
const FOCUS_ALTITUDE = 1.6;
const HOME_ALTITUDE = 2.5;

// Polygon paint — supported countries glow cyan; the hovered/selected one
// lifts and brightens. Unsupported countries are faint, non-interactive plates.
const CAP_HOVER = "rgba(56, 232, 255, 0.40)";
const CAP_SUPPORTED = "rgba(56, 232, 255, 0.13)";
const CAP_UNSUPPORTED = "rgba(255, 255, 255, 0.035)";
const SIDE_SUPPORTED = "rgba(56, 232, 255, 0.22)";
const SIDE_UNSUPPORTED = "rgba(120, 140, 170, 0.10)";
const STROKE_ACTIVE = "rgba(122, 243, 255, 0.95)";
const STROKE_SUPPORTED = "rgba(56, 232, 255, 0.45)";
const STROKE_UNSUPPORTED = "rgba(255, 255, 255, 0.10)";

/**
 * The 3D globe. Loaded only on the client (via dynamic import with ssr:false).
 *
 * Whole countries are clickable: real boundary polygons glow, lift on hover,
 * and report their name to the parent HUD. Two storefronts too small for the
 * 110m boundaries (Hong Kong, Singapore) fall back to glowing dots. The camera
 * flies smoothly to a country on selection and a ring pulses over it.
 */
export default function GlobeScene({
  countries,
  selectedCode,
  onSelect,
  onHover,
  onReady,
  handleRef,
  accentTriplet = "56, 232, 255",
  playing = false,
}: GlobeSceneProps) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const [size, setSize] = useState({ width: 0, height: 0 });
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);
  const [polygons, setPolygons] = useState<CountryFeature[] | null>(null);
  const [polyError, setPolyError] = useState(false);
  const [beat, setBeat] = useState(false);

  const interactingRef = useRef(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Heartbeat that drives the selected country's pulse while a song plays.
  useEffect(() => {
    if (!playing || reduce) {
      setBeat(false);
      return;
    }
    const id = setInterval(() => setBeat((b) => !b), 480);
    return () => clearInterval(id);
  }, [playing, reduce]);

  // ---- Load country boundaries ----
  useEffect(() => {
    let cancelled = false;
    fetch("/data/world-countries.json")
      .then((r) => r.json())
      .then((gj: { features: CountryFeature[] }) => {
        if (!cancelled) setPolygons(gj.features);
      })
      .catch(() => {
        if (!cancelled) setPolyError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Storefronts that have a boundary polygon; the rest fall back to dots.
  const polygonCodes = useMemo(
    () =>
      new Set(
        (polygons ?? [])
          .filter((f) => f.properties.supported)
          .map((f) => f.properties.code),
      ),
    [polygons],
  );

  // Dots: only the supported storefronts without a polygon (e.g. hk, sg).
  // If boundaries fail to load entirely, fall back to dots for everything.
  const dots = useMemo<Country[]>(() => {
    if (polyError) return countries;
    if (!polygons) return [];
    return countries.filter((c) => !polygonCodes.has(c.code));
  }, [polyError, polygons, polygonCodes, countries]);

  // ---- Responsive sizing ----
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setSize({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ---- Imperative fly-to ----
  const flyTo = useCallback<GlobeHandle["flyTo"]>(
    (lat, lng, opts) => {
      const g = globeRef.current;
      if (!g) return;
      const altitude = opts?.altitude ?? FOCUS_ALTITUDE;
      const ms = reduce ? 0 : opts?.ms ?? 1200;

      if (opts?.dramatic && !reduce) {
        g.pointOfView({ altitude: 3.1 }, 360);
        window.setTimeout(
          () => g.pointOfView({ lat, lng, altitude }, 1400),
          380,
        );
      } else {
        g.pointOfView({ lat, lng, altitude }, ms);
      }
    },
    [reduce],
  );

  useEffect(() => {
    if (!handleRef) return;
    handleRef.current = { flyTo };
    return () => {
      handleRef.current = null;
    };
  }, [handleRef, flyTo]);

  // ---- Auto-rotation: on unless hovering / dragging / a country is focused ----
  const updateAutoRotate = useCallback(() => {
    const g = globeRef.current;
    if (!g) return;
    const controls = g.controls();
    if (!controls) return;
    controls.autoRotate =
      !reduce && !selectedCode && !hoveredCode && !interactingRef.current;
  }, [reduce, selectedCode, hoveredCode]);

  useEffect(() => {
    updateAutoRotate();
  }, [updateAutoRotate]);

  // ---- One-time globe configuration once it's ready ----
  const handleReady = useCallback(() => {
    const g = globeRef.current;
    if (!g) return;
    const controls = g.controls();
    if (controls) {
      controls.enableDamping = true;
      controls.dampingFactor = 0.12;
      controls.rotateSpeed = 0.55;
      controls.autoRotate = !reduce;
      controls.autoRotateSpeed = 0.32;
      controls.minDistance = 180;
      controls.maxDistance = 600;
      controls.enablePan = false;

      const onStart = () => {
        interactingRef.current = true;
        if (resumeTimer.current) clearTimeout(resumeTimer.current);
        updateAutoRotate();
      };
      const onEnd = () => {
        interactingRef.current = false;
        if (resumeTimer.current) clearTimeout(resumeTimer.current);
        resumeTimer.current = setTimeout(updateAutoRotate, 2500);
      };
      controls.addEventListener("start", onStart);
      controls.addEventListener("end", onEnd);
    }

    g.pointOfView({ lat: 20, lng: 0, altitude: HOME_ALTITUDE }, 0);
    onReady();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onReady, reduce]);

  // ---- Polygon visual accessors ----
  const polygonAltitude = useCallback(
    (d: object) => {
      const p = (d as CountryFeature).properties;
      if (!p.supported) return 0.006;
      if (p.code === selectedCode) {
        // Big, breathing pop-out while a song plays.
        if (playing) return beat ? 0.34 : 0.2;
        return 0.16;
      }
      if (p.code === hoveredCode) return 0.085;
      return 0.012;
    },
    [selectedCode, hoveredCode, playing, beat],
  );

  const polygonCapColor = useCallback(
    (d: object) => {
      const p = (d as CountryFeature).properties;
      if (!p.supported) return CAP_UNSUPPORTED;
      if (p.code === selectedCode) return `rgba(${accentTriplet}, 0.6)`;
      if (p.code === hoveredCode) return CAP_HOVER;
      return CAP_SUPPORTED;
    },
    [selectedCode, hoveredCode, accentTriplet],
  );

  const polygonSideColor = useCallback((d: object) => {
    const p = (d as CountryFeature).properties;
    return p.supported ? SIDE_SUPPORTED : SIDE_UNSUPPORTED;
  }, []);

  const polygonStrokeColor = useCallback(
    (d: object) => {
      const p = (d as CountryFeature).properties;
      if (!p.supported) return STROKE_UNSUPPORTED;
      if (p.code === selectedCode || p.code === hoveredCode)
        return STROKE_ACTIVE;
      return STROKE_SUPPORTED;
    },
    [selectedCode, hoveredCode],
  );

  const handlePolyHover = useCallback(
    (d: object | null) => {
      const f = d as CountryFeature | null;
      const supported = Boolean(f?.properties.supported);
      // Only supported countries get the lift/glow highlight.
      setHoveredCode(supported ? f!.properties.code : null);
      onHover(
        f && f.properties.code
          ? {
              code: f.properties.code,
              name: f.properties.name,
              supported,
            }
          : null,
      );
      const el = containerRef.current;
      if (el) el.style.cursor = supported ? "pointer" : "grab";
    },
    [onHover],
  );

  const handlePolyClick = useCallback(
    (d: object) => {
      const p = (d as CountryFeature).properties;
      if (p.supported && p.code) onSelect(p.code);
    },
    [onSelect],
  );

  // ---- Fallback-dot accessors (city-states) ----
  const pointAltitude = useCallback(
    (d: object) => {
      const c = d as Country;
      if (c.code === selectedCode) {
        if (playing) return beat ? 0.32 : 0.18;
        return 0.16;
      }
      if (c.code === hoveredCode) return 0.09;
      return 0.02;
    },
    [selectedCode, hoveredCode, playing, beat],
  );

  const pointColor = useCallback(
    (d: object) => {
      const c = d as Country;
      if (c.code === selectedCode) return ACCENT_SOFT;
      if (c.code === hoveredCode) return ACCENT;
      return "rgba(56, 232, 255, 0.75)";
    },
    [selectedCode, hoveredCode],
  );

  const handlePointHover = useCallback(
    (d: object | null) => {
      const c = d as Country | null;
      setHoveredCode(c ? c.code : null);
      onHover(c ? { code: c.code, name: c.name, supported: true } : null);
      const el = containerRef.current;
      if (el) el.style.cursor = c ? "pointer" : "grab";
    },
    [onHover],
  );

  const handlePointClick = useCallback(
    (d: object) => onSelect((d as Country).code),
    [onSelect],
  );

  // ---- Pulsing ring on the selected country (works for polygons + dots) ----
  const ringsData = useMemo(() => {
    if (!selectedCode || reduce) return [];
    const c = countries.find((x) => x.code === selectedCode);
    return c ? [{ lat: c.lat, lng: c.lng }] : [];
  }, [selectedCode, countries, reduce]);

  // ---- Living arcs: music signals criss-crossing the planet ----
  // A drifting set of ambient arcs, refreshed periodically for variety, plus a
  // burst of arcs radiating from the selected country.
  const [arcSeed, setArcSeed] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setArcSeed((s) => s + 1), 4500);
    return () => clearInterval(id);
  }, [reduce]);

  const arcsData = useMemo<ArcDatum[]>(() => {
    if (reduce || countries.length === 0) return [];
    const pick = () => countries[Math.floor(Math.random() * countries.length)];
    const arcs: ArcDatum[] = [];

    // Ambient cyan arcs.
    for (let i = 0; i < 9; i++) {
      const a = pick();
      const b = pick();
      if (a.code === b.code) continue;
      arcs.push({
        startLat: a.lat,
        startLng: a.lng,
        endLat: b.lat,
        endLng: b.lng,
        color: ["rgba(56, 232, 255, 0.1)", "rgba(122, 243, 255, 0.85)"],
        speed: 1600 + Math.random() * 2000,
      });
    }

    // Selection burst — radiate from the chosen country (uses now-playing hue).
    if (selectedCode) {
      const src = countries.find((c) => c.code === selectedCode);
      if (src) {
        const targets = [...countries]
          .filter((c) => c.code !== selectedCode)
          .sort(() => Math.random() - 0.5)
          .slice(0, 6);
        for (const tgt of targets) {
          arcs.push({
            startLat: src.lat,
            startLng: src.lng,
            endLat: tgt.lat,
            endLng: tgt.lng,
            color: [
              `rgba(${accentTriplet}, 0.05)`,
              `rgba(${accentTriplet}, 0.9)`,
            ],
            speed: 1300 + Math.random() * 1400,
          });
        }
      }
    }
    return arcs;
    // arcSeed intentionally drives periodic regeneration.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countries, selectedCode, reduce, accentTriplet, arcSeed]);

  // Match the polygon tween to the heartbeat so the pop pulses smoothly.
  const transition = reduce ? 0 : playing && selectedCode ? 440 : 250;

  return (
    <div
      ref={containerRef}
      className="globe-host absolute inset-0 h-full w-full"
    >
      {size.width > 0 && (
        <Globe
          ref={globeRef as React.MutableRefObject<GlobeMethods | undefined>}
          width={size.width}
          height={size.height}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl="/textures/earth-night.jpg"
          bumpImageUrl="/textures/earth-topology.png"
          showAtmosphere
          atmosphereColor={ACCENT}
          atmosphereAltitude={0.18}
          onGlobeReady={handleReady}
          // Country boundaries (whole-country click targets)
          polygonsData={polygons ?? []}
          polygonAltitude={polygonAltitude}
          polygonCapColor={polygonCapColor}
          polygonSideColor={polygonSideColor}
          polygonStrokeColor={polygonStrokeColor}
          polygonLabel={() => ""}
          polygonsTransitionDuration={transition}
          onPolygonHover={handlePolyHover}
          onPolygonClick={handlePolyClick}
          // Fallback dots for storefronts with no 110m polygon
          pointsData={dots}
          pointLat="lat"
          pointLng="lng"
          pointAltitude={pointAltitude}
          pointColor={pointColor}
          pointRadius={0.5}
          pointResolution={18}
          pointsTransitionDuration={transition}
          pointLabel={() => ""}
          onPointHover={handlePointHover}
          onPointClick={handlePointClick}
          // Living arcs criss-crossing the planet
          arcsData={arcsData}
          arcStartLat="startLat"
          arcStartLng="startLng"
          arcEndLat="endLat"
          arcEndLng="endLng"
          arcColor="color"
          arcStroke={0.7}
          arcAltitudeAutoScale={0.5}
          arcDashLength={0.5}
          arcDashGap={0.45}
          arcDashInitialGap={() => Math.random()}
          arcDashAnimateTime={(d: object) => (d as ArcDatum).speed}
          arcsTransitionDuration={0}
          // Selected-country pulse — bigger + faster while a song plays
          ringsData={ringsData}
          ringLat="lat"
          ringLng="lng"
          ringColor={() => (t: number) =>
            `rgba(${accentTriplet}, ${Math.max(0, 1 - t)})`
          }
          ringMaxRadius={playing ? 7 : 4.5}
          ringPropagationSpeed={playing ? 4 : 2.4}
          ringRepeatPeriod={playing ? 620 : 950}
          ringAltitude={0.013}
        />
      )}
    </div>
  );
}
