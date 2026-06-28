"use client";

import { APIProvider, useApiIsLoaded } from "@vis.gl/react-google-maps";
import dynamic from "next/dynamic";
import Link from "next/link";
import { AdAstraLogo } from "@/components/AdAstraLogo";
import { useEffect, useMemo, useRef, useState } from "react";
import { CampaignDrawer } from "@/components/preview/CampaignDrawer";
import { FlowSpotlight } from "@/components/preview/FlowViewGuide";
import { useFlowSpotlight } from "@/lib/preview/useFlowSpotlight";
import type { GoogleMap3DPreviewHandle } from "@/components/preview/GoogleMap3DPreview";
import type { StreetViewPreviewHandle } from "@/components/preview/StreetViewPreview";
import {
  PlaceSearchBar,
  type SelectedPlace,
} from "@/components/preview/PlaceSearchBar";
import { PreviewControls } from "@/components/preview/PreviewControls";
import {
  campaignPreviewDefaults,
  fallbackLocationFromLeads,
  resolveTakeoverAddress,
} from "@/lib/preview/campaignFromLeads";
import {
  customTakeoverLocation,
  type TakeoverLocation,
} from "@/lib/preview/cityLocations";
import { generateQRMatrix } from "@/lib/preview/qrMatrix";
import { formatHour, getTimeMode } from "@/lib/preview/timeOfDay";
import type { ViewPreset } from "@/lib/preview/viewPreset";
import { usesStreetView } from "@/lib/preview/viewPreset";
import type { LeadsResult, Premise } from "@/lib/types";

const GoogleMap3DPreview = dynamic(
  () => import("@/components/preview/GoogleMap3DPreview"),
  { ssr: false },
);

const StreetViewPreview = dynamic(
  () => import("@/components/preview/StreetViewPreview"),
  { ssr: false },
);

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
const FLOW_DRONE_COLOR = "#0b0b0b";

type FlowProps = {
  mode: "flow";
  premise: Premise;
  leads: LeadsResult;
  productUrl: string;
  launched?: boolean;
  onLaunch: () => void;
};

type StandaloneProps = {
  mode: "standalone";
};

export type CampaignPreviewViewProps = FlowProps | StandaloneProps;

function MissingApiKey() {
  return (
    <div className="flex h-full min-h-[420px] items-center justify-center bg-[#020818] p-8">
      <div className="max-w-md rounded-2xl border border-white/20 bg-white/10 p-8 text-center backdrop-blur-2xl">
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-cyan-400">
          API Key Required
        </p>
        <h2 className="mb-3 text-xl font-semibold text-white">
          Maps JavaScript API — 3D Maps
        </h2>
        <p className="mb-6 text-sm text-white/60">
          Enable the <strong>Maps JavaScript API</strong> in Google Cloud and add
          your key to <code className="text-cyan-300">.env.local</code>
        </p>
        <pre className="overflow-x-auto rounded-xl border border-white/10 bg-black/30 p-3 text-left text-xs text-cyan-200">
          NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
        </pre>
      </div>
    </div>
  );
}

function PreviewScene({
  activeLocation,
  viewPreset,
  qrMatrix,
  hour,
  brandColor,
  fixedDroneColor,
  map3dRef,
  streetViewRef,
  onViewPresetChange,
  onZoomIn,
  onZoomOut,
  onResetView,
  onOpenSettings,
  settingsOpen,
  header,
  launchButton,
  placeSearch,
  showSettings = true,
  highlightPresets = [],
  tourFocusPreset = null,
  viewGuide,
}: {
  activeLocation: TakeoverLocation;
  viewPreset: ViewPreset;
  qrMatrix: boolean[][];
  hour: number;
  brandColor: string;
  map3dRef: React.RefObject<GoogleMap3DPreviewHandle | null>;
  streetViewRef: React.RefObject<StreetViewPreviewHandle | null>;
  onViewPresetChange: (preset: ViewPreset) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onOpenSettings?: () => void;
  settingsOpen?: boolean;
  header: React.ReactNode;
  launchButton?: React.ReactNode;
  placeSearch?: React.ReactNode;
  fixedDroneColor?: string;
  showSettings?: boolean;
  highlightPresets?: ViewPreset[];
  tourFocusPreset?: ViewPreset | null;
  viewGuide?: React.ReactNode;
}) {
  const timeMode = getTimeMode(hour);
  const droneCount = qrMatrix.flat().filter(Boolean).length;

  return (
    <div className="relative h-full min-h-[480px] w-full overflow-hidden bg-[#0a0f14]">
      <div className="absolute inset-0">
        {qrMatrix.length > 0 &&
          (usesStreetView(viewPreset) ? (
            <StreetViewPreview
              ref={streetViewRef}
              location={activeLocation}
              qrMatrix={qrMatrix}
              hour={hour}
              brandColor={brandColor}
              viewPreset="qr"
              fixedDroneColor={fixedDroneColor}
            />
          ) : (
            <GoogleMap3DPreview
              key={`${activeLocation.latitude},${activeLocation.longitude}`}
              ref={map3dRef}
              location={activeLocation}
              qrMatrix={qrMatrix}
              hour={hour}
              brandColor={brandColor}
              viewPreset={viewPreset}
              fixedDroneColor={fixedDroneColor}
            />
          ))}
      </div>

      {!usesStreetView(viewPreset) && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/45" />
      )}

      <header className="pointer-events-none absolute left-0 right-0 top-0 z-10 px-6 py-5 pr-20">
        {header}
      </header>

      {placeSearch}

      {launchButton}

      {viewGuide}

      <PreviewControls
        activeLocationName={activeLocation.name}
        activeLocationTagline={activeLocation.tagline}
        viewPreset={viewPreset}
        timeLabel={
          timeMode === "night"
            ? "Night Takeover"
            : timeMode === "golden"
              ? "Golden Hour"
              : formatHour(hour)
        }
        droneCount={droneCount}
        qrAltitude={activeLocation.qrAltitudeMeters}
        onViewPresetChange={onViewPresetChange}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onResetView={onResetView}
        onOpenSettings={onOpenSettings}
        settingsOpen={settingsOpen}
        showSettings={showSettings}
        highlightPresets={highlightPresets}
        tourFocusPreset={tourFocusPreset}
      />
    </div>
  );
}

