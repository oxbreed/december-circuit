import "server-only";

function present(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/** URL and anon key from the environment. Null when either one is missing. */
export function directoryCredentials() {
  const url = present(process.env.NEXT_PUBLIC_SUPABASE_URL) ?? present(process.env.SUPABASE_URL);
  const anonKey =
    present(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ?? present(process.env.SUPABASE_ANON_KEY);
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

/**
 * Server-only key for reading unpublished submissions after the admin email
 * check. Never pass this client or key into a browser component.
 */
export function serviceCredentials() {
  const base = directoryCredentials();
  const serviceKey = present(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!base || !serviceKey) return null;
  return { url: base.url, serviceKey };
}
