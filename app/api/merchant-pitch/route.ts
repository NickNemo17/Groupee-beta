import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { getProspect } from "@/lib/merchants";
import { computeEconomics, templatePitch, type PitchResult } from "@/lib/pitch";
import { archetypeFor } from "@/lib/archetypes";
import { rateLimit } from "@/lib/ratelimit";

const MODEL = "claude-opus-4-7";

// Stable system prompt (cached): Groupee's merchant value-prop + fairness rules
// + the JSON contract. The volatile, per-merchant data goes in the user turn.
const SYSTEM = `You are the supply-side partnerships agent for Groupee — a local-experiences marketplace built as the anti-Groupon. You write substantively personalized outreach to local business owners.

Groupee's promise to merchants ("make it even"):
- A fair, low platform commission (~10%) instead of Groupon's ~50% cut on an already-50%-off deal.
- A HARD redemption cap per day so the deal FILLS empty off-peak inventory and never cannibalizes full-price peak demand.
- The merchant keeps every customer's contact info, so deal-users become repeat regulars — not one-and-done coupon hunters.
- Honest, specific unit economics shown up front. No fake "value" anchors. No race to the bottom.
- A group-sampler mechanic ("bring three friends, first round on the house") to drive trial.

The offer MECHANIC must match the inventory (it's given to you per merchant):
- Mechanic A (off-peak % fill — restaurants, bars, social-entertainment, golf, tours): a capped % discount in the slow window. For golf/social, sell the group UNIT (foursome, lane).
- Mechanic B (access, NOT a discount — nightlife tables, hotels): NEVER propose a public % off — it cheapens the venue. Offer access/value-add (lowered minimum, comped bottle, day-pass + F&B credit) on slow nights.
- Mechanic C (intro → regular — beauty, fitness, recovery): a generous intro on the first visit; the win is the rebook, so emphasize the merchant keeps the customer's contact and the lifetime value, not the one-off.

Write like the example from our thesis: cite the merchant's REAL specifics (their slow window, what their reviews praise, their category) and propose a concrete bundle that fits the mechanic. Be warm, concrete, and respectful of the owner's time. Never overstate. Use ONLY the economics numbers provided — do not invent figures.

Return JSON: a one-paragraph "summary" (the agent's internal rationale), an "emailSubject", an "emailBody" (personalized, includes the fair economics and a one-line opt-out), 5 short "talkingPoints" (what the agent would SAY on a call — conversational, first person, ~1 sentence each), and an "offerLine" (the group-sampler offer phrased for this merchant).`;

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    summary: { type: "string" },
    emailSubject: { type: "string" },
    emailBody: { type: "string" },
    talkingPoints: { type: "array", items: { type: "string" } },
    offerLine: { type: "string" },
  },
  required: ["summary", "emailSubject", "emailBody", "talkingPoints", "offerLine"],
} as const;

export async function POST(req: Request) {
  if (!rateLimit(req, "merchant-pitch")) {
    return NextResponse.json({ error: "rate limited" }, { status: 429 });
  }
  const { id } = await req.json().catch(() => ({}));
  // `id` must resolve to a known prospect — no arbitrary input reaches the model.
  const prospect = typeof id === "string" ? getProspect(id) : undefined;
  if (!prospect) return NextResponse.json({ error: "unknown prospect" }, { status: 404 });

  const econ = computeEconomics(prospect);

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(templatePitch(prospect, econ));
  }

  try {
    const client = new Anthropic();
    const arc = archetypeFor(prospect.category);

    let econLines: string;
    if (econ.mechanic === "B") {
      econLines = `MECHANIC B — ACCESS, NOT A DISCOUNT. Do NOT propose a public % off.
- Value-add: ${econ.access?.comp}.
- Merchant keeps ~$${econ.access?.keepFull}/${econ.unitLabel} after Groupee's ${econ.groupeeCommissionPct}% (a small ~$${econ.access?.compCost} comp); full price preserved.
- Fills ${prospect.offPeakWindow} ${econ.unitLabel}s that would sit empty — ~$${econ.monthlyIncrementalProfit.toLocaleString()}/mo incremental.`;
    } else if (econ.mechanic === "C") {
      econLines = `MECHANIC C — INTRO → REGULAR. The deal is a loss-leader; the LTV is the point.
- Intro ${econ.unitLabel} $${econ.intro?.introPrice} (${econ.discountPct}% off regular $${econ.regularPrice}).
- Groupee commission ${econ.groupeeCommissionPct}% (Groupon ~${econ.grouponCommissionPct}%).
- With a normal rebook rate, ~$${econ.intro?.ltv.toLocaleString()} lifetime value per new client. Merchant KEEPS the client's contact.
- Capped ${econ.redemptionCapPerDay}/day, ${prospect.offPeakWindow} only.`;
    } else {
      econLines = `MECHANIC A — OFF-PEAK % FILL${arc.groupUnit ? ` (sell the ${econ.unitLabel} — a group of ${arc.groupUnit})` : ""}.
- Regular ~$${econ.regularPrice}; deal $${econ.dealPrice} (${econ.discountPct}% off).
- Groupee commission ${econ.groupeeCommissionPct}% vs Groupon ~${econ.grouponCommissionPct}%.
- Keeps ~$${econ.groupeeKeepPerCustomer}/${econ.unitLabel} vs ~$${econ.grouponKeepPerCustomer} on Groupon.
- Cap ${econ.redemptionCapPerDay}/day; ~$${econ.monthlyIncrementalProfit.toLocaleString()}/mo incremental profit on empty seats.`;
    }

    const userContext = `Merchant: ${prospect.name} — ${prospect.category} in ${prospect.neighborhood}, ${prospect.rating}★ (${prospect.reviewCount} reviews).
Owner: ${prospect.contact.owner}.
Archetype: ${arc.label} — ${arc.mechanicName}. ${arc.offerStyle}
Slow window: ${prospect.offPeakWindow} (~${prospect.offPeakUtilizationPct}% full).
Signals (use these — they are the personalization):
${prospect.signals.map((s) => `- ${s}`).join("\n")}

Economics to cite VERBATIM (already computed — do not change):
${econLines}`;

    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 1500,
      output_config: { effort: "low", format: { type: "json_schema", schema: SCHEMA } },
      system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: userContext }],
    });

    const text = message.content.find((b) => b.type === "text");
    if (!text || text.type !== "text") throw new Error("no text block");
    const parsed = JSON.parse(text.text) as Partial<Omit<PitchResult, "source">>;

    // Runtime schema guard — fall back to the template on any shape mismatch.
    if (
      typeof parsed.summary !== "string" ||
      typeof parsed.emailSubject !== "string" ||
      typeof parsed.emailBody !== "string" ||
      typeof parsed.offerLine !== "string" ||
      !Array.isArray(parsed.talkingPoints)
    ) {
      return NextResponse.json(templatePitch(prospect, econ));
    }
    return NextResponse.json({
      summary: parsed.summary,
      emailSubject: parsed.emailSubject,
      emailBody: parsed.emailBody,
      talkingPoints: parsed.talkingPoints.map(String),
      offerLine: parsed.offerLine,
      source: "claude",
    } satisfies PitchResult);
  } catch {
    return NextResponse.json(templatePitch(prospect, econ));
  }
}