function FlowPreviewScene({
  premise,
  leads,
  productUrl,
  launched = false,
  onLaunch,
}: {
  premise: Premise;
  leads: LeadsResult;
  productUrl: string;
  launched?: boolean;
  onLaunch: () => void;
}) {
  const apiLoaded = useApiIsLoaded();
  const flowDefaults = useMemo(
    () => campaignPreviewDefaults(premise, leads, productUrl),
    [premise, leads, productUrl],
  );
  const fallback = useMemo(() => fallbackLocationFromLeads(leads), [leads]);

  const map3dRef = useRef<GoogleMap3DPreviewHandle>(null);
  const streetViewRef = useRef<StreetViewPreviewHandle>(null);
  const [viewPreset, setViewPreset] = useState<ViewPreset>("skyline");
  const [hour, setHour] = useState(flowDefaults.hour);
  const [destinationUrl, setDestinationUrl] = useState(flowDefaults.destinationUrl);
  const [brandColor] = useState("#22d3ee");
  const [qrMatrix, setQrMatrix] = useState<boolean[][]>([]);
  const [activeLocation, setActiveLocation] = useState<TakeoverLocation | null>(
    null,
  );
  const [resolvingLocation, setResolvingLocation] = useState(true);

  const sceneReady = !resolvingLocation && activeLocation !== null && qrMatrix.length > 0;
  const { spotlight, onViewChange } = useFlowSpotlight(sceneReady);

  const handleViewPresetChange = (preset: ViewPreset) => {
    setViewPreset(preset);
    onViewChange(preset);
  };

  useEffect(() => {
    let cancelled = false;
    generateQRMatrix(destinationUrl).then((matrix) => {
      if (!cancelled) setQrMatrix(matrix);
    });
    return () => {
      cancelled = true;
    };
  }, [destinationUrl]);

  useEffect(() => {
    if (!apiLoaded) return;

    let cancelled = false;
    setResolvingLocation(true);

    void (async () => {
      const geocoded = await resolveTakeoverAddress(flowDefaults.addressQuery);
      if (cancelled) return;

      if (geocoded) {
        setActiveLocation(
          customTakeoverLocation(
            geocoded.name,
            geocoded.latitude,
            geocoded.longitude,
            geocoded.tagline,
          ),
        );
      } else {
        setActiveLocation(fallback);
      }
      setResolvingLocation(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [apiLoaded, flowDefaults.addressQuery, fallback]);

  useEffect(() => {
    if (resolvingLocation || !activeLocation) return;
    const frame = requestAnimationFrame(() => {
      (usesStreetView(viewPreset) ? streetViewRef : map3dRef).current?.resetView();
    });
    return () => cancelAnimationFrame(frame);
  }, [
    activeLocation?.latitude,
    activeLocation?.longitude,
    resolvingLocation,
    viewPreset,
  ]);

  if (resolvingLocation || !activeLocation || qrMatrix.length === 0) {
    return (
      <div className="flex h-full min-h-[480px] items-center justify-center bg-[#0a0f14]">
        <div className="text-center">
          <p className="label text-orange">Resolving takeover location</p>
          <p className="mt-2 text-sm text-white/50">{flowDefaults.addressQuery}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PreviewScene
        activeLocation={activeLocation}
        viewPreset={viewPreset}
        qrMatrix={qrMatrix}
        hour={hour}
        brandColor={brandColor}
        fixedDroneColor={FLOW_DRONE_COLOR}
        map3dRef={map3dRef}
        streetViewRef={streetViewRef}
        onViewPresetChange={handleViewPresetChange}
        onZoomIn={() =>
          (usesStreetView(viewPreset) ? streetViewRef : map3dRef).current?.zoomIn()
        }
        onZoomOut={() =>
          (usesStreetView(viewPreset) ? streetViewRef : map3dRef).current?.zoomOut()
        }
        onResetView={() =>
          (usesStreetView(viewPreset) ? streetViewRef : map3dRef).current?.resetView()
        }
        showSettings={false}
        tourFocusPreset={spotlight}
        viewGuide={spotlight ? <FlowSpotlight target={spotlight} /> : undefined}
        header={
          <div className="pointer-events-auto max-w-2xl">
            <p className="mb-1 font-[family-name:var(--font-michroma)] text-[0.625rem] uppercase tracking-[0.22em] text-orange">
              Mission · 004 · Campaign preview
            </p>
            <h2 className="display text-lg text-white sm:text-xl">The launch</h2>
            <p className="mt-1 text-xs text-white/55 sm:text-sm">
              {flowDefaults.caption}
            </p>
          </div>
        }
        launchButton={
          <div
            className={`absolute bottom-[11.5rem] left-1/2 w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 sm:bottom-[12.5rem] ${
              spotlight
                ? "pointer-events-none z-[44] opacity-40 blur-[1px]"
                : "pointer-events-auto z-20"
            }`}
          >
            <button
              type="button"
              onClick={onLaunch}
              className="w-full rounded-sm bg-orange px-7 py-3.5 text-[13px] font-medium uppercase tracking-[0.16em] text-paper-pure shadow-[0_8px_32px_rgba(238,75,30,0.35)] transition hover:bg-orange-bright"
            >
              {launched ? "See full analytics dashboard" : "Launch campaign · $2,400"}
            </button>
          </div>
        }
      />
    </>
  );
}

function StandalonePreviewScene() {
  const map3dRef = useRef<GoogleMap3DPreviewHandle>(null);
  const streetViewRef = useRef<StreetViewPreviewHandle>(null);
  const [viewPreset, setViewPreset] = useState<ViewPreset>("skyline");
  const [hour, setHour] = useState(14);
  const [destinationUrl, setDestinationUrl] = useState("https://adastra.com");
  const [brandColor, setBrandColor] = useState("#22d3ee");
  const [message, setMessage] = useState("Ad Astra");
  const [qrMatrix, setQrMatrix] = useState<boolean[][]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(null);

  const activeLocation: TakeoverLocation = selectedPlace
    ? customTakeoverLocation(
        selectedPlace.name,
        selectedPlace.latitude,
        selectedPlace.longitude,
        selectedPlace.address,
      )
    : customTakeoverLocation(
        "Choose a location",
        37.7897,
        -122.4009,
        "Search any address or venue above",
      );

  useEffect(() => {
    let cancelled = false;
    generateQRMatrix(destinationUrl).then((matrix) => {
      if (!cancelled) setQrMatrix(matrix);
    });
    return () => {
      cancelled = true;
    };
  }, [destinationUrl]);

  const handlePlaceSelect = (place: SelectedPlace) => {
    setSelectedPlace(place);
    setViewPreset("skyline");
  };

  return (
    <>
      <PreviewScene
        activeLocation={activeLocation}
        viewPreset={viewPreset}
        qrMatrix={qrMatrix}
        hour={hour}
        brandColor={brandColor}
        map3dRef={map3dRef}
        streetViewRef={streetViewRef}
        onViewPresetChange={setViewPreset}
        onZoomIn={() =>
          (usesStreetView(viewPreset) ? streetViewRef : map3dRef).current?.zoomIn()
        }
        onZoomOut={() =>
          (usesStreetView(viewPreset) ? streetViewRef : map3dRef).current?.zoomOut()
        }
        onResetView={() =>
          (usesStreetView(viewPreset) ? streetViewRef : map3dRef).current?.resetView()
        }
        onOpenSettings={() => setSettingsOpen((o) => !o)}
        settingsOpen={settingsOpen}
        header={
          <Link
            href="/"
            className="pointer-events-auto inline-flex items-center rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 shadow-lg backdrop-blur-2xl transition hover:bg-white/15"
          >
            <AdAstraLogo
              markClassName="h-9 w-9"
              showWordmark
              wordmarkClassName="text-sm font-semibold tracking-tight text-white/90"
            />
          </Link>
        }
        placeSearch={<PlaceSearchBar onPlaceSelect={handlePlaceSelect} />}
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
    </>
  );
}

export function CampaignPreviewView(props: CampaignPreviewViewProps) {
  if (!apiKey) {
    return <MissingApiKey />;
  }

  return (
    <APIProvider apiKey={apiKey} libraries={["maps3d", "places", "streetView"]}>
      {props.mode === "flow" ? (
        <FlowPreviewScene
          premise={props.premise}
          leads={props.leads}
          productUrl={props.productUrl}
          launched={props.launched}
          onLaunch={props.onLaunch}
        />
      ) : (
        <StandalonePreviewScene />
      )}
    </APIProvider>
  );
}