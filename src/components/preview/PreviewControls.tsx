"use client";

import type { ViewPreset } from "./GoogleMap3DPreview";

const GLASS =
  "border border-white/20 bg-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.25)] backdrop-blur-2xl";

function IconZoomIn() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3M11 8v6M8 11h6" />
    </svg>
  );
}

function IconZoomOut() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3M8 11h6" />
    </svg>
  );
}

function IconReset() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

type CityOption = {
  id: string;
  name: string;
  short: string;
};

const VIEW_PRESETS: { id: ViewPreset; label: string }[] = [
  { id: "skyline", label: "Skyline" },
  { id: "street", label: "Street" },
  { id: "qr", label: "QR View" },
];

export function PreviewControls({
  cities,
  activeCityId,
  activeCityName,
  viewPreset,
  timeLabel,
  droneCount,
  qrAltitude,
  onCityChange,
  onViewPresetChange,
  onZoomIn,
  onZoomOut,
  onResetView,
  onOpenSettings,
  settingsOpen,
}: {
  cities: CityOption[];
  activeCityId: string;
  activeCityName: string;
  viewPreset: ViewPreset;
  timeLabel: string;
  droneCount: number;
  qrAltitude: number;
  onCityChange: (id: string) => void;
  onViewPresetChange: (preset: ViewPreset) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onOpenSettings: () => void;
  settingsOpen: boolean;
}) {
  return (
    <>
      {/* City + view bar */}
      <div className="pointer-events-auto absolute bottom-8 left-1/2 z-20 w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2">
        <div className={`rounded-2xl p-2 ${GLASS}`}>
          <div className="mb-2 flex items-center justify-between px-2 pt-1">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/45">
                Viewing
              </p>
              <p className="text-sm font-semibold text-white">{activeCityName}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-white/40">{timeLabel}</p>
              <p className="text-xs text-white/60">
                {droneCount} drones · {qrAltitude}m
              </p>
            </div>
          </div>

          <div className="flex gap-1.5 overflow-x-auto px-1 pb-1 scrollbar-none">
            {cities.map((c) => {
              const active = c.id === activeCityId;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onCityChange(c.id)}
                  className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                    active
                      ? "bg-white/25 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]"
                      : "text-white/55 hover:bg-white/10 hover:text-white/90"
                  }`}
                >
                  <span className="mr-1.5 font-semibold">{c.short}</span>
                  <span className="hidden sm:inline opacity-80">{c.name}</span>
                </button>
              );
            })}
          </div>

          <p className="px-2 pb-1 text-center text-[10px] text-white/35">
            Scroll or pinch to zoom · drag to orbit · right-drag to pan
          </p>

          <div className="mt-1 flex gap-1 border-t border-white/10 px-1 pt-2">
            {VIEW_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onViewPresetChange(p.id)}
                className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition ${
                  viewPreset === p.id
                    ? "bg-cyan-400/20 text-cyan-200"
                    : "text-white/45 hover:bg-white/5 hover:text-white/70"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Zoom rail */}
      <div className="pointer-events-auto absolute right-5 top-1/2 z-20 -translate-y-1/2">
        <div className={`flex flex-col items-center gap-1 rounded-2xl p-1.5 ${GLASS}`}>
          <button
            type="button"
            onClick={onZoomIn}
            aria-label="Zoom in"
            className="flex h-11 w-11 items-center justify-center rounded-xl text-white/90 transition hover:bg-white/15 active:scale-95"
          >
            <IconZoomIn />
          </button>
          <button
            type="button"
            onClick={onResetView}
            aria-label="Reset view"
            className="flex h-9 w-11 items-center justify-center rounded-xl text-white/50 transition hover:bg-white/10 hover:text-white/80 active:scale-95"
          >
            <IconReset />
          </button>
          <button
            type="button"
            onClick={onZoomOut}
            aria-label="Zoom out"
            className="flex h-11 w-11 items-center justify-center rounded-xl text-white/90 transition hover:bg-white/15 active:scale-95"
          >
            <IconZoomOut />
          </button>
        </div>
      </div>

      {/* Settings trigger */}
      <button
        type="button"
        onClick={onOpenSettings}
        aria-label="Campaign settings"
        className={`pointer-events-auto absolute right-5 top-6 z-20 flex h-11 w-11 items-center justify-center rounded-2xl transition active:scale-95 ${GLASS} ${
          settingsOpen
            ? "bg-white/20 text-white"
            : "text-white/80 hover:bg-white/15"
        }`}
      >
        <IconSettings />
      </button>
    </>
  );
}