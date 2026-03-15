# Card X-Ray Phase 1: Core Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `/xray` page where a user pastes an eBay listing URL and gets a full breakdown: card identity, rarity rainbow, price comps, and educational context.

**Architecture:** Single API route (`/api/xray`) orchestrates server-side: parse URL → fetch eBay listing → extract card identity → match DB → pull price comps → return enriched result. Client page (`/xray`) handles paste input and renders 4 result sections (Identity, Rarity Rainbow, Price Context, Set Education). All eBay API calls happen server-side to protect credentials.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Supabase (products/parallels tables), eBay Browse API (OAuth2 client credentials), ThemeProvider inline styles.

**Design Spec:** `docs/superpowers/specs/2026-03-14-card-xray-design.md`

---

## File Structure

```
lib/xray/
├── link-parser.ts          # Parse eBay URLs → item ID
├── ebay-client.ts          # Shared eBay OAuth2 token + getItem + search comps
├── card-identity.ts        # Extract card identity from Item Specifics + title
├── db-matcher.ts           # Match parsed identity → products/parallels tables
├── price-comps.ts          # Search eBay active listings for price context
└── types.ts                # All X-Ray TypeScript interfaces

app/api/xray/
└── route.ts                # POST handler orchestrating all modules

app/xray/
└── page.tsx                # Client page with paste input + results

app/components/xray/
├── XRayInput.tsx           # Paste box with URL validation
├── CardIdentitySection.tsx # Section 1: plain-English card breakdown
├── RarityRainbow.tsx       # Section 2: parallel rainbow with "YOU ARE HERE"
├── PriceContext.tsx        # Section 4: sold prices, median, comparison
└── SetEducation.tsx        # Section 5: set/product educational blurb
```

**Existing files modified:**
- `app/page.tsx` — Add X-Ray link to homepage tools grid

---

## Task 1: X-Ray Types & Link Parser

**Files:**
- Create: `lib/xray/types.ts`
- Create: `lib/xray/link-parser.ts`

### Step-by-step

- [ ] **Step 1: Create `lib/xray/types.ts`**

Define all interfaces used across X-Ray modules.

```typescript
// lib/xray/types.ts

/** Raw parsed identity from eBay listing data */
export interface CardIdentity {
  player: string | null;
  year: string | null;
  brand: string | null;
  set: string | null;
  parallel: string | null;
  cardNumber: string | null;
  sport: string | null;
  isRookie: boolean;
  isGraded: boolean;
  grader: string | null;    // PSA, BGS, SGC, CGC
  grade: string | null;     // "10", "9.5", etc.
  raw: {                    // original source data for debugging
    title: string;
    itemSpecifics: Record<string, string>;
  };
}

/** eBay listing data from getItem API */
export interface EbayListingData {
  itemId: string;
  title: string;
  price: number;
  currency: string;
  condition: string;
  imageUrl: string;
  itemUrl: string;
  seller: string;
  itemSpecifics: Record<string, string>;
  listingType: string;  // 'FIXED_PRICE' | 'AUCTION'
}

/** Matched product from our database */
export interface MatchedProduct {
  productId: string;
  productName: string;
  brandName: string;
  year: string;
  sport: string;
  isFlagship: boolean;
  description: string;
}

/** Matched parallel with its rainbow context */
export interface MatchedParallel {
  parallelId: string;
  parallelName: string;
  colorHex: string;
  printRun: number | null;
  serialNumbered: boolean;
  rarityRank: number;
  isOneOfOne: boolean;
  description: string;
  boxExclusivity: string[] | null;
}

/** Full parallel rainbow for the product */
export interface RainbowEntry {
  name: string;
  colorHex: string;
  printRun: number | null;
  serialNumbered: boolean;
  rarityRank: number;
  isOneOfOne: boolean;
  isCurrentCard: boolean;  // true for the matched parallel
  boxExclusivity: string[] | null;
}

/** Price comp data from eBay active listings (sold/completed data requires Finding API — Phase 2) */
export interface PriceComps {
  compListings: CompListing[];
  stats: {
    low: number;
    median: number;
    high: number;
    count: number;
  };
  listingPrice: number;       // current listing price
  vsMedian: number | null;    // percentage above/below median
}

export interface CompListing {
  title: string;
  price: number;
  url: string;
}

/** Full X-Ray API response */
export interface XRayResult {
  status: 'matched' | 'partial' | 'unmatched';
  listing: EbayListingData;
  identity: CardIdentity;
  product: MatchedProduct | null;
  matchedParallel: MatchedParallel | null;
  rainbow: RainbowEntry[];
  priceComps: PriceComps | null;
  education: {
    setDescription: string | null;
    parallelDescription: string | null;
    flagshipContext: string | null;
  };
}

/** Error response */
export interface XRayError {
  error: string;
  code: 'INVALID_URL' | 'UNSUPPORTED_MARKETPLACE' | 'EBAY_ERROR' | 'NOT_FOUND' | 'SERVER_ERROR';
}
```

- [ ] **Step 2: Create `lib/xray/link-parser.ts`**

Parse eBay URLs to extract item IDs. Handle multiple URL formats.

```typescript
// lib/xray/link-parser.ts

export interface ParsedLink {
  marketplace: 'ebay';
  itemId: string;
}

/**
 * Parse a marketplace URL and extract the item ID.
 * Currently supports eBay only.
 *
 * Supported formats:
 *   https://www.ebay.com/itm/123456789012
 *   https://www.ebay.com/itm/some-title/123456789012
 *   https://ebay.com/itm/123456789012?query=params
 *   https://www.ebay.co.uk/itm/123456789012
 *   https://ebay.us/AbCdEf (shortened)
 */
export function parseLink(url: string): ParsedLink | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  // eBay standard: /itm/ followed by optional slug then numeric ID
  const ebayMatch = trimmed.match(
    /ebay\.[a-z.]+\/itm\/(?:[^/]*\/)?(\d{10,14})/i
  );
  if (ebayMatch) {
    return { marketplace: 'ebay', itemId: ebayMatch[1] };
  }

  // eBay shortened: ebay.us/XXXXX or ebay.to/XXXXX
  // These redirect to the full URL — we'll handle them by following redirects
  // in the fetcher. For now, detect them so we can give a helpful message.
  const shortenedMatch = trimmed.match(/ebay\.(us|to)\/([A-Za-z0-9]+)/i);
  if (shortenedMatch) {
    // Return null — the API route will follow the redirect to get the real URL
    return null;
  }

  return null;
}

/**
 * Quick check: does this string look like it could be a marketplace URL?
 */
export function looksLikeUrl(input: string): boolean {
  const trimmed = input.trim();
  return /^https?:\/\//i.test(trimmed) || /^(www\.)?ebay\./i.test(trimmed);
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/xray/types.ts lib/xray/link-parser.ts
git commit -m "feat(xray): add types and link parser module"
```

---

## Task 2: eBay Client — Token Management & getItem

**Files:**
- Create: `lib/xray/ebay-client.ts`

