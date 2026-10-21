import { events } from "../../events";

export async function GET() {
  return Response.json(events);
}
