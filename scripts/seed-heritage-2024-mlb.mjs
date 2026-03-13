#!/usr/bin/env node

/**
 * Seed 2024 Topps Heritage Baseball parallel data.
 * Sources: Cardboard Connection, Beckett, BaseballCardPedia, Checklist Insider.
 *
 * Usage:
 *   node scripts/seed-heritage-2024-mlb.mjs
 *   node scripts/seed-heritage-2024-mlb.mjs --dry-run
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

const PRODUCT_ID = 'c0000000-0000-0000-0000-000000000016'; // 2024 Heritage MLB

const HOBBY = 'Hobby';
const HOBBY_GIANT = 'Hobby Giant Box';
const WALMART_MONSTER = 'Walmart Monster Box';
const HOT_BOX = 'Hobby Hot Box';
const ALL = 'All';

const parallels = [
  { name: 'Base', color_hex: '#FFFFFF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1, box_exclusivity: [ALL], description: 'Standard base with 1975 Topps design' },
  { name: 'White Border', color_hex: '#F5F5F5', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 2, box_exclusivity: [ALL], description: 'White border variant, ~950 copies est.' },
  { name: 'Red Border', color_hex: '#FF0000', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 3, box_exclusivity: [HOBBY_GIANT], description: 'Red border, Hobby Giant Box exclusive, ~210 copies est.' },
  { name: 'Chrome', color_hex: '#C0C0C0', print_run: 999, serial_numbered: true, is_one_of_one: false, rarity_rank: 4, box_exclusivity: [ALL], description: 'Chrome base parallel /999' },
  { name: 'Chrome Refractor', color_hex: '#D4D4D4', print_run: 575, serial_numbered: true, is_one_of_one: false, rarity_rank: 5, box_exclusivity: [ALL], description: 'Chrome refractor /575' },
  { name: 'Chrome Silver Refractor', color_hex: '#AAA9AD', print_run: 375, serial_numbered: true, is_one_of_one: false, rarity_rank: 6, box_exclusivity: [ALL], description: 'Chrome silver refractor /375' },
  { name: 'Chrome Blue Sparkle Refractor', color_hex: '#4A90D9', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 7, box_exclusivity: [WALMART_MONSTER], description: 'Blue sparkle chrome, Walmart exclusive, ~250 copies est.' },
  { name: 'Chrome Purple Refractor', color_hex: '#800080', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 8, box_exclusivity: [HOT_BOX], description: 'Purple chrome, Hot Box exclusive' },
  { name: 'Black and White Image', color_hex: '#808080', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 9, box_exclusivity: [ALL], description: 'B&W photo variant, ~75 copies est.' },
  { name: 'Chrome Black Refractor', color_hex: '#1A1A1A', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 10, box_exclusivity: [ALL], description: 'Chrome black refractor /75' },
  { name: 'Black Border', color_hex: '#000000', print_run: 50, serial_numbered: false, is_one_of_one: false, rarity_rank: 11, box_exclusivity: [HOBBY], description: 'Black border paper, ~50 copies, hobby exclusive' },
  { name: 'Flip Stock', color_hex: '#E8DCC8', print_run: 5, serial_numbered: false, is_one_of_one: false, rarity_rank: 12, box_exclusivity: [HOBBY], description: 'Thick flip stock cardboard, ~5 copies, hobby exclusive' },
  { name: 'Chrome Gold Refractor', color_hex: '#FFD700', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 13, box_exclusivity: [HOBBY], description: 'Chrome gold refractor /5, hobby exclusive' },
  { name: 'Chrome SuperFractor', color_hex: '#FFE135', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 14, box_exclusivity: [ALL], description: 'Chrome superfractor 1/1' },
];

async function main() {
  const total = parallels.length;
  console.log(`Seeding ${total} parallels for 2024 Topps Heritage MLB\n`);

  if (DRY_RUN) {
    console.log('DRY RUN — no changes made.');
    parallels.forEach((p, i) => console.log(`  ${i + 1}. ${p.name} ${p.print_run ? '/' + p.print_run : '(unnumbered)'}`));
    return;
  }

  const { error: delError } = await supabase.from('parallels').delete().eq('product_id', PRODUCT_ID);
  if (delError) console.warn('Delete warning:', delError.message);

  const BATCH_SIZE = 50;
  let inserted = 0;
  for (let i = 0; i < parallels.length; i += BATCH_SIZE) {
    const batch = parallels.slice(i, i + BATCH_SIZE).map(p => ({ product_id: PRODUCT_ID, ...p }));
    const { error } = await supabase.from('parallels').insert(batch);
    if (error) console.error(`Batch error at ${i}:`, error.message);
    else inserted += batch.length;
  }

  console.log(`Inserted ${inserted}/${total} parallels`);
  const { count } = await supabase.from('parallels').select('*', { count: 'exact', head: true }).eq('product_id', PRODUCT_ID);
  console.log(`Verified: ${count} parallels in DB for this product`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
