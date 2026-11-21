function present(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

const defaultAdminEmail = "dirtydecember411@gmail.com";

function parseEmailList(value: string | undefined): string[] {
  if (!value?.trim()) return [];
  return value
    .split(/[,;\n]+/)
    .map((item) => item.trim().toLowerCase())
    .filter((item) => item.includes("@") && !/\s/.test(item));
}

/**
 * Allowlisted admin addresses. Reads ADMIN_EMAILS (comma-separated) and the
 * older single ADMIN_EMAIL. If neither is set, the default address is used so
 * the known operator can reach /admin once sign-in is connected.
 */
export function adminEmails(): string[] {
  const listed = parseEmailList(process.env.ADMIN_EMAILS);
  const single = parseEmailList(process.env.ADMIN_EMAIL);
  // Always keep the known operator, even if ADMIN_EMAILS is set to other addresses.
  return [...new Set([defaultAdminEmail, ...listed, ...single])];
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminEmails().includes(email.trim().toLowerCase());
}

/**
 * A hosted project is connected only when both a URL and an anon key are
 * already in the environment. The local CLI config does not supply either.
 */
export function directorySignIn() {
  const url = present(process.env.NEXT_PUBLIC_SUPABASE_URL) ?? present(process.env.SUPABASE_URL);
  const anonKey =
    present(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ?? present(process.env.SUPABASE_ANON_KEY);
  const emails = adminEmails();
  return {
    connected: Boolean(url && anonKey),
    adminEmail: emails[0] ?? null,
    adminEmails: emails,
  };
}
