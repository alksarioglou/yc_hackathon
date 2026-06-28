"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PremiseCard } from "@/components/flow/PremiseCard";
import { FlowShell } from "@/components/flow/FlowShell";
import {
  getCampaignPremise,
  setCampaignPremise,
} from "@/lib/campaignSession";
import { useCampaignStep } from "@/hooks/useCampaignStep";
import type { Premise } from "@/lib/types";

export default function PremisePage() {
  const router = useRouter();
  const [premise, setPremise] = useState<Premise | null>(null);
  useCampaignStep("premise");

  useEffect(() => {
    const saved = getCampaignPremise();
    if (!saved) {
      router.replace("/");
      return;
    }
    setPremise(saved);
  }, [router]);

  function handleConfirm() {
    if (!premise) return;
    setCampaignPremise(premise);
    router.push("/leads");
  }

  if (!premise) return null;

  return (
    <FlowShell>
      <PremiseCard
        premise={premise}
        onChange={setPremise}
        onConfirm={handleConfirm}
      />
    </FlowShell>
  );
}