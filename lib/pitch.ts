// "Make it even" economics + a consumer VALUE SCORE.
// Two scores, deliberately separate:
//   qualify()    → MERCHANT fit (is this worth acquiring?)
//   valueScore() → CONSUMER value (is the deal actually good enough to show users?)
// Onboarding requires BOTH — a desperate mediocre spot can pass merchant-fit but
// must fail value, so the consumer feed never fills with junk (the Groupon disease).

import { type Prospect } from "./merchants";
import { archetypeFor, type ArchetypeConfig, type Mechanic } from "./archetypes";

const round = (n: number) => Math.round(n * 100) / 100;
const r0 = (n: number) => Math.round(n);
const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

export interface Economics {
  mechanic: Mechanic;
  archetypeLabel: string;
  unitLabel: string;
  regularPrice: number;
  discountPct: number; // 0 for access (B)
  dealPrice: number;
  groupeeCommissionPct: number;
  grouponCommissionPct: number;
  groupeeKeepPerCustomer: number;
  grouponKeepPerCustomer: number;
  incrementalProfitPerCustomer: number;
  redemptionCapPerDay: number;
  offPeakDaysPerMonth: number;
  estMonthlyCovers: number;
  monthlyKeep: number;
  annualKeep: number;
  monthlyIncrementalProfit: number;
  groupUnit?: number;
  // Mechanic C — the value is the recurring relationship
  intro?: { introPrice: number; visitsPerYear: number; rebookRate: number; ltv: number };
  // Mechanic B — value-add instead of a discount
  access?: { comp: string; compCost: number; keepFull: number };
}

export function computeEconomics(p: Prospect): Economics {
  const arc = archetypeFor(p.category);
  const regularPrice = p.avgTicket;
  const variable = (price: number) => price * (1 - p.grossMarginPct / 100);

  const redemptionCapPerDay = Math.max(2, r0(p.dailyCapacity * arc.capRate));
  const offPeakDaysPerMonth = 12;
  const estMonthlyCovers = redemptionCapPerDay * offPeakDaysPerMonth;

  const base: Economics = {
    mechanic: arc.mechanic,
    archetypeLabel: arc.label,
    unitLabel: arc.unit,
    regularPrice,
    discountPct: arc.discountPct,
    dealPrice: regularPrice,
    groupeeCommissionPct: arc.commissionPct,
    grouponCommissionPct: 50,
    groupeeKeepPerCustomer: 0,
    grouponKeepPerCustomer: round(regularPrice * 0.5 * 0.5), // ~25% of regular
    incrementalProfitPerCustomer: 0,
    redemptionCapPerDay,
    offPeakDaysPerMonth,
    estMonthlyCovers,
    monthlyKeep: 0,
    annualKeep: 0,
    monthlyIncrementalProfit: 0,
    groupUnit: arc.groupUnit,
  };

  if (arc.mechanic === "B") {
    // Access / value-add: full price stays, a small comp is the lever.
    // 12% ≈ a perceived comp value (e.g. a bottle); merchant's real COGS is lower,
    // so this is conservative. Modeled estimate — validate per-vertical in a pilot.
    const compCost = round(regularPrice * 0.12);
    const keepFull = round(regularPrice * (1 - arc.commissionPct / 100) - compCost);
    base.dealPrice = regularPrice;
    base.discountPct = 0;
    base.groupeeKeepPerCustomer = keepFull;
    base.incrementalProfitPerCustomer = round(keepFull - variable(regularPrice));
    base.access = { comp: arc.accessComp ?? "value-add", compCost, keepFull };
  } else if (arc.mechanic === "C") {
    // Intro → regular: the deal is a loss-leader; LTV is the real number.
    const introPrice = round(regularPrice * (1 - arc.discountPct / 100));
    // Modeled estimate. 40% intro→repeat is at the optimistic end of published
    // boutique-fitness/beauty intro-offer benchmarks (~15–40%) — validate in pilot.
    const visitsPerYear = arc.key === "beauty" ? 9 : 14;
    const rebookRate = 0.4;
    const ltv = r0(regularPrice * visitsPerYear * rebookRate);
    base.dealPrice = introPrice;
    base.groupeeKeepPerCustomer = round(introPrice * (1 - arc.commissionPct / 100));
    base.incrementalProfitPerCustomer = round(base.groupeeKeepPerCustomer - variable(introPrice));
    base.intro = { introPrice, visitsPerYear, rebookRate, ltv };
  } else {
    // A — off-peak % discount fills empty capacity.
    const dealPrice = round(regularPrice * (1 - arc.discountPct / 100));
    base.dealPrice = dealPrice;
    base.groupeeKeepPerCustomer = round(dealPrice * (1 - arc.commissionPct / 100));
    base.incrementalProfitPerCustomer = round(base.groupeeKeepPerCustomer - variable(dealPrice));
  }

  base.monthlyKeep = r0(estMonthlyCovers * base.groupeeKeepPerCustomer);
  base.annualKeep = base.monthlyKeep * 12;
  base.monthlyIncrementalProfit = r0(estMonthlyCovers * base.incrementalProfitPerCustomer);
  return base;
}

