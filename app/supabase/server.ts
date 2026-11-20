import "server-only";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { directoryCredentials, serviceCredentials } from "./credentials";

export async function createDirectoryClient() {
  const creds = directoryCredentials();
  if (!creds) return null;
  const cookieStore = await cookies();
  return createServerClient(creds.url, creds.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // A Server Component can read the session. The callback route sets it.
        }
      },
    },
  });
}

/**
 * Same as createDirectoryClient, but also writes auth cookies onto a
 * NextResponse. Needed on /auth/callback: a fresh NextResponse.redirect
 * can drop cookies that were only set through cookies().set().
 */
export async function createDirectoryClientForResponse(response: import("next/server").NextResponse) {
  const creds = directoryCredentials();
  if (!creds) return null;
  const cookieStore = await cookies();
  return createServerClient(creds.url, creds.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          try {
            cookieStore.set(name, value, options);
          } catch {
            // Route handlers should accept set(); Server Components may not.
          }
          response.cookies.set(name, value, options);
        }
      },
    },
  });
}

export function createAnonClient() {
  const creds = directoryCredentials();
  if (!creds) return null;
  return createClient(creds.url, creds.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function createServiceClient() {
  const creds = serviceCredentials();
  if (!creds) return null;
  return createClient(creds.url, creds.serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
