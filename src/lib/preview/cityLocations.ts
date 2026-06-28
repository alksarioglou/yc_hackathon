export type CityLocation = {
  id: string;
  name: string;
  short: string;
  tagline: string;
  latitude: number;
  longitude: number;
  qrAltitudeMeters: number;
  map3d: {
    centerAltitude: number;
    range: number;
    heading: number;
    tilt: number;
  };
};

export type Map3DCamera = {
  center: { lat: number; lng: number; altitude: number };
  range: number;
  heading: number;
  tilt: number;
};

export const CITY_LOCATIONS: CityLocation[] = [
  {
    id: "san-francisco",
    name: "San Francisco",
    short: "SF",
    tagline: "Financial District",
    latitude: 37.7897,
    longitude: -122.4009,
    qrAltitudeMeters: 180,
    map3d: { centerAltitude: 80, range: 900, heading: 320, tilt: 67 },
  },
  {
    id: "new-york",
    name: "New York",
    short: "NYC",
    tagline: "Midtown Manhattan",
    latitude: 40.758,
    longitude: -73.9855,
    qrAltitudeMeters: 220,
    map3d: { centerAltitude: 60, range: 1100, heading: 45, tilt: 65 },
  },
  {
    id: "austin",
    name: "Austin",
    short: "ATX",
    tagline: "Congress Ave",
    latitude: 30.2672,
    longitude: -97.7431,
    qrAltitudeMeters: 160,
    map3d: { centerAltitude: 50, range: 750, heading: 200, tilt: 62 },
  },
  {
    id: "miami",
    name: "Miami",
    short: "MIA",
    tagline: "Brickell",
    latitude: 25.7617,
    longitude: -80.1918,
    qrAltitudeMeters: 170,
    map3d: { centerAltitude: 40, range: 850, heading: 280, tilt: 64 },
  },
  {
    id: "los-angeles",
    name: "Los Angeles",
    short: "LA",
    tagline: "Downtown",
    latitude: 34.0522,
    longitude: -118.2437,
    qrAltitudeMeters: 200,
    map3d: { centerAltitude: 70, range: 950, heading: 90, tilt: 66 },
  },
];

export function getCityLocation(id: string): CityLocation {
  return CITY_LOCATIONS.find((c) => c.id === id) ?? CITY_LOCATIONS[0];
}

export function getMap3DCamera(
  city: CityLocation,
  preset: "skyline" | "street" | "qr" = "skyline",
): Map3DCamera {
  const { map3d } = city;
  const base: Map3DCamera = {
    center: {
      lat: city.latitude,
      lng: city.longitude,
      altitude: map3d.centerAltitude,
    },
    range: map3d.range,
    heading: map3d.heading,
    tilt: map3d.tilt,
  };

  switch (preset) {
    case "street":
      return { ...base, range: map3d.range * 0.45, tilt: 48 };
    case "qr":
      return { ...base, range: 420, tilt: 78, heading: map3d.heading + 15 };
    default:
      return base;
  }
}