// ── Merchant fit (acquisition target quality) ─────────────────────────────
export interface Qualification {
  score: number;
  factors: { label: string; score: number; note: string }[];
}

export function qualify(p: Prospect): Qualification {
  const offPeak = r0(Math.min(100, (100 - p.offPeakUtilizationPct) * 1.1));
  const velocity = r0(Math.min(100, p.reviewVelocity * 4));
  const margin = r0(Math.min(100, p.grossMarginPct + 15));
  const quality = r0(Math.min(100, (p.rating / 5) * 100));
  const factors = [
    { label: "Off-peak upside", score: offPeak, note: `${p.offPeakUtilizationPct}% full during ${p.offPeakWindow}` },
    { label: "Review velocity", score: velocity, note: `${p.reviewVelocity} new reviews/mo — live demand` },
    { label: "Margin headroom", score: margin, note: `${p.grossMarginPct}% gross margin can absorb a fair deal` },
    { label: "Quality bar", score: quality, note: `${p.rating}★ over ${p.reviewCount.toLocaleString()} reviews` },
  ];
  const score = r0(factors.reduce((s, f) => s + f.score, 0) / factors.length);
  return { score, factors };
}

// ── Consumer value (is this deal good enough to put in front of users?) ───
export type Verdict = "Ship to feed" | "Tune the offer" | "Hold";

export interface ValueScore {
  score: number;
  grade: string; // A / B / C / D
  verdict: Verdict;
  factors: { label: string; score: number; note: string }[];
  lever: string; // the single best fix when not Ship-grade
}

function qualityScore(p: Prospect): number {
  let q = clamp(((p.rating - 3.4) / 1.5) * 100);
  if (p.reviewCount < 100) q *= 0.9; // thin evidence
  return r0(q);
}

function savingsScore(e: Economics): number {
  if (e.mechanic === "C") return r0(clamp(65 + e.discountPct * 0.4, 0, 92)); // intro depth is expected, not penalized
  if (e.mechanic === "B") {
    const compPct = e.access ? (e.access.compCost / e.regularPrice) * 100 : 12;
    return r0(clamp(60 + compPct * 1.2)); // value = access + comp, not a price cut
  }
  // A — real % off, with a credible sweet spot (deep = "smells desperate")
  const pct = e.discountPct;
  if (pct < 15) return r0((pct / 15) * 55);
  if (pct <= 40) return r0(clamp(80 + (1 - Math.abs(pct - 30) / 15) * 20));
  return r0(clamp(95 - (pct - 40) * 2.5, 35, 100));
}

export function valueScore(p: Prospect, e: Economics): ValueScore {
  const quality = qualityScore(p);
  const savings = savingsScore(e);
  const availability = r0(clamp((e.redemptionCapPerDay / 24) * 100, 25, 100));
  const desirability = r0(
    clamp(p.reviewVelocity * 3.5 + (e.groupUnit ? 10 : 0) + (p.rating >= 4.6 ? 8 : 0))
  );

  const factors = [
    { label: "Quality", score: quality, note: `${p.rating}★ · ${p.reviewCount.toLocaleString()} reviews` },
    {
      label: "Honest savings",
      score: savings,
      note:
        e.mechanic === "B"
          ? "value via access/comp (no brand-cheapening discount)"
          : e.mechanic === "C"
            ? `intro ${e.discountPct}% off → wins the rebook`
            : `${e.discountPct}% off — credible, not a fire-sale`,
    },
    { label: "Availability", score: availability, note: `${e.redemptionCapPerDay} ${e.unitLabel}s/day for users` },
    { label: "Desirability", score: desirability, note: `${p.reviewVelocity} reviews/mo${e.groupUnit ? " · group-shaped" : ""}` },
  ];

  const score = r0(quality * 0.38 + savings * 0.27 + availability * 0.15 + desirability * 0.2);
  const grade = score >= 85 ? "A" : score >= 72 ? "B" : score >= 55 ? "C" : "D";
  const verdict: Verdict = score >= 72 ? "Ship to feed" : score >= 55 ? "Tune the offer" : "Hold";

  // the single highest-leverage fix when it isn't Ship-grade
  const weakest = [...factors].sort((a, b) => a.score - b.score)[0];
  const leverMap: Record<string, string> = {
    Quality: "Quality is below the Groupee bar — likely a pass, not a tune. Don't crowd the feed.",
    "Honest savings": e.mechanic === "A" ? "Nudge the discount toward ~30% (or pass if margins can't bear it)." : "Sweeten the intro/value-add to make trial a no-brainer.",
    Availability: "Raise the daily cap or widen the off-peak window so users can actually book it.",
    Desirability: "Lower demand signal — lead with the group/sampler angle, or hold for now.",
  };
  const lever = verdict === "Ship to feed" ? "Good consumer value — clear to ship." : leverMap[weakest.label];

  return { score, grade, verdict, factors, lever };
}

