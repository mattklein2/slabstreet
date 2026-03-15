# X-Ray Insert Sets, Identification Fixes & Data Buildout — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix card misidentification bugs, filter sponsored ads from sold data, add insert set support to the schema/parser/UI, and populate insert set data for 5 sports (2018-present).

**Architecture:** New `card_sets` table sits between `products` and `parallels`. Card identity parser gains insert detection. DB matcher uses scoring instead of `.includes()`. Scraper pipeline extended to capture insert sets from Cardboard Connection and fallback sources.

**Tech Stack:** Supabase (PostgreSQL), Next.js 16, TypeScript, Cheerio, Node.js scripts

**Spec:** `docs/superpowers/specs/2026-03-15-xray-insert-sets-and-bugfixes-design.md`

**Important note on commit ordering:** Tasks 1-6 are interdependent. The migration adds `card_set_id` to parallels and creates card_sets, but we defer dropping `product_id` until AFTER all code changes are committed (migration 014). The `insert` field on `CardIdentity` is optional (`insert?: string | null`) so the build never breaks between tasks.

---

## Chunk 1: Schema Migration & Bug Fixes

### Task 1: Create `card_sets` table and add `card_set_id` to parallels

**Files:**
- Create: `scripts/migrations/012-create-card-sets-table.sql`
- Create: `scripts/migrations/013-add-card-set-id-to-parallels.sql`

- [ ] **Step 1: Write migration to create card_sets table**

Create `scripts/migrations/012-create-card-sets-table.sql`:

```sql
-- Create the card_sets table between products and parallels.
-- Each product has one or more card sets: "Base Set" plus inserts like Downtown, Kaboom!, etc.

CREATE TABLE IF NOT EXISTS card_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'base' CHECK (type IN ('base', 'insert', 'subset')),
  description TEXT,
  card_count INT,
  is_autographed BOOLEAN NOT NULL DEFAULT false,
  is_memorabilia BOOLEAN NOT NULL DEFAULT false,
  box_exclusivity TEXT[],
  odds TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(product_id, name)
);

-- Index for fast lookup by product
CREATE INDEX idx_card_sets_product_id ON card_sets(product_id);

-- Enable RLS
ALTER TABLE card_sets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON card_sets FOR SELECT USING (true);
CREATE POLICY "Allow service role full access" ON card_sets FOR ALL USING (auth.role() = 'service_role');
```

- [ ] **Step 2: Write migration to create Base Set entries and add card_set_id**

Create `scripts/migrations/013-add-card-set-id-to-parallels.sql`:

```sql
-- Step 1: Create a "Base Set" card_set for every existing product
INSERT INTO card_sets (product_id, name, type)
SELECT id, 'Base Set', 'base'
FROM products
ON CONFLICT (product_id, name) DO NOTHING;

-- Step 2: Add card_set_id column to parallels (keep product_id for now — dropped in migration 014 after code changes)
ALTER TABLE parallels ADD COLUMN IF NOT EXISTS card_set_id UUID REFERENCES card_sets(id) ON DELETE CASCADE;

-- Step 3: Populate card_set_id for all existing parallels
UPDATE parallels p
SET card_set_id = cs.id
FROM card_sets cs
WHERE cs.product_id = p.product_id
  AND cs.name = 'Base Set';

-- Step 4: Create index on parallels.card_set_id
CREATE INDEX IF NOT EXISTS idx_parallels_card_set_id ON parallels(card_set_id);

-- Step 5: Make card_set_id NOT NULL after populating
ALTER TABLE parallels ALTER COLUMN card_set_id SET NOT NULL;
```

Note: `product_id` is NOT dropped here. It stays until migration 014, which runs after all code is updated to use `card_set_id` instead.

- [ ] **Step 3: Run migrations against Supabase**

Run:
```bash
node scripts/run-migration.mjs scripts/migrations/012-create-card-sets-table.sql
node scripts/run-migration.mjs scripts/migrations/013-add-card-set-id-to-parallels.sql
```

Expected: Both succeed. Verify in Supabase dashboard:
- `card_sets` table exists with 445 "Base Set" rows (one per product)
- `parallels` table has BOTH `product_id` AND `card_set_id` columns
- All 27,808 parallels have a valid `card_set_id`

