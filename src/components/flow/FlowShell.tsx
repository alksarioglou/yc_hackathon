"use client";

import Link from "next/link";
import { clearCampaignSession } from "@/lib/campaignSession";

export function FlowShell({
  children,
  immersive = false,
}: {
  children: React.ReactNode;
  immersive?: boolean;
}) {
  return (
    <div
      className={`relative z-10 flex min-h-screen w-full flex-col ${
        immersive ? "" : "mx-auto max-w-3xl px-5 py-8"
      }`}
    >
      {!immersive && (
        <header className="mb-10 flex items-center justify-between border-b border-line pb-5">
          <Link href="/" onClick={clearCampaignSession} className="flex items-center gap-3">
            <span className="h-4 w-4 bg-orange" />
            <span className="font-display text-base uppercase tracking-[0.14em] text-ink">
              Ad Astra
            </span>
          </Link>
          <span className="label text-muted">Drone Geo-Targeting</span>
        </header>
      )}
      {children}
    </div>
  );
}

export function FlowError({ message }: { message: string }) {
  return (
    <div className="mb-6 rounded-sm border border-orange/40 bg-orange/10 px-4 py-3 text-sm text-ink">
      {message}
    </div>
  );
}