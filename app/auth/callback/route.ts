import { NextResponse } from "next/server";
import { directorySignIn } from "../../directory-auth";
import { createDirectoryClient } from "../../supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const destination = new URL("/sign-in", url.origin);
  if (!directorySignIn().connected) {
    return NextResponse.redirect(destination);
  }
  const code = url.searchParams.get("code");
  if (code) {
    const supabase = await createDirectoryClient();
    if (supabase) await supabase.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(destination);
}
