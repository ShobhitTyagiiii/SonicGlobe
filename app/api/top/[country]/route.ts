import { NextResponse } from "next/server";
import { getTopTracks, isSupportedCountry, REVALIDATE_SECONDS } from "@/lib/apple";

// Cache route responses; repeated country clicks are served instantly.
export const revalidate = 3600;

/**
 * GET /api/top/:country
 * Returns the Top 25 tracks for a storefront, merged from Apple RSS + iTunes.
 */
export async function GET(
  _req: Request,
  { params }: { params: { country: string } },
) {
  const code = (params.country || "").toLowerCase();

  // Validate against our known storefronts (prevents arbitrary upstream fetches).
  if (!isSupportedCountry(code)) {
    return NextResponse.json(
      { country: code, tracks: [], error: "Unsupported country." },
      { status: 404 },
    );
  }

  const data = await getTopTracks(code);

  return NextResponse.json(data, {
    headers: {
      // Edge/CDN caching with stale-while-revalidate for snappy repeats.
      "Cache-Control": `public, s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate=86400`,
    },
  });
}