- [ ] **Step 4: Commit**

```bash
git add scripts/migrations/012-create-card-sets-table.sql scripts/migrations/013-add-card-set-id-to-parallels.sql
git commit -m "feat(schema): add card_sets table, add card_set_id to parallels"
```

---

### Task 2: Update types.ts with insert support

**Files:**
- Modify: `lib/xray/types.ts`

- [ ] **Step 1: Add `insert` field to CardIdentity and `MatchedCardSet` interface**

In `lib/xray/types.ts`, add optional `insert` field to `CardIdentity` (after the `parallel` field, line 9):

```typescript
insert?: string | null;      // "Downtown", "Kaboom!", etc. — null/undefined for base cards
```

Add new interface after `MatchedProduct` (after line 45):

```typescript
/** Matched card set from our database */
export interface MatchedCardSet {
  cardSetId: string;
  cardSetName: string;
  type: 'base' | 'insert' | 'subset';
  description: string | null;
  cardCount: number | null;
  odds: string | null;
  boxExclusivity: string[] | null;
}
```

Add `matchedCardSet` to `XRayResult` (after `matchedParallel` field, around line 114):

```typescript
matchedCardSet: MatchedCardSet | null;
```

Add `insertDescription` to the `education` block (around line 118):

```typescript
education: {
  setDescription: string | null;
  parallelDescription: string | null;
  flagshipContext: string | null;
  insertDescription: string | null;
};
```

- [ ] **Step 2: Commit**

```bash
git add lib/xray/types.ts
git commit -m "feat(types): add insert field to CardIdentity, MatchedCardSet interface"
```

---

### Task 3: Update db-matcher.ts — scoring system and card_set support

**Files:**
- Modify: `lib/xray/db-matcher.ts`

- [ ] **Step 1: Add scoring function and update imports/interface**

At the top of `db-matcher.ts`, update imports and interface:

```typescript
import type { CardIdentity, MatchedProduct, MatchedParallel, MatchedCardSet, RainbowEntry } from './types';

export interface MatchResult {
  product: MatchedProduct | null;
  cardSet: MatchedCardSet | null;
  parallel: MatchedParallel | null;
  rainbow: RainbowEntry[];
}
```

Add the scoring function (used for both card_set and parallel matching):

```typescript
/**
 * Score how well a database name matches an identity name.
 * Higher score = better match. 0 = no match.
 */
function scoreNameMatch(dbName: string, identityName: string): number {
  const dbLower = dbName.toLowerCase();
  const idLower = identityName.toLowerCase();

  // Exact match
  if (dbLower === idLower) return 10;

  // Normalized exact: strip common suffixes (Prizm, Refractor, Holo, etc.)
  const suffixes = /\s*(prizm|refractor|xfractor|holo|scope|shimmer|disco|wave|ice)\s*$/i;
  const dbNorm = dbLower.replace(suffixes, '').trim();
  const idNorm = idLower.replace(suffixes, '').trim();
  if (dbNorm && idNorm && dbNorm === idNorm) return 8;

  // Bidirectional word match: all words in identity appear in DB name AND vice versa
  const dbWords = dbLower.split(/\s+/);
  const idWords = idLower.split(/\s+/);
  const idInDb = idWords.every(w => dbWords.some(dw => dw.includes(w)));
  const dbInId = dbWords.every(w => idWords.some(iw => iw.includes(w)));
  if (idInDb && dbInId) return 5;

  // Partial: at least half of identity words appear in DB name
  const matchCount = idWords.filter(w => dbWords.some(dw => dw.includes(w))).length;
  if (matchCount >= Math.ceil(idWords.length / 2)) return 2;

  return 0;
}
```

- [ ] **Step 2: Rewrite matchCard to use card_sets and scoring**

Keep the existing product matching logic (lines 32-103 — the part that finds the best product by scoring). Replace everything after `const matchedProduct` construction with:

