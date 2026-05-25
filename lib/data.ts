// Groupee mock dataset — Santa Barbara local experiences.
// Anti-Groupon by design: honest all-in prices, quality-curated, no fake "value" anchors.

export type Category =
  | "Eat"
  | "Drink"
  | "Classes"
  | "Outdoors"
  | "Wellness"
  | "Nightlife"
  | "Tours";

export const CATEGORIES: { key: Category; label: string; icon: string }[] = [
  { key: "Eat", label: "Eat", icon: "🍽️" },
  { key: "Drink", label: "Drink", icon: "☕" },
  { key: "Outdoors", label: "Outdoors", icon: "🌅" },
  { key: "Wellness", label: "Wellness", icon: "🧘" },
  { key: "Classes", label: "Classes", icon: "🎨" },
  { key: "Nightlife", label: "Nightlife", icon: "🎶" },
  { key: "Tours", label: "Tours", icon: "🧭" },
];

export interface Review {
  author: string;
  rating: number;
  date: string;
  text: string;
}

export interface Experience {
  id: string;
  title: string;
  category: Category;
  tags: string[];
  neighborhood: string;
  lat: number;
  lng: number;
  price: number; // all-in, per person
  rating: number;
  reviewCount: number;
  durationMin: number;
  images: string[];
  blurb: string;
  description: string;
  included: string[];
  host: {
    name: string;
    avatar: string;
    superhost: boolean;
    since: string;
    responseRate: number;
  };
  reviews: Review[];
  localFavorite: boolean;
  bestTime: "morning" | "afternoon" | "evening" | "any";
  indoor: boolean;
  goodForGroups: boolean;
  distanceMi: number;
  // set when this listing was just onboarded by the supply-side agent
  newOnGroupee?: boolean;
  offer?: string;
}

const U = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=70`;

// deterministic, always-loads fallback used by <img onError>
export const fallbackImg = (seed: string) =>
  `https://picsum.photos/seed/groupee-${encodeURIComponent(seed)}/900/700`;

const avatar = (seed: string) =>
  `https://i.pravatar.cc/120?u=groupee-${encodeURIComponent(seed)}`;

function rev(author: string, rating: number, date: string, text: string): Review {
  return { author, rating, date, text };
}

