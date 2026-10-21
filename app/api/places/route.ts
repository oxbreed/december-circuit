import { places } from "../../places";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category")?.trim() ?? "";
  const country = searchParams.get("country")?.trim() ?? "";
  const city = searchParams.get("city")?.trim() ?? "";
  const records = places.filter((place) => {
    if (category && place.category.toLowerCase() !== category.toLowerCase()) return false;
    if (country && place.country.toLowerCase() !== country.toLowerCase()) return false;
    if (city && place.city.toLowerCase() !== city.toLowerCase()) return false;
    return true;
  });
  return Response.json(records);
}
