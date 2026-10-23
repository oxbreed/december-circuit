"use server";

import { directorySignIn } from "./directory-auth";
import {
  checkedPicture,
  PICTURE_SIZE_MESSAGE,
  PICTURE_STORE_MESSAGE,
  PICTURE_TYPE_MESSAGE,
} from "./submission-picture";
import { createAnonClient } from "./supabase/server";

export type SaveState = { status: "idle" | "saved" | "error"; message?: string };

const kinds = ["event", "product", "transportation", "booking", "placement"] as const;
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
    image_path?: string;
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
  } else if (kind === "transportation" || kind === "booking") {
    const businessName = field(formData, "business", 200);
    const offer = field(formData, "offer", 500);
    if (!businessName || !offer) {
      return { status: "error", message: "Enter the business name and what they offer." };
    }
    row.business_name = businessName;
    row.offer = offer;
  } else {
    const businessName = field(formData, "business", 200);
    if (!businessName) {
      return { status: "error", message: "Enter the business name." };
    }
    row.business_name = businessName;
  }

  const picture = await readPicture(formData);
  if (picture.status === "invalid") return { status: "error", message: picture.message };

  const supabase = createAnonClient();
  if (!supabase) {
    return { status: "error", message: "The directory is not connected. Use the email button." };
  }

  if (picture.status === "present") {
    const path = `${crypto.randomUUID()}.${picture.ext}`;
    const { error: uploadError } = await supabase.storage.from("submission-images").upload(path, picture.bytes, {
      contentType: picture.mime,
      upsert: false,
    });
    if (uploadError) {
      return { status: "error", message: PICTURE_STORE_MESSAGE };
    }
    row.image_path = path;
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

async function readPicture(
  formData: FormData,
): Promise<
  | { status: "absent" }
  | { status: "invalid"; message: string }
  | { status: "present"; bytes: Uint8Array; ext: "jpg" | "png" | "webp"; mime: "image/jpeg" | "image/png" | "image/webp" }
> {
  const value = formData.get("picture");
  if (!(value instanceof Blob) || value.size === 0) return { status: "absent" };
  const type = value.type;
  if (type !== "image/jpeg" && type !== "image/jpg" && type !== "image/png" && type !== "image/webp") {
    return { status: "invalid", message: PICTURE_TYPE_MESSAGE };
  }
  if (value.size > 4 * 1024 * 1024) return { status: "invalid", message: PICTURE_SIZE_MESSAGE };
  const bytes = new Uint8Array(await value.arrayBuffer());
  const checked = checkedPicture({ type, size: value.size, bytes });
  if (!checked.ok) return { status: "invalid", message: checked.message };
  return { status: "present", bytes, ext: checked.ext, mime: checked.mime };
}
