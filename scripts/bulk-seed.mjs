#!/usr/bin/env node

/**
 * Bulk seeder for the product matrix.
 *
 * Reads data/product-matrix.json, filters by sport/tier, then for each
 * pending product:
 *   1. Checks if a checklist JSON exists in data/checklists/
 *   2. If not, scrapes it from checklistUrl
 *   3. Derives parallel data (color_hex, rarity_rank, description)
 *   4. Upserts the product record into the `products` table
 *   5. Deletes + inserts parallels into the `parallels` table
 *   6. Marks the product as "seeded" in the matrix JSON
 *
 * Usage:
 *   node scripts/bulk-seed.mjs --sport=NBA --tier=1 --dry-run
 *   node scripts/bulk-seed.mjs --sport=NBA --tier=1
 *   node scripts/bulk-seed.mjs --sport=NFL --tier=1,2
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import * as cheerio from 'cheerio';
import { randomUUID } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ── Env / Supabase ────────────────────────────────────────────────────────────

const envPath = resolve(ROOT, '.env.local');
const env = {};
if (existsSync(envPath)) {
  readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
    const m = line.match(/^([^#=][^=]*)=(.*)/);
    if (m) env[m[1].trim()] = m[2].trim();
  });
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// ── Constants ─────────────────────────────────────────────────────────────────

const BRAND_IDS = {
  Panini:     'b0000000-0000-0000-0000-000000000001',
  Topps:      'b0000000-0000-0000-0000-000000000002',
  'Upper Deck': 'b0000000-0000-0000-0000-000000000003',
  Bowman:     'b0000000-0000-0000-0000-000000000004',
};

const MATRIX_PATH = resolve(ROOT, 'data', 'product-matrix.json');
const CHECKLIST_DIR = resolve(ROOT, 'data', 'checklists');

// Rate limit between scrape requests
const SCRAPE_DELAY_MS = 2000;

// ── CLI args ──────────────────────────────────────────────────────────────────

function parseArgs() {
  const args = {};
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      args[key] = value ?? true;
    }
  }
  return args;
}

// ── Color dictionary ──────────────────────────────────────────────────────────
// Maps lowercase color/finish keywords to hex codes.
// Checked against existing seed scripts for consistency.

const COLOR_MAP = {
  // Reds
  red:         '#CC0000',
  crimson:     '#DC143C',
  ruby:        '#9B111E',
  maroon:      '#800000',
  scarlet:     '#FF2400',

  // Oranges
  orange:      '#FF8C00',
  copper:      '#B87333',

  // Yellows / Golds
  gold:        '#FFD700',
  yellow:      '#FFD700',
  amber:       '#FFBF00',

  // Greens
  green:       '#22C55E',
  emerald:     '#50C878',
  jade:        '#00A86B',
  lime:        '#32CD32',
  neon:        '#39FF14',
  olive:       '#808000',
  teal:        '#008080',

  // Blues
  blue:        '#4169E1',
  cobalt:      '#0047AB',
  navy:        '#001F5B',
  sapphire:    '#0F52BA',
  sky:         '#87CEEB',
  aqua:        '#00FFFF',
  cyan:        '#00BCD4',
  ice:         '#B0E0E6',
  turquoise:   '#40E0D0',
  wave:        '#87CEEB',

  // Purples / Pinks
  purple:      '#800080',
  violet:      '#EE82EE',
  lavender:    '#E6E6FA',
  magenta:     '#FF00FF',
  pink:        '#FF69B4',
  rose:        '#FF007F',
  indigo:      '#4B0082',
  plum:        '#DDA0DD',
  nebula:      '#4B0082',

  // Silvers / Whites / Grays
  silver:      '#C0C0C0',
  white:       '#FFFFFF',
  gray:        '#808080',
  grey:        '#808080',
  platinum:    '#E5E4E2',
  hyper:       '#E8E8FF',

  // Blacks
  black:       '#000000',

  // Special
  prizm:       '#C0C0C0',
  refractor:   '#C0C0C0',
  mojo:        '#FFD700',
  pulsar:      '#FFD700',
  sparkle:     '#FFD700',
  seismic:     '#8B8B8B',
  snakeskin:   '#556B2F',
  bronze:      '#CD7F32',
  chrome:      '#C0C0C0',
  shimmer:     '#C0C0C0',
  laser:       '#00FFFF',
  lazer:       '#00FFFF',
  mosaic:      '#E8E8FF',
};

/**
 * Guess a hex color from a parallel name.
 * Checks each word in the name against the color map.
 * Returns null if no match.
 */
