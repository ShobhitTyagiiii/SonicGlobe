"use client";

import { motion } from "framer-motion";

interface SpinButtonProps {
  onSpin: () => void;
  spinning: boolean;
}

/**
 * "Spin the globe" discovery button. Spring physics on hover/tap, a rotating
 * globe glyph, and a glow that intensifies while a spin is in flight.
 */
export default function SpinButton({ onSpin, spinning }: SpinButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onSpin}
      disabled={spinning}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className="glass group pointer-events-auto flex items-center gap-2.5 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition-shadow hover:shadow-glow-lg disabled:opacity-80"
      style={{ borderColor: "rgba(56,232,255,0.4)" }}
    >
      <motion.span
        className="text-lg"
        animate={spinning ? { rotate: 360 } : { rotate: 0 }}
        transition={
          spinning
            ? { duration: 0.9, repeat: Infinity, ease: "linear" }
            : { type: "spring", stiffness: 300 }
        }
      >
        🌍
      </motion.span>
      <span className="bg-gradient-to-r from-white to-accent-soft bg-clip-text text-transparent">
        {spinning ? "Spinning…" : "Spin the globe"}
      </span>
    </motion.button>
  );
}
