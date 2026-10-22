import { events, type CircuitEvent } from "../../events";
import { eventCategory } from "../../event-view";
import { datesOnFile } from "../../jsonld";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

function fold(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function read(params: URLSearchParams, name: string) {
  const value = params.get(name)?.trim() ?? "";
  return value.length > 0 ? value : null;
}

function isoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return value;
}

function positiveInt(value: string) {
  if (!/^[1-9]\d*$/.test(value)) return null;
  return Number(value);
}

function storedRange(event: CircuitEvent) {
  const dates = datesOnFile(event.when);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dates.startDate)) return null;
  const end = dates.endDate && /^\d{4}-\d{2}-\d{2}$/.test(dates.endDate) ? dates.endDate : dates.startDate;
  return { start: dates.startDate, end };
}

function json(body: unknown, status = 200) {
  return Response.json(body, { status });
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const city = read(params, "city");
  const category = read(params, "category");
  const startText = read(params, "start");
  const endText = read(params, "end");
  const pageText = read(params, "page");
  const limitText = read(params, "limit");
  const asked =
    city !== null ||
    category !== null ||
    startText !== null ||
    endText !== null ||
    pageText !== null ||
    limitText !== null ||
    params.has("price");

  if (!asked) return json(events);

  if (params.has("price")) {
    return json(
      {
        results: [],
        empty: true,
        message: "Prices are not on file.",
      },
      400,
    );
  }

  const start = startText === null ? null : isoDate(startText);
  if (startText !== null && start === null) {
    return json(
      {
        results: [],
        empty: true,
        message: "Start date must be YYYY-MM-DD.",
      },
      400,
    );
  }

  const end = endText === null ? null : isoDate(endText);
  if (endText !== null && end === null) {
    return json(
      {
        results: [],
        empty: true,
        message: "End date must be YYYY-MM-DD.",
      },
      400,
    );
  }

  if (start && end && start > end) {
    return json(
      {
        results: [],
        empty: true,
        message: "The end date is before the start date.",
      },
      400,
    );
  }

  const page = pageText === null ? 1 : positiveInt(pageText);
  if (page === null) {
    return json(
      {
        results: [],
        empty: true,
        message: "Page must be a whole number from 1.",
      },
      400,
    );
  }

  const limit = limitText === null ? DEFAULT_LIMIT : positiveInt(limitText);
  if (limit === null || limit > MAX_LIMIT) {
    return json(
      {
        results: [],
        empty: true,
        message: `Limit must be a whole number from 1 to ${MAX_LIMIT}.`,
      },
      400,
    );
  }

  const matched = events.filter((event) => {
    if (city && fold(event.region) !== fold(city)) return false;
    if (category && fold(category) !== fold(eventCategory)) return false;
    if (start || end) {
      const range = storedRange(event);
      if (!range) return false;
      if (start && range.end < start) return false;
      if (end && range.start > end) return false;
    }
    return true;
  });

  const offset = (page - 1) * limit;
  const results = matched.slice(offset, offset + limit);
  const empty = results.length === 0;

  return json({
    results,
    page,
    limit,
    total: matched.length,
    empty,
    ...(empty
      ? {
          message:
            matched.length === 0
              ? "No events on file match this query."
              : "No events on file for this page.",
        }
      : {}),
  });
}
