/** Sourced visa copy shared by /guide#entry and /visa — official pages only. */

import Link from "next/link";
import { visaCheck, type VisaDestination } from "../season-guides";

const linkClass =
  "text-sm text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide";

function DestinationBlock({
  destination,
  Heading,
  headingClass,
}: {
  destination: VisaDestination;
  Heading: "h2" | "h3";
  headingClass: string;
}) {
  const Tag = Heading;
  return (
    <>
      <Tag className={headingClass}>{destination.country}</Tag>
      {destination.country === "Nigeria" ? (
        <p className="mt-3 max-w-2xl text-sm leading-7 text-ink">
          The Nigeria Immigration Service page for the Tourism Visa (F5A) describes{" "}
          {destination.purpose.charAt(0).toLowerCase() + destination.purpose.slice(1)} It states
          eligibility as {destination.eligibility.charAt(0).toLowerCase() + destination.eligibility.slice(1)}
        </p>
      ) : (
        <>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-ink">
            The Ghana Immigration Service says {destination.purpose.charAt(0).toLowerCase() + destination.purpose.slice(1)}
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-ink">{destination.eligibility}</p>
        </>
      )}
      <p className="mt-3 max-w-2xl text-sm leading-7 text-ink">
        {destination.country === "Nigeria"
          ? "That page lists these requirements:"
          : "For a Ghana entry visa, that service lists these requirements:"}
      </p>
      <ul className="mt-3 max-w-2xl list-disc space-y-1 pl-5 text-sm leading-7 text-ink">
        {destination.requirements.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      {destination.validity ? (
        <p className="mt-3 max-w-2xl text-sm leading-7 text-ink">
          The page states: {destination.validity}{" "}
          {destination.steps
            ? `The steps it lists are to ${destination.steps.charAt(0).toLowerCase()}${destination.steps.slice(1)}`
            : null}
        </p>
      ) : null}
      {destination.alsoNeeds?.map((line) => (
        <p key={line} className="mt-3 max-w-2xl text-sm leading-7 text-ink">
          {line}
        </p>
      ))}
      <p className="mt-3 flex flex-col items-start gap-2">
        <a
          href={destination.officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          {destination.officialLabel} — leaves this site
        </a>
        {destination.secondaryUrl && destination.secondaryLabel ? (
          <a
            href={destination.secondaryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            {destination.secondaryLabel} — leaves this site
          </a>
        ) : null}
      </p>
    </>
  );
}

export function VisaSections({
  headingLevel = "h2",
  showNationalityLinks = true,
  passportNote,
}: {
  headingLevel?: "h2" | "h1";
  showNationalityLinks?: boolean;
  /** Extra framing for /visa/us|uk|canada — no invented rules. */
  passportNote?: string;
}) {
  const check = visaCheck();
  const nigeria = check.destinations.find((item) => item.country === "Nigeria");
  const ghana = check.destinations.find((item) => item.country === "Ghana");
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
      <p className="mt-3 max-w-2xl text-sm leading-7 text-ink">
        <span className="text-[11px] uppercase tracking-[0.18em] text-oxide">Check date</span>
        <span className="mt-1 block">
          Last verified against the official immigration pages on{" "}
          <time dateTime={check.checkedAt}>{check.checkedAtLabel}</time>.{" "}
          {check.note}
        </span>
      </p>
      {passportNote ? (
        <p className="mt-3 max-w-2xl border-l-2 border-oxide/40 pl-4 text-sm leading-7 text-ink">
          {passportNote}
        </p>
      ) : null}

      {nigeria ? (
        <DestinationBlock
          destination={nigeria}
          Heading={NigeriaHeading}
          headingClass={nigeriaClass}
        />
      ) : null}
      {ghana ? (
        <DestinationBlock
          destination={ghana}
          Heading={GhanaHeading}
          headingClass={ghanaClass}
        />
      ) : null}

      {showNationalityLinks ? (
        <p className="mt-8 max-w-2xl text-sm leading-7 text-muted">
          Travelling on a US, UK, or Canadian passport?{" "}
          {check.nationalityPages.map((page, index) => (
            <span key={page.slug}>
              {index > 0 ? " · " : null}
              <Link href={page.path} className={linkClass}>
                {page.travellerLabel} visa page
              </Link>
            </span>
          ))}
          . Same official sources; check date shown on each page.
        </p>
      ) : null}
    </>
  );
}
