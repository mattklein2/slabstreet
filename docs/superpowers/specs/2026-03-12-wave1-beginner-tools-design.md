# Wave 1 — Beginner Collector Tools

**Date:** 2026-03-12
**Status:** Design
**Scope:** Parallel Decoder, Box Guide, Product Explainer + shared landing page

---

## Context

SlabStreet is pivoting from a Bloomberg-style card market dashboard to a collector education and tools platform. The mission: give a new or returning collector the information they need to make smart decisions — whether they're standing in a Walmart aisle or sitting at home.

Wave 1 delivers three beginner-focused tools built on top of an existing Supabase database containing 56 products, 650+ parallels, 185+ box configurations, and 220+ retailer mappings across NBA, NFL, MLB, and NHL.

This is a fresh build. The existing dashboard code remains in the repo but is not reused. New branch, new pages, new components.

---

## Design Principles

1. **Mobile-first, works on desktop** — the Walmart moment is on a phone
2. **Plain English always** — tiered: facts first, expandable "what does this mean?" for beginners
3. **Sport-agnostic** — nothing hardcoded to a sport, player, or product
4. **No live sales data** — all tools use static database content
5. **Auth-ready architecture** — tools work without login, but nothing prevents adding auth later (Supabase auth, user table, row-level security)
6. **Scalable** — every feature works for all sports and products from day one

---

## Visual Design

All colors accessed via `useTheme().colors` from the existing ThemeProvider. Reference values for dark mode:

- `colors.bg`: `#0a0f1a` (page background)
- `colors.surface`: `#111827` (cards, panels)
- `colors.border`: `#1e2a3a` (dividers, outlines)
- `colors.green`: `#00ff87` (accent, active states)
- `colors.text`: `#e8edf5` (primary text)
- `colors.secondary`: `#c8d3e0` (secondary text)
- `colors.muted`: `#556677` (labels, hints)
- `colors.red`: `#ff3b5c` (errors, sell)
- `colors.amber`: `#f59e0b` (warnings)
- `colors.purple`: `#a78bfa` (special/1-of-1)

Fonts: Bebas Neue (display), IBM Plex Sans (body), IBM Plex Mono (data/labels)
Border radius: 12–16px
Inline styles via ThemeProvider context (dark/light), not Tailwind classes for theme colors.

---

## Database Schema Reference

These tables already exist in Supabase and are populated. Column names use snake_case per Supabase convention.

### brands
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| name | TEXT | Panini, Topps, Upper Deck, Bowman, Leaf |

### products
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| brand_id | UUID | FK → brands |
| name | TEXT | e.g. "Prizm", "Optic", "Topps Chrome" |
| sport | TEXT | "NBA", "NFL", "MLB", "NHL" |
| year | TEXT | e.g. "2024-25", "2024", "2025" |
| description | TEXT | Product overview |
| release_date | DATE | nullable |
| is_flagship | BOOLEAN | true for Prizm, Topps Chrome, etc. |

### parallels
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| product_id | UUID | FK → products |
| name | TEXT | e.g. "Silver", "Green", "Gold" |
| color_hex | TEXT | e.g. "#22c55e" — for swatch display |
| print_run | INT | nullable — null means unlimited |
| serial_numbered | BOOLEAN | |
| rarity_rank | INT | 1 = least rare, ascending |
| is_one_of_one | BOOLEAN | |
| description | TEXT | e.g. "Shimmery silver refractor pattern" |
| special_attributes | TEXT[] | array of tags |

### box_configurations
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| product_id | UUID | FK → products |
| config_type | TEXT | "hobby_box", "blaster", "mega_box", "hanger", "fat_pack", "cello", etc. |
| retail_price_usd | NUMERIC | MSRP; for older products may be secondary market price |
| packs_per_box | INT | |
| cards_per_pack | INT | |
| guaranteed_hits | TEXT | nullable — e.g. "1 auto, 1 relic" |
| odds_auto | TEXT | nullable — hobby only; retail odds not published |
| odds_relic | TEXT | nullable |
| odds_numbered | TEXT | nullable |
| description | TEXT | |

### retailers
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| name | TEXT | "Walmart", "Target", "Amazon", "Fanatics", "Hobby Shop" |

### product_retailers
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| product_id | UUID | FK → products |
| retailer_id | UUID | FK → retailers |
| config_types | TEXT[] | which box types available at this retailer |
| notes | TEXT | nullable — e.g. "In-store and online" |

