"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  GestureHandling,
  Map3D,
  MapMode,
  type Map3DRef,
} from "@vis.gl/react-google-maps";
import { QRDroneMarkers } from "./QRDroneMarkers";
import type { CityLocation } from "@/lib/preview/cityLocations";
import {
  getMap3DCamera,
  type Map3DCamera,
} from "@/lib/preview/cityLocations";

export type ViewPreset = "skyline" | "street" | "qr";

export type GoogleMap3DPreviewHandle = {
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
  setViewPreset: (preset: ViewPreset) => void;
};

const GoogleMap3DPreview = forwardRef<
  GoogleMap3DPreviewHandle,
  {
    city: CityLocation;
    qrMatrix: boolean[][];
    hour: number;
    brandColor: string;
    viewPreset: ViewPreset;
    onCameraChange?: (camera: Map3DCamera) => void;
  }
>(function GoogleMap3DPreview(
  { city, qrMatrix, hour, brandColor, viewPreset, onCameraChange },
  ref,
) {
  const mapRef = useRef<Map3DRef>(null);
  const [camera, setCamera] = useState<Map3DCamera>(() =>
    getMap3DCamera(city, viewPreset),
  );

  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      setCamera((c) => {
        const next = { ...c, range: Math.max(c.range * 0.72, 120) };
        mapRef.current?.flyCameraTo({
          endCamera: next,
          durationMillis: 400,
        });
        return next;
      });
    },
    zoomOut: () => {
      setCamera((c) => {
        const next = { ...c, range: Math.min(c.range * 1.38, 8000) };
        mapRef.current?.flyCameraTo({
          endCamera: next,
          durationMillis: 400,
        });
        return next;
      });
    },
    resetView: () => {
      const next = getMap3DCamera(city, viewPreset);
      setCamera(next);
      mapRef.current?.flyCameraTo({
        endCamera: next,
        durationMillis: 1200,
      });
    },
    setViewPreset: (preset: ViewPreset) => {
      const next = getMap3DCamera(city, preset);
      setCamera(next);
      mapRef.current?.flyCameraTo({
        endCamera: next,
        durationMillis: 1400,
      });
    },
  }));

  useEffect(() => {
    const next = getMap3DCamera(city, viewPreset);
    setCamera(next);
    mapRef.current?.flyCameraTo({
      endCamera: next,
      durationMillis: 1800,
    });
  }, [city, viewPreset]);

  return (
    <Map3D
      ref={mapRef}
      mode={MapMode.SATELLITE}
      center={camera.center}
      range={camera.range}
      heading={camera.heading}
      tilt={camera.tilt}
      gestureHandling={GestureHandling.GREEDY}
      defaultUIHidden
      style={{ width: "100%", height: "100%" }}
      onCameraChanged={(ev) => {
        const next = {
          center: ev.detail.center,
          range: ev.detail.range,
          heading: ev.detail.heading,
          tilt: ev.detail.tilt,
        };
        setCamera(next);
        onCameraChange?.(next);
      }}
    >
      <QRDroneMarkers
        city={city}
        matrix={qrMatrix}
        hour={hour}
        brandColor={brandColor}
      />
    </Map3D>
  );
});

export default GoogleMap3DPreview;