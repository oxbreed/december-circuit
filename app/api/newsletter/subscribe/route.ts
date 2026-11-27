import { readBrevoConfig } from "../../../newsletter-config";
import { parseNewsletterInput } from "../../../newsletter-parse";
import { clientAddress, rateLimit } from "../../../support/rate-limit";

const IP_LIMIT = 5;
const IP_WINDOW_MS = 10 * 60 * 1000;
const EMAIL_LIMIT = 3;
const EMAIL_WINDOW_MS = 60 * 60 * 1000;


function json(body: unknown, status = 200, extra?: HeadersInit) {
  return Response.json(body, { status, headers: extra });
}

export async function GET() {
  return json({ live: readBrevoConfig() !== null });
}

export async function POST(request: Request) {
  const config = readBrevoConfig();
  if (!config) {
    return json(
      {
        ok: false,
        status: "unavailable",
        error: "Email list coming soon.",
      },
      503,
    );
  }

  let body: Record<string, unknown>;
  try {
    const input: unknown = await request.json();
    if (typeof input !== "object" || input === null || Array.isArray(input)) {
      return json({ ok: false, error: "Send the form again in a moment." }, 400);
    }
    body = input as Record<string, unknown>;
  } catch {
    return json({ ok: false, error: "Send the form again in a moment." }, 400);
  }

  const parsed = parseNewsletterInput({
    email: body.email,
    consent: body.consent,
    website: body.website,
    ref: body.ref,
  });

  if (!parsed.ok) {
    return json({ ok: false, error: parsed.message }, 400);
  }

  if (parsed.honeypot) {
    return json({ ok: true, status: "confirm" });
  }

  const ip = clientAddress(request);
  const ipLimit = rateLimit(`newsletter:ip:${ip}`, IP_LIMIT, IP_WINDOW_MS);
  const emailLimit = rateLimit(
    `newsletter:email:${parsed.email}`,
    EMAIL_LIMIT,
    EMAIL_WINDOW_MS,
  );
  const blocked = !ipLimit.ok ? ipLimit : !emailLimit.ok ? emailLimit : null;
  if (blocked) {
    return json(
      {
        ok: false,
        error:
          "A few signups have already been tried from this side. Try again in a little while, or write hello@dirtydecember.info.",
      },
      429,
      { "Retry-After": String(blocked.retryAfterSec) },
    );
  }

  const payload: Record<string, unknown> = {
    email: parsed.email,
    includeListIds: [config.listId],
    templateId: config.templateId,
    redirectionUrl: config.redirectUrl,
  };
  if (parsed.ref) {
    payload.attributes = { REFERRAL: parsed.ref };
  }

  let response: Response;
  try {
    response = await fetch("https://api.brevo.com/v3/contacts/doubleOptinConfirmation", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": config.apiKey,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    return json(
      {
        ok: false,
        error:
          "We couldn't add that address just now. Try again in a moment, or write hello@dirtydecember.info.",
      },
      502,
    );
  }

  if (response.ok || response.status === 204) {
    return json({ ok: true, status: "confirm" });
  }

  // Already in the list, or a confirmation is already pending — do not leak which.
  if (response.status === 400) {
    return json({ ok: true, status: "confirm" });
  }

  return json(
    {
      ok: false,
      error:
        "We couldn't add that address just now. Try again in a moment, or write hello@dirtydecember.info.",
    },
    response.status === 401 || response.status === 403 || response.status === 404
      ? 503
      : 502,
  );
}
