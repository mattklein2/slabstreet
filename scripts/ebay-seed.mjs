#!/usr/bin/env node

/**
 * eBay Seed Pipeline
 *
 * Combines eBay parallel discovery + automatic rarity/color assignment +
 * DB insertion into a single pipeline for pending products.
 *
 * Usage:
 *   node scripts/ebay-seed.mjs "2022-23 National Treasures Basketball" --dry-run
 *   node scripts/ebay-seed.mjs "2022-23 National Treasures Basketball"
 *   node scripts/ebay-seed.mjs --batch --sport=NBA --dry-run
 *   node scripts/ebay-seed.mjs --batch --sport=NBA
 *   node scripts/ebay-seed.mjs --batch
 */

import { readFileSync, existsSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ── Env / Supabase ─────────────────────────────────────────────────────────────

const envPath = resolve(ROOT, '.env.local');
const env = {};
if (existsSync(envPath)) {
  readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
    const m = line.match(/^([^#=][^=]*)=(.*)/);
    if (m) env[m[1].trim()] = m[2].trim();
  });
}

const EBAY_CLIENT_ID = env.EBAY_CLIENT_ID;
const EBAY_CLIENT_SECRET = env.EBAY_CLIENT_SECRET;

if (!EBAY_CLIENT_ID || !EBAY_CLIENT_SECRET) {
  console.error('ERROR: EBAY_CLIENT_ID and EBAY_CLIENT_SECRET must be set in .env.local');
  process.exit(1);
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// ── Constants ──────────────────────────────────────────────────────────────────

const EBAY_AUTH_URL = 'https://api.ebay.com/identity/v1/oauth2/token';
const EBAY_BROWSE_URL = 'https://api.ebay.com/buy/browse/v1/item_summary/search';
const SPORTS_CARDS_CATEGORY = '214';

const BRAND_IDS = {
  Panini:       'b0000000-0000-0000-0000-000000000001',
  Topps:        'b0000000-0000-0000-0000-000000000002',
  'Upper Deck': 'b0000000-0000-0000-0000-000000000003',
  Bowman:       'b0000000-0000-0000-0000-000000000004',
};

const SPORT_KEYWORDS = {
  NBA:    'Basketball',
  NFL:    'Football',
  MLB:    'Baseball',
  NHL:    'Hockey',
  WNBA:   'WNBA Basketball',
  F1:     'Formula 1',
  Soccer: 'Soccer',
  EPL:    'Soccer Premier League',
  FIFA:   'Soccer',
  UEFA:   'Soccer UEFA',
};

// Aspect names eBay uses for parallels (try in priority order)
const PARALLEL_ASPECT_NAMES = [
  'Parallel/Variety',
  'Parallel',
  'Card Attributes',
  'Variety',
  'Card Type',
  'Insert Set',
];

const MATRIX_PATH = resolve(ROOT, 'data', 'product-matrix.json');

// Minimum parallels required to proceed with seeding
const MIN_PARALLELS = 5;

// ── Noise patterns — parallels matching any of these are discarded ─────────────

const NOISE_PATTERNS = [
  /^not specified$/i,
  /^psa\s*\d*/i,       // PSA, PSA 10, PSA 9
  /^bgs\s*[\d.]*/i,    // BGS, BGS 9.5
  /^sgc\s*\d*/i,       // SGC grading
  /^csg\s*\d*/i,       // CSG grading
  /^beckett\b/i,
  /^lot$/i,
  /^lots$/i,
  /^slab$/i,
  /^raw$/i,
  /^auto$/i,
  /^autograph$/i,
  /^signed$/i,
  /^rookie$/i,
  /^rc$/i,
  /^insert$/i,
  /^base set$/i,
  /^variation$/i,
  /^short print$/i,
  /^sp$/i,
  /^refractor$/i,      // too generic — keep "Gold Refractor", etc.
  /^yes$/i,
  /^no$/i,
  /^see description$/i,
  /^other$/i,
  /^n\/a$/i,
  /^none$/i,
  /^\d+(\.\d+)?$/,     // pure numbers like "10" or "9.5"
];

// ── Token cache ────────────────────────────────────────────────────────────────

let tokenCache = { token: null, expiresAt: 0 };

async function getAccessToken() {
  const now = Date.now();
  if (tokenCache.token && now < tokenCache.expiresAt - 30_000) {
    return tokenCache.token;
  }

  const credentials = Buffer.from(`${EBAY_CLIENT_ID}:${EBAY_CLIENT_SECRET}`).toString('base64');
  const res = await fetch(EBAY_AUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${credentials}`,
    },
    body: 'grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`eBay auth failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  tokenCache.token = data.access_token;
  tokenCache.expiresAt = now + (data.expires_in * 1000);
  console.log(`  [auth] Token obtained, expires in ${data.expires_in}s`);
  return tokenCache.token;
}

// ── eBay search ────────────────────────────────────────────────────────────────

async function searchEbayAspects(query) {
  const token = await getAccessToken();
  const params = new URLSearchParams({
    q: query,
    category_ids: SPORTS_CARDS_CATEGORY,
    limit: '1',
    fieldgroups: 'ASPECT_REFINEMENTS',
  });

  const res = await fetch(`${EBAY_BROWSE_URL}?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`eBay search failed (${res.status}): ${text}`);
  }

  return res.json();
}

// ── Print run parser ───────────────────────────────────────────────────────────

function parsePrintRun(rawName) {
  let name = rawName.trim();
  let printRun = null;
  let isOneOfOne = false;

  // Pattern 1: "1/1" anywhere
  const oneOfOneMatch = name.match(/\b1\s*\/\s*1\b/);
  if (oneOfOneMatch) {
    printRun = 1;
    isOneOfOne = true;
    name = name.replace(/\s*\b1\s*\/\s*1\b/, '').trim();
  }

  if (!isOneOfOne) {
    // Pattern 2: "/NNN" or "#/NNN" at end
    const slashMatch = name.match(/\s*#?\s*\/\s*(\d+)\s*$/);
    if (slashMatch) {
      printRun = parseInt(slashMatch[1], 10);
      name = name.replace(slashMatch[0], '').trim();
    }

    // Pattern 3: "numbered to NNN"
    if (!printRun) {
      const numberedMatch = name.match(/\s*numbered\s+(?:to\s+)?\/?\s*(\d+)\s*$/i);
      if (numberedMatch) {
        printRun = parseInt(numberedMatch[1], 10);
        name = name.replace(numberedMatch[0], '').trim();
      }
    }
  }

  // Clean trailing punctuation
  name = name.replace(/[-–—]+$/, '').trim();
  if (printRun === 1) isOneOfOne = true;

  return {
    name: name || rawName.trim(),
    printRun,
    serialNumbered: printRun !== null,
    isOneOfOne,
  };
}

// ── Parallel extractor ─────────────────────────────────────────────────────────

function extractParallels(data) {
  const aspects = data?.refinement?.aspectDistributions || [];

  for (const targetName of PARALLEL_ASPECT_NAMES) {
    const aspect = aspects.find(a =>
      a.localizedAspectName?.toLowerCase() === targetName.toLowerCase()
    );
    if (aspect && aspect.aspectValueDistributions?.length > 0) {
      const parallels = aspect.aspectValueDistributions.map(v => {
        const parsed = parsePrintRun(v.localizedAspectValue || '');
        return {
          ...parsed,
          _listingCount: v.matchCount || 0,
          rawName: v.localizedAspectValue,
        };
      });
      return { parallels, aspectName: aspect.localizedAspectName };
    }
  }

  if (aspects.length > 0) {
    console.log('  [aspects] No parallel aspect found. Available aspects:');
    aspects.forEach(a =>
      console.log(`    - "${a.localizedAspectName}" (${a.aspectValueDistributions?.length || 0} values)`)
    );
  }

  return { parallels: [], aspectName: null };
}

// ── Noise filter ───────────────────────────────────────────────────────────────

function isNoise(name) {
  return NOISE_PATTERNS.some(re => re.test(name.trim()));
}

/**
 * Filter, deduplicate, and sort raw parallels from eBay.
 * Returns cleaned parallel array ready for rarity assignment.
 */
function cleanParallels(rawParallels) {
  // 1. Remove noise entries
  let filtered = rawParallels.filter(p => {
    if (isNoise(p.name)) return false;
    if (isNoise(p.rawName || '')) return false;
    if (p._listingCount < 5) return false;  // too obscure/mistagged
    return true;
  });

  // 2. Deduplicate similar names — e.g. "Silver Prizm" vs "Silver"
  //    If one name contains another and has >= listings, keep the longer one
  const deduped = [];
  for (const p of filtered) {
    const lowerP = p.name.toLowerCase();
    const dominated = deduped.some(existing => {
      const lowerE = existing.name.toLowerCase();
      // existing subsumes p (e.g. existing = "Silver Prizm", p = "Silver")
      if (lowerE.includes(lowerP) && lowerE !== lowerP) {
        return existing._listingCount >= p._listingCount;
      }
      return false;
    });
    if (!dominated) {
      // Check if p subsumes something already in deduped — replace if more listings
      const subsumed = deduped.findIndex(existing => {
        const lowerE = existing.name.toLowerCase();
        return lowerP.includes(lowerE) && lowerP !== lowerE &&
               p._listingCount >= existing._listingCount;
      });
      if (subsumed >= 0) {
        deduped[subsumed] = p; // replace with more specific name
      } else {
        deduped.push(p);
      }
    }
  }

  return deduped;
}

// ── Color hex resolver ─────────────────────────────────────────────────────────

const COLOR_DICT = [
  { words: ['platinum'],           hex: '#E5E4E2' },
  { words: ['printing plate black'], hex: '#000000' },
  { words: ['printing plate cyan'],  hex: '#00FFFF' },
  { words: ['printing plate magenta'], hex: '#FF00FF' },
  { words: ['printing plate yellow'], hex: '#FFFF00' },
  { words: ['printing plate'],     hex: '#888888' },
  { words: ['black gold'],         hex: '#1A1A1A' },
  { words: ['neon green'],         hex: '#39FF14' },
  { words: ['sky blue'],           hex: '#87CEEB' },
  { words: ['ruby red'],           hex: '#9B111E' },
  { words: ['ruby'],               hex: '#9B111E' },
  { words: ['rose gold'],          hex: '#B76E79' },
  { words: ['royal blue'],         hex: '#4169E1' },
  { words: ['forest green'],       hex: '#228B22' },
  { words: ['neon'],               hex: '#39FF14' },
  { words: ['teal'],               hex: '#008080' },
  { words: ['fuchsia'],            hex: '#FF00FF' },
  { words: ['magenta'],            hex: '#FF00FF' },
  { words: ['aqua'],               hex: '#00FFFF' },
  { words: ['lavender'],           hex: '#E6E6FA' },
  { words: ['coral'],              hex: '#FF6B6B' },
  { words: ['crimson'],            hex: '#DC143C' },
  { words: ['scarlet'],            hex: '#FF2400' },
  { words: ['maroon'],             hex: '#800000' },
  { words: ['navy'],               hex: '#001F5B' },
  { words: ['cobalt'],             hex: '#0047AB' },
  { words: ['sapphire'],           hex: '#0F52BA' },
  { words: ['emerald'],            hex: '#50C878' },
  { words: ['lime'],               hex: '#BFFF00' },
  { words: ['bronze'],             hex: '#CD7F32' },
  { words: ['copper'],             hex: '#B87333' },
  { words: ['hyper'],              hex: '#E8E8FF' },
  { words: ['pulsar'],             hex: '#FFD700' },
  { words: ['mojo'],               hex: '#FFD700' },
  { words: ['seismic'],            hex: '#8B8B8B' },
  { words: ['snakeskin'],          hex: '#556B2F' },
  { words: ['chrome'],             hex: '#C0C0C0' },
  { words: ['laser', 'lazer'],     hex: '#00FFFF' },
  { words: ['mosaic'],             hex: '#E8E8FF' },
  { words: ['ice'],                hex: '#B0E0E6' },
  { words: ['wave'],               hex: '#87CEEB' },
  { words: ['shimmer'],            hex: '#C0C0C0' },
  { words: ['prizm'],              hex: '#C0C0C0' },
  { words: ['refractor'],          hex: '#C0C0C0' },
  { words: ['gold'],               hex: '#FFD700' },
  { words: ['silver'],             hex: '#C0C0C0' },
  { words: ['red'],                hex: '#DC143C' },
  { words: ['blue'],               hex: '#1E90FF' },
  { words: ['green'],              hex: '#228B22' },
  { words: ['black'],              hex: '#1A1A1A' },
  { words: ['pink'],               hex: '#FF69B4' },
  { words: ['purple'],             hex: '#800080' },
  { words: ['orange'],             hex: '#FF8C00' },
  { words: ['white'],              hex: '#F5F5F5' },
  { words: ['yellow'],             hex: '#FFD700' },
  { words: ['brown'],              hex: '#8B4513' },
  { words: ['cyan'],               hex: '#00FFFF' },
  { words: ['indigo'],             hex: '#4B0082' },
  { words: ['turquoise'],          hex: '#40E0D0' },
  { words: ['violet'],             hex: '#EE82EE' },
  { words: ['amber'],              hex: '#FFBF00' },
  { words: ['jade'],               hex: '#00A86B' },
  { words: ['plum'],               hex: '#DDA0DD' },
  { words: ['nebula'],             hex: '#4B0082' },
];

// Sort by longest word first (most specific match wins)
const SORTED_COLOR_DICT = [...COLOR_DICT].sort((a, b) => b.words[0].length - a.words[0].length);

function resolveColorHex(name) {
  if (name.toLowerCase() === 'base') return null;
  const lower = name.toLowerCase();
  for (const entry of SORTED_COLOR_DICT) {
    for (const word of entry.words) {
      if (lower.includes(word)) return entry.hex;
    }
  }
  return null;
}

// ── Rarity rank assignment ─────────────────────────────────────────────────────
//
// Strategy: sort parallels into buckets, then assign sequential ranks within each.
// Unnumbered parallels sorted by listing count (most common = lowest rank).
// Numbered parallels bucketed by print run.

function bucketKey(p) {
  const { printRun, serialNumbered, isOneOfOne } = p;
  if (isOneOfOne || printRun === 1) return 'one_of_one';
  if (!serialNumbered) return 'unnumbered';
  if (printRun >= 500)  return 'n500';
  if (printRun >= 200)  return 'n200';
  if (printRun >= 100)  return 'n100';
  if (printRun >= 50)   return 'n050';
  if (printRun >= 25)   return 'n025';
  if (printRun >= 10)   return 'n010';
  if (printRun >= 5)    return 'n005';
  if (printRun >= 2)    return 'n002';
  return 'n_serial';
}

const BUCKET_BASE = {
  unnumbered: 1,
  n500:       20,
  n200:       30,
  n100:       35,
  n050:       40,
  n025:       50,
  n010:       60,
  n005:       70,
  n002:       80,
  n_serial:   60,
  one_of_one: 90,
};

function assignAllRarityRanks(parallels) {
  const bucketCounts = {};
  return parallels.map(p => {
    const key = bucketKey(p);
    bucketCounts[key] = bucketCounts[key] ?? 0;
    const rank = BUCKET_BASE[key] + bucketCounts[key];
    bucketCounts[key]++;
    return rank;
  });
}

// ── Description generator ──────────────────────────────────────────────────────

function generateDescription(parallel) {
  const { name, printRun, serialNumbered, isOneOfOne } = parallel;

  if (name.toLowerCase() === 'base') return 'Standard base card';

  const lower = name.toLowerCase();
  let core;
  if (lower.includes('refractor')) {
    core = `${name} refractor parallel`;
  } else if (lower.includes('prizm') || lower.includes('silver')) {
    core = `${name} — shimmery refractor finish`;
  } else if (lower.includes('printing plate')) {
    core = `${name} printing plate`;
  } else {
    core = `${name} parallel`;
  }

  if (isOneOfOne || printRun === 1) {
    return `${core} — 1 of 1`;
  } else if (serialNumbered && printRun) {
    return `${core} numbered to ${printRun}`;
  } else {
    return `${core} — unnumbered`;
  }
}

// ── Query builder ──────────────────────────────────────────────────────────────

function buildQuery(product) {
  if (typeof product === 'string') return product;
  const sportKeyword = SPORT_KEYWORDS[product.sport] || product.sport || '';
  return `${product.year} ${product.brand || ''} ${product.name} ${sportKeyword}`.replace(/\s+/g, ' ').trim();
}

function buildSimpleQuery(product) {
  if (typeof product === 'string') {
    // Strip year from raw string
    return String(product).replace(/\d{4}-?\d{0,2}\s+/, '').trim();
  }
  const sportKeyword = SPORT_KEYWORDS[product.sport] || product.sport || '';
  return `${product.name} ${sportKeyword}`.trim();
}

// ── Product matrix helpers ─────────────────────────────────────────────────────

function loadMatrix() {
  if (!existsSync(MATRIX_PATH)) {
    console.error(`ERROR: Product matrix not found at ${MATRIX_PATH}`);
    process.exit(1);
  }
  return JSON.parse(readFileSync(MATRIX_PATH, 'utf-8'));
}

function saveMatrix(matrix) {
  writeFileSync(MATRIX_PATH, JSON.stringify(matrix, null, 2) + '\n', 'utf-8');
}

/**
 * Find a product in the matrix by brand/name/sport/year.
 * Returns { product, index } or null.
 */
function findInMatrix(matrix, brand, name, sport, year) {
  const products = matrix.products || [];
  const idx = products.findIndex(p =>
    p.brand?.toLowerCase() === brand?.toLowerCase() &&
    p.name?.toLowerCase() === name?.toLowerCase() &&
    p.sport?.toLowerCase() === sport?.toLowerCase() &&
    p.year === year
  );
  if (idx === -1) return null;
  return { product: products[idx], index: idx };
}

/**
 * Parse a raw string query like "2022-23 National Treasures Basketball"
 * into { brand, name, sport, year } best-effort.
 */
function parseQueryString(query) {
  const yearMatch = query.match(/(\d{4}-\d{2}|\d{4})/);
  const year = yearMatch ? yearMatch[1] : null;

  const sportReverseMap = Object.entries(SPORT_KEYWORDS).reduce((acc, [k, v]) => {
    acc[v.toLowerCase()] = k;
    return acc;
  }, {});

  let sport = null;
  let cleanQuery = query;

  // Strip year
  if (year) cleanQuery = cleanQuery.replace(year, '').trim();

  // Detect sport from keywords
  for (const [kw, code] of Object.entries(sportReverseMap)) {
    if (cleanQuery.toLowerCase().includes(kw)) {
      sport = code;
      cleanQuery = cleanQuery.replace(new RegExp(kw, 'i'), '').trim();
      break;
    }
  }
  if (!sport) {
    if (/basketball/i.test(query)) sport = 'NBA';
    else if (/football/i.test(query)) sport = 'NFL';
    else if (/baseball/i.test(query)) sport = 'MLB';
    else if (/hockey/i.test(query)) sport = 'NHL';
  }

  // Remaining = brand + name
  const parts = cleanQuery.replace(/\s+/g, ' ').trim().split(' ');
  const brand = parts[0] || null;
  const name = parts.slice(1).join(' ') || null;

  return { brand, name, sport, year };
}

// ── Core seed function ─────────────────────────────────────────────────────────

/**
 * Discover parallels from eBay, clean them, assign rarity/color/description,
 * then seed into Supabase and update the product matrix.
 *
 * @param {object|string} productOrQuery - matrix product object or raw query string
 * @param {object} options - { dryRun }
 */
async function seedProduct(productOrQuery, options = {}) {
  const { dryRun = false } = options;
  const query = buildQuery(productOrQuery);
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`Seeding: "${query}"${dryRun ? '  [DRY RUN]' : ''}`);

  // ── Step 1: eBay search ──────────────────────────────────────────────────────

  let data;
  let totalListings = 0;

  try {
    data = await searchEbayAspects(query);
    totalListings = data?.total || 0;
    console.log(`  Total listings found: ${totalListings.toLocaleString()}`);
  } catch (err) {
    console.error(`  ERROR (eBay search): ${err.message}`);
    return { status: 'error', reason: err.message };
  }

  let { parallels: rawParallels, aspectName } = extractParallels(data);

  // Retry with simpler query if needed
  if (rawParallels.length === 0) {
    const simpleQuery = buildSimpleQuery(productOrQuery);
    if (simpleQuery !== query) {
      console.log(`  No parallel aspect found. Retrying: "${simpleQuery}"`);
      try {
        const data2 = await searchEbayAspects(simpleQuery);
        totalListings = data2?.total || totalListings;
        const result2 = extractParallels(data2);
        rawParallels = result2.parallels;
        aspectName = result2.aspectName;
      } catch (err) {
        console.warn(`  Retry failed: ${err.message}`);
      }
    }
  }

  if (rawParallels.length === 0 && totalListings === 0) {
    console.warn('  SKIP: No eBay listings found for this product.');
    return { status: 'skipped', reason: 'no_listings' };
  }

  console.log(`  Parallel aspect: ${aspectName || 'none found'}`);
  console.log(`  Raw parallels from eBay: ${rawParallels.length}`);

  // ── Step 2: Clean / filter parallels ────────────────────────────────────────

  const cleaned = cleanParallels(rawParallels);
  console.log(`  After noise filter: ${cleaned.length}`);

  // Add a Base parallel if not already present
  const hasBase = cleaned.some(p => /^base$/i.test(p.name));
  if (!hasBase) {
    cleaned.unshift({
      name: 'Base',
      printRun: null,
      serialNumbered: false,
      isOneOfOne: false,
      _listingCount: 999999, // always most common
    });
    console.log('  Added synthetic Base parallel');
  }

  if (cleaned.length < MIN_PARALLELS) {
    console.warn(`  SKIP: Only ${cleaned.length} parallels found (minimum ${MIN_PARALLELS} required). Data quality too low.`);
    return { status: 'skipped', reason: 'insufficient_parallels', count: cleaned.length };
  }

  // ── Step 3: Sort parallels for rank assignment ───────────────────────────────
  //
  // Sort order:
  //   1. Base first
  //   2. Unnumbered — sorted by listing count descending (most common = lower rank)
  //   3. Numbered — sorted by print run descending (higher run = more common)
  //   4. 1/1 last

  const categoryOrder = p => {
    if (p.isOneOfOne || p.printRun === 1) return 4;
    if (p.serialNumbered && p.printRun !== null) return 3;
    return 1; // unnumbered
  };

  cleaned.sort((a, b) => {
    // Base always first
    if (/^base$/i.test(a.name)) return -1;
    if (/^base$/i.test(b.name)) return 1;

    const catA = categoryOrder(a);
    const catB = categoryOrder(b);
    if (catA !== catB) return catA - catB;

    if (catA === 3) return b.printRun - a.printRun; // numbered: higher run = more common
    return b._listingCount - a._listingCount;        // unnumbered: more listings = more common
  });

  // ── Step 4: Assign rarity ranks, color_hex, descriptions ────────────────────

  const ranks = assignAllRarityRanks(cleaned);

  const processedParallels = cleaned.map((p, i) => ({
    name: p.name,
    color_hex: resolveColorHex(p.name),
    print_run: p.printRun ?? null,
    serial_numbered: p.serialNumbered,
    is_one_of_one: p.isOneOfOne,
    rarity_rank: ranks[i],
    box_exclusivity: ['All'],
    description: generateDescription(p),
    _listingCount: p._listingCount, // reference only — not inserted to DB
  }));

  // ── Step 5: Resolve product ID ───────────────────────────────────────────────

  let brand, name, sport, year;
  if (typeof productOrQuery === 'object') {
    ({ brand, name, sport, year } = productOrQuery);
  } else {
    ({ brand, name, sport, year } = parseQueryString(query));
  }

  const matrix = loadMatrix();
  const matrixMatch = findInMatrix(matrix, brand, name, sport, year);
  let productId = matrixMatch?.product?.existingProductId || null;
  let isNewProduct = !productId;

  if (productId) {
    console.log(`  Using existing product ID: ${productId}`);
  } else {
    productId = randomUUID();
    console.log(`  Generated new product ID: ${productId}`);
  }

  const brandId = BRAND_IDS[brand] || null;

  // ── Step 6: Print summary ────────────────────────────────────────────────────

  console.log(`\n  Parallels to seed (${processedParallels.length}):`);
  processedParallels.forEach((p, i) => {
    const pr = p.print_run ? `/${p.print_run}` : 'unnumbered';
    const color = p.color_hex || 'no color';
    console.log(`  ${String(i + 1).padStart(3)}. [rank ${String(p.rarity_rank).padStart(2)}] ${p.name.padEnd(40)} ${pr.padStart(8)}   ${color}   ${p._listingCount} listings`);
  });

  // ── Step 7: Dry run exit ─────────────────────────────────────────────────────

  if (dryRun) {
    console.log('\n  DRY RUN — no DB changes made.');
    return { status: 'dry_run', productId, parallelCount: processedParallels.length };
  }

  // ── Step 8: Upsert product ───────────────────────────────────────────────────

  const productRecord = {
    id: productId,
    brand_id: brandId,
    name: name || query,
    sport: sport || null,
    year: year || null,
    is_flagship: matrixMatch?.product?.isFlagship || false,
    description: `${brand || ''} ${name || ''} ${sport || ''} ${year || ''}`.trim(),
  };

  console.log('\n  Upserting product record...');
  const { error: productErr } = await supabase
    .from('products')
    .upsert(productRecord, { onConflict: 'id' });

  if (productErr) {
    console.error(`  ERROR (product upsert): ${productErr.message}`);
    return { status: 'error', reason: `product_upsert: ${productErr.message}` };
  }
  console.log('  Product upserted OK');

  // ── Step 9: Delete old parallels, insert new ones ────────────────────────────

  console.log('  Deleting existing parallels...');
  const { error: delErr } = await supabase
    .from('parallels')
    .delete()
    .eq('product_id', productId);

  if (delErr) {
    console.warn(`  WARNING (delete parallels): ${delErr.message}`);
  }

  const toInsert = processedParallels.map(({ _listingCount, ...p }) => ({
    product_id: productId,
    ...p,
  }));

  const BATCH_SIZE = 50;
  let inserted = 0;
  for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
    const batch = toInsert.slice(i, i + BATCH_SIZE);
    const { error: insertErr } = await supabase.from('parallels').insert(batch);
    if (insertErr) {
      console.error(`  ERROR (parallels insert batch ${i}): ${insertErr.message}`);
    } else {
      inserted += batch.length;
    }
  }

  console.log(`  Inserted ${inserted}/${toInsert.length} parallels`);

  // Verify
  const { count } = await supabase
    .from('parallels')
    .select('*', { count: 'exact', head: true })
    .eq('product_id', productId);
  console.log(`  Verified: ${count} parallels in DB`);

  // ── Step 10: Update matrix ───────────────────────────────────────────────────

  if (matrixMatch) {
    const idx = matrixMatch.index;
    matrix.products[idx] = {
      ...matrix.products[idx],
      status: 'seeded',
      existingProductId: productId,
      parallelCount: inserted,
      notes: `ebay-seeded ${new Date().toISOString().slice(0, 10)}`,
    };
  } else {
    // Product wasn't in the matrix — append a new entry
    const newEntry = {
      brand: brand || null,
      name: name || null,
      sport: sport || null,
      year: year || null,
      tier: null,
      isFlagship: false,
      checklistUrl: null,
      status: 'seeded',
      existingProductId: productId,
      parallelCount: inserted,
      notes: `ebay-seeded ${new Date().toISOString().slice(0, 10)}`,
    };
    matrix.products.push(newEntry);
    console.log('  Added new product entry to matrix');
  }

  saveMatrix(matrix);
  console.log('  Matrix updated');

  return { status: 'seeded', productId, inserted, isNewProduct };
}

// ── Batch mode ─────────────────────────────────────────────────────────────────

async function runBatch(options = {}) {
  const { sport, dryRun = false } = options;

  const matrix = loadMatrix();
  let products = (matrix.products || []).filter(p => p.status === 'pending');

  if (sport) {
    products = products.filter(p => p.sport?.toUpperCase() === sport.toUpperCase());
  }

  console.log(`Batch mode: ${products.length} pending products to process`);
  if (sport) console.log(`  Filter: sport=${sport}`);
  if (dryRun) console.log('  DRY RUN — no DB changes will be made');

  const results = { seeded: [], skipped: [], errors: [] };

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    console.log(`\n[${i + 1}/${products.length}] ${product.year} ${product.brand} ${product.name} (${product.sport})`);

    try {
      const result = await seedProduct(product, { dryRun });
      if (result.status === 'seeded' || result.status === 'dry_run') {
        results.seeded.push({ product, result });
      } else {
        results.skipped.push({ product, result });
      }
    } catch (err) {
      console.error(`  FAILED: ${err.message}`);
      results.errors.push({ product, error: err.message });
    }

    // Rate limit: 1 request per second in batch mode
    if (i < products.length - 1) {
      await new Promise(r => setTimeout(r, 1100));
    }
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log('Batch complete:');
  console.log(`  Seeded:  ${results.seeded.length}`);
  console.log(`  Skipped: ${results.skipped.length}`);
  console.log(`  Errors:  ${results.errors.length}`);

  if (results.skipped.length > 0) {
    console.log('\nSkipped products:');
    results.skipped.forEach(({ product, result }) => {
      console.log(`  - ${product.year} ${product.brand} ${product.name}: ${result.reason}`);
    });
  }

  if (results.errors.length > 0) {
    console.log('\nFailed products:');
    results.errors.forEach(({ product, error }) => {
      console.log(`  - ${product.year} ${product.brand} ${product.name}: ${error}`);
    });
  }

  return results;
}

// ── CLI entry point ────────────────────────────────────────────────────────────

const rawArgs = process.argv.slice(2);
const flags = {};
const positional = [];

for (const arg of rawArgs) {
  if (arg.startsWith('--')) {
    const [k, v] = arg.slice(2).split('=');
    flags[k] = v ?? 'true';
  } else {
    positional.push(arg);
  }
}

const isBatch = flags.batch === 'true';
const isDryRun = flags['dry-run'] === 'true';

(async () => {
  if (isBatch) {
    await runBatch({
      sport: flags.sport,
      dryRun: isDryRun,
    });
  } else if (positional.length > 0) {
    const query = positional.join(' ');
    const result = await seedProduct(query, { dryRun: isDryRun });

    if (result.status === 'error') {
      process.exit(1);
    }
  } else {
    console.log(`
eBay Seed Pipeline
==================
Discover parallels from eBay and seed them directly into the database.

Usage:
  node scripts/ebay-seed.mjs "2022-23 National Treasures Basketball" --dry-run
  node scripts/ebay-seed.mjs "2022-23 National Treasures Basketball"
  node scripts/ebay-seed.mjs --batch --sport=NBA --dry-run
  node scripts/ebay-seed.mjs --batch --sport=NBA
  node scripts/ebay-seed.mjs --batch

Options:
  --dry-run      Show what would happen without touching the DB or matrix
  --batch        Process all pending products in the product matrix
  --sport=NBA    Filter batch to a specific sport (NBA, NFL, MLB, NHL, WNBA, F1)
`);
    process.exit(0);
  }
})();
