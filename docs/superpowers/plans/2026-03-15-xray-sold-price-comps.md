# X-Ray Sold Price Comps Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace active-listing asking prices with real eBay sold data in the X-Ray Price Context section.

**Architecture:** Server-side cheerio scraper fetches eBay sold listings page, parses titles/prices/dates, tags each as raw or graded. Stats computed per segment. UI shows primary segment with expandable secondary. Active listings kept as fallback only.

**Tech Stack:** cheerio (installed), Next.js API route, React inline styles, ThemeProvider colors

**Spec:** `docs/superpowers/specs/2026-03-15-xray-sold-price-comps-design.md`

---

## File Structure

| File | Responsibility |
|------|---------------|
| `lib/xray/ebay-sold.ts` | **NEW** — Scrape eBay sold listings page, parse with cheerio, return structured sold items |
| `lib/xray/types.ts` | **MODIFY** — Update PriceComps/CompListing types for sold data + segments |
| `lib/xray/price-comps.ts` | **REWRITE** — Use sold data as primary, segment raw/graded, adaptive stats, active-listing fallback |
| `app/components/xray/PriceContext.tsx` | **REWRITE** — Segmented display, adaptive layout by count, fallback UI |
| `lib/xray/ebay-client.ts` | **NO CHANGE** — Keep `searchComps()` as-is for fallback |
| `app/api/xray/route.ts` | **NO CHANGE** — Already calls `getPriceComps(identity, listing.price)` |

---

## Task 1: Create the eBay Sold Listings Scraper

**Files:**
- Create: `lib/xray/ebay-sold.ts`

- [ ] **Step 1: Create `lib/xray/ebay-sold.ts` with `searchSoldListings()`**

