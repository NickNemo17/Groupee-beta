// Consumer value model — "good value for *what it is*", not "cheap".
//
// The question we answer is: **are you getting more than you pay for?**
// We estimate a *fair* all-in price for each experience from what it actually
// delivers (its category, how long it runs, how good it is, what's included),
// then compare that to the real price. Fairly-priced top-quality = great value;
// a genuine steal scores higher; paying a premium for something thin scores
// lower. Premium pricing itself is NEVER a penalty — quality carries it, so a
// $200 experience can be Great value while a cheap-but-mediocre one is not.
//
// Three scored factors (no constant filler), plus an honest-pricing guarantee
// shown as a chip rather than a fake "factor". The whole breakdown is exposed
// so users can see exactly how the score is built.

import { type Experience, type Category } from "./data";

export type ValueTier = "Great value" | "Good value" | "Fair value";

export interface ValueFactor {
  label: string;
  score: number; // 0–100
  note: string;
}
export interface ExperienceValue {
  score: number;
  tier: ValueTier;
  blurb: string;
  reason: string; // one-line "good value for what it is"
  fairPrice: number; // our estimate of a fair all-in price for this experience
  factors: ValueFactor[];
}

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));
const r0 = (n: number) => Math.round(n);

// Fair $/hour for a *good* version of each category, all-in. This is an
// external anchor for "fair for what it is" — deliberately NOT a median of our
// own catalog (which would be self-referential, noisy at small N, and would
// reward merely being cheaper than your peers). Stable as listings come and go.
const FAIR_RATE_PER_HOUR: Record<Category, number> = {
  Eat: 28,
  Drink: 25,
  Classes: 24,
  Nightlife: 24,
  Outdoors: 25,
  Wellness: 23,
  Tours: 15,
};

// Bayesian-adjusted rating: blend toward the curated-platform mean with a
// prior worth ~PRIOR_WEIGHT reviews, so a 4.95★ on 12 reviews isn't trusted
// like a 4.95★ on 1,200 — without a brittle hard cliff.
const PRIOR_MEAN = 4.6;
const PRIOR_WEIGHT = 50;
function adjustedRating(e: Experience): number {
  return (e.rating * e.reviewCount + PRIOR_MEAN * PRIOR_WEIGHT) / (e.reviewCount + PRIOR_WEIGHT);
}

// 0–100 from the adjusted rating. The live band sits ~4.45–4.95, so we map
// 4.35→0 and 4.95→100 to get real spread (not everything pinned near the top).
function qualityScore(e: Experience): number {
  return r0(clamp(((adjustedRating(e) - 4.35) / 0.6) * 100));
}

// A fair all-in price for THIS experience, from what it delivers.
function fairPriceFor(e: Experience, quality: number): number {
  const hours = Math.max(0.75, e.durationMin / 60);
  const qualityMult = 0.8 + (quality / 100) * 0.5; // 0.8–1.3 — better earns a fair premium
  const inclusionMult = 1 + Math.min(0.24, e.included.length * 0.04); // gear/wine/photos/shipping justify price
  return FAIR_RATE_PER_HOUR[e.category] * hours * qualityMult * inclusionMult;
}

function priceValue(e: Experience, fair: number): { score: number; ratio: number; word: string } {
  const ratio = fair / e.price; // >1 → you get more than you pay for
  // ratio 1.0 (fairly priced for what you get) = 82 — getting your money's
  // worth IS good value. A real steal climbs; overpaying for something thin
  // dips. Clamped so one extreme outlier can't run away with the score.
  const score = r0(clamp(82 + (ratio - 1) * 50, 42, 97));
  const word =
    ratio >= 1.22 ? "a steal" : ratio >= 1.04 ? "well-priced" : ratio >= 0.9 ? "fairly priced" : "a premium pick";
  return { score, ratio, word };
}

// Popularity / social proof — scales with real review volume, with a modest
// earned bump for a flagged local favorite (not a 20-pt boolean swing).
function demandScore(e: Experience): number {
  return r0(clamp(50 + Math.min(40, e.reviewCount / 8) + (e.localFavorite ? 8 : 0)));
}

export function experienceValue(e: Experience): ExperienceValue {
  const quality = qualityScore(e);
  const fair = fairPriceFor(e, quality);
  const pv = priceValue(e, fair);
  const demand = demandScore(e);
  const thin = e.reviewCount < 90;

  const factors: ValueFactor[] = [
    {
      label: "Quality",
      score: quality,
      note: `${e.rating.toFixed(2)}★ · ${e.reviewCount.toLocaleString()} reviews${thin ? " (still building)" : ""}`,
    },
    {
      label: "Price for what you get",
      score: pv.score,
      note: `$${e.price} — ${pv.word} · fair ≈ $${r0(fair)}`,
    },
    {
      label: "Local demand",
      score: demand,
      note: e.localFavorite ? `A local favorite · ${e.reviewCount.toLocaleString()} reviews` : `${e.reviewCount.toLocaleString()} reviews`,
    },
  ];

  const score = r0(clamp(quality * 0.45 + pv.score * 0.4 + demand * 0.15));

  // Quality gates the top tier: a cheap steal that isn't genuinely good can't
  // be "Great value" — that's the curation promise, not a coupon dump.
  const tier: ValueTier =
    score >= 85 && quality >= 66 ? "Great value" : score >= 70 ? "Good value" : "Fair value";

  const reason =
    tier === "Great value"
      ? pv.ratio >= 1.22
        ? "A genuine steal — top-quality and priced well under what it's worth."
        : pv.word === "a premium pick"
          ? "Premium, but worth it — excellent and fairly priced for what you get."
          : "Top-rated and well-priced for what it is."
      : tier === "Good value"
        ? "Solid quality at a fair price for what you get."
        : "A fair pick — decent quality, priced about right.";

  return {
    score,
    tier,
    blurb: `${e.rating.toFixed(2)}★ over ${e.reviewCount.toLocaleString()} reviews · honest all-in price`,
    reason,
    fairPrice: r0(fair),
    factors,
  };
}
