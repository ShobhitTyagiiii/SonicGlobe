"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Equalizer from "./Equalizer";

interface LoadingScreenProps {
  show: boolean;
}

const TITLE = "Sonic Globe";
const SONAR_RINGS = [0, 1, 2, 3];

/**
 * Intro shown while the Earth texture + boundaries load.
 *
 * A glowing "signal" core emits sonar-like sound-wave rings across a slowly
 * rotating globe wireframe; the wordmark resolves out of a blur letter by
 * letter; a live equalizer hints at the music to come. On exit the whole thing
 * accelerates and blurs forward — as if you're diving into the globe.
 * Fully tones down under prefers-reduced-motion.
 */
export default function LoadingScreen({ show }: LoadingScreenProps) {
  const reduce = useReducedMotion();

  const letterVariants = reduce
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 16, filter: "blur(10px)" },
        show: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: { duration: 0.5, ease: "easeOut" as const },
        },
      };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-void"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: reduce ? 1 : 1.15,
            filter: reduce ? "blur(0px)" : "blur(6px)",
          }}
          transition={{ duration: 0.85, ease: [0.7, 0, 0.2, 1] }}
        >
          <div className="app-backdrop" />

          <div className="relative z-10 flex flex-col items-center">
            {/* Signal core + sonar rings + rotating globe wireframe */}
            <div className="relative flex h-48 w-48 items-center justify-center">
              {/* Expanding sound-wave rings */}
              {!reduce &&
                SONAR_RINGS.map((i) => (
                  <motion.span
                    key={i}
                    className="absolute rounded-full border border-accent/40"
                    style={{ width: 84, height: 84 }}
                    initial={{ scale: 0.35, opacity: 0.55 }}
                    animate={{ scale: 3.4, opacity: 0 }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 0.75,
                      ease: "easeOut",
                    }}
                  />
                ))}

              {/* Rotating globe wireframe (meridians + parallels) */}
              <motion.div
                className="relative h-24 w-24"
                animate={reduce ? {} : { rotate: 360 }}
                transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
              >
                <div
                  className="absolute inset-0 rounded-full border border-accent/50"
                  style={{
                    boxShadow:
                      "0 0 44px -4px rgba(56,232,255,0.5), inset 0 0 26px -8px rgba(56,232,255,0.6)",
                  }}
                />
                {/* meridians */}
                <div
                  className="absolute inset-0 rounded-[50%] border border-accent/25"
                  style={{ transform: "scaleX(0.4)" }}
                />
                <div
                  className="absolute inset-0 rounded-[50%] border border-accent/20"
                  style={{ transform: "scaleX(0.74)" }}
                />
                {/* equator + a parallel */}
                <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-accent/30" />
                <div className="absolute inset-x-[8%] top-[30%] h-px rounded-full bg-accent/15" />
                <div className="absolute inset-x-[8%] top-[70%] h-px rounded-full bg-accent/15" />
              </motion.div>

              {/* Pulsing core */}
              <motion.span
                className="absolute h-3 w-3 rounded-full bg-accent"
                style={{ boxShadow: "0 0 26px 5px rgba(56,232,255,0.9)" }}
                animate={
                  reduce ? {} : { scale: [1, 1.7, 1], opacity: [0.8, 1, 0.8] }
                }
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>

            {/* Wordmark — resolves out of a blur, letter by letter */}
            <motion.h1
              aria-label={TITLE}
              className="mt-5 font-display text-3xl font-bold tracking-tight sm:text-4xl"
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.055, delayChildren: 0.1 } },
              }}
            >
              {TITLE.split("").map((ch, i) => (
                <motion.span
                  key={i}
                  aria-hidden
                  variants={letterVariants}
                  className={ch === " " ? "inline-block w-3" : "inline-block"}
                  style={{
                    color: "#eaf2ff",
                    textShadow: "0 0 20px rgba(56,232,255,0.55)",
                  }}
                >
                  {ch === " " ? " " : ch}
                </motion.span>
              ))}
            </motion.h1>

            {/* Live equalizer + tagline */}
            <div className="mt-5 flex flex-col items-center gap-3">
              <div className="h-5">
                <Equalizer active bars={9} />
              </div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.65, duration: 0.8 }}
                className="text-[11px] font-medium uppercase tracking-[0.32em] text-accent/70"
              >
                Tuning the world&apos;s airwaves
              </motion.p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
