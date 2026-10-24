import { NextResponse } from "next/server";
import { lookupPlaceOnMap } from "../../nominatim";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name")?.trim() ?? "";
  const city = searchParams.get("city")?.trim() ?? "";
  const result = await lookupPlaceOnMap(name, city);

  if (result.status === "error") {
    return NextResponse.json(
      { error: result.message, candidates: [] },
      {
        status: 400,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }

  return NextResponse.json(
    { candidates: result.candidates },
    {
      headers: {
        "Cache-Control": "private, max-age=300, stale-while-revalidate=3600",
      },
    },
  );
}
