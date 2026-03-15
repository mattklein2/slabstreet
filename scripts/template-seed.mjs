#!/usr/bin/env node

/**
 * Template-based seeder for historical card products.
 *
 * Reads parallel data from a seeded "template" product in the DB, then copies
 * those parallels to a new "target" product (different year, same brand/name/sport).
 * Optionally trims the parallel rainbow for older years (2018-2020).
 *
 * Usage:
 *   # Single mode — copy one product year
 *   node scripts/template-seed.mjs --template="2024-25 Prizm NBA" --target-year="2022-23" --dry-run
 *   node scripts/template-seed.mjs --template="2024-25 Prizm NBA" --target-year="2022-23"
 *
 *   # Batch mode — seed all pending products for a sport/tier using closest template
 *   node scripts/template-seed.mjs --batch --sport=NBA --tier=1 --dry-run
 *   node scripts/template-seed.mjs --batch --sport=NBA --tier=1
 *   node scripts/template-seed.mjs --batch --sport=NBA --tier=1,2
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

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// ── Constants ──────────────────────────────────────────────────────────────────

const BRAND_IDS = {
  Panini:       'b0000000-0000-0000-0000-000000000001',
  Topps:        'b0000000-0000-0000-0000-000000000002',
  'Upper Deck': 'b0000000-0000-0000-0000-000000000003',
  Bowman:       'b0000000-0000-0000-0000-000000000004',
};

const MATRIX_PATH = resolve(ROOT, 'data', 'product-matrix.json');

// Core parallels that should always survive complexity reduction.
// These are the essential named colours that collectors recognise across all eras.
const CORE_PARALLEL_NAMES = new Set([
  'base', 'silver', 'red', 'blue', 'green', 'gold', 'black',
  'purple', 'orange', 'pink', 'white', 'holo', 'refractor',
]);

// ── CLI args ───────────────────────────────────────────────────────────────────

function parseArgs() {
  const args = {};
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--')) {
      const eqIdx = arg.indexOf('=');
      if (eqIdx === -1) {
        args[arg.slice(2)] = true;
      } else {
        const key = arg.slice(2, eqIdx);
        const value = arg.slice(eqIdx + 1);
        args[key] = value;
      }
    }
  }
  return args;
}

// ── Matrix I/O ─────────────────────────────────────────────────────────────────

function loadMatrix() {
  return JSON.parse(readFileSync(MATRIX_PATH, 'utf-8'));
}

function saveMatrix(matrix) {
  writeFileSync(MATRIX_PATH, JSON.stringify(matrix, null, 2) + '\n', 'utf-8');
}

// ── Template resolution helpers ────────────────────────────────────────────────

/**
 * Parse a display label like "2024-25 Prizm NBA" into {year, name, sport}.
 * Also accepts plain year labels like "2022-23 Donruss NBA".
 */
function parseTemplateLabel(label) {
  // Match "YYYY-YY Name SPORT" or "YYYY Name SPORT"
  const m = label.match(/^(\d{4}(?:-\d{2,4})?)\s+(.+?)\s+([A-Z0-9]+)$/i);
  if (!m) return null;
  return { year: m[1], name: m[2].trim(), sport: m[3].toUpperCase() };
}

/**
 * Find a seeded matrix entry by {name, sport, year}.
 * Returns the first match or null.
 */
function findSeededEntry(matrix, name, sport, year) {
  return matrix.products.find(p =>
    p.status === 'seeded' &&
    p.name === name &&
    p.sport.toUpperCase() === sport.toUpperCase() &&
    p.year === year
  ) ?? null;
}

/**
 * For a given pending product (brand/name/sport), find the seeded entry with
 * the closest year. "Closest" = smallest numeric difference in the first year
 * segment. Prefers newer templates (so we copy the richest rainbow).
 *
 * Returns the seeded matrix entry, or null if none exists.
 */
function findClosestTemplate(matrix, product) {
  const candidates = matrix.products.filter(p =>
    p.status === 'seeded' &&
    p.brand === product.brand &&
    p.name === product.name &&
    p.sport.toUpperCase() === product.sport.toUpperCase()
  );

  if (candidates.length === 0) return null;

  // Extract the leading 4-digit year for comparison
  function leadYear(y) {
    return parseInt(String(y).slice(0, 4), 10);
  }

  const targetLead = leadYear(product.year);

  // Sort by absolute difference, then prefer higher (newer) year on ties
  candidates.sort((a, b) => {
    const diffA = Math.abs(leadYear(a.year) - targetLead);
    const diffB = Math.abs(leadYear(b.year) - targetLead);
    if (diffA !== diffB) return diffA - diffB;
    return leadYear(b.year) - leadYear(a.year); // newer wins tie
  });

  return candidates[0];
}