**Note:** `product_retailers.config_types` maps to `box_configurations.config_type` values. This is how we know which boxes are available at which stores.

---

## Schema Changes Required

### New columns

```sql
-- Product-level opinions (e.g. "Prizm has the best resale value")
ALTER TABLE products ADD COLUMN pros_cons JSONB;
-- Example: {"pros": ["Best resale value", "Huge parallel rainbow"], "cons": ["Expensive at hobby", "Base cards very common"]}

-- Box-config-level opinions (e.g. "Blasters are cheap but low odds")
ALTER TABLE box_configurations ADD COLUMN pros_cons JSONB;
-- Example: {"pros": ["Best value entry point", "Guaranteed auto"], "cons": ["Retail odds are low"]}
```

### New table

```sql
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,        -- 'product' | 'concept'
  summary TEXT NOT NULL,          -- 1-2 sentence preview for index cards
  body TEXT NOT NULL,             -- markdown content
  related_product_ids UUID[],     -- links to products table
  related_topic_slugs TEXT[],     -- links to other topics
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Architecture Overview

```
app/
  page.tsx                    # Landing page — 3 tool cards
  decoder/
    page.tsx                  # Parallel Decoder tool
  guide/
    page.tsx                  # Box Guide tool
  learn/
    page.tsx                  # Product Explainer — topic index
    [slug]/
      page.tsx                # Individual topic page
  api/
    decoder/
      products/route.ts       # GET products by sport
      parallels/route.ts      # GET parallels by product+year
    guide/
      recommend/route.ts      # GET boxes by sport+budget+store
    learn/
      topics/route.ts         # GET all topics
      topics/[slug]/route.ts  # GET single topic content
  components/
    shared/
      Header.tsx              # Minimal header — logo + back nav
      SportPicker.tsx         # Reusable sport selection grid
      ExpandableSection.tsx   # Tiered info — tap to expand
      RarityBadge.tsx         # Common/Uncommon/Rare/Ultra badges
    decoder/
      ProductGrid.tsx         # Product selection (2-col grid)
      ParallelList.tsx        # Color swatch parallel picker
      DecoderResult.tsx       # Result card with stats + expandables
    guide/
      BudgetPicker.tsx        # Budget range selector
      StorePicker.tsx         # Retail store selection
      BoxCard.tsx             # Individual box recommendation card
    learn/
      TopicCard.tsx           # Topic index entry
      TopicContent.tsx        # Full topic page renderer
lib/
  supabase.ts                 # Existing client (anon key) — sufficient for read-only public data
```

### Supabase Client

The existing `lib/supabase.ts` uses the anon key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`). This is sufficient for Wave 1 — all tables are public-read with no RLS. API routes use this client server-side. No service role key needed unless RLS is added later for auth.

### Data Flow

All three tools follow the same pattern:
1. Client component manages step state (sport, product, filters)
2. Each step change triggers a fetch to a dedicated API route
3. API route queries Supabase, returns shaped JSON
4. Client renders the result

### URL State & Deep Linking

Step state is stored in URL search params for shareability and browser back/forward support:
- Decoder: `/decoder?sport=NBA&product=prizm-2024&parallel=green`
- Guide: `/guide?sport=NBA&budget=25-50&store=walmart`

This lets users share a result link ("look what I pulled!") and use browser back to step through. React state syncs bidirectionally with `useSearchParams()`.

### Caching

API responses set `Cache-Control: public, max-age=3600` (1 hour). Product and parallel data rarely changes. Box configs and retailer data can be cached aggressively. Topics content cached for 24 hours.

### UI States

All tools implement three non-happy-path states:

- **Loading:** Skeleton loaders matching the shape of the expected content (not a spinner). Each step shows its own skeleton.
- **Error:** Centered message with "Something went wrong" + retry button. No technical details shown to user.
- **Empty:** Contextual message per tool:
  - Decoder products: "No products found for this sport yet — we're adding more."
  - Decoder parallels: "No parallel data for this product yet."
  - Guide results: "No boxes match your filters. Try a different budget or store." + reset button.
  - Guide with no-match parallel: Bottom of the parallel list includes "I don't see my card" link → shows help text explaining how to flip the card and check the back for set name/number.
  - Learn topics: "Topics coming soon."

---

## Tool 1: Parallel Decoder ("What Did I Pull?")

### User Flow

