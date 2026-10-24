import { NextResponse } from "next/server";
import { searchPois } from "../../poi";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city")?.trim() ?? "Lagos";
  const kind = searchParams.get("kind")?.trim() ?? "hotels";
  const q = searchParams.get("q")?.trim() ?? "";
  const result = await searchPois(city, kind, q);

  if (result.status === "error") {
    return NextResponse.json(
      {
        error: result.message,
        source: "openstreetmap",
        results: [],
      },
      {
        status: 400,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }

  return NextResponse.json(
    {
      source: "openstreetmap",
      notice: "OpenStreetMap results — map data, not a checked listing.",
      city: result.city,
      kind: result.kind,
      results: result.results,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=1800",
      },
    },
  );
}
