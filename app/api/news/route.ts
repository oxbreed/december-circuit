import { loadNews } from "../../news-reader";

export async function GET() {
  const payload = await loadNews();
  return Response.json(payload, {
    headers: {
      "Cache-Control": "public, s-maxage=1200, stale-while-revalidate=1200",
    },
  });
}
