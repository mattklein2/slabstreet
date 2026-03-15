#!/usr/bin/env node

/**
 * Generate a seed script from a parsed checklist JSON file.
 *
 * Usage:
 *   node scripts/generate-seed.mjs data/checklists/nba/2024-25-panini-prizm.json
 *   node scripts/generate-seed.mjs data/checklists/nba/2024-25-panini-prizm.json --dry-run
 *
 * Output:
 *   scripts/seed-{product}-{year}-{sport}.generated.mjs
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ── Color dictionary ──────────────────────────────────────────────────────────
// Keyed on lowercase words found in the parallel name.
// Checked in order; first match wins.
const COLOR_DICT = [
  // Specific named colors / finishes first (longer/more specific first)
  { words: ['platinum'], hex: '#E5E4E2' },
  { words: ['printing plate black'], hex: '#000000' },
  { words: ['printing plate cyan'], hex: '#00FFFF' },
  { words: ['printing plate magenta'], hex: '#FF00FF' },
  { words: ['printing plate yellow'], hex: '#FFFF00' },
  { words: ['printing plate'], hex: '#888888' },
  { words: ['black gold'], hex: '#1A1A1A' },
  { words: ['neon green'], hex: '#39FF14' },
  { words: ['sky blue'], hex: '#87CEEB' },
  { words: ['ruby red', 'ruby'], hex: '#9B111E' },
  { words: ['teal'], hex: '#008080' },
  { words: ['fuchsia', 'magenta'], hex: '#FF00FF' },
  { words: ['aqua'], hex: '#00FFFF' },
  { words: ['lavender'], hex: '#E6E6FA' },
  { words: ['coral'], hex: '#FF6B6B' },
  { words: ['crimson'], hex: '#DC143C' },
  { words: ['scarlet'], hex: '#FF2400' },
  { words: ['maroon'], hex: '#800000' },
  { words: ['navy'], hex: '#001F5B' },
  { words: ['royal blue'], hex: '#4169E1' },
  { words: ['cobalt'], hex: '#0047AB' },
  { words: ['emerald'], hex: '#50C878' },
  { words: ['forest green'], hex: '#228B22' },
  { words: ['lime'], hex: '#BFFF00' },
  { words: ['bronze'], hex: '#CD7F32' },
  { words: ['copper'], hex: '#B87333' },
  { words: ['rose gold'], hex: '#B76E79' },
  { words: ['hyper'], hex: '#E8E8FF' },
  { words: ['pulsar'], hex: '#FFD700' },
  { words: ['mojo'], hex: '#FFD700' },
  { words: ['gold'], hex: '#FFD700' },
  { words: ['silver'], hex: '#C0C0C0' },
  { words: ['red'], hex: '#DC143C' },
  { words: ['blue'], hex: '#1E90FF' },
  { words: ['green'], hex: '#228B22' },
  { words: ['black'], hex: '#1A1A1A' },
  { words: ['pink'], hex: '#FF69B4' },
  { words: ['purple'], hex: '#800080' },
  { words: ['orange'], hex: '#FF8C00' },
  { words: ['white'], hex: '#F5F5F5' },
  { words: ['yellow'], hex: '#FFD700' },
  { words: ['brown'], hex: '#8B4513' },
  { words: ['cyan'], hex: '#00FFFF' },
];

/**
 * Resolve a color hex for a parallel name.
 * Returns null for 'Base', otherwise looks up via COLOR_DICT.
 */
function resolveColorHex(name) {
  const lower = name.toLowerCase();
  if (lower === 'base') return null;

  // Try multi-word phrases first (longer key = more specific)
  const sorted = [...COLOR_DICT].sort((a, b) => b.words[0].length - a.words[0].length);
  for (const entry of sorted) {
    for (const word of entry.words) {
      if (lower.includes(word)) return entry.hex;
    }
  }
  return null;
}

// ── Rarity rank assignment ────────────────────────────────────────────────────
// Each call returns the next rank in the appropriate range, tracking state
// via a counter object passed by reference.

function assignRarityRank(parallel, counters) {
  const { printRun, serialNumbered, isOneOfOne, exclusivity } = parallel;
  const name = (parallel.name || '').toLowerCase();

  // 1-of-1
  if (isOneOfOne || printRun === 1) {
    return counters.oneOfOne++;
  }

  // Numbered by print run
  if (serialNumbered && printRun !== null) {
    if (printRun >= 5 && printRun <= 9) return counters.numbered5to9++;
    if (printRun >= 10 && printRun <= 24) return counters.numbered10to24++;
    if (printRun >= 25 && printRun <= 49) return counters.numbered25to49++;
    if (printRun >= 50 && printRun <= 99) return counters.numbered50to99++;
    if (printRun >= 100 && printRun <= 298) return counters.numbered100to298++;
    if (printRun >= 299) return counters.numbered299plus++;
    // Fallback for any other numbered
    return counters.numbered299plus++;
  }

  // Unnumbered
  const isExclusive = exclusivity !== null && exclusivity !== undefined;
  if (isExclusive) return counters.unnumberedExclusive++;
  return counters.unnumberedBase++;
}

