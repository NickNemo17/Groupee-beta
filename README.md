# Groupee 🌿

**A modern reinvention of Groupon.** Discovery-first, experience-first, and social — with honest all-in pricing instead of a race-to-the-bottom coupon feed. Recognizably in the Groupon ecosystem (the green), but a completely new feel.

> Beta prototype · Next.js 16 · React 19 · Tailwind v4 · MapLibre · mobile phone-framed

---

## Why

Groupon's decline is well documented (Wharton's *"Death of the Daily Deal"*, the Posies Cafe / TechCrunch merchant story, Rajiv Sethi & others on Substack). The root cause is consistent: **deep one-off discounting is self-terminating.** It attracts bargain-hunters who never return, compresses merchant margins below cost, trains your best customers to wait for coupons, damages merchant ratings, and rots into a "junk drawer of expiring coupons + spam email."

**Groupee inverts that thesis.** Imagery leads, price is quiet and honest (all-in, no fake "value" anchors), trust is built into the layout, and three differentiators sit on top of plain discovery:

1. **AI concierge** — "find me something tonight," context-aware (time of day), answering with visual cards and a *why you're seeing this* reason — not a wall of text.
2. **Groups** — invite friends, swipe to vote, the winner auto-commits to a shared plan, and costs split in-app.
3. **Maps** — a modern map with price-pin markers and a synced card carousel.

No current app closes the full loop *concierge → group vote → committed plan → split cost*. That whitespace is the beta's reason to exist.

## Screens

| Explore | Map | Experience |
|---|---|---|
| ![Explore](docs/screenshots/explore.png) | ![Map](docs/screenshots/map.png) | ![Detail](docs/screenshots/detail.png) |

| AI Concierge | Group voting | Split the cost |
|---|---|---|
| ![Concierge](docs/screenshots/concierge.png) | ![Group voting](docs/screenshots/group-vote.png) | ![Split](docs/screenshots/group-split.png) |

## Features

- **Explore** — search-first home, category pills, photo-first cards, list ⇄ map toggle.
- **Map** — MapLibre + CARTO Positron basemap, price-pill markers, active-pin highlight, card carousel.
- **Experience detail** — hero gallery, oversized rating, host card, what's-included, reviews, neighborhood map, and a sticky book bar.
- **Booking** — atomic date/time slot selection (no "paid but can't book"), color-coded refund policy shown *before* you reserve ("refunded to your card, not credit"), and one-tap support on the confirmation.
- **AI concierge** — context-aware proactive opener; parses intent + budget ("cheap + nightlife under $50"); replies as cards with reasoning. Backed by the live Claude API when an API key is present, with a deterministic local fallback otherwise.
- **Groups** — 4-letter invite code, Tinder-style voting (hidden until everyone's done), winner → one-tap committed plan, Splitwise-style split with vote-on-expense.
- **Trips** — time-ordered upcoming plans, solo and group.
- **Profile** — taste onboarding (seeds the feed + concierge), wishlists, Groupee+ membership (the non-discount monetization story), and per-category notification controls (the anti-spam answer).

## Anti-Groupon, by design

| Groupon pain point | Groupee's answer |
|---|---|
| Race-to-the-bottom discounts | Curated, quality-first experiences; honest all-in pricing |
| Bargain-hunters who never return | "Come back & save" loyalty nudge, not one-and-done |
| Refund entrapment (store credit, 3-day window) | Color-coded policy up front; refunds to your original card |
| Buried customer support | "Need help? — replies in ~2 min" on every confirmation |
| 235 spam emails a month | Per-category notification cadence (daily / weekly / off) |
| Inflated "$2,392 value" anchors | No fake anchors — just the real, all-in price |

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** (CSS-based theming)
- **MapLibre GL** with CARTO Positron raster tiles (no API key required)
- Client-side state via React context, persisted to `localStorage`
- Mobile-first, rendered inside a phone frame on desktop

## Run it

```bash
npm install
npm run dev
# open http://localhost:3000  (narrow the window or use device mode for the phone frame)
```

### Optional: live AI concierge

The concierge works out of the box with a deterministic local engine. To use the **live Claude API**, add a key:

```bash
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.local
npm run dev
```

Without a key it transparently falls back to the local engine, so the app always works.

## Project structure

```
app/
  page.tsx                 Explore (list + map)
  experience/[id]/         Experience detail + booking
  concierge/               AI concierge
  groups/  groups/[id]/    Group create → vote → commit → split
  trips/   profile/        Trips, taste onboarding, membership, settings
  api/concierge/           Claude API route (optional)
components/                ExperienceCard, MapView, BookingSheet, SwipeDeck, SplitPanel, …
lib/
  data.ts                  ~18 Santa Barbara experiences (mock)
  concierge.ts             local concierge engine (Claude-swappable)
  store.tsx                wishlists, groups, votes, trips
```

---

*Beta — built as a design exploration. Mock data; no real payments or merchant integrations.*
