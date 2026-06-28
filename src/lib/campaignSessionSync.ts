import { api } from "../../convex/_generated/api";
import type { CampaignSession } from "./campaignSession";
import { type CampaignStep, statusForStep } from "./campaignSteps";
import { convexClient, isConvexConfigured } from "./convexClient";

const DEBOUNCE_MS = 300;

type PendingUpsert = {
  session: CampaignSession;
  step: CampaignStep;
  eventLabel?: string;
};

let tail: Promise<void> = Promise.resolve();
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let pendingUpsert: PendingUpsert | null = null;
let lastSyncedFingerprint = "";

function syncPayload(
  session: CampaignSession,
  step: CampaignStep,
  eventLabel?: string,
) {
  return {
    clientSessionId: session.clientSessionId,
    url: session.url,
    premise: session.premise ?? undefined,
    leads: session.leads ?? undefined,
    payment: session.payment ?? undefined,
    currentStep: step,
    status: statusForStep(step),
    eventLabel,
  };
}

function upsertFingerprint(
  session: CampaignSession,
  step: CampaignStep,
  eventLabel?: string,
) {
  return JSON.stringify({
    clientSessionId: session.clientSessionId,
    step,
    url: session.url,
    premise: session.premise,
    leads: session.leads,
    payment: session.payment,
    eventLabel,
  });
}

function runExclusive<T>(fn: () => Promise<T>): Promise<T> {
  const run = tail.then(fn);
  tail = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function flushPendingUpsert() {
  const client = convexClient;
  if (!pendingUpsert || !client) return;

  const job = pendingUpsert;
  pendingUpsert = null;
  const fingerprint = upsertFingerprint(job.session, job.step, job.eventLabel);

  if (fingerprint === lastSyncedFingerprint) return;

  void runExclusive(async () => {
    await client.mutation(
      api.campaignSessions.upsert,
      syncPayload(job.session, job.step, job.eventLabel),
    );
    lastSyncedFingerprint = fingerprint;
  }).catch((err) => {
    console.error("[campaignSession] Convex upsert failed:", err);
  });
}

function scheduleUpsert(job: PendingUpsert) {
  pendingUpsert = job;

  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    flushPendingUpsert();
  }, DEBOUNCE_MS);
}

export function syncCampaignSession(
  session: CampaignSession,
  step: CampaignStep,
  eventLabel?: string,
) {
  if (!isConvexConfigured() || !convexClient || !session.clientSessionId) {
    return;
  }

  scheduleUpsert({ session, step, eventLabel });
}

export function syncCampaignAbandon(
  clientSessionId: string,
  eventLabel?: string,
) {
  if (!isConvexConfigured() || !convexClient || !clientSessionId) {
    return;
  }

  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  pendingUpsert = null;

  const client = convexClient;
  void runExclusive(async () => {
    await client.mutation(api.campaignSessions.abandon, {
      clientSessionId,
      eventLabel,
    });
    lastSyncedFingerprint = "";
  }).catch((err) => {
    console.error("[campaignSession] Convex abandon failed:", err);
  });
}