**Context:** The existing `app/api/ebay/route.ts` has eBay OAuth2 token caching and a search function. We need a shared client that provides: (1) token management, (2) `getItem` for fetching a single listing by ID, and (3) `searchComps` for price comparisons against active listings. We do NOT modify the existing ebay route — we create a standalone module so X-Ray is self-contained. Note: The Browse API only returns active listings — sold/completed data requires the Finding API (Phase 2). For Phase 1, active listing prices serve as price context.

### Step-by-step

- [ ] **Step 1: Create `lib/xray/ebay-client.ts`**

```typescript
// lib/xray/ebay-client.ts

/**
 * eBay Browse API client for Card X-Ray.
 * Provides token management, getItem, and searchComps.
 * Runs server-side only (uses process.env for credentials).
 */

// ── Token cache (module-level singleton) ─────────────────────
let tokenCache: { token: string; expires: number } | null = null;

export async function getEbayToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expires) return tokenCache.token;

  const clientId = process.env.EBAY_CLIENT_ID;
  const clientSecret = process.env.EBAY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('EBAY_CLIENT_ID and EBAY_CLIENT_SECRET must be set in .env.local');
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const res = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope',
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`eBay token error ${res.status}: ${body}`);
  }

  const data = await res.json();
  tokenCache = {
    token: data.access_token,
    expires: Date.now() + (data.expires_in - 60) * 1000,
  };
  return data.access_token;
}

// ── getItem — fetch a single listing by item ID ─────────────
export interface EbayItemResponse {
  itemId: string;
  title: string;
  price: { value: string; currency: string };
  condition: string;
  image: { imageUrl: string };
  itemWebUrl: string;
  seller: { username: string };
  localizedAspects?: Array<{ name: string; value: string }>;
  buyingOptions: string[];   // ['FIXED_PRICE'] or ['AUCTION']
}

export async function getItem(itemId: string): Promise<EbayItemResponse> {
  const token = await getEbayToken();

  const res = await fetch(
    `https://api.ebay.com/buy/browse/v1/item/v1|${itemId}|0`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
        'Content-Type': 'application/json',
      },
    },
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`eBay getItem error ${res.status}: ${body}`);
  }

  return res.json();
}

// ── searchComps — find active listings for price comparison ──
export interface EbayCompItem {
  title: string;
  price: { value: string; currency: string };
  itemWebUrl: string;
}

