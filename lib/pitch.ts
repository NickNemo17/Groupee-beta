// "Make it even" — the reasoned, merchant-fair economics + pitch.
// Math is deterministic (done here, in code) so the numbers are always right;
// Claude only writes the prose around them (see app/api/merchant-pitch).

import { type Prospect } from "./merchants";

export interface Economics {
  regularPrice: number;
  discountPct: number;
  dealPrice: number;
  groupeeCommissionPct: number;
  grouponCommissionPct: number;
  // revenue the merchant keeps per redeemed customer
  groupeeKeepPerCustomer: number;
  grouponKeepPerCustomer: number;
  // honest incremental profit on an otherwise-empty off-peak seat
  incrementalProfitPerCustomer: number;
  redemptionCapPerDay: number;
  offPeakDaysPerMonth: number;
  estMonthlyCovers: number;
  monthlyKeep: number;
  annualKeep: number;
  monthlyIncrementalProfit: number;
}

const round = (n: number) => Math.round(n * 100) / 100;
const r0 = (n: number) => Math.round(n);

export function computeEconomics(p: Prospect): Economics {
  const regularPrice = p.avgTicket;
  const discountPct = 30; // the letter's example
  const dealPrice = round(regularPrice * (1 - discountPct / 100));

  const groupeeCommissionPct = 10; // fair
  const grouponCommissionPct = 50; // Groupon's cut of the already-discounted price

  // Groupee: 30% off, platform takes 10% of the deal price.
  const groupeeKeepPerCustomer = round(dealPrice * (1 - groupeeCommissionPct / 100));
  // Groupon: ~50% off, then platform takes ~50% of that → merchant nets ~25% of regular.
  const grouponDeal = regularPrice * 0.5;
  const grouponKeepPerCustomer = round(grouponDeal * (1 - grouponCommissionPct / 100));

  // Variable cost of serving one customer (1 − gross margin) on the deal price.
  const variableCost = dealPrice * (1 - p.grossMarginPct / 100);
  const incrementalProfitPerCustomer = round(groupeeKeepPerCustomer - variableCost);

  // Hard cap so the deal FILLS off-peak instead of cannibalizing peak demand.
  const redemptionCapPerDay = Math.max(2, r0(p.dailyCapacity * 0.15));
  const offPeakDaysPerMonth = 12; // ~3 slow days/week
  const estMonthlyCovers = redemptionCapPerDay * offPeakDaysPerMonth;

  const monthlyKeep = r0(estMonthlyCovers * groupeeKeepPerCustomer);
  const annualKeep = monthlyKeep * 12;
  const monthlyIncrementalProfit = r0(estMonthlyCovers * incrementalProfitPerCustomer);

  return {
    regularPrice,
    discountPct,
    dealPrice,
    groupeeCommissionPct,
    grouponCommissionPct,
    groupeeKeepPerCustomer,
    grouponKeepPerCustomer,
    incrementalProfitPerCustomer,
    redemptionCapPerDay,
    offPeakDaysPerMonth,
    estMonthlyCovers,
    monthlyKeep,
    annualKeep,
    monthlyIncrementalProfit,
  };
}

export interface Qualification {
  score: number; // 0–100
  factors: { label: string; score: number; note: string }[];
}

export function qualify(p: Prospect): Qualification {
  // Lower off-peak utilization = more empty inventory to fill = better fit.
  const offPeak = r0(Math.min(100, (100 - p.offPeakUtilizationPct) * 1.1));
  const velocity = r0(Math.min(100, p.reviewVelocity * 4)); // demand signal
  const margin = r0(Math.min(100, p.grossMarginPct + 15)); // can it afford a deal
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

export interface PitchResult {
  summary: string;
  emailSubject: string;
  emailBody: string;
  talkingPoints: string[]; // what the voice agent says
  offerLine: string; // the group-sampler offer
  source: "claude" | "template";
}

// Deterministic fallback used when ANTHROPIC_API_KEY is absent or on error.
export function templatePitch(p: Prospect, e: Economics): PitchResult {
  const signal = p.signals[0];
  const offerLine = `Bring three friends, first round on the house — ${p.name} comps the first item for groups of 3+ first-time guests during ${p.offPeakWindow}.`;

  const summary = `${p.name} is a ${p.rating}★ ${p.category.toLowerCase()} in ${p.neighborhood} with a clear, under-used ${p.offPeakWindow} window (~${p.offPeakUtilizationPct}% full). A capped, fair Groupee deal fills those empty seats without touching peak demand — and unlike Groupon, ${p.name} keeps $${e.groupeeKeepPerCustomer} per guest (vs ~$${e.grouponKeepPerCustomer} on Groupon) plus every customer's contact for repeat visits.`;

  const emailSubject = `Filling your ${p.offPeakWindow} at ${p.name} — fairly`;

  const emailBody = `Hi ${p.contact.owner.split(" ")[0]},

I run partnerships at Groupee, and we've been tracking ${p.name}. ${signal}. We'd love to help you fill that ${p.offPeakWindow} window — without the Groupon math that leaves you upside down.

Here's the deal we'd ship in 72 hours, and the economics, in the open:
• ${e.discountPct}% off, capped at ${e.redemptionCapPerDay} redemptions/day so it never crowds out your full-price peak.
• Groupee takes ${e.groupeeCommissionPct}% (Groupon takes ~${e.grouponCommissionPct}%). You keep ~$${e.groupeeKeepPerCustomer} per guest vs ~$${e.grouponKeepPerCustomer} on Groupon.
• On seats that would otherwise sit empty, that's roughly $${e.monthlyIncrementalProfit.toLocaleString()}/mo in incremental profit.
• You keep every guest's contact info — these become repeat regulars, not one-and-done coupon hunters.

We'd also run "${offerLine}"

If that sounds fair, reply "yes" and we'll ship it this week. Open to a 10-minute call?

— The Groupee partnerships team
(Reply STOP to opt out — we'll never email again.)`;

  const talkingPoints = [
    `Hi, is this ${p.contact.owner}? This is the partnerships team at Groupee — do you have thirty seconds?`,
    `We noticed ${signal.toLowerCase()}, and that your ${p.offPeakWindow} runs around ${p.offPeakUtilizationPct} percent full.`,
    `We'd fill those empty seats with a ${e.discountPct}% deal capped at ${e.redemptionCapPerDay} a day, so it never touches your busy nights.`,
    `The part that matters: you keep about ${e.groupeeKeepPerCustomer} dollars a guest. On Groupon you'd keep around ${e.grouponKeepPerCustomer}. And you get every customer's contact info for repeat visits.`,
    `We'd also run a "bring three friends, first round's on the house" group offer. If it sounds fair, we can ship it in seventy-two hours.`,
  ];

  return { summary, emailSubject, emailBody, talkingPoints, offerLine, source: "template" };
}