export const EXPERIENCES: Experience[] = [
  {
    id: "tide-to-table",
    title: "Tide-to-Table Coastal Seafood Dinner",
    category: "Eat",
    tags: ["foodie", "date", "seafood", "sunset", "splurge"],
    neighborhood: "The Funk Zone",
    lat: 34.4138,
    lng: -119.6896,
    price: 78,
    rating: 4.93,
    reviewCount: 214,
    durationMin: 120,
    images: ["1414235077428-338989a2e8c0", "1517248135467-4c7edcad34c4", "1504674900247-0877df9cc836"].map(U),
    blurb: "A five-course dinner built around what the boats brought in this morning.",
    description:
      "Chef Marisol cooks a daily-changing tasting menu from whatever the Santa Barbara fleet landed that morning — uni, spot prawns, rockfish — paired with local Central Coast wines. Seats just twelve at a single communal table.",
    included: ["5 courses", "Wine pairing", "Gratuity included", "Dietary options"],
    host: { name: "Marisol", avatar: avatar("marisol"), superhost: true, since: "2019", responseRate: 99 },
    reviews: [
      rev("Daniel", 5, "Apr 2026", "Best meal I've had in SB, full stop. Marisol explains every course."),
      rev("Priya", 5, "Mar 2026", "Communal table made it social without being awkward. The uni was unreal."),
      rev("Theo", 4, "Mar 2026", "Pricey but everything is included — no surprise check at the end."),
    ],
    localFavorite: true,
    bestTime: "evening",
    indoor: true,
    goodForGroups: true,
    distanceMi: 0.6,
  },
  {
    id: "mesa-taco-crawl",
    title: "Mesa Late-Night Taco Crawl",
    category: "Eat",
    tags: ["foodie", "group", "cheap", "casual", "late"],
    neighborhood: "The Mesa",
    lat: 34.4022,
    lng: -119.7185,
    price: 32,
    rating: 4.81,
    reviewCount: 389,
    durationMin: 150,
    images: ["1565299624946-b28f40a0ae38", "1551782450-a2132b4ba21d", "1504674900247-0877df9cc836"].map(U),
    blurb: "Four taquerías, one local guide, zero tourist traps.",
    description:
      "Walk the Mesa with a guide who grew up here, hitting four family-run taquerías for their signature taco plus a horchata at the end. Built for groups — bring up to eight.",
    included: ["4 tacos", "Horchata", "Local guide", "Map for next time"],
    host: { name: "Eddie", avatar: avatar("eddie"), superhost: true, since: "2021", responseRate: 100 },
    reviews: [
      rev("Sam", 5, "Apr 2026", "Did this with 6 friends for a birthday. Eddie is hilarious and the al pastor spot is now my regular."),
      rev("Grace", 5, "Feb 2026", "Felt like a friend showing us around, not a tour."),
      rev("Marco", 4, "Jan 2026", "So much food. Come hungry."),
    ],
    localFavorite: true,
    bestTime: "evening",
    indoor: false,
    goodForGroups: true,
    distanceMi: 1.4,
  },
  {
    id: "channel-kayak-sunrise",
    title: "Sunrise Sea-Cave Kayak",
    category: "Outdoors",
    tags: ["outdoors", "adventure", "morning", "active", "nature"],
    neighborhood: "Santa Barbara Harbor",
    lat: 34.4035,
    lng: -119.6907,
    price: 65,
    rating: 4.97,
    reviewCount: 156,
    durationMin: 180,
    images: ["1507525428034-b723cf961d3e", "1500375592092-40eb2168fd21", "1488646953014-85cb44e25828"].map(U),
    blurb: "Paddle glassy morning water into the sea caves before the wind picks up.",
    description:
      "Push off at first light when the channel is calm, paddle the coastline into a string of sea caves, and watch for sea lions and the occasional dolphin pod. Beginners welcome — stable tandem kayaks and a guide the whole way.",
    included: ["Kayak & paddle", "Wetsuit", "Dry bag", "Certified guide", "Photos"],
    host: { name: "Kai", avatar: avatar("kai"), superhost: true, since: "2018", responseRate: 98 },
    reviews: [
      rev("Nina", 5, "Apr 2026", "Dolphins followed us for ten minutes. Unforgettable."),
      rev("Owen", 5, "Mar 2026", "Kai made my nervous partner totally comfortable."),
      rev("Lia", 5, "Mar 2026", "Worth the early alarm. Water was like glass."),
    ],
    localFavorite: true,
    bestTime: "morning",
    indoor: false,
    goodForGroups: true,
    distanceMi: 0.9,
  },
  {
    id: "urban-wine-trail",
    title: "Funk Zone Urban Wine Trail",
    category: "Drink",
    tags: ["wine", "date", "group", "afternoon", "social"],
    neighborhood: "The Funk Zone",
    lat: 34.4142,
    lng: -119.6889,
    price: 55,
    rating: 4.88,
    reviewCount: 302,
    durationMin: 150,
    images: ["1510812431401-41d2bd2722f3", "1572116469696-31de0f17cc34", "1514933651103-005eec06c04b"].map(U),
    blurb: "Three tasting rooms within walking distance, poured by the makers.",
    description:
      "The Funk Zone packs a dozen tasting rooms into a few warehouse blocks. Your host walks you to three of the best, where you'll meet the winemakers and taste flights you can't get in stores.",
    included: ["3 flights (9 pours)", "Cheese plate", "Host", "Souvenir glass"],
    host: { name: "Dana", avatar: avatar("dana"), superhost: false, since: "2022", responseRate: 95 },
    reviews: [
      rev("Erin", 5, "Apr 2026", "Great for a group — we booked it for a bachelorette and it was perfect."),
      rev("Carlos", 5, "Mar 2026", "Met two actual winemakers. Learned a ton."),
      rev("Bea", 4, "Feb 2026", "Pours are generous. Eat first!"),
    ],
    localFavorite: true,
    bestTime: "afternoon",
    indoor: true,
    goodForGroups: true,
    distanceMi: 0.7,
  },
  {
    id: "clay-night",
    title: "Hands-On Pottery: Wheel Night",
    category: "Classes",
    tags: ["creative", "date", "rainy", "indoor", "evening"],
    neighborhood: "Eastside",
    lat: 34.4255,
    lng: -119.6845,
    price: 58,
    rating: 4.9,
    reviewCount: 178,
    durationMin: 120,
    images: ["1565193566173-7a0ee3dbe261", "1610701596007-11502861dcfa", "1493106641515-6b5631de4bb9"].map(U),
    blurb: "Throw two bowls on the wheel — we glaze and ship them to you.",
    description:
      "A relaxed evening at the wheel with a working ceramicist. No experience needed; you'll make two pieces, and the studio glazes, fires, and mails them to you two weeks later. A great rainy-evening date.",
    included: ["Clay & tools", "2 fired pieces", "Glazing", "Shipping", "BYO wine welcome"],
    host: { name: "June", avatar: avatar("june"), superhost: true, since: "2020", responseRate: 100 },
    reviews: [
      rev("Will", 5, "Apr 2026", "Way harder than Ghost makes it look. So much fun."),
      rev("Aria", 5, "Mar 2026", "Perfect rainy-day date. June is patient and funny."),
      rev("Jonah", 5, "Feb 2026", "Got my bowls in the mail and they're actually good!"),
    ],
    localFavorite: false,
    bestTime: "evening",
    indoor: true,
    goodForGroups: true,
    distanceMi: 1.1,
  },
  {
    id: "riviera-sunset-hike",
    title: "Riviera Sunset Hike & Overlook",
    category: "Outdoors",
    tags: ["outdoors", "sunset", "date", "active", "cheap", "nature"],
    neighborhood: "The Riviera",
    lat: 34.4408,
    lng: -119.7015,
    price: 28,
    rating: 4.86,
    reviewCount: 241,
    durationMin: 90,
    images: ["1551632811-561732d1e306", "1469854523086-cc02fe5d8800", "1502082553048-f009c37129b9"].map(U),
    blurb: "An easy golden-hour climb to the best view of the harbor and islands.",
    description:
      "A guide leads an easy 2-mile loop up the Riviera to a bench overlook just as the sun drops behind the Channel Islands. Bring a layer; we bring the local-history stories and a thermos of tea.",
    included: ["Guide", "Hot tea", "Trail snacks", "Photos"],
    host: { name: "Renata", avatar: avatar("renata"), superhost: false, since: "2023", responseRate: 92 },
    reviews: [
      rev("Pete", 5, "Apr 2026", "Cheap, gorgeous, and the tea at the top was a nice touch."),
      rev("Mia", 4, "Mar 2026", "Easy enough for my parents, beautiful for me."),
      rev("Devon", 5, "Mar 2026", "That overlook is unreal at sunset."),
    ],
    localFavorite: true,
    bestTime: "evening",
    indoor: false,
    goodForGroups: true,
    distanceMi: 2.0,
  },
  {
    id: "tea-ceremony",
    title: "Quiet Morning Tea Ceremony",
    category: "Wellness",
    tags: ["wellness", "calm", "morning", "indoor", "rainy", "solo"],
    neighborhood: "Downtown",
    lat: 34.4221,
    lng: -119.7026,
    price: 40,
    rating: 4.95,
    reviewCount: 97,
    durationMin: 75,
    images: ["1564890369478-c89ca6d9cde9", "1470337458703-46ad1756a187", "1545205597-3d9d02c29597"].map(U),
    blurb: "A slow, guided tea sitting to start the day unhurried.",
    description:
      "A guided gongfu tea ceremony in a tucked-away studio. Phones away, six steepings of a single oolong, and a short breathing practice. You'll leave calmer than almost anything else in this app can make you.",
    included: ["6 tea steepings", "Guided practice", "Tea to take home"],
    host: { name: "Lin", avatar: avatar("lin"), superhost: true, since: "2021", responseRate: 100 },
    reviews: [
      rev("Hana", 5, "Apr 2026", "I went alone on a rainy morning and it reset my whole week."),
      rev("Greg", 5, "Mar 2026", "Didn't think I'd like it. Booked again the next week."),
      rev("Sofia", 5, "Feb 2026", "So peaceful. The take-home tea is lovely."),
    ],
    localFavorite: false,
    bestTime: "morning",
    indoor: true,
    goodForGroups: false,
    distanceMi: 0.8,
  },
  {
    id: "rooftop-jazz",
    title: "Rooftop Jazz & Small Plates",
    category: "Nightlife",
    tags: ["nightlife", "date", "music", "evening", "social", "group"],
    neighborhood: "Downtown",
    lat: 34.4192,
    lng: -119.6995,
    price: 48,
    rating: 4.79,
    reviewCount: 165,
    durationMin: 150,
    images: ["1516450360452-9312f5e86fc7", "1511192336575-5a79af67a629", "1572116469696-31de0f17cc34"].map(U),
    blurb: "Live trio on a downtown rooftop with a reserved table and small plates.",
    description:
      "A reserved table on a downtown rooftop for a live jazz trio, with a rotating set of small plates and a welcome cocktail. The vibe is dressy-casual and the sightlines are great.",
    included: ["Reserved table", "Welcome cocktail", "Small plates", "Live set"],
    host: { name: "Marcus", avatar: avatar("marcus"), superhost: false, since: "2022", responseRate: 94 },
    reviews: [
      rev("Tara", 5, "Apr 2026", "Such a vibe. Great for a double date."),
      rev("Ivan", 4, "Mar 2026", "Band was excellent. Plates are small — order extra."),
      rev("Noor", 5, "Feb 2026", "The rooftop at golden hour is magic."),
    ],
    localFavorite: false,
    bestTime: "evening",
    indoor: false,
    goodForGroups: true,
    distanceMi: 0.9,
  },
  {
    id: "tidepool-walk",
    title: "Family Tidepool Discovery Walk",
    category: "Tours",
    tags: ["family", "outdoors", "morning", "nature", "cheap", "kids"],
    neighborhood: "Arroyo Burro Beach",
    lat: 34.4023,
    lng: -119.7423,
    price: 22,
    rating: 4.84,
    reviewCount: 132,
    durationMin: 90,
    images: ["1500375592092-40eb2168fd21", "1507525428034-b723cf961d3e", "1488646953014-85cb44e25828"].map(U),
    blurb: "A marine-biologist-led poke around the tidepools at low tide.",
    description:
      "Time it with the low tide and a marine biologist walks you through the tidepools — anemones, sea stars, hermit crabs — with plenty for kids to touch and a few stories for the adults.",
    included: ["Marine biologist guide", "ID cards", "Kid-friendly"],
    host: { name: "Dr. Alvarez", avatar: avatar("alvarez"), superhost: true, since: "2019", responseRate: 97 },
    reviews: [
      rev("The Kims", 5, "Apr 2026", "Our 7-year-old hasn't stopped talking about the sea stars."),
      rev("Brett", 5, "Mar 2026", "Educational without being boring. Great value."),
      rev("Lacey", 4, "Feb 2026", "Bring water shoes!"),
    ],
    localFavorite: false,
    bestTime: "morning",
    indoor: false,
    goodForGroups: true,
    distanceMi: 3.1,
  },
  {
    id: "speakeasy-cocktails",
    title: "Hidden Speakeasy Cocktail Lab",
    category: "Drink",
    tags: ["cocktails", "date", "nightlife", "evening", "splurge", "group"],
    neighborhood: "Downtown",
    lat: 34.4185,
    lng: -119.7008,
    price: 62,
    rating: 4.91,
    reviewCount: 143,
    durationMin: 120,
    images: ["1551024709-8f23befc6f87", "1514362545857-3bc16c4c7d1b", "1572116469696-31de0f17cc34"].map(U),
    blurb: "Find the unmarked door, then build three cocktails with the head bartender.",
    description:
      "Behind an unmarked door downtown, the head bartender walks your group through making three craft cocktails — shaking, stirring, and the why behind each. You drink your homework.",
    included: ["3 cocktails", "Hands-on lesson", "Recipe cards", "Bar snacks"],
    host: { name: "Sloane", avatar: avatar("sloane"), superhost: true, since: "2021", responseRate: 99 },
    reviews: [
      rev("Reggie", 5, "Apr 2026", "The unmarked-door thing is so fun. Sloane is a pro."),
      rev("Mei", 5, "Mar 2026", "Booked for 5, everyone loved it. Making these at home now."),
      rev("Cole", 4, "Feb 2026", "Strong pours, great stories."),
    ],
    localFavorite: true,
    bestTime: "evening",
    indoor: true,
    goodForGroups: true,
    distanceMi: 0.8,
  },
  {
    id: "farm-breakfast",
    title: "Foothill Farm Breakfast",
    category: "Eat",
    tags: ["foodie", "morning", "family", "nature", "group"],
    neighborhood: "Goleta Foothills",
    lat: 34.4631,
    lng: -119.8276,
    price: 44,
    rating: 4.89,
    reviewCount: 118,
    durationMin: 120,
    images: ["1504674900247-0877df9cc836", "1455619452474-d2be8b1e70cd", "1414235077428-338989a2e8c0"].map(U),
    blurb: "Gather eggs, then eat a long farm breakfast under the oaks.",
    description:
      "A morning on a working foothill farm: collect eggs, meet the goats, then sit down to a long family-style breakfast made from what's growing that week. Kids and groups welcome.",
    included: ["Farm tour", "Family-style breakfast", "Fresh coffee", "Kid activities"],
    host: { name: "Hank & Rosa", avatar: avatar("hankrosa"), superhost: true, since: "2018", responseRate: 96 },
    reviews: [
      rev("Janelle", 5, "Apr 2026", "The kids fed goats while we drank coffee. Heaven."),
      rev("Russ", 5, "Mar 2026", "Eggs minutes from the coop. You can taste it."),
      rev("Dot", 5, "Feb 2026", "Such warm hosts. Felt like family."),
    ],
    localFavorite: false,
    bestTime: "morning",
    indoor: false,
    goodForGroups: true,
    distanceMi: 8.4,
  },
  {
    id: "vinyasa-beach-yoga",
    title: "Beach Vinyasa at Golden Hour",
    category: "Wellness",
    tags: ["wellness", "active", "evening", "outdoors", "cheap", "social"],
    neighborhood: "Butterfly Beach",
    lat: 34.4189,
    lng: -119.6386,
    price: 24,
    rating: 4.87,
    reviewCount: 209,
    durationMin: 75,
    images: ["1545205597-3d9d02c29597", "1506126613408-eca07ce68773", "1507525428034-b723cf961d3e"].map(U),
    blurb: "Flow on the sand as the sun sets over Butterfly Beach.",
    description:
      "An all-levels vinyasa flow on Butterfly Beach timed to the sunset, ending with a short sound bath. Mats provided. Stay after to watch the light go.",
    included: ["Mat", "All-levels flow", "Sound bath", "Tea after"],
    host: { name: "Sage", avatar: avatar("sage"), superhost: false, since: "2022", responseRate: 93 },
    reviews: [
      rev("Quinn", 5, "Apr 2026", "Ending savasana as the sun set — chills."),
      rev("Bram", 4, "Mar 2026", "Bring a towel, sand gets everywhere, worth it."),
      rev("Indira", 5, "Mar 2026", "Affordable and genuinely beautiful."),
    ],
    localFavorite: true,
    bestTime: "evening",
    indoor: false,
    goodForGroups: true,
    distanceMi: 4.2,
  },
  {
    id: "old-mission-history",
    title: "Old Mission Stories Walking Tour",
    category: "Tours",
    tags: ["history", "afternoon", "family", "cheap", "culture"],
    neighborhood: "Mission Canyon",
    lat: 34.4383,
    lng: -119.7141,
    price: 26,
    rating: 4.8,
    reviewCount: 88,
    durationMin: 90,
    images: ["1488646953014-85cb44e25828", "1469854523086-cc02fe5d8800", "1551632811-561732d1e306"].map(U),
    blurb: "The real history behind the Queen of the Missions.",
    description:
      "A historian walks you around Old Mission Santa Barbara and its rose garden, telling the layered, honest history of the place — not just the postcard version.",
    included: ["Historian guide", "Garden walk", "Stories you won't find on plaques"],
    host: { name: "Professor Ortiz", avatar: avatar("ortiz"), superhost: false, since: "2020", responseRate: 90 },
    reviews: [
      rev("Hugh", 5, "Apr 2026", "Honest and fascinating. Not a sanitized tour."),
      rev("Mara", 4, "Mar 2026", "Loved the garden. Wear a hat."),
      rev("Sid", 5, "Jan 2026", "The professor really knows his stuff."),
    ],
    localFavorite: false,
    bestTime: "afternoon",
    indoor: false,
    goodForGroups: true,
    distanceMi: 2.6,
  },
  {
    id: "vinyl-listening-bar",
    title: "Vinyl Listening Bar & Natural Wine",
    category: "Nightlife",
    tags: ["nightlife", "date", "music", "evening", "wine", "chill"],
    neighborhood: "The Funk Zone",
    lat: 34.4131,
    lng: -119.6902,
    price: 38,
    rating: 4.83,
    reviewCount: 124,
    durationMin: 120,
    images: ["1511192336575-5a79af67a629", "1514933651103-005eec06c04b", "1510812431401-41d2bd2722f3"].map(U),
    blurb: "A reserved booth, a stack of records, and a flight of natural wine.",
    description:
      "A hi-fi listening bar where the music is the point. Your booth comes with a flight of natural wine and the night's record selection; the host takes requests from the crates.",
    included: ["Reserved booth", "Natural wine flight", "Record requests", "Snacks"],
    host: { name: "Dexter", avatar: avatar("dexter"), superhost: false, since: "2023", responseRate: 91 },
    reviews: [
      rev("Lou", 5, "Apr 2026", "Audiophile heaven. Low-key perfect date."),
      rev("Pam", 4, "Mar 2026", "Wine flight was interesting. Cozy spot."),
      rev("Yuki", 5, "Feb 2026", "They played my request off an actual record. Loved it."),
    ],
    localFavorite: false,
    bestTime: "evening",
    indoor: true,
    goodForGroups: true,
    distanceMi: 0.7,
  },
  {
    id: "surf-lesson",
    title: "First-Timer Surf Lesson",
    category: "Outdoors",
    tags: ["outdoors", "adventure", "morning", "active", "family", "group"],
    neighborhood: "Leadbetter Beach",
    lat: 34.4045,
    lng: -119.6986,
    price: 70,
    rating: 4.92,
    reviewCount: 187,
    durationMin: 120,
    images: ["1502082553048-f009c37129b9", "1507525428034-b723cf961d3e", "1500375592092-40eb2168fd21"].map(U),
    blurb: "Leadbetter's gentle break is the best place in SB to stand up your first time.",
    description:
      "Leadbetter Point has the friendliest beginner waves in town. A patient instructor gets you from sand to standing in two hours — gear, wetsuit, and photos included.",
    included: ["Surfboard", "Wetsuit", "Instructor (4:1)", "Action photos"],
    host: { name: "Brodie", avatar: avatar("brodie"), superhost: true, since: "2017", responseRate: 98 },
    reviews: [
      rev("Cam", 5, "Apr 2026", "Stood up on my third wave. Brodie is a great teacher."),
      rev("Els", 5, "Mar 2026", "Did it as a group of 4, all of us got up."),
      rev("Tin", 5, "Mar 2026", "The photos at the end are a great touch."),
    ],
    localFavorite: true,
    bestTime: "morning",
    indoor: false,
    goodForGroups: true,
    distanceMi: 1.0,
  },
  {
    id: "pasta-workshop",
    title: "Fresh Pasta Workshop & Dinner",
    category: "Classes",
    tags: ["foodie", "creative", "date", "rainy", "indoor", "evening", "group"],
    neighborhood: "Downtown",
    lat: 34.4205,
    lng: -119.7019,
    price: 68,
    rating: 4.94,
    reviewCount: 201,
    durationMin: 150,
    images: ["1556761223-4c4282c73f77", "1565299624946-b28f40a0ae38", "1504674900247-0877df9cc836"].map(U),
    blurb: "Roll, cut, and eat your own pasta with a glass of wine in hand.",
    description:
      "A hands-on evening making pasta from scratch — dough to plate — with a Bolognese-born chef. You eat what you make, family-style, with wine. The most-booked class on Groupee.",
    included: ["All ingredients", "Wine", "Dinner of what you make", "Recipe booklet"],
    host: { name: "Chef Lucia", avatar: avatar("lucia"), superhost: true, since: "2019", responseRate: 100 },
    reviews: [
      rev("Drew", 5, "Apr 2026", "Made tagliatelle from scratch and ate it with wine. 10/10."),
      rev("Fen", 5, "Mar 2026", "Perfect rainy-night group activity. Lucia is a gem."),
      rev("Ros", 5, "Mar 2026", "Booked for a team offsite, everyone loved it."),
    ],
    localFavorite: true,
    bestTime: "evening",
    indoor: true,
    goodForGroups: true,
    distanceMi: 0.8,
  },
  {
    id: "stargazing-summit",
    title: "Mountain Summit Stargazing",
    category: "Tours",
    tags: ["outdoors", "date", "night", "nature", "adventure"],
    neighborhood: "Camino Cielo",
    lat: 34.5113,
    lng: -119.7505,
    price: 50,
    rating: 4.9,
    reviewCount: 76,
    durationMin: 150,
    images: ["1469854523086-cc02fe5d8800", "1502082553048-f009c37129b9", "1488646953014-85cb44e25828"].map(U),
    blurb: "Above the marine layer with a telescope and an astronomer.",
    description:
      "Drive up above the city lights and the marine layer to a ridge where an astronomer sets up a real telescope. Planets, nebulae, and the kind of sky you forget exists. Blankets and cocoa included.",
    included: ["Telescope viewing", "Astronomer guide", "Blanket", "Hot cocoa"],
    host: { name: "Dr. Reyes", avatar: avatar("reyes"), superhost: true, since: "2020", responseRate: 97 },
    reviews: [
      rev("Vera", 5, "Apr 2026", "Saw Saturn's rings with my own eyes. Surreal."),
      rev("Nate", 5, "Mar 2026", "Cold but the cocoa and blankets sorted it. Magical date."),
      rev("Os", 4, "Feb 2026", "Bring a warm jacket! Worth it."),
    ],
    localFavorite: false,
    bestTime: "evening",
    indoor: false,
    goodForGroups: true,
    distanceMi: 11.2,
  },
  {
    id: "third-wave-coffee",
    title: "Third-Wave Coffee Cupping",
    category: "Drink",
    tags: ["coffee", "morning", "solo", "indoor", "rainy", "cheap", "chill"],
    neighborhood: "Eastside",
    lat: 34.4248,
    lng: -119.6862,
    price: 30,
    rating: 4.85,
    reviewCount: 110,
    durationMin: 75,
    images: ["1470337458703-46ad1756a187", "1564890369478-c89ca6d9cde9", "1455619452474-d2be8b1e70cd"].map(U),
    blurb: "Taste five single-origins side by side and learn to actually taste coffee.",
    description:
      "A roaster walks you through a proper cupping of five single-origin coffees — slurping included — so you finally understand what 'notes of stone fruit' means. You leave with a bag of your favorite.",
    included: ["5 coffees", "Cupping lesson", "Bag of beans to take home"],
    host: { name: "Tomas", avatar: avatar("tomas"), superhost: false, since: "2023", responseRate: 94 },
    reviews: [
      rev("Anya", 5, "Apr 2026", "I'll never drink coffee the same way. Great rainy-morning pick."),
      rev("Beck", 4, "Mar 2026", "Fun and caffeinated. Maybe too caffeinated."),
      rev("Cyrus", 5, "Feb 2026", "Tomas clearly loves this. Took home a great bag."),
    ],
    localFavorite: false,
    bestTime: "morning",
    indoor: true,
    goodForGroups: false,
    distanceMi: 1.2,
  },
];

export function getExperience(id: string): Experience | undefined {
  return EXPERIENCES.find((e) => e.id === id);
}

export function priceLabel(n: number): string {
  return `$${n}`;
}
