type TravelBody = {
  fromLat?: number;
  fromLon?: number;
  toLat?: number;
  toLon?: number;
};

function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

export async function POST(request: Request) {
  let body: TravelBody;
  try {
    body = (await request.json()) as TravelBody;
  } catch {
    return badRequest("Invalid JSON body.");
  }

  const { fromLat, fromLon, toLat, toLon } = body;
  if (
    typeof fromLat !== "number" ||
    typeof fromLon !== "number" ||
    typeof toLat !== "number" ||
    typeof toLon !== "number" ||
    !Number.isFinite(fromLat) ||
    !Number.isFinite(fromLon) ||
    !Number.isFinite(toLat) ||
    !Number.isFinite(toLon)
  ) {
    return badRequest("fromLat, fromLon, toLat, and toLon are required numbers.");
  }

  const orsKey = process.env.OPENROUTESERVICE_API_KEY?.trim();
  const mapboxKey =
    process.env.MAPBOX_ACCESS_TOKEN?.trim() ||
    process.env.MAPBOX_DIRECTIONS_ACCESS_TOKEN?.trim();

  if (!orsKey && !mapboxKey) {
    return Response.json({
      configured: false as const,
    });
  }

  if (orsKey) {
    const response = await fetch(
      "https://api.openrouteservice.org/v2/directions/driving-car",
      {
        method: "POST",
        headers: {
          Authorization: orsKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coordinates: [
            [fromLon, fromLat],
            [toLon, toLat],
          ],
        }),
      },
    );
    const payload = (await response.json()) as {
      routes?: { summary?: { duration?: number; distance?: number } }[];
      error?: { message?: string };
    };
    if (!response.ok) {
      return Response.json(
        {
          configured: true as const,
          error:
            payload.error?.message?.trim() ||
            "The routing service did not return a time.",
        },
        { status: 502 },
      );
    }
    const summary = payload.routes?.[0]?.summary;
    if (
      typeof summary?.duration !== "number" ||
      typeof summary?.distance !== "number"
    ) {
      return Response.json(
        {
          configured: true as const,
          error: "The routing service did not return a time.",
        },
        { status: 502 },
      );
    }
    return Response.json({
      configured: true as const,
      provider: "openrouteservice",
      durationSeconds: summary.duration,
      distanceMeters: summary.distance,
    });
  }

  const url = new URL(
    `https://api.mapbox.com/directions/v5/mapbox/driving/${fromLon},${fromLat};${toLon},${toLat}`,
  );
  url.searchParams.set("access_token", mapboxKey!);
  url.searchParams.set("overview", "false");
  const response = await fetch(url);
  const payload = (await response.json()) as {
    routes?: { duration?: number; distance?: number }[];
    message?: string;
  };
  if (!response.ok) {
    return Response.json(
      {
        configured: true as const,
        error:
          payload.message?.trim() || "The routing service did not return a time.",
      },
      { status: 502 },
    );
  }
  const route = payload.routes?.[0];
  if (typeof route?.duration !== "number" || typeof route?.distance !== "number") {
    return Response.json(
      {
        configured: true as const,
        error: "The routing service did not return a time.",
      },
      { status: 502 },
    );
  }
  return Response.json({
    configured: true as const,
    provider: "mapbox",
    durationSeconds: route.duration,
    distanceMeters: route.distance,
  });
}