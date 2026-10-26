import { NextResponse } from "next/server";

/**
 * Same-origin static map preview for MapLibre fallback.
 * Uses one OpenStreetMap raster tile centered on the given sourced
 * coordinates. Never invents a location — callers must pass real lat/lon.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const lat = Number(url.searchParams.get("lat"));
  const lon = Number(url.searchParams.get("lon"));
  const zoomRaw = Number(url.searchParams.get("z") ?? "11");

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ error: "lat and lon are required." }, { status: 400 });
  }
  if (lat < -85.0511 || lat > 85.0511 || lon < -180 || lon > 180) {
    return NextResponse.json({ error: "Coordinates out of range." }, { status: 400 });
  }

  const zoom = Math.min(16, Math.max(3, Math.round(zoomRaw) || 11));
  const n = 2 ** zoom;
  const x = Math.floor(((lon + 180) / 360) * n);
  const y = Math.floor(
    ((1 -
      Math.log(
        Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180),
      ) /
        Math.PI) /
      2) *
      n,
  );
  const tileX = Math.min(n - 1, Math.max(0, x));
  const tileY = Math.min(n - 1, Math.max(0, y));
  const tileUrl = `https://tile.openstreetmap.org/${zoom}/${tileX}/${tileY}.png`;

  try {
    const upstream = await fetch(tileUrl, {
      headers: {
        // OSM tile usage policy — identify the site.
        "User-Agent": "DirtyDecember/1.0 (https://dirtydecember.info; hello@dirtydecember.info)",
        Accept: "image/png,image/*;q=0.8,*/*;q=0.5",
      },
      next: { revalidate: 86_400 },
    });
    if (!upstream.ok) {
      return NextResponse.json({ error: "Tile unavailable." }, { status: 502 });
    }
    const bytes = await upstream.arrayBuffer();
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": upstream.headers.get("Content-Type") ?? "image/png",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return NextResponse.json({ error: "Tile fetch failed." }, { status: 502 });
  }
}
