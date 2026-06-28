"use client";

import type { ViewPreset } from "@/lib/preview/viewPreset";

const NOTES: Record<"overhead" | "qr", string> = {
  overhead: "Tap Overhead — see the full drone QR formation from above",
  qr: "Tap Scan View — preview how it looks from street level",
};

export function FlowSpotlight({ target }: { target: ViewPreset }) {
  if (target !== "overhead" && target !== "qr") return null;

  return (
    <>
      <div
        className="pointer-events-auto fixed inset-0 z-[44] bg-black/55 backdrop-blur-[10px] transition-opacity duration-500"
        aria-hidden
      />

      <p className="pointer-events-none fixed bottom-[7.25rem] left-1/2 z-[50] max-w-xs -translate-x-1/2 rounded-lg border border-orange/30 bg-ink/90 px-3.5 py-2 text-center text-xs leading-snug text-white/90 shadow-lg backdrop-blur-sm">
        {NOTES[target]}
      </p>
    </>
  );
}