```typescript
// lib/xray/ebay-sold.ts

import * as cheerio from 'cheerio';
import type { CardIdentity } from './types';

const GRADERS = ['PSA', 'BGS', 'SGC', 'CGC', 'CSG', 'HGA'];
const GRADE_RE = new RegExp(`\\b(${GRADERS.join('|')})\\s*(\\d+\\.?\\d*)\\b`, 'i');

export interface SoldItem {
  title: string;
  price: number;
  date: string;       // "Mar 14, 2026"
  url: string;
  condition: 'raw' | 'graded';
  grader: string | null;
  grade: string | null;
}

/**
 * Build a search query from card identity for sold listings.
 * Omits brand (eBay set names include it). Includes parallel unless "Base".
 */
export function buildSoldQuery(identity: CardIdentity): string | null {
  const parts: string[] = [];
  if (identity.year) parts.push(identity.year);
  if (identity.set) {
    // Clean set name: strip brand/year that eBay often includes
    const cleanSet = identity.set
      .replace(/\b(panini|topps|upper\s*deck|bowman|donruss|leaf|fleer|score)\b/gi, '')
      .replace(/\b20\d{2}(?:-\d{2})?\b/g, '')
      .trim()
      .replace(/\s+/g, ' ');
    if (cleanSet) parts.push(cleanSet);
  }
  if (identity.player) parts.push(identity.player);
  if (identity.parallel && identity.parallel.toLowerCase() !== 'base') {
    parts.push(identity.parallel);
  }
  // Need at least 3 parts for a meaningful query
  return parts.length >= 3 ? parts.join(' ') : null;
}

/**
 * Detect grading info from a listing title.
 */
function detectGrade(title: string): Pick<SoldItem, 'condition' | 'grader' | 'grade'> {
  const match = title.match(GRADE_RE);
  if (match) {
    return { condition: 'graded', grader: match[1].toUpperCase(), grade: match[2] };
  }
  return { condition: 'raw', grader: null, grade: null };
}

/**
 * Scrape eBay sold listings page for a given query.
 * Returns up to 60 sold items sorted by most recent.
 */
export async function searchSoldListings(query: string): Promise<SoldItem[]> {
  const encoded = encodeURIComponent(query);
  const url = `https://www.ebay.com/sch/i.html?_nkw=${encoded}&_sacat=261328&LH_Sold=1&LH_Complete=1&_sop=13&_ipg=120`;

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });

  if (!res.ok) {
    console.error('eBay sold page fetch error:', res.status);
    return [];
  }

  const html = await res.text();
  const $ = cheerio.load(html);
  const items: SoldItem[] = [];

  $('[data-viewport]').each((_i, el) => {
    const container = $(el);
    const titleEl = container.find('a[href*="/itm/"]');
    const title = titleEl.text().trim();
    const itemUrl = titleEl.attr('href') || '';

    if (!title || !itemUrl) return;

    // Extract price — look for dollar amounts in the item text
    const text = container.text();
    const priceMatches = text.match(/\$[\d,]+\.?\d*/g);
    if (!priceMatches || priceMatches.length === 0) return;

    // First price match in the listing area is typically the sale price
    const price = parseFloat(priceMatches[0].replace(/[$,]/g, ''));

    // Filter shipping-only / test listings
    if (price < 1) return;

    // Extract sold date
    const dateMatch = text.match(/Sold\s+([\w]+\s+\d+,?\s*\d*)/i);
    const date = dateMatch ? dateMatch[1].replace(/\s+/g, ' ').trim() : '';

    const gradeInfo = detectGrade(title);

    items.push({
      title,
      price,
      date,
      url: itemUrl.startsWith('http') ? itemUrl : `https://www.ebay.com${itemUrl}`,
      ...gradeInfo,
    });
  });

  return items.slice(0, 60);
}
```

- [ ] **Step 2: Verify the scraper works**

Run:
```bash
node -e "
const {searchSoldListings,buildSoldQuery}=require('./lib/xray/ebay-sold');
(async()=>{
  const q=buildSoldQuery({year:'2024',set:'Select',player:'Caleb Williams',parallel:'Zebra Prizm'});
  console.log('Query:',q);
  const items=await searchSoldListings(q);
  console.log('Found:',items.length,'sold items');
  console.log('Raw:',items.filter(i=>i.condition==='raw').length);
  console.log('Graded:',items.filter(i=>i.condition==='graded').length);
  items.slice(0,5).forEach(i=>console.log(' $'+i.price,i.condition,i.grader||'','-',i.title.substring(0,60)));
})()
"
```

Expected: 20-60 sold items, mix of raw and graded, prices in $100-$1000+ range.

- [ ] **Step 3: Commit**

```bash
git add lib/xray/ebay-sold.ts
git commit -m "feat(xray): add eBay sold listings scraper with cheerio"
```

---

## Task 2: Update Types for Sold Data

**Files:**
- Modify: `lib/xray/types.ts`

- [ ] **Step 1: Update PriceComps and CompListing types**

Replace the current `PriceComps` and `CompListing` interfaces (lines 72-89) with:

```typescript
/** Grading info for a sold listing */
export interface GradeInfo {
  grader: string;  // PSA, BGS, SGC, etc.
  grade: string;   // "10", "9.5", etc.
}

/** A single sold or active comp listing */
export interface CompListing {
  title: string;
  price: number;
  url: string;
  date: string;              // "Mar 14, 2026" or "" for active listings
  condition: 'raw' | 'graded';
  gradeInfo: GradeInfo | null;
}

/** Stats for a price segment (raw or graded) */
export interface SegmentStats {
  low: number;
  median: number;
  high: number;
  count: number;
  listings: CompListing[];   // all listings in this segment, most recent first
}

/** Computed price context from eBay sold + active data */
export interface PriceComps {
  source: 'sold' | 'active';      // which data source was used
  raw: SegmentStats | null;        // raw card sales
  graded: SegmentStats | null;     // graded card sales
  primarySegment: 'raw' | 'graded'; // which segment to highlight
  listingPrice: number;             // current listing price
  vsMedian: number | null;          // % above/below primary segment median
  totalCount: number;               // total sales across both segments
}
```

- [ ] **Step 2: Verify types compile**

Run:
```bash
npx tsc --noEmit lib/xray/types.ts
```

Expected: Compilation errors in files that reference old PriceComps shape (price-comps.ts, PriceContext.tsx). That's expected — we fix those in the next tasks.

- [ ] **Step 3: Commit**

```bash
git add lib/xray/types.ts
git commit -m "feat(xray): update PriceComps types for sold data segments"
```

---

## Task 3: Rewrite Price Comps Engine

**Files:**
- Rewrite: `lib/xray/price-comps.ts`

- [ ] **Step 1: Rewrite `price-comps.ts` with sold data + fallback logic**

```typescript
// lib/xray/price-comps.ts

