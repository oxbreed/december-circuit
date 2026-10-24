"use client";

import { useActionState, useCallback, useState, type FormEvent } from "react";
import {
  intakeCategories,
  intakeCities,
  intakeKinds,
  type GeocodeCandidate,
  type IntakeCategory,
  type IntakeCity,
  type IntakeKind,
} from "../place-intake";
import { saveSubmission, type SaveState } from "../submissions";
import { MapLookup } from "./map-lookup";

const initial: SaveState = { status: "idle" };

export function PlaceSubmission({ connected = false }: { connected?: boolean }) {
  if (connected) return <SavePlace />;
  return <MailPlace />;
}

function MailPlace() {
  const [kind, setKind] = useState<IntakeKind>("place");
  const [name, setName] = useState("");
  const [city, setCity] = useState<IntakeCity | "">("");
  const [category, setCategory] = useState<IntakeCategory | "">("");
  const [selected, setSelected] = useState<GeocodeCandidate | null>(null);
  const onSelect = useCallback((candidate: GeocodeCandidate | null) => {
    setSelected(candidate);
  }, []);

  function openMail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const lines = [
      `Kind: ${String(data.get("kind") ?? "").trim()}`,
      `Name: ${String(data.get("name") ?? "").trim()}`,
      `City: ${String(data.get("city") ?? "").trim()}`,
      `Category: ${String(data.get("category") ?? "").trim()}`,
      `Website: ${String(data.get("link") ?? "").trim()}`,
      `Note: ${String(data.get("note") ?? "").trim()}`,
      `Sender’s email: ${String(data.get("email") ?? "").trim()}`,
    ];
    if (selected) {
      lines.push(`OpenStreetMap name: ${selected.name}`);
      lines.push(`Latitude: ${selected.latitude}`);
      lines.push(`Longitude: ${selected.longitude}`);
      lines.push(`OSM id: ${selected.osmId}`);
    }
    const href = `mailto:hello@dirtydecember.info?subject=${encodeURIComponent(
      "Place or business submission",
    )}&body=${encodeURIComponent(lines.join("\n"))}`;
    window.location.href = href;
  }

  return (
    <form className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2" onSubmit={openMail}>
      <KindFields
        kind={kind}
        onKind={setKind}
        name={name}
        onName={setName}
        city={city}
        onCity={setCity}
        category={category}
        onCategory={setCategory}
      />
      <MapLookup name={name} city={city} selected={selected} onSelect={onSelect} />
      <div className="col-span-2">
        <button
          type="submit"
          className="inline-flex max-w-full bg-ink px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] text-chart"
        >
          Email this place
        </button>
      </div>
    </form>
  );
}

function SavePlace() {
  const [kind, setKind] = useState<IntakeKind>("place");
  const [name, setName] = useState("");
  const [city, setCity] = useState<IntakeCity | "">("");
  const [category, setCategory] = useState<IntakeCategory | "">("");
  const [selected, setSelected] = useState<GeocodeCandidate | null>(null);
  const onSelect = useCallback((candidate: GeocodeCandidate | null) => {
    setSelected(candidate);
  }, []);
  const [state, action, pending] = useActionState(saveSubmission, initial);

  return (
    <form action={action} className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2">
      <input type="hidden" name="kind" value={kind} />
      {selected ? (
        <>
          <input type="hidden" name="latitude" value={String(selected.latitude)} />
          <input type="hidden" name="longitude" value={String(selected.longitude)} />
          <input type="hidden" name="osmName" value={selected.name} />
          <input type="hidden" name="osmId" value={selected.osmId} />
        </>
      ) : null}
      <KindFields
        kind={kind}
        onKind={setKind}
        name={name}
        onName={setName}
        city={city}
        onCity={setCity}
        category={category}
        onCategory={setCategory}
        controlledKind
      />
      <MapLookup name={name} city={city} selected={selected} onSelect={onSelect} />
      <div className="col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex max-w-full bg-ink px-4 py-3 text-left text-[11px] uppercase tracking-[0.16em] text-chart disabled:opacity-60"
        >
          Save this place
        </button>
        {state.status === "saved" ? (
          <p className="mt-3 text-sm leading-6 text-ink">{state.message}</p>
        ) : null}
        {state.status === "error" ? (
          <p className="mt-3 text-sm leading-6 text-oxide">{state.message}</p>
        ) : null}
      </div>
    </form>
  );
}

function KindFields({
  kind,
  onKind,
  name,
  onName,
  city,
  onCity,
  category,
  onCategory,
  controlledKind = false,
}: {
  kind: IntakeKind;
  onKind: (value: IntakeKind) => void;
  name: string;
  onName: (value: string) => void;
  city: IntakeCity | "";
  onCity: (value: IntakeCity | "") => void;
  category: IntakeCategory | "";
  onCategory: (value: IntakeCategory | "") => void;
  controlledKind?: boolean;
}) {
  return (
    <>
      <label className="block min-w-0">
        <span className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-muted">Kind</span>
        <select
          name={controlledKind ? undefined : "kind"}
          value={kind}
          required
          onChange={(event) => onKind(event.target.value as IntakeKind)}
          className="ledger-input py-2!"
        >
          {intakeKinds.map((value) => (
            <option key={value} value={value}>
              {value === "place" ? "Place" : "Business"}
            </option>
          ))}
        </select>
      </label>
      <label className="block min-w-0">
        <span className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-muted">Name</span>
        <input
          name="name"
          type="text"
          required
          maxLength={200}
          value={name}
          onChange={(event) => onName(event.target.value)}
          autoComplete="organization"
          className="ledger-input py-2!"
        />
      </label>
      <label className="block min-w-0">
        <span className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-muted">City</span>
        <select
          name="city"
          value={city}
          required
          onChange={(event) => onCity(event.target.value as IntakeCity | "")}
          className="ledger-input py-2!"
        >
          <option value="" disabled>
            Choose a city
          </option>
          {intakeCities.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>
      <label className="block min-w-0">
        <span className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-muted">
          Category
        </span>
        <select
          name="category"
          value={category}
          required
          onChange={(event) => onCategory(event.target.value as IntakeCategory | "")}
          className="ledger-input py-2!"
        >
          <option value="" disabled>
            Choose a category
          </option>
          {intakeCategories.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>
      <label className="col-span-2 block min-w-0">
        <span className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-muted">
          Website URL
        </span>
        <input name="link" type="url" required className="ledger-input py-2!" />
      </label>
      <label className="col-span-2 block min-w-0">
        <span className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-muted">
          Optional note
        </span>
        <input name="note" type="text" maxLength={500} className="ledger-input py-2!" />
      </label>
      <label className="col-span-2 block min-w-0">
        <span className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-muted">
          Sender’s email
        </span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="ledger-input py-2!"
        />
      </label>
    </>
  );
}
