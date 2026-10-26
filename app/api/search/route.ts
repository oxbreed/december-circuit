import { searchDirectory } from "../../search";

function read(params: URLSearchParams, name: string) {
  const value = params.get(name)?.trim() ?? "";
  return value.length > 0 ? value : null;
}

function positiveInt(value: string) {
  if (!/^[1-9]\d*$/.test(value)) return null;
  return Number(value);
}

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 40;

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const q = read(params, "q") ?? "";
  const limitText = read(params, "limit");
  const limit =
    limitText === null ? DEFAULT_LIMIT : positiveInt(limitText);

  if (limitText !== null && (limit === null || limit > MAX_LIMIT)) {
    return Response.json(
      {
        q,
        results: [],
        empty: true,
        message: `Limit must be a whole number from 1 to ${MAX_LIMIT}.`,
      },
      { status: 400 },
    );
  }

  if (!q) {
    return Response.json({
      q: "",
      results: [],
      empty: true,
      message: "Type a name, city, or guide topic.",
    });
  }

  const results = searchDirectory(q, limit ?? DEFAULT_LIMIT);
  const empty = results.length === 0;

  return Response.json({
    q,
    results,
    empty,
    ...(empty
      ? {
          message:
            "No confirmed event, place, or guide page on file matches that.",
        }
      : {}),
  });
}
