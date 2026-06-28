export type CampaignStep =
  | "started"
  | "analyzing"
  | "premise"
  | "finding_leads"
  | "plan"
  | "generating_preview"
  | "preview"
  | "launched"
  | "abandoned";

export type SessionStatus = "active" | "launched" | "abandoned";

const STEP_ORDER: Record<CampaignStep, number> = {
  started: 0,
  analyzing: 1,
  premise: 2,
  finding_leads: 3,
  plan: 4,
  generating_preview: 5,
  preview: 6,
  launched: 7,
  abandoned: 8,
};

export function statusForStep(step: CampaignStep): SessionStatus {
  if (step === "launched") return "launched";
  if (step === "abandoned") return "abandoned";
  return "active";
}

export function shouldAdvanceStep(
  current: CampaignStep,
  next: CampaignStep,
): boolean {
  if (next === "abandoned") return current !== "launched";
  return STEP_ORDER[next] > STEP_ORDER[current];
}