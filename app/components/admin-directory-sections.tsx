import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import lastRun from "../../data/event-ingest/last-run.json";
import { directorySignIn } from "../directory-auth";
import { events, seedEvents } from "../events";
import { homeFeatureKeys, homeFeaturesFrom } from "../home-featured";
import { homeHeroSlides } from "../home-hero-slides";
import { listOutboundClicks } from "../outbound-clicks";
import { placesOnFile } from "../place-catalog";
import { listUnpublishedSubmissions } from "../reviews";
import { eventRowsForAdmin, placeRowsForAdmin } from "./admin-directory-data";
import { AdminEventList, AdminPlaceList } from "./admin-filter-list";

/**
 * Format a stored ISO timestamp in Europe/London.
 * dateStyle/timeStyle cannot be combined with timeZoneName (throws TypeError).
 */
function londonStamp(iso: string) {
  try {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(date);
  } catch (error) {
    console.error("Admin date stamp failed", error);
    return iso;
  }
}

function logAdminError(scope: string, error: unknown) {
  console.error(`Admin ${scope}`, error);
}

function OverviewCard({
  title,
  scope,
  reason,
  children,
}: {
  title: string;
  scope: string;
  reason: string;
  children: () => ReactNode;
}) {
  try {
    return children();
  } catch (error) {
    logAdminError(scope, error);
    return (
      <li className="border border-ink/15 bg-chart px-4 py-3">
        <p className="text-[10px] uppercase tracking-[0.16em] text-muted">{title}</p>
        <p className="mt-2 text-sm leading-6 text-muted">{reason}</p>
      </li>
    );
  }
}

function OverviewBlock({
  title,
  scope,
  reason,
  children,
}: {
  title: string;
  scope: string;
  reason: string;
  children: () => ReactNode;
}) {
  try {
    return children();
  } catch (error) {
    logAdminError(scope, error);
    return (
      <div className="mt-10 border-t border-ink/10 pt-6">
        <h3 className="text-[11px] uppercase tracking-[0.18em] text-muted">{title}</h3>
        <p className="mt-3 text-sm leading-7 text-muted">{reason}</p>
      </div>
    );
  }
}

function Status({ on, label, off }: { on: boolean; label: string; off: string }) {
  return (
    <li>
      {label}:{" "}
      <span className={on ? "text-lagoon" : "text-muted"}>{on ? "connected" : off}</span>
    </li>
  );
}

function eventsCard() {
  return (
    <li className="border border-ink/15 bg-chart px-4 py-3">
      <p className="text-[10px] uppercase tracking-[0.16em] text-muted">Events</p>
      <p className="mt-1 font-display text-3xl leading-none tracking-tight">{events.length}</p>
      <p className="mt-2 text-sm leading-6 text-muted">
        {seedEvents.length} curated seed rows, then ingest merges.
      </p>
    </li>
  );
}

function placesCard() {
  return (
    <li className="border border-ink/15 bg-chart px-4 py-3">
      <p className="text-[10px] uppercase tracking-[0.16em] text-muted">Places</p>
      <p className="mt-1 font-display text-3xl leading-none tracking-tight">{placesOnFile().length}</p>
      <p className="mt-2 text-sm leading-6 text-muted">From places.ts, shown on /places.</p>
    </li>
  );
}

function featuredCard() {
  const features = homeFeaturesFrom(events);
  const skippedFeatures = homeFeatureKeys.length - features.length;
  return (
    <li className="border border-ink/15 bg-chart px-4 py-3">
      <p className="text-[10px] uppercase tracking-[0.16em] text-muted">Featured cards</p>
      <p className="mt-1 font-display text-3xl leading-none tracking-tight">{features.length}</p>
      <p className="mt-2 text-sm leading-6 text-muted">
        {homeFeatureKeys.length} keys in home-featured.ts
        {skippedFeatures > 0
          ? `, ${skippedFeatures} skipped because a row or poster is missing.`
          : "."}
      </p>
    </li>
  );
}

