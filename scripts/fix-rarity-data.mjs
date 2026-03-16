#!/usr/bin/env node
/**
 * fix-rarity-data.mjs
 *
 * Scan all scraped Cardboard Connection HTML files, extract the canonical
 * parallel lists (with print runs), match to DB products, and update
 * print_run, serial_numbered, is_one_of_one, and rarity_rank for every parallel.
 *
 * Usage:
 *   node scripts/fix-rarity-data.mjs              # dry-run (default)
 *   node scripts/fix-rarity-data.mjs --apply       # actually write to DB
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, basename } from 'path';
import { createClient } from '@supabase/supabase-js';

const DRY_RUN = !process.argv.includes('--apply');
if (DRY_RUN) console.log('=== DRY RUN (pass --apply to write to DB) ===\n');

// ── Supabase client ──────────────────────────────────────────
const envFile = readFileSync('.env.local', 'utf8');
const getEnv = (k) => envFile.match(new RegExp(`^${k}=(.*)$`, 'm'))?.[1]?.trim();
const supabase = createClient(getEnv('NEXT_PUBLIC_SUPABASE_URL'), getEnv('SUPABASE_SERVICE_ROLE_KEY'));

// ── Step 1: Parse all HTML files for parallel data ──────────
const SPORTS = ['nba', 'nfl', 'mlb', 'f1', 'wnba'];
const BASE_DIR = 'data/checklists';

function decodeHtmlEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—');
}

function stripSuffix(name) {
  // Remove trailing " Prizms", " Prizm", " Refractors", etc.
  return name
    .replace(/\s+(Prizms?|Refractors?|Xfractors?|Parallels?)$/i, '')
    .trim();
}

function parseParallelsFromHtml(html) {
  // Find all checklistdesc divs
  const descRegex = /<div class="checklistdesc">(.*?)<\/div>/gs;
  let match;
  const results = [];

  while ((match = descRegex.exec(html)) !== null) {
    const raw = match[1].replace(/<[^>]+>/g, '').trim();
    // Match sections with parallel data: "PRIZMS PARALLELS:", "NO HUDDLE PRIZMS:", "CHOICE PRIZMS:", etc.
    if (!/PRIZMS?\s*PARALLELS?:/i.test(raw) && !/PARALLEL.*BREAKDOWN/i.test(raw) &&
        !/NO HUDDLE PRIZMS?:/i.test(raw) && !/CHOICE PRIZMS?:/i.test(raw) &&
        !/FAST BREAK PRIZMS?:/i.test(raw) && !/RETAIL.* PRIZMS?:/i.test(raw) &&
        !/PREMIUM.*PRIZMS?:/i.test(raw) && !/FOTL.*PRIZMS?:/i.test(raw)) continue;

    // Extract content after the label (e.g., "PARALLELS:", "NO HUDDLE PRIZMS:", etc.)
    const afterColon = raw.replace(/^.*?(?:PARALLELS?|PRIZMS?):\s*/i, '');

    // Some entries have period-separated sub-sections like "NO HUDDLE PRIZMS: ..."
    // Split on comma
    const items = afterColon.split(/,\s*/).map(s => s.trim()).filter(Boolean);

    const parallels = [];
    for (const item of items) {
      // Stop if we hit a clearly non-parallel section header
      if (/^(RETAIL|HOBBY|BLASTER|MEGA|HANGER|CELLO|FAT|VALUE|MULTI|TARGET|WALMART|RELEASE|CONFIGURATION|BOX BREAK)/i.test(item)) break;

      const decoded = decodeHtmlEntities(item);
      const oneOfOne = /\b1\/1\b/.test(decoded);
      const printRunMatch = decoded.match(/#\/\s*(\d+)/);
      const printRun = oneOfOne ? 1 : printRunMatch ? parseInt(printRunMatch[1]) : null;

      let name = decoded
        .replace(/\s*#\/\s*\d+\s*/g, '')
        .replace(/\s*1\/1\s*/g, '')
        .replace(/\s*-\s*$/, '')
        .replace(/\s*\(.*?\)\s*/g, ' ')
        .replace(/\.\s*$/, '')
        .trim();

      // Strip "Prizms" suffix
      name = stripSuffix(name);
      if (!name || name.length < 2) continue;

      parallels.push({
        name,
        printRun,
        serialNumbered: printRun !== null,
        isOneOfOne: oneOfOne,
      });
    }

    if (parallels.length >= 3) {
      results.push(parallels);
    }
  }

  // Also parse the bullet-list format used in some pages
  // e.g. <li><strong>Snakeskin Prizms</strong></li> and <li><strong>Gold Prizms</strong> - #/10</li>
  const listRegex = /<h[23][^>]*>.*?Base.*?Parallel.*?Breakdown.*?<\/h[23]>\s*([\s\S]*?)(?=<h[23]|<\/div>)/gi;
  let listMatch;
  while ((listMatch = listRegex.exec(html)) !== null) {
    const section = listMatch[1];
    const liRegex = /<li>\s*<strong>(.*?)<\/strong>\s*(.*?)\s*<\/li>/gi;
    let li;
    const parallels = [];
    while ((li = liRegex.exec(section)) !== null) {
      const rawName = li[1].replace(/<[^>]+>/g, '').trim();
      const extra = li[2].replace(/<[^>]+>/g, '').trim();
      const decoded = decodeHtmlEntities(rawName);
      const fullText = `${decoded} ${extra}`;

      const oneOfOne = /\b1\/1\b/.test(fullText);
      const printRunMatch = fullText.match(/#\/\s*(\d+)/);
      const printRun = oneOfOne ? 1 : printRunMatch ? parseInt(printRunMatch[1]) : null;

      let name = stripSuffix(decoded);
      if (!name || name.length < 2) continue;

      parallels.push({
        name,
        printRun,
        serialNumbered: printRun !== null,
        isOneOfOne: oneOfOne,
      });
    }
    if (parallels.length >= 3) {
      results.push(parallels);
    }
  }

  return results;
}

function extractProductInfo(jsonPath) {
  try {
    const data = JSON.parse(readFileSync(jsonPath, 'utf8'));
    return {
      brand: data.brand || null,
      product: data.product || null,
      sport: data.sport || null,
      year: data.year || null,
    };
  } catch { return null; }
}

// ── Step 2: Collect all scraped parallel data ───────────────
console.log('Scanning scraped HTML files...');
const scrapedProducts = [];

for (const sport of SPORTS) {
  const dir = join(BASE_DIR, sport);
  if (!existsSync(dir)) continue;
  const htmlFiles = readdirSync(dir).filter(f => f.endsWith('.html'));

  for (const htmlFile of htmlFiles) {
    const htmlPath = join(dir, htmlFile);
    const jsonPath = htmlPath.replace('.html', '.json');

    const html = readFileSync(htmlPath, 'utf8');
    const parallelSections = parseParallelsFromHtml(html);
    if (parallelSections.length === 0) continue;

    const info = existsSync(jsonPath) ? extractProductInfo(jsonPath) : null;

    // Combine ALL parallel sections into one deduplicated list
    // (maintains order: first section first, subsequent sections appended)
    const seen = new Set();
    const combined = [];
    for (const section of parallelSections) {
      for (const par of section) {
        const key = par.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (!seen.has(key)) {
          seen.add(key);
          combined.push(par);
        }
      }
    }

    scrapedProducts.push({
      file: htmlFile,
      sport,
      info,
      baseParallels: combined,
      allSections: parallelSections,
    });
  }
}

console.log(`Found ${scrapedProducts.length} products with parallel data across ${SPORTS.length} sports\n`);

// ── Helper: paginated fetch (Supabase default limit is 1000) ─
async function fetchAll(table, select, filters = {}) {
  const PAGE = 1000;
  const all = [];
  let offset = 0;
  while (true) {
    let q = supabase.from(table).select(select).range(offset, offset + PAGE - 1);
    for (const [col, val] of Object.entries(filters)) {
      q = q.eq(col, val);
    }
    const { data, error } = await q;
    if (error) throw new Error(`fetchAll ${table}: ${error.message}`);
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < PAGE) break;
    offset += PAGE;
  }
  return all;
}

