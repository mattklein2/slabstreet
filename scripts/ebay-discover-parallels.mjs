#!/usr/bin/env node

/**
 * eBay Parallel Discovery Tool
 *
 * Uses eBay Browse API + ASPECT_REFINEMENTS to discover all parallel/variety
 * names and print runs for a given sports card product.
 *
 * Usage:
 *   node scripts/ebay-discover-parallels.mjs "2024-25 Prizm Basketball"
 *   node scripts/ebay-discover-parallels.mjs "2024-25 Prizm Basketball" --save
 *   node scripts/ebay-discover-parallels.mjs --batch --sport=NBA --tier=1
 *   node scripts/ebay-discover-parallels.mjs --batch --sport=NBA --tier=1 --save
 */

import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ── Load .env.local ──────────────────────────────────────────────────────────
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

// ── eBay API constants ───────────────────────────────────────────────────────
const EBAY_AUTH_URL = 'https://api.ebay.com/identity/v1/oauth2/token';
const EBAY_BROWSE_URL = 'https://api.ebay.com/buy/browse/v1/item_summary/search';
const SPORTS_CARDS_CATEGORY = '214'; // Sports Trading Cards

// Aspect names eBay uses for parallels (try in order)
const PARALLEL_ASPECT_NAMES = [
  'Parallel/Variety',
  'Parallel',
  'Card Attributes',
  'Variety',
  'Card Type',
  'Insert Set',
];

// ── Token cache (in-process) ──────────────────────────────────────────────────
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

// ── Print run parser ─────────────────────────────────────────────────────────
/**
 * Extracts print run from eBay parallel name strings like:
 *   "Gold Prizm /10"  → { name: "Gold Prizm", printRun: 10 }
 *   "Red /299"        → { name: "Red", printRun: 299 }
 *   "Black 1/1"       → { name: "Black", printRun: 1, isOneOfOne: true }
 *   "#/25"            → { name: "#/25", printRun: 25 }  (keep raw if it IS the name)
 *   "Silver Prizm"    → { name: "Silver Prizm", printRun: null }
 */
