import {
  supportGrounding,
  supportSystemPrompt,
} from "../../support/grounding";

const MAX_QUESTION = 500;
const MAX_REPLY_TOKENS = 350;
const TEMPERATURE = 0.2;

type Body = {
  question?: unknown;
};

function readKey(name: "OPENAI_API_KEY" | "ANTHROPIC_API_KEY") {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : null;
}

function json(body: unknown, status = 200) {
  return Response.json(body, { status });
}

function cleanQuestion(value: unknown) {
  if (typeof value !== "string") return null;
  const text = value.replace(/\s+/g, " ").trim();
  if (text.length === 0 || text.length > MAX_QUESTION) return null;
  return text;
}

async function askOpenAI(apiKey: string, question: string) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: TEMPERATURE,
      max_tokens: MAX_REPLY_TOKENS,
      messages: [
        {
          role: "system",
          content: `${supportSystemPrompt}${supportGrounding()}`,
        },
        { role: "user", content: question },
      ],
    }),
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  return text && text.length > 0 ? text : null;
}

async function askAnthropic(apiKey: string, question: string) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-3-5-haiku-latest",
      max_tokens: MAX_REPLY_TOKENS,
      temperature: TEMPERATURE,
      system: `${supportSystemPrompt}${supportGrounding()}`,
      messages: [{ role: "user", content: question }],
    }),
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    content?: { type?: string; text?: string }[];
  };
  const text = data.content
    ?.filter((part) => part.type === "text" && part.text)
    .map((part) => part.text)
    .join("\n")
    .trim();
  return text && text.length > 0 ? text : null;
}

export async function POST(request: Request) {
  const openaiKey = readKey("OPENAI_API_KEY");
  const anthropicKey = readKey("ANTHROPIC_API_KEY");

  if (!openaiKey && !anthropicKey) {
    return json(
      {
        configured: false,
        reply:
          "Live AI answers are not connected on this deploy. Use the FAQ, Visa and entry, or List an event links instead.",
      },
      503,
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return json({ error: "Send a JSON body with a question." }, 400);
  }

  const question = cleanQuestion(body.question);
  if (!question) {
    return json(
      {
        error: `Ask a short question (1 to ${MAX_QUESTION} characters).`,
      },
      400,
    );
  }

  const reply = openaiKey
    ? await askOpenAI(openaiKey, question)
    : await askAnthropic(anthropicKey!, question);

  if (!reply) {
    return json(
      {
        configured: true,
        error:
          "The support service did not return an answer. Try again, or write to hello@dirtydecember.info.",
      },
      502,
    );
  }

  return json({ configured: true, reply });
}
