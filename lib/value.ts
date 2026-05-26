// Consumer value model — "good value for *what it is*", not "cheap".
// A $200 experience can be Great value if it's top-tier and fairly priced for
// its category. Price never auto-penalizes; we score quality, local demand,
// price-fairness vs the category, and honest all-in pricing — and expose the
// breakdown so users can see exactly how it's determined.

import { EXPERIENCES, type Experience, type Category } from "./data";

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
  factors: ValueFactor[];
}

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));
const r0 = (n: number) => Math.round(n);

// Typical price per category (median of the live catalog) — the anchor for
// "fair for what it is". Computed once.
const CATEGORY_MEDIAN: Partial<Record<Category, number>> = (() => {
  const byCat: Record<string, number[]> = {};
  for (const e of EXPERIENCES) (byCat[e.category] ??= []).push(e.price);
  const med = (xs: number[]) => {
    const s = [...xs].sort((a, b) => a - b);
    return s[Math.floor(s.length / 2)] ?? 0;
  };
  const out: Partial<Record<Category, number>> = {};
  for (const c in byCat) out[c as Category] = med(byCat[c]);
  return out;
})();
const GLOBAL_MEDIAN = (() => {
  const s = EXPERIENCES.map((e) => e.price).sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)] ?? 50;
})();

function priceFairness(e: Experience): { score: number; note: string } {
  const typical = CATEGORY_MEDIAN[e.category] ?? GLOBAL_MEDIAN;
  const ratio = e.price / typical;
  // Premium pricing is NOT a penalty — quality carries it. Floor at ~58.
  let score: number;
  if (ratio <= 1.0) score = 96;
  else if (ratio <= 1.25) score = 88;
  else if (ratio <= 1.6) score = 78;
  else if (ratio <= 2.2) score = 68;
  else score = 58;
  const tierWord = ratio <= 1.0 ? "well-priced" : ratio <= 1.6 ? "fairly priced" : "a premium pick";
  return { score, note: `$${e.price} · typical ${e.category.toLowerCase()} ~$${typical} — ${tierWord}` };
}

export function experienceValue(e: Experience): ExperienceValue {
  // 1) Quality — how good it actually is.
  let quality = clamp(((e.rating - 4.2) / 0.8) * 100);
  if (e.reviewCount < 80) quality -= 8;
  quality = r0(clamp(quality));

  // 2) Loved locally — demand / social proof.
  const loved = r0(clamp((e.localFavorite ? 70 : 50) + Math.min(35, e.reviewCount / 25)));

  // 3) Fair price for the category (the "for what it is" factor).
  const fair = priceFairness(e);

  // 4) Honest, all-in pricing — the brand promise (no fees, no fake anchors).
  const honest = 94;

  const factors: ValueFactor[] = [
    { label: "Quality", score: quality, note: `${e.rating.toFixed(2)}★ · ${e.reviewCount.toLocaleString()} reviews` },
    { label: "Loved locally", score: loved, note: e.localFavorite ? "A local favorite" : `${e.reviewCount.toLocaleString()} reviews` },
    { label: "Fair price for what it is", score: fair.score, note: fair.note },
    { label: "Honest, all-in pricing", score: honest, note: "No fees, no fake “value” anchor" },
  ];

  const score = r0(quality * 0.4 + loved * 0.2 + fair.score * 0.25 + honest * 0.15);
  const tier: ValueTier = score >= 85 ? "Great value" : score >= 70 ? "Good value" : "Fair value";

  const premium = e.price >= (CATEGORY_MEDIAN[e.category] ?? GLOBAL_MEDIAN) * 1.25;
  const reason =
    tier === "Great value"
      ? premium
        ? `Premium, but a standout — top-rated and fairly priced for a ${e.category.toLowerCase()} experience.`
        : `Top-rated and well-priced for what it is.`
      : tier === "Good value"
        ? `Solid quality at a fair price for its category.`
        : `A fair pick — quality and price both reasonable.`;

  return {
    score,
    tier,
    blurb: `${e.rating.toFixed(2)}★ over ${e.reviewCount.toLocaleString()} reviews · honest all-in price`,
    reason,
    factors,
  };
}
