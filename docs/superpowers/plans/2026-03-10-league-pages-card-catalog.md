# League Pages & Card Catalog Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform SlabStreet into a multi-page platform with dedicated league pages, league-specific color accents, and a thorough card search/sales engine with per-card detail pages.

**Architecture:** League pages use a single dynamic route `app/[league]/page.tsx` with sidebar+stream layout. Card catalog uses two new Supabase tables (`cards`, `card_sales`) populated from CardLadder and eBay scrapers. Card search enhances the existing NavSearch with autocomplete, plus a new search results page. Card detail pages live at `/cards/[slug]`.

**Tech Stack:** Next.js 16 (App Router), React 19, Supabase, Tailwind CSS v4, eBay Browse API, CardLadder Firestore API

**Spec:** `docs/superpowers/specs/2026-03-10-league-pages-card-catalog-design.md`

---

## Chunk 1: Database Schema & League Config

### Task 1: Add accent colors to league config

**Files:**
- Modify: `lib/leagues.ts`

- [ ] **Step 1: Add `accentColor` to LeagueConfig interface and all league entries**

In `lib/leagues.ts`, add `accentColor: string` to the `LeagueConfig` interface, then add the color value to each league object:

```typescript
// Add to LeagueConfig interface:
accentColor: string;

// Add to each league config object:
// NBA: accentColor: '#1d4ed8'
// NFL: accentColor: '#16a34a'
// MLB: accentColor: '#dc2626'
// NHL: accentColor: '#0f172a'
// F1:  accentColor: '#e11d48'
// WNBA: accentColor: '#f97316'
```

Also add a constant for the ALL accent:

```typescript
export const ALL_ACCENT_COLOR = '#00ff87';
```

- [ ] **Step 2: Verify build passes**

Run: `npm run build`
Expected: Build succeeds with no type errors

- [ ] **Step 3: Commit**

```bash
git add lib/leagues.ts
git commit -m "feat: add accent colors to league config"
```

---

### Task 2: Create `cards` table in Supabase

**Files:**
- Create: `scripts/migrations/001-create-cards-table.sql`
- Create: `scripts/run-migration.mjs`

- [ ] **Step 1: Write the migration SQL**

Create `scripts/migrations/001-create-cards-table.sql`:

```sql
CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_slug TEXT NOT NULL,
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

CREATE INDEX IF NOT EXISTS idx_cards_player ON cards(player_slug);
CREATE INDEX IF NOT EXISTS idx_cards_league ON cards(league);
CREATE INDEX IF NOT EXISTS idx_cards_search ON cards(player_slug, year, set_name);
CREATE INDEX IF NOT EXISTS idx_cards_slug ON cards(slug);
```

- [ ] **Step 2: Run migration via Supabase Dashboard**

The primary way to run DDL migrations is through the **Supabase Dashboard SQL Editor** (supabase.com → project → SQL Editor). Copy and paste the SQL from the migration file and execute. The migration runner script is optional — create it only if you want automation later.

Alternatively, create `scripts/run-migration.mjs` that reads and prints the SQL for copy-paste convenience:

```javascript
import { readFileSync } from 'fs';
import { resolve } from 'path';
const file = process.argv[2];
if (!file) { console.error('Usage: node scripts/run-migration.mjs <file.sql>'); process.exit(1); }
console.log(readFileSync(resolve(file), 'utf-8'));
```

- [ ] **Step 3: Run the migration**

Run: `node scripts/run-migration.mjs scripts/migrations/001-create-cards-table.sql`
Or: Copy SQL to Supabase dashboard and execute.
Expected: Table `cards` created with all indexes.

- [ ] **Step 4: Commit**

```bash
git add scripts/migrations/001-create-cards-table.sql scripts/run-migration.mjs
git commit -m "feat: create cards table migration"
```

---

### Task 3: Create `card_sales` table in Supabase

**Files:**
- Create: `scripts/migrations/002-create-card-sales-table.sql`

