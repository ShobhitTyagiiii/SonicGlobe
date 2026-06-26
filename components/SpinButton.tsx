"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface SpinButtonProps {
  onSpin: () => void;
  spinning: boolean;
}

/**
 * "Spin the globe" discovery button. Magnetically drifts toward the cursor,
 * fires a ripple on click, and spins a globe glyph while a spin is in flight.
 */
export default function SpinButton({ onSpin, spinning }: SpinButtonProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLButtonElement>(null);
  const [pull, setPull] = useState({ x: 0, y: 0 });
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>(
    [],
  );

  const onMove = (e: React.PointerEvent) => {
    if (reduce) return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setPull({
      x: ((e.clientX - (r.left + r.width / 2)) / r.width) * 14,
      y: ((e.clientY - (r.top + r.height / 2)) / r.height) * 14,
    });
  };

  const handleClick = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (r) {
      const id = Date.now();
      setRipples((rs) => [...rs, { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
      setTimeout(() => setRipples((rs) => rs.filter((x) => x.id !== id)), 650);
    }
    onSpin();
  };

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={handleClick}
      onPointerMove={onMove}
      onPointerLeave={() => setPull({ x: 0, y: 0 })}
      disabled={spinning}
      animate={{ x: pull.x, y: pull.y }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 350, damping: 18 }}
      className="glass group pointer-events-auto relative flex items-center gap-2 overflow-hidden rounded-full px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition-shadow hover:shadow-glow-lg disabled:opacity-80 sm:gap-2.5 sm:px-5"
      style={{ borderColor: "rgba(56,232,255,0.4)" }}
    >
      {/* Click ripples */}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="pointer-events-none absolute h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/40"
          style={{ left: r.x, top: r.y, animation: "ripple-out 0.6s ease-out forwards" }}
        />
      ))}

      <motion.span
        className="relative text-lg"
        animate={spinning && !reduce ? { rotate: 360 } : { rotate: 0 }}
        transition={
          spinning
            ? { duration: 0.9, repeat: Infinity, ease: "linear" }
            : { type: "spring", stiffness: 300 }
        }
      >
        🌍
      </motion.span>
      <span className="relative whitespace-nowrap bg-gradient-to-r from-white to-accent-soft bg-clip-text text-transparent">
        {spinning ? (
          "Spinning…"
        ) : (
          <>
            Spin<span className="hidden sm:inline"> the globe</span>
          </>
        )}
      </span>
    </motion.button>
  );
}
