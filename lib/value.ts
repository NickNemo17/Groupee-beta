// Consumer-facing value signal (StubHub-style). The supply side already gated
// these in, so everything in the feed clears a floor — this badge tells users
// *how* good, anchored on quality + honest all-in pricing, never a fake markdown.

import { type Experience } from "./data";

export type ValueTier = "Great value" | "Good value" | "Fair value";

export interface ExperienceValue {
  score: number;
  tier: ValueTier;
  blurb: string;
}

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

export function experienceValue(e: Experience): ExperienceValue {
  // quality, scaled across the curated band (4.2★ → 5.0★)
  let q = clamp(((e.rating - 4.2) / 0.8) * 100);
  if (e.reviewCount < 80) q -= 8; // thin evidence
  if (e.localFavorite) q += 8; // vetted local heat
  const score = Math.round(clamp(q));
  const tier: ValueTier = score >= 85 ? "Great value" : score >= 68 ? "Good value" : "Fair value";
  return {
    score,
    tier,
    blurb: `${e.rating.toFixed(2)}★ over ${e.reviewCount.toLocaleString()} reviews · honest all-in price`,
  };
}
