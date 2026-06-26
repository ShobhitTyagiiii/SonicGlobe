"use client";

import { useEffect, useState } from "react";

export interface DominantColor {
  rgb: [number, number, number];
  /** "r, g, b" — convenient for `rgba(var(--x), a)` style usage. */
  triplet: string;
  hex: string;
}

const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));

const toHex = ([r, g, b]: [number, number, number]) =>
  "#" + [r, g, b].map((n) => clamp(n).toString(16).padStart(2, "0")).join("");

/** Brighten + saturate the extracted colour so it reads well as a glow. */
function vivify([r, g, b]: [number, number, number]): [number, number, number] {
  const max = Math.max(r, g, b) || 1;
  const scale = 215 / max; // lift the brightest channel to ~215
  let R = r * scale,
    G = g * scale,
    B = b * scale;
  const lum = 0.3 * R + 0.59 * G + 0.11 * B;
  const s = 1.4; // push channels away from luminance => more saturated
  R = clamp(lum + (R - lum) * s);
  G = clamp(lum + (G - lum) * s);
  B = clamp(lum + (B - lum) * s);
  return [R, G, B];
}

/**
 * Extract a vibrant dominant colour from an album-art URL. The image is pulled
 * through the same-origin /api/art proxy so the canvas is readable, downscaled,
 * and scored by saturation. Returns null while loading or on any failure (the
 * UI then falls back to the default cyan accent).
 */
export function useDominantColor(
  url: string | null | undefined,
): DominantColor | null {
  const [color, setColor] = useState<DominantColor | null>(null);

  useEffect(() => {
    if (!url) {
      setColor(null);
      return;
    }
    let active = true;
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      if (!active) return;
      try {
        const size = 24;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);

        let vr = 0,
          vg = 0,
          vb = 0,
          vw = 0;
        let ar = 0,
          ag = 0,
          ab = 0,
          an = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i],
            g = data[i + 1],
            b = data[i + 2],
            a = data[i + 3];
          if (a < 128) continue;
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const light = (max + min) / 2 / 255;
          const sat = max === 0 ? 0 : (max - min) / max;
          ar += r;
          ag += g;
          ab += b;
          an++;
          if (light > 0.12 && light < 0.92) {
            // Favour saturated, mid-light pixels.
            const w = sat * sat * (1 - Math.abs(light - 0.5));
            vr += r * w;
            vg += g * w;
            vb += b * w;
            vw += w;
          }
        }

        let rgb: [number, number, number];
        if (vw > 0.0001) rgb = [vr / vw, vg / vw, vb / vw];
        else if (an > 0) rgb = [ar / an, ag / an, ab / an];
        else rgb = [56, 232, 255];

        const out = vivify(rgb);
        setColor({
          rgb: out,
          triplet: `${out[0]}, ${out[1]}, ${out[2]}`,
          hex: toHex(out),
        });
      } catch {
        setColor(null);
      }
    };
    img.onerror = () => {
      if (active) setColor(null);
    };
    img.src = `/api/art?u=${encodeURIComponent(url)}`;

    return () => {
      active = false;
    };
  }, [url]);

  return color;
}
