/** Display altitude for sky QR in Street View. */
export function getStreetViewQrAltitude(baseAltitudeMeters: number): number {
  return Math.max(420, Math.round(baseAltitudeMeters * 2.8));
}

/** How much of the viewport width the QR square should occupy. */
export const STREET_VIEW_QR_SCREEN_FRACTION = 0.1;

/** Dot diameter as a fraction of cell spacing (leave gaps for scanability). */
export const STREET_VIEW_DOT_FILL = 0.9;