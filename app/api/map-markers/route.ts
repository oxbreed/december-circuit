import { mapMarkersOnFile } from "../../map-markers";

export async function GET() {
  return Response.json(mapMarkersOnFile());
}