import { searchSoldListings, buildSoldQuery } from './ebay-sold';
import { searchComps } from './ebay-client';
import type { CardIdentity, PriceComps, CompListing, SegmentStats } from './types';

/**
 * Compute stats for a list of comp listings.
 */
function computeStats(listings: CompListing[]): SegmentStats | null {
  if (listings.length === 0) return null;
  const prices = listings.map(l => l.price).sort((a, b) => a - b);
  return {
    low: prices[0],
    median: prices[Math.floor(prices.length / 2)],
    high: prices[prices.length - 1],
    count: prices.length,
    listings,
  };
}

/**
 * Build price comps from sold data (primary) or active listings (fallback).
 */
export async function getPriceComps(
  identity: CardIdentity,
  listingPrice: number,
): Promise<PriceComps | null> {
  const query = buildSoldQuery(identity);
  if (!query) return null;

  // Try sold data first
  const soldItems = await searchSoldListings(query);

  if (soldItems.length > 0) {
    // Convert to CompListing format
    const allComps: CompListing[] = soldItems.map(item => ({
      title: item.title,
      price: item.price,
      url: item.url,
      date: item.date,
      condition: item.condition,
      gradeInfo: item.grader ? { grader: item.grader, grade: item.grade! } : null,
    }));

    const rawListings = allComps.filter(c => c.condition === 'raw');
    const gradedListings = allComps.filter(c => c.condition === 'graded');

    const rawStats = computeStats(rawListings);
    const gradedStats = computeStats(gradedListings);

    // Determine primary segment based on the card being X-Ray'd
    const primarySegment: 'raw' | 'graded' = identity.isGraded ? 'graded' : 'raw';
    const primaryStats = primarySegment === 'raw' ? rawStats : gradedStats;

    // vs Median: compare listing price against primary segment
    let vsMedian: number | null = null;
    if (primaryStats && primaryStats.median > 0) {
      vsMedian = Math.round(((listingPrice - primaryStats.median) / primaryStats.median) * 100);
    }

    return {
      source: 'sold',
      raw: rawStats,
      graded: gradedStats,
      primarySegment,
      listingPrice,
      vsMedian,
      totalCount: soldItems.length,
    };
  }

  // Fallback: active listings from Browse API
  try {
    const queryParts: string[] = [];
    if (identity.year) queryParts.push(identity.year);
    if (identity.brand) queryParts.push(identity.brand);
    if (identity.set) queryParts.push(identity.set);
    if (identity.player) queryParts.push(identity.player);
    if (identity.parallel && identity.parallel.toLowerCase() !== 'base') {
      queryParts.push(identity.parallel);
    }
    if (queryParts.length < 3) return null;

    const items = await searchComps(queryParts.join(' '), 20);
    if (items.length === 0) return null;

    const allComps: CompListing[] = items
      .map(item => ({
        title: item.title,
        price: parseFloat(item.price.value) || 0,
        url: item.itemWebUrl,
        date: '',
        condition: 'raw' as const,
        gradeInfo: null,
      }))
      .filter(c => c.price > 0);

    if (allComps.length === 0) return null;

    const stats = computeStats(allComps);

    let vsMedian: number | null = null;
    if (stats && stats.median > 0) {
      vsMedian = Math.round(((listingPrice - stats.median) / stats.median) * 100);
    }

    return {
      source: 'active',
      raw: stats,
      graded: null,
      primarySegment: 'raw',
      listingPrice,
      vsMedian,
      totalCount: allComps.length,
    };
  } catch (err) {
    console.error('Price comps fallback error:', err);
    return null;
  }
}
```

- [ ] **Step 2: Verify it compiles**

Run:
```bash
npx tsc --noEmit lib/xray/price-comps.ts
```

Expected: No errors (or only downstream UI errors).

- [ ] **Step 3: Test with a real query**

Run:
```bash
node -e "
const {getPriceComps}=require('./lib/xray/price-comps');
(async()=>{
  const identity={year:'2024',set:'Select',player:'Caleb Williams',parallel:'Zebra Prizm',isGraded:false,brand:'Panini'};
  const result=await getPriceComps(identity,299.99);
  console.log('Source:',result?.source);
  console.log('Raw:',result?.raw?.count,'sales, median $'+result?.raw?.median);
  console.log('Graded:',result?.graded?.count,'sales, median $'+result?.graded?.median);
  console.log('Primary:',result?.primarySegment);
  console.log('vs Median:',result?.vsMedian+'%');
})()
"
```

Expected: `source: 'sold'`, raw and graded counts, reasonable median prices.

- [ ] **Step 4: Commit**

```bash
git add lib/xray/price-comps.ts
git commit -m "feat(xray): rewrite price comps to use sold data with active fallback"
```

---

## Task 4: Rewrite Price Context UI

**Files:**
- Rewrite: `app/components/xray/PriceContext.tsx`

- [ ] **Step 1: Rewrite `PriceContext.tsx` with segmented sold data display**

```typescript
// app/components/xray/PriceContext.tsx
'use client';

