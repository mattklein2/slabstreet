# Phase 0: Card Database Buildout — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a comprehensive product and parallel database covering all major card releases from 2018-present across NBA, NFL, MLB, F1, and WNBA — expanding from ~63 products to 400-500+ products with 15,000-25,000 parallels.

**Architecture:** Automated scraping pipeline that pulls checklist data from Cardboard Connection (the most comprehensive public checklist source), parses it into our existing products/parallels schema, and bulk-inserts into Supabase. Augmented by manual seed scripts for products without good online checklists. Existing seed script patterns are preserved — new tooling generates the same format.

**Tech Stack:** Node.js scripts, Supabase (existing products/parallels tables), cheerio for HTML parsing, existing @supabase/supabase-js client

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `scripts/product-matrix.mjs` | Create | Defines every product to scrape/seed, organized by tier and sport |
| `scripts/scrape-checklist.mjs` | Create | Scrapes a Cardboard Connection checklist page for parallel data |
| `scripts/parse-checklist.mjs` | Create | Parses raw scraped HTML into our parallels schema format |
| `scripts/generate-seed.mjs` | Create | Generates seed SQL or JS from parsed checklist data |
| `scripts/bulk-seed.mjs` | Create | Runs seed inserts for a batch of products from the matrix |
| `scripts/audit-coverage.mjs` | Create | Reports which products in the matrix have been seeded vs missing |
| `data/checklists/` | Create | Directory for cached scraped checklist HTML/JSON |
| `data/product-matrix.json` | Create | The master list of all products to cover |

---

## Chunk 1: Product Matrix & Audit Tooling

### Task 1: Define the master product matrix

**Files:**
- Create: `data/product-matrix.json`
- Create: `scripts/product-matrix.mjs`

This is the source of truth for what products need to exist in our database. Every product 2018-present for NBA, NFL, MLB, F1, WNBA.

- [ ] **Step 1: Create the product matrix data file**

Create `data/product-matrix.json` with the following structure. Each entry represents a product that needs parallel data in our database:

```json
{
  "products": [
    {
      "brand": "Panini",
      "name": "Prizm",
      "sport": "NBA",
      "year": "2024-25",
      "tier": 1,
      "isFlagship": true,
      "checklistUrl": "https://www.cardboardconnection.com/2024-25-panini-prizm-basketball-cards",
      "status": "seeded",
      "existingProductId": "c0000000-0000-0000-0000-000000000001",
      "parallelCount": 81,
      "notes": ""
    }
  ]
}
```

**Tier definitions:**
- **Tier 1** — Flagships and highest-volume products (Prizm, Chrome, Select, Optic, Bowman Chrome). Build first.
- **Tier 2** — Major releases (Mosaic, Contenders, Donruss, National Treasures, Court Kings, Finest). Build second.
- **Tier 3** — Everything else (Hoops, Score, Heritage, niche products). Build last.

**Products to include per sport per year (2018-present):**

**NBA (Panini):** Prizm, Select, Optic, Mosaic, Contenders, Donruss, Hoops, Court Kings, National Treasures, Flawless, Immaculate, Crown Royale, Chronicles, Revolution, Spectra, Noir

**NFL (Panini):** Prizm, Select, Optic, Mosaic, Contenders, Donruss, Score, National Treasures, Flawless, Immaculate, Phoenix, Chronicles, Plates & Patches, Limited

**MLB (Topps):** Chrome, Series 1, Series 2, Update, Bowman, Bowman Chrome, Heritage, Finest, Stadium Club, Gypsy Queen, Allen & Ginter, Museum Collection, Tier One, Tribute, Diamond Icons
**MLB (Panini):** Prizm, Donruss, Chronicles, Select, National Treasures

**F1 (Topps):** Chrome F1, Flagship F1, Finest F1, Dynasty F1, Chrome Sapphire F1
**F1 (Panini):** Prizm F1 (if exists)

**WNBA (Panini):** Prizm WNBA, Select WNBA, Hoops WNBA, Donruss WNBA, Origins WNBA

