"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnalyticsOverviewDashboard } from "@/components/campaign/AnalyticsOverviewDashboard";
import { getCampaignPayment } from "@/lib/campaignSession";

export default function AnalyticsPage() {
  const router = useRouter();

  useEffect(() => {
    if (!getCampaignPayment()?.success) {
      router.replace("/");
    }
  }, [router]);

  if (!getCampaignPayment()?.success) return null;

  return <AnalyticsOverviewDashboard />;
}