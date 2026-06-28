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
    <FlowShell>
      <section className="relative flex flex-1 flex-col justify-center">
        <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 aspect-square w-[125%] max-w-[820px] -translate-x-1/2 -translate-y-1/2 opacity-[0.08]">
          <CorridorBackdrop className="h-full w-full" />
        </div>

          <h1
            className="display text-balance text-4xl leading-[1.05] sm:text-6xl"
            style={{ fontWeight: 480 }}
          >
            You&apos;re paying for ads
            <br />
            <span className="text-orange">no one looks at.</span>
          </h1>
          <p className="mt-6 max-w-xl text-xl leading-snug text-ink">
            Ad Astra makes them look up — a drone-drawn QR code in the sky.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && urlValid && runAnalyze()}
              placeholder="https://yourproduct.com"
              className="flex-1 rounded-sm border border-line bg-panel px-4 py-3.5 text-ink outline-none transition placeholder:text-muted/60 focus:border-orange"
            />
            <button onClick={runAnalyze} disabled={!urlValid} className={BTN}>
              Analyze product
            </button>
          </div>

          <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted">
            Paste a product URL. We build your ICP, find your real buyers, and
            pinpoint exactly where and when they cluster — then a drone swarm
            draws a scannable QR code in the sky right above them.
          </p>
        </section>
      )}

      {/* STEP 1 — Analyzing */}
      {phase === "analyzing" && (
        <ProgressConsole title="Analyzing product" lines={ANALYZE_LINES} done={false} />
      )}

      {/* STEP 2 — Premise (editable) */}
      {phase === "premise" && premise && (
        <PremiseCard premise={premise} onChange={setPremise} onConfirm={runLeads} />
      )}

      {/* STEP 3 — Finding leads */}
      {phase === "finding" && (
        <ProgressConsole title="Finding leads" lines={LEADS_LINES} done={false} />
      )}

      {/* STEP 4 — Campaign plan */}
      {phase === "plan" && leads && <PlanCard leads={leads} onPreview={runPreview} />}

      {/* STEP 5 — Generating preview */}
      {phase === "generating" && (
        <ProgressConsole
          title="Generating campaign preview"
          lines={PREVIEW_LINES}
          done={false}
        />
      )}

      {/* STEP 6 — Preview + pay */}
      {phase === "preview" && preview && !payment?.success && (
        <PreviewCard preview={preview} onPay={() => setShowPay(true)} />
      )}

      {showPay && (
        <PaymentModal
          amount="$2,400.00"
          onPay={runPayment}
          onClose={() => setShowPay(false)}
        />
      )}

      {/* STEP 7 — Measure results (Lopus) */}
      {payment?.success && (
        <ResultsCard payment={payment} leads={leads} onReset={reset} />
      )}
    </div>
  );
}