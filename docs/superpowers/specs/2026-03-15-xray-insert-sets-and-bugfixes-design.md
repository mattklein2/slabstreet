# Card X-Ray: Insert Sets, Identification Fixes & Data Buildout

**Date:** 2026-03-15
**Status:** Approved
**Sports:** NBA, NFL, MLB, WNBA, F1 (2018-present)

## Problem Statement

The X-Ray tool has three issues:

1. **Card misidentification** — parallels are matched with bidirectional `.includes()` in `db-matcher.ts`, causing false matches (e.g., "Pink Prizm" → "Neon Blue Prizm" because "pink" partially matches the wrong entry first)
2. **Sponsored ads in sold data** — eBay's "Shop on eBay" sponsored items sometimes pass the `li.s-card[data-listingid]` selector in `ebay-sold.ts`
3. **Insert/subset cards not in database** — cards like Downtown, Kaboom!, Color Blast are not parallels but separate insert sets within a product. The current schema has no concept of insert sets, so these cards can't be identified at all.

## Design

### 1. Schema Migration: `card_sets` Table

New table that sits between `products` and `parallels`:

```
products (445 rows, exists)
  └── card_sets (NEW — "Base Set", "Downtown", "Kaboom!", etc.)
        └── parallels (27,808 rows, re-parented from product → card_set)
```

#### `card_sets` table schema

| Column | Type | Description |
|--------|------|-------------|
| id | UUID, PK | |
| product_id | FK → products | Parent product |
| name | TEXT | "Base Set", "Downtown", "Kaboom!", etc. |
| type | TEXT, CHECK IN ('base','insert','subset') | Card set classification |
| description | TEXT, nullable | Plain English explanation for education layer |
| card_count | INT, nullable | Number of cards in the set (e.g., Downtown has 30 cards). Displayed in education layer. |
| is_autographed | BOOLEAN, default false | Auto/patch sets |
| is_memorabilia | BOOLEAN, default false | Relic/patch cards |
| box_exclusivity | TEXT[] | Which box types this insert appears in. Supersedes parallel-level box_exclusivity for inserts — parallel-level retained only for base set parallels where exclusivity varies per parallel. |
| odds | TEXT, nullable | Pull odds like "1:288 hobby packs" |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |
| UNIQUE(product_id, name) | | Prevents duplicate card sets within a product |

#### Indexes

- `CREATE INDEX ON card_sets(product_id)` — fast lookup by product
- `CREATE INDEX ON parallels(card_set_id)` — fast join from card_set to parallels

#### Migration steps

1. Create `card_sets` table with UNIQUE and CHECK constraints
2. For every existing product, auto-create a "Base Set" card_set with `type: 'base'`
3. Add `card_set_id` column to `parallels` table (FK → card_sets)
4. Populate `card_set_id` for all 27,808 existing parallels → their product's "Base Set"
5. Verify all parallels have valid `card_set_id` before proceeding
6. Drop `product_id` from `parallels` (replaced by card_set → product chain). Run in transaction so rollback is possible.
7. Update `db-matcher.ts` to query through the new join

**Note:** `parallels.id` UUIDs are preserved — this is an ALTER-based migration, not DROP/CREATE. Existing FKs referencing `parallels(id)` (e.g., `card_lookups.parallel_id`) are unaffected.

### 2. Bug Fix: Parallel Misidentification

Replace bidirectional `.includes()` matching in `db-matcher.ts` with a scoring system:

| Match Type | Score | Example |
|-----------|-------|---------|
| Exact match | 10 | identity "Silver Prizm" = parallel "Silver Prizm" |
| Normalized exact (strip suffixes like "Prizm"/"Refractor") | 8 | identity "Pink" matches "Pink Prizm" |
| Bidirectional word match (all words present both ways) | 5 | identity "Neon Green" matches "Neon Green Scope" |
| Partial overlap (some words) | 2 | last resort, flagged as low confidence |

Highest score wins. Ties broken by rarity_rank ascending (lower rank = more common, preferred for ambiguous matches since users are more likely to have common parallels).

