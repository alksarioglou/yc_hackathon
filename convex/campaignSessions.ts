import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  campaignStepValidator,
  leadsResultValidator,
  paymentResultValidator,
  premiseValidator,
  sessionStatusValidator,
} from "./validators";

export const upsert = mutation({
  args: {
    clientSessionId: v.string(),
    url: v.string(),
    premise: v.optional(premiseValidator),
    leads: v.optional(leadsResultValidator),
    payment: v.optional(paymentResultValidator),
    currentStep: campaignStepValidator,
    status: sessionStatusValidator,
    eventLabel: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const event = {
      step: args.currentStep,
      at: now,
      ...(args.eventLabel ? { label: args.eventLabel } : {}),
    };

    const existing = await ctx.db
      .query("campaignSessions")
      .withIndex("by_client_session_id", (q) =>
        q.eq("clientSessionId", args.clientSessionId),
      )
      .unique();

    if (existing) {
      const lastEvent = existing.events.at(-1);
      const events =
        lastEvent?.step === args.currentStep
          ? existing.events
          : [...existing.events, event];

      await ctx.db.patch(existing._id, {
        url: args.url,
        premise: args.premise,
        leads: args.leads,
        payment: args.payment,
        currentStep: args.currentStep,
        status: args.status,
        events,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("campaignSessions", {
      clientSessionId: args.clientSessionId,
      url: args.url,
      premise: args.premise,
      leads: args.leads,
      payment: args.payment,
      currentStep: args.currentStep,
      status: args.status,
      events: [event],
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const abandon = mutation({
  args: {
    clientSessionId: v.string(),
    eventLabel: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("campaignSessions")
      .withIndex("by_client_session_id", (q) =>
        q.eq("clientSessionId", args.clientSessionId),
      )
      .unique();

    if (!existing) return null;

    const now = Date.now();
    const event = {
      step: "abandoned" as const,
      at: now,
      ...(args.eventLabel ? { label: args.eventLabel } : {}),
    };
    const lastEvent = existing.events.at(-1);
    const events =
      lastEvent?.step === "abandoned"
        ? existing.events
        : [...existing.events, event];

    await ctx.db.patch(existing._id, {
      currentStep: "abandoned",
      status: "abandoned",
      events,
      updatedAt: now,
    });
    return existing._id;
  },
});

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("campaignSessions")
      .order("desc")
      .take(args.limit ?? 100);
  },
});

export const getByClientSessionId = query({
  args: { clientSessionId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("campaignSessions")
      .withIndex("by_client_session_id", (q) =>
        q.eq("clientSessionId", args.clientSessionId),
      )
      .unique();
  },
});