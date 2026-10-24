import { SupportChat } from "./support-chat";

function hasKey(name: "OPENAI_API_KEY" | "ANTHROPIC_API_KEY") {
  const value = process.env[name]?.trim();
  return Boolean(value && value.length > 0);
}

export function SupportChatSlot() {
  const liveModel = hasKey("OPENAI_API_KEY") || hasKey("ANTHROPIC_API_KEY");
  return <SupportChat liveModel={liveModel} />;
}
