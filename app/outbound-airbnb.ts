export type AirbnbCitySearch = {
  city: string;
  country: string;
  url: string;
};

export const airbnbCitySearches: readonly AirbnbCitySearch[] = [
  { city: "Lagos", country: "Nigeria", url: "https://www.airbnb.com/s/Lagos--Nigeria/homes" },
  { city: "Accra", country: "Ghana", url: "https://www.airbnb.com/s/Accra--Ghana/homes" },
  { city: "Calabar", country: "Nigeria", url: "https://www.airbnb.com/s/Calabar--Nigeria/homes" },
] as const;

export const airbnbSearchNote =
  "Each link opens Airbnb’s own city search. This site does not list stays, prices, or availability, and does not take payment.";
