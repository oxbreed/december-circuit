export type FaqItem = {
  question: string;
  /**
   * Plain answer. Optional links use [[href|label]].
   * The support agent strips the markup to plain text with the label.
   */
  answer: string;
};

export function faqAnswerPlain(answer: string) {
  return answer.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2");
}

export const faqItems: FaqItem[] = [
  {
    question: "What is dirtydecember.info?",
    answer:
      "An independent community directory of sourced December 2026 events, organiser pages, places, and flight searches. The home page opens on confirmed dates, stays by city, flight search links, entertainment headlines, and a trip list saved in this browser. Cities outside Lagos stay on the list.",
  },
  {
    question: "Are you affiliated with Detty December Fest or Livespot360?",
    answer:
      "No. This is an independent community directory. It is not affiliated with Livespot360 or Detty December Fest™. A Detty December Fest record can still appear when an organiser page or a named report confirms it, the same way any other sourced listing does.",
  },
  {
    question: "How do events get on the site?",
    answer:
      "A listing appears only when an organiser page or a named report confirms it. Dates come from that organiser page or that report. Every listed event shows when it was checked when that field exists. An organiser page or a news report can change after the record was checked.",
  },
  {
    question: "Why do some nights say they are not listed yet?",
    answer:
      "If a night is not confirmed on an organiser page or in a named news report, it is left out. When an organiser page still marks other nights as coming soon, that is what the listing repeats. A negative claim such as “unannounced” needs the organiser’s own page.",
  },
  {
    question: "Does this site sell tickets or take payment?",
    answer:
      "No. This site takes no payment and holds no bookings. A ticket link appears only when the record already has one, and that link leaves this site. A stay link and a flight search are not a purchase here either.",
  },
  {
    question: "How do flight searches work?",
    answer:
      "Each row on Flights opens a Google Flights search. It is a search, not a fare, a seat, or a booking. No booking is held on this site. Some origin cities use a dated December search window noted on that page; those dates are a starting search for the season.",
  },
  {
    question: "Where do I check visas and entry?",
    answer:
      "Open [[/guide#entry|Visa and entry]] in the guide. Lagos and Calabar are in Nigeria. Accra is in Ghana. The guide repeats the linked Nigeria Immigration Service and Ghana Immigration Service pages and does not take a visa application or a payment. Read those official links for the current rules.",
  },
  {
    question: "How do hotels and short stays work here?",
    answer:
      "Hotels and short-stay names on the home page and in the guide open that place’s own organiser page. Museums, ports, and other places stay on the places list the same way. This site does not take payment.",
  },
  {
    question: "How does the map work?",
    answer:
      "The map shows only places that already have a sourced coordinate. Pins draw on OpenStreetMap. Directions open an external map from that point.",
  },
  {
    question: "What is My trip?",
    answer:
      "Save an event or a place from this directory. The list under Plan your trip stays in this browser only. It is not an account. Each row shows the name and the link already stored on that record.",
  },
  {
    question: "How do I list an event or a place?",
    answer:
      "Use [[/list|List an event]]. An event or a show stays unpublished until a person checks it. Visitor listing mail goes to [[mailto:hello@dirtydecember.info|hello@dirtydecember.info]]. Labeled placements, product ads, and partnership notes go to [[mailto:partners@dirtydecember.info|partners@dirtydecember.info]]. Those placements are labeled, and this site does not take payment.",
  },
  {
    question: "Who do I contact?",
    answer:
      "Visitor enquiries: [[mailto:hello@dirtydecember.info|hello@dirtydecember.info]]. Partnership and placement: [[mailto:partners@dirtydecember.info|partners@dirtydecember.info]]. Privacy, terms, and the EULA are linked in the footer.",
  },
  {
    question: "Is there a support chat?",
    answer:
      "Yes. Open Support from the small button on any page. It answers from this site’s FAQ, the visa and entry guide, and the confirmed event list. It does not invent prices, fares, or bookings. If live AI is not connected, the panel still opens with links to the FAQ, Visa and entry, and List an event.",
  },
];
