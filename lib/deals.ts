// Closes the loop: an Onboarded prospect (supply side) becomes a live consumer
// listing. Returns a full Experience so every existing consumer component
// (ExperienceCard, detail page, MapView, value badge) renders it unchanged.

import { type Experience, type Category, type Review, fallbackImg } from "./data";
import { type Prospect, getProspect } from "./merchants";
import { archetypeFor, type Archetype } from "./archetypes";
import { computeEconomics, templatePitch } from "./pitch";

export const PARTNER_PREFIX = "partner-";
export const isPartnerId = (id: string) => id.startsWith(PARTNER_PREFIX);
export const dealId = (prospectId: string) => `${PARTNER_PREFIX}${prospectId}`;

const ARCH_CATEGORY: Record<Archetype, Category> = {
  dine: "Eat",
  drinks: "Drink",
  cafe: "Drink",
  fitness: "Wellness",
  beauty: "Wellness",
  recovery: "Wellness",
  social: "Nightlife",
  experience: "Tours",
  golf: "Outdoors",
  nightlife: "Nightlife",
  hotel: "Wellness",
};

const U = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=70`;

// A couple of themed Unsplash ids per archetype; SmartImg falls back to a
// deterministic picsum seed if any fail, so reliability is covered.
const ARCH_IMAGES: Record<Archetype, string[]> = {
  dine: ["1414235077428-338989a2e8c0", "1517248135467-4c7edcad34c4"],
  drinks: ["1510812431401-41d2bd2722f3", "1514933651103-005eec06c04b"],
  cafe: ["1470337458703-46ad1756a187", "1564890369478-c89ca6d9cde9"],
  fitness: ["1545205597-3d9d02c29597", "1506126613408-eca07ce68773"],
  beauty: ["1560066984-138dadb4c035", "1522337360788-8b13dee7a37e"],
  recovery: ["1571902943202-507ec2618e8f", "1545205597-3d9d02c29597"],
  social: ["1511268011861-691ed210aae8", "1606152421802-db97b9c7a11b"],
  experience: ["1488646953014-85cb44e25828", "1469854523086-cc02fe5d8800"],
  golf: ["1535131749006-b7f58c99034b", "1587174486073-ae5e5cff23aa"],
  nightlife: ["1516450360452-9312f5e86fc7", "1566737236500-c8ac43014a67"],
  hotel: ["1582719478250-c89cae4dc85b", "1507525428034-b723cf961d3e"],
};

// rough miles from downtown SB (good enough for a "X mi away" label)
function milesFromDowntown(lat: number, lng: number): number {
  const dLat = (lat - 34.4208) * 69;
  const dLng = (lng - -119.6982) * 57;
  return Math.round(Math.sqrt(dLat * dLat + dLng * dLng) * 10) / 10;
}

function bestTimeFor(window: string): Experience["bestTime"] {
  const w = window.toLowerCase();
  if (w.includes("morning")) return "morning";
  if (w.includes("twilight") || w.includes("evening") || w.includes("night")) return "evening";
  if (w.includes("afternoon") || w.includes("midday") || w.includes("lunch")) return "afternoon";
  return "any";
}

export function prospectToDeal(p: Prospect): Experience {
  const arc = archetypeFor(p.category);
  const econ = computeEconomics(p);
  const pitch = templatePitch(p, econ); // deterministic offer + copy
  const price = econ.mechanic === "B" ? econ.regularPrice : econ.dealPrice;

  const included =
    econ.mechanic === "B"
      ? ["Reserved slow-night access", arc.accessComp ?? "Value-add perk", "Honest, all-in price"]
      : econ.mechanic === "C"
        ? [`Intro ${econ.unitLabel} · ${econ.discountPct}% off`, "No membership required", "Honest, all-in price"]
        : [`${econ.discountPct}% off, capped daily`, "Group-sampler offer", "Honest, all-in price"];

  const newReview: Review = {
    author: "Groupee",
    rating: 5,
    date: "Just added",
    text: "Newly onboarded partner — vetted to clear our value bar. Be among the first to book.",
  };

  return {
    id: dealId(p.id),
    title: p.name,
    category: ARCH_CATEGORY[arc.key],
    tags: [arc.key, "new", ...(arc.groupUnit ? ["group"] : [])],
    neighborhood: p.neighborhood,
    lat: p.lat,
    lng: p.lng,
    price,
    rating: p.rating,
    reviewCount: p.reviewCount,
    durationMin: 90,
    images: ARCH_IMAGES[arc.key].map(U),
    blurb: pitch.offerLine,
    description: `${p.signals[0]}. ${pitch.offerLine} A brand-new Groupee partner — onboarded on fair terms, with a hard cap so the experience stays great.`,
    included,
    host: {
      name: p.contact.owner,
      avatar: `https://i.pravatar.cc/120?u=groupee-partner-${p.id}`,
      superhost: false,
      since: "2026",
      responseRate: 100,
    },
    reviews: [newReview],
    localFavorite: false,
    bestTime: bestTimeFor(p.offPeakWindow),
    indoor: !["golf", "experience"].includes(arc.key),
    goodForGroups: Boolean(arc.groupUnit) || arc.mechanic !== "C",
    distanceMi: milesFromDowntown(p.lat, p.lng),
    newOnGroupee: true,
    offer: pitch.offerLine,
  };
}

// Resolve any consumer listing id to an Experience, including partner deals.
export function resolveListing(
  id: string,
  base: Experience | undefined
): Experience | undefined {
  if (base) return base;
  if (isPartnerId(id)) {
    const p = getProspect(id.slice(PARTNER_PREFIX.length));
    if (p) return prospectToDeal(p);
  }
  return undefined;
}