// ── Complexity reduction ───────────────────────────────────────────────────────

/**
 * For a given target year string, return the reduction factor:
 *   2018-2020 → 0.80 (remove ~20% of parallels)
 *   2021+     → 1.00 (keep all)
 *
 * "Remove" strategy: drop unnumbered box-exclusives that are NOT in the core
 * colour set, keeping all numbered parallels and all 1-of-1s intact.
 */
function shouldReduce(targetYear) {
  const lead = parseInt(String(targetYear).slice(0, 4), 10);
  return lead <= 2020;
}

/**
 * Decide whether a parallel should be kept during complexity reduction.
 * Rules:
 *  - Always keep: serial_numbered=true (any numbered parallel)
 *  - Always keep: is_one_of_one=true
 *  - Always keep: name matches CORE_PARALLEL_NAMES (first word)
 *  - Otherwise: candidate for removal
 */
function isEssentialParallel(parallel) {
  if (parallel.serial_numbered || parallel.is_one_of_one) return true;
  const firstWord = parallel.name.toLowerCase().split(/[\s\/\-]/)[0];
  if (CORE_PARALLEL_NAMES.has(firstWord)) return true;
  return false;
}

/**
 * Apply complexity reduction to an array of parallel rows.
 * Removes ~20% of non-essential parallels.
 */
function reduceParallels(parallels) {
  const essential = parallels.filter(isEssentialParallel);
  const optional  = parallels.filter(p => !isEssentialParallel(p));

  // Keep 80% of optional ones, deterministically (trim from the end so we
  // drop the most obscure box-exclusives, which tend to appear last).
  const keepCount = Math.ceil(optional.length * 0.8);
  const keptOptional = optional.slice(0, keepCount);

  // Merge back, preserving the original rarity_rank ordering
  const kept = [...essential, ...keptOptional];
  kept.sort((a, b) => a.rarity_rank - b.rarity_rank);

  return kept;
}

// ── DB operations ──────────────────────────────────────────────────────────────

/**
 * Fetch all parallels for a given productId from the DB.
 * Returns an array of parallel rows (all columns).
 */
async function fetchTemplateParallels(templateProductId) {
  const { data, error } = await supabase
    .from('parallels')
    .select('*')
    .eq('product_id', templateProductId);

  if (error) {
    throw new Error(`Failed to fetch parallels for template ${templateProductId}: ${error.message}`);
  }
  return data ?? [];
}

/**
 * Upsert a product record.
 * Returns the product ID on success, null on failure.
 */
async function upsertProduct(matrixEntry, productId) {
  const brandId = BRAND_IDS[matrixEntry.brand];
  if (!brandId) {
    console.warn(`  Unknown brand "${matrixEntry.brand}" — cannot map to brand_id. Skipping.`);
    return null;
  }

  const row = {
    id: productId,
    brand_id: brandId,
    name: matrixEntry.name,
    sport: matrixEntry.sport,
    year: matrixEntry.year,
    is_flagship: matrixEntry.isFlagship ?? false,
    description: `${matrixEntry.brand} ${matrixEntry.name} ${matrixEntry.sport} ${matrixEntry.year}`,
  };

  const { error } = await supabase.from('products').upsert(row, { onConflict: 'id' });
  if (error) {
    console.error(`  Product upsert failed: ${error.message}`);
    return null;
  }
  return productId;
}

/**
 * Delete existing parallels for a product, then batch-insert new ones.
 * Returns the count of successfully inserted rows.
 */
