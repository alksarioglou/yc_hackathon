import type { Building } from "./cityPresets";

const BEIGE = "#d9cebb";

function hash(gx: number, gz: number): number {
  return Math.abs(gx * 73 + gz * 37 + gx * gz * 11) % 100;
}

function noise(gx: number, gz: number, seed = 0): number {
  return hash(gx + seed * 19, gz + seed * 29) / 100;
}

function organicHeight(gx: number, gz: number): number {
  const h = hash(gx, gz);
  const dist = Math.sqrt(gx * gx + gz * gz);

  let base = 7;
  if (dist > 20) base = 5.5;
  else if (dist > 14) base = 7.5;
  else if (dist > 9) base = 9.5;
  else if (dist > 5) base = 11.5;
  else base = 13;

  const grain = noise(gx, gz) * 7 + noise(gx * 2 + 3, gz * 2 - 1, 1) * 4;
  const wave =
    Math.sin(gx * 0.48 + gz * 0.31) * 2.8 +
    Math.cos(gz * 0.62 - gx * 0.24) * 2.2;
  const jitter = ((h % 11) - 5) * 1.1;
  const pocket = noise(gx + gz, gx - gz, 2) > 0.78 ? 4 + noise(gx, gz, 5) * 7 : 0;
  const midRise =
    noise(gx, gz, 3) > 0.9 ? 10 + noise(gx, gz, 4) * 12 : 0;

  let height = base + grain + wave + jitter + pocket + midRise;

  // Landmark towers — tallest, slightly reduced for balance
  if (gx === 2 && gz === 4) height = 52;
  else if (gx === -2 && gz === 2) height = 40;
  else if (gx === 8 && gz === -6) height = 36;
  else if (gx === 4 && gz === 0) height = 34;

  return Math.max(4, Math.round(height * 10) / 10);
}

function footprint(
  x: number,
  z: number,
  width: number,
  depth: number,
  height: number,
): Building {
  return {
    x,
    z,
    width,
    depth,
    height,
    style: "esri",
    accent: BEIGE,
  };
}

/** Dense extruded-footprint downtown SF matching Esri Scene Viewer style */
export function generateSFSkyline(): Building[] {
  const buildings: Building[] = [];

  for (let gx = -28; gx <= 28; gx += 1) {
    for (let gz = -22; gz <= 18; gz += 1) {
      const h = hash(gx, gz);

      // Street grid gaps
      if (gx % 5 === 0 || gz % 4 === 0) continue;
      if (h < 12) continue;

      const height = organicHeight(gx, gz);

      const width = 1.5 + noise(gx, gz, 6) * 1.1;
      const depth = 1.3 + noise(gx, gz, 7) * 1;

      buildings.push(footprint(gx * 1.15, gz * 1.15, width, depth, height));
    }
  }

  // Transamerica Pyramid landmark
  buildings.push({
    x: -5.5,
    z: 3,
    width: 4.5,
    depth: 4.5,
    height: 36,
    style: "pyramid",
    accent: BEIGE,
  });

  // Embarcadero waterfront — short irregular strip
  for (let i = -20; i <= 20; i += 3) {
    const wh = hash(i, -20);
    const h =
      4 +
      (wh % 5) +
      Math.sin(i * 0.55) * 1.5 +
      (noise(i, -20) > 0.82 ? 3 + noise(i, -20, 8) * 4 : 0);
    buildings.push(
      footprint(
        i * 1.1,
        -20,
        2 + noise(i, -20, 9) * 0.8,
        1.6 + noise(i, -20, 10) * 0.7,
        Math.round(h * 10) / 10,
      ),
    );
  }

  return buildings;
}

export const SF_ESRI_COLORS = {
  building: BEIGE,
  buildingSide: "#c8bfad",
  ground: "#e2d9c8",
  bay: "#a8bcc8",
  bayFog: "#c8d4dc",
  sky: "#c5d2dc",
  hills: "#b0b8a8",
};