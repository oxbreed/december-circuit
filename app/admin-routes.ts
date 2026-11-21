export type AdminSection =
  | "overview"
  | "approvals"
  | "events"
  | "places"
  | "featured"
  | "landmarks"
  | "affiliates"
  | "dashboard"
  | "audit"
  | "reviews"
  | "probes"
  | "settings"
  | "search";

export function hrefForSection(section: AdminSection, extra?: Record<string, string>) {
  const params = new URLSearchParams();
  if (section !== "overview") params.set("section", section);
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      if (value) params.set(key, value);
    }
  }
  const qs = params.toString();
  return qs ? `/admin?${qs}` : "/admin";
}