function guessColorHex(name) {
  const words = name.toLowerCase().split(/[\s\/\-]+/);
  // Try multi-word keys first (not in this map but guard for future)
  for (const word of words) {
    if (COLOR_MAP[word]) return COLOR_MAP[word];
  }
  return null;
}

// ── Rarity ranking ────────────────────────────────────────────────────────────

/**
 * Assign a rarity_rank to a parallel based on its print run and serial status.
 * Lower rank = more common. This is a coarse bucket — we sort within buckets
 * by insertion order (which preserves the scraper's order).
 *
 * Bucket scheme:
 *   1      → unnumbered (not serial)
 *   10+    → serial, print_run >= 500
 *   20+    → serial, print_run 200-499
 *   30+    → serial, print_run 100-199
 *   40+    → serial, print_run 50-99
 *   50+    → serial, print_run 25-49
 *   60+    → serial, print_run 10-24
 *   70+    → serial, print_run 5-9
 *   80+    → serial, print_run 2-4
 *   90+    → 1-of-1 (print_run === 1 or isOneOfOne)
 */
function assignRarityRank(parallel, indexWithinBucket) {
  const { printRun, serialNumbered, isOneOfOne } = parallel;

  if (isOneOfOne || printRun === 1) return 90 + indexWithinBucket;
  if (!serialNumbered) return 1 + indexWithinBucket;
  if (printRun >= 500)  return 10 + indexWithinBucket;
  if (printRun >= 200)  return 20 + indexWithinBucket;
  if (printRun >= 100)  return 30 + indexWithinBucket;
  if (printRun >= 50)   return 40 + indexWithinBucket;
  if (printRun >= 25)   return 50 + indexWithinBucket;
  if (printRun >= 10)   return 60 + indexWithinBucket;
  if (printRun >= 5)    return 70 + indexWithinBucket;
  if (printRun >= 2)    return 80 + indexWithinBucket;
  // serialNumbered but no printRun — treat as low-numbered
  return 60 + indexWithinBucket;
}

/**
 * Assign rarity ranks to an array of raw parallels (from scraper JSON).
 * Groups them by rarity bucket first, then assigns sequential ranks.
 */
function assignAllRarityRanks(rawParallels) {
  // Sort into buckets
  const buckets = new Map();

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

  // Track per-bucket counts
  const bucketCounts = {};

  return rawParallels.map(p => {
    const key = bucketKey(p);
    bucketCounts[key] = (bucketCounts[key] ?? 0);
    const rank = assignRarityRank(p, bucketCounts[key]);
    bucketCounts[key]++;
    return rank;
  });
}

// ── Checklist scraper (inline from scrape-checklist.mjs) ─────────────────────
// We inline this because scrape-checklist.mjs has no exported functions —
// its logic runs directly in main(). Duplicating the core pieces here.

function detectSportSubdir(url) {
  const s = url.toLowerCase();
  if (s.includes('basketball') || s.includes('-nba')) return 'nba';
  if (s.includes('football')   || s.includes('-nfl')) return 'nfl';
  if (s.includes('baseball')   || s.includes('-mlb')) return 'mlb';
  if (s.includes('formula')    || s.includes('-f1'))  return 'f1';
  if (s.includes('wnba'))                              return 'wnba';
  if (s.includes('soccer')     || s.includes('epl') || s.includes('fifa') || s.includes('uefa')) return 'soccer';
  return null;
}

