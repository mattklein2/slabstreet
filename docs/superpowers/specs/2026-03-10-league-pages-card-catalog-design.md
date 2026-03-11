# League Pages & Card Catalog Design

**Date:** 2026-03-10
**Status:** Approved

## Overview

Transform SlabStreet from a single-page dashboard with a league filter into a multi-page platform with dedicated league pages and a thorough card search/sales engine. This is two interconnected systems: league-specific pages for browsing/discovery, and a card catalog for precision lookups.

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Landing experience | Prominent tab bar (enhanced current) | Users see content immediately, no extra click |
| League color accents | Subtle accent only | League color on tabs, widget borders, labels. Core UI unchanged |
| League page layout | Sidebar + stream | Scores/odds sticky while content scrolls |
| Card grade display | Multi-line chart per card | One line per grade (PSA 10, PSA 9, etc.) — spread is the signal |
| Card search UX | Autocomplete + search results page | Power users get instant lookup, browsers get filterable grid |
| Card detail page | Product page feel | Card image prominent, not just numbers |
| Odds placement | On league page, not separate | Kill /odds/[league], absorb into league page |
| Default theme | Light mode | Dark available via toggle |

## 1. Navigation & League Routing

### Routes
- `/` — "ALL" tab, firehose view (current homepage, mostly unchanged)
- `/nba` — NBA league page
- `/nfl` — NFL league page
- `/mlb` — MLB league page
- `/nhl` — NHL league page
- `/f1` — F1 league page
- `/wnba` — WNBA league page
- `/search?q=...` — Card search results
- `/cards/[slug]` — Card detail page

### League Tabs
- Hero-sized in nav area, bigger/bolder than current
- Each tab is a `<Link>` to real route, not a context filter
- Active tab gets league accent color as underline/highlight
- LeagueProvider still used within league pages for widget data fetching

### League Accent Colors
- NBA: `#1d4ed8` (blue)
- NFL: `#16a34a` (green)
- MLB: `#dc2626` (red)
- NHL: `#0f172a` (dark navy)
- F1: `#dc2626` (red)
- WNBA: `#f97316` (orange)
- ALL: `#00ff87` (slab green)

### Accent Application
- Active tab highlight/underline
- Widget header border (top or left line)
- Section label text color
- Core UI stays consistent (green/red for signals, dark surfaces, same fonts)

## 2. League Page Layout

### Structure: Sidebar + Stream

**Sticky Left Sidebar (~300px):**
- Scores — today's games with live scores, calendar picker
- Championship Odds — top 5 teams, compact
- Standings / Playoff Picture — conference standings, playoff seed line highlighted

**Main Content Stream (scrollable):**
1. Market Movers — top risers/fallers for that league
2. Odds & Futures — championship + awards (MVP, DPOY, ROY), with card market context (show price trend next to odds movement)
3. Recent Sales — latest eBay card sales for that league, with card images
4. News — league-specific sports news with AI blurbs
5. Trade Signals — buy/sell/hold recommendations

### F1 Unique Treatment
- Sidebar: Race calendar, driver standings, constructor standings (no game scores)
- Stream: Race results, qualifying results, driver card market data (no "movers" widget)

### ALL Page (`/`)
- Keeps current homepage layout largely as-is
- League tabs at top link to dedicated pages
- This is the firehose for power users tracking across leagues

## 3. Card Catalog Data Model

### New `cards` Table

```sql
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_slug TEXT NOT NULL REFERENCES players(slug),
  year INT NOT NULL,
  set_name TEXT NOT NULL,
  parallel TEXT NOT NULL DEFAULT 'Base',
  card_number TEXT,
  numbered_to INT,
  league TEXT NOT NULL,
  image_url TEXT,
  cardladder_slug TEXT,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_cards_player ON cards(player_slug);
CREATE INDEX idx_cards_league ON cards(league);
CREATE INDEX idx_cards_search ON cards(player_slug, year, set_name);
CREATE INDEX idx_cards_slug ON cards(slug);
```

**Slug format:** `luka-doncic-2018-prizm-silver-280`

### New `card_sales` Table

```sql
CREATE TABLE card_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES cards(id),
  price FLOAT NOT NULL,
  grade TEXT,
  grader TEXT,
  grade_number FLOAT,
  sold_date TIMESTAMPTZ NOT NULL,
  platform TEXT DEFAULT 'eBay',
  listing_url TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_card_sales_card ON card_sales(card_id);
CREATE INDEX idx_card_sales_date ON card_sales(sold_date);
CREATE INDEX idx_card_sales_grade ON card_sales(card_id, grade);
```

### Data Relationships
- `players` 1→N `cards` (via player_slug)
- `cards` 1→N `card_sales` (via card_id)

### Population Strategy
1. CardLadder scraper seeds `cards` table (already has year, set, parallel, image data)
2. eBay scraper writes to `card_sales` instead of `ebay_sales`
3. Title parsing (`parse-card-title.mjs`) maps raw eBay titles → card records
4. New cards auto-created when sale scraped for unrecognized card

## 4. Card Search

### Autocomplete (NavSearch Enhancement)
- Triggered on typing in nav search bar
- Queries `cards` table with text search on player name + year + set_name + parallel
- Shows top 8 results, grouped by player name
- Each result: card image thumbnail, "2018 Prizm Silver #280", last sale price
- "See all results →" at bottom links to search results page
- Existing player search coexists — autocomplete shows both players and cards

### Search Results Page (`/search?q=...`)
- Grid of matching card tiles with images
- Filters: Year, Set, League, Parallel, Grade
- Sort by: Recent sale price, Volume, Name
- Each tile: card image, name, last sale price, sparkline trend, grade badges

## 5. Card Detail Page (`/cards/[slug]`)

### Layout — Product Page Feel

**Top section (two columns):**
- Left: Large card image (from CardLadder), card identity (Player, Year, Set, Parallel, Card #, /numbered)
- Right: Market summary stats (avg price, median, high/low, 30d volume, trend direction)

**Price Chart (full width):**
- Multi-line by grade: PSA 10, PSA 9, BGS 9.5, Raw — each as separate colored line
- Time range toggles: 7d, 30d, 90d, 1y, All

**Recent Sales Table:**
- Columns: Date, Grade, Price, Platform, Link
- Sortable and filterable by grade

**Active Listings:**
- Current eBay listings from Browse API
- With images and prices

**Grade Distribution:**
- PSA pop report visualization — bar chart of 10s, 9s, 8s etc.

**Related Cards:**
- Other parallels of same base card: "Base ($20), Gold /10 ($5k), Mojo ($800)"

**Player Link:**
- Back to `/players/[slug]` for full Slab Score, signals, news

## 6. Migration & Compatibility

### Existing `/odds/[league]` Route
- Absorbed into league page Odds & Futures widget
- Route can redirect to `/nba#odds` etc. or be removed

### Existing `ebay_sales` Table
- Data migrated into `card_sales` via title parsing
- Old table kept temporarily for backward compat, then deprecated

### Existing LeagueProvider
- Still used within league pages for widget data fetching convenience
- League pages set `activeLeague` on mount based on route param
- `/` page sets to 'ALL' as before

## 7. Non-Goals (for this phase)

- User accounts / saved preferences
- Real-time WebSocket price updates
- Mobile-native app
- Payment / subscription features
- Complete eBay sales backfill (start with what scrapers capture going forward)
