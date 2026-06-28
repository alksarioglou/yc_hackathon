"use client";

import { CampaignPreviewView } from "@/components/preview/CampaignPreviewView";

export default function PreviewPage() {
  return (
    <div className="h-screen w-screen">
      <CampaignPreviewView mode="standalone" />
    </div>
  );
}