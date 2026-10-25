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
        sources: ["openstreetmap"],
        results: [],
      },
      {
        status: 400,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }

  const hasFoursquare = result.sources.includes("foursquare");
  const hasGoogle = result.sources.includes("google");
  const thirdPartyBits = [
    hasFoursquare ? "Foursquare" : null,
    hasGoogle ? "Google" : null,
  ].filter(Boolean);
  const notice =
    thirdPartyBits.length > 0
      ? `Map / third-party venue data from OpenStreetMap and ${thirdPartyBits.join(" and ")} — not checked directory listings.`
      : "OpenStreetMap results — map data, not a checked listing.";

  const sourceParts = ["openstreetmap"];
  if (hasFoursquare) sourceParts.push("foursquare");
  if (hasGoogle) sourceParts.push("google");

  return NextResponse.json(
    {
      source: sourceParts.join("+"),
      sources: result.sources,
      foursquareEnabled: result.foursquareEnabled,
      googlePlacesEnabled: result.googlePlacesEnabled,
      notice,
      attribution: {
        openstreetmap: "© OpenStreetMap contributors (ODbL)",
        ...(hasFoursquare ? { foursquare: "Venue data © Foursquare" } : {}),
        ...(hasGoogle ? { google: "Place data © Google" } : {}),
      },
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
