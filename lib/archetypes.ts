// Vertical archetypes — the offer MECHANIC has to match the inventory, or you
// get the Groupon failure (fire-selling a nightclub table, or a "30% off" that
// trains a salon's clients to never rebook). Three mechanics:
//   A  off-peak % discount — fill perishable empty capacity
//   B  access / value-add  — premium/status inventory a public discount would cheapen
//   C  intro → regular     — win the SECOND visit (high-LTV services)

export type Mechanic = "A" | "B" | "C";
export type Archetype =
  | "dine"
  | "drinks"
  | "cafe"
  | "fitness"
  | "beauty"
  | "recovery"
  | "social"
  | "experience"
  | "golf"
  | "nightlife"
  | "hotel";

export interface ArchetypeConfig {
  key: Archetype;
  mechanic: Mechanic;
  mechanicName: string; // human label for the mechanic
  label: string; // short offer-shape label
  unit: string; // what's sold (the inventory unit)
  discountPct: number; // headline % (A) / intro % off first visit (C) / 0 (B)
  commissionPct: number;
  capRate: number; // share of daily capacity offered off-peak
  groupUnit?: number; // pre-formed group size (golf foursome, club table)
  rebook?: boolean; // mechanic C — value is the recurring relationship
  accessComp?: string; // mechanic B — the value-add instead of a discount
  offerStyle: string; // guidance the agent uses to phrase the offer
}

export const ARCHETYPES: Record<Archetype, ArchetypeConfig> = {
  dine: {
    key: "dine", mechanic: "A", mechanicName: "Off-peak fill", label: "Off-peak % deal",
    unit: "cover", discountPct: 30, commissionPct: 10, capRate: 0.15,
    offerStyle: "A capped % off during the slow window, plus a group-sampler.",
  },
  drinks: {
    key: "drinks", mechanic: "A", mechanicName: "Off-peak fill", label: "Off-peak % deal",
    unit: "tab", discountPct: 25, commissionPct: 10, capRate: 0.18,
    offerStyle: "A modest capped % off drinks/small plates in the slow window; high margin so go lighter on depth.",
  },
  cafe: {
    key: "cafe", mechanic: "A", mechanicName: "Off-peak fill", label: "Afternoon-lull deal",
    unit: "visit", discountPct: 25, commissionPct: 10, capRate: 0.12,
    offerStyle: "Fill the afternoon lull; consider a paid tasting/cupping as the SKU.",
  },
  fitness: {
    key: "fitness", mechanic: "C", mechanicName: "Intro → membership", label: "Intro class → regular",
    unit: "class", discountPct: 60, commissionPct: 12, capRate: 0.25, rebook: true,
    offerStyle: "A cheap/free intro class (or 3-class pack); the win is the membership, not the deal. Bring-a-friend.",
  },
  beauty: {
    key: "beauty", mechanic: "C", mechanicName: "Intro → regular", label: "Intro service → rebook",
    unit: "appointment", discountPct: 40, commissionPct: 12, capRate: 0.2, rebook: true,
    offerStyle: "An intro on a slow-chair service; the goal is the standing monthly client. They keep the client's contact — fix the Groupon-facial trauma.",
  },
  recovery: {
    key: "recovery", mechanic: "C", mechanicName: "Intro → membership", label: "Intro session → regular",
    unit: "session", discountPct: 50, commissionPct: 12, capRate: 0.25, rebook: true,
    offerStyle: "Intro session (sauna/cold plunge/float); social — go with friends; convert to membership.",
  },
  social: {
    key: "social", mechanic: "A", mechanicName: "Fill the unit", label: "Group-unit deal",
    unit: "lane / room", discountPct: 30, commissionPct: 10, capRate: 0.3, groupUnit: 6,
    offerStyle: "Sell the UNIT (lane, room, table), not the seat — it's already a group buy. Weekday/daytime fill.",
  },
  experience: {
    key: "experience", mechanic: "A", mechanicName: "Off-peak fill", label: "Off-peak departure deal",
    unit: "spot", discountPct: 30, commissionPct: 12, capRate: 0.3, groupUnit: 4,
    offerStyle: "Fill weekday/off-peak departures; group-sampler 'bring three friends'.",
  },
  golf: {
    key: "golf", mechanic: "A", mechanicName: "Twilight fill", label: "Twilight foursome",
    unit: "foursome", discountPct: 35, commissionPct: 10, capRate: 0.3, groupUnit: 4,
    offerStyle: "Sell the twilight FOURSOME (group of 4 comes free with the format) + cart/F&B attach.",
  },
  nightlife: {
    key: "nightlife", mechanic: "B", mechanicName: "Access, not discount", label: "Slow-night access",
    unit: "table", discountPct: 0, commissionPct: 12, capRate: 0.25, groupUnit: 6,
    accessComp: "lowered table minimum + a comped bottle for a group of 6 on slow nights",
    offerStyle: "NEVER a public % off — it cheapens the door. Offer access/value-add: lowered minimum, comped bottle, group-fill on Sun–Thu.",
  },
  hotel: {
    key: "hotel", mechanic: "B", mechanicName: "Access + bundle", label: "Day-pass / midweek",
    unit: "day-pass", discountPct: 0, commissionPct: 12, capRate: 0.2,
    accessComp: "midweek day-pass to pool/spa with an F&B credit",
    offerStyle: "Sell access to perishable space (day-pass, cabana, midweek night) bundled with F&B/spa; not a room fire-sale.",
  },
};

// Map a merchant's free-text category onto an archetype.
export function archetypeFor(category: string): ArchetypeConfig {
  const c = category.toLowerCase();
  const has = (...xs: string[]) => xs.some((x) => c.includes(x));

  if (has("salon", "hair", "nail", "lash", "brow", "barber", "spa", "facial", "med-spa", "medspa")) return ARCHETYPES.beauty;
  if (has("sauna", "cold plunge", "plunge", "float", "recovery", "ice bath", "wellness")) return ARCHETYPES.recovery;
  if (has("yoga", "pilates", "fitness", "studio", "gym", "spin", "climb", "reformer")) return ARCHETYPES.fitness;
  if (has("nightclub", "lounge", "bottle", "club")) return ARCHETYPES.nightlife;
  if (has("golf", "tee time")) return ARCHETYPES.golf;
  if (has("hotel", "resort", "day-pass", "cabana")) return ARCHETYPES.hotel;
  if (has("bowling", "axe", "karaoke", "escape", "arcade", "mini-golf", "pottery", "paint")) return ARCHETYPES.social;
  if (has("tour", "kayak", "watersport", "sail", "bike", "surf", "music venue", "farm")) return ARCHETYPES.experience;
  if (has("coffee", "cafe", "café", "roaster")) return ARCHETYPES.cafe;
  if (has("brewery", "taproom", "wine", "cocktail", "bar", "beer")) return ARCHETYPES.drinks;
  return ARCHETYPES.dine; // restaurants, taquerías, default
}
