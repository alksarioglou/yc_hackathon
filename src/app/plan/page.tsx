"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PlanCard } from "@/components/flow/PlanCard";
import { FlowShell } from "@/components/flow/FlowShell";
import { getCampaignLeads, setCampaignLeads } from "@/lib/campaignSession";
import { useCampaignStep } from "@/hooks/useCampaignStep";
import type { LeadsResult } from "@/lib/types";

export default function PlanPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<LeadsResult | null>(null);
  useCampaignStep("plan");

  useEffect(() => {
    const saved = getCampaignLeads();
    if (!saved) {
      router.replace("/");
      return;
    }
    setLeads(saved);
  }, [router]);

  if (!leads) return null;

  function handleLeadsChange(next: LeadsResult) {
    setLeads(next);
    setCampaignLeads(next);
  }

  return (
    <FlowShell>
      <PlanCard
        leads={leads}
        onLeadsChange={handleLeadsChange}
        onPreview={() => router.push("/campaign/loading")}
      />
    </FlowShell>
  );
}