import { useState } from 'react';
import { useTheme } from '../ThemeProvider';
import type { PriceComps, SegmentStats, CompListing } from '../../../lib/xray/types';

interface Props {
  priceComps: PriceComps | null;
}

export function PriceContext({ priceComps }: Props) {
  const { colors } = useTheme();
  const [showSecondary, setShowSecondary] = useState(false);

  // ── No data state ──
  if (!priceComps) {
    return (
      <section style={{ background: colors.surface, borderRadius: 14, padding: 24, marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 14, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, letterSpacing: 1, color: colors.green, textTransform: 'uppercase' }}>
          Price Context
        </h2>
        <p style={{ marginTop: 12, fontSize: 14, color: colors.muted, fontFamily: "'IBM Plex Sans', sans-serif" }}>
          Not enough data to show price comparisons for this card.
        </p>
      </section>
    );
  }

  const { source, raw, graded, primarySegment, listingPrice, vsMedian, totalCount } = priceComps;
  const primary = primarySegment === 'raw' ? raw : graded;
  const secondary = primarySegment === 'raw' ? graded : raw;
  const primaryLabel = primarySegment === 'raw' ? 'Raw' : 'Graded';
  const secondaryLabel = primarySegment === 'raw' ? 'Graded' : 'Raw';

  const vsColor = vsMedian === null ? colors.muted
    : vsMedian > 15 ? colors.red
    : vsMedian < -15 ? colors.green
    : colors.amber;

  const vsLabel = vsMedian === null ? ''
    : vsMedian > 0 ? `${vsMedian}% above`
    : vsMedian < 0 ? `${Math.abs(vsMedian)}% below`
    : 'at';

  return (
    <section style={{ background: colors.surface, borderRadius: 14, padding: 24, marginBottom: 16 }}>
      {/* Header */}
      <h2 style={{ margin: '0 0 4px', fontSize: 14, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, letterSpacing: 1, color: colors.green, textTransform: 'uppercase' }}>
        Price Context
      </h2>
      <p style={{ margin: '0 0 16px', fontSize: 13, color: colors.muted, fontFamily: "'IBM Plex Sans', sans-serif" }}>
        {source === 'sold'
          ? `Based on ${totalCount} recent eBay sale${totalCount !== 1 ? 's' : ''}`
          : 'Current asking prices — no recent sales found'}
      </p>

      {/* Active listings warning */}
      {source === 'active' && (
        <div style={{ padding: '8px 12px', borderRadius: 8, background: `${colors.amber}18`, border: `1px solid ${colors.amber}40`, marginBottom: 16, fontSize: 13, color: colors.amber, fontFamily: "'IBM Plex Sans', sans-serif" }}>
          These are asking prices, not actual sales. Prices may not reflect true market value.
        </div>
      )}

      {/* Primary segment */}
      {primary && <StatsBlock stats={primary} label={`${primaryLabel} Sales`} listingPrice={listingPrice} vsMedian={vsMedian} vsColor={vsColor} vsLabel={vsLabel} colors={colors} isPrimary />}

      {/* Secondary segment toggle */}
      {secondary && secondary.count > 0 && (
        <>
          <button
            onClick={() => setShowSecondary(!showSecondary)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0',
              fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", color: colors.muted,
              textTransform: 'uppercase', letterSpacing: 0.5,
            }}
          >
            {showSecondary ? '▾' : '▸'} {secondaryLabel} Sales ({secondary.count})
          </button>
          {showSecondary && <StatsBlock stats={secondary} label={`${secondaryLabel} Sales`} listingPrice={listingPrice} vsMedian={null} vsColor={colors.muted} vsLabel="" colors={colors} isPrimary={false} />}
        </>
      )}
    </section>
  );
}