- [ ] **Step 1: Write the migration SQL**

```sql
CREATE TABLE IF NOT EXISTS card_sales (
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

CREATE INDEX IF NOT EXISTS idx_card_sales_card ON card_sales(card_id);
CREATE INDEX IF NOT EXISTS idx_card_sales_date ON card_sales(sold_date);
CREATE INDEX IF NOT EXISTS idx_card_sales_grade ON card_sales(card_id, grade);
```

- [ ] **Step 2: Run the migration**

Same as Task 2 — run via script or Supabase dashboard.

- [ ] **Step 3: Commit**

```bash
git add scripts/migrations/002-create-card-sales-table.sql
git commit -m "feat: create card_sales table migration"
```

---

### Task 4: Seed `cards` table from CardLadder data

**Files:**
- Create: `scripts/seed-cards-from-cardladder.mjs`
- Create: `scripts/lib/card-slug.mjs`

- [ ] **Step 1: Create slug generation utility**

Create `scripts/lib/card-slug.mjs`:

```javascript
/**
 * Generate a URL-safe slug for a card.
 * Format: {playerSlug}-{year}-{setName}-{parallel}-{cardNumber}
 * Example: luka-doncic-2018-prizm-silver-280
 */
export function generateCardSlug(playerSlug, year, setName, parallel, cardNumber) {
  const parts = [playerSlug, String(year)];
  if (setName) parts.push(slugify(setName));
  if (parallel && parallel !== 'Base') parts.push(slugify(parallel));
  if (cardNumber) parts.push(cardNumber.replace(/^#/, ''));
  return parts.join('-');
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
```

- [ ] **Step 2: Create seeder script**

Create `scripts/seed-cards-from-cardladder.mjs`:

- Query all players from Supabase where `cardladder` JSONB is not null
- For each player, iterate `cardladder.cards[]`
- For each card: extract `year`, `set` (→ `set_name`), `parallel` (→ defaults to 'Base' if empty), `cardNumber`, `image`
- Generate slug using `generateCardSlug()`
- Upsert into `cards` table (on conflict on `slug`, update `image_url` and `updated_at`)
- Log progress: "Seeded N cards for PlayerName"

Key mapping from CardLadder card shape:
```javascript
{
  player_slug: player.slug,
  year: card.year,              // already an int from CardLadder
  set_name: card.set,           // e.g., "Prizm"
  parallel: card.parallel || 'Base',  // e.g., "Silver", from c.variation
  card_number: card.cardNumber, // e.g., "280"
  numbered_to: card.numbered || null,  // e.g., 25 for /25 cards
  league: player.league,
  image_url: card.image,
  cardladder_slug: card.slug,
  slug: generateCardSlug(player.slug, card.year, card.set, card.parallel, card.cardNumber)
}
```

- [ ] **Step 3: Run the seeder**

Run: `node scripts/seed-cards-from-cardladder.mjs`
Expected: Cards inserted into `cards` table. Log shows count per player.

- [ ] **Step 4: Verify in Supabase**

Run: `node -e "import { createClient } from '@supabase/supabase-js'; const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY); const { count } = await s.from('cards').select('*', { count: 'exact', head: true }); console.log('Cards:', count);"`
Expected: Non-zero count

- [ ] **Step 5: Commit**

```bash
git add scripts/seed-cards-from-cardladder.mjs scripts/lib/card-slug.mjs
git commit -m "feat: seed cards table from CardLadder data"
```

---

## Chunk 2: League Pages & Navigation

### Task 5: Update LeagueTabs to use route links

**Files:**
- Modify: `app/components/layout/LeagueTabs.tsx`

- [ ] **Step 1: Convert tabs from context-setters to route links**

