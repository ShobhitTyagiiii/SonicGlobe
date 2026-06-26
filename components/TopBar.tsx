"use client";

import { motion } from "framer-motion";

/**
 * App wordmark + tagline, top-left. Animates in on first paint.
 */
export default function TopBar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
      className="pointer-events-none select-none"
    >
      <div className="flex items-center gap-2.5">
        <span className="relative flex h-9 w-9 items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-accent/20 blur-md" />
          <span className="relative text-2xl">🌐</span>
        </span>
        <h1 className="font-display text-xl font-bold tracking-tight text-flow sm:text-3xl">
          Sonic Globe
        </h1>
      </div>
      <p className="mt-1 hidden max-w-xs pl-0.5 text-xs font-medium text-white/55 sm:block sm:text-sm">
        Spin the Earth. Click a country. Hear what the world is listening to.
      </p>
    </motion.div>
  );
}