```typescript
  // Step 2: Find matching card_set
  const { data: cardSets } = await supabase
    .from('card_sets')
    .select('*')
    .eq('product_id', p.id);

  if (!cardSets || cardSets.length === 0) {
    return { product: matchedProduct, cardSet: null, parallel: null, rainbow: [] };
  }

  // Find card_set: if identity has an insert, match by insert name; otherwise "Base Set"
  let matchedCardSetRow = null;
  if (identity.insert) {
    const scored = cardSets
      .filter((cs: any) => cs.type !== 'base')
      .map((cs: any) => ({ cs, score: scoreNameMatch(cs.name, identity.insert!) }))
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score);
    matchedCardSetRow = scored.length > 0 ? scored[0].cs : null;
  }
  if (!matchedCardSetRow) {
    matchedCardSetRow = cardSets.find((cs: any) => cs.name === 'Base Set') || cardSets[0];
  }

  const matchedCardSet: MatchedCardSet = {
    cardSetId: matchedCardSetRow.id,
    cardSetName: matchedCardSetRow.name,
    type: matchedCardSetRow.type,
    description: matchedCardSetRow.description,
    cardCount: matchedCardSetRow.card_count,
    odds: matchedCardSetRow.odds,
    boxExclusivity: matchedCardSetRow.box_exclusivity,
  };

  // Step 3: Fetch parallels for this card_set (not product)
  const { data: parallels, error: parError } = await supabase
    .from('parallels')
    .select('id, name, color_hex, print_run, serial_numbered, rarity_rank, is_one_of_one, description, box_exclusivity')
    .eq('card_set_id', matchedCardSetRow.id)
    .order('rarity_rank', { ascending: false });

  if (parError || !parallels) {
    return { product: matchedProduct, cardSet: matchedCardSet, parallel: null, rainbow: [] };
  }

  // Step 4: Score each parallel
  let matchedParallel: MatchedParallel | null = null;
  if (identity.parallel) {
    const scored = parallels.map((par: any) => ({
      par,
      score: scoreNameMatch(par.name, identity.parallel!),
    }));
    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      // Ties: prefer more common (higher rarity_rank number = more common, since rank 1 = rarest)
      return b.par.rarity_rank - a.par.rarity_rank;
    });
    if (scored[0]?.score > 0) {
      const par = scored[0].par;
      matchedParallel = {
        parallelId: par.id,
        parallelName: par.name,
        colorHex: par.color_hex,
        printRun: par.print_run,
        serialNumbered: par.serial_numbered,
        rarityRank: par.rarity_rank,
        isOneOfOne: par.is_one_of_one,
        description: par.description || '',
        boxExclusivity: par.box_exclusivity,
      };
    }
  } else {
    // No parallel specified — default to Base
    const basePar = parallels.find((pp: any) => pp.name.toLowerCase() === 'base');
    if (basePar) {
      matchedParallel = {
        parallelId: basePar.id,
        parallelName: basePar.name,
        colorHex: basePar.color_hex,
        printRun: basePar.print_run,
        serialNumbered: basePar.serial_numbered,
        rarityRank: basePar.rarity_rank,
        isOneOfOne: basePar.is_one_of_one,
        description: basePar.description || '',
        boxExclusivity: basePar.box_exclusivity,
      };
    }
  }

  // Build rainbow (scoped to this card_set only)
  const rainbow: RainbowEntry[] = parallels.map((par: any) => ({
    name: par.name,
    colorHex: par.color_hex,
    printRun: par.print_run,
    serialNumbered: par.serial_numbered,
    rarityRank: par.rarity_rank,
    isOneOfOne: par.is_one_of_one,
    isCurrentCard: matchedParallel ? par.id === matchedParallel.parallelId : false,
    boxExclusivity: par.box_exclusivity,
  }));

  return { product: matchedProduct, cardSet: matchedCardSet, parallel: matchedParallel, rainbow };
```

- [ ] **Step 3: Commit**

```bash
git add lib/xray/db-matcher.ts
git commit -m "feat(db-matcher): scoring-based parallel matching, card_set support"
```

---

### Task 4: Fix sponsored ads in ebay-sold.ts

**Files:**
- Modify: `lib/xray/ebay-sold.ts`

- [ ] **Step 1: Add sponsored ad filtering**

In `searchSoldListings()`, update the selector on line 134 from:
```typescript
$('li.s-card[data-listingid]').each((_i, el) => {
```
to:
```typescript
$('li.s-card[data-listingid]:not([data-sponsored])').each((_i, el) => {
```

