"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LeadsGrowthLine } from "@/components/landing/LeadsGrowthLine";
import { PoweredByPartners } from "@/components/landing/PoweredByPartners";
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
      <div
        className="pointer-events-none fixed inset-y-0 left-0 z-[1] w-[min(100%,780px)] bg-gradient-to-r from-paper from-[35%] via-paper/88 via-[65%] to-transparent"
        aria-hidden
      />
      <LeadsGrowthLine />
      <PoweredByPartners className="fixed bottom-5 right-5 z-10 sm:right-8 lg:right-12" />
      <FlowShell align="left" className="relative z-10 pointer-events-none">
        <section className="relative flex flex-1 flex-col justify-center overflow-hidden">
          <h1
            className="display pointer-events-none text-balance text-4xl leading-[1.05] text-ink sm:text-6xl [text-shadow:0_0_24px_rgba(241,239,233,0.85)]"
            style={{ fontWeight: 480 }}
          >
            You&apos;re paying for ads
            <br />
            <span className="text-orange [text-shadow:0_0_20px_rgba(241,239,233,0.7)]">
              no one looks at.
            </span>
          </h1>
          <p className="pointer-events-none mt-6 max-w-xl text-xl leading-snug text-ink/90">
            Ad Astra makes your leads look up — <br /> to your drone-drawn QR code in the sky.
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
            <button
              onClick={startAnalyze}
              disabled={!urlValid}
              className={`${BTN} pointer-events-auto`}
            >
              Make it fly!
            </button>
          </div>

          <p className="pointer-events-none mt-6 max-w-xl text-sm leading-relaxed text-ink/80">
            Paste a product URL. We build your ICP, find your real buyers, and
            pinpoint exactly <br /> where and when they cluster —
            <br />
            <span className="text-orange">
              then a drone swarm draws a scannable QR code in the sky right above
              them.
            </span>
          </p>
        </section>
      </FlowShell>
    </div>
  );
}