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

## Supply side — Partner Studio (`/merchant`)

The harder half of any local marketplace is **supply density**, not consumer demand. Partner Studio is the merchant-acquisition console: an agent fleet that sources local businesses, qualifies them, and pitches them **fairly** — the opposite of Groupon's race-to-the-bottom. (Open `http://localhost:3000/merchant` — it's a full-width desktop tool, not the phone frame.)

| Pipeline | Reasoned proposal | Consent-gated voice call |
|---|---|---|
| ![Pipeline](docs/screenshots/merchant-pipeline.png) | ![Proposal](docs/screenshots/merchant-proposal.png) | ![Call](docs/screenshots/merchant-call.png) |

The workflow, end to end:

1. **Supply graph** — a nightly-refreshed map of every local merchant with a structured deal, assembled from Google Business, Yelp, Instagram/TikTok, menu PDFs, OpenTable/Resy, sites, and Reddit (simulated here).
2. **Qualification** — each prospect scored on off-peak upside, review velocity, margin headroom, and quality.
3. **Reasoned proposal ("make it even")** — generated **live by Claude**, leading with honest unit economics: a low ~10% commission (vs Groupon's ~50%), a hard redemption cap so it *fills* off-peak instead of cannibalizing peak, the merchant keeps every customer's contact for repeat visits, plus a "bring three friends, first round on the house" group offer. The math is computed in code (always correct); Claude writes the personalized narrative.
4. **Outreach email** — merchant-specific, behind a human **Approve & send** gate (CAN-SPAM: opt-out included).
5. **Voice call** — **consent-gated** (TCPA): the agent only dials after consent is logged, then delivers the pitch as an **audible ElevenLabs voice** (transcript-only without a key).
6. **Pipeline + CRM** — Attio-style board tracks each prospect Discovered → … → Onboarded.

**Vertical archetypes — the mechanic matches the inventory.** The agent doesn't ship one-size "30% off." Each category maps to one of three mechanics: **A** off-peak % fill (restaurants, social-entertainment, golf foursomes, tours), **B** access / value-add — *never* a public discount — for status inventory (nightclub tables, hotels), and **C** intro → regular for high-LTV services (beauty, fitness, recovery), where the win is the rebook, not the coupon. Economics adapt accordingly (discount vs. comped value-add vs. intro + lifetime value).

**Value Score — the StubHub move, away from coupons.** Every prospect gets two independent scores: a *merchant fit* score (worth acquiring?) and a *consumer Value Score* (is the deal actually good enough to show users?). A desperate, mediocre spot can pass merchant-fit but **fails the value floor** — so it never reaches the feed. Only deals scoring ≥ 72 are publishable; below that the agent must tune the offer or pass. On the consumer side this surfaces as a **"Great value" badge** on every listing — the feed is curated value, not a coupon dump.

**Real stack this stands in for:** Google Places/Foursquare + Clay (sourcing/enrichment) → Attio (CRM; note CRM ≠ ERP) → Instantly/Smartlead (email, warmup + SPF/DKIM/DMARC) → ElevenLabs Agents + Twilio (voice, consent-gated). The in-app version simulates sourcing + CRM and uses the real Claude and ElevenLabs APIs.

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

### Optional keys (everything works without them)

Copy `.env.example` to `.env.local` and fill in what you have:

```bash
cp .env.example .env.local
# ANTHROPIC_API_KEY  — live Claude for the consumer concierge AND merchant proposals/emails
# ELEVENLABS_API_KEY — makes the merchant voice-agent pitch audible at /merchant
```

With no keys, the concierge and merchant pitches fall back to a deterministic local engine and the voice call shows a transcript only — the app always runs.

## Project structure

```
app/
  page.tsx                 Explore (list + map)
  experience/[id]/         Experience detail + booking
  concierge/               AI concierge
  groups/  groups/[id]/    Group create → vote → commit → split
  trips/   profile/        Trips, taste onboarding, membership, settings
  merchant/                Supply-side Partner Studio (desktop): pipeline, supply graph,
                           compliance, and the per-prospect agent workspace ([id])
  api/concierge/           Claude API route — consumer concierge (optional key)
  api/merchant-pitch/      Claude API route — merchant proposal + email (optional key)
  api/voice/               ElevenLabs TTS proxy for the voice call (optional key)
components/                ExperienceCard, MapView, … + merchant/ (PipelineBoard, ScoreMeter,
                           EconomicsTable, EmailPreview, CallPanel, …)
lib/
  data.ts                  ~18 Santa Barbara experiences (mock, onboarded)
  concierge.ts             local concierge engine (Claude-swappable)
  store.tsx                wishlists, groups, votes, trips
  merchants.ts             ~12 prospect merchants — the simulated supply graph
  pitch.ts                 "make it even" economics engine + template fallback
  merchantStore.tsx        pipeline stage / consent / generated artifacts
```

---

*Beta — built as a design exploration. Mock marketplace data and no real payments or live dialing; the Claude (proposals/concierge) and ElevenLabs (voice) integrations are real when keys are provided.*
