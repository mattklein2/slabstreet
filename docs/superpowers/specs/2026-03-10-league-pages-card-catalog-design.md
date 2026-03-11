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
- F1: `#e11d48` (rose/crimson — differentiated from MLB red)
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
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_cards_player ON cards(player_slug);
CREATE INDEX idx_cards_league ON cards(league);
CREATE INDEX idx_cards_search ON cards(player_slug, year, set_name);
CREATE INDEX idx_cards_slug ON cards(slug);
```

**Slug generation:** `{player_slug}-{year}-{set_name}-{parallel}-{card_number}`, lowercased and hyphenated. On collision (same slug), append `-{n}` suffix (e.g., `-2`). The `league` column is denormalized from `players.league` for query performance — it is set once at card creation and not updated.

### New `card_sales` Table

```sql
CREATE TABLE card_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES cards(id),
  price NUMERIC(10,2) NOT NULL,
  grade TEXT,
  grader TEXT,
  grade_number NUMERIC(4,1),
  sold_date TIMESTAMPTZ NOT NULL,
  platform TEXT DEFAULT 'eBay',
  listing_url TEXT UNIQUE,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_card_sales_card ON card_sales(card_id);
CREATE INDEX idx_card_sales_date ON card_sales(sold_date);
CREATE INDEX idx_card_sales_grade ON card_sales(card_id, grade);
```

The `listing_url` UNIQUE constraint prevents duplicate imports from re-running scrapers.

### Data Relationships
- `players` 1→N `cards` (via player_slug)
- `cards` 1→N `card_sales` (via card_id)

### Population Strategy
1. CardLadder scraper seeds `cards` table (already has year, set, parallel, image data per card)
2. eBay scraper writes to `card_sales` instead of `ebay_sales`
3. Title parsing (`parse-card-title.mjs`) maps raw eBay titles → card records
4. New cards auto-created when sale scraped for unrecognized card

### Card Matching Pipeline (eBay title → card record)
When processing an eBay sale:
1. Parse title with `parse-card-title.mjs` to extract: player name, year, set, parallel, card number, grade
2. Look up `player_slug` by matching parsed player name against `players.name` (ILIKE)
3. Query `cards` table for match on `(player_slug, year, set_name, parallel)`
4. If exact match found → create `card_sales` row linked to that card
5. If no match → auto-create a new `cards` row with parsed data, then create the sale
6. If player not found → skip (log for manual review)

This is best-effort matching. Over time, CardLadder data provides the canonical card catalog, and eBay sales get matched against it. Imperfect matches are acceptable at this stage — the catalog improves as more data flows in.

## 4. Card Search

### Search Implementation
Card search uses Postgres `ILIKE` on a concatenated search column or multiple `ILIKE` conditions against `player name`, `year::text`, `set_name`, `parallel`. For autocomplete performance, limit to 8 results with `ORDER BY` on sales volume or recency. If performance degrades at scale, add `pg_trgm` extension with GIN index. Full-text search (`tsvector`) is a future optimization, not needed at launch.

### Autocomplete (NavSearch Enhancement)
- Triggered on typing in nav search bar
- Queries `cards` table joined with `players.name`, filtered by ILIKE on search terms
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

### App Router File Structure
League pages use a dynamic route: `app/[league]/page.tsx` with a shared `LeaguePage` component. The `[league]` param is validated against known league IDs. F1's unique widgets are conditionally rendered within the same component based on `league === 'F1'`. No separate directories per league.

### Existing `/odds/[league]` Route
- Redirect to `/{league}` (e.g., `/odds/nba` → `/nba`). Championship futures and award odds are absorbed into the league page. Game-level odds (h2h, spreads, totals) remain accessible via the scores sidebar game links.

### Existing `ebay_sales` Table
- Data migrated into `card_sales` via title parsing
- Old table kept temporarily for backward compat, then deprecated

### Existing LeagueProvider
- Still used within league pages for widget data fetching convenience
- League pages set `activeLeague` on mount based on route param
- `/` page sets to 'ALL' as before

### Active Listings API
The card detail page needs eBay listings for a specific card. Add a new API route `/api/ebay/listings?card_id=...` that constructs an eBay Browse API query from the card's `year + set_name + parallel + player name` to fetch current listings. This is distinct from the existing `/api/ebay` which searches by player name only.

### Responsive Behavior
On mobile (< 1024px), the sidebar collapses below the main stream content. Scores become a horizontal scrollable strip at the top. Odds and standings move into collapsible sections. Follows the existing pattern in the current homepage with `lg:` breakpoints.

### Grade Distribution Data
PSA pop data is fetched from the existing `/api/psa` endpoint, filtered to match the specific card's year/set/parallel. If the PSA API does not support card-level granularity, show player-level pop data as a fallback with a note.

## 7. Non-Goals (for this phase)

- User accounts / saved preferences
- Real-time WebSocket price updates
- Mobile-native app
- Payment / subscription features
- Complete eBay sales backfill (start with what scrapers capture going forward)
