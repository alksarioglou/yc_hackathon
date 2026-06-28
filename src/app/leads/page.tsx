"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProgressConsole } from "@/components/ProgressConsole";
import { LEADS_LINES } from "@/components/flow/constants";
import { FlowError, FlowShell } from "@/components/flow/FlowShell";
import {
  getCampaignPremise,
  setCampaignLeads,
} from "@/lib/campaignSession";
import { useCampaignStep } from "@/hooks/useCampaignStep";
import type { LeadsResult } from "@/lib/types";

export default function LeadsPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  useCampaignStep("finding_leads");

  useEffect(() => {
    let cancelled = false;

    const premise = getCampaignPremise();
    if (!premise) {
      router.replace("/");
      return;
    }

    void (async () => {
      try {
        const res = await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ premise }),
        });
        if (!res.ok) {
          throw new Error((await res.json()).error ?? "Lead search failed");
        }
        const leads = (await res.json()) as LeadsResult;
        if (cancelled) return;
        setCampaignLeads(leads);
        router.replace("/plan");
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Lead search failed");
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
            onClick={() => router.push("/premise")}
            className="text-sm text-orange hover:underline"
          >
            ← Back to target profile
          </button>
        </>
      ) : (
        <ProgressConsole title="Finding leads" lines={LEADS_LINES} done={false} />
      )}
    </FlowShell>
  );
}