```
Sport → Product → Match Card (color swatches) → Result
```

**Step 1 — Sport:** 4 buttons (Basketball/NBA, Football/NFL, Baseball/MLB, Hockey/NHL). Full screen, big tap targets. Sport labels map to database `products.sport` values: `"NBA"`, `"NFL"`, `"MLB"`, `"NHL"`.

**Step 2 — Product:** 2-column grid of products for that sport. Flagship products get a star indicator. Shows product name + year. Products grouped by year (most recent first) with older years behind a "Show older products" toggle. Query filters by `products.sport`.

**Step 3 — Match Card:** Full parallel list for selected product, organized by rarity tier:
- Base & Common (rarity_rank in bottom 25% of total parallels)
- Retail Exclusives (description contains retail/store keywords, or non-serial-numbered mid-tier)
- Numbered Parallels (serial_numbered = true, print_run > 10)
- Ultra Rare (print_run <= 10 or is_one_of_one = true)

Each row shows:
- Color swatch (32x32px square from `parallels.color_hex`)
- Parallel name
- Short description from `parallels.description`
- Rarity badge

**"I don't see my card"** link at the bottom of the list → help text: "Flip your card over and look for the set name printed on the back. If you still can't find a match, this card may be from a product we haven't added yet."

User taps the one that matches their card.

**Step 4 — Result:** Tiered display:

*Always visible:*
- Large color swatch + parallel name
- Product name + year subtitle
- Stats grid: print run (or "Unlimited"), rarity rank (X of Y), serial numbered (Yes/No), hobby exclusive indicator
- Rarity bar — visual position marker on a Common→1/1 scale, calculated as `rarity_rank / total_parallels`

*Expandable:*
- "What does this mean?" — plain English explanation generated from the data: scarcity context based on print run, hobby-vs-retail availability, what serial numbering means
- "Full rarity hierarchy" — complete list of all parallels for this product with "YOU ARE HERE" marker on the selected one

### Rarity Badge Algorithm

Badges assigned based on position within the product's parallel set:

| Badge | Condition | Color |
|-------|-----------|-------|
| COMMON | `rarity_rank / total_parallels < 0.25` | gray (`colors.muted`) |
| UNCOMMON | `0.25 <= ratio < 0.55` | green (`colors.green`) |
| RARE | `0.55 <= ratio < 0.85` | amber (`colors.amber`) |
| ULTRA RARE | `ratio >= 0.85` and not 1/1 | red (`colors.red`) |
| 1/1 | `is_one_of_one = true` | purple (`colors.purple`) |

### API Routes

**GET /api/decoder/products?sport=NBA**
```sql
SELECT id, name, year, is_flagship, description
FROM products
WHERE sport = $sport
ORDER BY year DESC, is_flagship DESC, name ASC
```
Returns: `{ products: [{ id, name, year, isFlagship, description }] }`

**GET /api/decoder/parallels?productId=<uuid>**
```sql
SELECT id, name, color_hex, print_run, serial_numbered, rarity_rank,
       is_one_of_one, description, special_attributes,
       (SELECT COUNT(*) FROM parallels p2 WHERE p2.product_id = parallels.product_id) AS total_parallels
FROM parallels
WHERE product_id = $productId
ORDER BY rarity_rank ASC
```
Returns: `{ parallels: [...], totalParallels: number }`

### Navigation

- Step indicator dots at top (4 dots)
- Breadcrumb trail showing selections (NBA › Prizm 2024-25 › Green)
- Back button on each step
- Tapping a breadcrumb goes back to that step
- Browser back/forward works via URL search params

---

## Tool 2: Box Guide ("What Should I Buy?")

### User Flow

```
Sport → Budget → Store → Results (all matching boxes with pros/cons)
```

**Step 1 — Sport:** Same SportPicker component as Decoder.

**Step 2 — Budget:** Predefined ranges as buttons:
- Under $25 (retail packs, hangers, fat packs)
- $25–$50 (blasters, value boxes)
- $50–$100 (megas, hobby lite)
- $100–$250 (hobby boxes)
- $250+ (premium hobby, high-end)
- "Show me everything" (no filter)

**Step 3 — Store:** Where are you shopping?
- Walmart → matches `retailers.name = 'Walmart'`
- Target → matches `retailers.name = 'Target'`
- Amazon / Fanatics → matches `retailers.name IN ('Amazon', 'Fanatics')`
- Local Hobby Shop → matches `retailers.name = 'Hobby Shop'`
- Online (any) → matches all retailers
- "I don't know yet" → no retailer filter