export async function searchComps(
  query: string,
  limit: number = 20,
): Promise<EbayCompItem[]> {
  const token = await getEbayToken();

  const params = new URLSearchParams({
    q: query,
    category_ids: '261328', // Sports Trading Cards
    sort: 'newlyListed',
    limit: String(limit),
  });

  // Browse API returns active listings only.
  // Sold/completed data requires Finding API (Phase 2).
  // For Phase 1, active listing prices provide price context.
  const res = await fetch(
    `https://api.ebay.com/buy/browse/v1/item_summary/search?${params}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
        'Content-Type': 'application/json',
      },
    },
  );

  if (!res.ok) {
    console.error('eBay search error:', res.status, await res.text());
    return [];
  }

  const data = await res.json();
  return (data.itemSummaries || []).map((item: any) => ({
    title: item.title || '',
    price: item.price || { value: '0', currency: 'USD' },
    itemWebUrl: item.itemWebUrl || '',
  }));
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/xray/ebay-client.ts
git commit -m "feat(xray): add eBay client with getItem and search"
```

---

## Task 3: Card Identity Parser

**Files:**
- Create: `lib/xray/card-identity.ts`

**Context:** eBay listings have "Item Specifics" — structured key-value pairs like `{ Sport: "Basketball", Player/Athlete: "Victor Wembanyama", Year: "2023-24", Set: "Prizm", Parallel/Variety: "Silver" }`. About 70% of listings fill these out. For the other 30%, we fall back to parsing the title string. The parser should always try Item Specifics first, then fill gaps from the title.

### Step-by-step

- [ ] **Step 1: Create `lib/xray/card-identity.ts`**

```typescript
// lib/xray/card-identity.ts

import type { CardIdentity, EbayListingData } from './types';

/**
 * Extract card identity from eBay listing data.
 * Two-pass approach:
 *   1. Structured pass: use Item Specifics (reliable when present)
 *   2. Title fallback: parse title for anything Item Specifics missed
 */
export function parseCardIdentity(listing: EbayListingData): CardIdentity {
  const specs = listing.itemSpecifics;
  const title = listing.title;

  // Pass 1: Item Specifics (structured data)
  const fromSpecs: Partial<CardIdentity> = {
    player: specs['Player/Athlete'] || specs['Player'] || null,
    year: specs['Year'] || specs['Season'] || null,
    brand: specs['Manufacturer'] || specs['Brand'] || null,
    set: specs['Set'] || null,
    parallel: specs['Parallel/Variety'] || specs['Parallel'] || null,
    cardNumber: specs['Card Number'] || null,
    sport: normalizeSport(specs['Sport'] || null),
    isRookie: /rookie/i.test(specs['Features'] || '') || /rookie/i.test(specs['Card Attributes'] || ''),
    isGraded: (specs['Professional Grader'] || specs['Graded'] || '') !== '',
    grader: specs['Professional Grader'] || null,
    grade: specs['Grade'] || null,
  };

  // Pass 2: Fill gaps from title
  const fromTitle = parseTitleFallback(title);

  const identity: CardIdentity = {
    player: fromSpecs.player || fromTitle.player,
    year: fromSpecs.year || fromTitle.year,
    brand: fromSpecs.brand || fromTitle.brand,
    set: fromSpecs.set || fromTitle.set,
    parallel: fromSpecs.parallel || fromTitle.parallel,
    cardNumber: fromSpecs.cardNumber || fromTitle.cardNumber,
    sport: fromSpecs.sport || fromTitle.sport,
    isRookie: fromSpecs.isRookie || fromTitle.isRookie || false,
    isGraded: fromSpecs.isGraded || fromTitle.isGraded || false,
    grader: fromSpecs.grader || fromTitle.grader,
    grade: fromSpecs.grade || fromTitle.grade,
    raw: {
      title,
      itemSpecifics: specs,
    },
  };

  return identity;
}

// ── Sport normalization ──────────────────────────────────────
function normalizeSport(raw: string | null): string | null {
  if (!raw) return null;
  const lower = raw.toLowerCase();
  if (lower.includes('basketball')) return 'NBA';
  if (lower.includes('football') && !lower.includes('soccer')) return 'NFL';
  if (lower.includes('baseball')) return 'MLB';
  if (lower.includes('formula') || lower.includes('f1') || lower.includes('racing')) return 'F1';
  if (lower.includes('wnba')) return 'WNBA';
  if (lower.includes('soccer')) return 'Soccer';
  if (lower.includes('hockey')) return 'NHL';
  return raw;
}

// ── Title parser ─────────────────────────────────────────────

// Known brand names
const BRANDS = [
  'Panini', 'Topps', 'Upper Deck', 'Bowman', 'Leaf', 'Sage',
  'Futera', 'Donruss', 'Fleer', 'Score',
];

// Known set names (order matters — longer names first to avoid partial matches)
const SETS = [
  'National Treasures', 'Immaculate Collection', 'Flawless',
  'Spectra', 'Crown Royale', 'Court Kings', 'Revolution',
  'Prizm', 'Chrome', 'Select', 'Optic', 'Mosaic', 'Contenders',
  'Donruss', 'Hoops', 'Origins', 'Obsidian', 'Certified',
  'Absolute', 'Playbook', 'Plates & Patches', 'Noir',
  'Heritage', 'Series 1', 'Series 2', 'Update', 'Stadium Club',
  'Bowman Chrome', 'Bowman 1st', 'Topps Chrome', 'Gypsy Queen',
  'Allen & Ginter', 'Archives', 'Gallery', 'Luminance',
  'Clearly Donruss', 'Illusions', 'Phoenix', 'Flux',
];

// Known parallel keywords
const PARALLELS = [
  'Silver', 'Gold', 'Red', 'Blue', 'Green', 'Black', 'Orange', 'Purple',
  'Pink', 'White', 'Yellow', 'Bronze', 'Platinum', 'Emerald', 'Ruby',
  'Sapphire', 'Diamond', 'Cracked Ice', 'Shimmer', 'Disco', 'Scope',
  'Camo', 'Lazer', 'Laser', 'Neon', 'Snakeskin', 'Peacock', 'Tiger',
  'Nebula', 'Wave', 'Mojo', 'Hyper', 'Fast Break', 'Holo',
  'Refractor', 'Xfractor', 'Prizm', 'Ice', 'Color Blast',
  'No Huddle', 'Choice', 'Fanatics', 'Asia',
];

// Grading companies & grade patterns
const GRADERS = ['PSA', 'BGS', 'SGC', 'CGC', 'CSG', 'HGA', 'KSA', 'AGS'];
const GRADE_PATTERN = new RegExp(
  `(${GRADERS.join('|')})\\s*(\\d+\\.?\\d*)`,
  'i',
);

// Year patterns: "2023-24" or "2023" or "'23"
const YEAR_PATTERN = /\b(20\d{2}(?:-\d{2})?)\b|'(\d{2})\b/;

// Card number: #235, No. 235, Card #235
const CARD_NUM_PATTERN = /(?:#|No\.?\s*|Card\s*#?)(\d{1,4})\b/i;

// Junk words to ignore
const JUNK = /\b(INVEST|GOAT|HOT|FIRE|PSA\s*READY|BGS\s*READY|GEM\s*MINT|LOOK|WOW|RARE|SP|SSP)\b/gi;

interface TitleParsed {
  player: string | null;
  year: string | null;
  brand: string | null;
  set: string | null;
  parallel: string | null;
  cardNumber: string | null;
  sport: string | null;
  isRookie: boolean;
  isGraded: boolean;
  grader: string | null;
  grade: string | null;
}

function parseTitleFallback(title: string): TitleParsed {
  const result: TitleParsed = {
    player: null, year: null, brand: null, set: null, parallel: null,
    cardNumber: null, sport: null, isRookie: false, isGraded: false,
    grader: null, grade: null,
  };

  // Clean junk words
  let clean = title.replace(JUNK, ' ').replace(/\s+/g, ' ').trim();

  // Year
  const yearMatch = clean.match(YEAR_PATTERN);
  if (yearMatch) {
    result.year = yearMatch[1] || `20${yearMatch[2]}`;
  }

  // Grade (before removing grader names)
  const gradeMatch = clean.match(GRADE_PATTERN);
  if (gradeMatch) {
    result.isGraded = true;
    result.grader = gradeMatch[1].toUpperCase();
    result.grade = gradeMatch[2];
  }

  // Brand
  for (const brand of BRANDS) {
    if (clean.toLowerCase().includes(brand.toLowerCase())) {
      result.brand = brand;
      break;
    }
  }

  // Set (check longer names first)
  for (const set of SETS) {
    if (clean.toLowerCase().includes(set.toLowerCase())) {
      result.set = set;
      break;
    }
  }

  // Parallel
  for (const par of PARALLELS) {
    if (clean.toLowerCase().includes(par.toLowerCase())) {
      result.parallel = par;
      break;
    }
  }

  // Card number
  const numMatch = clean.match(CARD_NUM_PATTERN);
  if (numMatch) {
    result.cardNumber = numMatch[1];
  }

  // Rookie
  result.isRookie = /\b(RC|Rookie)\b/i.test(clean);

  // Sport (from title — less reliable)
  if (/\b(basketball|NBA)\b/i.test(clean)) result.sport = 'NBA';
  else if (/\b(football|NFL)\b/i.test(clean)) result.sport = 'NFL';
  else if (/\b(baseball|MLB)\b/i.test(clean)) result.sport = 'MLB';
  else if (/\b(F1|Formula|racing)\b/i.test(clean)) result.sport = 'F1';

  // Player: whatever's left after removing known tokens is likely the player name
  // This is a rough heuristic — Item Specifics is much more reliable
  // We don't attempt player extraction from title in Phase 1; it's too error-prone

  return result;
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/xray/card-identity.ts
git commit -m "feat(xray): add card identity parser with Item Specifics and title fallback"
```

---

## Task 4: Database Matcher

**Files:**
- Create: `lib/xray/db-matcher.ts`

**Context:** Given a `CardIdentity`, find the matching product and parallel in our Supabase database. The `products` table has `name`, `year`, `sport`, `brand_id`. The `parallels` table has `product_id`, `name`. Brand mapping: Panini = `b0000000-...-000000000001`, Topps = `...002`, Upper Deck = `...003`, Bowman = `...004`. Use the Supabase client from `lib/supabase.ts`.

### Step-by-step

- [ ] **Step 1: Create `lib/xray/db-matcher.ts`**

```typescript
// lib/xray/db-matcher.ts

import { supabase } from '../supabase';
import type { CardIdentity, MatchedProduct, MatchedParallel, RainbowEntry } from './types';

// Brand name → brand_id mapping
const BRAND_IDS: Record<string, string> = {
  panini:      'b0000000-0000-0000-0000-000000000001',
  topps:       'b0000000-0000-0000-0000-000000000002',
  'upper deck': 'b0000000-0000-0000-0000-000000000003',
  bowman:      'b0000000-0000-0000-0000-000000000004',
  // Donruss, Hoops, etc. are Panini sub-brands
  donruss:     'b0000000-0000-0000-0000-000000000001',
  hoops:       'b0000000-0000-0000-0000-000000000001',
  score:       'b0000000-0000-0000-0000-000000000001',
};

export interface MatchResult {
  product: MatchedProduct | null;
  parallel: MatchedParallel | null;
  rainbow: RainbowEntry[];
}

/**
 * Match a parsed card identity against our product/parallel database.
 *
 * Strategy:
 * 1. Search products by year + sport + name (fuzzy on set name)
 * 2. If product found, fetch all parallels for that product
 * 3. Match the specific parallel by name
 */
export async function matchCard(identity: CardIdentity): Promise<MatchResult> {
  const empty: MatchResult = { product: null, parallel: null, rainbow: [] };

  // Need at least year and set to match
  if (!identity.year && !identity.set) return empty;

  // Step 1: Find matching product
  let query = supabase
    .from('products')
    .select('id, name, year, sport, is_flagship, description, brand_id, brands(name)')
    .order('is_flagship', { ascending: false });

  if (identity.year) {
    query = query.eq('year', identity.year);
  }
  if (identity.sport) {
    query = query.eq('sport', identity.sport);
  }

  const { data: products, error } = await query;
  if (error || !products || products.length === 0) return empty;

  // Score each product for best match
  const scored = products.map((p: any) => {
    let score = 0;
    const pNameLower = p.name.toLowerCase();

    // Set name match (most important)
    if (identity.set) {
      const setLower = identity.set.toLowerCase();
      if (pNameLower.includes(setLower)) score += 10;
      // Handle "Donruss Optic" → product named "Optic"
      else if (setLower === 'optic' && pNameLower.includes('optic')) score += 10;
      else if (setLower === 'chrome' && pNameLower.includes('chrome')) score += 10;
    }

    // Brand match
    if (identity.brand) {
      const brandId = BRAND_IDS[identity.brand.toLowerCase()];
      if (brandId && p.brand_id === brandId) score += 3;
    }

    // Year exact match
    if (identity.year && p.year === identity.year) score += 5;

    return { product: p, score };
  });

  // Sort by score descending, take best match
  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];
  if (best.score < 5) return empty; // no meaningful match

  const p = best.product;
  const matchedProduct: MatchedProduct = {
    productId: p.id,
    productName: p.name,
    brandName: p.brands?.name || '',
    year: p.year,
    sport: p.sport,
    isFlagship: p.is_flagship,
    description: p.description || '',
  };

  // Step 2: Fetch all parallels for this product
  const { data: parallels, error: parError } = await supabase
    .from('parallels')
    .select('id, name, color_hex, print_run, serial_numbered, rarity_rank, is_one_of_one, description, box_exclusivity')
    .eq('product_id', p.id)
    .order('rarity_rank', { ascending: true });

  if (parError || !parallels) {
    return { product: matchedProduct, parallel: null, rainbow: [] };
  }

  // Step 3: Build rainbow and find matched parallel
  let matchedParallel: MatchedParallel | null = null;

  const rainbow: RainbowEntry[] = parallels.map((par: any) => {
    const isMatch = identity.parallel
      ? par.name.toLowerCase().includes(identity.parallel.toLowerCase()) ||
        identity.parallel.toLowerCase().includes(par.name.toLowerCase())
      : par.name.toLowerCase() === 'base'; // default to Base if no parallel specified

    if (isMatch && !matchedParallel) {
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

    return {
      name: par.name,
      colorHex: par.color_hex,
      printRun: par.print_run,
      serialNumbered: par.serial_numbered,
      rarityRank: par.rarity_rank,
      isOneOfOne: par.is_one_of_one,
      isCurrentCard: isMatch && (matchedParallel?.parallelId === par.id),
      boxExclusivity: par.box_exclusivity,
    };
  });

  // Fix isCurrentCard — only the first match should be true
  if (matchedParallel) {
    rainbow.forEach(r => {
      r.isCurrentCard = r.name === (matchedParallel as MatchedParallel).parallelName &&
                        r.rarityRank === (matchedParallel as MatchedParallel).rarityRank;
    });
  }

  return { product: matchedProduct, parallel: matchedParallel, rainbow };
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/xray/db-matcher.ts
git commit -m "feat(xray): add database matcher for products and parallels"
```

---

## Task 5: Price Comps Engine

**Files:**
- Create: `lib/xray/price-comps.ts`

**Context:** Search eBay for similar active listings to build price context. The eBay Browse API only returns active listings (not sold/completed), so we use active listing prices as comparables for Phase 1. Phase 2 can add eBay Finding API or scraping for actual sold data.

### Step-by-step

- [ ] **Step 1: Create `lib/xray/price-comps.ts`**

```typescript
// lib/xray/price-comps.ts

import { searchComps } from './ebay-client';
import type { CardIdentity, PriceComps, CompListing } from './types';

/**
 * Build price comps for a card by searching eBay for similar active listings.
 *
 * Constructs a targeted search query from the card identity,
 * then computes price statistics from matching listings.
 */
export async function getPriceComps(
  identity: CardIdentity,
  listingPrice: number,
): Promise<PriceComps | null> {
  // Build a focused search query
  const queryParts: string[] = [];

  if (identity.year) queryParts.push(identity.year);
  if (identity.brand) queryParts.push(identity.brand);
  if (identity.set) queryParts.push(identity.set);
  if (identity.player) queryParts.push(identity.player);
  if (identity.parallel && identity.parallel.toLowerCase() !== 'base') {
    queryParts.push(identity.parallel);
  }
  if (identity.cardNumber) queryParts.push(`#${identity.cardNumber}`);

  // Need enough info to build a meaningful query
  if (queryParts.length < 3) return null;

  const query = queryParts.join(' ');

  try {
    const items = await searchComps(query, 20);
    if (items.length === 0) return null;

    // Convert to CompListing format and extract prices
    const compListings: CompListing[] = items.map(item => ({
      title: item.title,
      price: parseFloat(item.price.value) || 0,
      url: item.itemWebUrl,
    }));

    // Filter out $0 and outliers (>10x median)
    const prices = compListings
      .map(l => l.price)
      .filter(p => p > 0)
      .sort((a, b) => a - b);

    if (prices.length === 0) return null;

    const median = prices[Math.floor(prices.length / 2)];
    const filtered = prices.filter(p => p < median * 10); // remove extreme outliers

    const stats = {
      low: filtered[0],
      median: filtered[Math.floor(filtered.length / 2)],
      high: filtered[filtered.length - 1],
      count: filtered.length,
    };

    const vsMedian = stats.median > 0
      ? Math.round(((listingPrice - stats.median) / stats.median) * 100)
      : null;

    return {
      compListings: compListings.slice(0, 10), // return top 10
      stats,
      listingPrice,
      vsMedian,
    };
  } catch (err) {
    console.error('Price comps error:', err);
    return null;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/xray/price-comps.ts
git commit -m "feat(xray): add price comparison engine"
```

---

## Task 6: X-Ray API Route

**Files:**
- Create: `app/api/xray/route.ts`

**Context:** Single POST endpoint that orchestrates the full X-Ray pipeline. Takes a URL, returns the full `XRayResult`. This is the only server-side entry point — all eBay API calls and DB queries happen here. The client page calls this one endpoint.

### Step-by-step

- [ ] **Step 1: Create `app/api/xray/route.ts`**

```typescript
// app/api/xray/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import { parseLink, looksLikeUrl } from '../../../lib/xray/link-parser';
import { getItem } from '../../../lib/xray/ebay-client';
import { parseCardIdentity } from '../../../lib/xray/card-identity';
import { matchCard } from '../../../lib/xray/db-matcher';
import { getPriceComps } from '../../../lib/xray/price-comps';
import type { EbayListingData, XRayResult, XRayError } from '../../../lib/xray/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url: string = body.url || '';

    // Validate input
    if (!url || !looksLikeUrl(url)) {
      return NextResponse.json(
        { error: 'Please paste a valid eBay listing URL', code: 'INVALID_URL' } as XRayError,
        { status: 400 },
      );
    }

    // Parse URL to get item ID
    const parsed = parseLink(url);
    if (!parsed) {
      return NextResponse.json(
        { error: 'Could not extract item ID from URL. Please paste a full eBay listing URL (e.g., ebay.com/itm/...)', code: 'INVALID_URL' } as XRayError,
        { status: 400 },
      );
    }

    if (parsed.marketplace !== 'ebay') {
      return NextResponse.json(
        { error: 'Only eBay links are supported right now. More marketplaces coming soon.', code: 'UNSUPPORTED_MARKETPLACE' } as XRayError,
        { status: 400 },
      );
    }

    // Fetch listing from eBay
    let ebayItem;
    try {
      ebayItem = await getItem(parsed.itemId);
    } catch (err: any) {
      console.error('eBay getItem failed:', err.message);
      return NextResponse.json(
        { error: 'Could not fetch this eBay listing. It may have ended or been removed.', code: 'EBAY_ERROR' } as XRayError,
        { status: 502 },
      );
    }

    // Transform eBay response to our format
    const itemSpecifics: Record<string, string> = {};
    if (ebayItem.localizedAspects) {
      for (const aspect of ebayItem.localizedAspects) {
        itemSpecifics[aspect.name] = aspect.value;
      }
    }

    const listing: EbayListingData = {
      itemId: parsed.itemId,
      title: ebayItem.title || '',
      price: parseFloat(ebayItem.price?.value || '0'),
      currency: ebayItem.price?.currency || 'USD',
      condition: ebayItem.condition || '',
      imageUrl: ebayItem.image?.imageUrl || '',
      itemUrl: ebayItem.itemWebUrl || '',
      seller: ebayItem.seller?.username || '',
      itemSpecifics,
      listingType: ebayItem.buyingOptions?.[0] || 'FIXED_PRICE',
    };

    // Parse card identity
    const identity = parseCardIdentity(listing);

    // Match against our database
    const match = await matchCard(identity);

    // Get price comps
    const priceComps = await getPriceComps(identity, listing.price);

    // Build education blurbs
    const education = {
      setDescription: match.product?.description || null,
      parallelDescription: match.parallel?.description || null,
      flagshipContext: match.product?.isFlagship
        ? `${match.product.productName} is a flagship product — one of the most collected and recognized sets in the hobby.`
        : null,
    };

    // Determine match status
    let status: XRayResult['status'] = 'unmatched';
    if (match.product && match.parallel) status = 'matched';
    else if (match.product) status = 'partial';

    const result: XRayResult = {
      status,
      listing,
      identity,
      product: match.product,
      matchedParallel: match.parallel,
      rainbow: match.rainbow,
      priceComps,
      education,
    };

    // Log lookup for analytics (fire-and-forget, don't block response)
    supabase.from('card_lookups').insert({
      url,
      ebay_item_id: parsed.itemId,
      match_status: status,
      product_id: match.product?.productId || null,
      parallel_id: match.parallel?.parallelId || null,
      parsed_identity: identity,
    }).then(({ error: logErr }) => {
      if (logErr) console.error('card_lookups insert error:', logErr.message);
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('X-Ray error:', err);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.', code: 'SERVER_ERROR' } as XRayError,
      { status: 500 },
    );
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/xray/route.ts
git commit -m "feat(xray): add API route orchestrating full X-Ray pipeline"
```

---

## Task 7: X-Ray UI Components

**Files:**
- Create: `app/components/xray/XRayInput.tsx`
- Create: `app/components/xray/CardIdentitySection.tsx`
- Create: `app/components/xray/RarityRainbow.tsx`
- Create: `app/components/xray/PriceContext.tsx`
- Create: `app/components/xray/SetEducation.tsx`

**Context:** All components use `useTheme()` for colors with inline styles (not CSS classes). Follow the existing component patterns in `app/components/shared/` and `app/components/decoder/`. Font families: `'Bebas Neue', sans-serif` for display, `'IBM Plex Sans', sans-serif` for body, `'IBM Plex Mono', monospace` for data. Mobile-first design with 12-16px border-radius, spacious padding.

### Step-by-step

- [ ] **Step 1: Create `app/components/xray/XRayInput.tsx`**

The paste box component. Shows a large text input where users paste eBay URLs. Includes a subtle instruction and an "Analyze" button.

```typescript
// app/components/xray/XRayInput.tsx
'use client';

import { useState } from 'react';
import { useTheme } from '../ThemeProvider';

interface XRayInputProps {
  onSubmit: (url: string) => void;
  loading: boolean;
}

export function XRayInput({ onSubmit, loading }: XRayInputProps) {
  const { colors } = useTheme();
  const [url, setUrl] = useState('');

  const handleSubmit = () => {
    const trimmed = url.trim();
    if (trimmed) onSubmit(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) handleSubmit();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    // Auto-submit on paste
    const pasted = e.clipboardData.getData('text').trim();
    if (pasted && /ebay\./i.test(pasted)) {
      setTimeout(() => onSubmit(pasted), 100);
    }
  };

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{
        display: 'flex',
        gap: 12,
        alignItems: 'stretch',
      }}>
        <input
          type="text"
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="Paste an eBay listing URL..."
          disabled={loading}
          style={{
            flex: 1,
            padding: '16px 20px',
            fontSize: 16,
            fontFamily: "'IBM Plex Sans', sans-serif",
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: 12,
            color: colors.text,
            outline: 'none',
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !url.trim()}
          style={{
            padding: '16px 28px',
            fontSize: 14,
            fontFamily: "'IBM Plex Mono', monospace",
            fontWeight: 600,
            letterSpacing: 1,
            background: loading ? colors.muted : colors.green,
            color: '#0a0f1a',
            border: 'none',
            borderRadius: 12,
            cursor: loading ? 'wait' : 'pointer',
            opacity: !url.trim() ? 0.5 : 1,
            whiteSpace: 'nowrap',
          }}
        >
          {loading ? 'ANALYZING...' : 'X-RAY'}
        </button>
      </div>
      <p style={{
        marginTop: 8,
        fontSize: 13,
        color: colors.muted,
        fontFamily: "'IBM Plex Sans', sans-serif",
      }}>
        Works with any eBay sports card listing. More marketplaces coming soon.
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Create `app/components/xray/CardIdentitySection.tsx`**

Section 1: Plain-English breakdown of what the card is.

```typescript
// app/components/xray/CardIdentitySection.tsx
'use client';

import { useTheme } from '../ThemeProvider';
import type { CardIdentity, EbayListingData } from '../../../lib/xray/types';

interface Props {
  identity: CardIdentity;
  listing: EbayListingData;
}

export function CardIdentitySection({ identity, listing }: Props) {
  const { colors } = useTheme();

  const fields: { label: string; value: string | null; highlight?: boolean }[] = [
    { label: 'Player', value: identity.player },
    { label: 'Year', value: identity.year },
    { label: 'Set', value: [identity.brand, identity.set].filter(Boolean).join(' ') || null },
    { label: 'Parallel', value: identity.parallel || 'Base' },
    { label: 'Card #', value: identity.cardNumber ? `#${identity.cardNumber}` : null },
    { label: 'Rookie', value: identity.isRookie ? 'Yes' : null },
    {
      label: 'Grade',
      value: identity.isGraded
        ? `${identity.grader || '?'} ${identity.grade || '?'}`
        : 'Raw (ungraded)',
    },
  ];

  return (
    <section style={{
      background: colors.surface,
      borderRadius: 14,
      padding: 24,
      marginBottom: 16,
    }}>
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Card image */}
        {listing.imageUrl && (
          <img
            src={listing.imageUrl}
            alt={listing.title}
            style={{
              width: 140,
              height: 'auto',
              borderRadius: 10,
              border: `1px solid ${colors.border}`,
            }}
          />
        )}

        {/* Identity fields */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <h2 style={{
            margin: '0 0 16px',
            fontSize: 14,
            fontFamily: "'IBM Plex Mono', monospace",
            fontWeight: 600,
            letterSpacing: 1,
            color: colors.green,
            textTransform: 'uppercase',
          }}>
            Card Identity
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {fields.filter(f => f.value).map(field => (
              <div key={field.label} style={{ display: 'flex', gap: 12 }}>
                <span style={{
                  width: 80,
                  fontSize: 12,
                  fontFamily: "'IBM Plex Mono', monospace",
                  color: colors.muted,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  flexShrink: 0,
                  paddingTop: 2,
                }}>
                  {field.label}
                </span>
                <span style={{
                  fontSize: 15,
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  color: colors.text,
                  fontWeight: 500,
                }}>
                  {field.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create `app/components/xray/RarityRainbow.tsx`**

Section 2: The parallel rainbow with "YOU ARE HERE" indicator.

```typescript
// app/components/xray/RarityRainbow.tsx
'use client';

import { useTheme } from '../ThemeProvider';
import { getRarityLevel, getRarityColorKey } from '../../../lib/rarity';
import { formatPrintRun } from '../../../lib/format';
import type { RainbowEntry, MatchedProduct } from '../../../lib/xray/types';

interface Props {
  rainbow: RainbowEntry[];
  product: MatchedProduct | null;
}

export function RarityRainbow({ rainbow, product }: Props) {
  const { colors } = useTheme();

  if (rainbow.length === 0) return null;

  const totalParallels = rainbow.length;
  const currentIdx = rainbow.findIndex(r => r.isCurrentCard);

  return (
    <section style={{
      background: colors.surface,
      borderRadius: 14,
      padding: 24,
      marginBottom: 16,
    }}>
      <h2 style={{
        margin: '0 0 4px',
        fontSize: 14,
        fontFamily: "'IBM Plex Mono', monospace",
        fontWeight: 600,
        letterSpacing: 1,
        color: colors.green,
        textTransform: 'uppercase',
      }}>
        Rarity Rainbow
      </h2>

      {product && (
        <p style={{
          margin: '0 0 16px',
          fontSize: 13,
          color: colors.muted,
          fontFamily: "'IBM Plex Sans', sans-serif",
        }}>
          {product.productName} {product.year} — {totalParallels} parallels
          {currentIdx >= 0 && ` — this card is #${currentIdx + 1} of ${totalParallels}`}
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {rainbow.map((entry, i) => {
          const level = getRarityLevel(entry.rarityRank, totalParallels, entry.isOneOfOne);
          const colorKey = getRarityColorKey(level) as keyof typeof colors;
          const rarityColor = colors[colorKey];

          return (
            <div
              key={`${entry.name}-${i}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 12px',
                borderRadius: 8,
                background: entry.isCurrentCard ? `${colors.green}12` : 'transparent',
                border: entry.isCurrentCard ? `1px solid ${colors.green}40` : '1px solid transparent',
              }}
            >
              {/* Color swatch */}
              <div style={{
                width: 14,
                height: 14,
                borderRadius: 4,
                background: entry.colorHex || colors.muted,
                border: `1px solid ${colors.border}`,
                flexShrink: 0,
              }} />

              {/* Name */}
              <span style={{
                flex: 1,
                fontSize: 14,
                fontFamily: "'IBM Plex Sans', sans-serif",
                color: entry.isCurrentCard ? colors.green : colors.text,
                fontWeight: entry.isCurrentCard ? 600 : 400,
              }}>
                {entry.name}
                {entry.isCurrentCard && (
                  <span style={{
                    marginLeft: 8,
                    fontSize: 11,
                    fontFamily: "'IBM Plex Mono', monospace",
                    color: colors.green,
                    fontWeight: 700,
                    letterSpacing: 0.5,
                  }}>
                    YOU ARE HERE
                  </span>
                )}
              </span>

              {/* Print run */}
              <span style={{
                fontSize: 12,
                fontFamily: "'IBM Plex Mono', monospace",
                color: colors.muted,
                minWidth: 60,
                textAlign: 'right',
              }}>
                {formatPrintRun(entry.printRun)}
              </span>

              {/* Rarity badge */}
              <span style={{
                fontSize: 10,
                fontFamily: "'IBM Plex Mono', monospace",
                fontWeight: 600,
                color: rarityColor,
                border: `1px solid ${rarityColor}`,
                background: `${rarityColor}15`,
                padding: '2px 6px',
                borderRadius: 999,
                minWidth: 60,
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}>
                {level}
              </span>
            </div>
          );
        })}
      </div>

      {/* Box exclusivity note */}
      {rainbow.some(r => r.isCurrentCard && r.boxExclusivity?.length) && (
        <p style={{
          marginTop: 12,
          fontSize: 13,
          color: colors.secondary,
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontStyle: 'italic',
        }}>
          This parallel is exclusive to: {
            rainbow.find(r => r.isCurrentCard)?.boxExclusivity?.join(', ')
          }
        </p>
      )}
    </section>
  );
}
```

- [ ] **Step 4: Create `app/components/xray/PriceContext.tsx`**

Section 4: Price comparison data.

```typescript
// app/components/xray/PriceContext.tsx
'use client';

import { useTheme } from '../ThemeProvider';
import type { PriceComps } from '../../../lib/xray/types';

interface Props {
  priceComps: PriceComps | null;
}

export function PriceContext({ priceComps }: Props) {
  const { colors } = useTheme();

  if (!priceComps) {
    return (
      <section style={{
        background: colors.surface,
        borderRadius: 14,
        padding: 24,
        marginBottom: 16,
      }}>
        <h2 style={{
          margin: 0,
          fontSize: 14,
          fontFamily: "'IBM Plex Mono', monospace",
          fontWeight: 600,
          letterSpacing: 1,
          color: colors.green,
          textTransform: 'uppercase',
        }}>
          Price Context
        </h2>
        <p style={{
          marginTop: 12,
          fontSize: 14,
          color: colors.muted,
          fontFamily: "'IBM Plex Sans', sans-serif",
        }}>
          Not enough data to show price comparisons for this card.
        </p>
      </section>
    );
  }

  const { stats, listingPrice, vsMedian, compListings } = priceComps;

  const vsColor = vsMedian === null
    ? colors.muted
    : vsMedian > 15
      ? colors.red
      : vsMedian < -15
        ? colors.green
        : colors.amber;

  const vsLabel = vsMedian === null
    ? ''
    : vsMedian > 0
      ? `${vsMedian}% above`
      : vsMedian < 0
        ? `${Math.abs(vsMedian)}% below`
        : 'at';

  return (
    <section style={{
      background: colors.surface,
      borderRadius: 14,
      padding: 24,
      marginBottom: 16,
    }}>
      <h2 style={{
        margin: '0 0 16px',
        fontSize: 14,
        fontFamily: "'IBM Plex Mono', monospace",
        fontWeight: 600,
        letterSpacing: 1,
        color: colors.green,
        textTransform: 'uppercase',
      }}>
        Price Context
      </h2>

      {/* Stats row */}
      <div style={{
        display: 'flex',
        gap: 20,
        flexWrap: 'wrap',
        marginBottom: 16,
      }}>
        {[
          { label: 'This Listing', value: `$${listingPrice.toFixed(2)}`, color: colors.text },
          { label: 'Median', value: `$${stats.median.toFixed(2)}`, color: colors.cyan },
          { label: 'Low', value: `$${stats.low.toFixed(2)}`, color: colors.green },
          { label: 'High', value: `$${stats.high.toFixed(2)}`, color: colors.red },
        ].map(stat => (
          <div key={stat.label} style={{ minWidth: 80 }}>
            <div style={{
              fontSize: 11,
              fontFamily: "'IBM Plex Mono', monospace",
              color: colors.muted,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              marginBottom: 4,
            }}>
              {stat.label}
            </div>
            <div style={{
              fontSize: 20,
              fontFamily: "'IBM Plex Mono', monospace",
              fontWeight: 600,
              color: stat.color,
            }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* vs Median statement */}
      {vsMedian !== null && (
        <p style={{
          fontSize: 14,
          fontFamily: "'IBM Plex Sans', sans-serif",
          color: colors.secondary,
          margin: '0 0 16px',
        }}>
          This listing is{' '}
          <span style={{ color: vsColor, fontWeight: 600 }}>
            {vsLabel} median
          </span>
          {' '}based on {stats.count} similar listing{stats.count !== 1 ? 's' : ''}.
        </p>
      )}

      {/* Recent listings */}
      {compListings.length > 0 && (
        <div>
          <h3 style={{
            fontSize: 12,
            fontFamily: "'IBM Plex Mono', monospace",
            color: colors.muted,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            margin: '0 0 8px',
          }}>
            Similar Listings ({compListings.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {compListings.slice(0, 5).map((item, i) => (
              <a
                key={i}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: `${colors.border}40`,
                  textDecoration: 'none',
                  gap: 12,
                }}
              >
                <span style={{
                  fontSize: 13,
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  color: colors.secondary,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                }}>
                  {item.title}
                </span>
                <span style={{
                  fontSize: 14,
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontWeight: 600,
                  color: colors.text,
                  flexShrink: 0,
                }}>
                  ${item.price.toFixed(2)}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 5: Create `app/components/xray/SetEducation.tsx`**

Section 5: Educational blurb about the set and parallel.

```typescript
// app/components/xray/SetEducation.tsx
'use client';

import { useTheme } from '../ThemeProvider';

interface Props {
  education: {
    setDescription: string | null;
    parallelDescription: string | null;
    flagshipContext: string | null;
  };
  productName: string | null;
}

export function SetEducation({ education, productName }: Props) {
  const { colors } = useTheme();

  const hasContent = education.setDescription || education.parallelDescription || education.flagshipContext;
  if (!hasContent) return null;

  return (
    <section style={{
      background: colors.surface,
      borderRadius: 14,
      padding: 24,
      marginBottom: 16,
    }}>
      <h2 style={{
        margin: '0 0 16px',
        fontSize: 14,
        fontFamily: "'IBM Plex Mono', monospace",
        fontWeight: 600,
        letterSpacing: 1,
        color: colors.green,
        textTransform: 'uppercase',
      }}>
        {productName ? `About ${productName}` : 'Set Education'}
      </h2>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        fontSize: 14,
        fontFamily: "'IBM Plex Sans', sans-serif",
        color: colors.secondary,
        lineHeight: 1.6,
      }}>
        {education.flagshipContext && (
          <p style={{ margin: 0, color: colors.amber }}>
            {education.flagshipContext}
          </p>
        )}
        {education.setDescription && (
          <p style={{ margin: 0 }}>
            {education.setDescription}
          </p>
        )}
        {education.parallelDescription && (
          <p style={{ margin: 0 }}>
            {education.parallelDescription}
          </p>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Commit all components**

```bash
git add app/components/xray/
git commit -m "feat(xray): add UI components — input, identity, rainbow, prices, education"
```

---

## Task 8: X-Ray Page

**Files:**
- Create: `app/xray/page.tsx`

**Context:** The main `/xray` route. Uses `'use client'` directive. Renders the paste input, handles the API call, shows loading state, displays results using the components from Task 7. Follow the same patterns as `app/decoder/page.tsx` — client component, fetch from `/api/xray`, inline styles via `useTheme()`.

### Step-by-step

- [ ] **Step 1: Create `app/xray/page.tsx`**

```typescript
// app/xray/page.tsx
'use client';

import { useState } from 'react';
import { Header } from '../components/shared/Header';
import { useTheme } from '../components/ThemeProvider';
import { XRayInput } from '../components/xray/XRayInput';
import { CardIdentitySection } from '../components/xray/CardIdentitySection';
import { RarityRainbow } from '../components/xray/RarityRainbow';
import { PriceContext } from '../components/xray/PriceContext';
import { SetEducation } from '../components/xray/SetEducation';
import type { XRayResult, XRayError } from '../../lib/xray/types';

export default function XRayPage() {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<XRayResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (url: string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/xray', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError((data as XRayError).error || 'Something went wrong');
        return;
      }

      setResult(data as XRayResult);
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.bg,
      color: colors.text,
    }}>
      <Header showBack />

      <main style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: '24px 16px 80px',
      }}>
        {/* Title */}
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 36,
          letterSpacing: 3,
          color: colors.text,
          margin: '0 0 4px',
        }}>
          CARD X-RAY
        </h1>
        <p style={{
          fontSize: 15,
          fontFamily: "'IBM Plex Sans', sans-serif",
          color: colors.muted,
          margin: '0 0 24px',
        }}>
          Paste any eBay listing to see exactly what you're looking at.
        </p>

        {/* Input */}
        <XRayInput onSubmit={handleSubmit} loading={loading} />

        {/* Loading state */}
        {loading && (
          <div style={{
            textAlign: 'center',
            padding: '48px 0',
            color: colors.muted,
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 14,
          }}>
            Analyzing listing...
          </div>
        )}

        {/* Error state */}
        {error && (
          <div style={{
            padding: 20,
            borderRadius: 14,
            background: `${colors.red}15`,
            border: `1px solid ${colors.red}40`,
            color: colors.red,
            fontSize: 14,
            fontFamily: "'IBM Plex Sans', sans-serif",
            marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <>
            {/* Match status banner */}
            {result.status === 'unmatched' && (
              <div style={{
                padding: '12px 16px',
                borderRadius: 10,
                background: `${colors.amber}15`,
                border: `1px solid ${colors.amber}40`,
                color: colors.amber,
                fontSize: 13,
                fontFamily: "'IBM Plex Sans', sans-serif",
                marginBottom: 16,
              }}>
                We couldn't match this card in our database yet. Showing what we could extract from the listing.
              </div>
            )}

            {result.status === 'partial' && (
              <div style={{
                padding: '12px 16px',
                borderRadius: 10,
                background: `${colors.amber}15`,
                border: `1px solid ${colors.amber}40`,
                color: colors.amber,
                fontSize: 13,
                fontFamily: "'IBM Plex Sans', sans-serif",
                marginBottom: 16,
              }}>
                We found the set but couldn't match the specific parallel. The rainbow below shows all parallels in this set.
              </div>
            )}

            {/* Section 1: Card Identity */}
            <CardIdentitySection identity={result.identity} listing={result.listing} />

            {/* Section 2: Rarity Rainbow */}
            <RarityRainbow rainbow={result.rainbow} product={result.product} />

            {/* Section 4: Price Context */}
            <PriceContext priceComps={result.priceComps} />

            {/* Section 5: Set Education */}
            <SetEducation
              education={result.education}
              productName={result.product?.productName || null}
            />

            {/* Source link */}
            <div style={{
              textAlign: 'center',
              marginTop: 24,
            }}>
              <a
                href={result.listing.itemUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 13,
                  fontFamily: "'IBM Plex Mono', monospace",
                  color: colors.cyan,
                  textDecoration: 'none',
                }}
              >
                View original listing on eBay
              </a>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Add X-Ray link to homepage navigation**

The homepage at `app/page.tsx` has a tools grid. Add an X-Ray card to it. Read the file first to find where to add it, then add an entry following the existing pattern (Decoder, Shows, Learn).

Look for the tools array or grid in `app/page.tsx` and add:
```typescript
{ name: 'Card X-Ray', href: '/xray', description: 'Paste any eBay link to see exactly what you\'re looking at', icon: '🔍' },
```

- [ ] **Step 3: Commit**

```bash
git add app/xray/page.tsx app/page.tsx
git commit -m "feat(xray): add X-Ray page with results display and homepage link"
```

---

## Task 9: Build Verification & Polish

**Files:**
- All files from previous tasks

**Context:** Verify the entire feature builds without TypeScript errors. Fix any import issues, type mismatches, or build errors. Then test the feature end-to-end by running the dev server.

### Step-by-step

- [ ] **Step 1: Run TypeScript type check**

```bash
npx tsc --noEmit
```

Fix any type errors that come up. Common issues to watch for:
- Import paths (use `@/lib/xray/...` or relative paths matching existing patterns)
- Supabase query return types (may need `as any` casts on join results)
- eBay API response shape mismatches

- [ ] **Step 2: Run Next.js build**

```bash
npm run build
```

Fix any build errors. The build must succeed before marking this task complete.

- [ ] **Step 3: Start dev server and test manually**

```bash
npm run dev
```

Navigate to `http://localhost:3000/xray` and verify:
1. Page loads without errors
2. Paste box renders with correct styling
3. Pasting an eBay URL triggers the API call
4. Results display (or graceful error if eBay API is unreachable)

- [ ] **Step 4: Fix any issues found during testing**

Address build errors, runtime errors, or visual issues.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "fix(xray): build fixes and polish"
```

---

## Task 10: card_lookups Table Migration

**Files:**
- Create: `scripts/migrations/create-card-lookups.sql`

**Context:** The spec requires a `card_lookups` table to log every X-Ray lookup for analytics and gap identification. The API route (Task 6) already inserts into this table — this task creates the table. Run the SQL in the Supabase dashboard or via the Supabase CLI. Note: `price_comps` and `pop_reports` caching tables are deferred to Phase 2.

### Step-by-step

- [ ] **Step 1: Create `scripts/migrations/create-card-lookups.sql`**

```sql
-- Card X-Ray lookup analytics table
-- Logs every X-Ray request for gap identification and usage analytics

CREATE TABLE IF NOT EXISTS card_lookups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  ebay_item_id TEXT,
  match_status TEXT NOT NULL CHECK (match_status IN ('matched', 'partial', 'unmatched')),
  product_id UUID REFERENCES products(id),
  parallel_id UUID REFERENCES parallels(id),
  parsed_identity JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for analytics queries
CREATE INDEX idx_card_lookups_status ON card_lookups(match_status);
CREATE INDEX idx_card_lookups_created ON card_lookups(created_at DESC);

-- RLS: allow inserts from anon (API route uses anon key), restrict reads to authenticated/admin
ALTER TABLE card_lookups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts" ON card_lookups
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated reads" ON card_lookups
  FOR SELECT USING (auth.role() = 'authenticated');
```

- [ ] **Step 2: Run the migration**

Run in Supabase dashboard SQL editor, or:

```bash
node scripts/run-migration.mjs scripts/migrations/create-card-lookups.sql
```

- [ ] **Step 3: Commit**

```bash
git add scripts/migrations/create-card-lookups.sql
git commit -m "feat(xray): add card_lookups table for analytics"
```

---

## Summary

| Task | Description | Key Files |
|------|-------------|-----------|
| 1 | Types & Link Parser | `lib/xray/types.ts`, `lib/xray/link-parser.ts` |
| 2 | eBay Client | `lib/xray/ebay-client.ts` |
| 3 | Card Identity Parser | `lib/xray/card-identity.ts` |
| 4 | Database Matcher | `lib/xray/db-matcher.ts` |
| 5 | Price Comps Engine | `lib/xray/price-comps.ts` |
| 6 | API Route | `app/api/xray/route.ts` |
| 7 | UI Components | `app/components/xray/*.tsx` (5 components) |
| 8 | X-Ray Page | `app/xray/page.tsx`, homepage link |
| 9 | Build & Polish | Verification, fixes, testing |
| 10 | card_lookups Migration | `scripts/migrations/create-card-lookups.sql` |

**Phase 2 deferred:** `price_comps` caching table, `pop_reports` table, eBay Finding API for sold data, PSA/BGS pop report integration.
