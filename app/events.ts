export type CircuitEvent = {
  region: string;
  when: string;
  summary: string;
  url?: string;
  urlLabel?: string;
};

export const events: CircuitEvent[] = [
  {
    region: "Lagos",
    when: "17-19 December",
    summary:
      "Davido, Oriade residency, three nights at the National Theatre, Iganmu.",
  },
  {
    region: "Lagos",
    when: "18-30 December",
    summary:
      "Detty December Fest. Wizkid on 18 December, DJ Tunez and Friends on 24 December, Tungba Christmas on 25 December. Other nights are still marked coming soon.",
    url: "https://dettydecfest.com/",
    urlLabel: "Organiser's page",
  },
  {
    region: "Lagos",
    when: "20 December",
    summary: "Flytime House of R&B, Brandy, Eko Convention Centre.",
  },
  {
    region: "Lagos",
    when: "21 December",
    summary:
      "Coca-Cola Rhythm Unplugged, Lil Baby and Kehlani, Eko Convention Centre.",
  },
  {
    region: "Lagos",
    when: "22-24 December",
    summary:
      "Flytime Fest, Eko Convention Centre. Headliners for 2026 are still unannounced.",
  },
  {
    region: "Lagos",
    when: "25 December",
    summary:
      "Flytime Circle, Eko Convention Centre. The lineup is still unannounced.",
  },
  {
    region: "Calabar",
    when: "26-30 December",
    summary:
      "Carnival Calabar. Theme: Rethinking Our Collective Destiny. Cultural Carnival on the 26th, Junior Carnival on the 27th, Parade of the Bands on the 28th, Bikers Carnival on the 29th, street party on the 30th.",
    url: "https://www.carnival.crossriverstate.gov.ng/",
    urlLabel: "Official page",
  },
  {
    region: "Ghana",
    when: "1 December 2026 to 3 January 2027",
    summary:
      "December in Ghana, under the Ghana Tourism Authority and the Black Star Experience. These season dates are official. Headliners are still unannounced.",
  },
];