**Step 4 — Results:** All matching boxes, sorted by flagship first, then price ascending.

Each box card shows:

*Always visible:*
- Product name + year
- Box type (human-readable: "Blaster Box", "Mega Box", "Hobby Box", etc.)
- Price — labeled "MSRP" for current products, "Market Price (approx)" for older products
- What's inside: X packs, Y cards per pack
- Guaranteed hits (if any) or "No guaranteed hits"
- Pros/Cons bullets merged from both `products.pros_cons` and `box_configurations.pros_cons`
- Flagship badge if applicable

*Expandable:*
- "What could I pull?" — lists parallel tiers available. Determined by cross-referencing: if the box config_type appears in any `product_retailers.config_types` for a retailer other than "Hobby Shop", it's retail-available; parallels whose description implies hobby-exclusive are flagged.
- "What does this mean?" — plain English on what this box type is (e.g. "A blaster box is the most common box at big retailers like Walmart and Target. They're usually $25-30 and contain 6 packs of cards.")

### Price Filtering

Budget filter maps to `box_configurations.retail_price_usd`:
```sql
WHERE retail_price_usd >= $budgetMin AND retail_price_usd <= $budgetMax
```
If `retail_price_usd` is NULL, the box is excluded from filtered results but included in "Show me everything."

### API Route

**GET /api/guide/recommend?sport=NBA&budgetMin=25&budgetMax=50&store=walmart**
```sql
SELECT
  p.id AS product_id, p.name, p.year, p.is_flagship, p.pros_cons AS product_pros_cons,
  bc.id AS config_id, bc.config_type, bc.retail_price_usd, bc.packs_per_box,
  bc.cards_per_pack, bc.guaranteed_hits, bc.odds_auto, bc.odds_relic,
  bc.odds_numbered, bc.description AS config_description, bc.pros_cons AS config_pros_cons,
  r.name AS retailer_name, pr.notes AS retailer_notes
FROM products p
JOIN box_configurations bc ON bc.product_id = p.id
JOIN product_retailers pr ON pr.product_id = p.id
  AND bc.config_type = ANY(pr.config_types)
JOIN retailers r ON r.id = pr.retailer_id
WHERE p.sport = $sport
  AND bc.retail_price_usd >= $budgetMin
  AND bc.retail_price_usd <= $budgetMax
  AND r.name = $store
ORDER BY p.is_flagship DESC, bc.retail_price_usd ASC
```

When `store` is "Online (any)" or "I don't know yet", the retailer JOIN and WHERE clause are omitted.

Returns:
```json
{
  "results": [
    {
      "product": { "id": "...", "name": "Prizm", "year": "2024-25", "isFlagship": true, "prosCons": {...} },
      "boxConfig": {
        "id": "...", "configType": "blaster", "retailPriceUsd": 29.99,
        "packsPerBox": 6, "cardsPerPack": 4, "guaranteedHits": null,
        "oddsAuto": null, "oddsRelic": null, "oddsNumbered": null,
        "description": "...", "prosCons": {...}
      },
      "retailer": { "name": "Walmart", "notes": "In-store and online" }
    }
  ]
}
```

---

## Tool 3: Product Explainer ("Learn the Hobby")

### Structure

**Index page (`/learn`):** Grid of topic cards, organized by category:

*Products:*
- Understanding Prizm
- Understanding Optic
- Understanding Select
- Prizm vs. Optic — What's the Difference?
- What is Chronicles? (compilation product explainer)
- Why doesn't this card have a team logo? (Leaf/Panini licensing)

*Concepts:*
- What is a Parallel?
- What is Serial Numbering?
- What is a Refractor?
- Hobby vs. Retail — What's the Difference?
- What is a Rookie Card?
- Understanding Card Grading (PSA, BGS, SGC)

**Topic page (`/learn/[slug]`):** Long-form content page with:
- Title + category label
- Body content (markdown rendered to HTML)
- Related parallels/products pulled from database where relevant
- "Related topics" links at bottom

### Content Strategy

Topic body content is written manually and stored as markdown in the `topics.body` column. Initial launch targets 6-8 high-value topics (the ones beginners ask most: parallels, Prizm, hobby vs retail, serial numbering, rookie cards, grading). Content authored as a batch during implementation and inserted via SQL seed script. Markdown supports headings, paragraphs, bold, lists — no images or tables for v1.

