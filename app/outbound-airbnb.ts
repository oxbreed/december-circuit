export type AirbnbCitySearch = {
  city: string;
  country: string;
  url: string;
};

export const airbnbCitySearches: readonly AirbnbCitySearch[] = [
  { city: "Lagos", country: "Nigeria", url: "https://www.airbnb.com/s/Lagos--Nigeria/homes" },
  { city: "Accra", country: "Ghana", url: "https://www.airbnb.com/s/Accra--Ghana/homes" },
  { city: "Calabar", country: "Nigeria", url: "https://www.airbnb.com/s/Calabar--Nigeria/homes" },
  { city: "Abuja", country: "Nigeria", url: "https://www.airbnb.com/s/Abuja--Nigeria/homes" },
  { city: "Port Harcourt", country: "Nigeria", url: "https://www.airbnb.com/s/Port-Harcourt--Nigeria/homes" },
  { city: "Ibadan", country: "Nigeria", url: "https://www.airbnb.com/s/Ibadan--Nigeria/homes" },
  { city: "Kumasi", country: "Ghana", url: "https://www.airbnb.com/s/Kumasi--Ghana/homes" },
] as const;

export const airbnbSearchNote =
  "Each link opens Airbnb’s own city search. These are plain links: this site earns nothing from them, and does not list stays, prices, or availability.";
