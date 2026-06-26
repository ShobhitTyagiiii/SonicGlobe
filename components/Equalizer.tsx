"use client";

import { useReducedMotion } from "framer-motion";

interface EqualizerProps {
  /** Whether bars should animate (true while audio is playing). */
  active: boolean;
  /** Number of bars. */
  bars?: number;
  className?: string;
  /** CSS color of the bars. */
  color?: string;
}

// Per-bar animation timing so the bars never move in lockstep.
const DURATIONS = [0.7, 1.1, 0.85, 1.3, 0.95, 1.05, 0.8, 1.2];
const DELAYS = [0, 0.2, 0.45, 0.1, 0.35, 0.05, 0.5, 0.25];

/**
 * A pulsing equalizer used on the now-playing track. Bars animate via CSS
 * (cheap, GPU-friendly) and freeze at a low height when paused or when the
 * user prefers reduced motion.
 */
export default function Equalizer({
  active,
  bars = 5,
  className = "",
  color = "#38e8ff",
}: EqualizerProps) {
  const reduce = useReducedMotion();
  const animate = active && !reduce;

  return (
    <div
      className={`flex items-end gap-[3px] ${className}`}
      aria-hidden
      style={{ height: "100%" }}
    >
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className="w-[3px] rounded-full"
          style={{
            background: color,
            height: animate ? "100%" : "22%",
            transformOrigin: "bottom",
            animation: animate
              ? `eq-bounce ${DURATIONS[i % DURATIONS.length]}s ease-in-out ${
                  DELAYS[i % DELAYS.length]
                }s infinite`
              : "none",
            boxShadow: active ? `0 0 8px ${color}` : "none",
            opacity: active ? 1 : 0.5,
            transition: "height 0.3s ease, opacity 0.3s ease",
          }}
        />
      ))}
      <style jsx>{`
        @keyframes eq-bounce {
          0%,
          100% {
            transform: scaleY(0.28);
          }
          50% {
            transform: scaleY(1);
          }
        }
      `}</style>
    </div>
  );
}
