/** Offset lat/lng by meters (approximate, fine for city-scale QR grids) */
export function offsetLatLng(
  lat: number,
  lng: number,
  eastMeters: number,
  northMeters: number,
) {
  const dLat = northMeters / 111_320;
  const dLng = eastMeters / (111_320 * Math.cos((lat * Math.PI) / 180));
  return { lat: lat + dLat, lng: lng + dLng };
}