For NBA/NFL: years 2018-19 through 2025-26 (7 seasons × ~15 products = ~105 per sport)
For MLB: years 2018 through 2025 (8 years × ~18 products = ~144)
For F1: years 2020 through 2025 (6 years × ~5 products = ~30)
For WNBA: years 2022 through 2025 (4 years × ~5 products = ~20)

**Total estimate: ~400-500 products**

Populate the matrix with every product you can identify. For products we already have seeded (check against existing seed scripts), mark `status: "seeded"` and include the `existingProductId`. For everything else, mark `status: "pending"`. Include the Cardboard Connection URL if you can find it (most products have one — the URL pattern is predictable: `cardboardconnection.com/YEAR-BRAND-PRODUCT-SPORT-cards`).

- [ ] **Step 2: Create the matrix helper script**

Create `scripts/product-matrix.mjs` that can:
- Read `data/product-matrix.json`
- Print summary stats (total products, by sport, by tier, by status)
- Filter by sport, tier, or status
- Usage: `node scripts/product-matrix.mjs --stats` or `node scripts/product-matrix.mjs --sport=NBA --tier=1 --status=pending`

- [ ] **Step 3: Commit**

```bash
git add data/product-matrix.json scripts/product-matrix.mjs
git commit -m "feat: add master product matrix with coverage tracking"
```

---

### Task 2: Build coverage audit tool

**Files:**
- Create: `scripts/audit-coverage.mjs`

- [ ] **Step 1: Build the audit script**

Create `scripts/audit-coverage.mjs` that:
- Reads the product matrix from `data/product-matrix.json`
- Queries Supabase for all existing products (select id, name, sport, year from products)
- Queries parallel counts per product
- Compares matrix entries against DB, reporting:
  - Products in matrix that exist in DB (with parallel count)
  - Products in matrix that are missing from DB
  - Products in DB that aren't in the matrix (orphans)
- Outputs a summary table

```
node scripts/audit-coverage.mjs

=== COVERAGE AUDIT ===
Matrix: 487 products defined
Database: 63 products exist (424 missing)

By Sport:
  NBA: 14/105 seeded (13%)
  NFL: 12/105 seeded (11%)
  MLB: 8/144 seeded (6%)
  F1:  5/30 seeded (17%)
  WNBA: 6/20 seeded (30%)

Tier 1 (Flagships): 22/85 seeded (26%)
Tier 2 (Major): 18/150 seeded (12%)
Tier 3 (Other): 5/252 seeded (2%)
```

- [ ] **Step 2: Commit**

```bash
git add scripts/audit-coverage.mjs
git commit -m "feat: add database coverage audit tool"
```

---

## Chunk 2: Checklist Scraping Pipeline

### Task 3: Build the checklist scraper

**Files:**
- Create: `scripts/scrape-checklist.mjs`
- Create: `data/checklists/` (directory)

- [ ] **Step 1: Install cheerio**

```bash
npm install cheerio
```

- [ ] **Step 2: Build the scraper**

Create `scripts/scrape-checklist.mjs` that:
- Takes a Cardboard Connection URL as input
- Fetches the page HTML (with appropriate User-Agent header and rate limiting)
- Saves raw HTML to `data/checklists/{sport}/{year}-{brand}-{product}.html`
- Parses the checklist page for parallel information

Cardboard Connection checklist pages follow a consistent structure:
- Parallel names are listed in sections (often under headers like "Parallels" or within card listings)
- Print runs are mentioned inline: "numbered to 99" or "/25" or "1/1"
- Box exclusivity is sometimes noted: "Hobby only" or "Retail exclusive"

The scraper should extract:
- All parallel names mentioned on the page
- Print runs (parse "/99", "numbered to 99", "numbered #/99", etc.)
- Any exclusivity notes
- Whether it's serial numbered or a 1/1

Usage: `node scripts/scrape-checklist.mjs "https://www.cardboardconnection.com/2024-25-panini-prizm-basketball-cards"`