// ── Step 3: Load all DB products + card_sets + parallels ────
console.log('Loading DB data...');
const dbProducts = await fetchAll('products', 'id, name, year, sport, brand_id, brands(name)');
const dbCardSets = await fetchAll('card_sets', 'id, name, type, product_id');
const dbParallels = await fetchAll('parallels', 'id, name, print_run, serial_numbered, is_one_of_one, rarity_rank, card_set_id');

console.log(`  DB: ${dbProducts.length} products, ${dbCardSets.length} card_sets, ${dbParallels.length} parallels\n`);

// Index card_sets by product_id
const setsByProduct = {};
for (const cs of dbCardSets) {
  if (!setsByProduct[cs.product_id]) setsByProduct[cs.product_id] = [];
  setsByProduct[cs.product_id].push(cs);
}

// Index parallels by card_set_id
const parallelsBySet = {};
for (const p of dbParallels) {
  if (!parallelsBySet[p.card_set_id]) parallelsBySet[p.card_set_id] = [];
  parallelsBySet[p.card_set_id].push(p);
}

// ── Step 4: Match scraped data to DB products ───────────────
console.log('Matching scraped products to DB...');

const SPORT_MAP = {
  nba: 'NBA', nfl: 'NFL', mlb: 'MLB', f1: 'F1', wnba: 'WNBA',
};

