import Link from "next/link";
import { MIGRATION_NEEDED } from "../admin-guard";
import { eventRowsForAdmin, placeRowsForAdmin } from "./admin-directory-data";
import { homeFeatureKeys } from "../home-featured";
import { landmarks } from "../landmarks";
import {
  listDirectoryEntries,
  type DirectoryEntry,
  type DirectoryKind,
  type DirectoryStatus,
} from "../directory-entries";
import { saveContentEntry, setContentOrder, setContentStatus } from "../admin-actions";
import { formatLondonStamp } from "../admin-format";
import { ActionForm } from "./admin-ui";

const copy: Record<
  DirectoryKind,
  { title: string; intro: string; createLabel: string }
> = {
  event: {
    title: "Events",
    intro: "The live event list starts from the TypeScript seed and ingest merge. Approved submissions and records you add here can appear on /events. Hide a seed row by saving an unpublished overlay with the same slug. Seed files stay in the repo as the fallback.",
    createLabel: "Add an event",
  },
  place: {
    title: "Places",
    intro: "Hotels, restaurants, and other stops start from places.ts. Published overlays and approved place submissions can appear on /places. Every public place still needs a source URL.",
    createLabel: "Add a place",
  },
  featured: {
    title: "Featured",
    intro: "Homepage featured cards come from home-featured.ts. You can hide a card, change its order, or add one that already has a sourced event and a credited poster in Landmarks.",
    createLabel: "Add a featured card",
  },
  landmark: {
    title: "Landmarks and posters",
    intro: "Posters and landmark photographs start from landmarks.ts. New rows append after the seed list. A credit is required. Do not invent an image or a caption.",
    createLabel: "Add a landmark",
  },
  placement: {
    title: "Placements",
    intro: "Approved Get featured placements and records you add here can appear on the Get featured page when they are published.",
    createLabel: "Add a placement",
  },
};

function statusLabel(status: DirectoryStatus, publishAt: string | null) {
  if (status === "scheduled" || (status === "published" && publishAt && Date.parse(publishAt) > Date.now())) {
    return "Scheduled";
  }
  if (status === "published") return "Published";
  if (status === "unpublished") return "Hidden";
  return "Draft";
}

function SeedRow({
  kind,
  slug,
  title,
  detail,
  href,
  overlay,
}: {
  kind: DirectoryKind;
  slug: string;
  title: string;
  detail: string;
  href?: string;
  overlay?: DirectoryEntry;
}) {
  return (
    <li className="border border-ink/15 bg-chart px-4 py-3 text-sm leading-6">
      <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
        On file
        {overlay ? ` · overlay ${statusLabel(overlay.status, overlay.publish_at)}` : ""}
      </p>
      <p className="mt-1">
        {href ? (
          <Link href={href} className="underline decoration-ink/30 underline-offset-4 hover:text-oxide">
            {title}
          </Link>
        ) : (
          title
        )}
      </p>
      <p className="text-muted">{detail}</p>
      <p className="text-muted">Slug: {slug}</p>
      {overlay ? (
        <EntryActions entry={overlay} />
      ) : (
        <details className="mt-3">
          <summary className="cursor-pointer text-[11px] uppercase tracking-[0.16em] text-muted">
            Override this row
          </summary>
          <div className="mt-3">
            <EntryForm kind={kind} defaults={{ slug, title, status: "published" }} />
          </div>
        </details>
      )}
    </li>
  );
}

function EntryActions({ entry }: { entry: DirectoryEntry }) {
  return (
    <div className="mt-3 flex flex-wrap items-end gap-2">
      {entry.status !== "published" ? (
        <ActionForm action={setContentStatus}>
          <input type="hidden" name="id" value={entry.id} />
          <input type="hidden" name="status" value="published" />
          <button type="submit" className="bg-lagoon px-3 py-2 text-[11px] uppercase tracking-[0.16em] text-chart">
            Publish
          </button>
        </ActionForm>
      ) : null}
      {entry.status !== "unpublished" ? (
        <ActionForm action={setContentStatus}>
          <input type="hidden" name="id" value={entry.id} />
          <input type="hidden" name="status" value="unpublished" />
          <button type="submit" className="border border-ink/20 bg-chart px-3 py-2 text-[11px] uppercase tracking-[0.16em] text-ink">
            Hide
          </button>
        </ActionForm>
      ) : null}
      <ActionForm action={setContentOrder} className="flex items-end gap-2">
        <input type="hidden" name="id" value={entry.id} />
        <label>
          <span className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-muted">Order</span>
          <input
            type="number"
            name="sort_order"
            defaultValue={entry.sort_order}
            className="ledger-input w-20"
          />
        </label>
        <button type="submit" className="border border-ink/20 bg-chart px-3 py-2 text-[11px] uppercase tracking-[0.16em] text-ink">
          Save order
        </button>
      </ActionForm>
      {entry.updated_at ? (
        <p className="text-sm leading-6 text-muted">Updated {formatLondonStamp(entry.updated_at)}</p>
      ) : null}
    </div>
  );
}

