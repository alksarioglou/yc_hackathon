"use client";

import { useEffect } from "react";
import { recordCampaignStep } from "@/lib/campaignSession";
import type { CampaignStep } from "@/lib/campaignSteps";

export function useCampaignStep(step: CampaignStep, eventLabel?: string) {
  useEffect(() => {
    recordCampaignStep(step, eventLabel);
  }, [step, eventLabel]);
}