`related_product_ids` and `related_topic_slugs` are populated manually when inserting topic rows.

### API Routes

**GET /api/learn/topics**
```sql
SELECT slug, title, category, summary, sort_order
FROM topics
ORDER BY category ASC, sort_order ASC
```
Returns: `{ topics: [{ slug, title, category, summary, sortOrder }] }`

**GET /api/learn/topics/[slug]**
```sql
SELECT t.*,
  ARRAY(SELECT name FROM products WHERE id = ANY(t.related_product_ids)) AS related_product_names
FROM topics t
WHERE t.slug = $slug
```
Returns full topic with resolved related product names and related topic slugs.

---

## Landing Page

### Layout

Centered, full-screen, minimal.

```
[SLABSTREET logo — Bebas Neue, tracked]
[tagline — e.g. "Smart collecting starts here"]

[Card 1: What Did I Pull?]     → /decoder
[Card 2: What Should I Buy?]   → /guide
[Card 3: Learn the Hobby]      → /learn

[footer: slabstreet.io]
```

Three cards in a row on desktop, stacked on mobile. Each card has:
- Icon or illustration
- Tool name
- One-line description
- Click/tap to enter

No nav bar on the landing page. Each tool has its own minimal header with logo (links home) and back navigation.

---

## Shared Components

### Header
- Logo (SLABSTREET) left-aligned, links to `/`
- No nav links, no hamburger menu
- Minimal — just the logo and a back arrow when inside a tool

### SportPicker
- 4 sport buttons with emoji icons and league abbreviation
- Maps to: `{label: "Basketball", value: "NBA", icon: "🏀"}`, etc.
- WNBA and F1 intentionally excluded — no card products in the database for them
- Reused by Decoder and Box Guide
- Single-select, advances to next step on tap

### ExpandableSection
- Trigger text + arrow icon (▸/▾)
- Content hidden by default, toggles on tap
- Used for "What does this mean?" and "Full hierarchy" in both Decoder and Guide

### RarityBadge
- Pill badge with rarity-specific colors (see algorithm in Tool 1 section)
- Driven by `rarity_rank` relative to `total_parallels` for the product

---

## Future Considerations (not in this build)

### Auth Layer
- Supabase auth (email/password, Google, Apple)
- User profiles table
- Row-level security on user-specific data
- Free tools remain accessible without login
- Premium tools gated by which tools they can access (not depth limits)
- Architecture: auth wraps the app at layout level, tools check auth state but work without it

### Rare Card Pull Tracker
- Monitor eBay listings (not sales) for 1/1s and ultra-rare numbered cards
- Monitor select Twitter/X accounts for pull announcements
- Store in a `rare_pulls` table with card details, source, timestamp
- Feed into Box Guide as context ("the 1/1 Wemby has been pulled")
- Separate from Wave 1 — Wave 2 or 3

### Wave 2 Tools
- Grade Calculator — cost of grading vs. value difference by grade
- Box ROI Calculator — expected value breakdown
- Pop Report Lookup — PSA population context

### Wave 3 Tools
- Prospect Scouter — advanced metrics to identify undervalued players
- Catalyst Look-Ahead — upcoming events that could move card prices
- Sales History (limited scope, not 15k players) — small-scale transaction tracking

---

## Data Gaps & Known Issues

| Gap | Mitigation |
|-----|-----------|
| Retail odds fields empty across all products | Box Guide shows "Odds not published for retail" for retail configs. Hobby odds display normally. |
| No explainer copy exists yet | `topics` table content written during implementation. Start with 6-8 high-value topics. |
| Past-year box pricing is secondary market, not MSRP | Label as "Market Price (approx)" not "Retail Price" for older products |
| Missing products (Topps Finest, Gypsy Queen, etc.) | Ship with what exists (56 products). Add more over time. |
| No card images | Color swatches from `color_hex` for v1. Card photos are a future enhancement. |
| Some parallel print runs unverified | Show print run as-is; no "approximate" flag needed for v1 since data was manually curated |
| Parallel availability (hobby vs retail) not explicitly modeled | Infer from `product_retailers.config_types` — if a parallel's product has retail configs, it may appear in retail. Hobby-exclusive parallels noted in `parallels.description`. Explicit `available_in` column is a future enhancement. |
