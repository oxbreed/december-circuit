export type MapFilterGroup = "hotel" | "venue" | "party";

export function mapFilterGroupFromPlace(category: string): MapFilterGroup {
  const normalized = category.trim().toLowerCase();
  if (normalized === "hotels") return "hotel";
  if (normalized === "clubs" || normalized === "bars") return "party";
  return "venue";
}

export const MAP_FILTER_GROUP_LABELS: Record<MapFilterGroup, string> = {
  hotel: "Hotels",
  venue: "Venues",
  party: "Parties",
};