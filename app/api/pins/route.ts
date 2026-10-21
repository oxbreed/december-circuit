import { pins } from "../../pins";

export async function GET() {
  return Response.json(pins);
}
