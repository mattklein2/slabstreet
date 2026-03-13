#!/usr/bin/env node

/**
 * Insert new product rows for 2026 Topps Series 1, 2026 Heritage, and 2025 Bowman's Best.
 *
 * Usage:
 *   node scripts/seed-new-products-2025-2026.mjs
 *   node scripts/seed-new-products-2025-2026.mjs --dry-run
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
  readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
    const m = line.match(/^([^#=][^=]*)=(.*)/);
    if (m) env[m[1].trim()] = m[2].trim();
  });
}

const DRY_RUN = process.argv.includes('--dry-run');
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const TOPPS = 'b0000000-0000-0000-0000-000000000002';
const BOWMAN = 'b0000000-0000-0000-0000-000000000004';

const products = [
  {
    id: 'c0000000-0000-0000-0000-000000000030',
    brand_id: TOPPS,
    name: 'Topps Series 1',
    sport: 'MLB',
    year: '2026',
    description: 'The flagship Topps baseball product celebrating 75 years. Most accessible and widely collected baseball card set.',
    release_date: '2026-02-11',
    is_flagship: true,
    pros_cons: {
      pros: ['Most affordable flagship', 'Licensed MLB product', 'Huge checklist', 'Easy to find at retail', '75th anniversary special parallels'],
      cons: ['Base cards are common', 'Chrome versions preferred by investors', 'Low ceiling per box'],
    },
  },
  {
    id: 'c0000000-0000-0000-0000-000000000031',
    brand_id: TOPPS,
    name: 'Topps Heritage',
    sport: 'MLB',
    year: '2026',
    description: 'Retro-styled set paying tribute to the 1977 Topps design. Popular with vintage-style collectors.',
    release_date: '2026-03-18',
    is_flagship: false,
    pros_cons: {
      pros: ['Nostalgic 1977 design', 'Short print chase', 'Chrome refractor parallels', 'Variations add depth'],
      cons: ['Vintage style not for everyone', 'Lower hit count per box', 'SPs can be frustrating to complete'],
    },
  },
  {
    id: 'c0000000-0000-0000-0000-000000000032',
    brand_id: BOWMAN,
    name: "Bowman's Best",
    sport: 'MLB',
    year: '2025',
    description: 'Premium all-chrome prospect and rookie product. Known for on-card autographs and deep refractor rainbow.',
    release_date: '2026-03-11',
    is_flagship: false,
    pros_cons: {
      pros: ['All chrome cards', '4 on-card autos per hobby box', 'Deep refractor rainbow', 'Top prospect focus'],
      cons: ['Hobby only — no retail', 'Higher price point', 'Smaller base set'],
    },
  },
];

async function main() {
  console.log(`Inserting ${products.length} new products\n`);

  if (DRY_RUN) {
    console.log('DRY RUN — no changes made.\n');
    products.forEach(p => console.log(`  ${p.id.slice(-4)} ${p.sport} ${p.year} ${p.name}`));
    return;
  }

  for (const p of products) {
    const { error } = await supabase.from('products').upsert(p, { onConflict: 'id' });
    if (error) {
      console.error(`Error inserting ${p.name}:`, error.message);
    } else {
      console.log(`✓ ${p.sport} ${p.year} ${p.name} (${p.id.slice(-4)})`);
    }
  }

  const { count } = await supabase.from('products').select('*', { count: 'exact', head: true });
  console.log(`\nTotal products in DB: ${count}`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