Update `LeagueTabs.tsx`:
- Import `Link` from `next/link` and `usePathname` from `next/navigation`
- **Remove** the `useLeague()` hook call and its import entirely — LeagueTabs will no longer depend on LeagueProvider context
- Replace `onClick={() => setActiveLeague(id)}` with `<Link href={id === 'ALL' ? '/' : '/${id.toLowerCase()}'}>`
- Determine active tab from `pathname` instead of `activeLeague` context:
  - `pathname === '/'` → ALL is active
  - `pathname === '/nba'` → NBA is active, etc.
- Apply accent color from `getLeagueConfig(id).accentColor` to the active tab underline
- For ALL tab, use `ALL_ACCENT_COLOR`
- Make tabs visually bigger/bolder: increase padding, font-size, font-weight
- This is critical: LeagueTabs will be in the root layout (Task 7) which does NOT have LeagueProvider, so it must NOT call `useLeague()`

- [ ] **Step 2: Verify build passes**

Run: `npm run build`

- [ ] **Step 3: Commit**

```bash
git add app/components/layout/LeagueTabs.tsx
git commit -m "feat: convert league tabs to route links with accent colors"
```

---

### Task 6: Create shared league page component

**Files:**
- Create: `app/[league]/page.tsx`
- Create: `app/components/LeaguePage.tsx`

- [ ] **Step 1: Create the league page route**

Create `app/[league]/page.tsx`:

```typescript
import { notFound } from 'next/navigation';
import { use } from 'react';
import { getAllLeagueIds } from '@/lib/leagues';
import LeaguePage from '@/app/components/LeaguePage';

export function generateStaticParams() {
  return getAllLeagueIds().map(id => ({ league: id.toLowerCase() }));
}

export default function LeagueRoute({ params }: { params: Promise<{ league: string }> }) {
  const { league } = use(params);
  const leagueId = league.toUpperCase();
  if (!getAllLeagueIds().includes(leagueId as any)) notFound();
  return <LeaguePage leagueId={leagueId} />;
}
```

- [ ] **Step 2: Create the LeaguePage component**

Create `app/components/LeaguePage.tsx` — a client component with sidebar + stream layout:

```typescript
'use client';
import { LeagueProvider } from './LeagueProvider';
// ... import existing widgets

export default function LeaguePage({ leagueId }: { leagueId: string }) {
  return (
    <LeagueProvider initialLeague={leagueId}>
      {/* Reuse Nav and LeagueTabs from layout */}
      <main style={{ maxWidth: 1800 }} className="mx-auto px-4 lg:px-8">
        <div className="flex gap-6">
          {/* Sticky Sidebar */}
          <aside className="hidden lg:block w-[300px] shrink-0 sticky top-20 self-start max-h-[calc(100vh-5rem)] overflow-y-auto">
            <FullSchedule />
            <ChampionshipOdds />
            {/* Standings widget — new or adapted */}
          </aside>

          {/* Main Stream */}
          <div className="flex-1 min-w-0 flex flex-col gap-6">
            <MarketMovers />
            {/* OddsFutures widget — new */}
            <RecentSales />
            <SportsNews />
            <TradeSignals />
          </div>
        </div>
      </main>
    </LeagueProvider>
  );
}
```

For F1, conditionally render different widgets:
```typescript
{leagueId === 'F1' ? (
  <>
    <F1Results />
    <RecentSales />
    <SportsNews />
  </>
) : (
  <>
    <MarketMovers />
    <RecentSales />
    <SportsNews />
    <TradeSignals />
  </>
)}
```

- [ ] **Step 3: Update LeagueProvider to accept initialLeague prop**

Modify `app/components/LeagueProvider.tsx`:
- Add `initialLeague?: string` prop
- Initialize `activeLeague` from `initialLeague` if provided, otherwise 'ALL'

- [ ] **Step 4: Verify build and manual test**

Run: `npm run build`
Then: `npm run dev` and navigate to `/nba`, `/nfl`, `/f1`
Expected: Each page renders with league-filtered content

- [ ] **Step 5: Commit**