After the title extraction (around line 140), add:
```typescript
// Skip sponsored "Shop on eBay" items
if (/shop on ebay/i.test(title)) return;
```

After the URL extraction and cleaning (around line 149), add:
```typescript
// Skip non-item URLs (sponsored store links don't have /itm/ paths)
if (!itemUrl.includes('/itm/')) return;
```

- [ ] **Step 2: Update buildSoldQuery to include insert name**

In `buildSoldQuery()`, after the parallel check (around line 91), add:

```typescript
if (identity.insert) {
  parts.push(identity.insert);
}
```

Note: if both `identity.insert` and `identity.parallel` are set (e.g., "Downtown Gold"), don't double-add words that overlap. The insert name is the more important qualifier for comps.

- [ ] **Step 3: Commit**

```bash
git add lib/xray/ebay-sold.ts
git commit -m "fix(ebay-sold): filter sponsored ads, include insert name in sold query"
```

---

### Task 5: Add insert detection to card-identity.ts

**Files:**
- Modify: `lib/xray/card-identity.ts`

- [ ] **Step 1: Add INSERTS keyword list and clean up PARALLELS**

Remove `'Color Blast'` from the PARALLELS array (line 139) — it's an insert set, not a parallel. Keep `'Disco'` in PARALLELS (some products use it as a parallel finish name).

Add after the PARALLELS array (around line 141):

```typescript
// Known insert set names (not parallels — these are separate card subsets within a product)
const INSERTS = [
  'Downtown', 'Kaboom', 'Color Blast', 'Fireworks', 'Instant Impact',
  'Stained Glass', 'Swagger', 'Behind the Glass', 'Case Hit',
  'My City', 'Exhibition', 'Star Gazing', 'Blank Slate',
  'Sensational', 'Phenomenon', 'Hobby Horse', 'Crusade',
  'Astro', 'Laser Show', 'Hype', 'Unleashed', 'Vortex',
  'Rookie Ticket', 'Contenders Rookie Ticket',
  'Hall of Fame', 'Legendary', 'Franchise', 'Iconic',
  'Rookie Patch Autograph', 'RPA', 'Logoman',
  'National Pride', 'Emergent', 'My House',
  'Net Marvels', 'Fearless', 'Far Out', 'Shock Wave',
  'Rookie Revolution', 'All Day', 'Number Ones',
];
```

Note: `'Disco'` and `'No Huddle'` are NOT in this list — Disco is a parallel finish, No Huddle is a box-exclusivity tier. `'Rated Rookie'` and `'Draft Picks'` are also excluded — they are subsets, not inserts, and would need `type: 'subset'` if added later.

- [ ] **Step 2: Add insert field to TitleParsed and parsing logic**

Add `insert: string | null` to the `TitleParsed` interface (around line 159):

```typescript
interface TitleParsed {
  player: string | null;
  year: string | null;
  brand: string | null;
  set: string | null;
  parallel: string | null;
  insert: string | null;       // NEW
  cardNumber: string | null;
  sport: string | null;
  isRookie: boolean;
  isGraded: boolean;
  grader: string | null;
  grade: string | null;
}
```

Initialize `insert: null` in the result object inside `parseTitleFallback()` (around line 175).

Add insert detection after the parallel section (around line 224):

```typescript
// Insert set detection — checked AFTER parallels so both can coexist
// (e.g., "Downtown Gold /10" = insert: Downtown, parallel: Gold)
for (const ins of INSERTS) {
  const insLower = ins.toLowerCase();
  if (cleanLower.includes(insLower)) {
    result.insert = ins;
    break;
  }
}
```

- [ ] **Step 3: Add insert detection to parseCardIdentity**

In `parseCardIdentity()`, after the `fromSpecs` block (around line 28), add:

```typescript
// Check Item Specifics for insert name
const specsInsert = specs['Insert'] || specs['Card Name'] || specs['Subset'] || null;
```

In the identity construction (around line 53), add:

```typescript
insert: specsInsert || fromTitle.insert || null,
```

- [ ] **Step 4: Commit**

```bash
git add lib/xray/card-identity.ts
git commit -m "feat(card-identity): add insert set detection (Downtown, Kaboom!, etc.)"
```