Output: Saves parsed JSON to `data/checklists/nba/2024-25-panini-prizm.json`

```json
{
  "url": "https://...",
  "scrapedAt": "2026-03-14T...",
  "brand": "Panini",
  "product": "Prizm",
  "sport": "NBA",
  "year": "2024-25",
  "parallels": [
    { "name": "Base", "printRun": null, "serialNumbered": false, "isOneOfOne": false, "exclusivity": null },
    { "name": "Silver", "printRun": null, "serialNumbered": false, "isOneOfOne": false, "exclusivity": null },
    { "name": "Gold", "printRun": 10, "serialNumbered": true, "isOneOfOne": false, "exclusivity": "Hobby" },
    { "name": "Black", "printRun": 1, "serialNumbered": true, "isOneOfOne": true, "exclusivity": null }
  ]
}
```

- [ ] **Step 3: Test against a known product**

Run against 2024-25 Prizm NBA (we already have this data so we can verify accuracy):

```bash
node scripts/scrape-checklist.mjs "https://www.cardboardconnection.com/2024-25-panini-prizm-basketball-cards"
```

Compare output parallels against existing `scripts/seed-prizm-2024-25-nba.mjs` (81 parallels). The scraper won't catch everything (color_hex, rarity_rank, descriptions need manual input) but should get parallel names, print runs, and serial numbering right for most entries.

- [ ] **Step 4: Commit**

```bash
git add scripts/scrape-checklist.mjs data/checklists/.gitkeep
git commit -m "feat: add Cardboard Connection checklist scraper"
```

---

### Task 4: Build the seed generator

**Files:**
- Create: `scripts/generate-seed.mjs`

- [ ] **Step 1: Build the generator**

Create `scripts/generate-seed.mjs` that:
- Takes a parsed checklist JSON file as input
- Generates a seed script in the same format as existing seed scripts
- Auto-assigns rarity_rank based on print run (lower print run = higher rank):
  - Unnumbered, non-exclusive parallels: rank 1-10 (by name recognition heuristics — Base=1, Silver=2, etc.)
  - Unnumbered exclusives: rank 10-20
  - Numbered /299+: rank 20-30
  - Numbered /100-298: rank 30-40
  - Numbered /50-99: rank 40-50
  - Numbered /25-49: rank 50-60
  - Numbered /10-24: rank 60-70
  - Numbered /5-9: rank 70-75
  - Numbered /1: rank 80
- Auto-assigns color_hex using a color dictionary for common parallel names:
  - Silver: #C0C0C0, Gold: #FFD700, Red: #DC143C, Blue: #1E90FF, Green: #228B22, Black: #1A1A1A, Pink: #FF69B4, Purple: #800080, Orange: #FF8C00, White: #F5F5F5, etc.
- Auto-generates descriptions based on parallel name and attributes
- Generates a UUID for the product if it's new (or uses existing ID from matrix)

Usage:
```bash
node scripts/generate-seed.mjs data/checklists/nba/2024-25-panini-prizm.json
```

Output: Creates `scripts/seed-prizm-2024-25-nba.generated.mjs` in the same format as hand-written seed scripts. The file includes a `// GENERATED — review before running` header comment.

- [ ] **Step 2: Test against known product**

Generate a seed script for 2024-25 Prizm NBA and compare against the hand-written one:

```bash
node scripts/generate-seed.mjs data/checklists/nba/2024-25-panini-prizm.json
diff scripts/seed-prizm-2024-25-nba.mjs scripts/seed-prizm-2024-25-nba.generated.mjs
```

The generated version won't be identical (hand-written ones have custom descriptions and exact color_hex values) but should have the same parallel names and correct print runs.

- [ ] **Step 3: Commit**

```bash
git add scripts/generate-seed.mjs
git commit -m "feat: add seed script generator from scraped checklists"
```

---

### Task 5: Build the bulk seeding tool

