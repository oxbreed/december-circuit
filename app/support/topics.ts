export const supportTopics = [
  { id: "visitor", label: "Visitor question" },
  { id: "listing", label: "List an event or place" },
  { id: "partnership", label: "Partnership or placement" },
  { id: "other", label: "Something else" },
] as const;

export type SupportTopic = (typeof supportTopics)[number]["id"];
export type SupportStatus = "open" | "resolved";

export function isSupportTopic(value: string): value is SupportTopic {
  return supportTopics.some((topic) => topic.id === value);
}

export function isSupportStatus(value: string): value is SupportStatus {
  return value === "open" || value === "resolved";
}

export function supportTopicLabel(id: string) {
  return supportTopics.find((topic) => topic.id === id)?.label ?? id;
}
