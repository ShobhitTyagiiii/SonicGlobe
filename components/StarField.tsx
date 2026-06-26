"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

interface Star {
  x: number;
  y: number;
  r: number;
  baseAlpha: number;
  twinkleSpeed: number;
  phase: number;
  drift: number;
}

/**
 * A lightweight canvas starfield with gentle twinkle + parallax drift.
 * Sits behind the globe; honours prefers-reduced-motion (renders static).
 */
export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let stars: Star[] = [];
    let raf = 0;
    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const build = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Density scales with viewport area, capped for performance.
      const count = Math.min(260, Math.floor((width * height) / 6500));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.3 + 0.25,
        baseAlpha: Math.random() * 0.5 + 0.25,
        twinkleSpeed: Math.random() * 1.6 + 0.4,
        phase: Math.random() * Math.PI * 2,
        drift: Math.random() * 0.02 + 0.004,
      }));
    };

    const paintStatic = () => {
      ctx.clearRect(0, 0, width, height);
      for (const s of stars) {
        ctx.globalAlpha = s.baseAlpha;
        ctx.fillStyle = "#dff6ff";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const render = (t: number) => {
      ctx.clearRect(0, 0, width, height);
      for (const s of stars) {
        const tw = 0.5 + 0.5 * Math.sin(t * 0.001 * s.twinkleSpeed + s.phase);
        ctx.globalAlpha = s.baseAlpha * (0.35 + 0.65 * tw);
        ctx.fillStyle = "#dff6ff";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r + tw * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Slow upward drift; wrap around the top.
        s.y -= s.drift;
        if (s.y < -2) {
          s.y = height + 2;
          s.x = Math.random() * width;
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(render);
    };

    build();
    if (reduce) {
      paintStatic();
    } else {
      raf = requestAnimationFrame(render);
    }

    const onResize = () => {
      build();
      if (reduce) paintStatic();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [reduce]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[1] h-full w-full"
    />
  );
}
