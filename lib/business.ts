// The operator is a BUSINESS, not a person. Each listing belongs to a business
// you can open to see its bio + all its Groupee deals.

import { EXPERIENCES, type Experience } from "./data";
import { getProspect } from "./merchants";
import { prospectToDeal, isPartnerId, PARTNER_PREFIX } from "./deals";

// Business name per seed experience (the venue/operator, not a host person).
const BUSINESS_NAMES: Record<string, string> = {
  "tide-to-table": "Tide & Table",
  "mesa-taco-crawl": "Mesa Taquería Crawl",
  "channel-kayak-sunrise": "Channel Coast Kayak",
  "urban-wine-trail": "Funk Zone Wine Walk",
  "clay-night": "Wheelhouse Ceramics",
  "riviera-sunset-hike": "Riviera Trail Co.",
  "tea-ceremony": "Stillwater Tea Room",
  "rooftop-jazz": "SOhO Rooftop",
  "tidepool-walk": "Coastal Discovery Co.",
  "speakeasy-cocktails": "The Hidden Door",
  "farm-breakfast": "Foothill Family Farm",
  "vinyasa-beach-yoga": "Butterfly Beach Yoga",
  "old-mission-history": "Old Mission Walks",
  "vinyl-listening-bar": "The Listening Room",
  "surf-lesson": "Leadbetter Surf School",
  "pasta-workshop": "Bottega Pasta Lab",
  "stargazing-summit": "Camino Cielo Astronomy",
  "third-wave-coffee": "Eastside Roastery",
};

export function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export interface Business {
  name: string;
  slug: string;
  bio: string;
  since: string;
  neighborhood: string;
  topRated: boolean;
}

export function businessFor(e: Experience): Business {
  const topRated = e.host.superhost;
  if (isPartnerId(e.id)) {
    // partner listings: the deal title already IS the business name
    return {
      name: e.title,
      slug: e.id, // partner-<prospectId>
      since: e.host.since,
      neighborhood: e.neighborhood,
      topRated,
      bio: `${e.title} — ${e.neighborhood} · ${e.rating.toFixed(2)}★ across ${e.reviewCount.toLocaleString()} reviews. A brand-new Groupee partner.`,
    };
  }
  const name = BUSINESS_NAMES[e.id] ?? e.title;
  return {
    name,
    slug: slugify(name),
    since: e.host.since,
    neighborhood: e.neighborhood,
    topRated,
    bio: `${name} is ${topRated ? "a top-rated " : "an independent "}local spot in ${e.neighborhood} — ${e.rating.toFixed(2)}★ across ${e.reviewCount.toLocaleString()} reviews.`,
  };
}

// All of a business's deals on Groupee.
export function dealsForBusiness(slug: string): Experience[] {
  if (slug.startsWith(PARTNER_PREFIX)) {
    const p = getProspect(slug.slice(PARTNER_PREFIX.length));
    return p ? [prospectToDeal(p)] : [];
  }
  return EXPERIENCES.filter((e) => businessFor(e).slug === slug);
}
