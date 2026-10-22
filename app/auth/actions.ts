"use server";

import { redirect } from "next/navigation";
import { directorySignIn } from "../directory-auth";
import { siteUrl } from "../site";
import { createDirectoryClient } from "../supabase/server";

export type SignInState = { status: "idle" | "sent" | "error"; message?: string };

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
    return { status: "error", message: "The sign-in link could not be sent." };
  }
  return { status: "sent" };
}

export async function signOut() {
  const supabase = await createDirectoryClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/sign-in");
}
