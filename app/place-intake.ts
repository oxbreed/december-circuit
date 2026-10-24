/** Cities and categories accepted on the free place / business intake form. */

export type GeocodeCandidate = {
  osmId: string;
  name: string;
  displayName: string;
  latitude: number;
  longitude: number;
};

export const intakeCities = ["Lagos", "Accra", "Calabar"] as const;
export type IntakeCity = (typeof intakeCities)[number];

export const intakeCategories = [
  "Hotels",
  "Short-stay",
  "Bars",
  "Car rental",
  "Catering",
  "Clubs",
  "Event centres",
  "Practical stops",
  "Restaurants",
] as const;
export type IntakeCategory = (typeof intakeCategories)[number];

export const intakeKinds = ["place", "business"] as const;
export type IntakeKind = (typeof intakeKinds)[number];

export function isIntakeCity(value: string): value is IntakeCity {
  return (intakeCities as readonly string[]).includes(value);
}

export function isIntakeCategory(value: string): value is IntakeCategory {
  return (intakeCategories as readonly string[]).includes(value);
}

export function isIntakeKind(value: string): value is IntakeKind {
  return (intakeKinds as readonly string[]).includes(value);
}

/** Country hint for Nominatim, keyed by the intake city. */
export function intakeCityCountry(city: IntakeCity): string {
  if (city === "Accra") return "Ghana";
  return "Nigeria";
}
