/** Sourced visa copy shared by /guide#entry and /visa — official pages only. */

const linkClass =
  "text-sm text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide";

export function VisaSections({ headingLevel = "h2" }: { headingLevel?: "h2" | "h1" }) {
  const NigeriaHeading = headingLevel === "h1" ? "h2" : "h3";
  const GhanaHeading = headingLevel === "h1" ? "h2" : "h3";
  const nigeriaClass =
    headingLevel === "h1"
      ? "mt-10 font-display text-3xl leading-tight tracking-tight"
      : "mt-8 font-display text-2xl leading-tight tracking-tight";
  const ghanaClass = nigeriaClass;

  return (
    <>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
        Lagos and Calabar are in Nigeria. Accra is in Ghana. The lines below repeat the linked
        government page. This site does not take a visa application or a payment.
      </p>

      <NigeriaHeading className={nigeriaClass}>Nigeria</NigeriaHeading>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-ink">
        The Nigeria Immigration Service page for the Tourism Visa (F5A) describes a single-entry
        visa granted to persons who wish to visit Nigeria for the purpose of tourism. It states
        eligibility as citizens of all countries except ECOWAS member states and other countries
        which Nigeria has entered into visa abolition or waiver agreements.
      </p>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-ink">That page lists these requirements:</p>
      <ul className="mt-3 max-w-2xl list-disc space-y-1 pl-5 text-sm leading-7 text-ink">
        <li>Valid passport, not less than 6 months validity.</li>
        <li>Passport size photo.</li>
        <li>Evidence of a return ticket.</li>
        <li>Evidence of hotel reservations or a host address in Nigeria.</li>
        <li>Evidence of sufficient funds, a 180 days bank statement.</li>
        <li>
          Minors below 18 years, accompanied by an adult, provide a birth certificate and a parental
          consent letter.
        </li>
      </ul>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-ink">
        The page states validity of 90 days from issuance, that it is not extendable, a stay of 30
        days, single entry within that validity, and no employment. It says the visa is permitted
        for tourism only. The steps it lists are to gather documentation, apply online by e-Visa or
        embassy, upload the requirements and pay visa fees, and obtain the visa.
      </p>
      <p className="mt-3">
        <a
          href="https://immigration.gov.ng/info-center/tourism-visa-f5a/"
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          Nigeria Immigration Service, Tourism Visa (F5A) — leaves this site
        </a>
      </p>

      <GhanaHeading className={ghanaClass}>Ghana</GhanaHeading>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-ink">
        The Ghana Immigration Service says a visa is an authorisation to travel and present oneself
        for entry into Ghana, and that a visa is not a guarantee of entry. It says a person other
        than a citizen of Ghana entering Ghana must be in possession of a valid passport or other
        travel document and a valid visa where necessary.
      </p>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-ink">
        It says some countries in West Africa, ECOWAS member states, and some other countries in
        Africa are exempted from obtaining a visa before entering Ghana. Its visa regime lists
        ECOWAS states, including Nigeria, as visa not required for all types of passports. It says
        nationals from African Union member states who are not ECOWAS nationals may obtain a visa on
        arrival after payment of the required fees. It also says holders of diplomatic or service
        passports of selected countries, persons in direct airside transit, and holders of official
        passports of some specialised agencies are exempt from obtaining a visa.
      </p>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-ink">
        For a Ghana entry visa, that service lists these requirements:
      </p>
      <ul className="mt-3 max-w-2xl list-disc space-y-1 pl-5 text-sm leading-7 text-ink">
        <li>
          The applicant should be legally resident in the country where Ghana’s mission is sited.
        </li>
        <li>Passport photographs taken not more than three months before submission.</li>
        <li>A copy of a return ticket or a print-out of the travel itinerary.</li>
        <li>An international certificate of vaccination for yellow fever.</li>
        <li>A passport with validity of at least six months.</li>
      </ul>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-ink">
        The same page states that a business visa also needs a letter from the applicant’s
        organisation and a supporting letter from business associates in Ghana, that a study visa
        also needs a letter from the institution abroad and a letter of acceptance from the
        institution in Ghana, and that an employment visa also needs an employment contract and
        proof of a grant of employment quota.
      </p>
      <p className="mt-3 flex flex-col items-start gap-2">
        <a
          href="https://gis.gov.gh/permits-and-visas/"
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          Ghana Immigration Service, permits and visas — leaves this site
        </a>
        <a
          href="https://gis.gov.gh/visas/"
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          Ghana Immigration Service, visas — leaves this site
        </a>
      </p>
    </>
  );
}
