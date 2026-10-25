/**
 * Official marketing / regional entry points for third-party ride apps
 * across DirtyDecember countries. Outbound only — no booking, fares, or ETAs.
 * Include an app only when an official page confirms that market.
 */
export type RideHailApp = {
  name: string;
  label: string;
  url: string;
  /** Official page used to confirm this market. */
  source: string;
};

export type RideHailMarket = {
  country: string;
  /** DirtyDecember cities on file where the linked apps list service. */
  citiesOnFile: string[];
  apps: RideHailApp[];
};

export const rideHailMarkets: RideHailMarket[] = [
  {
    country: "Nigeria",
    citiesOnFile: [
      "Lagos",
      "Abuja",
      "Port Harcourt",
      "Calabar",
      "Enugu",
      "Ibadan",
      "Kaduna",
      "Kano",
      "Benin City",
      "Warri",
      "Owerri",
      "Uyo",
      "Abeokuta",
      "Akure",
      "Asaba",
      "Awka",
      "Bauchi",
      "Abakaliki",
      "Ado Ekiti",
      "Ilorin",
      "Jos",
      "Lafia",
      "Lokoja",
      "Makurdi",
      "Onitsha",
      "Oshogbo",
      "Umuahia",
      "Yenagoa",
      "Zaria",
    ],
    apps: [
      {
        name: "Bolt",
        label: "Nigeria rides",
        url: "https://bolt.eu/en-ng/rides/",
        source: "https://bolt.eu/en-ng/rides/ · cities https://bolt.eu/en-ng/cities/",
      },
      {
        name: "inDrive",
        label: "Nigeria",
        url: "https://indrive.com/en-ng",
        source: "https://indrive.com/en-ng",
      },
    ],
  },
  {
    country: "Ghana",
    citiesOnFile: [
      "Accra",
      "Kumasi",
      "Cape Coast",
      "Ho",
      "Takoradi",
      "Tamale",
    ],
    apps: [
      {
        name: "Bolt",
        label: "Ghana cities",
        url: "https://bolt.eu/en-gh/cities/",
        source: "https://bolt.eu/en-gh/cities/",
      },
      {
        name: "inDrive",
        label: "Ghana",
        url: "https://indrive.com/en-gh",
        source: "https://indrive.com/en-gh",
      },
      {
        name: "Uber",
        label: "Ghana cities",
        url: "https://www.uber.com/global/en/r/ghana/cities/",
        source: "https://www.uber.com/global/en/r/ghana/cities/",
      },
      {
        name: "Yango",
        label: "Ghana (Accra, Kumasi)",
        url: "https://yango.com/en_gh/",
        source: "https://yango.com/en_gh/ · company cities https://yango.com/en_gh/company/",
      },
    ],
  },
  {
    country: "Côte d’Ivoire",
    citiesOnFile: ["Abidjan", "Yamoussoukro"],
    apps: [
      {
        name: "Yango",
        label: "Côte d’Ivoire",
        url: "https://yango.com/en_ci/",
        source: "https://yango.com/en_ci/ · rider cities https://yango.com/en_ci/rider/",
      },
      {
        name: "Heetch",
        label: "Côte d’Ivoire (Abidjan)",
        url: "https://www.heetch.com/en/pays/cote-divoire",
        source: "https://www.heetch.com/en/pays/cote-divoire",
      },
    ],
  },
  {
    country: "Cameroon",
    citiesOnFile: ["Douala", "Yaoundé"],
    apps: [
      {
        name: "Yango",
        label: "Cameroon",
        url: "https://yango.com/en_cm/",
        source: "https://yango.com/en_cm/ · company cities https://yango.com/en_gh/company/",
      },
      {
        name: "Gozem",
        label: "Cameroon",
        url: "https://website.gozem.co/corporate-cm/en/homepage-en/",
        source: "https://website.gozem.co/corporate-cm/en/homepage-en/ · https://gozem.co/en/",
      },
    ],
  },
  {
    country: "Benin",
    citiesOnFile: ["Cotonou"],
    apps: [
      {
        name: "Gozem",
        label: "Benin",
        url: "https://website.gozem.co/corporate-bj/en/homepage-en/",
        source: "https://website.gozem.co/corporate-bj/en/homepage-en/ · https://gozem.co/en/",
      },
    ],
  },
  {
    country: "Togo",
    citiesOnFile: ["Lomé"],
    apps: [
      {
        name: "Gozem",
        label: "Togo",
        url: "https://website.gozem.co/corporate-tg/en/homepage-en/",
        source: "https://website.gozem.co/corporate-tg/en/homepage-en/ · https://gozem.co/en/",
      },
    ],
  },
];

/** Flat outbound links for footer and simple lists. */
export const rideHailLinks = rideHailMarkets.flatMap((market) =>
  market.apps.map((app) => ({
    name: app.name,
    region: `${market.country} · ${app.label}`,
    url: app.url,
    country: market.country,
  })),
);

export const rideHailNote =
  "Third-party ride apps by country for cities already on this directory. Each link opens that app’s official site — not a booking, fare, or ETA here. Burkina Faso and Niger stay without a ride-app link until an official page confirms one. Uber is not linked for Nigeria after its 2026 exit.";
