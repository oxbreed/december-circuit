function present(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/**
 * A hosted project is connected only when both a URL and an anon key are
 * already in the environment. The local CLI config does not supply either.
 */
export function directorySignIn() {
  const url = present(process.env.NEXT_PUBLIC_SUPABASE_URL) ?? present(process.env.SUPABASE_URL);
  const anonKey =
    present(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ?? present(process.env.SUPABASE_ANON_KEY);
  const adminEmail = present(process.env.ADMIN_EMAIL)?.toLowerCase() ?? null;
  return {
    connected: Boolean(url && anonKey),
    adminEmail,
  };
}