```bash
git add app/[league]/page.tsx app/components/LeaguePage.tsx app/components/LeagueProvider.tsx
git commit -m "feat: add league page routes with sidebar+stream layout"
```

---

### Task 7: Move Nav and LeagueTabs into root layout

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Ensure Nav and LeagueTabs render on all pages**

The Nav and LeagueTabs should be in the root layout so they appear on both `/` and `/nba` etc. Check if they're already in `layout.tsx` or only in `page.tsx`. If in `page.tsx`, move them to `layout.tsx`.

The LeagueTabs component now uses `usePathname()` to determine active tab (from Task 5), so it works without LeagueProvider context.

- [ ] **Step 2: Clean up homepage**

In `app/page.tsx`, remove Nav/LeagueTabs if moved to layout. The homepage should just render the "ALL" view content.

- [ ] **Step 3: Verify all routes render correctly**

Run: `npm run dev`
Check: `/`, `/nba`, `/nfl`, `/players/[any-slug]`
Expected: Nav and league tabs appear on all pages, active tab highlights correctly

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx app/page.tsx
git commit -m "feat: move nav and league tabs to root layout"
```

---

### Task 8: Pass league accent colors to widgets

**Files:**
- Modify: `app/components/LeaguePage.tsx`

Note: `WidgetShell` already has an `accentColor` prop and applies it as `borderTop`. No changes to WidgetShell needed.

- [ ] **Step 1: Pass accent color from league config to each widget**

In `LeaguePage.tsx`, get the accent color from config and pass to each widget that uses WidgetShell:
```typescript
const config = getLeagueConfig(leagueId as LeagueId);
const accent = config.accentColor;
```

Pass `accentColor={accent}` to MarketMovers, RecentSales, SportsNews, TradeSignals, FullSchedule, ChampionshipOdds, and F1Results. Each of these widgets should forward the prop to their internal `<WidgetShell>` call. Check each widget to see if it already accepts and passes through `accentColor` — if not, add the prop passthrough.

- [ ] **Step 2: Verify visual appearance**

Run: `npm run dev`, navigate to `/nba`
Expected: Widget headers show blue accent border. `/nfl` shows green. `/` shows no accent (or slab green).

- [ ] **Step 3: Commit**

```bash
git add app/components/LeaguePage.tsx app/components/widgets/
git commit -m "feat: pass league accent colors to widgets"
```

---

### Task 8b: Create Odds & Futures widget

**Files:**
- Create: `app/components/widgets/OddsFutures.tsx`
- Modify: `app/components/LeaguePage.tsx`

- [ ] **Step 1: Create OddsFutures widget**

Create `app/components/widgets/OddsFutures.tsx` — a client component that:
- Fetches championship odds from existing `/api/odds/futures?league={league}`
- Displays championship odds (full list, not just top 5 like sidebar)
- Adds an "Awards" section showing MVP, DPOY, ROY futures when available from The Odds API
- For each player in award odds, show card price trend context if available (query Supabase for recent score_history)
- Uses WidgetShell with accent color

The Odds API `outrights` market can be queried for award markets. Check the existing odds API route to see what markets are available. If award odds are not yet in the API, add a placeholder section that says "Award odds coming soon" and create a TODO for the API enhancement.

- [ ] **Step 2: Add OddsFutures to LeaguePage stream**

In `LeaguePage.tsx`, add `<OddsFutures league={leagueId} accentColor={accent} />` in the main stream after MarketMovers.

- [ ] **Step 3: Verify widget renders**

Run: `npm run dev`, navigate to `/nba`
Expected: Odds & Futures widget shows championship odds and award odds (or placeholder)

- [ ] **Step 4: Commit**

```bash
git add app/components/widgets/OddsFutures.tsx app/components/LeaguePage.tsx
git commit -m "feat: add Odds & Futures widget with championship and award odds"
```

---

### Task 8c: Create Standings widget for sidebar

**Files:**
- Create: `app/components/widgets/Standings.tsx`
- Modify: `app/components/LeaguePage.tsx`

- [ ] **Step 1: Create Standings widget**

Create `app/components/widgets/Standings.tsx` — a client component that:
- Fetches standings from ESPN API: `/api/schedule` already uses ESPN, but standings need a dedicated endpoint
- Create a simple fetch to `https://site.api.espn.com/apis/v2/sports/{sport}/{league}/standings`
- Render conference standings with team name, W-L record, PCT
- Highlight the playoff cutoff line (use `teamSuccess.playoffSeeds` from league config)
- For F1: show driver and constructor standings instead (already available via `/api/f1?view=standings`)
- Uses WidgetShell with accent color, compact styling for sidebar