function slideshowCard() {
  const slides = homeHeroSlides(events);
  const posterSlides = slides.filter((slide) => slide.kind === "poster");
  const nightSlides = slides.filter((slide) => slide.kind !== "poster");
  return (
    <li className="border border-ink/15 bg-chart px-4 py-3">
      <p className="text-[10px] uppercase tracking-[0.16em] text-muted">Homepage slideshow</p>
      <p className="mt-1 font-display text-3xl leading-none tracking-tight">{slides.length}</p>
      <p className="mt-2 text-sm leading-6 text-muted">
        {posterSlides.length} event posters and {nightSlides.length} night photographs. Duplicate
        poster files are skipped.
      </p>
    </li>
  );
}

function signInBlock() {
  const auth = directorySignIn();
  return (
    <div className="mt-10 border-t border-ink/10 pt-6">
      <h3 className="text-[11px] uppercase tracking-[0.18em] text-muted">Sign-in and database</h3>
      <ul className="mt-3 grid gap-2 text-sm leading-6 text-ink">
        <Status
          on={auth.connected}
          label="Supabase Auth"
          off="not connected (project URL or anon key missing)"
        />
        <li>
          Admin allowlist: {auth.adminEmails.length} address
          {auth.adminEmails.length === 1 ? "" : "es"} on file.
        </li>
      </ul>
    </div>
  );
}

