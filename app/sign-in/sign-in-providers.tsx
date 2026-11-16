import { tripOAuthProviders } from "../trip-oauth";

export function signInOAuthFlags() {
  const oauth = tripOAuthProviders();
  return {
    googleConfigured: oauth.google.configured,
    appleConfigured: oauth.apple.configured,
  };
}