---

### Task 6: Update API route and UI components

**Files:**
- Modify: `app/api/xray/route.ts`
- Modify: `app/components/xray/CardIdentitySection.tsx`
- Modify: `app/components/xray/RarityRainbow.tsx`
- Modify: `app/components/xray/SetEducation.tsx`
- Modify: `app/xray/page.tsx`

- [ ] **Step 1: Update API route to pass cardSet through**

In `app/api/xray/route.ts`, update the result construction.

After `matchedParallel: match.parallel,` (around line 102), add:
```typescript
matchedCardSet: match.cardSet,
```

Update the education block (around line 84) to include insert description:
```typescript
const education = {
  setDescription: match.product?.description || null,
  parallelDescription: match.parallel?.description || null,
  flagshipContext: match.product?.isFlagship
    ? `${match.product.productName} is a flagship product — one of the most collected and recognized sets in the hobby.`
    : null,
  insertDescription: match.cardSet?.type === 'insert'
    ? match.cardSet.description || `${match.cardSet.cardSetName} is an insert set${match.cardSet.odds ? ` found at ${match.cardSet.odds}` : ''}.`
    : null,
};
```

- [ ] **Step 2: Update CardIdentitySection to show insert name**

In `app/components/xray/CardIdentitySection.tsx`, add the `insert` field to the fields array after the Parallel field (around line 19):

```typescript
{ label: 'Insert', value: identity.insert || null },
```

- [ ] **Step 3: Update RarityRainbow to show insert context**

In `app/components/xray/RarityRainbow.tsx`, update the Props interface:

```typescript
interface Props {
  rainbow: RainbowEntry[];
  product: MatchedProduct | null;
  cardSetName?: string;
  cardSetType?: string;
}
```

Update the subtitle (around line 50):
```typescript
{product.productName} {product.year} — {cardSetName && cardSetType !== 'base' ? `${cardSetName} Insert — ` : ''}{totalParallels} parallels
```

- [ ] **Step 4: Update SetEducation to show insert description**

In `app/components/xray/SetEducation.tsx`, update the Props `education` type to include `insertDescription: string | null`. Then add rendering:

```typescript
{education.insertDescription && (
  <p style={{ margin: 0, color: colors.amber, fontWeight: 500 }}>
    {education.insertDescription}
  </p>
)}
```

Also update the `hasContent` check to include `education.insertDescription`.

- [ ] **Step 5: Update xray/page.tsx to pass new props**

In `app/xray/page.tsx`, pass the cardSet data to RarityRainbow:

```typescript
<RarityRainbow
  rainbow={result.rainbow}
  product={result.product}
  cardSetName={result.matchedCardSet?.cardSetName}
  cardSetType={result.matchedCardSet?.type}
/>
```

- [ ] **Step 6: Build to verify no TypeScript errors**

```bash
npm run build
```

Expected: Clean build. All type changes are compatible.

- [ ] **Step 7: Commit**

```bash
git add app/api/xray/route.ts app/components/xray/CardIdentitySection.tsx app/components/xray/RarityRainbow.tsx app/components/xray/SetEducation.tsx app/xray/page.tsx
git commit -m "feat(xray): update API and UI for insert set support"
```

---

### Task 6B: Drop product_id from parallels (deferred migration)

**Files:**
- Create: `scripts/migrations/014-drop-parallels-product-id.sql`

This runs AFTER all code changes are committed, so nothing references `parallels.product_id` anymore.

- [ ] **Step 1: Grep codebase for remaining product_id references on parallels**

Run:
```bash
grep -r "product_id" lib/xray/ app/api/xray/ --include="*.ts" --include="*.tsx"
```

Expected: No references to `parallels.product_id` remain (only `card_sets.product_id` and `products.id`).

- [ ] **Step 2: Write and run the column drop migration**

Create `scripts/migrations/014-drop-parallels-product-id.sql`:

```sql
-- Drop product_id from parallels now that all code uses card_set_id.
-- Wrapped in transaction for safety.
BEGIN;

-- Verify all parallels have card_set_id before dropping product_id
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM parallels WHERE card_set_id IS NULL) THEN
    RAISE EXCEPTION 'Found parallels with NULL card_set_id — aborting';
  END IF;
END $$;

ALTER TABLE parallels DROP COLUMN IF EXISTS product_id;

COMMIT;
```

