#!/usr/bin/env node

/**
 * Cardboard Connection URL Generator
 *
 * Queries all products from Supabase, generates expected Cardboard Connection
 * checklist URLs, validates them with HEAD requests, and writes results to
 * data/checklist-urls-{sport}.txt (valid) and data/checklist-urls-{sport}-missing.txt (404s).
 *
 * Usage:
 *   node scripts/generate-checklist-urls.mjs                # all sports
 *   node scripts/generate-checklist-urls.mjs --sport nba    # NBA only
 *   node scripts/generate-checklist-urls.mjs --dry-run      # generate URLs without HTTP validation
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ── Parse CLI args ──────────────────────────────────────────────────────────

const args = process.argv.slice(2);
let sportFilter = null;
let dryRun = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--sport' && args[i + 1]) {
    sportFilter = args[i + 1].toUpperCase();
    i++;
  } else if (args[i] === '--dry-run') {
    dryRun = true;
  }
}

// ── Env / Supabase ──────────────────────────────────────────────────────────

const envPath = resolve(ROOT, '.env.local');
const env = {};
if (existsSync(envPath)) {
  readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
    const m = line.match(/^([^#=][^=]*)=(.*)/);
    if (m) env[m[1].trim()] = m[2].trim();
  });
}

const supabaseUrl = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ── Constants ───────────────────────────────────────────────────────────────

const SPORTS = ['NBA', 'NFL', 'MLB', 'WNBA', 'F1'];
const DATA_DIR = resolve(ROOT, 'data');

/** Map sport codes to URL sport slugs */
const SPORT_SLUG_MAP = {
  NBA: 'basketball',
  NFL: 'football',
  MLB: 'baseball',
  WNBA: 'wnba',
  F1: 'formula-1',
};

/** Alternate sport slugs to try if the primary returns 404 */
const SPORT_SLUG_ALT = {
  WNBA: 'wnba-basketball',
  F1: 'f1',
};

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Sleep for ms milliseconds */
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/**
 * Slugify a string: lowercase, strip special chars, replace spaces/whitespace with hyphens.
 */
function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')  // strip special characters
    .replace(/\s+/g, '-')           // spaces to hyphens
    .replace(/-+/g, '-')            // collapse multiple hyphens
    .replace(/^-|-$/g, '');          // trim leading/trailing hyphens
}

/**
 * Format the year portion of the URL.
 * Basketball & football use split-year format (e.g., "2024-25").
 * Baseball, WNBA, F1 use single year (e.g., "2024").
 */
function formatYear(year, sport) {
  if (sport === 'NBA' || sport === 'NFL') {
    // Split year: 2024 → "2024-25"
    const nextYear = (parseInt(year, 10) + 1) % 100;
    const nextStr = nextYear.toString().padStart(2, '0');
    return `${year}-${nextStr}`;
  }
  return year;
}

/**
 * Generate candidate Cardboard Connection URLs for a product.
 * Returns an array of URLs to try in order.
 */
function generateCandidateUrls(product, brandName) {
  const { name: productName, year, sport } = product;

  const yearSlug = formatYear(year, sport);
  const brandSlug = slugify(brandName);
  const productSlug = slugify(productName);

  // Check if brand name is already part of the product name (case-insensitive)
  // e.g., brand="Topps", product="Topps Chrome" → just use "topps-chrome"
  const productLower = productName.toLowerCase();
  const brandLower = brandName.toLowerCase();
  const brandInProduct = productLower.startsWith(brandLower);

  // Build the product portion of the URL
  const productPortion = brandInProduct
    ? productSlug
    : `${brandSlug}-${productSlug}`;

  const sportSlug = SPORT_SLUG_MAP[sport];
  const altSportSlug = SPORT_SLUG_ALT[sport];

  const base = 'https://www.cardboardconnection.com';
  const candidates = [];

  // Primary: {year}-{brand}-{product}-{sport}-cards
  candidates.push(`${base}/${yearSlug}-${productPortion}-${sportSlug}-cards`);

  // Alt suffix: -checklist instead of -cards
  candidates.push(`${base}/${yearSlug}-${productPortion}-${sportSlug}-checklist`);

  // If sport has an alternate slug, try those too
  if (altSportSlug) {
    candidates.push(`${base}/${yearSlug}-${productPortion}-${altSportSlug}-cards`);
    candidates.push(`${base}/${yearSlug}-${productPortion}-${altSportSlug}-checklist`);
  }

  return candidates;
}

