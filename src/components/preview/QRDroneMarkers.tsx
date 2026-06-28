"use client";

import { useMemo } from "react";
import { AltitudeMode, Marker3D } from "@vis.gl/react-google-maps";
import { offsetLatLng } from "@/lib/preview/geo";
import type { CityLocation } from "@/lib/preview/cityLocations";
import { getTimeMode } from "@/lib/preview/timeOfDay";

const MODULE_SPACING = 2.8;

function DroneDot({ color, glow }: { color: string; glow: boolean }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10">
      <circle
        cx="5"
        cy="5"
        r="4"
        fill={color}
        stroke={glow ? color : "#0f172a"}
        strokeWidth="0.5"
        style={glow ? { filter: `drop-shadow(0 0 4px ${color})` } : undefined}
      />
    </svg>
  );
}

export function QRDroneMarkers({
  city,
  matrix,
  hour,
  brandColor,
}: {
  city: CityLocation;
  matrix: boolean[][];
  hour: number;
  brandColor: string;
}) {
  const isNight = getTimeMode(hour) !== "day";
  const color = isNight ? brandColor : "#1e293b";

  const positions = useMemo(() => {
    if (matrix.length === 0) return [];
    const rows = matrix.length;
    const cols = matrix[0]?.length ?? 0;
    const offsetX = -((cols - 1) * MODULE_SPACING) / 2;
    const offsetY = ((rows - 1) * MODULE_SPACING) / 2;
    const pts: { lat: number; lng: number; key: string }[] = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (!matrix[row][col]) continue;
        const { lat, lng } = offsetLatLng(
          city.latitude,
          city.longitude,
          offsetX + col * MODULE_SPACING,
          offsetY - row * MODULE_SPACING,
        );
        pts.push({ lat, lng, key: `${row}-${col}` });
      }
    }
    return pts;
  }, [matrix, city.latitude, city.longitude]);

  return (
    <>
      {positions.map((p) => (
        <Marker3D
          key={p.key}
          position={{
            lat: p.lat,
            lng: p.lng,
            altitude: city.qrAltitudeMeters,
          }}
          altitudeMode={AltitudeMode.RELATIVE_TO_MESH}
          sizePreserved
          drawsWhenOccluded
        >
          <DroneDot color={color} glow={isNight} />
        </Marker3D>
      ))}
    </>
  );
}