/**
 * Build initial counter state with correct starting values per range.
 */
function buildCounters() {
  return {
    unnumberedBase: 1,       // ranks 1-10
    unnumberedExclusive: 10, // ranks 10-20
    numbered299plus: 20,     // ranks 20-30
    numbered100to298: 30,    // ranks 30-40
    numbered50to99: 40,      // ranks 40-50
    numbered25to49: 50,      // ranks 50-60
    numbered10to24: 60,      // ranks 60-70
    numbered5to9: 70,        // ranks 70-75
    oneOfOne: 80,            // rank 80
  };
}

// ── Description generator ─────────────────────────────────────────────────────

function generateDescription(parallel, brand, productName) {
  const { name, printRun, serialNumbered, isOneOfOne, exclusivity } = parallel;

  if (name.toLowerCase() === 'base') {
    return 'Standard base card';
  }

  const parts = [];

  // Core description based on name
  const lower = name.toLowerCase();
  if (lower.includes('refractor')) {
    parts.push(`${name} refractor parallel`);
  } else if (lower.includes('prizm') || lower.includes('silver')) {
    parts.push(`${name} — shimmery refractor finish`);
  } else if (lower.includes('printing plate')) {
    parts.push(`${name} printing plate`);
  } else {
    parts.push(`${name} parallel`);
  }

  // Print run info
  if (isOneOfOne || printRun === 1) {
    parts.push('— 1 of 1');
  } else if (serialNumbered && printRun) {
    parts.push(`numbered to ${printRun}`);
  } else if (!serialNumbered) {
    parts.push('— unnumbered');
  }

  // Exclusivity
  if (exclusivity) {
    parts.push(`— ${exclusivity} exclusive`);
  }

  return parts.join(' ');
}

// ── Slug helpers ──────────────────────────────────────────────────────────────

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function buildOutputFilename(checklist) {
  const { brand, product, sport, year } = checklist;
  const productSlug = slugify(`${product}`);
  const yearSlug = slugify(year);
  const sportSlug = sport.toLowerCase();
  return `seed-${productSlug}-${yearSlug}-${sportSlug}.generated.mjs`;
}

// ── Product matrix lookup ─────────────────────────────────────────────────────

function lookupProductId(checklist) {
  const matrixPath = resolve(ROOT, 'data', 'product-matrix.json');
  if (!existsSync(matrixPath)) return null;

  let matrix;
  try {
    matrix = JSON.parse(readFileSync(matrixPath, 'utf-8'));
  } catch {
    return null;
  }

  const products = Array.isArray(matrix) ? matrix : matrix.products ?? [];

  const { brand, product, sport, year } = checklist;
  const match = products.find(p =>
    p.brand?.toLowerCase() === brand?.toLowerCase() &&
    p.name?.toLowerCase() === product?.toLowerCase() &&
    p.sport?.toLowerCase() === sport?.toLowerCase() &&
    p.year === year
  );

  return match?.existingProductId ?? null;
}

// ── Code generation ───────────────────────────────────────────────────────────

function escapeStr(s) {
  if (s === null || s === undefined) return 'null';
  return JSON.stringify(s);
}

function renderParallelLine(p) {
  const colorHex = p.color_hex === null ? 'null' : escapeStr(p.color_hex);
  const printRun = p.print_run === null ? 'null' : p.print_run;
  const exclusivity = JSON.stringify(p.box_exclusivity);

  return (
    `  { name: ${escapeStr(p.name)}, color_hex: ${colorHex}, ` +
    `print_run: ${printRun}, serial_numbered: ${p.serial_numbered}, ` +
    `is_one_of_one: ${p.is_one_of_one}, rarity_rank: ${p.rarity_rank}, ` +
    `box_exclusivity: ${exclusivity}, description: ${escapeStr(p.description)} },`
  );
}