function stemFromUrl(url) {
  const parsed = new URL(url);
  let slug = parsed.pathname.replace(/^\//, '').replace(/\/$/, '');
  slug = slug.replace(/-cards$/, '');
  return slug;
}

function parsePrintRun(text) {
  const t = text.toLowerCase();
  if (/\b1\/1\b/.test(t) || /\bone[\s-]of[\s-]one\b/.test(t)) {
    return { printRun: 1, serialNumbered: true, isOneOfOne: true };
  }
  const slashMatch = t.match(/(?:#\s*\/|\/)\s*(\d+)/);
  if (slashMatch) {
    const n = parseInt(slashMatch[1], 10);
    return { printRun: n, serialNumbered: true, isOneOfOne: n === 1 };
  }
  const numberedMatch = t.match(/numbered(?:\s+(?:to|#\s*\/))?\s+(\d+)/);
  if (numberedMatch) {
    const n = parseInt(numberedMatch[1], 10);
    return { printRun: n, serialNumbered: true, isOneOfOne: n === 1 };
  }
  if (/serial[\s-]?numbered/.test(t)) {
    return { printRun: null, serialNumbered: true, isOneOfOne: false };
  }
  return null;
}

function parseExclusivity(text) {
  const t = text.toLowerCase();
  if (/\bfotl\b/.test(t) || /first\s+off\s+the\s+line/i.test(t)) return 'FOTL';
  if (/\bhobby\b/.test(t)) return 'Hobby';
  if (/\bretail\b/.test(t)) return 'Retail';
  if (/\bblaster\b/.test(t)) return 'Blaster';
  if (/\bmega\s*box\b/.test(t)) return 'Mega';
  return null;
}

function parseParallelLine(rawText) {
  const text = rawText.trim();
  if (!text) return null;

  const prInfo = parsePrintRun(text) || { printRun: null, serialNumbered: false, isOneOfOne: false };
  const exclusivity = parseExclusivity(text);

  let name = text
    .replace(/\([^)]*\)/g, '')
    .replace(/[-–]\s*#?\s*\/\s*\d+/g, '')
    .replace(/numbered(?:\s+(?:to|#\s*\/)?)?\s*\d*/gi, '')
    .replace(/serial[\s-]?numbered/gi, '')
    .replace(/\b1\/1\b/gi, '')
    .replace(/one[\s-]of[\s-]one/gi, '')
    .replace(/hobby\s*(only|exclusive)?/gi, '')
    .replace(/retail\s*(only|exclusive)?/gi, '')
    .replace(/fotl/gi, '')
    .replace(/first\s+off\s+the\s+line/gi, '')
    .replace(/blaster/gi, '')
    .replace(/mega\s*box/gi, '')
    .replace(/[-–:,]+\s*$/, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  if (!name) return null;
  return { name, ...prInfo, exclusivity };
}

function isParallelHeader(text) {
  const t = text.toLowerCase().trim();
  return (
    t.startsWith('parallel') ||
    t === 'parallel cards:' ||
    t === 'parallels:' ||
    t === 'parallels' ||
    t === 'parallel cards' ||
    t === 'color variations' ||
    t === 'color variations:'
  );
}

function parseChecklistPage(html) {
  const $ = cheerio.load(html);
  const parallels = [];
  const seen = new Set();

  function addParallel(parsed) {
    if (!parsed || !parsed.name) return;
    const key = parsed.name.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    parallels.push(parsed);
  }

  // Strategy 1: Find "Parallels" section headers
  $('h2, h3, h4, strong, b, p').each((_, el) => {
    const headText = $(el).text().trim();
    if (!isParallelHeader(headText)) return;

    let target = $(el).next();
    for (let i = 0; i < 10; i++) {
      if (!target.length) break;
      const tag = target.prop('tagName')?.toLowerCase();
      if (tag === 'ul' || tag === 'ol') {
        target.find('li').each((_, li) => {
          addParallel(parseParallelLine($(li).text()));
        });
        break;
      }
      if (tag === 'p') {
        const text = target.text().trim();
        if (!text || isParallelHeader(text)) { target = target.next(); continue; }
        text.split(/[,\n]/).forEach(chunk => addParallel(parseParallelLine(chunk)));
        break;
      }
      if (['h2', 'h3', 'h4'].includes(tag)) break;
      target = target.next();
    }
  });

  // Strategy 2: Scan all <li> for print-run items
  $('li').each((_, el) => {
    const text = $(el).text().trim();
    if (!text || text.length > 200) return;
    const prInfo = parsePrintRun(text);
    const excl = parseExclusivity(text);
    if (prInfo || excl) {
      addParallel(parseParallelLine(text));
    }
  });

  // Strategy 3: Tables with parallel columns
  $('table').each((_, table) => {
    const headers = $(table)
      .find('th')
      .map((_, th) => $(th).text().toLowerCase().trim())
      .get();
    const parallelColIdx = headers.findIndex(h =>
      h.includes('parallel') || h.includes('variation') || h.includes('color')
    );
    if (parallelColIdx === -1) return;
    $(table).find('tbody tr').each((_, row) => {
      const cells = $(row).find('td');
      const nameCell = $(cells[parallelColIdx]).text().trim();
      if (!nameCell) return;
      const rowText = $(row).text();
      const prInfo = parsePrintRun(rowText) || { printRun: null, serialNumbered: false, isOneOfOne: false };
      const exclusivity = parseExclusivity(rowText);
      const key = nameCell.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        parallels.push({ name: nameCell, ...prInfo, exclusivity });
      }
    });
  });

  // Strategy 4: Inline text with explicit print runs
  const bodyText = $('article, .entry-content, main, #content').text();
  const inlineWithPrintRun = /([A-Z][A-Za-z\s]+?)\s*[-–:]\s*(#?\/\d+|1\/1|numbered(?:\s+(?:to\s+)?\d+))/gi;
  let m;
  while ((m = inlineWithPrintRun.exec(bodyText)) !== null) {
    const rawName = m[1].trim();
    const rawPrint = m[2];
    if (rawName.split(' ').length > 6) continue;
    const prInfo = parsePrintRun(rawPrint) || { printRun: null, serialNumbered: false, isOneOfOne: false };
    const key = rawName.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      parallels.push({ name: rawName, ...prInfo, exclusivity: null });
    }
  }

  return parallels;
}

async function fetchWithRetry(url, retries = 3, delayMs = 2000) {
  const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': ua,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
      return await res.text();
    } catch (err) {
      console.error(`  Fetch attempt ${attempt} failed: ${err.message}`);
      if (attempt < retries) {
        const wait = delayMs * attempt;
        console.log(`  Retrying in ${wait}ms...`);
        await new Promise(r => setTimeout(r, wait));
      } else {
        throw err;
      }
    }
  }
}

/**
 * Scrape a checklist URL and save HTML + JSON to data/checklists/{subdir}/.
 * Returns the parsed parallels array, or null on failure.
 */
async function scrapeChecklist(url) {
  const subdir = detectSportSubdir(url);
  if (!subdir) {
    console.warn(`  Cannot detect sport from URL, skipping: ${url}`);
    return null;
  }

  const stem = stemFromUrl(url);
  const outDir = resolve(CHECKLIST_DIR, subdir);
  mkdirSync(outDir, { recursive: true });

  const htmlPath = resolve(outDir, `${stem}.html`);
  const jsonPath = resolve(outDir, `${stem}.json`);

  console.log(`  Scraping: ${url}`);
  const html = await fetchWithRetry(url);

  writeFileSync(htmlPath, html, 'utf-8');

  const rawParallels = parseChecklistPage(html);
  const output = {
    url,
    scrapedAt: new Date().toISOString(),
    parallels: rawParallels,
  };
  writeFileSync(jsonPath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`  Saved ${rawParallels.length} parallels to ${jsonPath}`);

  return rawParallels;
}

/**
 * Check if a JSON checklist already exists for the given URL.
 * Returns the parsed parallels array, or null if not found.
 */
function loadExistingChecklist(url) {
  const subdir = detectSportSubdir(url);
  if (!subdir) return null;

  const stem = stemFromUrl(url);
  const jsonPath = resolve(CHECKLIST_DIR, subdir, `${stem}.json`);

  if (!existsSync(jsonPath)) return null;

  try {
    const data = JSON.parse(readFileSync(jsonPath, 'utf-8'));
    return data.parallels || [];
  } catch {
    return null;
  }
}

// ── Parallel enrichment ───────────────────────────────────────────────────────

/**
 * Convert raw scraped parallels into DB-ready rows for a given productId.
 */
function buildParallelRows(productId, rawParallels) {
  const ranks = assignAllRarityRanks(rawParallels);

  return rawParallels.map((p, i) => {
    const colorHex = guessColorHex(p.name);
    const exclusivity = p.exclusivity ? [p.exclusivity] : ['All'];

    let description = p.name;
    if (p.isOneOfOne) description += ' — 1 of 1';
    else if (p.printRun) description += ` — /${p.printRun}`;
    else if (p.serialNumbered) description += ' — serial numbered';
    if (p.exclusivity) description += ` [${p.exclusivity} exclusive]`;

    return {
      product_id: productId,
      name: p.name,
      color_hex: colorHex,
      print_run: p.printRun ?? null,
      serial_numbered: p.serialNumbered ?? false,
      is_one_of_one: p.isOneOfOne ?? false,
      rarity_rank: ranks[i],
      box_exclusivity: exclusivity,
      description,
      special_attributes: null,
    };
  });
}

// ── DB operations ─────────────────────────────────────────────────────────────

async function upsertProduct(product, productId) {
  const brandId = BRAND_IDS[product.brand];
  if (!brandId) {
    console.warn(`  Unknown brand "${product.brand}" — cannot map to brand_id`);
    return false;
  }

  const row = {
    id: productId,
    brand_id: brandId,
    name: product.name,
    sport: product.sport,
    year: product.year,
    is_flagship: product.isFlagship ?? false,
    description: `${product.brand} ${product.name} ${product.sport} ${product.year}`,
  };

  const { error } = await supabase.from('products').upsert(row, { onConflict: 'id' });
  if (error) {
    console.error(`  Product upsert failed: ${error.message}`);
    return false;
  }
  return true;
}

async function replaceParallels(productId, parallelRows) {
  // Delete existing
  const { error: delErr } = await supabase
    .from('parallels')
    .delete()
    .eq('product_id', productId);

  if (delErr) {
    console.error(`  Delete parallels failed: ${delErr.message}`);
    return 0;
  }

  // Batch insert
  const BATCH = 50;
  let inserted = 0;
  for (let i = 0; i < parallelRows.length; i += BATCH) {
    const batch = parallelRows.slice(i, i + BATCH);
    const { error } = await supabase.from('parallels').insert(batch);
    if (error) {
      console.error(`  Parallel insert batch ${i} failed: ${error.message}`);
    } else {
      inserted += batch.length;
    }
  }

  return inserted;
}

// ── Matrix I/O ────────────────────────────────────────────────────────────────

function loadMatrix() {
  const raw = readFileSync(MATRIX_PATH, 'utf-8');
  return JSON.parse(raw);
}

function saveMatrix(matrix) {
  writeFileSync(MATRIX_PATH, JSON.stringify(matrix, null, 2), 'utf-8');
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs();

  const DRY_RUN = args['dry-run'] === true || args['dry-run'] === 'true';
  const sportFilter = args.sport ? args.sport.toUpperCase() : null;
  // Support comma-separated tiers: --tier=1,2
  const tierFilter = args.tier
    ? args.tier.toString().split(',').map(t => parseInt(t.trim(), 10))
    : null;

  if (!sportFilter) {
    console.error('Error: --sport is required (e.g. --sport=NBA)');
    process.exit(1);
  }

  if (DRY_RUN) {
    console.log('DRY RUN MODE — no DB writes or matrix updates will occur.\n');
  }

  // Load matrix
  const matrix = loadMatrix();
  const allProducts = matrix.products;

  // Filter
  let targets = allProducts.filter(p => {
    if (p.status === 'seeded') return false;
    if (p.sport.toUpperCase() !== sportFilter) return false;
    if (tierFilter && !tierFilter.includes(p.tier)) return false;
    return true;
  });

  if (targets.length === 0) {
    console.log(`No pending products found for sport=${sportFilter}${tierFilter ? ` tier=${tierFilter.join(',')}` : ''}`);
    return;
  }

  const total = targets.length;
  console.log(`Found ${total} pending product(s) to seed for ${sportFilter}${tierFilter ? ` Tier ${tierFilter.join(',')}` : ''}\n`);

  let succeeded = 0;
  let failed = 0;
  let scraped = 0;

  for (let idx = 0; idx < targets.length; idx++) {
    const product = targets[idx];
    const label = `${product.year} ${product.brand} ${product.name} ${product.sport}`;
    const progress = `[${idx + 1}/${total}]`;

    // Determine product ID
    const productId = product.existingProductId || randomUUID();

    console.log(`${progress} ${label}`);

    // ── Step 1: Get checklist parallels ──────────────────────────────────────
    let rawParallels = null;

    if (product.checklistUrl) {
      // Try existing cached JSON first
      rawParallels = loadExistingChecklist(product.checklistUrl);

      if (rawParallels !== null) {
        console.log(`  Using cached checklist: ${rawParallels.length} parallel(s)`);
      } else {
        // Need to scrape — rate limit before each request
        if (idx > 0 || scraped > 0) {
          console.log(`  Waiting ${SCRAPE_DELAY_MS}ms before scraping...`);
          await new Promise(r => setTimeout(r, SCRAPE_DELAY_MS));
        }

        try {
          rawParallels = await scrapeChecklist(product.checklistUrl);
          scraped++;
        } catch (err) {
          console.error(`  Scrape failed: ${err.message}`);
          rawParallels = null;
        }
      }
    }

    if (!rawParallels || rawParallels.length === 0) {
      console.warn(`  No parallels found — skipping ${label}`);
      failed++;
      console.log('');
      continue;
    }

    // ── Step 2: Build parallel rows ───────────────────────────────────────────
    const parallelRows = buildParallelRows(productId, rawParallels);
    console.log(`  ${progress} Seeding ${label} — ${parallelRows.length} parallel(s) found...`);

    if (DRY_RUN) {
      console.log(`  [dry-run] Would upsert product: ${productId}`);
      console.log(`  [dry-run] Would insert ${parallelRows.length} parallels`);
      const sample = parallelRows.slice(0, 3);
      sample.forEach(r => {
        const pr = r.print_run ? `/${r.print_run}` : r.serial_numbered ? 'serial' : 'unnumbered';
        console.log(`    ${r.name} (${pr}, rank ${r.rarity_rank}, hex ${r.color_hex ?? 'none'})`);
      });
      if (parallelRows.length > 3) console.log(`    ... and ${parallelRows.length - 3} more`);
      succeeded++;
      console.log('');
      continue;
    }

    // ── Step 3: Upsert product ────────────────────────────────────────────────
    const productOk = await upsertProduct(product, productId);
    if (!productOk) {
      failed++;
      console.log('');
      continue;
    }

    // ── Step 4: Replace parallels ─────────────────────────────────────────────
    const insertedCount = await replaceParallels(productId, parallelRows);
    console.log(`  Inserted ${insertedCount}/${parallelRows.length} parallels`);

    // ── Step 5: Update matrix ─────────────────────────────────────────────────
    // Find the matching entry in the full matrix array and update it
    const matrixEntry = allProducts.find(p =>
      p.sport === product.sport &&
      p.year  === product.year  &&
      p.brand === product.brand &&
      p.name  === product.name
    );

    if (matrixEntry) {
      matrixEntry.status = 'seeded';
      matrixEntry.existingProductId = productId;
      matrixEntry.parallelCount = insertedCount;
    }

    // Write matrix after each successful seed so partial runs are recoverable
    saveMatrix(matrix);
    console.log(`  Matrix updated: status=seeded, parallelCount=${insertedCount}`);

    succeeded++;
    console.log('');
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('─'.repeat(60));
  console.log(`Done. ${succeeded} succeeded, ${failed} failed, ${scraped} scraped from web.`);
  if (DRY_RUN) {
    console.log('(Dry run — no changes were written to DB or matrix.)');
  }
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
