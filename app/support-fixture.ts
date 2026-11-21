import type { SupportRequest } from "./support/requests";

export const fixtureSupportCounts = { open: 2, resolved: 1 };

export const fixtureSupportRequests: SupportRequest[] = [
  {
    id: "sup-open-1",
    name: "Ada Visitor",
    email: "ada@example.com",
    topic: "visitor",
    message:
      "Do I need a visa for a short stay in Lagos in December, and where do I start?",
    status: "open",
    page_path: "/guide",
    resolved_at: null,
    resolved_by: null,
    created_at: "2026-11-20T09:12:00.000Z",
    updated_at: "2026-11-20T09:12:00.000Z",
  },
  {
    id: "sup-open-2",
    name: "Kwame Organiser",
    email: "kwame@example.com",
    topic: "listing",
    message:
      "I would like to list a confirmed concert in Accra. The organiser page is ready. How should I send the details?",
    status: "open",
    page_path: "/list",
    resolved_at: null,
    resolved_by: null,
    created_at: "2026-11-19T16:40:00.000Z",
    updated_at: "2026-11-19T16:40:00.000Z",
  },
  {
    id: "sup-resolved-1",
    name: "Amara Partner",
    email: "amara@example.com",
    topic: "partnership",
    message: "We would like to ask about a labelled placement on the events page for late December.",
    status: "resolved",
    page_path: "/get-featured",
    resolved_at: "2026-11-18T14:05:00.000Z",
    resolved_by: "oxbreedmanagement@gmail.com",
    created_at: "2026-11-18T11:02:00.000Z",
    updated_at: "2026-11-18T14:05:00.000Z",
  },
];
