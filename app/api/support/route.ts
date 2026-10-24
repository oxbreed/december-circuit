import {
  supportGrounding,
  supportSystemPrompt,
} from "../../support/grounding";
import { matchGroundedReply } from "../../support/match";

const MAX_QUESTION = 500;
const MAX_REPLY_TOKENS = 350;
const TEMPERATURE = 0.2;
const MAX_HISTORY = 6;

type Turn = {
  role: "user" | "assistant";
  text: string;
};

type Body = {
  question?: unknown;
  history?: unknown;
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

function cleanHistory(value: unknown): Turn[] {
  if (!Array.isArray(value)) return [];
  const turns: Turn[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const role = (item as { role?: unknown }).role;
    const text = cleanQuestion((item as { text?: unknown }).text);
    if ((role !== "user" && role !== "assistant") || !text) continue;
    turns.push({ role, text });
  }
  return turns.slice(-MAX_HISTORY);
}

async function askOpenAI(apiKey: string, question: string, history: Turn[]) {
  const messages = [
    {
      role: "system" as const,
      content: `${supportSystemPrompt}${supportGrounding()}`,
    },
    ...history.map((turn) => ({
      role: turn.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content: turn.text,
    })),
    { role: "user" as const, content: question },
  ];

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
      messages,
    }),
  });

  if (!response.ok) return null;

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  return text && text.length > 0 ? text : null;
}

async function askAnthropic(apiKey: string, question: string, history: Turn[]) {
  const messages = [
    ...history.map((turn) => ({
      role: turn.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content: turn.text,
    })),
    { role: "user" as const, content: question },
  ];

  // Anthropic requires alternating roles starting with user.
  const normalized: { role: "user" | "assistant"; content: string }[] = [];
  for (const message of messages) {
    const last = normalized[normalized.length - 1];
    if (last && last.role === message.role) {
      last.content = `${last.content}\n\n${message.content}`;
    } else {
      normalized.push({ ...message });
    }
  }
  if (normalized[0]?.role !== "user") {
    normalized.unshift({ role: "user", content: question });
  }

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
      messages: normalized,
    }),
  });

  if (!response.ok) return null;

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

  const history = cleanHistory(body.history);
  const openaiKey = readKey("OPENAI_API_KEY");
  const anthropicKey = readKey("ANTHROPIC_API_KEY");

  if (openaiKey || anthropicKey) {
    const reply = openaiKey
      ? await askOpenAI(openaiKey, question, history)
      : await askAnthropic(anthropicKey!, question, history);

    if (reply) {
      return json({ mode: "live", reply });
    }

    // Fall through to site matching if the model call fails.
  }

  const matched = matchGroundedReply(question);
  return json({
    mode: "site",
    reply: matched.reply,
  });
}
