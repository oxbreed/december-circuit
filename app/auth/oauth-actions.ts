"use server";

import { redirect } from "next/navigation";
import { directorySignIn } from "../directory-auth";
import { siteUrl } from "../site";
import { oauthProviderConfigured, type OAuthProvider } from "../trip-oauth";
import { createDirectoryClient } from "../supabase/server";

export type OAuthSignInState = { status: "idle" | "error"; message?: string };

function notConfiguredMessage(provider: OAuthProvider): string {
  return provider === "google"
    ? "Google sign-in is not configured on this deployment."
    : "Apple sign-in is not configured on this deployment.";
}

export async function signInWithOAuthProvider(
  _prev: OAuthSignInState,
  formData: FormData,
): Promise<OAuthSignInState> {
  const provider = formData.get("provider");
  if (provider !== "google" && provider !== "apple") {
    return { status: "error", message: "Unknown sign-in provider." };
  }
  if (!directorySignIn().connected) {
    return { status: "error", message: "The directory sign-in is not connected yet." };
  }
  if (!oauthProviderConfigured(provider)) {
    return { status: "error", message: notConfiguredMessage(provider) };
  }
  const supabase = await createDirectoryClient();
  if (!supabase) {
    return { status: "error", message: "The directory sign-in is not connected yet." };
  }
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${siteUrl}/auth/callback` },
  });
  if (error) {
    return { status: "error", message: "Could not start sign-in." };
  }
  if (data.url) redirect(data.url);
  return { status: "error", message: "Could not start sign-in." };
}