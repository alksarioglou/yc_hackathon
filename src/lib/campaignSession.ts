import { type CampaignStep, shouldAdvanceStep } from "./campaignSteps";
import {
  syncCampaignAbandon,
  syncCampaignSession,
} from "./campaignSessionSync";
import type { LeadsResult, PaymentResult, Premise } from "./types";

const KEY = "adastra-campaign";

export interface CampaignSession {
  clientSessionId: string;
  url: string;
  premise: Premise | null;
  leads: LeadsResult | null;
  payment: PaymentResult | null;
  currentStep: CampaignStep;
}

const EMPTY_SESSION: CampaignSession = {
  clientSessionId: "",
  url: "",
  premise: null,
  leads: null,
  payment: null,
  currentStep: "started",
};

function newClientSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function normalize(session: Partial<CampaignSession>): CampaignSession {
  return {
    clientSessionId: session.clientSessionId ?? "",
    url: session.url ?? "",
    premise: session.premise ?? null,
    leads: session.leads ?? null,
    payment: session.payment ?? null,
    currentStep: session.currentStep ?? "started",
  };
}

function read(): CampaignSession {
  if (typeof window === "undefined") {
    return { ...EMPTY_SESSION };
  }
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return { ...EMPTY_SESSION };
    return normalize(JSON.parse(raw) as Partial<CampaignSession>);
  } catch {
    return { ...EMPTY_SESSION };
  }
}

function write(session: CampaignSession) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify(session));
}

function persist(session: CampaignSession, step: CampaignStep, eventLabel?: string) {
  const next = { ...session, currentStep: step };
  write(next);
  syncCampaignSession(next, step, eventLabel);
  return next;
}

export function getCampaignSession(): CampaignSession {
  return read();
}

export function getCampaignClientSessionId(): string {
  return read().clientSessionId;
}

export function setCampaignUrl(url: string) {
  const s = read();
  s.url = url;
  write(s);
}

/** Wipe prior flow state (including payment) and start a fresh campaign. */
export function beginCampaignFlow(url: string) {
  const previous = read();
  if (
    previous.clientSessionId &&
    previous.currentStep !== "launched" &&
    previous.currentStep !== "abandoned"
  ) {
    syncCampaignAbandon(previous.clientSessionId, "Replaced by new campaign");
  }

  const session: CampaignSession = {
    clientSessionId: newClientSessionId(),
    url,
    premise: null,
    leads: null,
    payment: null,
    currentStep: "started",
  };
  write(session);
  syncCampaignSession(session, "started", "Campaign flow started");
}

export function recordCampaignStep(step: CampaignStep, eventLabel?: string) {
  const s = read();
  if (!s.clientSessionId || !shouldAdvanceStep(s.currentStep, step)) return;
  persist(s, step, eventLabel);
}

export function clearCampaignPayment() {
  const s = read();
  s.payment = null;
  write(s);
  if (s.clientSessionId) {
    syncCampaignSession(s, s.currentStep, "Payment cleared");
  }
}

export function getCampaignUrl(): string {
  return read().url;
}

export function setCampaignPremise(premise: Premise) {
  const s = read();
  s.premise = premise;
  persist(s, "premise", "Premise saved");
}

export function getCampaignPremise(): Premise | null {
  return read().premise;
}

export function setCampaignLeads(leads: LeadsResult) {
  const s = read();
  s.leads = leads;
  persist(s, "finding_leads", "Leads found");
}

export function getCampaignLeads(): LeadsResult | null {
  return read().leads;
}

export function setCampaignPayment(payment: PaymentResult) {
  const s = read();
  s.payment = payment;
  persist(s, "launched", "Payment confirmed");
}

export function getCampaignPayment(): PaymentResult | null {
  return read().payment;
}

export function clearCampaignSession() {
  if (typeof window === "undefined") return;
  const session = read();
  sessionStorage.removeItem(KEY);
  if (
    session.clientSessionId &&
    session.currentStep !== "launched" &&
    session.currentStep !== "abandoned"
  ) {
    syncCampaignAbandon(session.clientSessionId, "Session cleared");
  }
}