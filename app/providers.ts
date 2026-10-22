import "server-only";

/**
 * Provider status for the four sources that are not on the public event list.
 * This module does not call fetch. A missing key is "not connected". A present
 * key is still not a live integration: no request is sent and no event is added.
 */
const providers = [
  { name: "Ticketmaster", env: "TICKETMASTER_API_KEY" },
  { name: "JamBase", env: "JAMBASE_API_KEY" },
  { name: "Merpi/Syticks", env: "MERPI_API_KEY" },
  { name: "GetYourGuide", env: "GETYOURGUIDE_API_KEY" },
] as const;

export type ProviderReport = {
  name: (typeof providers)[number]["name"];
  connected: false;
  detail: "not connected" | "A key is set. This site has not called the provider.";
};

export function providerReports(): ProviderReport[] {
  return providers.map((provider) => {
    const key = process.env[provider.env]?.trim();
    if (!key) {
      return { name: provider.name, connected: false, detail: "not connected" };
    }
    return {
      name: provider.name,
      connected: false,
      detail: "A key is set. This site has not called the provider.",
    };
  });
}
