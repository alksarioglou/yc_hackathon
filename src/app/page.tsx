"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LeadsGrowthLine } from "@/components/landing/LeadsGrowthLine";
import { SkylineQRBackdrop } from "@/components/landing/SkylineQRBackdrop";
import { BTN } from "@/components/flow/constants";
import { FlowShell } from "@/components/flow/FlowShell";
import { beginCampaignFlow } from "@/lib/campaignSession";

export default function Home() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const urlValid = /^https?:\/\/.+\..+/.test(url.trim());

  function startAnalyze() {
    beginCampaignFlow(url.trim());
    router.push("/analyze");
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="fixed inset-0 z-0">
        <SkylineQRBackdrop className="h-full w-full" />
      </div>
      <LeadsGrowthLine />
      <FlowShell className="relative z-10 pointer-events-none">
      <section className="relative flex flex-1 flex-col justify-center overflow-hidden">
        <p className="label pointer-events-none mb-6 text-orange">Mission · 001</p>
        <div className="relative">
        <h1
          className="display pointer-events-none text-balance text-4xl leading-[1.05] sm:text-6xl"
          style={{ fontWeight: 480 }}
        >
          A new frontier in
          <br />
          <span className="text-orange">Geo targeting</span>
        </h1>
        <p className="pointer-events-none mt-6 max-w-xl text-lg leading-relaxed text-muted">
          Drop in your product URL. We build your ICP, find where your leads
          cluster, pick the perfect moment, and fly a drone swarm that paints a
          QR code in the sky — just for them.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && urlValid && startAnalyze()}
            placeholder="https://yourproduct.com"
            className="pointer-events-auto flex-1 rounded-sm border border-line bg-panel px-4 py-3.5 text-ink outline-none transition placeholder:text-muted/60 focus:border-orange"
          />
          <button onClick={startAnalyze} disabled={!urlValid} className={`${BTN} pointer-events-auto`}>
            Make it fly!
          </button>
        </div>
        </div>
      </section>
      </FlowShell>
    </div>
  );
}