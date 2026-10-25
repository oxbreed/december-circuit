import "server-only";

import { disclaimer } from "../brand";
import { events } from "../events";
import { eventNameAndVenue } from "../event-view";
import { faqAnswerPlain, faqItems } from "../faq-items";

/** Visa and entry facts as published on /guide#entry. Keep in step with that page. */
const entryFacts = `
Visa and entry (/guide#entry)
Lagos and Calabar are in Nigeria. Accra is in Ghana. The lines below repeat the linked government page. This site does not take a visa application or a payment.

Nigeria
The Nigeria Immigration Service page for the Tourism Visa (F5A) describes a single-entry visa granted to persons who wish to visit Nigeria for the purpose of tourism. It states eligibility as citizens of all countries except ECOWAS member states and other countries which Nigeria has entered into visa abolition or waiver agreements.
Requirements listed on that page:
- Valid passport, not less than 6 months validity.
- Passport size photo.
- Evidence of a return ticket.
- Evidence of hotel reservations or a host address in Nigeria.
- Evidence of sufficient funds, a 180 days bank statement.
- Minors below 18 years, accompanied by an adult, provide a birth certificate and a parental consent letter.
The page states validity of 90 days from issuance, that it is not extendable, a stay of 30 days, single entry within that validity, and no employment. It says the visa is permitted for tourism only. The steps it lists are to gather documentation, apply online by e-Visa or embassy, upload the requirements and pay visa fees, and obtain the visa.
Official link: https://immigration.gov.ng/info-center/tourism-visa-f5a/
This directory does not state a visa fee amount. Fees are paid on the official process, not here.

Ghana
The Ghana Immigration Service says a visa is an authorisation to travel and present oneself for entry into Ghana, and that a visa is not a guarantee of entry. It says a person other than a citizen of Ghana entering Ghana must be in possession of a valid passport or other travel document and a valid visa where necessary.
It says some countries in West Africa, ECOWAS member states, and some other countries in Africa are exempted from obtaining a visa before entering Ghana. Its visa regime lists ECOWAS states, including Nigeria, as visa not required for all types of passports. It says nationals from African Union member states who are not ECOWAS nationals may obtain a visa on arrival after payment of the required fees. It also says holders of diplomatic or service passports of selected countries, persons in direct airside transit, and holders of official passports of some specialised agencies are exempt from obtaining a visa.
For a Ghana entry visa, that service lists these requirements:
- The applicant should be legally resident in the country where Ghana’s mission is sited.
- Passport photographs taken not more than three months before submission.
- A copy of a return ticket or a print-out of the travel itinerary.
- An international certificate of vaccination for yellow fever.
- A passport with validity of at least six months.
The same page states that a business visa also needs a letter from the applicant’s organisation and a supporting letter from business associates in Ghana, that a study visa also needs a letter from the institution abroad and a letter of acceptance from the institution in Ghana, and that an employment visa also needs an employment contract and proof of a grant of employment quota.
Official links: https://gis.gov.gh/permits-and-visas/ and https://gis.gov.gh/visas/
This directory does not state a visa fee amount. Fees are paid on the official process, not here.
`.trim();

const aboutPrivacy = `
About and privacy (one-liners)
${disclaimer}
This site is an independent directory. A listing appears only when an organiser page or a named report confirms it.
This site takes no payment and holds no bookings. A ticket link leaves this site. A flight row opens a search, not a fare or a seat.
Bolt and inDrive appear as outbound third-party ride-app links for Nigeria and Ghana. This site does not book rides or quote fares or ETAs.
A newsletter, a fare, or a payment is not offered yet.
Oxbreed Management operates dirtydecember.info. Visitor enquiries: hello@dirtydecember.info.
`.trim();

function eventsBlock() {
  const lines = events.map((event) => {
    const { name } = eventNameAndVenue(event.summary);
    const source = event.urlLabel?.trim() || "Source on file";
    return [
      `- Name: ${name}`,
      `  City: ${event.region}`,
      `  When: ${event.when}`,
      `  Summary: ${event.summary}`,
      `  Source label: ${source}`,
    ].join("\n");
  });
  return ["Confirmed events (from the site file only)", ...lines].join("\n");
}

function faqBlock() {
  return [
    "FAQ",
    ...faqItems.map(
      (item) => `Q: ${item.question}\nA: ${faqAnswerPlain(item.answer)}`,
    ),
  ].join("\n\n");
}

export function supportGrounding() {
  return [faqBlock(), entryFacts, eventsBlock(), aboutPrivacy].join("\n\n");
}

export const supportSystemPrompt = `You are “December guide,” the friendly support chat for dirtydecember.info — an independent community directory for diaspora visitors planning Detty December travel. Sound like a helpful person on the team: warm, clear, short sentences. Not a legal notice or a database dump.

Rules:
- Answer only from the GROUNDED CONTENT below.
- Do not invent events, venues, prices, ticket fares, visa fees, booking availability, or dates that are not in the grounded content.
- Do not claim affiliation with Livespot360 or Detty December Fest™. The site is independent.
- Never take payment or imply that checkout exists on this site.
- Flights on this site are search links, not fares or seats.
- If the answer is not in the grounded content, say so kindly — for example: “I’m not sure from what’s listed — the FAQ or hello@dirtydecember.info might help.” Point to /faq, /guide#entry, /list, or hello@dirtydecember.info when useful.
- Prefer natural lead-ins like “Here’s what we have…” instead of “From the site:” or “According to our database.”
- Keep replies short (a few short paragraphs at most). No markdown tables. Links may be written as paths.

GROUNDED CONTENT:
`;
