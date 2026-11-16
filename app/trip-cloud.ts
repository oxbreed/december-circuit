import "server-only";
import { directorySignIn } from "./directory-auth";

function present(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/**
 * Cross-device trip sync uses the same hosted Supabase project as directory sign-in.
 * Tables: trip_lists, trip_list_items, trip_list_members (migration 20261116120000).
 */
export function tripCloudSync() {
  const auth = directorySignIn();
  const databaseUrl =
    present(process.env.TRIP_DATABASE_URL) ??
    present(process.env.DATABASE_URL) ??
    present(process.env.SUPABASE_URL) ??
    present(process.env.NEXT_PUBLIC_SUPABASE_URL);
  return {
    connected: auth.connected && Boolean(databaseUrl),
    databaseUrlConfigured: Boolean(databaseUrl),
    authConnected: auth.connected,
  };
}