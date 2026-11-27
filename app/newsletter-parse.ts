const EMAIL_MAX = 320;
const REF_MAX = 40;

export function cleanNewsletterEmail(value: unknown) {
  if (typeof value !== "string") return null;
  const email = value.replace(/\s+/g, " ").trim().toLowerCase().slice(0, EMAIL_MAX);
  if (email.length < 3 || email.length > EMAIL_MAX) return null;
  const at = email.indexOf("@");
  if (at < 1 || at === email.length - 1) return null;
  if (email.includes(" ") || email.includes("..")) return null;
  const domain = email.slice(at + 1);
  if (!domain.includes(".") || domain.startsWith(".") || domain.endsWith(".")) return null;
  return email;
}

export function cleanReferralCode(value: unknown) {
  if (value == null || value === "") return null;
  if (typeof value !== "string") return null;
  const ref = value.trim().slice(0, REF_MAX);
  if (!/^[A-Za-z0-9_-]+$/.test(ref)) return null;
  return ref;
}

export function parseNewsletterInput(input: {
  email?: unknown;
  consent?: unknown;
  website?: unknown;
  ref?: unknown;
}):
  | { ok: true; honeypot: true }
  | { ok: true; honeypot: false; email: string; ref: string | null }
  | { ok: false; message: string } {
  const honeypot = typeof input.website === "string" ? input.website.trim() : "";
  if (honeypot.length > 0) {
    return { ok: true, honeypot: true };
  }

  const email = cleanNewsletterEmail(input.email);
  if (!email) {
    return { ok: false, message: "Add a working email address." };
  }

  const consent =
    input.consent === true ||
    input.consent === "true" ||
    input.consent === "on" ||
    input.consent === "1";
  if (!consent) {
    return {
      ok: false,
      message: "Tick the box to confirm you want the event picks.",
    };
  }

  return { ok: true, honeypot: false, email, ref: cleanReferralCode(input.ref) };
}
