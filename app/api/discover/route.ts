import { NextResponse } from "next/server";
import { PROSPECTS } from "@/lib/merchants";

// Real supply-graph sourcing via Google Places (new Places API, Text Search).
// Falls back to the mock supply graph when GOOGLE_PLACES_API_KEY is absent — so
// the "Discover" button always returns something. Off-peak/signals aren't in
// Places, so those are synthesized downstream; this returns the discovered base.

export interface DiscoveredMerchant {
  name: string;
  category: string;
  neighborhood: string;
  rating: number;
  reviewCount: number;
  priceLevel: number;
}

const PRICE_MAP: Record<string, number> = {
  PRICE_LEVEL_INEXPENSIVE: 1,
  PRICE_LEVEL_MODERATE: 2,
  PRICE_LEVEL_EXPENSIVE: 3,
  PRICE_LEVEL_VERY_EXPENSIVE: 4,
};

function mockResults(q: string): DiscoveredMerchant[] {
  const t = q.toLowerCase();
  const list = t
    ? PROSPECTS.filter((p) => p.category.toLowerCase().includes(t) || p.name.toLowerCase().includes(t))
    : PROSPECTS;
  return (list.length ? list : PROSPECTS).slice(0, 8).map((p) => ({
    name: p.name,
    category: p.category,
    neighborhood: p.neighborhood,
    rating: p.rating,
    reviewCount: p.reviewCount,
    priceLevel: p.priceLevel,
  }));
}

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? "restaurants";
  const key = process.env.GOOGLE_PLACES_API_KEY;

  if (!key) {
    return NextResponse.json({ source: "mock", merchants: mockResults(q) });
  }

  try {
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask":
          "places.displayName,places.rating,places.userRatingCount,places.priceLevel,places.primaryTypeDisplayName,places.formattedAddress",
      },
      body: JSON.stringify({ textQuery: `${q} in Santa Barbara, CA`, maxResultCount: 12 }),
    });
    if (!res.ok) return NextResponse.json({ source: "mock", merchants: mockResults(q) });

    type Place = {
      displayName?: { text?: string };
      rating?: number;
      userRatingCount?: number;
      priceLevel?: string;
      primaryTypeDisplayName?: { text?: string };
      formattedAddress?: string;
    };
    const data = (await res.json()) as { places?: Place[] };
    const merchants: DiscoveredMerchant[] = (data.places ?? []).map((pl) => ({
      name: pl.displayName?.text ?? "Unknown",
      category: pl.primaryTypeDisplayName?.text ?? q,
      neighborhood: (pl.formattedAddress ?? "Santa Barbara").split(",")[0],
      rating: pl.rating ?? 0,
      reviewCount: pl.userRatingCount ?? 0,
      priceLevel: pl.priceLevel ? (PRICE_MAP[pl.priceLevel] ?? 2) : 2,
    }));
    return NextResponse.json({ source: "google", merchants });
  } catch {
    return NextResponse.json({ source: "mock", merchants: mockResults(q) });
  }
}