async function replaceParallels(productId, parallelRows) {
  const { error: delErr } = await supabase
    .from('parallels')
    .delete()
    .eq('product_id', productId);

  if (delErr) {
    console.error(`  Delete parallels failed: ${delErr.message}`);
    return 0;
  }

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

// ── Core seeding logic ─────────────────────────────────────────────────────────

/**
 * Build the target parallel rows from template parallels.
 * - Replaces product_id with targetProductId
 * - Generates new IDs for each parallel
 * - Optionally applies complexity reduction for older years
 */
function buildTargetParallels(templateParallels, targetProductId, targetYear) {
  let parallels = templateParallels.map(p => {
    // Strip DB metadata, assign new IDs and product reference
    const { id: _id, product_id: _pid, created_at: _ca, ...rest } = p;
    return {
      ...rest,
      id: randomUUID(),
      product_id: targetProductId,
    };
  });

  if (shouldReduce(targetYear)) {
    const before = parallels.length;
    parallels = reduceParallels(parallels);
    const after = parallels.length;
    console.log(`  Complexity reduction (pre-2021 year): ${before} → ${after} parallels (-${before - after})`);
  }

  return parallels;
}

/**
 * Seed a single pending product using a template.
 * Returns { success: boolean, insertedCount: number }
 */
async function seedOneProduct(matrixEntry, templateEntry, matrix, dryRun) {
  const label = `${matrixEntry.year} ${matrixEntry.brand} ${matrixEntry.name} ${matrixEntry.sport}`;

  // Determine product ID — reuse existing if present
  const targetProductId = matrixEntry.existingProductId || randomUUID();
  const templateProductId = templateEntry.existingProductId;

  if (!templateProductId) {
    console.warn(`  Template "${templateEntry.year} ${templateEntry.name} ${templateEntry.sport}" has no existingProductId. Skipping.`);
    return { success: false, insertedCount: 0 };
  }

  console.log(`  Template: ${templateEntry.year} ${templateEntry.brand} ${templateEntry.name} (${templateProductId.slice(0, 8)}...)`);

  // Fetch template parallels from DB
  let templateParallels;
  try {
    templateParallels = await fetchTemplateParallels(templateProductId);
  } catch (err) {
    console.error(`  ${err.message}`);
    return { success: false, insertedCount: 0 };
  }

  if (templateParallels.length === 0) {
    console.warn(`  Template product has no parallels in DB. Skipping "${label}".`);
    return { success: false, insertedCount: 0 };
  }

  console.log(`  Template parallels fetched: ${templateParallels.length}`);

  // Build target parallel rows
  const targetParallels = buildTargetParallels(templateParallels, targetProductId, matrixEntry.year);

  console.log(`  Target parallels to insert: ${targetParallels.length}`);

  if (dryRun) {
    console.log(`  [dry-run] Would upsert product: ${targetProductId}`);
    console.log(`  [dry-run] Would replace parallels (delete old + insert ${targetParallels.length})`);
    const sample = targetParallels.slice(0, 3);
    sample.forEach(r => {
      const pr = r.print_run ? `/${r.print_run}` : r.serial_numbered ? 'serial' : 'unnumbered';
      console.log(`    ${r.name} (${pr}, rank ${r.rarity_rank})`);
    });
    if (targetParallels.length > 3) console.log(`    ... and ${targetParallels.length - 3} more`);
    return { success: true, insertedCount: targetParallels.length };
  }

  // Upsert product record
  const resolvedId = await upsertProduct(matrixEntry, targetProductId);
  if (!resolvedId) {
    return { success: false, insertedCount: 0 };
  }

  // Replace parallels
  const insertedCount = await replaceParallels(resolvedId, targetParallels);
  console.log(`  Inserted ${insertedCount}/${targetParallels.length} parallels`);

  // Update matrix entry
  const matrixEntry2 = matrix.products.find(p =>
    p.sport === matrixEntry.sport &&
    p.year  === matrixEntry.year  &&
    p.brand === matrixEntry.brand &&
    p.name  === matrixEntry.name
  );
  if (matrixEntry2) {
    matrixEntry2.status = 'seeded';
    matrixEntry2.existingProductId = resolvedId;
    matrixEntry2.parallelCount = insertedCount;
    matrixEntry2.notes = `template: ${templateEntry.year} ${templateEntry.name}`;
  }

  // Persist matrix after each success so partial runs are recoverable
  saveMatrix(matrix);
  console.log(`  Matrix updated: status=seeded, parallelCount=${insertedCount}`);

  return { success: true, insertedCount };
}

// ── Single mode ────────────────────────────────────────────────────────────────

async function runSingleMode(args) {
  const templateLabel = args.template;
  const targetYear    = args['target-year'];
  const dryRun        = args['dry-run'] === true || args['dry-run'] === 'true';

  if (!templateLabel || !targetYear) {
    console.error('Error: --template and --target-year are required in single mode.');
    console.error('  Example: node scripts/template-seed.mjs --template="2024-25 Prizm NBA" --target-year="2022-23"');
    process.exit(1);
  }

  const parsed = parseTemplateLabel(templateLabel);
  if (!parsed) {
    console.error(`Error: Cannot parse --template="${templateLabel}". Expected format: "YEAR Name SPORT"`);
    process.exit(1);
  }

  console.log(`Single mode: ${templateLabel} → ${targetYear}`);
  if (dryRun) console.log('DRY RUN — no DB writes or matrix updates.\n');

  const matrix = loadMatrix();

  // Find the template seeded entry
  const templateEntry = findSeededEntry(matrix, parsed.name, parsed.sport, parsed.year);
  if (!templateEntry) {
    console.error(`Error: No seeded entry found in matrix for "${templateLabel}"`);
    console.error('  The template product must already be seeded (status="seeded") in the matrix.');
    process.exit(1);
  }

  // Find the target pending entry
  const targetEntry = matrix.products.find(p =>
    p.name === parsed.name &&
    p.sport.toUpperCase() === parsed.sport &&
    p.year === targetYear
  );

  if (!targetEntry) {
    console.error(`Error: No matrix entry found for ${targetYear} ${parsed.name} ${parsed.sport}`);
    process.exit(1);
  }

  if (targetEntry.status === 'seeded') {
    console.warn(`Warning: Target "${targetYear} ${parsed.name} ${parsed.sport}" is already seeded.`);
    console.warn('  Continuing anyway — will overwrite parallels.');
  }

  console.log(`Target: ${targetYear} ${targetEntry.brand} ${targetEntry.name} ${targetEntry.sport}`);
  const { success, insertedCount } = await seedOneProduct(targetEntry, templateEntry, matrix, dryRun);

  console.log('');
  console.log(success
    ? `Done. Seeded ${insertedCount} parallels for ${targetYear} ${parsed.name} ${parsed.sport}.`
    : 'Done. Seed failed — see errors above.'
  );
}

// ── Batch mode ─────────────────────────────────────────────────────────────────

async function runBatchMode(args) {
  const dryRun        = args['dry-run'] === true || args['dry-run'] === 'true';
  const sportFilter   = args.sport ? args.sport.toUpperCase() : null;
  const tierFilter    = args.tier
    ? String(args.tier).split(',').map(t => parseInt(t.trim(), 10))
    : null;

  if (!sportFilter) {
    console.error('Error: --sport is required in batch mode (e.g. --sport=NBA)');
    process.exit(1);
  }

  console.log(`Batch mode: sport=${sportFilter}${tierFilter ? ` tier=${tierFilter.join(',')}` : ''}`);
  if (dryRun) console.log('DRY RUN — no DB writes or matrix updates.\n');

  const matrix = loadMatrix();

  // Find all pending targets that match the filter
  const targets = matrix.products.filter(p => {
    if (p.status === 'seeded') return false;
    if (p.sport.toUpperCase() !== sportFilter) return false;
    if (tierFilter && !tierFilter.includes(p.tier)) return false;
    return true;
  });

  if (targets.length === 0) {
    console.log(`No pending products found for sport=${sportFilter}${tierFilter ? ` tier=${tierFilter.join(',')}` : ''}`);
    return;
  }

  console.log(`Found ${targets.length} pending product(s) to seed.\n`);

  let succeeded = 0;
  let failed = 0;
  let skipped = 0;

  for (let idx = 0; idx < targets.length; idx++) {
    const product = targets[idx];
    const label = `${product.year} ${product.brand} ${product.name} ${product.sport}`;
    console.log(`[${idx + 1}/${targets.length}] ${label}`);

    // Find closest seeded template for this product line
    const templateEntry = findClosestTemplate(matrix, product);

    if (!templateEntry) {
      console.warn(`  No seeded template found for ${product.brand} ${product.name} ${product.sport} — skipping.`);
      skipped++;
      console.log('');
      continue;
    }

    const { success } = await seedOneProduct(product, templateEntry, matrix, dryRun);

    if (success) {
      succeeded++;
    } else {
      failed++;
    }
    console.log('');
  }

  console.log('─'.repeat(60));
  console.log(`Done. ${succeeded} succeeded, ${failed} failed, ${skipped} skipped (no template).`);
  if (dryRun) {
    console.log('(Dry run — no changes written to DB or matrix.)');
  }
}

// ── Entry point ────────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs();

  if (args.batch) {
    await runBatchMode(args);
  } else if (args.template) {
    await runSingleMode(args);
  } else {
    console.error('Error: Must specify either --batch or --template="..."');
    console.error('');
    console.error('Examples:');
    console.error('  node scripts/template-seed.mjs --template="2024-25 Prizm NBA" --target-year="2022-23" --dry-run');
    console.error('  node scripts/template-seed.mjs --batch --sport=NBA --tier=1 --dry-run');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
