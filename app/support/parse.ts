import { isSupportTopic, type SupportTopic } from "./topics";

const NAME_MAX = 80;
const MESSAGE_MIN = 10;
const MESSAGE_MAX = 2000;
const EMAIL_MAX = 320;
const PATH_MAX = 300;

function clip(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

function cleanName(value: unknown) {
  const name = clip(value, NAME_MAX);
  return name.length > 0 ? name : null;
}

function cleanEmail(value: unknown) {
  const email = clip(value, EMAIL_MAX).toLowerCase();
  if (email.length < 3 || email.length > EMAIL_MAX) return null;
  const at = email.indexOf("@");
  if (at < 1 || at === email.length - 1) return null;
  if (email.includes(" ") || email.includes("..")) return null;
  const domain = email.slice(at + 1);
  if (!domain.includes(".") || domain.startsWith(".") || domain.endsWith(".")) return null;
  return email;
}

function cleanMessage(value: unknown) {
  if (typeof value !== "string") return null;
  const message = value.replace(/\r\n/g, "\n").trim();
  if (message.length < MESSAGE_MIN || message.length > MESSAGE_MAX) return null;
  return message;
}

function cleanTopic(value: unknown): SupportTopic | null {
  if (typeof value !== "string") return null;
  return isSupportTopic(value) ? value : null;
}

function cleanPagePath(value: unknown) {
  if (value == null || value === "") return null;
  if (typeof value !== "string") return null;
  let raw = value.trim();
  if (!raw) return null;
  try {
    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      raw = new URL(raw).pathname;
    }
  } catch {
    return null;
  }
  if (!raw.startsWith("/")) return null;
  const pathOnly = raw.split("?")[0]?.split("#")[0] ?? raw;
  if (pathOnly.length < 1 || pathOnly.length > PATH_MAX) return null;
  if (pathOnly.includes("://") || pathOnly.includes("\\")) return null;
  return pathOnly;
}

export function parseSupportInput(input: {
  name?: unknown;
  email?: unknown;
  topic?: unknown;
  message?: unknown;
  pagePath?: unknown;
  website?: unknown;
}):
  | { ok: true; honeypot: true }
  | {
      ok: true;
      honeypot: false;
      name: string;
      email: string;
      topic: SupportTopic;
      message: string;
      pagePath: string | null;
    }
  | { ok: false; message: string } {
  const honeypot = typeof input.website === "string" ? input.website.trim() : "";
  if (honeypot.length > 0) {
    return { ok: true, honeypot: true };
  }

  const name = cleanName(input.name);
  if (!name) {
    return { ok: false, message: "Add your name, up to 80 characters." };
  }
  const email = cleanEmail(input.email);
  if (!email) {
    return { ok: false, message: "Add a working email address so the team can reply." };
  }
  const topic = cleanTopic(input.topic);
  if (!topic) {
    return { ok: false, message: "Choose a topic for this message." };
  }
  const message = cleanMessage(input.message);
  if (!message) {
    return {
      ok: false,
      message: `Write a message of ${MESSAGE_MIN} to ${MESSAGE_MAX} characters.`,
    };
  }
  return {
    ok: true,
    honeypot: false,
    name,
    email,
    topic,
    message,
    pagePath: cleanPagePath(input.pagePath),
  };
}