function Field({
  name,
  label,
  defaultValue,
  required,
  placeholder,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="min-w-0">
      <span className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-muted">{label}</span>
      <input
        type="text"
        name={name}
        defaultValue={defaultValue ?? ""}
        required={required}
        placeholder={placeholder}
        className="ledger-input"
      />
    </label>
  );
}

function EntryForm({
  kind,
  defaults,
  entry,
}: {
  kind: DirectoryKind;
  defaults?: { slug?: string; title?: string; status?: DirectoryStatus; payload?: Record<string, unknown> };
  entry?: DirectoryEntry;
}) {
  const payload = entry?.payload ?? defaults?.payload ?? {};
  const text = (key: string) => (typeof payload[key] === "string" ? payload[key] : "");
  return (
    <ActionForm action={saveContentEntry} className="grid gap-3 border border-ink/10 bg-paper px-3 py-3">
      {entry ? <input type="hidden" name="id" value={entry.id} /> : null}
      <input type="hidden" name="kind" value={kind} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Field name="title" label="Title" defaultValue={entry?.title ?? defaults?.title} required />
        <Field name="slug" label="Slug" defaultValue={entry?.slug ?? defaults?.slug} required />
        <label>
          <span className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-muted">Status</span>
          <select name="status" defaultValue={entry?.status ?? defaults?.status ?? "draft"} className="ledger-input py-2!">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
            <option value="unpublished">Hidden</option>
          </select>
        </label>
        <Field name="sort_order" label="Order" defaultValue={String(entry?.sort_order ?? 0)} />
        <Field name="publish_at" label="Publish from (ISO or London datetime)" defaultValue={entry?.publish_at ?? ""} />
        <Field name="unpublish_at" label="Hide after" defaultValue={entry?.unpublish_at ?? ""} />
        {kind === "event" ? (
          <>
            <Field name="payload.region" label="City or region" defaultValue={text("region")} required />
            <Field name="payload.when" label="Dates" defaultValue={text("when")} required />
            <Field name="payload.summary" label="Summary (sourced facts only)" defaultValue={text("summary")} required />
            <Field name="payload.url" label="Source URL" defaultValue={text("url")} required />
            <Field name="payload.urlLabel" label="Source label" defaultValue={text("urlLabel")} />
            <Field name="payload.ticketsUrl" label="Tickets URL" defaultValue={text("ticketsUrl")} />
          </>
        ) : null}
        {kind === "place" ? (
          <>
            <Field name="payload.name" label="Name" defaultValue={text("name") || defaults?.title} required />
            <Field name="payload.city" label="City" defaultValue={text("city")} required />
            <Field name="payload.country" label="Country" defaultValue={text("country")} required />
            <Field name="payload.category" label="Category" defaultValue={text("category")} required />
            <Field name="payload.url" label="Source URL" defaultValue={text("url")} required />
            <Field name="payload.area" label="Area" defaultValue={text("area")} />
            <Field name="payload.detail" label="Detail (as a source states it)" defaultValue={text("detail")} />
          </>
        ) : null}
        {kind === "landmark" ? (
          <>
            <Field name="payload.name" label="Name" defaultValue={text("name") || defaults?.title} required />
            <Field name="payload.city" label="City" defaultValue={text("city")} required />
            <Field name="payload.src" label="Image path or URL" defaultValue={text("src") || defaults?.slug} required placeholder="/landmarks/…" />
            <Field name="payload.credit" label="Credit (required)" defaultValue={text("credit")} required />
            <Field name="payload.creditUrl" label="Credit URL" defaultValue={text("creditUrl")} />
            <Field name="payload.alt" label="Alt text" defaultValue={text("alt")} />
          </>
        ) : null}
        {kind === "featured" ? (
          <>
            <Field name="payload.artist" label="Artist" defaultValue={text("artist")} required />
            <Field name="payload.title" label="Card title" defaultValue={text("title") || defaults?.title} required />
            <Field name="payload.date" label="Date on the card" defaultValue={text("date")} required />
            <Field name="payload.sourceId" label="Event sourceId" defaultValue={text("sourceId")} required />
            <Field name="payload.when" label="Event when (if needed)" defaultValue={text("when")} />
            <Field name="payload.poster" label="Poster path" defaultValue={text("poster")} required placeholder="/landmarks/…" />
          </>
        ) : null}
        {kind === "placement" ? (
          <>
            <Field name="payload.business_name" label="Business" defaultValue={text("business_name") || defaults?.title} required />
            <Field name="payload.public_link" label="Source URL" defaultValue={text("public_link") || text("url")} required />
            <Field name="payload.city" label="City" defaultValue={text("city")} />
            <Field name="payload.offer" label="Offer (as submitted)" defaultValue={text("offer")} />
          </>
        ) : null}
      </div>
      <button type="submit" className="justify-self-start bg-ink px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-chart">
        Save
      </button>
    </ActionForm>
  );
}