- [ ] **Step 2: Add Standings to LeaguePage sidebar**

In `LeaguePage.tsx`, add `<Standings league={leagueId} accentColor={accent} />` in the sidebar after ChampionshipOdds.

- [ ] **Step 3: Verify widget renders**

Run: `npm run dev`, navigate to `/nba`
Expected: Standings widget shows conference standings in sidebar

- [ ] **Step 4: Commit**

```bash
git add app/components/widgets/Standings.tsx app/components/LeaguePage.tsx
git commit -m "feat: add standings widget to league page sidebar"
```

---

### Task 9: Redirect `/odds/[league]` to league pages

**Files:**
- Modify: `app/odds/[league]/page.tsx`

- [ ] **Step 1: Replace odds page with redirect**

Replace the contents of `app/odds/[league]/page.tsx` with a redirect:

```typescript
import { redirect } from 'next/navigation';
import { use } from 'react';

export default function OddsRedirect({ params }: { params: Promise<{ league: string }> }) {
  const { league } = use(params);
  redirect(`/${league.toLowerCase()}`);
}
```

- [ ] **Step 2: Commit**

```bash
git add app/odds/[league]/page.tsx
git commit -m "feat: redirect /odds/[league] to league pages"
```

---

### Task 9b: Adapt eBay scraper to populate card_sales

**Files:**
- Modify: `scripts/scrape-ebay-sales.mjs`
- Reference: `scripts/lib/parse-card-title.mjs`
- Reference: `scripts/lib/card-slug.mjs`

- [ ] **Step 1: Update eBay scraper to write to card_sales**

Modify `scripts/scrape-ebay-sales.mjs`:
- After scraping an eBay sold listing, parse the title with `parseCardTitle()` from `parse-card-title.mjs`
- Look up the player by matching parsed player name against `players.name` (ILIKE) to get `player_slug`
- Query `cards` table for match on `(player_slug, year, set_name, parallel)`
- If match found: insert into `card_sales` with `card_id` linking to the matched card
- If no card match but player found: auto-create a new `cards` row using `generateCardSlug()`, then insert the sale
- If no player found: skip and log for review
- Continue writing to `ebay_sales` as well (dual-write during migration period)
- Use `listing_url` UNIQUE constraint to prevent duplicates (ON CONFLICT DO NOTHING)

- [ ] **Step 2: Test with a small batch**

Run: `node scripts/scrape-ebay-sales.mjs --player=victor-wembanyama --limit=5`
Expected: Sales appear in both `ebay_sales` and `card_sales` tables. New cards auto-created if needed.

- [ ] **Step 3: Commit**

```bash
git add scripts/scrape-ebay-sales.mjs
git commit -m "feat: adapt eBay scraper to populate card_sales table"
```

---

## Chunk 3: Card Search & API

### Task 10: Create card search API route

**Files:**
- Create: `app/api/cards/search/route.ts`

- [ ] **Step 1: Create the search endpoint**

