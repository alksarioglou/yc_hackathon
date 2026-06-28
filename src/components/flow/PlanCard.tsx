"use client";

import { APIProvider } from "@vis.gl/react-google-maps";
import {
  PlaceSearchBar,
  type SelectedPlace,
} from "@/components/preview/PlaceSearchBar";
import type { LeadsResult } from "@/lib/types";
import { BTN } from "./constants";

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

function TakeoverAddressEditor({
  address,
  onAddressChange,
}: {
  address: string;
  onAddressChange: (address: string) => void;
}) {
  function handlePlaceSelect(place: SelectedPlace) {
    onAddressChange(place.address ?? place.name);
  }

  if (!apiKey) {
    return (
      <input
        type="text"
        value={address}
        onChange={(e) => onAddressChange(e.target.value)}
        placeholder="Street address, intersection, or venue"
        className="w-full rounded-sm border border-line bg-paper-pure px-3 py-2.5 text-sm outline-none focus:border-orange"
      />
    );
  }

  return (
    <APIProvider apiKey={apiKey} libraries={["places"]}>
      <div className="space-y-3">
        <PlaceSearchBar
          variant="inline"
          placeholder="Search or paste an address…"
          onPlaceSelect={handlePlaceSelect}
        />
        <input
          type="text"
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          placeholder="Or type the takeover address directly"
          className="w-full rounded-sm border border-line bg-paper-pure px-3 py-2.5 text-sm outline-none focus:border-orange"
        />
        <p className="text-xs text-muted">
          Pick from search suggestions or edit the address field — the campaign
          preview map uses this location.
        </p>
      </div>
    </APIProvider>
  );
}

export function PlanCard({
  leads,
  onLeadsChange,
  onPreview,
}: {
  leads: LeadsResult;
  onLeadsChange: (leads: LeadsResult) => void;
  onPreview: () => void;
}) {
  function updateAddress(address: string) {
    onLeadsChange({
      ...leads,
      geo: { ...leads.geo, address },
    });
  }

  return (
    <section className="animate-fade-in-up">
      <p className="label mb-3 text-orange">Mission · 003 · Campaign plan</p>
      <h2 className="display text-3xl">Where & when to strike</h2>
      <p className="mt-2 text-muted">
        The densest cluster of your leads — and the perfect moment to reach them.
      </p>

      <div className="mt-8 grid gap-px border border-ink bg-ink sm:grid-cols-2">
        <div className="bg-ink p-7 text-paper">
          <p className="label mb-3 text-paper/50">Lead cluster</p>
          <p className="display text-2xl text-orange">{leads.geo.city}</p>
          <p className="mt-1 text-paper/90">{leads.geo.cluster}</p>
          <p className="mt-3 text-sm leading-relaxed text-paper/60">
            {leads.geo.why}
          </p>
        </div>

        <div className="bg-panel p-7">
          <p className="label mb-3 text-muted">Best time &amp; place</p>
          <p className="font-medium">{leads.timing.when}</p>
          <p className="text-ink/80">{leads.timing.where}</p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {leads.timing.why}
          </p>
        </div>
      </div>

      <div className="mt-px border border-ink border-t-0 bg-panel p-7">
        <p className="label mb-3 text-muted">Takeover coordinates</p>
        <TakeoverAddressEditor
          address={leads.geo.address}
          onAddressChange={updateAddress}
        />
      </div>

      <div className="mt-px border border-ink border-t-0 bg-panel p-7">
        <p className="label mb-4 text-muted">Sample leads in cluster</p>
        <ul className="space-y-2.5">
          {leads.leads.map((l, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-4 border-b border-line pb-2.5 text-sm last:border-0 last:pb-0"
            >
              {l.linkedinUrl ? (
                <a
                  href={l.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-orange hover:underline"
                >
                  {l.name} ↗
                </a>
              ) : (
                <span className="font-medium">{l.name}</span>
              )}
              <span className="text-right text-muted">
                {l.title} · {l.company}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={onPreview}
        disabled={!leads.geo.address.trim()}
        className={`${BTN} mt-8 w-full`}
      >
        Campaign Preview →
      </button>
    </section>
  );
}