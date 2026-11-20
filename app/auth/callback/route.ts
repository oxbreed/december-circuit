import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { directorySignIn } from "../../directory-auth";
import { siteUrl } from "../../site";
import { createDirectoryClientForResponse } from "../../supabase/server";

const emailOtpTypes = new Set<string>([
  "email",
  "magiclink",
  "signup",
  "invite",
  "recovery",
  "email_change",
]);

function signInDestination(requestUrl: URL, reason?: string) {
  const local = requestUrl.hostname === "localhost" || requestUrl.hostname === "127.0.0.1";
  const destination = new URL("/sign-in", local ? requestUrl.origin : siteUrl);
  if (reason) destination.searchParams.set("signin", reason);
  return destination;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  try {
    if (!directorySignIn().connected) {
      return NextResponse.redirect(signInDestination(url, "not-connected"));
    }

    const code = url.searchParams.get("code");
    const tokenHash = url.searchParams.get("token_hash");
    const type = url.searchParams.get("type");
    const providerError = url.searchParams.get("error");

    if (providerError && !code && !tokenHash) {
      return NextResponse.redirect(signInDestination(url, "link-failed"));
    }

    const destination = signInDestination(url);
    const response = NextResponse.redirect(destination);
    const supabase = await createDirectoryClientForResponse(response);
    if (!supabase) {
      return NextResponse.redirect(signInDestination(url, "not-connected"));
    }

    let error: { message?: string } | null = null;
    if (code) {
      const result = await supabase.auth.exchangeCodeForSession(code);
      error = result.error;
    } else if (tokenHash && type && emailOtpTypes.has(type)) {
      const result = await supabase.auth.verifyOtp({
        type: type as EmailOtpType,
        token_hash: tokenHash,
      });
      error = result.error;
    } else {
      return NextResponse.redirect(signInDestination(url, "link-incomplete"));
    }

    if (error) {
      return NextResponse.redirect(signInDestination(url, "link-failed"));
    }
    return response;
  } catch {
    return NextResponse.redirect(signInDestination(url, "link-failed"));
  }
}
