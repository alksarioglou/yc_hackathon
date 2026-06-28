"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProgressConsole } from "@/components/ProgressConsole";
import { PREVIEW_LINES } from "@/components/flow/constants";
import { FlowShell } from "@/components/flow/FlowShell";
import { getCampaignLeads } from "@/lib/campaignSession";
import { useCampaignStep } from "@/hooks/useCampaignStep";

export default function CampaignLoadingPage() {
  const router = useRouter();
  useCampaignStep("generating_preview");

  useEffect(() => {
    if (!getCampaignLeads()) {
      router.replace("/");
    }
  }, [router]);

  const goToPreview = useCallback(() => {
    router.replace("/campaign");
  }, [router]);

  return (
    <FlowShell>
      <ProgressConsole
        title="Generating campaign preview"
        lines={PREVIEW_LINES}
        done={false}
        onComplete={goToPreview}
      />
    </FlowShell>
  );
}