Run:
```bash
node scripts/run-migration.mjs scripts/migrations/014-drop-parallels-product-id.sql
```

- [ ] **Step 3: Commit**

```bash
git add scripts/migrations/014-drop-parallels-product-id.sql
git commit -m "chore(schema): drop product_id from parallels, replaced by card_set_id"
```

---

## Chunk 2: Scraper Pipeline & Data Population

### Task 7: Extend Cardboard Connection scraper for insert sets

**Files:**
- Modify: `scripts/scrape-checklist.mjs`

- [ ] **Step 1: Add insert section boundary detection**

Use a two-pass approach. First, add a function to detect the "Inserts" section boundary:

```javascript
/**
 * Detect if this heading marks the start of an insert section.
 * Only matches generic section headers, NOT individual insert names.
 */
function isInsertSectionHeader(text) {
  const t = text.toLowerCase().trim();
  return (
    t.startsWith('insert') ||
    t === 'insert cards:' ||
    t === 'insert cards' ||
    t === 'inserts:' ||
    t === 'inserts' ||
    t === 'insert sets' ||
    t === 'insert sets:'
  );
}
```

Important: do NOT match individual insert names (Downtown, Kaboom, etc.) as top-level section headers — they appear as sub-headers within the insert section. Matching them at the top level would misfire on base-set content.

- [ ] **Step 2: Refactor parseChecklistPage to return both parallels and inserts**

Change the return type from `parallels[]` to `{ parallels: [...], inserts: [...] }`.

