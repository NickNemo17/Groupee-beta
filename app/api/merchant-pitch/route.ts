import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { getProspect } from "@/lib/merchants";
import { computeEconomics, templatePitch, type PitchResult } from "@/lib/pitch";

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

Write like the example from our thesis: cite the merchant's REAL specifics (their slow window, what their reviews praise, their category) and propose a concrete bundle. Be warm, concrete, and respectful of the owner's time. Never overstate. Use ONLY the economics numbers provided — do not invent figures.

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
  const { id } = await req.json().catch(() => ({}));
  const prospect = getProspect(id);
  if (!prospect) return NextResponse.json({ error: "unknown prospect" }, { status: 404 });

  const econ = computeEconomics(prospect);

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(templatePitch(prospect, econ));
  }

  try {
    const client = new Anthropic();
    const userContext = `Merchant: ${prospect.name} — ${prospect.category} in ${prospect.neighborhood}, ${prospect.rating}★ (${prospect.reviewCount} reviews).
Owner: ${prospect.contact.owner}.
Slow window: ${prospect.offPeakWindow} (~${prospect.offPeakUtilizationPct}% full).
Signals (use these — they are the personalization):
${prospect.signals.map((s) => `- ${s}`).join("\n")}

Economics to cite VERBATIM (already computed — do not change):
- Regular price ~$${econ.regularPrice}; Groupee deal price $${econ.dealPrice} (${econ.discountPct}% off).
- Groupee commission ${econ.groupeeCommissionPct}% vs Groupon ~${econ.grouponCommissionPct}%.
- Merchant keeps ~$${econ.groupeeKeepPerCustomer}/guest on Groupee vs ~$${econ.grouponKeepPerCustomer}/guest on Groupon.
- Redemption cap ${econ.redemptionCapPerDay}/day; ~${econ.estMonthlyCovers} incremental covers/mo.
- ~$${econ.monthlyIncrementalProfit.toLocaleString()}/mo incremental profit on otherwise-empty seats.`;

    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 1500,
      output_config: { effort: "low", format: { type: "json_schema", schema: SCHEMA } },
      system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: userContext }],
    });

    const text = message.content.find((b) => b.type === "text");
    if (!text || text.type !== "text") throw new Error("no text block");
    const parsed = JSON.parse(text.text) as Omit<PitchResult, "source">;
    return NextResponse.json({ ...parsed, source: "claude" } satisfies PitchResult);
  } catch {
    return NextResponse.json(templatePitch(prospect, econ));
  }
}