function parsePrintRun(rawName) {
  let name = rawName.trim();
  let printRun = null;
  let isOneOfOne = false;

  // Pattern 1: "1/1" anywhere (one-of-one)
  const oneOfOneMatch = name.match(/\b1\s*\/\s*1\b/);
  if (oneOfOneMatch) {
    printRun = 1;
    isOneOfOne = true;
    // Remove the "1/1" suffix/inline notation
    name = name.replace(/\s*\b1\s*\/\s*1\b/, '').trim();
  }

  if (!isOneOfOne) {
    // Pattern 2: "/NNN" or "# /NNN" or "#/NNN" at end
    const slashMatch = name.match(/\s*#?\s*\/\s*(\d+)\s*$/);
    if (slashMatch) {
      printRun = parseInt(slashMatch[1], 10);
      name = name.replace(slashMatch[0], '').trim();
    }

    // Pattern 3: "numbered /NNN" or "Numbered to NNN"
    if (!printRun) {
      const numberedMatch = name.match(/\s*numbered\s+(?:to\s+)?\/?\s*(\d+)\s*$/i);
      if (numberedMatch) {
        printRun = parseInt(numberedMatch[1], 10);
        name = name.replace(numberedMatch[0], '').trim();
      }
    }

    // Pattern 4: " NNN" at end where NNN is a small number (likely print run, e.g. " 10")
    // Only match if it looks like a print run (≤ 999 and preceded by space)
    // Skipped — too aggressive, would match year numbers etc.
  }

  // Clean up trailing punctuation/dashes
  name = name.replace(/[-–—]+$/, '').trim();

  // If printRun is 1, mark as one-of-one
  if (printRun === 1) isOneOfOne = true;

  return {
    name: name || rawName.trim(),
    printRun,
    serialNumbered: printRun !== null,
    isOneOfOne,
  };
}

// ── eBay search ──────────────────────────────────────────────────────────────
async function searchEbayAspects(query) {
  const token = await getAccessToken();

  const params = new URLSearchParams({
    q: query,
    category_ids: SPORTS_CARDS_CATEGORY,
    limit: '1',
    fieldgroups: 'ASPECT_REFINEMENTS',
  });

  const url = `${EBAY_BROWSE_URL}?${params}`;

  const res = await fetch(url, {
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

// ── Parallel extractor ───────────────────────────────────────────────────────
function extractParallels(data) {
  const refinement = data?.refinement;
  if (!refinement) return { parallels: [], aspectName: null };

  const aspects = refinement.aspectDistributions || [];

  // Try each known aspect name in priority order
  for (const targetName of PARALLEL_ASPECT_NAMES) {
    const aspect = aspects.find(a =>
      a.localizedAspectName?.toLowerCase() === targetName.toLowerCase()
    );
    if (aspect && aspect.aspectValueDistributions?.length > 0) {
      const parallels = aspect.aspectValueDistributions.map(v => {
        const parsed = parsePrintRun(v.localizedAspectValue || '');
        return {
          ...parsed,
          listingCount: v.matchCount || 0,
          rawName: v.localizedAspectValue,
        };
      });

      // Sort: base first, then by listing count desc
      parallels.sort((a, b) => {
        const aIsBase = /^base$/i.test(a.name);
        const bIsBase = /^base$/i.test(b.name);
        if (aIsBase && !bIsBase) return -1;
        if (!aIsBase && bIsBase) return 1;
        return b.listingCount - a.listingCount;
      });

      return { parallels, aspectName: aspect.localizedAspectName };
    }
  }

  // Log all available aspect names so we can improve the script
  if (aspects.length > 0) {
    console.log('  [aspects] Available aspects (no parallel aspect found):');
    aspects.forEach(a => console.log(`    - "${a.localizedAspectName}" (${a.aspectValueDistributions?.length || 0} values)`));
  }

  return { parallels: [], aspectName: null };
}

// ── Product query builder ────────────────────────────────────────────────────
const SPORT_KEYWORDS = {
  NBA: 'Basketball',
  NFL: 'Football',
  MLB: 'Baseball',
  NHL: 'Hockey',
  WNBA: 'Basketball WNBA',
  F1: 'Formula 1',
  Soccer: 'Soccer',
  EPL: 'Soccer Premier League',
  FIFA: 'Soccer',
  UEFA: 'Soccer UEFA',
};

function buildQuery(product) {
  // If product has brand/name/year/sport fields (from product matrix)
  if (product.year && product.name && product.sport) {
    const sportKeyword = SPORT_KEYWORDS[product.sport] || product.sport;
    return `${product.year} ${product.brand || ''} ${product.name} ${sportKeyword}`.replace(/\s+/g, ' ').trim();
  }
  // Raw string query
  return product;
}

function buildSimpleQuery(product) {
  if (product.year && product.name && product.sport) {
    const sportKeyword = SPORT_KEYWORDS[product.sport] || product.sport;
    return `${product.name} ${sportKeyword}`.trim();
  }
  // Strip year from string query
  return String(product).replace(/\d{4}-?\d{0,2}\s+/, '').trim();
}

// ── Output path builder ──────────────────────────────────────────────────────
function buildOutputPath(product, query) {
  let sport, year, brand, productName;

  if (typeof product === 'object') {
    sport = (product.sport || 'unknown').toLowerCase();
    year = (product.year || 'unknown').replace('/', '-');
    brand = (product.brand || 'unknown').toLowerCase().replace(/\s+/g, '-');
    productName = (product.name || 'unknown').toLowerCase().replace(/\s+/g, '-');
  } else {
    // Parse from query string like "2024-25 Prizm Basketball"
    const yearMatch = query.match(/(\d{4}-\d{2}|\d{4})/);
    year = yearMatch ? yearMatch[1] : 'unknown';

    const sportMap = { basketball: 'nba', football: 'nfl', baseball: 'mlb', hockey: 'nhl' };
    sport = 'unknown';
    for (const [k, v] of Object.entries(sportMap)) {
      if (query.toLowerCase().includes(k)) { sport = v; break; }
    }

    // Try to extract product name from query (everything after the year, minus sport keyword)
    const clean = query
      .replace(/\d{4}-\d{2}\s+/, '')
      .replace(/\d{4}\s+/, '')
      .replace(/\s*(basketball|football|baseball|hockey|soccer|wnba|formula\s*1|f1|premier\s*league|uefa|fifa)\s*/gi, ' ')
      .trim();

    // Use the cleaned string as both brand and product (simpler — no Panini prefix in raw queries)
    brand = 'unknown';
    productName = clean.toLowerCase().replace(/\s+/g, '-') || 'unknown';
  }

  const filename = `${year}-${brand}-${productName}-ebay.json`;
  const dir = resolve(ROOT, 'data', 'checklists', sport);
  return resolve(dir, filename);
}

// ── Core discovery function ──────────────────────────────────────────────────
async function discoverParallels(productOrQuery, options = {}) {
  const query = typeof productOrQuery === 'string' ? productOrQuery : buildQuery(productOrQuery);
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`Discovering: "${query}"`);

  let data;
  let totalListings = 0;

  try {
    data = await searchEbayAspects(query);
    totalListings = data?.total || 0;
    console.log(`  Total listings found: ${totalListings.toLocaleString()}`);
  } catch (err) {
    console.error(`  ERROR: ${err.message}`);
    return null;
  }

  let { parallels, aspectName } = extractParallels(data);

  // If no parallels found and we have listings, try simpler query
  if (parallels.length === 0 && totalListings > 0) {
    const simpleQuery = buildSimpleQuery(productOrQuery);
    if (simpleQuery !== query) {
      console.log(`  No parallel aspect found. Retrying with simpler query: "${simpleQuery}"`);
      try {
        const data2 = await searchEbayAspects(simpleQuery);
        const result2 = extractParallels(data2);
        if (result2.parallels.length > 0) {
          parallels = result2.parallels;
          aspectName = result2.aspectName;
          totalListings = data2?.total || totalListings;
        }
      } catch (err) {
        console.warn(`  Retry failed: ${err.message}`);
      }
    }
  }

  // If still 0 listings, try simpler query anyway
  if (totalListings === 0) {
    const simpleQuery = buildSimpleQuery(productOrQuery);
    if (simpleQuery !== query) {
      console.log(`  0 listings. Retrying with: "${simpleQuery}"`);
      try {
        const data2 = await searchEbayAspects(simpleQuery);
        totalListings = data2?.total || 0;
        console.log(`  Retry listings found: ${totalListings.toLocaleString()}`);
        if (totalListings > 0) {
          const result2 = extractParallels(data2);
          parallels = result2.parallels;
          aspectName = result2.aspectName;
        }
      } catch (err) {
        console.warn(`  Retry failed: ${err.message}`);
      }
    }
  }

  console.log(`  Parallel aspect: ${aspectName || 'none found'}`);
  console.log(`  Parallels discovered: ${parallels.length}`);

  // Determine product metadata
  let sport, year, brand, productName;
  if (typeof productOrQuery === 'object') {
    sport = productOrQuery.sport;
    year = productOrQuery.year;
    brand = productOrQuery.brand;
    productName = productOrQuery.name;
  } else {
    // Infer from query string
    const yearMatch = query.match(/(\d{4}-\d{2}|\d{4})/);
    year = yearMatch ? yearMatch[1] : null;

    const sportMap = {
      basketball: 'NBA', football: 'NFL', baseball: 'MLB',
      hockey: 'NHL', soccer: 'Soccer',
    };
    sport = null;
    for (const [k, v] of Object.entries(sportMap)) {
      if (query.toLowerCase().includes(k)) { sport = v; break; }
    }

    // Simple extraction: remove year and sport keyword
    const clean = query
      .replace(/\d{4}-\d{2}\s+/, '')
      .replace(/\d{4}\s+/, '')
      .replace(/basketball|football|baseball|hockey|soccer/gi, '')
      .trim()
      .split(/\s+/);
    brand = clean[0] || null;
    productName = clean.slice(1).join(' ') || null;
  }

  const result = {
    source: 'ebay',
    query,
    discoveredAt: new Date().toISOString(),
    sport,
    year,
    brand,
    product: productName,
    totalListings,
    parallelAspectName: aspectName,
    parallels: parallels.map(({ rawName, ...rest }) => rest), // remove internal rawName
  };

  // Print summary table
  if (parallels.length > 0) {
    console.log('\n  Top 20 parallels:');
    parallels.slice(0, 20).forEach((p, i) => {
      const pr = p.printRun ? `/${p.printRun}` : 'unnumbered';
      const oo = p.isOneOfOne ? ' [1/1]' : '';
      console.log(`  ${String(i + 1).padStart(2)}. ${p.name.padEnd(35)} ${pr.padStart(8)}  ${p.listingCount.toLocaleString()} listings${oo}`);
    });
    if (parallels.length > 20) {
      console.log(`  ... and ${parallels.length - 20} more`);
    }
  }

  // Save if requested
  if (options.save) {
    const outputPath = buildOutputPath(productOrQuery, query);
    const dir = dirname(outputPath);
    mkdirSync(dir, { recursive: true });
    writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');
    console.log(`\n  Saved: ${outputPath}`);
  }

  return result;
}

// ── Batch mode ───────────────────────────────────────────────────────────────
async function runBatch(options = {}) {
  const matrixPath = resolve(ROOT, 'data', 'product-matrix.json');
  if (!existsSync(matrixPath)) {
    console.error(`ERROR: Product matrix not found at ${matrixPath}`);
    process.exit(1);
  }

  const matrix = JSON.parse(readFileSync(matrixPath, 'utf-8'));
  let products = matrix.products || [];

  // Apply filters
  if (options.sport) {
    products = products.filter(p => p.sport?.toUpperCase() === options.sport.toUpperCase());
  }
  if (options.tier) {
    products = products.filter(p => p.tier === parseInt(options.tier, 10));
  }
  if (options.status) {
    products = products.filter(p => p.status === options.status);
  } else {
    products = products.filter(p => p.status === 'pending');
  }

  console.log(`Batch mode: ${products.length} products to process`);
  if (options.sport) console.log(`  Filter: sport=${options.sport}`);
  if (options.tier) console.log(`  Filter: tier=${options.tier}`);

  const results = [];
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    console.log(`\n[${i + 1}/${products.length}]`);

    try {
      const result = await discoverParallels(product, options);
      if (result) results.push({ product, result });
    } catch (err) {
      console.error(`  FAILED: ${err.message}`);
    }

    // Rate limit: 1 request per second (eBay is generous but be polite)
    if (i < products.length - 1) {
      await new Promise(r => setTimeout(r, 1100));
    }
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`Batch complete: ${results.length}/${products.length} succeeded`);

  return results;
}

// ── CLI entry point ──────────────────────────────────────────────────────────
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
const isSave = flags.save === 'true';

(async () => {
  if (isBatch) {
    await runBatch({
      sport: flags.sport,
      tier: flags.tier,
      status: flags.status,
      save: isSave,
    });
  } else if (positional.length > 0) {
    const query = positional.join(' ');
    const result = await discoverParallels(query, { save: isSave });
    if (!result) process.exit(1);

    // Full JSON output if --json flag
    if (flags.json === 'true') {
      console.log('\n' + JSON.stringify(result, null, 2));
    }
  } else {
    console.log(`
eBay Parallel Discovery Tool
Usage:
  node scripts/ebay-discover-parallels.mjs "2024-25 Prizm Basketball"
  node scripts/ebay-discover-parallels.mjs "2024-25 Prizm Basketball" --save
  node scripts/ebay-discover-parallels.mjs "2024-25 Prizm Basketball" --json
  node scripts/ebay-discover-parallels.mjs --batch --sport=NBA --tier=1 --save
  node scripts/ebay-discover-parallels.mjs --batch --sport=NFL --save
`);
    process.exit(0);
  }
})();
