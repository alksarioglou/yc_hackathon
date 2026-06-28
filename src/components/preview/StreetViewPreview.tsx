"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { QRSkyOverlay } from "./QRSkyOverlay";
import { bearingBetween, distanceBetweenMeters } from "@/lib/preview/geo";
import { findNearestPanorama } from "@/lib/preview/streetViewLookup";
import { getStreetViewQrAltitude } from "@/lib/preview/streetViewQr";
import type { TakeoverLocation } from "@/lib/preview/cityLocations";
import { getTimeMode } from "@/lib/preview/timeOfDay";

export type StreetViewPreviewHandle = {
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
};

const StreetViewPreview = forwardRef<
  StreetViewPreviewHandle,
  {
    location: TakeoverLocation;
    qrMatrix: boolean[][];
    hour: number;
    brandColor: string;
    viewPreset: "qr";
    fixedDroneColor?: string;
  }
>(function StreetViewPreview(
  { location, qrMatrix, hour, brandColor, fixedDroneColor },
  ref,
) {
  const streetViewLib = useMapsLibrary("streetView");
  const containerRef = useRef<HTMLDivElement>(null);
  const panoramaRef = useRef<google.maps.StreetViewPanorama | null>(null);
  const initialPovRef = useRef<{
    heading: number;
    pitch: number;
    scanPitch: number;
  }>({
    heading: 0,
    pitch: 0,
    scanPitch: 55,
  });
  const [panorama, setPanorama] =
    useState<google.maps.StreetViewPanorama | null>(null);

  const [status, setStatus] = useState<
    "initializing" | "loading" | "ready" | "unavailable"
  >("initializing");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [panoramaReady, setPanoramaReady] = useState(false);

  const isNight = getTimeMode(hour) !== "day";
  const dotColor = fixedDroneColor ?? (isNight ? brandColor : "#22d3ee");
  const glow = !fixedDroneColor;

  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      const pano = panoramaRef.current;
      if (!pano) return;
      pano.setZoom(Math.min((pano.getZoom() ?? 1) + 1, 4));
    },
    zoomOut: () => {
      const pano = panoramaRef.current;
      if (!pano) return;
      pano.setZoom(Math.max((pano.getZoom() ?? 1) - 1, 0));
    },
    resetView: () => {
      const pano = panoramaRef.current;
      if (!pano) return;
      pano.setZoom(1);
      pano.setPov({
        heading: initialPovRef.current.heading,
        pitch: initialPovRef.current.scanPitch,
      });
    },
  }));

  useEffect(() => {
    if (!streetViewLib || !containerRef.current) return;

    let cancelled = false;
    const container = containerRef.current;
    setStatus("loading");
    setStatusMessage(null);
    setPanoramaReady(false);

    const panorama = new streetViewLib.StreetViewPanorama(container, {
      visible: true,
      disableDefaultUI: false,
      clickToGo: true,
      scrollwheel: true,
      motionTracking: false,
      motionTrackingControl: false,
      addressControl: true,
      linksControl: true,
      zoomControl: true,
      showRoadLabels: true,
    });

    panoramaRef.current = panorama;
    setPanorama(panorama);

    const applyPov = (heading: number, pitch: number, scanPitch: number) => {
      initialPovRef.current = { heading, pitch, scanPitch };
      panorama.setPov({ heading, pitch });
      panorama.setZoom(1);
    };

    const listeners = [
      panorama.addListener("status_changed", () => {
        if (cancelled) return;
        const panoStatus = panorama.getStatus();
        if (panoStatus === streetViewLib.StreetViewStatus.OK) {
          setStatus("ready");
          setPanoramaReady(true);
          setStatusMessage(null);
        } else if (panoStatus === streetViewLib.StreetViewStatus.ZERO_RESULTS) {
          setStatus("unavailable");
          setPanoramaReady(false);
          setStatusMessage("No Street View coverage near this location.");
        }
      }),
    ];

    void findNearestPanorama(
      streetViewLib,
      location.latitude,
      location.longitude,
    ).then((data) => {
      if (cancelled) return;

      if (!data?.location?.latLng) {
        setStatus("unavailable");
        setStatusMessage("No Street View coverage near this location.");
        return;
      }

      const panoPos = data.location.latLng;
      const heading = bearingBetween(
        panoPos.lat(),
        panoPos.lng(),
        location.latitude,
        location.longitude,
      );
      const dist = distanceBetweenMeters(
        panoPos.lat(),
        panoPos.lng(),
        location.latitude,
        location.longitude,
      );
      const skyAlt = getStreetViewQrAltitude(location.qrAltitudeMeters);
      const elevationAngle =
        (Math.atan2(skyAlt - 2, dist) * 180) / Math.PI;
      // Look slightly below the formation so the QR sits high in the frame.
      const scanPitch = Math.min(84, Math.max(55, elevationAngle - 12));
      const pitch = scanPitch;

      if (data.location.pano) {
        panorama.setPano(data.location.pano);
      }
      panorama.setPosition(panoPos);
      applyPov(heading, pitch, scanPitch);

      google.maps.event.trigger(panorama, "resize");

      if (panorama.getStatus() === streetViewLib.StreetViewStatus.OK) {
        setStatus("ready");
        setPanoramaReady(true);
      }
    });

    return () => {
      cancelled = true;
      listeners.forEach((l) => l.remove());
      panoramaRef.current = null;
      setPanorama(null);
      setPanoramaReady(false);
    };
  }, [
    streetViewLib,
    location.latitude,
    location.longitude,
    location.name,
  ]);

  return (
    <div className="relative h-full w-full bg-[#111]">
      <div ref={containerRef} className="h-full w-full" />

      {panoramaReady && panorama && (
        <QRSkyOverlay
          panorama={panorama}
          location={location}
          qrMatrix={qrMatrix}
          color={dotColor}
          glow={glow}
        />
      )}

      {status !== "ready" && status !== "unavailable" && (
        <div className="pointer-events-none absolute inset-x-0 top-4 z-30 flex justify-center">
          <p className="rounded-full border border-white/20 bg-black/70 px-4 py-2 text-xs text-white/70 backdrop-blur-md">
            {status === "initializing"
              ? "Starting Street View…"
              : "Finding nearest panorama…"}
          </p>
        </div>
      )}

      {status === "unavailable" && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#0a0f14] p-8">
          <div className="max-w-sm rounded-2xl border border-white/20 bg-white/10 p-6 text-center backdrop-blur-2xl">
            <p className="mb-2 text-sm font-medium text-white">
              No Street View here
            </p>
            <p className="text-xs text-white/50">
              {statusMessage ??
                "Try searching for a major street address or landmark."}
            </p>
          </div>
        </div>
      )}

    </div>
  );
});

export default StreetViewPreview;