import { clientAddress, rateLimit } from "../../../support/rate-limit";
import { parseSupportInput } from "../../../support/parse";
import { createSupportRequest } from "../../../support/requests";

const MESSAGE_LIMIT = 3;
const MESSAGE_WINDOW_MS = 60 * 60 * 1000;

function json(body: unknown, status = 200, extra?: HeadersInit) {
  return Response.json(body, { status, headers: extra });
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    const input: unknown = await request.json();
    if (typeof input !== "object" || input === null || Array.isArray(input)) {
      return json({ error: "Send the form again in a moment." }, 400);
    }
    body = input as Record<string, unknown>;
  } catch {
    return json({ error: "Send the form again in a moment." }, 400);
  }

  const parsed = parseSupportInput({
    name: body.name,
    email: body.email,
    topic: body.topic,
    message: body.message,
    pagePath: body.pagePath,
    website: body.website,
  });

  if (!parsed.ok) {
    return json({ error: parsed.message }, 400);
  }

  if (parsed.honeypot) {
    return json({ ok: true });
  }

  const ip = clientAddress(request);
  const ipLimit = rateLimit(`support-message:ip:${ip}`, MESSAGE_LIMIT, MESSAGE_WINDOW_MS);
  const emailLimit = rateLimit(
    `support-message:email:${parsed.email}`,
    MESSAGE_LIMIT,
    MESSAGE_WINDOW_MS,
  );
  const blocked = !ipLimit.ok ? ipLimit : !emailLimit.ok ? emailLimit : null;
  if (blocked) {
    return json(
      {
        error:
          "A few messages are already on file from this side. Try again later, or write hello@dirtydecember.info.",
      },
      429,
      { "Retry-After": String(blocked.retryAfterSec) },
    );
  }

  const stored = await createSupportRequest({
    name: parsed.name,
    email: parsed.email,
    topic: parsed.topic,
    message: parsed.message,
    pagePath: parsed.pagePath,
  });

  if (!stored.ok) {
    const status = stored.reason === "invalid" ? 400 : stored.reason === "needs-migration" || stored.reason === "no-key" ? 503 : 500;
    return json(
      {
        error:
          stored.reason === "needs-migration" || stored.reason === "no-key"
            ? "The inbox is not ready to store messages yet. Write hello@dirtydecember.info and the team will read it there."
            : stored.message,
      },
      status,
    );
  }

  return json({ ok: true });
}
