#!/usr/bin/env node

/**
 * Insert Data Loader
 *
 * Reads scraped JSON files from data/checklists/{sport}/ and loads insert set
 * data into Supabase (card_sets + parallels tables).
 *
 * Usage:
 *   node scripts/load-inserts.mjs                  # all sports
 *   node scripts/load-inserts.mjs --sport nba      # NBA only
 *   node scripts/load-inserts.mjs --dry-run        # preview without writing
 *   node scripts/load-inserts.mjs --sport nba --dry-run
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { resolve, dirname, join } from 'path';
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
    sportFilter = args[i + 1].toLowerCase();
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

const SPORTS = ['nba', 'nfl', 'mlb', 'wnba', 'f1'];

/**
 * Skip insert names that are actually page junk scraped by mistake.
 * These patterns catch review sections, box break stats, autograph headers, etc.
 */
const JUNK_INSERT_PATTERNS = [
  /box\s*break\s*average/i,
  /break\s*average/i,
  /white\s*sparkle\s*packs?/i,
  /autographs?\s*$/i,            // "2024 Prizm Basketball Autographs" (section header, not insert)
  /autographs?\s*&\s*memorabilia/i,
  /review\s*and\s*analysis/i,
  /strengths.*value.*collector/i,
  /\bcons\b$/i,                  // "Cons" section from reviews
  /\bpros\b$/i,                  // "Pros" section from reviews
  /overall\s*rating/i,
  /value\s*breakdown/i,
  /memorabilia\s*and\s*relics/i,
  /patches.*swatches.*dual/i,
  /collector\s*appeal/i,
  /set\s*review/i,
  /where\s*to\s*buy/i,
  /release\s*date/i,
  /price\s*guide/i,
  /checklist\s*info/i,
  /what\s*to\s*expect/i,
  /\bconfiguration\b/i,
  /\bfinal\s*verdict\b/i,
  /box\s*and\s*case\s*breakdown/i,
  /card\s*gallery/i,
  /\bchecklist\b$/i,
  /printing\s*plates/i,
  /hobby\s*box/i,
  /retail\s*box/i,
  /blaster\s*box/i,
  /fotl\s*box/i,
  /fast\s*break\s*box/i,
  /mega\s*box/i,
  /cello\s*box/i,
  /hanger\s*box/i,
  /pack\s*odds/i,
  /variations?\s*guide/i,
  /error\s*cards?/i,
  /short\s*prints?\s*guide/i,
  /autographs?\s*\/?\s*relics?/i,
  /autograph\s*sets?$/i,
  /base\s*parallels?(\s*breakdown)?$/i,
  /base\s*set\s*subsets?/i,
  /key\s*numbered\s*card/i,
  /multi-?pack\s*break/i,
  /cello.*break/i,
  /numbered\s*card\s*notes/i,
  /product\s*breakdown/i,
  /parallel\s*(breakdown|overview|guide)/i,
  /insert\s*(breakdown|overview|guide|checklist)/i,
];

/** Single words that are parallel colors/finishes, not insert set names */
const PARALLEL_NOT_INSERT = new Set([
  'green', 'pink', 'blue', 'red', 'gold', 'silver', 'purple', 'orange',
  'black', 'white', 'yellow', 'teal', 'bronze', 'neon', 'ice', 'disco',
  'shimmer', 'wave', 'holo', 'scope', 'mojo',
]);

function isJunkInsertName(name) {
  if (JUNK_INSERT_PATTERNS.some(pat => pat.test(name))) return true;
  // Single-word color names are parallels, not inserts
  const trimmed = name.trim().toLowerCase();
  if (PARALLEL_NOT_INSERT.has(trimmed)) return true;
  return false;
}
const CHECKLIST_DIR = resolve(ROOT, 'data', 'checklists');

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Compute a simple word-overlap similarity score between two strings.
 * Returns a value between 0 and 1.
 */
function nameSimilarity(a, b) {
  const wordsA = a.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
  const wordsB = b.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
  if (wordsA.length === 0 || wordsB.length === 0) return 0;
  const setB = new Set(wordsB);
  const matches = wordsA.filter(w => setB.has(w)).length;
  return matches / Math.max(wordsA.length, wordsB.length);
}

