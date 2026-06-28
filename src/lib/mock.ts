// Mock data used until the real OpenAI / Fiber / Orange Slice integrations are wired.
// Each API route falls back to these so the whole demo is clickable end-to-end today.

import type { LeadsResult, Premise, PreviewResult } from "./types";

export function mockPremise(url: string): Premise {
  let host = "your-product";
  try {
    host = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    /* ignore — keep default */
  }
  const name = host.split(".")[0];
  const productName = name.charAt(0).toUpperCase() + name.slice(1);

  return {
    productName,
    keyFeature:
      "An AI workspace that turns scattered team docs into one searchable source of truth.",
    icp: [
      "Knowledge workers at 50–500 person B2B SaaS companies",
      "Operations, product, and engineering managers who own internal documentation",
      "Teams already using Notion, Confluence, or Google Docs and feeling the sprawl",
      "Companies in a growth phase, hiring 5+ people per month",
      "Decision-makers with a $10k–$50k annual tooling budget",
      "Located in major tech hubs: SF Bay Area, NYC, Austin, London, Berlin",
      "English-speaking, async-first or hybrid work culture",
      "Early adopters who try new productivity tools quarterly",
      "Pain point: onboarding new hires takes too long because info is scattered",
      "Pain point: institutional knowledge lost when employees leave",
      "Buying trigger: recent funding round or rapid headcount growth",
      "Champions: Heads of Ops, Chiefs of Staff, Eng leads",
    ],
  };
}

export const mockLeads: LeadsResult = {
  geo: {
    city: "San Francisco, CA",
    cluster: "SoMa / 2nd Street tech corridor",
    why: "Highest density of 50–500 person B2B SaaS HQs in the country, with thousands of matching operations and engineering managers working on-site within a four-block radius.",
    address: "2nd St & Howard St, San Francisco, CA 94105",
  },
  leads: [
    { name: "Priya Nair", title: "Head of Operations", company: "Vantage Labs", location: "San Francisco, CA" },
    { name: "Marcus Webb", title: "Chief of Staff", company: "Northwind", location: "San Francisco, CA" },
    { name: "Elena Rossi", title: "Engineering Manager", company: "Cobalt", location: "San Francisco, CA" },
    { name: "David Kim", title: "VP Product", company: "Tessellate", location: "Oakland, CA" },
    { name: "Sara Okafor", title: "People Ops Lead", company: "Brightloop", location: "San Francisco, CA" },
  ],
  timing: {
    when: "Weekdays, 17:50 local — 10 minutes before clock-out",
    where: "Drone formation above 2nd & Howard, facing the west-side office tower windows",
    why: "At end of day, target leads are at their desks looking toward the windows. A QR code held in the skyline catches them in a low-attention, high-curiosity moment with a clear line of sight from 8+ floors.",
  },
};

export const mockPreview: PreviewResult = {
  status: "ready",
  assetUrl: null, // partner will drop in the real 3D asset here
  caption:
    "Drone swarm rendering a scannable QR code above 2nd & Howard, San Francisco — 17:50.",
};
