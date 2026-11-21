export const approvalTabs = ["pending", "approved", "rejected"] as const;
export type ApprovalTab = (typeof approvalTabs)[number];

export type ApprovalRow = {
  id: string;
  kind: string;
  status: "unpublished" | "approved" | "rejected";
  sender_email: string;
  event_name: string | null;
  city: string | null;
  dates: string | null;
  venue: string | null;
  product_name: string | null;
  business_name: string | null;
  offer: string | null;
  category: string | null;
  note: string | null;
  latitude: number | null;
  longitude: number | null;
  public_link: string | null;
  image_path: string | null;
  image_unreadable: boolean;
  review_note: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  published_slug: string | null;
  created_at: string;
};

export type ApprovalCounts = {
  pending: number;
  approved: number;
  rejected: number;
};

export function parseApprovalTab(value: string | string[] | undefined): ApprovalTab {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === "approved" || raw === "rejected") return raw;
  return "pending";
}

export function approvalTitle(row: Pick<ApprovalRow, "kind" | "event_name" | "business_name" | "product_name">) {
  return row.event_name || row.business_name || row.product_name || row.kind;
}
