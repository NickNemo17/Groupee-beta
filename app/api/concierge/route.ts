import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { EXPERIENCES } from "@/lib/data";
import { getConciergeReply, dayPart, type DayPart } from "@/lib/concierge";
import { cappedString } from "@/lib/validate";
import { rateLimit } from "@/lib/ratelimit";

// Latest Claude model. Swap to "claude-sonnet-4-6" or "claude-haiku-4-5" if you
// want a snappier/cheaper concierge — opus is the most capable default.
const MODEL = "claude-opus-4-7";

export interface ConciergePick {
  id: string;
  reason: string;
}
export interface ConciergeApiResult {
  intro: string;
  picks: ConciergePick[];
  source: "claude" | "local";
}

// Stable catalog string — lives in the cached system prefix (never changes
// between requests, so prompt caching can reuse it). Keep the query/time in the
// user message, after the cache breakpoint.
const CATALOG = EXPERIENCES.map(
  (e) =>
    `- ${e.id} | ${e.title} | ${e.category} | $${e.price} all-in | ★${e.rating} | ${e.neighborhood} | best:${e.bestTime} | ${e.indoor ? "indoor" : "outdoor"} | ${e.goodForGroups ? "groups-ok" : "intimate"} | tags:${e.tags.join(",")} | ${e.blurb}`
).join("\n");

const SYSTEM = `You are Groupee's local concierge for Santa Barbara, CA. You recommend genuinely good local experiences — never bargain-bin coupons.

Pick the THREE best experiences for the user's request from the catalog below. Consider their intent, budget, group size, the time of day, and weather cues. Favor higher-rated and local-favorite spots, and respect any budget ceiling.

Return exactly 3 picks. Each "reason" is ONE short, specific phrase (max ~6 words) on why it fits — e.g. "great for a rainy date", "under $40 and lively". The "intro" is one friendly sentence framing the set. Only use ids that appear in the catalog.

CATALOG:
${CATALOG}`;

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    intro: { type: "string" },
    picks: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string" },
          reason: { type: "string" },
        },
        required: ["id", "reason"],
      },
    },
  },
  required: ["intro", "picks"],
} as const;

// Map the local engine's Experience result into the API's id+reason shape.
function localResult(query: string, when: DayPart): ConciergeApiResult {
  const r = getConciergeReply(query, when);
  return {
    intro: r.intro,
    picks: r.experiences.map(({ exp, reason }) => ({ id: exp.id, reason })),
    source: "local",
  };
}

export async function POST(req: Request) {
  if (!rateLimit(req, "concierge")) {
    return NextResponse.json({ error: "rate limited" }, { status: 429 });
  }
  const body = await req.json().catch(() => ({}));
  const query = cappedString(body.query, 500) ?? "";
  const tod: DayPart = body.when ?? dayPart();

  // No key → deterministic local engine (app still works out of the box).
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(localResult(query, tod));
  }

  try {
    const client = new Anthropic();
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      output_config: {
        effort: "low", // ranking task — keep it fast
        format: { type: "json_schema", schema: SCHEMA },
      },
      system: [
        {
          type: "text",
          text: SYSTEM,
          cache_control: { type: "ephemeral" }, // cache the stable catalog
        },
      ],
      messages: [
        {
          role: "user",
          content: `Time of day: ${tod}. Request: ${query || "Surprise me with something good right now."}`,
        },
      ],
    });

    const text = message.content.find((b) => b.type === "text");
    if (!text || text.type !== "text") throw new Error("no text block");
    const parsed = JSON.parse(text.text) as { intro?: unknown; picks?: unknown };

    // Runtime schema guard — never trust the model's shape.
    if (typeof parsed.intro !== "string" || !Array.isArray(parsed.picks)) {
      return NextResponse.json(localResult(query, tod));
    }
    // Guard against hallucinated ids.
    const valid = (parsed.picks as ConciergePick[])
      .filter((p) => p && typeof p.id === "string" && typeof p.reason === "string")
      .filter((p) => EXPERIENCES.some((e) => e.id === p.id))
      .slice(0, 3);
    if (valid.length === 0) return NextResponse.json(localResult(query, tod));

    return NextResponse.json({ intro: parsed.intro, picks: valid, source: "claude" });
  } catch {
    // Any API/parse failure → graceful local fallback.
    return NextResponse.json(localResult(query, tod));
  }
}