**Files:**
- Create: `scripts/bulk-seed.mjs`

- [ ] **Step 1: Build the bulk seeder**

Create `scripts/bulk-seed.mjs` that:
- Takes a sport and tier filter (e.g., `--sport=NBA --tier=1`)
- Reads the product matrix for matching pending products
- For each product:
  1. Checks if checklist JSON exists in `data/checklists/`
  2. If not, attempts to scrape it (calls scrape-checklist logic)
  3. Generates seed data from parsed checklist
  4. Upserts the product record into `products` table
  5. Upserts all parallels into `parallels` table
  6. Updates the product matrix status to "seeded"
- Includes `--dry-run` flag to preview without inserting
- Rate-limits scraping (2 second delay between requests)
- Logs progress: `[12/85] Seeding 2022-23 Prizm NBA — 76 parallels found...`

Usage:
```bash
node scripts/bulk-seed.mjs --sport=NBA --tier=1 --dry-run
node scripts/bulk-seed.mjs --sport=NBA --tier=1
```

- [ ] **Step 2: Commit**

```bash
git add scripts/bulk-seed.mjs
git commit -m "feat: add bulk seeding tool for automated product population"
```

---

## Chunk 3: Tier 1 Population (Flagships)

### Task 6: Seed Tier 1 — NBA Flagships (2018-present)

**Tier 1 NBA products (7 seasons):**
- Prizm: 2018-19 through 2024-25
- Select: 2018-19 through 2024-25
- Optic: 2018-19 through 2024-25

That's ~21 products. Some already exist (2024-25 season).

- [ ] **Step 1: Run bulk seed for NBA Tier 1**

```bash
node scripts/bulk-seed.mjs --sport=NBA --tier=1
```

- [ ] **Step 2: Audit results**

```bash
node scripts/audit-coverage.mjs --sport=NBA --tier=1
```

Expected: All Tier 1 NBA products seeded with parallel data.

- [ ] **Step 3: Spot-check data quality**

Pick 3 products and verify parallel data against Cardboard Connection manually. Check:
- All major parallels present (Silver, Gold, Black, numbered variants)
- Print runs correct
- Rarity ranks in reasonable order
- No duplicate parallels

- [ ] **Step 4: Commit updated matrix**

```bash
git add data/product-matrix.json
git commit -m "data: seed Tier 1 NBA flagships (2018-present)"
```

---

### Task 7: Seed Tier 1 — NFL Flagships (2018-present)

**Tier 1 NFL products (7 seasons):**
- Prizm: 2018 through 2024
- Select: 2018 through 2024
- Optic: 2018 through 2024

~21 products.

- [ ] **Step 1: Run bulk seed for NFL Tier 1**

```bash
node scripts/bulk-seed.mjs --sport=NFL --tier=1
```

- [ ] **Step 2: Audit and spot-check**

```bash
node scripts/audit-coverage.mjs --sport=NFL --tier=1
```

- [ ] **Step 3: Commit**

```bash
git add data/product-matrix.json
git commit -m "data: seed Tier 1 NFL flagships (2018-present)"
```

---

### Task 8: Seed Tier 1 — MLB Flagships (2018-present)

**Tier 1 MLB products (8 years):**
- Topps Chrome: 2018 through 2025
- Bowman Chrome: 2018 through 2025

~16 products.

- [ ] **Step 1: Run bulk seed for MLB Tier 1**

```bash
node scripts/bulk-seed.mjs --sport=MLB --tier=1
```

- [ ] **Step 2: Audit and spot-check**

```bash
node scripts/audit-coverage.mjs --sport=MLB --tier=1
```

- [ ] **Step 3: Commit**

```bash
git add data/product-matrix.json
git commit -m "data: seed Tier 1 MLB flagships (2018-present)"
```

---

### Task 9: Seed Tier 1 — F1 and WNBA

**F1 Tier 1 (2020-present):** Topps Chrome F1 (6 products)
**WNBA Tier 1 (2022-present):** Prizm WNBA, Select WNBA (8 products)

