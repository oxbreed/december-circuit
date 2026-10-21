import { flightSearches } from "../../flights";

export async function GET() {
  return Response.json(flightSearches);
}
