"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProgressConsole } from "@/components/ProgressConsole";
import { ANALYZE_LINES } from "@/components/flow/constants";
import { FlowError, FlowShell } from "@/components/flow/FlowShell";
import { getCampaignUrl, setCampaignPremise } from "@/lib/campaignSession";
import { useCampaignStep } from "@/hooks/useCampaignStep";
import type { Premise } from "@/lib/types";

export default function AnalyzePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  useCampaignStep("analyzing");

  useEffect(() => {
    let cancelled = false;

    const url = getCampaignUrl();
    if (!url) {
      router.replace("/");
      return;
    }

    void (async () => {
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        if (!res.ok) {
          throw new Error((await res.json()).error ?? "Analysis failed");
        }
        const premise = (await res.json()) as Premise;
        if (cancelled) return;
        setCampaignPremise(premise);
        router.replace("/premise");
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Analysis failed");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <FlowShell>
      {error ? (
        <>
          <FlowError message={error} />
          <button
            type="button"
            onClick={() => router.push("/")}
            className="text-sm text-orange hover:underline"
          >
            ← Back to start
          </button>
        </>
      ) : (
        <ProgressConsole title="Analyzing product" lines={ANALYZE_LINES} done={false} />
      )}
    </FlowShell>
  );
}