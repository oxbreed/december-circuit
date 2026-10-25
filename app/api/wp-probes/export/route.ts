import { NextResponse } from "next/server";
import { exportWpProbesCsv, type WpProbeFilters } from "../../../wp-probes";

export const runtime = "nodejs";

function one(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const filters: WpProbeFilters = {
    path: one(url.searchParams.get("path") ?? undefined),
    ip: one(url.searchParams.get("ip") ?? undefined),
    from: one(url.searchParams.get("from") ?? undefined),
    to: one(url.searchParams.get("to") ?? undefined),
  };

  const result = await exportWpProbesCsv(filters);
  if (result.reason === "forbidden") {
    return new NextResponse("Access refused.", {
      status: 403,
      headers: { "Cache-Control": "no-store", "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  if (result.reason === "no-key") {
    return new NextResponse("Server key is not set.", {
      status: 503,
      headers: { "Cache-Control": "no-store", "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  if (result.reason !== "ok" || !result.csv) {
    return new NextResponse("Export failed.", {
      status: 500,
      headers: { "Cache-Control": "no-store", "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(result.csv, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="wp-probes-${stamp}.csv"`,
    },
  });
}