/**
 * Validate a URL with an HTTP HEAD request. Returns true if status 200-399.
 */
async function validateUrl(url) {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SlabStreet/1.0)',
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nCardboard Connection URL Generator${dryRun ? ' (DRY RUN)' : ''}\n`);

  // Ensure data directory exists
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }

  // Query all products with brand names
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, year, sport, brands!inner(name)')
    .order('sport')
    .order('year', { ascending: false })
    .order('name');

  if (error) {
    console.error('ERROR querying products:', error.message);
    process.exit(1);
  }

  if (!products || products.length === 0) {
    console.log('No products found in database.');
    return;
  }

  console.log(`Found ${products.length} products total.\n`);

  // Group by sport
  const bySport = {};
  for (const p of products) {
    const sport = p.sport;
    if (!bySport[sport]) bySport[sport] = [];
    bySport[sport].push(p);
  }

  const sportsToProcess = sportFilter ? [sportFilter] : SPORTS;
  const summary = {};

  for (const sport of sportsToProcess) {
    const sportProducts = bySport[sport];
    if (!sportProducts || sportProducts.length === 0) {
      console.log(`[${sport}] No products found, skipping.\n`);
      continue;
    }

    console.log(`[${sport}] Generating URLs for ${sportProducts.length} products...`);

    const validUrls = [];
    const missingUrls = [];

    for (let i = 0; i < sportProducts.length; i++) {
      const product = sportProducts[i];
      const brandName = product.brands?.name || 'Unknown';
      const candidates = generateCandidateUrls(product, brandName);
      const primaryUrl = candidates[0];

      const label = primaryUrl.replace('https://www.cardboardconnection.com/', '');
      const progress = `[${i + 1}/${sportProducts.length}]`;

      if (dryRun) {
        // In dry-run mode, just list the primary candidate URL
        console.log(`[${sport}] ${progress} ${label} (dry-run)`);
        validUrls.push(primaryUrl);
        continue;
      }

      // Try each candidate URL in order
      let foundUrl = null;
      for (const url of candidates) {
        const ok = await validateUrl(url);
        if (ok) {
          foundUrl = url;
          break;
        }
        // Rate limit: 1 request per second
        await sleep(1000);
      }

      if (foundUrl) {
        const foundLabel = foundUrl.replace('https://www.cardboardconnection.com/', '');
        console.log(`[${sport}] ${progress} ${foundLabel} ✓`);
        validUrls.push(foundUrl);
      } else {
        console.log(`[${sport}] ${progress} ${label} ✗ (404)`);
        missingUrls.push(primaryUrl);
      }

      // Rate limit between products (already slept between candidates above,
      // but ensure at least 1s between the last request and the next product)
      if (!dryRun && i < sportProducts.length - 1) {
        await sleep(1000);
      }
    }

    // Write results
    const sportKey = sport.toLowerCase();
    const validPath = resolve(DATA_DIR, `checklist-urls-${sportKey}.txt`);
    const missingPath = resolve(DATA_DIR, `checklist-urls-${sportKey}-missing.txt`);

    writeFileSync(validPath, validUrls.join('\n') + '\n', 'utf-8');
    console.log(`[${sport}] Wrote ${validUrls.length} valid URLs to ${validPath}`);

    if (missingUrls.length > 0) {
      writeFileSync(missingPath, missingUrls.join('\n') + '\n', 'utf-8');
      console.log(`[${sport}] Wrote ${missingUrls.length} missing URLs to ${missingPath}`);
    }

    summary[sport] = { valid: validUrls.length, missing: missingUrls.length };
    console.log('');
  }

  // ── Summary ─────────────────────────────────────────────────────────────────

  console.log('═══════════════════════════════════════════');
  for (const [sport, counts] of Object.entries(summary)) {
    console.log(`  ${sport}: ${counts.valid} valid, ${counts.missing} missing`);
  }
  if (dryRun) console.log('  (DRY RUN — no HTTP validation performed)');
  console.log('═══════════════════════════════════════════\n');
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