function ingestBlock() {
  const sources = Array.isArray(lastRun?.sources) ? lastRun.sources : [];
  const sourcesOk = sources.filter((row) => row && row.ok).length;
  return (
    <div className="mt-10 border-t border-ink/10 pt-6">
      <h3 className="text-[11px] uppercase tracking-[0.18em] text-muted">Ingest snapshot</h3>
      <p className="mt-2 max-w-xl text-sm leading-7 text-muted">
        Last recorded feed check, bundled from data/event-ingest/last-run.json. This is the file in
        the repo, not a live run.
      </p>
      <ul className="mt-3 grid gap-2 text-sm leading-6 text-ink">
        <li>Checked: {lastRun?.checkedAt ? londonStamp(lastRun.checkedAt) : "Not on file"}</li>
        <li>Cadence: every {lastRun?.cadenceDays ?? "?"} days</li>
        <li>
          Published in that snapshot:{" "}
          {Array.isArray(lastRun?.published) ? lastRun.published.length : 0}
        </li>
        <li>Held: {Array.isArray(lastRun?.held) ? lastRun.held.length : 0}</li>
        <li>
          Sources: {sourcesOk} confirmed, {sources.length - sourcesOk} not confirmed, of{" "}
          {sources.length} checked.
        </li>
      </ul>
      <ul className="mt-4 grid gap-2 text-sm leading-6">
        {sources.map((source, index) => (
          <li
            key={source?.id ?? `source-${index}`}
            className="border border-ink/15 bg-chart px-4 py-3"
          >
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
              {source?.id ?? "Unknown source"}
            </p>
            <p className={source?.ok ? "text-ink" : "text-muted"}>
              {source?.ok ? "Confirmed" : "Not confirmed"}
              {source?.detail ? `. ${source.detail}` : ""}
            </p>
            {source?.url ? (
              <a
                href={source.url}
                className="mt-1 inline-flex break-all text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxide"
              >
                {source.url}
              </a>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AdminOverviewSection() {
  return (
    <section className="min-w-0">
      <h2 className="font-display text-3xl leading-none tracking-tight">Directory snapshot</h2>
      <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
        Counts from the seed files and ingest merge. To change a record, use Events, Places,
        Featured, or Landmarks in this panel.
      </p>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        <OverviewCard title="Events" scope="overview events" reason="Event counts unavailable.">
          {eventsCard}
        </OverviewCard>
        <OverviewCard title="Places" scope="overview places" reason="Place counts unavailable.">
          {placesCard}
        </OverviewCard>
        <OverviewCard
          title="Featured cards"
          scope="overview featured"
          reason="Featured card counts unavailable."
        >
          {featuredCard}
        </OverviewCard>
        <OverviewCard
          title="Homepage slideshow"
          scope="overview slideshow"
          reason="Slideshow counts unavailable."
        >
          {slideshowCard}
        </OverviewCard>
      </ul>

      <OverviewBlock
        title="Sign-in and database"
        scope="overview sign-in"
        reason="Sign-in status unavailable."
      >
        {signInBlock}
      </OverviewBlock>

      <OverviewBlock
        title="Ingest snapshot"
        scope="overview ingest snapshot"
        reason="Ingest snapshot unavailable."
      >
        {ingestBlock}
      </OverviewBlock>
    </section>
  );
}

export function AdminEventsSection() {
  let rows;
  try {
    rows = eventRowsForAdmin();
  } catch (error) {
    logAdminError("events list", error);
    return (
      <section className="min-w-0">
        <h2 className="font-display text-3xl leading-none tracking-tight">Events</h2>
        <p className="mt-3 text-sm leading-7 text-muted">Event list unavailable.</p>
      </section>
    );
  }
  return (
    <section className="min-w-0">
      <h2 className="font-display text-3xl leading-none tracking-tight">Events</h2>
      <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
        Read-only list of the live directory, including ingest merges. Search by name, venue, city,
        date, or source. To change a row, edit the TypeScript files in the repo and open a pull
        request.
      </p>
      <AdminEventList rows={rows} />
    </section>
  );
}

export function AdminFeaturedSection() {
  let features;
  let slides;
  try {
    features = homeFeaturesFrom(events);
    slides = homeHeroSlides(events);
  } catch (error) {
    logAdminError("featured lists", error);
    return (
      <section className="min-w-0">
        <h2 className="font-display text-3xl leading-none tracking-tight">Featured</h2>
        <p className="mt-3 text-sm leading-7 text-muted">Featured lists unavailable.</p>
      </section>
    );
  }
  return (
    <section className="min-w-0">
      <h2 className="font-display text-3xl leading-none tracking-tight">Featured</h2>
      <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
        Read-only view of the homepage featured cards and the slideshow order. Cards come from
        home-featured.ts. The slideshow adds further posters, then night photographs, and skips a
        second slide that would reuse the same picture.
      </p>

      <h3 className="mt-8 text-[11px] uppercase tracking-[0.18em] text-muted">Featured cards</h3>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {features.map((feature) => (
          <li key={feature.id} className="border border-ink/15 bg-chart px-4 py-3 text-sm leading-6">
            <div className="relative aspect-[3/4] w-full max-w-[12rem] overflow-hidden bg-ink/5">
              <Image
                src={feature.poster.src}
                alt={feature.poster.alt}
                fill
                className="object-cover"
                sizes="192px"
              />
            </div>
            <p className="mt-3 text-[10px] uppercase tracking-[0.16em] text-muted">{feature.date}</p>
            <p>
              <Link href={feature.href} className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
                {feature.artist}
              </Link>
            </p>
            <p className="text-muted">{feature.title}</p>
            <p className="text-muted">{feature.region}</p>
          </li>
        ))}
      </ul>

      <h3 className="mt-10 text-[11px] uppercase tracking-[0.18em] text-muted">Slideshow</h3>
      <ol className="mt-3 grid gap-3">
        {slides.map((slide, index) => (
          <li
            key={`${slide.src}-${index}`}
            className="flex gap-3 border border-ink/15 bg-chart px-4 py-3 text-sm leading-6"
          >
            <span className="w-6 shrink-0 text-muted">{index + 1}</span>
            <div className="relative h-16 w-12 shrink-0 overflow-hidden bg-ink/5">
              <Image src={slide.src} alt={slide.alt} fill className="object-cover" sizes="48px" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
                {slide.kind === "poster" ? "Poster" : "Night photograph"}
              </p>
              {"href" in slide && slide.href ? (
                <Link href={slide.href} className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
                  {slide.place}
                </Link>
              ) : (
                <p>{slide.place}</p>
              )}
              <p className="text-muted">
                {slide.city}
                {slide.kind === "poster" ? `. ${slide.date}` : ""}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function AdminPlacesSection() {
  let rows;
  try {
    rows = placeRowsForAdmin();
  } catch (error) {
    logAdminError("places list", error);
    return (
      <section className="min-w-0">
        <h2 className="font-display text-3xl leading-none tracking-tight">Places</h2>
        <p className="mt-3 text-sm leading-7 text-muted">Place list unavailable.</p>
      </section>
    );
  }
  return (
    <section className="min-w-0">
      <h2 className="font-display text-3xl leading-none tracking-tight">Places</h2>
      <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
        Read-only list of hotels, restaurants, and other stops from places.ts. Search by name, city,
        country, or category. To change a listing, edit the TypeScript file in the repo.
      </p>
      <AdminPlaceList rows={rows} />
    </section>
  );
}

export async function AdminGetFeaturedSection() {
  let submissions;
  try {
    submissions = await listUnpublishedSubmissions();
  } catch (error) {
    logAdminError("get featured submissions", error);
    return (
      <section className="min-w-0">
        <h2 className="font-display text-3xl leading-none tracking-tight">Get featured</h2>
        <p className="mt-3 text-sm leading-7 text-muted">Database not connected.</p>
      </section>
    );
  }
  if (submissions.reason === "error") {
    logAdminError("get featured submissions", "submissions table missing or unreadable");
  }
  const placements =
    submissions.reason === "ok" ? submissions.rows.filter((row) => row.kind === "placement") : [];

  return (
    <section className="min-w-0">
      <h2 className="font-display text-3xl leading-none tracking-tight">Get featured</h2>
      <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
        The public Get featured page asks people to email partners@dirtydecember.info. Those email
        enquiries are not stored in the database. Placement submissions sent through the list form
        are stored when the database is connected, and they also appear under Submissions.
      </p>
      {submissions.reason === "no-key" ? (
        <p className="mt-3 text-sm leading-7 text-muted">Database not connected.</p>
      ) : submissions.reason === "error" ? (
        <p className="mt-3 text-sm leading-7 text-muted">
          Placement submissions could not be read. Table submissions missing or unreadable.
        </p>
      ) : placements.length === 0 ? (
        <p className="mt-3 text-sm leading-7 text-ink">No placement submissions are on file.</p>
      ) : (
        <ul className="mt-3 grid gap-3">
          {placements.map((row) => (
            <li key={row.id} className="border border-ink/15 bg-chart px-4 py-3 text-sm leading-6 text-ink">
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted">placement</p>
              <p>{row.business_name ?? "Untitled placement"}</p>
              <p>{row.sender_email}</p>
              {row.offer ? <p className="text-muted">{row.offer}</p> : null}
              {row.public_link ? (
                <a
                  href={row.public_link}
                  className="underline decoration-ink/30 underline-offset-4 hover:text-oxide"
                >
                  {row.public_link}
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export async function AdminOutboundClicksSection() {
  let result;
  try {
    result = await listOutboundClicks();
  } catch (error) {
    logAdminError("outbound clicks", error);
    return (
      <section className="min-w-0">
        <h2 className="font-display text-3xl leading-none tracking-tight">Outbound clicks</h2>
        <p className="mt-3 text-sm leading-7 text-muted">Table outbound_clicks missing or unreadable.</p>
      </section>
    );
  }
  if (result.reason === "error") {
    logAdminError("outbound clicks", "table outbound_clicks missing or unreadable");
  } else if (result.reason === "no-key") {
    logAdminError("outbound clicks", "SUPABASE_SERVICE_ROLE_KEY missing");
  }
  return (
    <section className="min-w-0">
      <h2 className="font-display text-3xl leading-none tracking-tight">Outbound clicks</h2>
      <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
        Recent partner, ticket, and sponsor clicks written by the site when the outbound_clicks
        table is on the project. The migration is in the repo and has not been applied from this
        change.
      </p>
      {result.reason === "no-key" ? (
        <p className="mt-3 text-sm leading-7 text-muted">Database not connected.</p>
      ) : result.reason === "error" ? (
        <p className="mt-3 text-sm leading-7 text-muted">
          Table outbound_clicks missing or unreadable. Apply
          supabase/migrations/20261119120000_outbound_clicks.sql on the project when you are ready.
        </p>
      ) : result.rows.length === 0 ? (
        <p className="mt-3 text-sm leading-7 text-ink">No outbound clicks are on file yet.</p>
      ) : (
        <ul className="mt-3 grid gap-3">
          {result.rows.map((row) => (
            <li key={row.id} className="border border-ink/15 bg-chart px-4 py-3 text-sm leading-6 text-ink">
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
                {row.kind} · {row.partner}
                {row.earning ? " · earning" : ""}
              </p>
              <p>
                {row.destination_host}
                {row.target ? ` (${row.target})` : ""}
              </p>
              <p className="text-muted">
                {londonStamp(row.ts)}
                {row.from_path ? `. From ${row.from_path}` : ""}
                {row.country ? `. ${row.country}` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