function generateSeedScript(checklist, productId, isNewId) {
  const { brand, product, sport, year, parallels: rawParallels } = checklist;
  const label = `${year} ${brand} ${product} ${sport}`;

  const counters = buildCounters();

  // Sort parallels: unnumbered non-exclusive first, then unnumbered exclusive,
  // then numbered descending by print_run (most common first), then 1-of-1 last.
  const categoryOrder = p => {
    if (p.isOneOfOne || p.printRun === 1) return 4; // 1-of-1 last
    if (p.serialNumbered && p.printRun !== null) return 3; // numbered middle
    if (p.exclusivity !== null && p.exclusivity !== undefined) return 2; // unnumbered exclusive
    return 1; // unnumbered non-exclusive = most common
  };

  const sorted = [...rawParallels].sort((a, b) => {
    const catA = categoryOrder(a);
    const catB = categoryOrder(b);
    if (catA !== catB) return catA - catB;
    // Within numbered: sort descending by print_run (higher = more common = earlier)
    if (catA === 3) return b.printRun - a.printRun;
    return 0;
  });

  const processed = sorted.map(raw => {
    const colorHex = resolveColorHex(raw.name);
    const rarityRank = assignRarityRank(raw, counters);
    const description = generateDescription(raw, brand, product);
    const boxExclusivity = raw.exclusivity ? [raw.exclusivity] : ['All'];
    const isOneOfOne = raw.isOneOfOne || raw.printRun === 1;

    return {
      name: raw.name,
      color_hex: colorHex,
      print_run: raw.printRun ?? null,
      serial_numbered: raw.serialNumbered,
      is_one_of_one: isOneOfOne,
      rarity_rank: rarityRank,
      box_exclusivity: boxExclusivity,
      description,
    };
  });

  const idComment = isNewId
    ? `// ${label} — NEW (generated UUID, not yet in product matrix)`
    : `// ${label}`;

  const parallelLines = processed.map(renderParallelLine).join('\n');

  return `#!/usr/bin/env node

/**
 * Seed ${label} parallel data.
 * GENERATED — review before running
 *
 * Usage:
 *   node scripts/${buildOutputFilename(checklist)}
 *   node scripts/${buildOutputFilename(checklist)} --dry-run
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const envPath = resolve(ROOT, '.env.local');
const env = {};
if (existsSync(envPath)) {
  readFileSync(envPath, 'utf-8').split('\\n').forEach(line => {
    const m = line.match(/^([^#=][^=]*)=(.*)/);
    if (m) env[m[1].trim()] = m[2].trim();
  });
}

const DRY_RUN = process.argv.includes('--dry-run');
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const PRODUCT_ID = ${escapeStr(productId)}; ${idComment}

const parallels = [
${parallelLines}
];

async function main() {
  const total = parallels.length;
  console.log(\`Seeding \${total} parallels for ${label}\\n\`);

  if (DRY_RUN) {
    console.log('DRY RUN — no changes made.\\n');
    parallels.forEach((p, i) => console.log(\`  \${i + 1}. \${p.name} \${p.print_run ? '/' + p.print_run : '(unnumbered)'}\`));
    return;
  }

  const { error: delErr } = await supabase.from('parallels').delete().eq('product_id', PRODUCT_ID);
  if (delErr) console.warn('Delete warning:', delErr.message);

  const BATCH_SIZE = 50;
  let inserted = 0;
  for (let i = 0; i < parallels.length; i += BATCH_SIZE) {
    const batch = parallels.slice(i, i + BATCH_SIZE).map(p => ({ product_id: PRODUCT_ID, ...p }));
    const { error } = await supabase.from('parallels').insert(batch);
    if (error) console.error(\`Batch error at \${i}:\`, error.message);
    else inserted += batch.length;
  }

  console.log(\`Inserted \${inserted}/\${total} parallels\`);
  const { count } = await supabase.from('parallels').select('*', { count: 'exact', head: true }).eq('product_id', PRODUCT_ID);
  console.log(\`Verified: \${count} parallels in DB for this product\`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
`;
}

// ── Main ──────────────────────────────────────────────────────────────────────

function main() {
  const inputArg = process.argv[2];
  if (!inputArg) {
    console.error('Usage: node scripts/generate-seed.mjs <path-to-checklist.json>');
    process.exit(1);
  }

  const inputPath = resolve(ROOT, inputArg);
  if (!existsSync(inputPath)) {
    console.error(`File not found: ${inputPath}`);
    process.exit(1);
  }

  let checklist;
  try {
    checklist = JSON.parse(readFileSync(inputPath, 'utf-8'));
  } catch (err) {
    console.error('Failed to parse JSON:', err.message);
    process.exit(1);
  }

  // Validate required fields
  const required = ['brand', 'product', 'sport', 'year', 'parallels'];
  for (const field of required) {
    if (!checklist[field]) {
      console.error(`Missing required field in checklist JSON: "${field}"`);
      process.exit(1);
    }
  }

  if (!Array.isArray(checklist.parallels) || checklist.parallels.length === 0) {
    console.error('checklist.parallels must be a non-empty array');
    process.exit(1);
  }

  // Resolve product ID
  const existingId = lookupProductId(checklist);
  let productId;
  let isNewId;
  if (existingId) {
    productId = existingId;
    isNewId = false;
    console.log(`Found existing product ID: ${productId}`);
  } else {
    productId = crypto.randomUUID();
    isNewId = true;
    console.log(`No match in product matrix — generated new UUID: ${productId}`);
  }

  const outputFilename = buildOutputFilename(checklist);
  const outputPath = resolve(__dirname, outputFilename);

  const code = generateSeedScript(checklist, productId, isNewId);
  writeFileSync(outputPath, code, 'utf-8');

  console.log(`\nGenerated: scripts/${outputFilename}`);
  console.log(`Parallels: ${checklist.parallels.length}`);
  console.log('\nReview the generated file before running it.');
}

main();
