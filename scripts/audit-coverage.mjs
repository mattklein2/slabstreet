#!/usr/bin/env node
/**
 * audit-coverage.mjs
 * Compare data/product-matrix.json against the Supabase products DB.
 *
 * Reports:
 *   - Products in matrix that exist in DB (seeded), with parallel count
 *   - Products in matrix that are missing from DB
 *   - Products in DB that have no matching matrix entry (orphans)
 *
 * Usage:
 *   node scripts/audit-coverage.mjs
 *   node scripts/audit-coverage.mjs --sport=NBA
 *   node scripts/audit-coverage.mjs --tier=1
 *   node scripts/audit-coverage.mjs --sport=NFL --tier=2
 *   node scripts/audit-coverage.mjs --verbose
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const envPath = resolve(ROOT, '.env.local');
const env = {};
if (existsSync(envPath)) {
  readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
    const m = line.match(/^([^#=][^=]*)=(.*)/);
    if (m) env[m[1].trim()] = m[2].trim();
  });
}

if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('Error: Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// ---------------------------------------------------------------------------
// Arg parsing
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = {};
  for (const arg of argv.slice(2)) {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      args[key] = value ?? true;
    }
  }
  return args;
}

const args = parseArgs(process.argv);
const FILTER_SPORT = args.sport ? args.sport.toUpperCase() : null;
const FILTER_TIER  = args.tier  ? Number(args.tier)        : null;
const VERBOSE      = !!args.verbose;

// ---------------------------------------------------------------------------
// Load matrix
// ---------------------------------------------------------------------------

function loadMatrix() {
  const matrixPath = resolve(ROOT, 'data/product-matrix.json');
  if (!existsSync(matrixPath)) {
    console.error(`Error: product matrix not found at ${matrixPath}`);
    process.exit(1);
  }
  try {
    return JSON.parse(readFileSync(matrixPath, 'utf-8')).products;
  } catch (err) {
    console.error(`Error parsing product matrix: ${err.message}`);
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// DB queries
// ---------------------------------------------------------------------------

async function fetchDbProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, sport, year');
  if (error) {
    console.error(`Error fetching products from DB: ${error.message}`);
    process.exit(1);
  }
  return data ?? [];
}

async function fetchParallelCounts(productIds) {
  if (productIds.length === 0) return {};

  // Fetch all parallels for these product_ids in one query
  const { data, error } = await supabase
    .from('parallels')
    .select('product_id')
    .in('product_id', productIds);

  if (error) {
    console.error(`Error fetching parallels from DB: ${error.message}`);
    process.exit(1);
  }

  const counts = {};
  for (const row of data ?? []) {
    counts[row.product_id] = (counts[row.product_id] ?? 0) + 1;
  }
  return counts;
}

// ---------------------------------------------------------------------------
// Match logic
//
// A matrix entry is considered "seeded" if:
//   (a) its status is "seeded" AND it has an existingProductId, OR
//   (b) we can find a DB product matching (sport, year, name) case-insensitively.
//
// The existingProductId is the authoritative link when present.
// ---------------------------------------------------------------------------

function normalise(s) {
  return String(s ?? '').trim().toLowerCase();
}

function buildDbLookup(dbProducts) {
  // Key: "sport|year|name" (normalised)
  const byKey = new Map();
  const byId  = new Map();
  for (const p of dbProducts) {
    const key = `${normalise(p.sport)}|${normalise(p.year)}|${normalise(p.name)}`;
    byKey.set(key, p);
    byId.set(p.id, p);
  }
  return { byKey, byId };
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

const col = (s, w) => String(s ?? '').padEnd(w).slice(0, w);

function pct(num, den) {
  if (den === 0) return '  n/a';
  return `${Math.round((num / den) * 100)}%`.padStart(4);
}

function printSection(title, rows) {
  if (rows.length === 0) return;
  console.log(`\n${title} (${rows.length})`);
  console.log('-'.repeat(72));
  for (const line of rows) {
    console.log(line);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const allMatrix = loadMatrix();

  // Apply CLI filters to matrix entries
  let matrix = allMatrix;
  if (FILTER_SPORT) matrix = matrix.filter(p => p.sport.toUpperCase() === FILTER_SPORT);
  if (FILTER_TIER)  matrix = matrix.filter(p => Number(p.tier) === FILTER_TIER);

  // Fetch all DB products (unfiltered — we need orphan detection across full DB)
  const dbProducts = await fetchDbProducts();
  const { byKey, byId } = buildDbLookup(dbProducts);

  // Collect all DB product IDs we'll need parallel counts for
  const allDbIds = dbProducts.map(p => p.id);
  const parallelCounts = await fetchParallelCounts(allDbIds);

  // ---------------------------------------------------------------------------
  // Classify matrix entries
  // ---------------------------------------------------------------------------

  const seeded  = [];   // in matrix AND in DB
  const missing = [];   // in matrix, NOT in DB

  const matchedDbIds = new Set();

  for (const entry of matrix) {
    let dbProduct = null;

    // Prefer explicit existingProductId
    if (entry.existingProductId) {
      dbProduct = byId.get(entry.existingProductId) ?? null;
    }

    // Fallback: name/sport/year match
    if (!dbProduct) {
      const key = `${normalise(entry.sport)}|${normalise(entry.year)}|${normalise(entry.name)}`;
      dbProduct = byKey.get(key) ?? null;
    }

    if (dbProduct) {
      matchedDbIds.add(dbProduct.id);
      seeded.push({ entry, dbProduct, parallelCount: parallelCounts[dbProduct.id] ?? 0 });
    } else {
      missing.push({ entry });
    }
  }

  // ---------------------------------------------------------------------------
  // Orphan detection (only meaningful when no sport/tier filter is applied,
  // because filters scope the matrix but not the DB)
  // ---------------------------------------------------------------------------

  const orphans = [];
  if (!FILTER_SPORT && !FILTER_TIER) {
    // All matrix IDs (unfiltered) that are matched
    // We must rebuild matchedDbIds using full matrix so orphan count is accurate
    const fullMatchedIds = new Set();
    for (const entry of allMatrix) {
      let dbProduct = null;
      if (entry.existingProductId) dbProduct = byId.get(entry.existingProductId) ?? null;
      if (!dbProduct) {
        const key = `${normalise(entry.sport)}|${normalise(entry.year)}|${normalise(entry.name)}`;
        dbProduct = byKey.get(key) ?? null;
      }
      if (dbProduct) fullMatchedIds.add(dbProduct.id);
    }

    for (const p of dbProducts) {
      if (!fullMatchedIds.has(p.id)) {
        orphans.push(p);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Summary header
  // ---------------------------------------------------------------------------

  const filterDesc = [
    FILTER_SPORT ? `sport=${FILTER_SPORT}` : null,
    FILTER_TIER  ? `tier=${FILTER_TIER}`   : null,
  ].filter(Boolean).join(', ');

  console.log('\n=== COVERAGE AUDIT ===');
  if (filterDesc) console.log(`Filters: ${filterDesc}`);
  console.log(`Matrix:   ${matrix.length} products defined`);
  console.log(`Seeded:   ${seeded.length} products exist in DB (${matrix.length - seeded.length} missing)`);
  if (!FILTER_SPORT && !FILTER_TIER) {
    console.log(`DB total: ${dbProducts.length} products  |  Orphans: ${orphans.length}`);
  }

  // ---------------------------------------------------------------------------
  // By Sport
  // ---------------------------------------------------------------------------

  const sports = [...new Set(matrix.map(p => p.sport))].sort();
  if (sports.length > 1) {
    console.log('\nBy Sport:');
    for (const sport of sports) {
      const total   = matrix.filter(p => p.sport === sport).length;
      const present = seeded.filter(s => s.entry.sport === sport).length;
      console.log(`  ${col(sport + ':', 8)} ${present}/${total} seeded (${pct(present, total)})`);
    }
  }

  // ---------------------------------------------------------------------------
  // By Tier
  // ---------------------------------------------------------------------------

  const tiers = [...new Set(matrix.map(p => p.tier))].sort((a, b) => a - b);
  if (tiers.length > 1 || !FILTER_TIER) {
    const TIER_LABELS = { 1: 'Flagship', 2: 'Major', 3: 'Other' };
    console.log('\nBy Tier:');
    for (const tier of tiers) {
      const label   = TIER_LABELS[tier] ?? `Tier ${tier}`;
      const total   = matrix.filter(p => p.tier === tier).length;
      const present = seeded.filter(s => s.entry.tier === tier).length;
      console.log(`  Tier ${tier} (${col(label + '):', 11)} ${present}/${total} seeded (${pct(present, total)})`);
    }
  }

  // ---------------------------------------------------------------------------
  // Verbose: seeded detail
  // ---------------------------------------------------------------------------

  if (VERBOSE && seeded.length > 0) {
    const rows = seeded.map(({ entry, dbProduct, parallelCount }) =>
      [
        col(entry.sport,       6),
        col(entry.year,        9),
        col(entry.brand,       8),
        col(entry.name,       28),
        `T${entry.tier}`,
        `${String(parallelCount).padStart(3)} parallels`,
        dbProduct.id,
      ].join('  ')
    );
    printSection('SEEDED (in matrix + DB)', rows);
  }

  // ---------------------------------------------------------------------------
  // Missing detail (always shown)
  // ---------------------------------------------------------------------------

  if (missing.length > 0) {
    const rows = missing.map(({ entry }) =>
      [
        col(entry.sport,  6),
        col(entry.year,   9),
        col(entry.brand,  8),
        col(entry.name,  28),
        `T${entry.tier}`,
        entry.status !== 'pending' ? `[${entry.status}]` : '',
      ].join('  ').trimEnd()
    );
    printSection('MISSING FROM DB (in matrix, not seeded)', rows);
  }

  // ---------------------------------------------------------------------------
  // Orphans (always shown when no filter)
  // ---------------------------------------------------------------------------

  if (orphans.length > 0) {
    const rows = orphans.map(p =>
      [
        col(p.sport, 6),
        col(p.year,  9),
        col(p.name, 36),
        `(${parallelCounts[p.id] ?? 0} parallels)`,
        p.id,
      ].join('  ')
    );
    printSection('ORPHANS (in DB, not in matrix)', rows);
  }

  console.log('');
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
