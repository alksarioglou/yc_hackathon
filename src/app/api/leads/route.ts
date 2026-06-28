import { NextResponse } from "next/server";
import { generateJson } from "@/lib/openai";
import { searchCompanies, FIBER_INDUSTRIES } from "@/lib/fiber";
import { findDecisionMakers } from "@/lib/orangeslice";
import { mockLeads } from "@/lib/mock";
import type { Lead, LeadsResult, Premise } from "@/lib/types";

export const maxDuration = 60;

interface SearchPlan {
  industries: string[];
  titles: string[];
  keyword: string;
  keywords: string[];
  candidateCity: string;
  employeeMin: number;
  employeeMax: number;
}

const PLAN_SYSTEM = `You turn an ICP into B2B search parameters for a company database.
Return ONLY JSON: {
  "industries": string[],   // 1-3 labels chosen ONLY from the allowed list below
  "titles": string[],       // 2-4 decision-maker job titles to target
  "keyword": string,        // one short keyword describing the buyer's space
  "keywords": string[],     // 2-4 keywords describing what these companies do
  "candidateCity": string,  // the single city where these leads most likely concentrate
  "employeeMin": number,    // lower bound of target company headcount (e.g. 50)
  "employeeMax": number     // upper bound of target company headcount (e.g. 500)
}
Allowed industries (use EXACT strings, pick the closest matches): ${FIBER_INDUSTRIES.join(", ")}`;

const SYNTH_SYSTEM = `You are a guerrilla out-of-home ad strategist for a drone advertising company.
Given a product, its ICP, real companies (with HQ locations) and real leads (with locations),
decide where the leads physically cluster and the single best time + place to fly a drone
swarm that paints a QR code in the sky for them.
Return ONLY JSON with this exact shape:
{
  "geo": { "city": string, "cluster": string, "why": string, "address": string },
  "leads": [ { "name": string, "title": string, "company": string, "location": string } ],  // exactly 5; use the REAL company names provided and realistic full names (never placeholders like "John Doe")
  "timing": { "when": string, "where": string, "why": string }
}
Ground "city" in the real locations provided (pick the densest). The cluster must be a
specific named district/venue. "address" must be a precise, geocodable street address or
intersection including city and state (e.g. "2nd St & Howard St, San Francisco, CA 94105" or
"1600 Amphitheatre Pkwy, Mountain View, CA 94043") — never just a city name.
Timing must be vivid and specific (exact local time + physical vantage point) and the
"why" must tie to the ICP's daily rhythm.`;

// POST /api/leads  { premise } -> LeadsResult
export async function POST(req: Request) {
  const { premise } = (await req.json().catch(() => ({}))) as {
    premise?: Premise;
  };

  if (!premise?.icp) {
    return NextResponse.json(mockLeads);
  }

  try {
    const icpText = `Product: ${premise.productName}
Key feature: ${premise.keyFeature}
ICP:
- ${premise.icp.join("\n- ")}`;

    // 1) ICP -> structured search plan
    const plan = await generateJson<SearchPlan>(PLAN_SYSTEM, icpText);
    const industries = plan.industries?.length ? plan.industries : ["Software"];

    // 2) Real companies from Fiber
    const companies = await searchCompanies({
      industries,
      employeeMin: plan.employeeMin,
      employeeMax: plan.employeeMax,
      keywords: plan.keywords,
      pageSize: 25,
    });

    if (companies.length === 0) {
      return NextResponse.json(mockLeads);
    }

    // 3) Real decision-makers at the top companies via Orange Slice
    const osLeads = await findDecisionMakers(
      companies.map((c) => ({ name: c.name, linkedinUrl: c.linkedinUrl })),
      4,
    );

    // Real location frequency (companies + leads) to ground the cluster city
    const freq: Record<string, number> = {};
    for (const c of companies) {
      if (c.location) freq[c.location] = (freq[c.location] ?? 0) + 1;
    }
    for (const l of osLeads) {
      if (l.location) freq[l.location] = (freq[l.location] ?? 0) + 1;
    }
    const topLocations = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([loc, n]) => `${loc} (${n})`);

    // 4) Synthesize geo + timing (and fallback leads) from real data
    const result = await generateJson<LeadsResult>(
      SYNTH_SYSTEM,
      `${icpText}

Real companies matching the ICP (name — location — industry):
${companies.slice(0, 18).map((c) => `- ${c.name} — ${c.location || "n/a"} — ${c.industry || "n/a"}`).join("\n")}

Location frequency (densest first):
${topLocations.join("\n") || "n/a"}

${
  osLeads.length
    ? `Real LinkedIn leads found at these companies (name — title — company — location):\n${osLeads
        .map((p) => `- ${p.name} — ${p.title} — ${p.company} — ${p.location}`)
        .join("\n")}`
    : "No individual LinkedIn leads available (build leads from the real company names)."
}`,
    );

    if (!result?.geo?.city) {
      return NextResponse.json(mockLeads);
    }

    if (!result.geo.address?.trim()) {
      const where = (result.timing?.where ?? result.geo.cluster)
        .replace(/^drone formation above\s+/i, "")
        .replace(/^above\s+/i, "")
        .replace(/,?\s*facing\b.*$/i, "")
        .trim();
      result.geo.address = [where, result.geo.city].filter(Boolean).join(", ");
    }

    // Prefer REAL Orange Slice leads (keeps real LinkedIn URLs); fall back to synth.
    const realLeads: Lead[] = osLeads.slice(0, 5).map((l) => ({
      name: l.name,
      title: l.title,
      company: l.company,
      location: l.location,
      linkedinUrl: l.linkedinUrl,
    }));
    result.leads = realLeads.length >= 3 ? realLeads : (result.leads ?? []);

    return NextResponse.json(result);
  } catch (err) {
    console.error("[leads] falling back to mock:", err);
    return NextResponse.json(mockLeads);
  }
}
