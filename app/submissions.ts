"use server";

import { directorySignIn } from "./directory-auth";
import { createAnonClient } from "./supabase/server";

export type SaveState = { status: "idle" | "saved" | "error"; message?: string };

const kinds = ["event", "product", "transportation", "booking"] as const;
type Kind = (typeof kinds)[number];

function field(formData: FormData, name: string, max: number) {
  const value = String(formData.get(name) ?? "").trim();
  if (!value || value.length > max) return null;
  return value;
}

function httpUrl(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

function emailAddress(value: string | null) {
  if (!value) return null;
  const email = value.toLowerCase();
  if (!email.includes("@") || /\s/.test(email) || email.length > 320) return null;
  return email;
}

export async function saveSubmission(_prev: SaveState, formData: FormData): Promise<SaveState> {
  if (!directorySignIn().connected) {
    return { status: "error", message: "The directory is not connected. Use the email button." };
  }
  const kind = String(formData.get("kind") ?? "");
  if (!kinds.includes(kind as Kind)) {
    return { status: "error", message: "This submission could not be saved." };
  }
  const senderEmail = emailAddress(field(formData, "email", 320));
  const publicLink = httpUrl(field(formData, "link", 2000));
  if (!senderEmail || !publicLink) {
    return { status: "error", message: "Enter a sender email and a public http(s) link." };
  }

  const row: {
    kind: Kind;
    status: "unpublished";
    sender_email: string;
    public_link: string;
    event_name?: string;
    city?: string;
    dates?: string;
    venue?: string;
    product_name?: string;
    business_name?: string;
    offer?: string;
  } = {
    kind: kind as Kind,
    status: "unpublished",
    sender_email: senderEmail,
    public_link: publicLink,
  };

  if (kind === "event") {
    const eventName = field(formData, "name", 200);
    const city = field(formData, "city", 120);
    const dates = field(formData, "dates", 120);
    const venue = field(formData, "venue", 200);
    if (!eventName || !city || !dates || !venue) {
      return { status: "error", message: "Enter the event name, city, dates, and venue." };
    }
    row.event_name = eventName;
    row.city = city;
    row.dates = dates;
    row.venue = venue;
  } else if (kind === "product") {
    const productName = field(formData, "product", 200);
    const businessName = field(formData, "business", 200);
    if (!productName || !businessName) {
      return { status: "error", message: "Enter the product name and the business name." };
    }
    row.product_name = productName;
    row.business_name = businessName;
  } else {
    const businessName = field(formData, "business", 200);
    const offer = field(formData, "offer", 500);
    if (!businessName || !offer) {
      return { status: "error", message: "Enter the business name and what they offer." };
    }
    row.business_name = businessName;
    row.offer = offer;
  }

  const supabase = createAnonClient();
  if (!supabase) {
    return { status: "error", message: "The directory is not connected. Use the email button." };
  }
  const { error } = await supabase.from("submissions").insert(row);
  if (error) {
    return { status: "error", message: "The submission could not be saved." };
  }
  if (kind === "event") {
    return {
      status: "saved",
      message: "Saved as unpublished. It is not on the public event list.",
    };
  }
  return {
    status: "saved",
    message: "Saved as unpublished. It stays off the site until it is checked.",
  };
}
