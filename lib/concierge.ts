// Scripted concierge: parses intent + context (time/weather) over the mock dataset.
// Isolated behind getConciergeReply() so it can be swapped for a real Anthropic call later
// without touching any UI.

import { EXPERIENCES, type Experience } from "./data";

export type DayPart = "morning" | "afternoon" | "evening";

export function dayPart(d = new Date()): DayPart {
  const h = d.getHours();
  if (h < 11) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

export interface ConciergeResult {
  intro: string;
  experiences: { exp: Experience; reason: string }[];
}

interface Signal {
  keywords: string[];
  tag: string;
  reason: string;
}

const SIGNALS: Signal[] = [
  { keywords: ["date", "romantic", "partner", "anniversary"], tag: "date", reason: "great for a date" },
  { keywords: ["group", "friends", "team", "party", "birthday", "bach"], tag: "group", reason: "built for groups" },
  { keywords: ["cheap", "budget", "affordable", "under"], tag: "cheap", reason: "easy on the wallet" },
  { keywords: ["rain", "rainy", "indoor", "inside"], tag: "rainy", reason: "stays dry indoors" },
  { keywords: ["kid", "family", "child"], tag: "family", reason: "kid-friendly" },
  { keywords: ["food", "eat", "dinner", "lunch", "foodie", "hungry"], tag: "foodie", reason: "for the food lovers" },
  { keywords: ["wine", "drink", "cocktail", "bar", "beer"], tag: "wine", reason: "drinks done right" },
  { keywords: ["active", "adventure", "outdoor", "hike", "surf", "kayak"], tag: "adventure", reason: "gets you moving" },
  { keywords: ["calm", "relax", "quiet", "wellness", "spa", "yoga", "unwind"], tag: "calm", reason: "to slow down" },
  { keywords: ["creative", "make", "class", "learn", "craft"], tag: "creative", reason: "hands-on and creative" },
  { keywords: ["night", "nightlife", "late", "music", "jazz"], tag: "nightlife", reason: "for the night out" },
];

function extractBudget(q: string): number | null {
  const m = q.match(/(?:under|below|less than|max|<)\s*\$?\s*(\d{1,4})/i) || q.match(/\$\s*(\d{1,4})/);
  return m ? parseInt(m[1], 10) : null;
}

export function getConciergeReply(query: string, when: DayPart = dayPart()): ConciergeResult {
  const q = query.toLowerCase();
  const hits = SIGNALS.filter((s) => s.keywords.some((k) => q.includes(k)));
  const budget = extractBudget(q);

  const scored = EXPERIENCES.map((exp) => {
    let score = (exp.rating - 4.7) * 4; // quality baseline
    const reasons: string[] = [];

    for (const s of hits) {
      if (exp.tags.includes(s.tag) || exp.category.toLowerCase().includes(s.tag)) {
        score += 3;
        reasons.push(s.reason);
      }
    }
    // time-of-day fit
    if (exp.bestTime === when) {
      score += 1.5;
    }
    // rainy → indoor
    if (hits.some((h) => h.tag === "rainy") && exp.indoor) score += 2;
    // budget filter
    if (budget != null) {
      if (exp.price <= budget) {
        score += 2;
        reasons.push(`under $${budget}`);
      } else {
        score -= 5;
      }
    }
    // group
    if (hits.some((h) => h.tag === "group") && exp.goodForGroups) score += 1.5;

    const reason =
      reasons[0] ??
      (exp.localFavorite ? "a local favorite" : `${when}-friendly pick`);
    return { exp, score, reason: reason.charAt(0).toUpperCase() + reason.slice(1) };
  });

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, 3);

  let intro: string;
  if (hits.length === 0 && budget == null) {
    intro = `Here are a few standout ${when} picks near you right now.`;
  } else {
    const bits = hits.map((h) => h.tag);
    const label = bits.length ? bits.join(" + ") : "what you asked for";
    intro = `Got it — ${label}${budget ? ` under $${budget}` : ""}. My top three for this ${when}:`;
  }

  return { intro, experiences: top.map((t) => ({ exp: t.exp, reason: t.reason })) };
}

// Context-aware proactive opener shown when the concierge first loads.
export function proactiveOpener(when: DayPart = dayPart(), rainy = false): ConciergeResult {
  if (rainy) {
    const res = getConciergeReply("rainy indoor cozy", when);
    return { ...res, intro: "Looks like rain today ☔ — here are great indoor picks so plans don't wash out:" };
  }
  const seed =
    when === "morning"
      ? "morning coffee outdoors"
      : when === "afternoon"
        ? "afternoon wine outdoors"
        : "evening date dinner";
  const res = getConciergeReply(seed, when);
  const greet =
    when === "morning" ? "Morning! ☀️" : when === "afternoon" ? "Good afternoon!" : "Evening!";
  return { ...res, intro: `${greet} Want a hand planning your ${when}? A few ideas to start:` };
}

export const SUGGESTED_PROMPTS = [
  "Something fun tonight under $50",
  "Rainy-day date idea",
  "Group dinner for 6",
  "Relaxing morning, solo",
  "Outdoor adventure this weekend",
];
