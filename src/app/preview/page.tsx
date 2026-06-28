"use client";

import { APIProvider } from "@vis.gl/react-google-maps";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CampaignDrawer } from "@/components/preview/CampaignDrawer";
import type {
  GoogleMap3DPreviewHandle,
  ViewPreset,
} from "@/components/preview/GoogleMap3DPreview";
import { PreviewControls } from "@/components/preview/PreviewControls";
import {
  CITY_LOCATIONS,
  getCityLocation,
} from "@/lib/preview/cityLocations";
import { generateQRMatrix } from "@/lib/preview/qrMatrix";
import { formatHour, getTimeMode } from "@/lib/preview/timeOfDay";

const GoogleMap3DPreview = dynamic(
  () => import("@/components/preview/GoogleMap3DPreview"),
  { ssr: false },
);

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

export default function PreviewPage() {
  const viewerRef = useRef<GoogleMap3DPreviewHandle>(null);
  const [cityId, setCityId] = useState("san-francisco");
  const [viewPreset, setViewPreset] = useState<ViewPreset>("skyline");
  const [hour, setHour] = useState(14);
  const [destinationUrl, setDestinationUrl] = useState("https://stellarqr.com");
  const [brandColor, setBrandColor] = useState("#22d3ee");
  const [message, setMessage] = useState("Scan the Sky");
  const [qrMatrix, setQrMatrix] = useState<boolean[][]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const city = getCityLocation(cityId);
  const timeMode = getTimeMode(hour);
  const droneCount = qrMatrix.flat().filter(Boolean).length;

  useEffect(() => {
    let cancelled = false;
    generateQRMatrix(destinationUrl).then((matrix) => {
      if (!cancelled) setQrMatrix(matrix);
    });
    return () => {
      cancelled = true;
    };
  }, [destinationUrl]);

  const handleCityChange = (id: string) => {
    setCityId(id);
    setViewPreset("skyline");
  };

  const handleViewPreset = (preset: ViewPreset) => {
    setViewPreset(preset);
    viewerRef.current?.setViewPreset(preset);
  };

  if (!apiKey) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#020818] p-8">
        <div className="max-w-md rounded-2xl border border-white/20 bg-white/10 p-8 text-center backdrop-blur-2xl">
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-cyan-400">
            API Key Required
          </p>
          <h2 className="mb-3 text-xl font-semibold text-white">
            Maps JavaScript API — 3D Maps
          </h2>
          <p className="mb-6 text-sm text-white/60">
            Enable the <strong>Maps JavaScript API</strong> in Google Cloud and
            add your key to <code className="text-cyan-300">.env.local</code>
          </p>
          <pre className="overflow-x-auto rounded-xl border border-white/10 bg-black/30 p-3 text-left text-xs text-cyan-200">
            NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
          </pre>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey} libraries={["maps3d"]}>
      <div className="relative h-screen w-screen overflow-hidden bg-[#0a0f14]">
        <div className="absolute inset-0">
          {qrMatrix.length > 0 && (
            <GoogleMap3DPreview
              ref={viewerRef}
              city={city}
              qrMatrix={qrMatrix}
              hour={hour}
              brandColor={brandColor}
              viewPreset={viewPreset}
            />
          )}
        </div>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/45" />

        <header className="pointer-events-none absolute left-0 right-0 top-0 z-10 px-6 py-5">
          <Link
            href="/"
            className="pointer-events-auto inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 text-white/90 shadow-lg backdrop-blur-2xl transition hover:bg-white/15"
          >
            <span className="text-sm font-semibold tracking-tight">StellarQR</span>
          </Link>
        </header>

        <PreviewControls
          cities={CITY_LOCATIONS.map((c) => ({
            id: c.id,
            name: c.name,
            short: c.short,
          }))}
          activeCityId={cityId}
          activeCityName={city.name}
          viewPreset={viewPreset}
          timeLabel={
            timeMode === "night"
              ? "Night Takeover"
              : timeMode === "golden"
                ? "Golden Hour"
                : formatHour(hour)
          }
          droneCount={droneCount}
          qrAltitude={city.qrAltitudeMeters}
          onCityChange={handleCityChange}
          onViewPresetChange={handleViewPreset}
          onZoomIn={() => viewerRef.current?.zoomIn()}
          onZoomOut={() => viewerRef.current?.zoomOut()}
          onResetView={() => viewerRef.current?.resetView()}
          onOpenSettings={() => setSettingsOpen((o) => !o)}
          settingsOpen={settingsOpen}
        />

        <CampaignDrawer
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          hour={hour}
          onHourChange={setHour}
          hourLabel={formatHour(hour)}
          destinationUrl={destinationUrl}
          onDestinationUrlChange={setDestinationUrl}
          message={message}
          onMessageChange={setMessage}
          brandColor={brandColor}
          onBrandColorChange={setBrandColor}
        />
      </div>
    </APIProvider>
  );
}