### 3. Bug Fix: Sponsored Ads in Sold Scraper

Three layers of defense in `ebay-sold.ts`:

1. **Selector**: Add `:not([data-sponsored])` to the query selector
2. **URL filter**: Skip items where the URL doesn't contain `/itm/` (sponsored "Shop on eBay" links go to stores, not items)
3. **Title filter**: Skip items containing "Shop on eBay" or similar sponsored phrases

### 4. Card Identity Parser: Insert Detection

Add insert awareness to `card-identity.ts`:

- New `INSERTS` keyword list (Downtown, Kaboom!, Color Blast, Fireworks, Instant Impact, Stained Glass, etc.)
- **Remove `Color Blast` from the `PARALLELS` list** — it's an insert set, not a parallel. Keeping it in both lists causes dual classification.
- New field on `CardIdentity`: `insert: string | null`
- Title parser checks for insert keywords
- Item Specifics parser checks `Features`, `Insert`, `Card Name` fields
- DB matcher uses `insert` field to find the correct `card_set` before matching parallels within it
- **Update `buildSoldQuery` in `ebay-sold.ts`** to include the `insert` field in the search query when present, ensuring sold comps are for the correct insert (e.g., Downtown prices, not base card prices)

### 5. Scraper Pipeline: Insert Set Data Population

**Goal:** Populate `card_sets` and insert-level `parallels` for all products 2018-present across NBA, NFL, MLB, WNBA, F1.

**Estimated volume:** ~450+ products × 5-20 insert sets each = ~3,000-6,000 insert sets with their parallel rainbows.

#### Data source priority (existing infrastructure first)

1. **Cardboard Connection** — existing scraper (`scripts/scrape-checklist.mjs`, 473 lines). Already parses product pages for parallels. Extend to capture insert set sections (name, parallel rainbow, print runs, odds, box exclusivity).
2. **130point** — exploration data already pulled (`.firecrawl/130point-*`). Formalize into a scraper for checklist data, especially strong for basketball.
3. **Card Ladder** — existing scraper (`scripts/scrape-cardladder.mjs`, 1,047 lines). Can pull card-level detail for verification.
4. **ESPN** — existing integration (`lib/espn.ts`). Player name normalization.
5. **Manual entry** — absolute last resort only.

#### Scraper workflow

1. Crawl Cardboard Connection product checklist pages for each product in our DB
2. Parse HTML for insert set sections (typically H2/H3 headers with "Insert" or specific set names)
3. For each insert set, extract: name, parallel rainbow (names + print runs), odds, box exclusivity
4. Write to `card_sets` and `parallels` tables
5. Generate gap report: which products had no checklist or incomplete insert data
6. For gaps: try 130point, then Card Ladder, then flag for manual entry

### 6. X-Ray UI Updates

1. **Insert badge** — when the matched card_set has `type: 'insert'`, show a badge with the insert name and description (e.g., "Downtown — premium insert, ~1:288 hobby packs")
2. **Scoped rainbow** — rarity rainbow shows only parallels for the matched card_set, not all product parallels. Downtown card shows Downtown rainbow, not base Prizm rainbow.

### Architecture Summary

```
eBay Listing
  → card-identity.ts (parse: player, set, parallel, INSERT)
  → db-matcher.ts (match: product → card_set → parallel, with scoring)
  → price-comps.ts (sold data, ad-free)
  → UI (identity + scoped rainbow + insert education + price context)
```

### Implementation Order

1. Schema migration (`card_sets` table, re-parent parallels)
2. Fix parallel matching (scoring system in db-matcher)
3. Fix sponsored ads (selector + URL + title filtering in ebay-sold)
4. Add insert detection to card-identity parser
5. Extend Cardboard Connection scraper for insert sets
6. Run scraper across all 5 sports, 2018-present
7. Fallback scraping (130point, Card Ladder) for gaps
8. Update X-Ray UI (insert badge, scoped rainbow)
9. Verify end-to-end with test cases (Caleb Williams Downtown, Pink Prizm, etc.)