Parsing strategy:
1. **First pass**: find the insert section boundary (the element matching `isInsertSectionHeader`)
2. **Within the insert section**: scan for individual insert sub-headers (H3/H4) — these are the insert set names (Downtown, Kaboom, etc.)
3. **Under each insert sub-header**: collect the parallel list (the insert's own rainbow)
4. **Mark insert-section DOM elements** so Strategies 2/3/4 skip them (prevents insert parallels from also appearing in the base parallels list)

Each insert in the output:
```javascript
{
  name: "Downtown",
  parallels: [
    { name: "Base", printRun: null, serialNumbered: false, isOneOfOne: false, exclusivity: null },
    { name: "Gold", printRun: 10, serialNumbered: true, isOneOfOne: false, exclusivity: "Hobby" },
  ],
  odds: "1:288 hobby packs",  // extracted from text near the header, or null
  exclusivity: "Hobby",        // extracted, or null
}
```

- [ ] **Step 3: Update main() to use new return format**

Update the `main()` function to destructure the new return shape:

```javascript
const { parallels, inserts } = parseChecklistPage(html);
console.log(`Found ${parallels.length} parallel(s) and ${inserts.length} insert set(s)`);

const output = {
  url,
  scrapedAt: new Date().toISOString(),
  brand: meta.brand,
  product: meta.product,
  sport,
  year: meta.year,
  parallels,
  inserts,   // NEW
};
```

- [ ] **Step 4: Add batch mode with per-URL error isolation**

Add a `--batch` flag that reads URLs from a file:

```bash
node scripts/scrape-checklist.mjs --batch data/checklist-urls-nba.txt
```

Key requirements:
- One URL per line in the batch file
- **5-second delay** between requests (polite crawl for hundreds of URLs)
- **Per-URL error catching** — if one URL fails (403, timeout, parse error), log it and continue to the next. Do NOT `process.exit(1)`.
- Write failed URLs to `{batch-file}-failed.txt` for retry
- **429 detection** — if eBay/CC returns HTTP 429, apply exponential backoff (wait 30s, then 60s, etc.)
- Print running summary: `[45/200] 2024-panini-prizm-basketball — 12 parallels, 8 inserts`

```javascript
if (process.argv[2] === '--batch') {
  const batchFile = process.argv[3];
  const urls = readFileSync(batchFile, 'utf-8').split('\n').filter(u => u.trim());
  const failed = [];
  for (let i = 0; i < urls.length; i++) {
    try {
      await processUrl(urls[i].trim(), i + 1, urls.length);
    } catch (err) {
      console.error(`[${i+1}/${urls.length}] FAILED: ${urls[i]} — ${err.message}`);
      failed.push(urls[i]);
    }
    if (i < urls.length - 1) await new Promise(r => setTimeout(r, 5000));
  }
  if (failed.length > 0) {
    writeFileSync(batchFile.replace('.txt', '-failed.txt'), failed.join('\n'), 'utf-8');
    console.log(`\n${failed.length} URLs failed — written to ${batchFile.replace('.txt', '-failed.txt')}`);
  }
}
```

Refactor `main()` into a `processUrl(url, index, total)` function so both single-URL and batch modes use the same logic.

- [ ] **Step 5: Commit**

```bash
git add scripts/scrape-checklist.mjs
git commit -m "feat(scraper): extend checklist scraper for insert sets, add batch mode"
```

---

### Task 8: Create insert data loader script

**Files:**
- Create: `scripts/load-inserts.mjs`

- [ ] **Step 1: Write loader script**

Create `scripts/load-inserts.mjs` that:
1. Reads all JSON files from `data/checklists/{sport}/`
2. For each JSON file that has an `inserts` array:
   a. Looks up the product in Supabase by year + sport + product name
   b. For each insert, upserts a `card_sets` row with `type: 'insert'`
   c. For each insert's parallels, upserts `parallels` rows linked to the new card_set
3. Uses `ON CONFLICT (product_id, name) DO NOTHING` on card_sets for idempotency
4. Assigns `rarity_rank` to insert parallels based on print run (lower print run = lower rank = rarer)
5. Prints summary: products processed, card_sets created, parallels created, gaps (products with no insert data)

```javascript
// Usage: node scripts/load-inserts.mjs [--sport nba] [--dry-run]
```

`--dry-run` logs what would be inserted without writing to the database.

- [ ] **Step 2: Commit**

```bash
git add scripts/load-inserts.mjs
git commit -m "feat(scripts): add insert data loader for Supabase"
```

---

### Task 9: Build URL lists and run scrapers

**Files:**
- Create: `scripts/generate-checklist-urls.mjs`
- Create: `data/checklist-urls-nba.txt`
- Create: `data/checklist-urls-nfl.txt`
- Create: `data/checklist-urls-mlb.txt`
- Create: `data/checklist-urls-wnba.txt`
- Create: `data/checklist-urls-f1.txt`

- [ ] **Step 1: Generate URL lists with validation**

Write `scripts/generate-checklist-urls.mjs` that:
1. Queries all products from Supabase (with brand name join)
2. Generates the expected Cardboard Connection URL for each using the slug pattern
3. **Validates each URL** with an HTTP HEAD request (catches 404s for bad slugs)
4. Writes valid URLs to `data/checklist-urls-{sport}.txt`
5. Writes invalid/404 URLs to `data/checklist-urls-{sport}-missing.txt` for manual review

URL pattern (best-effort, Cardboard Connection slugs are inconsistent):
```
https://www.cardboardconnection.com/{year}-{brand}-{product}-{sport}-cards
```

Known exceptions to handle:
- Multi-word products: "Donruss Optic" → `donruss-optic`
- Year formats: `2024-25` or `2024` depending on sport season
- Some pages use `-checklist` suffix instead of `-cards`
- Try both `-cards` and `-checklist` suffixes if first returns 404

Rate limit: 1 HEAD request per second.

- [ ] **Step 2: Run batch scraper for each sport**

```bash
node scripts/scrape-checklist.mjs --batch data/checklist-urls-nba.txt
node scripts/scrape-checklist.mjs --batch data/checklist-urls-nfl.txt
node scripts/scrape-checklist.mjs --batch data/checklist-urls-mlb.txt
node scripts/scrape-checklist.mjs --batch data/checklist-urls-wnba.txt
node scripts/scrape-checklist.mjs --batch data/checklist-urls-f1.txt
```

Expected: JSON files in `data/checklists/{sport}/` with both parallels and inserts.

- [ ] **Step 3: Run loader to populate Supabase**

```bash
node scripts/load-inserts.mjs
```

Expected: Summary showing card_sets and parallels created. Gap report showing any products without insert data.

- [ ] **Step 4: Handle gaps with fallback sources**

For products where Cardboard Connection had no data:

**130point fallback**: Use the existing `.firecrawl/130point-*` exploration data as a starting point. Create `scripts/scrape-130point.mjs` following the same pattern as `scrape-checklist.mjs` but targeting 130point.com's HTML structure. 130point is especially strong for basketball checklists.

**Card Ladder fallback**: The existing `scripts/scrape-cardladder.mjs` (1,047 lines) already authenticates via Firebase and fetches card-level detail. Extend it with a `--inserts` mode that:
1. For each product in the gap list, searches Card Ladder for insert set names
2. Extracts insert parallel info from card detail pages
3. Outputs the same JSON format as `scrape-checklist.mjs` for compatibility with `load-inserts.mjs`

**ESPN**: Not useful for insert data — only used for player name normalization.

Run the loaders again after each fallback source fills gaps.

- [ ] **Step 5: Commit data files and scripts**

```bash
git add scripts/generate-checklist-urls.mjs data/checklist-urls-*.txt
git commit -m "feat(data): generate checklist URLs and populate insert data for all sports"
```

---

### Task 10: End-to-end verification

- [ ] **Step 1: Build the project**

```bash
npm run build
```

Expected: No TypeScript errors, clean build.

- [ ] **Step 2: Verify no orphaned product_id references**

```bash
grep -rn "parallels.*product_id\|\.eq.*product_id.*parallels\|from.*parallels.*product_id" lib/ app/ scripts/ --include="*.ts" --include="*.tsx" --include="*.mjs"
```

Expected: No matches (all code now uses `card_set_id`).

- [ ] **Step 3: Test with known cards**

Start the server (`npm run build && npm run start`) and test the X-Ray with these cases:

1. **Caleb Williams Downtown** — should identify as insert "Downtown" within Prizm Football, show Downtown-specific rainbow (not base Prizm rainbow)
2. **Pink Prizm basketball card** — should correctly match "Pink Prizm" (not Neon Blue, not Neon Pink, not Pink Shimmer)
3. **Base Prizm card** — should match "Base Set" card_set and show base parallel rainbow
4. **Kaboom! insert** — should identify insert, show Kaboom-specific comps and rainbow
5. **Color Blast** — should identify as insert (not parallel)

- [ ] **Step 4: Verify sold data has no sponsored ads**

Test X-Ray on several cards and check server logs for:
- No "Shop on eBay" titles in sold results
- All sold item URLs contain `/itm/`
- Console log shows filtered count: `[price-comps] Query: "..." | Scraped: N | After filter: M`

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat(xray): complete insert set support with data buildout"
```

---

## Summary of Files

| Action | File | Purpose |
|--------|------|---------|
| Create | `scripts/migrations/012-create-card-sets-table.sql` | New card_sets table |
| Create | `scripts/migrations/013-add-card-set-id-to-parallels.sql` | Add card_set_id, keep product_id |
| Create | `scripts/migrations/014-drop-parallels-product-id.sql` | Drop product_id after code updated |
| Modify | `lib/xray/types.ts` | Add optional insert field, MatchedCardSet interface |
| Modify | `lib/xray/db-matcher.ts` | Scoring-based matching, card_set support |
| Modify | `lib/xray/ebay-sold.ts` | Sponsored ad filtering, insert in query |
| Modify | `lib/xray/card-identity.ts` | Insert detection (INSERTS list, parser) |
| Modify | `app/api/xray/route.ts` | Pass cardSet data through |
| Modify | `app/components/xray/CardIdentitySection.tsx` | Show insert name |
| Modify | `app/components/xray/RarityRainbow.tsx` | Insert context, scoped rainbow |
| Modify | `app/components/xray/SetEducation.tsx` | Insert description |
| Modify | `app/xray/page.tsx` | Pass new props to components |
| Modify | `scripts/scrape-checklist.mjs` | Insert set parsing, batch mode, error isolation |
| Create | `scripts/load-inserts.mjs` | Load scraped inserts into Supabase |
| Create | `scripts/generate-checklist-urls.mjs` | Generate CC URLs with validation |
| Create | `data/checklist-urls-*.txt` | URL lists per sport |
