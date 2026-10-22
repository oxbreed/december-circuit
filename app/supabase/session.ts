import "server-only";
import { directorySignIn } from "../directory-auth";
import { createDirectoryClient } from "./server";

export async function getDirectoryUser() {
  if (!directorySignIn().connected) return null;
  const supabase = await createDirectoryClient();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.email || !data.user.id) return null;
  return { id: data.user.id, email: data.user.email.toLowerCase() };
}
