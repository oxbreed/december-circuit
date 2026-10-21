import { places } from "../../places";

export async function GET(request: Request) {
  const category = new URL(request.url).searchParams.get("category")?.trim() ?? "";
  const records = category
    ? places.filter(
        (place) => place.category.toLowerCase() === category.toLowerCase(),
      )
    : places;
  return Response.json(records);
}
