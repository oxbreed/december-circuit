function present(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export type OAuthProvider = "google" | "apple";

export function tripOAuthProviders() {
  const googleClientId =
    present(process.env.GOOGLE_OAUTH_CLIENT_ID) ??
    present(process.env.GOOGLE_CLIENT_ID);
  const appleClientId =
    present(process.env.APPLE_OAUTH_CLIENT_ID) ??
    present(process.env.APPLE_SERVICES_ID) ??
    present(process.env.APPLE_CLIENT_ID);
  return {
    google: { configured: Boolean(googleClientId), clientId: googleClientId },
    apple: { configured: Boolean(appleClientId), clientId: appleClientId },
  };
}

export function oauthProviderConfigured(provider: OAuthProvider): boolean {
  const row = tripOAuthProviders();
  return provider === "google" ? row.google.configured : row.apple.configured;
}