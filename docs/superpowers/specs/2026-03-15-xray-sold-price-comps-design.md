# X-Ray Sold Price Comps — Design Spec

**Date:** 2026-03-15
**Status:** Approved
**Replaces:** Phase 1 active-listings-only price comps

## Problem

The current Price Context section uses eBay Browse API active listings (asking prices). These are unreliable — anyone can list a $5 card for $500. We need actual sold/completed data to provide real market signal.

## Solution

Scrape eBay's sold listings page server-side using cheerio (already installed). Segment results into raw vs graded buckets. Show sold data as primary, with active listings as fallback only when no sold data exists.

## Data Layer: Sold Listings Scraper

### Source
eBay sold listings search page: `ebay.com/sch/i.html?_nkw={query}&_sacat=261328&LH_Sold=1&LH_Complete=1&_sop=13`

- Category 261328 = Sports Trading Cards
- `LH_Sold=1&LH_Complete=1` = sold/completed items only
- `_sop=13` = sort by end date (most recent first)

### Query Construction
Build from card identity: `{year} {set} {player} {parallel}`
- Omit brand (eBay set names usually include it)
- Include parallel unless it's "Base"
- Include card number if available

### Parsing
Each sold item extracted via cheerio:
- **title**: listing title text
- **price**: final sale price (USD)
- **date**: sale date
- **url**: link to the listing

### Graded Detection
Scan each sold item's title for grader names: PSA, BGS, SGC, CGC, CSG, HGA.
Extract grade number when found. Tag each item as:
```typescript
{ type: 'raw' } | { type: 'graded', grader: string, grade: string }
```

### Filtering
Minimal — every sale is real signal:
- Remove $0.01 / $0.99 listings (shipping-only or test)
- Keep everything else, including high sales

### Return
Up to 60 sold items with title, price, date, url, and raw/graded tag.

## Price Stats

### Two Segments
Compute stats independently for raw and graded sales:
- **Low**: lowest sale price
- **Median**: middle sale price
- **High**: highest sale price
- **Count**: number of sales

### Adaptive Display by Count
- **1 sale**: "Last sold for $X on [date]"
- **2-4 sales**: Show each sale individually + range
- **5+ sales**: Show low / median / high + count + recent sales list

### Primary vs Secondary Segment
- If the X-Ray'd card is graded → graded bucket is primary
- If raw → raw bucket is primary
- Both segments always shown; secondary is collapsed/muted

### vs Market Comparison
Compare listing price against relevant segment's median (or single sale if count = 1):
- Green: below median (good deal)
- Red: above median (overpriced)
- Amber: within 15% of median (fair)

## UI: Price Context Section

### Header
"PRICE CONTEXT" (green, uppercase, monospace) with subtitle: "Based on X recent eBay sales"

### Primary Stats Row
Stats for the relevant segment (raw or graded):
- This Listing: $X | Sold Median: $X | Low: $X | High: $X
- Color-coded vs-market sentence below

### Secondary Segment
Collapsed by default, expandable. Shows the other segment's stats.
- "Graded sales (PSA/BGS)" or "Raw sales" label
- Same stats format, smaller/muted styling

### Recent Sales List
Up to 8 most recent sales:
- Title (truncated) | Sale price | Date sold
- Each links to the eBay listing
- Graded sales show a badge (e.g. "PSA 9")

### Fallback (No Sold Data)
When no sold listings found:
- Fall back to active listings from Browse API
- Label clearly: "Current asking prices — no recent sales found"
- Amber warning that these are asks, not sales

### No Data
"Not enough data to show price comparisons for this card."

## Files Changed

| File | Change |
|------|--------|
| `lib/xray/ebay-client.ts` | Add `searchSoldListings()` — cheerio scraper |
| `lib/xray/price-comps.ts` | Rewrite to use sold data, segment raw/graded, adaptive stats |
| `lib/xray/types.ts` | Update `PriceComps`, `CompListing` types for sold data |
| `app/components/xray/PriceContext.tsx` | Rewrite UI for sold data, segments, fallback |
| `app/api/xray/route.ts` | No change (already calls `getPriceComps`) |

## What We Keep
- Browse API `searchComps()` stays as fallback source
- Same color-coded vs-market logic (green/red/amber thresholds)
- Same section styling (surface bg, 14px border-radius, monospace headers)

## What We Drop
- Active listings as primary data source
- 10x-median outlier filter (sold data is inherently trustworthy)
