"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LopusAttribution } from "@/components/campaign/LopusAttribution";
import { BTN } from "@/components/flow/constants";
import { FlowShell } from "@/components/flow/FlowShell";
import {
  clearCampaignSession,
  getCampaignLeads,
  getCampaignPayment,
  getCampaignPremise,
} from "@/lib/campaignSession";

const FUNNEL = [
  { label: "Drone impressions", value: "12,400" },
  { label: "QR scans", value: "1,860", note: "15.0%" },
  { label: "Landing visits", value: "1,490", note: "80.1%" },
  { label: "Signups", value: "312", note: "20.9%" },
  { label: "Qualified pipeline", value: "$148,000", accent: true },
];

const LOPUS_URL = "https://lopus.ai/";

export function AnalyticsOverviewDashboard() {
  const router = useRouter();
  const [city, setCity] = useState("your cluster");
  const [productName, setProductName] = useState("Campaign");
  const [txId, setTxId] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    const leads = getCampaignLeads();
    const premise = getCampaignPremise();
    const payment = getCampaignPayment();
    if (leads?.geo.city) setCity(leads.geo.city);
    if (premise?.productName) setProductName(premise.productName);
    if (payment?.txId) setTxId(payment.txId);
    if (payment?.amount) setAmount(payment.amount);
  }, []);

  return (
    <FlowShell>
      <section className="animate-fade-in-up">
        <div className="mb-8 flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="label mb-3 text-orange">Mission · 005 · Full analytics</p>
            <h1 className="display text-3xl sm:text-4xl">Campaign overview</h1>
            <p className="mt-2 max-w-2xl text-muted">
              {productName} over {city} — attribution from impression through pipeline,
              connected across your CRM, product, and billing stack.
            </p>
          </div>
          <LopusAttribution variant="light" />
        </div>

        {(txId || amount) && (
          <div className="mb-6 rounded-sm border border-ink bg-ink px-4 py-3 text-sm text-paper">
            <span className="text-orange">●</span> Payment confirmed
            {txId ? ` · ${txId}` : ""}
            {amount ? ` · ${amount}` : ""}. Drones cleared for launch.
          </div>
        )}

        <div className="grid gap-px border border-ink bg-ink sm:grid-cols-3">
          {[
            { label: "Total scans", value: "1,860", delta: "+18% vs. forecast" },
            { label: "Unique viewers", value: "1,214", delta: "65% scan rate" },
            { label: "Cost per signup", value: "$7.69", delta: "2.4× below paid social" },
          ].map((stat) => (
            <div key={stat.label} className="bg-panel p-6">
              <p className="label text-muted">{stat.label}</p>
              <p className="display mt-2 text-2xl text-ink">{stat.value}</p>
              <p className="mt-1 text-xs text-orange">{stat.delta}</p>
            </div>
          ))}
        </div>

        <div className="mt-px border border-ink border-t-0 bg-panel p-7">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="label text-muted">Conversion attribution funnel</p>
            <LopusAttribution variant="light" />
          </div>
          <ul>
            {FUNNEL.map((step, i) => (
              <li
                key={i}
                className="flex items-center justify-between border-b border-line py-3 last:border-0 last:pb-0"
              >
                <span className={step.accent ? "display text-lg text-orange" : "text-ink/80"}>
                  {step.label}
                </span>
                <span className="flex items-baseline gap-3">
                  {step.note && <span className="label text-muted">{step.note}</span>}
                  <span
                    className={
                      step.accent ? "display text-xl text-orange" : "font-mono text-sm"
                    }
                  >
                    {step.value}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <a
            href={LOPUS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`${BTN} w-full`}
          >
            Open in Lopus →
          </a>
          <button
            type="button"
            onClick={() => {
              clearCampaignSession();
              router.push("/");
            }}
            className="inline-flex w-full items-center justify-center rounded-sm border border-line px-7 py-3.5 text-[13px] font-medium uppercase tracking-[0.16em] text-muted transition hover:border-ink hover:text-ink"
          >
            Start new campaign
          </button>
        </div>
      </section>
    </FlowShell>
  );
}