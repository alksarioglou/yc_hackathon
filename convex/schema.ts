import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import {
  campaignStepValidator,
  leadsResultValidator,
  paymentResultValidator,
  premiseValidator,
  sessionStatusValidator,
} from "./validators";

export default defineSchema({
  tasks: defineTable({
    text: v.string(),
    isCompleted: v.boolean(),
  }),
  campaignSessions: defineTable({
    clientSessionId: v.string(),
    url: v.string(),
    premise: v.optional(premiseValidator),
    leads: v.optional(leadsResultValidator),
    payment: v.optional(paymentResultValidator),
    currentStep: campaignStepValidator,
    status: sessionStatusValidator,
    events: v.array(
      v.object({
        step: campaignStepValidator,
        at: v.number(),
        label: v.optional(v.string()),
      }),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_client_session_id", ["clientSessionId"]),
});