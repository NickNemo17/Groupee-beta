// The operator is a BUSINESS, not a person. Each listing belongs to a business
// you can open to see its bio, photo, and all its Groupee deals.

import { EXPERIENCES, type Experience } from "./data";
import { getProspect } from "./merchants";
import { prospectToDeal, isPartnerId, PARTNER_PREFIX } from "./deals";

// Authored, distinctive business name + bio per seed experience.
const BUSINESSES: Record<string, { name: string; bio: string }> = {
  "tide-to-table": {
    name: "Tide & Table",
    bio: "A twelve-seat Funk Zone counter where the kitchen cooks a nightly tasting menu from whatever the Santa Barbara fleet landed that morning — uni, spot prawns, rockfish — paired with Central Coast wine at one communal table.",
  },
  "mesa-taco-crawl": {
    name: "Mesa Taquería Crawl",
    bio: "A local-led walk through four family-run Mesa taquerías — one signature taco at each, finished with horchata. No tourist traps, just the spots the neighborhood actually eats at.",
  },
  "channel-kayak-sunrise": {
    name: "Channel Coast Kayak",
    bio: "A harbor outfitter running small first-light paddles into the sea caves before the wind picks up — stable tandems, certified guides, and the occasional dolphin pod.",
  },
  "urban-wine-trail": {
    name: "Funk Zone Wine Walk",
    bio: "A guided crawl through three of the Funk Zone's best tasting rooms, poured by the winemakers themselves, with flights you can't get on a shelf.",
  },
  "clay-night": {
    name: "Wheelhouse Ceramics",
    bio: "An Eastside studio for hands-on wheel nights — throw two pieces and they glaze, fire, and mail them to you two weeks later. BYO wine welcome.",
  },
  "riviera-sunset-hike": {
    name: "Riviera Trail Co.",
    bio: "Easy guided golden-hour climbs to the Riviera overlook above the harbor and the Channel Islands — local history along the way, hot tea at the top.",
  },
  "tea-ceremony": {
    name: "Stillwater Tea Room",
    bio: "A tucked-away downtown studio for slow, guided gongfu tea sittings — phones away, six steepings of a single oolong, and a short breathing practice.",
  },
  "rooftop-jazz": {
    name: "SOhO Rooftop",
    bio: "A downtown rooftop with a live jazz trio, reserved tables, rotating small plates and a welcome cocktail — dressy-casual, with the best sightlines in town.",
  },
  "tidepool-walk": {
    name: "Coastal Discovery Co.",
    bio: "Marine-biologist-led tidepool walks timed to the low tide — anemones, sea stars, hermit crabs — plenty for kids to touch and real stories for the adults.",
  },
  "speakeasy-cocktails": {
    name: "The Hidden Door",
    bio: "An unmarked downtown speakeasy where the head bartender walks your group through making three craft cocktails. You drink your homework.",
  },
  "farm-breakfast": {
    name: "Foothill Family Farm",
    bio: "A working Goleta foothill farm: gather eggs, meet the goats, then a long family-style breakfast under the oaks built from whatever's growing that week.",
  },
  "vinyasa-beach-yoga": {
    name: "Butterfly Beach Yoga",
    bio: "All-levels vinyasa on the sand at Butterfly Beach, timed to the sunset and closed with a short sound bath. Mats provided; stay after to watch the light go.",
  },
  "old-mission-history": {
    name: "Old Mission Walks",
    bio: "A historian's honest walking tour of Old Mission Santa Barbara and its rose garden — the layered, real story, not the postcard version.",
  },
  "vinyl-listening-bar": {
    name: "The Listening Room",
    bio: "A Funk Zone hi-fi listening bar where the music is the point — a reserved booth, a natural-wine flight, and the night's records taken on request.",
  },
  "surf-lesson": {
    name: "Leadbetter Surf School",
    bio: "Beginner surf lessons on Leadbetter's gentle point break — boards, wetsuits, a patient 4-to-1 instructor, and the action photos to prove you stood up.",
  },
  "pasta-workshop": {
    name: "Bottega Pasta Lab",
    bio: "A hands-on downtown pasta evening with a Bologna-born chef — dough to plate, eaten family-style with wine. Groupee's most-booked class.",
  },
  "stargazing-summit": {
    name: "Camino Cielo Astronomy",
    bio: "Guided stargazing above the marine layer on Camino Cielo — a real telescope, an astronomer, blankets and cocoa, and planets you forget you can see.",
  },
  "third-wave-coffee": {
    name: "Eastside Roastery",
    bio: "An Eastside roaster running proper cuppings of five single-origins — slurping included — until “notes of stone fruit” finally makes sense. Leave with a bag.",
  },
};

export function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export interface Business {
  name: string;
  slug: string;
  bio: string;
  image: string;
  since: string;
  neighborhood: string;
  topRated: boolean;
}

export function businessFor(e: Experience): Business {
  const topRated = e.host.superhost;
  const image = e.images[0];
  if (isPartnerId(e.id)) {
    return {
      name: e.title,
      slug: e.id, // partner-<prospectId>
      since: e.host.since,
      neighborhood: e.neighborhood,
      image,
      topRated,
      bio: `${e.title} is a brand-new Groupee partner in ${e.neighborhood} — ${e.rating.toFixed(2)}★ across ${e.reviewCount.toLocaleString()} reviews. ${e.offer ?? "Sourced on fair terms to fill a quiet window."}`,
    };
  }
  const def = BUSINESSES[e.id];
  const name = def?.name ?? e.title;
  return {
    name,
    slug: slugify(name),
    since: e.host.since,
    neighborhood: e.neighborhood,
    image,
    topRated,
    bio:
      def?.bio ??
      `${name} is ${topRated ? "a top-rated " : "an independent "}local spot in ${e.neighborhood} — ${e.rating.toFixed(2)}★ across ${e.reviewCount.toLocaleString()} reviews.`,
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
