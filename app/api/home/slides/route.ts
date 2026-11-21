import { homeHeroSlides } from "../../../home-hero-slides";

export function GET() {
  return Response.json(homeHeroSlides().slice(1), {
    headers: { "Cache-Control": "public, max-age=300, s-maxage=3600" },
  });
}
