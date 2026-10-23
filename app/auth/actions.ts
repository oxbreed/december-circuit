"use server";

import { redirect } from "next/navigation";
import { directorySignIn } from "../directory-auth";
import { siteUrl } from "../site";
import { createDirectoryClient } from "../supabase/server";

export type SignInState = { status: "idle" | "sent" | "error"; message?: string };

function signInOtpMessage(error: { code?: string | null; message?: string | null }): string {
  const code = typeof error.code === "string" ? error.code.trim() : "";
  const message = typeof error.message === "string" ? error.message.trim() : "";
  const text = `${code}\n${message}`.toLowerCase().replace(/[_-]+/g, " ");

  if (text.includes("rate limit")) {
    return "Supabase has reached its mail limit. Wait an hour and try once.";
  }
  if (text.includes("email address not authorized")) {
    return "Supabase refused this address.";
  }
  if (text.includes("redirect")) {
    return "The return address was refused.";
  }
  if (text.includes("invalid api key") || /\b401\b/.test(code) || /\b401\b/.test(message)) {
    return "The project key was refused.";
  }
  if (/^[A-Za-z0-9_]{1,60}$/.test(code)) {
    return `The sign-in link could not be sent. (${code})`;
  }
  return "The sign-in link could not be sent.";
}

export async function sendSignInLink(_prev: SignInState, formData: FormData): Promise<SignInState> {
  if (!directorySignIn().connected) {
    return { status: "error", message: "The directory sign-in is not connected yet." };
  }
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email.includes("@") || /\s/.test(email) || email.length > 320) {
    return { status: "error", message: "Enter an email address." };
  }
  const supabase = await createDirectoryClient();
  if (!supabase) {
    return { status: "error", message: "The directory sign-in is not connected yet." };
  }
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${siteUrl}/auth/callback` },
  });
  if (error) {
    return { status: "error", message: signInOtpMessage(error) };
  }
  return { status: "sent" };
}

export async function signOut() {
  const supabase = await createDirectoryClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/sign-in");
}
