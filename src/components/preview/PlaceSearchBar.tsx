"use client";

import { useCallback, useEffect, useRef } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";

export type SelectedPlace = {
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
};

const GLASS =
  "border border-white/20 bg-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.25)] backdrop-blur-2xl";

export function PlaceSearchBar({
  onPlaceSelect,
  variant = "overlay",
  placeholder = "Search any address or venue…",
}: {
  onPlaceSelect: (place: SelectedPlace) => void;
  variant?: "overlay" | "inline";
  placeholder?: string;
}) {
  const places = useMapsLibrary("places");
  const hostRef = useRef<HTMLDivElement>(null);
  const autocompleteRef =
    useRef<google.maps.places.PlaceAutocompleteElement | null>(null);

  const handleSelect = useCallback(
    async (ev: google.maps.places.PlacePredictionSelectEvent) => {
      const prediction = ev.placePrediction;
      const place = prediction.toPlace();
      await place.fetchFields({
        fields: ["displayName", "formattedAddress", "location"],
      });

      const loc = place.location;
      if (!loc) return;

      onPlaceSelect({
        name: place.displayName ?? "Selected location",
        address: place.formattedAddress ?? undefined,
        latitude: loc.lat(),
        longitude: loc.lng(),
      });
    },
    [onPlaceSelect],
  );

  useEffect(() => {
    if (!places || !hostRef.current) return;

    const el = new places.PlaceAutocompleteElement();
    el.placeholder = placeholder;
    el.className =
      variant === "overlay"
        ? "stellar-place-autocomplete"
        : "stellar-place-autocomplete stellar-place-autocomplete--light";

    hostRef.current.appendChild(el);
    autocompleteRef.current = el;

    const onSelect = (ev: Event) => {
      void handleSelect(ev as google.maps.places.PlacePredictionSelectEvent);
    };

    el.addEventListener("gmp-select", onSelect);

    return () => {
      el.removeEventListener("gmp-select", onSelect);
      el.remove();
      autocompleteRef.current = null;
    };
  }, [places, handleSelect, placeholder, variant]);

  const wrapperClass =
    variant === "overlay"
      ? `pointer-events-auto absolute left-1/2 top-6 z-20 w-[calc(100%-8rem)] max-w-md -translate-x-1/2 rounded-2xl p-1.5 ${GLASS}`
      : "w-full rounded-sm border border-line bg-paper-pure px-1 py-0.5";

  return (
    <div className={wrapperClass}>
      <div ref={hostRef} className="stellar-place-autocomplete-host" />
    </div>
  );
}