// ── The pitch (template fallback; Claude version in app/api/merchant-pitch) ─
export interface PitchResult {
  summary: string;
  emailSubject: string;
  emailBody: string;
  talkingPoints: string[];
  offerLine: string;
  source: "claude" | "template";
}

function offerFor(p: Prospect, e: Economics, arc: ArchetypeConfig): string {
  if (e.mechanic === "B")
    return `Slow-night access for groups — ${arc.accessComp} during ${p.offPeakWindow}. No public discount; your door stays exclusive.`;
  if (e.mechanic === "C")
    return `An intro ${e.unitLabel} at ${e.discountPct}% off during ${p.offPeakWindow}; you keep the client's contact and we help turn them into a regular.`;
  if (arc.key === "golf")
    return `A twilight foursome rate during ${p.offPeakWindow} — the group of four is built in.`;
  return `Bring three friends, first round on the house — ${p.name} comps the first ${e.unitLabel} for groups of 3+ first-time guests during ${p.offPeakWindow}.`;
}

export function templatePitch(p: Prospect, e: Economics): PitchResult {
  const arc = archetypeFor(p.category);
  const signal = p.signals[0];
  const offerLine = offerFor(p, e, arc);
  const first = p.contact.owner.split(" ")[0];

  let economicsBullets: string;
  if (e.mechanic === "B") {
    economicsBullets = `• No public discount — we protect your door with access, not price cuts.
• ${arc.accessComp}; you keep ~$${e.access?.keepFull}/table after our ${e.groupeeCommissionPct}% (Groupon would force a brand-cheapening public deal).
• Fills Sun–Wed tables that would otherwise sit empty — pure incremental.
• You keep every guest's contact for re-marketing.`;
  } else if (e.mechanic === "C") {
    economicsBullets = `• Intro ${e.unitLabel} at ${e.discountPct}% off — the goal is the standing client, not the one-off.
• Groupee takes ${e.groupeeCommissionPct}% (Groupon ~${e.grouponCommissionPct}%). With a typical rebook that's ~$${e.intro?.ltv.toLocaleString()} lifetime value per client.
• Capped at ${e.redemptionCapPerDay}/day, ${p.offPeakWindow} only — fills dead chairs, never your peak.
• You keep the client's contact — unlike a Groupon coupon-hunter, they come back.`;
  } else {
    economicsBullets = `• ${e.discountPct}% off, capped at ${e.redemptionCapPerDay} redemptions/day so it never crowds your full-price peak.
• Groupee takes ${e.groupeeCommissionPct}% (Groupon ~${e.grouponCommissionPct}%). You keep ~$${e.groupeeKeepPerCustomer} per guest vs ~$${e.grouponKeepPerCustomer} on Groupon.
• On seats that would otherwise sit empty, ~$${e.monthlyIncrementalProfit.toLocaleString()}/mo in incremental profit.
• You keep every guest's contact info — repeat regulars, not one-and-done coupon hunters.`;
  }

  const summary = `${p.name} (${p.rating}★, ${p.neighborhood}) has a clear ${p.offPeakWindow} gap (~${p.offPeakUtilizationPct}% full). Archetype: ${arc.label} (${arc.mechanicName}). ${arc.offerStyle}`;

  const emailSubject =
    e.mechanic === "B"
      ? `Filling Sun–Wed at ${p.name} — without cheapening the door`
      : `Filling your ${p.offPeakWindow} at ${p.name} — fairly`;

  const emailBody = `Hi ${first},

I run partnerships at Groupee, and we've been tracking ${p.name}. ${signal}. We'd help you fill that ${p.offPeakWindow} window — without the Groupon math that leaves you upside down.

Here's what we'd ship in 72 hours, in the open:
${economicsBullets}

We'd run: ${offerLine}

If that sounds fair, reply "yes" and we'll ship it this week. Open to a 10-minute call?

— The Groupee partnerships team
(Reply STOP to opt out — we'll never email again.)`;

  const talkingPoints = [
    `Hi, is this ${p.contact.owner}? This is the partnerships team at Groupee — do you have thirty seconds?`,
    `We noticed ${signal.toLowerCase()}, and that your ${p.offPeakWindow} runs around ${p.offPeakUtilizationPct} percent full.`,
    e.mechanic === "B"
      ? `We'd never put you in a public discount — we'd offer slow-night access instead: ${arc.accessComp}.`
      : e.mechanic === "C"
        ? `We'd run an intro ${e.unitLabel} at ${e.discountPct} percent off — but the real win is the rebook, and you keep the client's contact.`
        : `We'd fill those empty seats with a ${e.discountPct}% deal capped at ${e.redemptionCapPerDay} a day, so it never touches your busy nights.`,
    e.mechanic === "C"
      ? `With a normal rebook rate that's around ${e.intro?.ltv} dollars of lifetime value per new client — not a one-time coupon.`
      : `The part that matters: it's incremental revenue on seats that were going to sit empty, and you keep every customer's contact info.`,
    `We'd also run "${offerLine}" If it sounds fair, we can ship it in seventy-two hours.`,
  ];

  return { summary, emailSubject, emailBody, talkingPoints, offerLine, source: "template" };
}