// ── Stats display block ──

interface StatsBlockProps {
  stats: SegmentStats;
  label: string;
  listingPrice: number;
  vsMedian: number | null;
  vsColor: string;
  vsLabel: string;
  colors: any;
  isPrimary: boolean;
}

function StatsBlock({ stats, label, listingPrice, vsMedian, vsColor, vsLabel, colors, isPrimary }: StatsBlockProps) {
  const textScale = isPrimary ? 1 : 0.85;

  // Adaptive display based on count
  if (stats.count === 1) {
    const sale = stats.listings[0];
    return (
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 14 * textScale, fontFamily: "'IBM Plex Sans', sans-serif", color: colors.secondary, margin: '0 0 8px' }}>
          Last sold for{' '}
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, color: colors.text }}>
            ${sale.price.toFixed(2)}
          </span>
          {sale.date && ` on ${sale.date}`}
          {sale.gradeInfo && ` (${sale.gradeInfo.grader} ${sale.gradeInfo.grade})`}
        </p>
        {isPrimary && vsMedian !== null && (
          <VsStatement listingPrice={listingPrice} vsMedian={vsMedian} vsColor={vsColor} vsLabel={vsLabel} count={1} colors={colors} source="sale" />
        )}
      </div>
    );
  }

  if (stats.count <= 4) {
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
          {stats.listings.map((sale, i) => (
            <SaleRow key={i} sale={sale} colors={colors} textScale={textScale} />
          ))}
        </div>
        <p style={{ fontSize: 13 * textScale, color: colors.muted, fontFamily: "'IBM Plex Sans', sans-serif", margin: 0 }}>
          Range: ${stats.low.toFixed(2)} – ${stats.high.toFixed(2)}
        </p>
        {isPrimary && vsMedian !== null && (
          <VsStatement listingPrice={listingPrice} vsMedian={vsMedian} vsColor={vsColor} vsLabel={vsLabel} count={stats.count} colors={colors} source="sale" />
        )}
      </div>
    );
  }

  // 5+ sales: full stats view
  return (
    <div style={{ marginBottom: 16 }}>
      {/* Stats row */}
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 12 }}>
        {[
          { label: 'This Listing', value: `$${listingPrice.toFixed(2)}`, color: colors.text },
          { label: 'Sold Median', value: `$${stats.median.toFixed(2)}`, color: colors.cyan },
          { label: 'Low', value: `$${stats.low.toFixed(2)}`, color: colors.green },
          { label: 'High', value: `$${stats.high.toFixed(2)}`, color: colors.red },
        ].map(stat => (
          <div key={stat.label} style={{ minWidth: 80 }}>
            <div style={{ fontSize: 11 * textScale, fontFamily: "'IBM Plex Mono', monospace", color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
              {stat.label}
            </div>
            <div style={{ fontSize: 20 * textScale, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, color: stat.color }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {isPrimary && vsMedian !== null && (
        <VsStatement listingPrice={listingPrice} vsMedian={vsMedian} vsColor={vsColor} vsLabel={vsLabel} count={stats.count} colors={colors} source="sale" />
      )}

      {/* Recent sales list */}
      <h3 style={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.5, margin: '12px 0 8px' }}>
        Recent Sales ({stats.count})
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {stats.listings.slice(0, 8).map((sale, i) => (
          <SaleRow key={i} sale={sale} colors={colors} textScale={1} />
        ))}
      </div>
    </div>
  );
}

// ── Sale row component ──

function SaleRow({ sale, colors, textScale }: { sale: CompListing; colors: any; textScale: number }) {
  return (
    <a
      href={sale.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '8px 12px', borderRadius: 8, background: `${colors.border}40`,
        textDecoration: 'none', gap: 12,
      }}
    >
      <span style={{ fontSize: 13 * textScale, fontFamily: "'IBM Plex Sans', sans-serif", color: colors.secondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
        {sale.title}
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {sale.gradeInfo && (
          <span style={{ fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, color: colors.cyan, border: `1px solid ${colors.cyan}40`, background: `${colors.cyan}15`, padding: '1px 5px', borderRadius: 4 }}>
            {sale.gradeInfo.grader} {sale.gradeInfo.grade}
          </span>
        )}
        {sale.date && (
          <span style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: colors.muted, minWidth: 60 }}>
            {sale.date}
          </span>
        )}
        <span style={{ fontSize: 14 * textScale, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, color: colors.text, minWidth: 70, textAlign: 'right' }}>
          ${sale.price.toFixed(2)}
        </span>
      </span>
    </a>
  );
}

// ── vs Market statement ──

function VsStatement({ listingPrice, vsMedian, vsColor, vsLabel, count, colors, source }: {
  listingPrice: number; vsMedian: number; vsColor: string; vsLabel: string; count: number; colors: any; source: string;
}) {
  return (
    <p style={{ fontSize: 14, fontFamily: "'IBM Plex Sans', sans-serif", color: colors.secondary, margin: '8px 0 0' }}>
      This listing is{' '}
      <span style={{ color: vsColor, fontWeight: 600 }}>{vsLabel} median</span>
      {' '}based on {count} recent {source}{count !== 1 ? 's' : ''}.
    </p>
  );
}
```

- [ ] **Step 2: Build and verify no errors**

Run:
```bash
npm run build
```

Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add app/components/xray/PriceContext.tsx
git commit -m "feat(xray): rewrite PriceContext UI for sold data segments"
```

---

## Task 5: Integration Test & Deploy

- [ ] **Step 1: Build the project**

Run:
```bash
npm run build
```

Expected: Clean build, no errors.

- [ ] **Step 2: Start server and test with real eBay link**

Start the prod server and test the full X-Ray pipeline:

```bash
npm run start &
sleep 4
curl -s -X POST http://localhost:3000/api/xray \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://www.ebay.com/itm/366275837104"}' | node -e "
let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{
  const r=JSON.parse(d);
  console.log('Status:', r.status);
  console.log('Price source:', r.priceComps?.source);
  console.log('Raw sales:', r.priceComps?.raw?.count, 'median $'+r.priceComps?.raw?.median);
  console.log('Graded sales:', r.priceComps?.graded?.count, 'median $'+r.priceComps?.graded?.median);
  console.log('Primary:', r.priceComps?.primarySegment);
  console.log('vs Median:', r.priceComps?.vsMedian+'%');
})"
```

Expected: `source: 'sold'`, both raw and graded counts > 0, reasonable median prices.

- [ ] **Step 3: Visual check in browser**

Open `http://localhost:3000/xray` in the browser, paste the same eBay link, and verify:
- "Based on X recent eBay sales" subtitle appears
- Stats show "Sold Median" not just "Median"
- Recent Sales list shows sale dates and graded badges
- Secondary segment toggle works (click "Graded Sales" or "Raw Sales")
- No console errors

- [ ] **Step 4: Test fallback (active listings)**

Test with a very obscure query that won't have sold data to verify fallback works:
- Amber warning banner appears: "These are asking prices, not actual sales"
- Stats still display from active listings

- [ ] **Step 5: Commit all changes and push**

```bash
git add -A
git commit -m "feat(xray): complete sold price comps with raw/graded segments"
git push origin master
```

Netlify auto-deploys from push.