Create `app/api/cards/search/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim();
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20');
  const league = req.nextUrl.searchParams.get('league');

  if (!q || q.length < 2) {
    return NextResponse.json({ cards: [] });
  }

  // Split search terms and build ILIKE conditions
  const terms = q.split(/\s+/).filter(Boolean);

  // Query cards joined with players for name matching
  // Use RPC or raw query for flexible text search
  let query = supabase
    .from('cards')
    .select(`
      id, slug, year, set_name, parallel, card_number, numbered_to,
      league, image_url, player_slug
    `)
    .limit(limit);

  if (league) {
    query = query.eq('league', league.toUpperCase());
  }

  // Sanitize search terms — remove characters that break PostgREST filter syntax
  const sanitize = (s: string) => s.replace(/[^a-zA-Z0-9]/g, '');

  // Apply ILIKE filters for each search term
  for (const raw of terms) {
    const term = sanitize(raw);
    if (!term) continue;
    query = query.or(
      `player_slug.ilike.%${term}%,set_name.ilike.%${term}%,parallel.ilike.%${term}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ cards: data || [] });
}
```

- [ ] **Step 2: Test the endpoint**

Run: `npm run dev`
Then: `curl "http://localhost:3000/api/cards/search?q=prizm&limit=5"`
Expected: JSON response with matching cards (if seeded data exists)

- [ ] **Step 3: Commit**

```bash
git add app/api/cards/search/route.ts
git commit -m "feat: add card search API endpoint"
```

---

### Task 11: Enhance NavSearch with card autocomplete

**Files:**
- Modify: `app/components/NavSearch.tsx`

- [ ] **Step 1: Add card search alongside player search**

In `NavSearch.tsx`:
- When the search query is >= 2 characters, fetch from BOTH `/api/cards/search?q=...&limit=8` and the existing Supabase players query
- Display results in two sections in the dropdown:
  - **Players** section (existing): player name, team, score, signal
  - **Cards** section (new): card image thumbnail, "{year} {set_name} {parallel} #{card_number}", linked to `/cards/{slug}`
- Add "See all results →" link at bottom that goes to `/search?q={query}`

- [ ] **Step 2: Style the card results**

Each card result row:
- Small thumbnail (32x32) on left from `image_url` (or placeholder)
- "{Player Name} — {year} {set_name} {parallel}" as main text
- Card number and league badge on right
- Links to `/cards/[slug]`

- [ ] **Step 3: Verify autocomplete works**

Run: `npm run dev`
Type in search bar. Expected: both player and card results appear.

- [ ] **Step 4: Commit**

```bash
git add app/components/NavSearch.tsx
git commit -m "feat: add card autocomplete to nav search"
```

---

### Task 12: Create search results page

**Files:**
- Create: `app/search/page.tsx`

- [ ] **Step 1: Create the search results page**

Create `app/search/page.tsx`:

```typescript
'use client';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTheme } from '@/app/components/ThemeProvider';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const [cards, setCards] = useState([]);
  const [filters, setFilters] = useState({ year: '', set: '', league: '', parallel: '' });
  const { colors: c } = useTheme();

  useEffect(() => {
    if (q.length < 2) return;
    const params = new URLSearchParams({ q, limit: '100' });
    if (filters.league) params.set('league', filters.league);
    fetch(`/api/cards/search?${params}`)
      .then(r => r.json())
      .then(d => setCards(d.cards || []));
  }, [q, filters]);

  // Render: search input (pre-filled), filter dropdowns, card grid
  // Each card tile: image, name, year/set/parallel, last sale price (if available)
  // Clicking a tile navigates to /cards/[slug]
}
```

- [ ] **Step 2: Build filter UI**

Filter bar with dropdowns:
- Year: populated from distinct years in results
- Set: populated from distinct set_names in results
- League: ALL/NBA/NFL/MLB/NHL/F1/WNBA
- Sort: Name, Year (desc), League

Client-side filtering on the fetched results for instant response.

- [ ] **Step 3: Build card grid**

Grid of card tiles (responsive: 2 cols mobile, 3 tablet, 4 desktop):
- Card image (or placeholder with set name)
- Player name
- "{year} {set_name} {parallel}"
- Card number if present
- League badge

Each tile links to `/cards/[slug]`.

- [ ] **Step 4: Verify end-to-end search flow**

Run: `npm run dev`
1. Type "prizm" in nav search
2. Click "See all results"
3. Expected: redirects to `/search?q=prizm`, shows grid of matching cards

- [ ] **Step 5: Commit**

```bash
git add app/search/page.tsx
git commit -m "feat: add card search results page with filters"
```

---

## Chunk 4: Card Detail Page

### Task 13: Create card detail API route

**Files:**
- Create: `app/api/cards/[slug]/route.ts`

- [ ] **Step 1: Create the API endpoint**

Create `app/api/cards/[slug]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Fetch card
  const { data: card, error } = await supabase
    .from('cards')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !card) {
    return NextResponse.json({ error: 'Card not found' }, { status: 404 });
  }

  // Fetch player name
  const { data: player } = await supabase
    .from('players')
    .select('name, slug, team, score, signal, league')
    .eq('slug', card.player_slug)
    .single();

  // Fetch sales history
  const { data: sales } = await supabase
    .from('card_sales')
    .select('*')
    .eq('card_id', card.id)
    .order('sold_date', { ascending: false })
    .limit(100);

  // Fetch related cards (other parallels of same base)
  const { data: related } = await supabase
    .from('cards')
    .select('id, slug, parallel, numbered_to, image_url, set_name, year, card_number')
    .eq('player_slug', card.player_slug)
    .eq('year', card.year)
    .eq('set_name', card.set_name)
    .neq('slug', slug)
    .limit(20);

  return NextResponse.json({
    card,
    player,
    sales: sales || [],
    related: related || [],
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/cards/[slug]/route.ts
git commit -m "feat: add card detail API endpoint"
```

---

### Task 14: Create card detail page

**Files:**
- Create: `app/cards/[slug]/page.tsx`

- [ ] **Step 1: Create the page component**

Create `app/cards/[slug]/page.tsx` — a client component that fetches from the API and renders:

**Top section (two columns on desktop):**
- Left: Card image (large, from `card.image_url`), card identity text below (Year, Set, Parallel, Card #, /numbered)
- Right: Market summary box with stats calculated from `sales[]`:
  - Average sale price (last 30 days)
  - Median sale price
  - High / Low
  - Volume (number of sales last 30d)
  - Trend indicator (comparing last 30d avg to prior 30d avg)

**Price chart section (full width):**
- Install `recharts` (`npm install recharts`) — lightweight, React-native charting library, no heavy dependencies
- Use `<LineChart>` with multiple `<Line>` components, one per grade
- Multi-line: group sales by grade, plot price over time
- Color per grade line: PSA 10 = green, PSA 9 = blue, BGS 9.5 = purple, Raw = gray
- Time range buttons: 7d, 30d, 90d, 1y, All

**Recent sales table:**
- Columns: Date, Grade, Price, Platform
- Each row links to `listing_url` if available
- Filter dropdown for grade

**Related cards section:**
- Horizontal scroll of card tiles for other parallels
- Each shows: parallel name, numbered_to, image thumbnail
- Links to `/cards/[related-slug]`

**Player link:**
- Card linking back to `/players/[player_slug]`
- Shows player name, team, Slab Score, signal

- [ ] **Step 2: Style with product page feel**

- Light mode default: white card on light gray background
- Card image gets a subtle shadow/border
- Stats box uses monospace font for numbers
- Chart area with proper padding and axis labels
- Use existing theme colors from `useTheme()`

- [ ] **Step 3: Verify the page renders**

Run: `npm run dev`
Navigate to `/cards/[any-card-slug-from-db]`
Expected: Page renders with card image, stats, chart, sales table

- [ ] **Step 4: Commit**

```bash
git add app/cards/[slug]/page.tsx
git commit -m "feat: add card detail page with price chart and sales history"
```

---

### Task 15: Add active eBay listings to card detail

**Files:**
- Create: `app/api/ebay/listings/route.ts`
- Modify: `app/cards/[slug]/page.tsx`

- [ ] **Step 1: Create eBay listings API for specific cards**

Create `app/api/ebay/listings/route.ts`:

- Accept query params: `player`, `year`, `set`, `parallel`
- Construct eBay Browse API search query: `"{player} {year} {set} {parallel} card"`
- Use existing eBay auth flow from `app/api/ebay/route.ts`
- Return: array of `{ title, price, image, url, condition }`
- Cache for 15 minutes

- [ ] **Step 2: Add listings section to card detail page**

In `app/cards/[slug]/page.tsx`, add a section below recent sales:
- Fetch from `/api/ebay/listings?player=...&year=...&set=...&parallel=...`
- Display as grid of listing cards with image, title, price, "View on eBay" link

- [ ] **Step 3: Verify listings appear**

Run: `npm run dev`, navigate to a card detail page
Expected: Active eBay listings section shows current listings (or empty state)

- [ ] **Step 4: Commit**

```bash
git add app/api/ebay/listings/route.ts app/cards/[slug]/page.tsx
git commit -m "feat: add active eBay listings to card detail page"
```

---

### Task 16: Add PSA grade distribution to card detail

**Files:**
- Modify: `app/cards/[slug]/page.tsx`

- [ ] **Step 1: Fetch PSA data and render grade distribution**

On the card detail page:
- Fetch from existing `/api/psa?subject={player}+{year}+{set}+{parallel}`
- Render as a horizontal bar chart showing count per grade (10, 9, 8, 7, etc.)
- Highlight the grade with the most population
- If PSA data unavailable, show "Grade distribution data unavailable" placeholder

- [ ] **Step 2: Commit**

```bash
git add app/cards/[slug]/page.tsx
git commit -m "feat: add PSA grade distribution to card detail page"
```

---

## Chunk 5: Final Integration & Polish

### Task 17: Wire up Recent Sales widget on league pages to card links

**Files:**
- Modify: `app/components/widgets/RecentSales.tsx`

- [ ] **Step 1: Link sales to card detail pages**

In `RecentSales.tsx`:
- When a sale has a matching card in the `cards` table, link the sale item to `/cards/[slug]`
- Add card image thumbnails to each sale row (from `image_url`)
- This may require the RecentSales API to join with the `cards` table, or do a client-side lookup

- [ ] **Step 2: Commit**

```bash
git add app/components/widgets/RecentSales.tsx
git commit -m "feat: link recent sales to card detail pages"
```

---

### Task 18: Build and verify all routes

**Files:** None (verification only)

- [ ] **Step 1: Run full build**

Run: `npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 2: Manual smoke test all routes**

Test these routes in the browser:
- `/` — ALL page loads, tabs work
- `/nba` — NBA league page with blue accent, sidebar + stream
- `/nfl` — NFL league page with green accent
- `/f1` — F1 page with unique widgets (results, standings)
- `/search?q=prizm` — Search results grid
- `/cards/[any-slug]` — Card detail page with chart, sales, listings
- `/odds/nba` — Redirects to `/nba`
- `/players/[any-slug]` — Still works correctly

- [ ] **Step 3: Commit any fixes**

```bash
git add -A
git commit -m "fix: address issues found in smoke testing"
```

---

### Task 19: Update memory and clean up

**Files:**
- Modify: `C:\Users\Matthew\.claude\projects\C--Projects-slabstreet\memory\MEMORY.md`

- [ ] **Step 1: Update project memory with new architecture**

Add notes about:
- League pages at `app/[league]/page.tsx`
- Card catalog tables: `cards`, `card_sales`
- Card detail page at `app/cards/[slug]/page.tsx`
- Search at `app/search/page.tsx`
- League accent colors in `lib/leagues.ts`

- [ ] **Step 2: Final commit**

```bash
git add -A
git commit -m "chore: update project memory for league pages and card catalog"
```
