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
import {
  getMap3DCamera,
  type Map3DCamera,
  type TakeoverLocation,
} from "@/lib/preview/cityLocations";

import type { ViewPreset } from "@/lib/preview/viewPreset";

export type { ViewPreset };

export type GoogleMap3DPreviewHandle = {
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
  setViewPreset: (preset: ViewPreset) => void;
  flyToLocation: (lat: number, lng: number) => void;
};

const GoogleMap3DPreview = forwardRef<
  GoogleMap3DPreviewHandle,
  {
    location: TakeoverLocation;
    qrMatrix: boolean[][];
    hour: number;
    brandColor: string;
    viewPreset: ViewPreset;
    fixedDroneColor?: string;
    onCameraChange?: (camera: Map3DCamera) => void;
  }
>(function GoogleMap3DPreview(
  {
    location,
    qrMatrix,
    hour,
    brandColor,
    viewPreset,
    fixedDroneColor,
    onCameraChange,
  },
  ref,
) {
  const mapRef = useRef<Map3DRef>(null);
  const locationRef = useRef(location);
  locationRef.current = location;

  const [camera, setCamera] = useState<Map3DCamera>(() =>
    getMap3DCamera(location, viewPreset),
  );

  const toFlyCamera = (next: Map3DCamera): google.maps.maps3d.CameraOptions => {
    const endCamera: google.maps.maps3d.CameraOptions = {
      center: next.center,
      range: next.range,
      heading: next.heading,
      tilt: next.tilt,
    };
    if (next.fov != null) endCamera.fov = next.fov;
    if (next.altitudeMode) endCamera.altitudeMode = next.altitudeMode;
    if (next.cameraPosition) {
      endCamera.cameraPosition = next.cameraPosition;
      if (!next.altitudeMode) {
        endCamera.altitudeMode = "RELATIVE_TO_MESH";
      }
    }
    return endCamera;
  };

  const flyCamera = (next: Map3DCamera, durationMillis = 1400) => {
    setCamera(next);
    mapRef.current?.flyCameraTo({
      endCamera: toFlyCamera(next),
      durationMillis,
    });
  };

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
      flyCamera(getMap3DCamera(locationRef.current, viewPreset), 1200);
    },
    setViewPreset: (preset: ViewPreset) => {
      flyCamera(getMap3DCamera(locationRef.current, preset));
    },
    flyToLocation: (lat: number, lng: number) => {
      const loc = { ...locationRef.current, latitude: lat, longitude: lng };
      flyCamera(getMap3DCamera(loc, viewPreset), 1800);
    },
  }));

  useEffect(() => {
    flyCamera(getMap3DCamera(location, viewPreset), 1800);
  }, [
    location.latitude,
    location.longitude,
    location.name,
    location.tagline,
    viewPreset,
  ]);

  return (
    <Map3D
      ref={mapRef}
      mode={MapMode.SATELLITE}
      center={camera.center}
      range={camera.range}
      heading={camera.heading}
      tilt={camera.tilt}
      fov={camera.fov}
      gestureHandling={GestureHandling.GREEDY}
      defaultUIHidden
      style={{ width: "100%", height: "100%" }}
      onCameraChanged={(ev) => {
        const next: Map3DCamera = {
          center: ev.detail.center,
          range: ev.detail.range,
          heading: ev.detail.heading,
          tilt: ev.detail.tilt,
          fov: camera.fov,
          cameraPosition: camera.cameraPosition,
          altitudeMode: camera.altitudeMode,
        };
        setCamera(next);
        onCameraChange?.(next);
      }}
    >
      <QRDroneMarkers
        location={location}
        matrix={qrMatrix}
        hour={hour}
        brandColor={brandColor}
        viewPreset={viewPreset}
        fixedDroneColor={fixedDroneColor}
      />
    </Map3D>
  );
});

export default GoogleMap3DPreview;