/**
 * Detect whether the browser can create a WebGL context. The 3D globe needs
 * WebGL; on devices/browsers where it's unavailable or blocked, we skip the
 * globe entirely and fall back to the country picker instead of crashing.
 */
export function isWebGLAvailable(): boolean {
  if (typeof window === "undefined") return true; // assume OK during SSR
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    return Boolean(window.WebGLRenderingContext && gl);
  } catch {
    return false;
  }
}