/**
 * Assign rarity_rank values to an array of parallels based on print run.
 * 1/1 = rank 1 (rarest), lower print run = lower rank, unnumbered = highest rank.
 */
function assignRarityRanks(parallels) {
  // Sort by rarity: 1/1 first, then by print run ascending, unnumbered last
  const indexed = parallels.map((p, i) => ({ ...p, _origIdx: i }));

  indexed.sort((a, b) => {
    // 1/1 always first
    if (a.isOneOfOne && !b.isOneOfOne) return -1;
    if (!a.isOneOfOne && b.isOneOfOne) return 1;
    if (a.isOneOfOne && b.isOneOfOne) return 0;

    // Both have print runs
    if (a.printRun != null && b.printRun != null) return a.printRun - b.printRun;

    // Has print run beats unnumbered
    if (a.printRun != null && b.printRun == null) return -1;
    if (a.printRun == null && b.printRun != null) return 1;

    return 0;
  });

  // Assign ranks 1..N
  const ranks = new Array(parallels.length);
  indexed.forEach((p, sortedIdx) => {
    ranks[p._origIdx] = sortedIdx + 1;
  });

  return ranks;
}

/**
 * Read all JSON files from a sport directory.
 */
function readChecklistFiles(sport) {
  const dir = join(CHECKLIST_DIR, sport);
  if (!existsSync(dir)) return [];

  return readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      try {
        const data = JSON.parse(readFileSync(join(dir, f), 'utf-8'));
        return { file: f, data };
      } catch (e) {
        console.warn(`  WARNING: Could not parse ${f}: ${e.message}`);
        return null;
      }
    })
    .filter(Boolean);
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🔧 Insert Data Loader${dryRun ? ' (DRY RUN)' : ''}\n`);

  const sportsToProcess = sportFilter ? [sportFilter] : SPORTS;

  // Summary counters
  let totalFiles = 0;
  let productsMatched = 0;
  let cardSetsCreated = 0;
  let parallelsCreated = 0;
  let noInsertData = 0;
  let noProductMatch = 0;

  for (const sport of sportsToProcess) {
    const files = readChecklistFiles(sport);
    if (files.length === 0) {
      console.log(`  ${sport.toUpperCase()}: no checklist files found`);
      continue;
    }

    console.log(`── ${sport.toUpperCase()} (${files.length} files) ──`);

    for (const { file, data } of files) {
      totalFiles++;

      // Skip files without inserts
      if (!data.inserts || !Array.isArray(data.inserts) || data.inserts.length === 0) {
        noInsertData++;
        console.log(`  ${file}: no insert data, skipping`);
        continue;
      }

      // Determine year and sport from JSON (fall back to directory sport)
      const jsonYear = data.year;
      const jsonSport = (data.sport || sport).toUpperCase();

      if (!jsonYear) {
        console.warn(`  ${file}: no year field, skipping`);
        continue;
      }

      // Look up product in Supabase
      const { data: products, error: prodErr } = await supabase
        .from('products')
        .select('id, name, year, sport')
        .eq('year', jsonYear)
        .eq('sport', jsonSport);

      if (prodErr) {
        console.error(`  ${file}: product query error: ${prodErr.message}`);
        continue;
      }

      if (!products || products.length === 0) {
        noProductMatch++;
        console.log(`  ${file}: no products found for year=${jsonYear} sport=${jsonSport}`);
        continue;
      }

      // Score by name similarity — strip review/checklist suffixes from search name
      let searchName = [data.brand, data.product].filter(Boolean).join(' ');
      searchName = searchName
        .replace(/\s*(set\s+)?review\s+and\s+checklist\s*$/i, '')
        .replace(/\s*checklist\s+and\s+review\s*$/i, '')
        .replace(/\s*trading\s+card\s+(box\s+)?set\s*$/i, '')
        .replace(/\s*nba\s+trading\s+card\s*$/i, '')
        .replace(/\s*cards?\s*$/i, '')
        .trim();
      const scored = products.map(p => ({
        ...p,
        score: nameSimilarity(searchName, p.name),
      }));
      scored.sort((a, b) => b.score - a.score);
      const bestMatch = scored[0];

      if (bestMatch.score < 0.2) {
        noProductMatch++;
        console.log(`  ${file}: no good product match for "${searchName}" (best: "${bestMatch.name}" score=${bestMatch.score.toFixed(2)})`);
        continue;
      }

      productsMatched++;
      console.log(`  ${file} → ${bestMatch.name} (${bestMatch.year}) [score=${bestMatch.score.toFixed(2)}]`);

      // Process each insert
      for (const insert of data.inserts) {
        const insertName = insert.name;
        if (!insertName) continue;

        // Filter out junk scraped from review/analysis sections
        if (isJunkInsertName(insertName)) {
          if (dryRun) console.log(`    [SKIP JUNK] "${insertName}"`);
          continue;
        }

        // Build card_set row
        const cardSetRow = {
          product_id: bestMatch.id,
          name: insertName,
          type: 'insert',
          is_autographed: false,
          is_memorabilia: false,
          box_exclusivity: insert.exclusivity ? [insert.exclusivity] : [],
          odds: insert.odds || null,
        };

        if (dryRun) {
          console.log(`    [DRY RUN] Would upsert card_set: "${insertName}"`);
        } else {
          // Upsert card_set
          const { data: upserted, error: csErr } = await supabase
            .from('card_sets')
            .upsert(cardSetRow, { onConflict: 'product_id,name', ignoreDuplicates: false })
            .select('id');

          if (csErr) {
            console.error(`    ERROR upserting card_set "${insertName}": ${csErr.message}`);
            continue;
          }

          const cardSetId = upserted?.[0]?.id;
          if (!cardSetId) {
            console.error(`    ERROR: no card_set id returned for "${insertName}"`);
            continue;
          }

          cardSetsCreated++;

          // Process insert parallels
          if (insert.parallels && insert.parallels.length > 0) {
            const ranks = assignRarityRanks(insert.parallels);

            // Delete existing parallels for this card_set to avoid duplicates
            await supabase
              .from('parallels')
              .delete()
              .eq('card_set_id', cardSetId);

            const parallelRows = insert.parallels.map((p, i) => ({
              card_set_id: cardSetId,
              name: p.name || 'Base',
              print_run: p.printRun ?? null,
              serial_numbered: p.serialNumbered ?? false,
              is_one_of_one: p.isOneOfOne ?? false,
              rarity_rank: ranks[i],
              box_exclusivity: p.exclusivity ? [p.exclusivity] : [],
              description: null,
              color_hex: null,
            }));

            const { error: parErr } = await supabase
              .from('parallels')
              .insert(parallelRows);

            if (parErr) {
              console.error(`    ERROR inserting parallels for "${insertName}": ${parErr.message}`);
            } else {
              parallelsCreated += parallelRows.length;
              console.log(`    ${insertName}: ${parallelRows.length} parallels`);
            }
          } else {
            console.log(`    ${insertName}: no parallels`);
          }
        }

        // Dry run parallel summary
        if (dryRun && insert.parallels) {
          const ranks = assignRarityRanks(insert.parallels);
          for (let i = 0; i < insert.parallels.length; i++) {
            const p = insert.parallels[i];
            const pr = p.isOneOfOne ? '1/1' : p.printRun ? `/${p.printRun}` : 'unnumbered';
            console.log(`      [DRY RUN] rank ${ranks[i]}: ${p.name} (${pr})`);
          }
          cardSetsCreated++;
          parallelsCreated += insert.parallels.length;
        }
      }
    }

    console.log('');
  }

  // ── Summary ─────────────────────────────────────────────────────────────────

  console.log('═══════════════════════════════════════════');
  console.log(`  Files processed:       ${totalFiles}`);
  console.log(`  Products matched:      ${productsMatched}`);
  console.log(`  Card sets created:     ${cardSetsCreated}`);
  console.log(`  Parallels created:     ${parallelsCreated}`);
  console.log(`  Files with no inserts: ${noInsertData}`);
  console.log(`  No product match:      ${noProductMatch}`);
  if (dryRun) console.log('  (DRY RUN — nothing written to DB)');
  console.log('═══════════════════════════════════════════\n');
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
