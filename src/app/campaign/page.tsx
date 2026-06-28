"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { CampaignAnalyticsPanel } from "@/components/campaign/CampaignAnalyticsPanel";
import { PaymentModal } from "@/components/PaymentModal";
import {
  getCampaignLeads,
  getCampaignPayment,
  getCampaignPremise,
  getCampaignUrl,
  setCampaignPayment,
} from "@/lib/campaignSession";
import { useCampaignStep } from "@/hooks/useCampaignStep";
import type { LeadsResult, PaymentResult, Premise } from "@/lib/types";

const CampaignPreviewView = dynamic(
  () =>
    import("@/components/preview/CampaignPreviewView").then(
      (m) => m.CampaignPreviewView,
    ),
  { ssr: false },
);

export default function CampaignPage() {
  const router = useRouter();
  useCampaignStep("preview");
  const [premise, setPremise] = useState<Premise | null>(null);
  const [leads, setLeads] = useState<LeadsResult | null>(null);
  const [url, setUrl] = useState("");
  const [payment, setPayment] = useState<PaymentResult | null>(null);
  const [showPay, setShowPay] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    const savedPremise = getCampaignPremise();
    const savedLeads = getCampaignLeads();
    const savedUrl = getCampaignUrl();

    if (!savedPremise || !savedLeads) {
      router.replace("/");
      return;
    }

    setPremise(savedPremise);
    setLeads(savedLeads);
    setUrl(savedUrl);
    const savedPayment = getCampaignPayment();
    setPayment(savedPayment);
    if (savedPayment?.success) setShowAnalytics(true);
  }, [router]);

  useEffect(() => {
    if (!payment?.success) return;
    const t = setTimeout(() => setShowAnalytics(true), 1500);
    return () => clearTimeout(t);
  }, [payment?.success]);

  async function runPayment() {
    const res = await fetch("/api/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ premise, leads }),
    });
    if (!res.ok) throw new Error((await res.json()).error ?? "Payment failed");
    const result = (await res.json()) as PaymentResult;
    setCampaignPayment(result);
    setPayment(result);
    return result;
  }

  if (!premise || !leads) return null;

  return (
    <div className="relative h-screen w-full">
      <CampaignPreviewView
        mode="flow"
        premise={premise}
        leads={leads}
        productUrl={url}
        launched={!!payment?.success}
        onLaunch={() => {
          if (payment?.success) {
            router.push("/analytics");
            return;
          }
          setShowPay(true);
        }}
      />

      {payment?.success && (
        <div className="pointer-events-none absolute bottom-6 left-6 z-30 max-w-sm">
          <div className="rounded-sm border border-orange/40 bg-ink/90 px-4 py-3 text-sm text-paper backdrop-blur-md">
            <span className="text-orange">●</span> Payment confirmed ·{" "}
            {payment.txId} · {payment.amount}. Your drones are cleared for launch.
          </div>
        </div>
      )}

      {showPay && (
        <PaymentModal
          amount="$2,400.00"
          onPay={runPayment}
          onClose={() => setShowPay(false)}
        />
      )}

      <CampaignAnalyticsPanel open={showAnalytics} city={leads.geo.city} />
    </div>
  );
}