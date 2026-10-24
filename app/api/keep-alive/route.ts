import { connection, NextResponse } from "next/server";
import { createAnonClient } from "../../supabase/server";

/**
 * Cheap ping so a Free Tier Supabase project does not pause after a week of
 * inactivity. Point an external weekly cron (or Vercel Cron) at this route.
 * Returns { ok: false, reason: "not_connected" } when env vars are missing.
 */
export async function GET() {
  await connection();

  const supabase = createAnonClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, reason: "not_connected" });
  }

  const started = Date.now();
  const { error } = await supabase.from("reviews").select("id").limit(1);
  if (error) {
    return NextResponse.json(
      { ok: false, error: "ping_failed", ms: Date.now() - started },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true, ms: Date.now() - started });
}
