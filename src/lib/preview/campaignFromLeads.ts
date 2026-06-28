import {
  CITY_LOCATIONS,
  customTakeoverLocation,
  type TakeoverLocation,
} from "./cityLocations";
import type { LeadsResult, Premise } from "../types";

/** Parse hour (0–23) from a timing string like "Weekdays, 17:50 local". */
export function parseHourFromTiming(when: string): number {
  const match = when.match(/(\d{1,2}):(\d{2})/);
  if (match) {
    const hour = parseInt(match[1], 10);
    if (hour >= 0 && hour <= 23) return hour;
  }
  return 17;
}

/** Build a geocodable query from campaign lead data. */
export function takeoverAddressFromLeads(leads: LeadsResult): string {
  if (leads.geo.address?.trim()) {
    return leads.geo.address.trim();
  }

  const where = leads.timing.where
    .replace(/^drone formation above\s+/i, "")
    .replace(/^above\s+/i, "")
    .replace(/,?\s*facing\b.*$/i, "")
    .trim();

  return [where, leads.geo.cluster, leads.geo.city]
    .filter((part) => part?.trim())
    .join(", ");
}

/** Coarse fallback when geocoding fails — never preferred over a resolved address. */
export function fallbackLocationFromLeads(leads: LeadsResult): TakeoverLocation {
  const haystack = `${leads.geo.city} ${leads.geo.cluster}`.toLowerCase();

  const city = CITY_LOCATIONS.find((c) => {
    const name = c.name.toLowerCase();
    const short = c.short.toLowerCase();
    return (
      haystack.includes(name) ||
      haystack.includes(short) ||
      (c.id === "san-francisco" && haystack.includes("san francisco")) ||
      (c.id === "new-york" &&
        (haystack.includes("new york") || haystack.includes("nyc"))) ||
      (c.id === "los-angeles" &&
        (haystack.includes("los angeles") || haystack.includes("la ")))
    );
  });

  const tagline = takeoverAddressFromLeads(leads);

  if (city) {
    return customTakeoverLocation(
      city.name,
      city.latitude,
      city.longitude,
      tagline,
    );
  }

  return customTakeoverLocation(
    leads.geo.city,
    CITY_LOCATIONS[0].latitude,
    CITY_LOCATIONS[0].longitude,
    tagline,
  );
}

export type GeocodedTakeover = {
  name: string;
  tagline: string;
  latitude: number;
  longitude: number;
};

async function geocodeWithPlaces(query: string): Promise<GeocodedTakeover | null> {
  const { Place } = (await google.maps.importLibrary(
    "places",
  )) as google.maps.PlacesLibrary;

  const { places } = await Place.searchByText({
    textQuery: query,
    fields: ["displayName", "formattedAddress", "location"],
    maxResultCount: 1,
  });

  const place = places?.[0];
  if (!place) return null;

  await place.fetchFields({
    fields: ["displayName", "formattedAddress", "location"],
  });

  const loc = place.location;
  if (!loc) return null;

  return {
    name: place.displayName ?? query,
    tagline: place.formattedAddress ?? query,
    latitude: loc.lat(),
    longitude: loc.lng(),
  };
}

async function geocodeWithGeocoder(
  query: string,
): Promise<GeocodedTakeover | null> {
  const geocoder = new google.maps.Geocoder();

  return new Promise((resolve) => {
    geocoder.geocode({ address: query }, (results, status) => {
      if (status !== google.maps.GeocoderStatus.OK || !results?.[0]) {
        resolve(null);
        return;
      }

      const result = results[0];
      const lat = result.geometry.location.lat();
      const lng = result.geometry.location.lng();
      const formatted = result.formatted_address;

      const route = result.address_components?.find((c) =>
        c.types.includes("route"),
      );
      const locality = result.address_components?.find((c) =>
        c.types.includes("locality"),
      );
      const name =
        route?.long_name ??
        locality?.long_name ??
        formatted.split(",")[0]?.trim() ??
        query;

      resolve({
        name,
        tagline: formatted,
        latitude: lat,
        longitude: lng,
      });
    });
  });
}

/** Resolve an address to coordinates — Places API first (same as the search bar). */
export async function resolveTakeoverAddress(
  query: string,
): Promise<GeocodedTakeover | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;

  try {
    const fromPlaces = await geocodeWithPlaces(trimmed);
    if (fromPlaces) return fromPlaces;
  } catch {
    /* fall through to Geocoder */
  }

  return geocodeWithGeocoder(trimmed);
}

/** @deprecated Use resolveTakeoverAddress */
export const geocodeTakeoverAddress = resolveTakeoverAddress;

export function buildPreviewCaption(leads: LeadsResult): string {
  return `Drone swarm rendering a scannable QR code — ${leads.timing.where}, ${leads.timing.when}.`;
}

export function campaignPreviewDefaults(
  premise: Premise,
  leads: LeadsResult,
  productUrl?: string,
) {
  return {
    addressQuery: takeoverAddressFromLeads(leads),
    hour: parseHourFromTiming(leads.timing.when),
    destinationUrl: productUrl?.trim() || "https://adastra.com",
    message: premise.productName.slice(0, 24),
    caption: buildPreviewCaption(leads),
  };
}