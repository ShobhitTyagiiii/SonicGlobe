import { NextResponse } from "next/server";

export const revalidate = 86400;

/**
 * GET /api/art?u=<apple-artwork-url>
 *
 * Same-origin proxy for Apple album art so the client can draw it to a canvas
 * and read its pixels (for dominant-colour extraction) without CORS tainting.
 * Only Apple's image host is allowed.
 */
export async function GET(req: Request) {
  const u = new URL(req.url).searchParams.get("u");
  if (!u) {
    return NextResponse.json({ error: "missing url" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(u);
  } catch {
    return NextResponse.json({ error: "bad url" }, { status: 400 });
  }

  // Allow only Apple's artwork CDN.
  if (!/(^|\.)mzstatic\.com$/.test(target.hostname)) {
    return NextResponse.json({ error: "host not allowed" }, { status: 403 });
  }

  try {
    const res = await fetch(target.toString(), {
      next: { revalidate: 86400 },
    });
    if (!res.ok) {
      return NextResponse.json({ error: "upstream" }, { status: 502 });
    }
    const buf = await res.arrayBuffer();
    return new NextResponse(buf, {
      headers: {
        "Content-Type": res.headers.get("Content-Type") ?? "image/jpeg",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "fetch failed" }, { status: 502 });
  }
}
