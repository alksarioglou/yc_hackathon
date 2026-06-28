"use client";

import type { ViewPreset } from "@/lib/preview/viewPreset";

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

const VIEW_PRESETS: { id: ViewPreset; label: string; hint?: string }[] = [
  { id: "skyline", label: "Skyline", hint: "Campaign planning overview" },
  {
    id: "overhead",
    label: "Overhead",
    hint: "Directly above — full QR formation",
  },
  {
    id: "qr",
    label: "Scan View",
    hint: "Street View angled up — phone-in-hand scannability",
  },
];

export function PreviewControls({
  activeLocationName,
  activeLocationTagline,
  viewPreset,
  timeLabel,
  droneCount,
  qrAltitude,
  onViewPresetChange,
  onZoomIn,
  onZoomOut,
  onResetView,
  onOpenSettings,
  settingsOpen,
  showSettings = true,
  highlightPresets = [],
  tourFocusPreset = null,
}: {
  activeLocationName: string;
  activeLocationTagline?: string;
  viewPreset: ViewPreset;
  timeLabel: string;
  droneCount: number;
  qrAltitude: number;
  onViewPresetChange: (preset: ViewPreset) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onOpenSettings?: () => void;
  settingsOpen?: boolean;
  showSettings?: boolean;
  highlightPresets?: ViewPreset[];
  tourFocusPreset?: ViewPreset | null;
}) {
  const tourActive = tourFocusPreset != null;

  return (
    <>
      {/* City + view bar */}
      <div
        className={`absolute bottom-8 left-1/2 w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 ${
          tourActive ? "pointer-events-none z-[48]" : "pointer-events-auto z-20"
        }`}
      >
        <div className={`rounded-2xl p-2 ${GLASS}`}>
          <div
            className={`mb-2 flex items-center justify-between px-2 pt-1 transition-opacity ${
              tourActive ? "opacity-30" : ""
            }`}
          >
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/45">
                Location
              </p>
              <p className="text-sm font-semibold text-white">{activeLocationName}</p>
              {activeLocationTagline && (
                <p className="text-[10px] text-white/40">{activeLocationTagline}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-[10px] text-white/40">{timeLabel}</p>
              <p className="text-xs text-white/60">
                {droneCount} drones · {qrAltitude}m
              </p>
            </div>
          </div>

          <p
            className={`px-2 pb-2 text-center text-[10px] text-white/35 transition-opacity ${
              tourActive ? "opacity-30" : ""
            }`}
          >
            {VIEW_PRESETS.find((p) => p.id === viewPreset)?.hint ??
              "Scroll or pinch to zoom · drag to orbit · right-drag to pan"}
          </p>

          <div className="mt-1 flex gap-1 border-t border-white/10 px-1 pt-2">
            {VIEW_PRESETS.map((p) => {
              const isTourFocus = tourFocusPreset === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  data-tour-focus={isTourFocus ? p.id : undefined}
                  onClick={() => onViewPresetChange(p.id)}
                  disabled={tourActive && !isTourFocus}
                  className={`relative flex-1 rounded-lg py-1.5 text-xs font-medium transition ${
                    isTourFocus
                      ? "pointer-events-auto z-[49] scale-[1.08] bg-orange font-semibold text-white shadow-[0_0_28px_rgba(238,75,30,0.65)] ring-2 ring-orange ring-offset-2 ring-offset-black/40"
                      : viewPreset === p.id
                        ? "bg-cyan-400/20 text-cyan-200"
                        : highlightPresets.includes(p.id)
                          ? "animate-pulse bg-orange/25 text-orange ring-1 ring-orange/50"
                          : tourActive
                            ? "cursor-not-allowed text-white/20"
                            : "text-white/45 hover:bg-white/5 hover:text-white/70"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Zoom rail */}
      <div
        className={`absolute right-5 top-1/2 -translate-y-1/2 ${
          tourActive
            ? "pointer-events-none z-[44] opacity-30 blur-[1px]"
            : "pointer-events-auto z-20"
        }`}
      >
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

      {showSettings && onOpenSettings && (
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
      )}
    </>
  );
}