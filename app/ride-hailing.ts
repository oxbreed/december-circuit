/**
 * Official marketing / regional entry points for third-party ride apps
 * used around Lagos, Accra, and the wider region. Outbound only —
 * no booking, fares, or ETAs on this site.
 */
export type RideHailLink = {
  name: string;
  region: string;
  url: string;
};

export const rideHailLinks: RideHailLink[] = [
  {
    name: "Bolt",
    region: "Nigeria rides",
    url: "https://bolt.eu/en-ng/rides/",
  },
  {
    name: "Bolt",
    region: "Accra",
    url: "https://bolt.eu/en/cities/accra/",
  },
  {
    name: "inDrive",
    region: "Nigeria",
    url: "https://indrive.com/en-ng",
  },
  {
    name: "inDrive",
    region: "Ghana",
    url: "https://indrive.com/en-gh",
  },
];

export const rideHailNote =
  "Bolt and inDrive are third-party ride apps. Each link opens their site or app entry — not a booking, fare, or ETA on this directory.";
