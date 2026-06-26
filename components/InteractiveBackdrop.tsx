"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Deep-space ambience: two slowly drifting nebula blobs plus an aurora that
 * follows the cursor (smoothed). The cursor aurora is tinted with the
 * now-playing colour (--np-color), so the whole room subtly takes on the mood
 * of the current track. Static under reduced motion.
 */
export default function InteractiveBackdrop() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    const target = { x: window.innerWidth / 2, y: window.innerHeight * 0.4 };
    const pos = { ...target };

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const loop = () => {
      pos.x += (target.x - pos.x) * 0.06;
      pos.y += (target.y - pos.y) * 0.06;
      el.style.setProperty("--mx", `${pos.x}px`);
      el.style.setProperty("--my", `${pos.y}px`);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, [reduce]);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* Cursor-following aurora, tinted by the now-playing colour */}
      <div
        className="absolute h-[46vmax] w-[46vmax] rounded-full transition-[background] duration-700"
        style={{
          left: "var(--mx, 50%)",
          top: "var(--my, 40%)",
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(circle, rgba(var(--np-color), 0.16), transparent 62%)",
          filter: "blur(50px)",
        }}
      />
      {/* Drifting nebula blobs */}
      <div
        className="aurora-blob animate-drift"
        style={{
          left: "8%",
          top: "12%",
          height: "38vmax",
          width: "38vmax",
          background:
            "radial-gradient(circle, rgba(56,232,255,0.14), transparent 60%)",
        }}
      />
      <div
        className="aurora-blob animate-drift"
        style={{
          right: "4%",
          bottom: "2%",
          height: "40vmax",
          width: "40vmax",
          animationDelay: "-8s",
          background:
            "radial-gradient(circle, rgba(255,93,177,0.12), transparent 60%)",
        }}
      />
    </div>
  );
}