- [ ] **Step 1: Run bulk seed**

```bash
node scripts/bulk-seed.mjs --sport=F1 --tier=1
node scripts/bulk-seed.mjs --sport=WNBA --tier=1
```

- [ ] **Step 2: Audit**

```bash
node scripts/audit-coverage.mjs
```

- [ ] **Step 3: Commit**

```bash
git add data/product-matrix.json
git commit -m "data: seed Tier 1 F1 and WNBA flagships"
```

---

## Chunk 4: Tier 2 Population

### Task 10: Seed Tier 2 — All Sports

**Tier 2 products (~150 total):**
- NBA: Mosaic, Contenders, Donruss, Court Kings, National Treasures, Hoops, Revolution, Crown Royale
- NFL: Mosaic, Contenders, Donruss, Score, National Treasures, Phoenix
- MLB: Series 1, Series 2, Update, Bowman, Heritage, Finest, Stadium Club
- F1: Finest F1, Dynasty F1, Sapphire F1
- WNBA: Donruss, Hoops, Origins

- [ ] **Step 1: Run bulk seed for each sport**

```bash
node scripts/bulk-seed.mjs --sport=NBA --tier=2
node scripts/bulk-seed.mjs --sport=NFL --tier=2
node scripts/bulk-seed.mjs --sport=MLB --tier=2
node scripts/bulk-seed.mjs --sport=F1 --tier=2
node scripts/bulk-seed.mjs --sport=WNBA --tier=2
```

- [ ] **Step 2: Full audit**

```bash
node scripts/audit-coverage.mjs
```

Expected: Tier 1 + Tier 2 complete. ~250+ products seeded.

- [ ] **Step 3: Fix any scraping failures**

Some Cardboard Connection pages may have unusual formatting. For products that failed to scrape:
- Check the saved HTML in `data/checklists/`
- Manually create seed scripts following existing patterns
- Run individual seed scripts

- [ ] **Step 4: Commit**

```bash
git add data/product-matrix.json scripts/seed-*.mjs
git commit -m "data: seed Tier 2 products across all sports"
```

---

## Chunk 5: Tier 3 & Cleanup

### Task 11: Seed Tier 3 — Remaining Products

Tier 3 includes niche and lower-volume products. Run the bulk seeder for remaining pending products.

- [ ] **Step 1: Run bulk seed for Tier 3**

```bash
node scripts/bulk-seed.mjs --tier=3
```

- [ ] **Step 2: Handle failures manually**

For any products that fail scraping, create manual seed scripts or skip if the product is too niche to matter for Card X-Ray.

- [ ] **Step 3: Final audit**

```bash
node scripts/audit-coverage.mjs
```

Target: 90%+ of the matrix seeded. Some obscure products may not have Cardboard Connection pages.

- [ ] **Step 4: Commit**

```bash
git add data/product-matrix.json
git commit -m "data: seed Tier 3 products, complete initial database buildout"
```

---

### Task 12: Data quality review

- [ ] **Step 1: Run quality checks**

Create and run a quick validation script that checks:
- No products with 0 parallels
- All parallels have rarity_rank assigned
- No duplicate parallel names within a product
- Print runs are reasonable (not negative, 1/1 cards marked correctly)
- At least 5 parallels per product (any less is suspicious)

- [ ] **Step 2: Fix any issues found**

- [ ] **Step 3: Final commit and push**

```bash
git add -A
git commit -m "data: complete Phase 0 database buildout — 400+ products seeded"
git push origin master
```

---

## Summary

After Phase 0 is complete, the database should contain:
- **400-500 products** across NBA, NFL, MLB, F1, WNBA (2018-present)
- **15,000-25,000 parallels** with rarity rankings, print runs, and descriptions
- **Automated pipeline** for adding new products as they release
- **Audit tooling** to track coverage gaps

This data foundation enables Phase 1 (Card X-Ray tool) to match almost any modern card a user looks up on eBay.