function normalizeForMatch(str) {
  return str.toLowerCase()
    .replace(/[!?.'"\-–—,]/g, '')
    .replace(/&amp;/g, '&')
    .replace(/\band\b/g, '&')    // "and" → "&"
    .replace(/[&\/]/g, ' ')       // "&" and "/" → space
    .replace(/\s+/g, ' ')
    .trim();
}

function matchScrapedToDb(scraped) {
  const info = scraped.info;
  if (!info?.year || !info?.product) return null;

  const sport = SPORT_MAP[scraped.sport];
  const yearStr = String(info.year);

  // Find DB products matching year + sport
  const candidates = dbProducts.filter(p =>
    String(p.year) === yearStr && p.sport === sport
  );
  if (candidates.length === 0) return null;

  // Score each candidate
  const productName = normalizeForMatch(info.product);
  let best = null;
  let bestScore = 0;

  for (const c of candidates) {
    const dbName = normalizeForMatch(c.name);
    let score = 0;

    if (dbName === productName) score = 10;
    else if (productName.includes(dbName)) score = 8;
    else if (dbName.includes(productName)) score = 8;
    else {
      const dbWords = dbName.split(/\s+/);
      const pWords = productName.split(/\s+/);
      const allMatch = dbWords.every(w => pWords.some(pw => pw.includes(w)));
      if (allMatch) score = 6;
    }

    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }

  return bestScore >= 6 ? best : null;
}

// ── Step 5: For each matched product, update parallels ──────
let totalUpdated = 0;
let totalSkipped = 0;
let totalNoMatch = 0;
const updates = []; // collect all updates

let matchedProductCount = 0;
for (const scraped of scrapedProducts) {
  const dbProduct = matchScrapedToDb(scraped);
  if (!dbProduct) {
    totalNoMatch++;
    continue;
  }
  matchedProductCount++;

  const productSets = setsByProduct[dbProduct.id] || [];
  if (productSets.length === 0) {
    if (DRY_RUN) console.log(`  DEBUG: ${dbProduct.year} ${dbProduct.name} ${dbProduct.sport} — no card_sets`);
    continue;
  }

  // Find the base set
  const baseSet = productSets.find(cs => cs.type === 'base' || cs.name === 'Base Set') || productSets[0];
  const dbPars = parallelsBySet[baseSet.id] || [];
  if (dbPars.length === 0) {
    if (DRY_RUN) console.log(`  DEBUG: ${dbProduct.year} ${dbProduct.name} ${dbProduct.sport} — base set "${baseSet.name}" (${baseSet.id}) has 0 parallels`);
    continue;
  }
  if (DRY_RUN && dbPars.length > 20) console.log(`  MATCH: ${dbProduct.year} ${dbProduct.name} ${dbProduct.sport} — ${dbPars.length} parallels, ${scraped.baseParallels.length} scraped`);

  const scrapedPars = scraped.baseParallels;

  // Match each DB parallel to a scraped parallel
  for (const dbPar of dbPars) {
    const dbNorm = normalizeForMatch(stripSuffix(dbPar.name));

    // Find best match in scraped data — STRICT matching required
    let bestMatch = null;
    let bestMatchScore = 0;

    for (let i = 0; i < scrapedPars.length; i++) {
      const sp = scrapedPars[i];
      const spNorm = normalizeForMatch(sp.name);

      let score = 0;
      if (dbNorm === spNorm) {
        score = 10; // exact match
      } else {
        // Bidirectional word match: ALL words in both must appear in the other
        const dbWords = dbNorm.split(/\s+/).filter(w => w.length > 1);
        const spWords = spNorm.split(/\s+/).filter(w => w.length > 1);
        const allDbInSp = dbWords.every(w => spWords.some(sw => sw === w));
        const allSpInDb = spWords.every(w => dbWords.some(dw => dw === w));
        if (allDbInSp && allSpInDb) score = 8; // bidirectional exact word match
      }

      if (score > bestMatchScore) {
        bestMatchScore = score;
        bestMatch = { ...sp, scrapedIndex: i };
      }
    }

    if (!bestMatch || bestMatchScore < 8) {
      totalSkipped++;
      continue;
    }

    // Calculate rarity_rank: 1/1s get lowest rank (rarest), unnumbered get highest
    // Convention: higher rank = MORE common. So reverse the scraped order.
    const totalInRainbow = scrapedPars.length;
    const newRarityRank = totalInRainbow - bestMatch.scrapedIndex;

    // Check if anything actually changed
    const changed =
      dbPar.print_run !== bestMatch.printRun ||
      dbPar.serial_numbered !== bestMatch.serialNumbered ||
      dbPar.is_one_of_one !== bestMatch.isOneOfOne ||
      dbPar.rarity_rank !== newRarityRank;

    if (!changed) {
      totalSkipped++;
      continue;
    }

    updates.push({
      id: dbPar.id,
      print_run: bestMatch.printRun,
      serial_numbered: bestMatch.serialNumbered,
      is_one_of_one: bestMatch.isOneOfOne,
      rarity_rank: newRarityRank,
      _debug: {
        product: `${dbProduct.year} ${dbProduct.name} ${dbProduct.sport}`,
        parallel: dbPar.name,
        matchedTo: bestMatch.name,
        matchScore: bestMatchScore,
        oldRank: dbPar.rarity_rank,
        newRank: newRarityRank,
        printRun: bestMatch.printRun,
      },
    });
    totalUpdated++;
  }
}

console.log(`\nResults:`);
console.log(`  Matched & updated: ${totalUpdated}`);
console.log(`  Skipped (no change or no match): ${totalSkipped}`);
console.log(`  Products not in DB: ${totalNoMatch}`);

// Show sample updates
console.log('\n--- Sample updates (first 30) ---');
for (const u of updates.slice(0, 30)) {
  const d = u._debug;
  console.log(`  ${d.product} | ${d.parallel} → matched "${d.matchedTo}" | rank ${d.oldRank}→${d.newRank} | run=${d.printRun}`);
}

// Show Prizm NFL updates specifically
const prizmUpdates = updates.filter(u => u._debug.product.includes('Prizm NFL'));
if (prizmUpdates.length > 0) {
  console.log(`\n--- Prizm NFL updates (${prizmUpdates.length}) ---`);
  for (const u of prizmUpdates) {
    const d = u._debug;
    console.log(`  ${d.product} | ${d.parallel} → "${d.matchedTo}" | rank ${d.oldRank}→${d.newRank} | run=${d.printRun} | serial=${u.serial_numbered} | 1/1=${u.is_one_of_one}`);
  }
}

// ── Step 6: Apply updates ───────────────────────────────────
if (!DRY_RUN && updates.length > 0) {
  console.log(`\nApplying ${updates.length} updates to DB...`);
  let applied = 0;
  let errors = 0;

  // Batch in groups of 50
  for (let i = 0; i < updates.length; i += 50) {
    const batch = updates.slice(i, i + 50);
    const promises = batch.map(u =>
      supabase
        .from('parallels')
        .update({
          print_run: u.print_run,
          serial_numbered: u.serial_numbered,
          is_one_of_one: u.is_one_of_one,
          rarity_rank: u.rarity_rank,
        })
        .eq('id', u.id)
    );

    const results = await Promise.all(promises);
    for (const r of results) {
      if (r.error) {
        errors++;
        if (errors <= 3) console.log('  Error:', r.error.message);
      } else {
        applied++;
      }
    }
  }

  console.log(`  Applied: ${applied}, Errors: ${errors}`);
} else if (DRY_RUN) {
  console.log('\n(Dry run — no changes written. Pass --apply to commit.)');
}
