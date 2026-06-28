import { v } from "convex/values";

export const premiseValidator = v.object({
  productName: v.string(),
  keyFeature: v.string(),
  icp: v.array(v.string()),
});

export const leadValidator = v.object({
  name: v.string(),
  title: v.string(),
  company: v.string(),
  location: v.string(),
  linkedinUrl: v.optional(v.string()),
});

export const geoClusterValidator = v.object({
  city: v.string(),
  cluster: v.string(),
  why: v.string(),
  address: v.string(),
});

export const timingValidator = v.object({
  when: v.string(),
  where: v.string(),
  why: v.string(),
});

export const leadsResultValidator = v.object({
  geo: geoClusterValidator,
  leads: v.array(leadValidator),
  timing: timingValidator,
});

export const paymentResultValidator = v.object({
  success: v.boolean(),
  txId: v.string(),
  amount: v.string(),
});

export const campaignStepValidator = v.union(
  v.literal("started"),
  v.literal("analyzing"),
  v.literal("premise"),
  v.literal("finding_leads"),
  v.literal("plan"),
  v.literal("generating_preview"),
  v.literal("preview"),
  v.literal("launched"),
  v.literal("abandoned"),
);

export const sessionStatusValidator = v.union(
  v.literal("active"),
  v.literal("launched"),
  v.literal("abandoned"),
);