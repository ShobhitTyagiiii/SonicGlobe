"use client";

import { useEffect, useState } from "react";

/**
 * SSR-safe media-query hook. Returns false on the server / first paint, then
 * updates after mount so we never read `window` during render.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/** Convenience: true on phone-sized viewports. */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 767px)");
}