export function ContentView({
  kind,
  entries,
  reason,
}: {
  kind: DirectoryKind;
  entries: DirectoryEntry[];
  reason: "ok" | "no-key" | "forbidden" | "needs-migration" | "error";
}) {
  const meta = copy[kind];
  const bySlug = new Map(entries.map((entry) => [entry.slug, entry]));
  const seed = seedRows(kind, bySlug);
  const extras = entries.filter((entry) => !seed.some((row) => row.slug === entry.slug));

  return (
    <section className="min-w-0" data-admin-panel={kind}>
      <h2 className="font-display text-3xl leading-none tracking-tight">{meta.title}</h2>
      <p className="mt-3 max-w-xl text-sm leading-7 text-muted">{meta.intro}</p>
      {reason === "needs-migration" ? (
        <p className="mt-4 border border-brass/40 bg-chart px-4 py-3 text-sm leading-7 text-ink">
          {MIGRATION_NEEDED} You can still browse the seed list below. Saving is paused until the
          update is applied.
        </p>
      ) : reason === "no-key" ? (
        <p className="mt-4 text-sm leading-7 text-muted">The server key is not set, so overlays cannot be saved.</p>
      ) : reason === "error" ? (
        <p className="mt-4 text-sm leading-7 text-muted">Overlays could not be read. The seed list is still shown.</p>
      ) : null}

      {reason === "ok" ? (
        <details className="mt-6 border border-ink/15 bg-chart px-4 py-3" open={entries.length === 0}>
          <summary className="cursor-pointer text-[11px] uppercase tracking-[0.16em] text-muted">
            {meta.createLabel}
          </summary>
          <div className="mt-3">
            <EntryForm kind={kind} />
          </div>
        </details>
      ) : null}

      <h3 className="mt-8 text-[11px] uppercase tracking-[0.18em] text-muted">On file</h3>
      {seed.length === 0 ? (
        <p className="mt-3 text-sm leading-7 text-muted">No seed rows for this type.</p>
      ) : (
        <ul className="mt-3 grid gap-3">
          {seed.map((row) => (
            <SeedRow key={row.slug} {...row} />
          ))}
        </ul>
      )}

      <h3 className="mt-10 text-[11px] uppercase tracking-[0.18em] text-muted">Added in the panel</h3>
      {extras.length === 0 ? (
        <p className="mt-3 text-sm leading-7 text-muted">
          Nothing has been added yet. Approved submissions will show here after the database update
          is applied.
        </p>
      ) : (
        <ul className="mt-3 grid gap-3">
          {extras.map((entry) => (
            <li key={entry.id} className="border border-ink/15 bg-chart px-4 py-3 text-sm leading-6">
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
                {statusLabel(entry.status, entry.publish_at)} · {entry.source}
              </p>
              <p className="mt-1">{entry.title}</p>
              <p className="text-muted">Slug: {entry.slug}</p>
              <EntryActions entry={entry} />
              <details className="mt-3">
                <summary className="cursor-pointer text-[11px] uppercase tracking-[0.16em] text-muted">
                  Edit
                </summary>
                <div className="mt-3">
                  <EntryForm kind={kind} entry={entry} />
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function seedRows(
  kind: DirectoryKind,
  overlays: Map<string, DirectoryEntry>,
): {
  kind: DirectoryKind;
  slug: string;
  title: string;
  detail: string;
  href?: string;
  overlay?: DirectoryEntry;
}[] {
  if (kind === "event") {
    return eventRowsForAdmin().map((row) => ({
      kind,
      slug: row.slug,
      title: row.name,
      detail: [row.when, row.venue, row.region].filter(Boolean).join(" · "),
      href: row.href,
      overlay: overlays.get(row.slug),
    }));
  }
  if (kind === "place") {
    return placeRowsForAdmin().map((row) => ({
      kind,
      slug: row.slug,
      title: row.name,
      detail: `${row.category} · ${row.city}, ${row.country}`,
      href: row.href,
      overlay: overlays.get(row.slug),
    }));
  }
  if (kind === "featured") {
    return homeFeatureKeys.map((row) => ({
      kind,
      slug: row.id,
      title: `${row.artist}. ${row.title}`,
      detail: `${row.date} · ${row.sourceId}`,
      overlay: overlays.get(row.id),
    }));
  }
  if (kind === "landmark") {
    return landmarks.map((row) => ({
      kind,
      slug: row.src,
      title: row.name,
      detail: [row.city, row.credit].filter(Boolean).join(" · "),
      overlay: overlays.get(row.src),
    }));
  }
  return [];
}

export async function AdminContentSection({ kind }: { kind: DirectoryKind }) {
  const listed = await listDirectoryEntries(kind);
  return <ContentView kind={kind} entries={listed.rows} reason={listed.reason} />;
}
