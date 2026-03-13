#!/usr/bin/env node

/**
 * Seed 2024 Score Football parallel data.
 * Sources: Beckett, Checklist Insider, ChecklistCenter.
 *
 * Usage:
 *   node scripts/seed-score-2024-nfl.mjs
 *   node scripts/seed-score-2024-nfl.mjs --dry-run
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

const PRODUCT_ID = 'c0000000-0000-0000-0000-000000000011'; // 2024 Score NFL

const HOBBY = 'Hobby';
const RETAIL_BLASTER = 'Retail Blaster';
const HOBBY_BLASTER = 'Hobby Blaster';
const ALL = 'All';

const parallels = [
  { name: 'Base', color_hex: '#FFFFFF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1, box_exclusivity: [ALL], description: 'Standard base card' },
  { name: 'Scorecard', color_hex: '#C0C0C0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 2, box_exclusivity: [ALL], description: 'Silver-toned scorecard texture' },
  { name: 'Green', color_hex: '#00A651', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 3, box_exclusivity: [RETAIL_BLASTER], description: 'Green border, 4 per retail blaster' },
  { name: 'Red', color_hex: '#ED1C24', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 4, box_exclusivity: [ALL], description: 'Red border' },
  { name: 'Orange', color_hex: '#FF6600', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 5, box_exclusivity: [ALL], description: 'Orange border' },
  { name: 'Purple', color_hex: '#6B3FA0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 6, box_exclusivity: [ALL], description: 'Purple border' },
  { name: 'Gold', color_hex: '#FFD700', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 7, box_exclusivity: [ALL], description: 'Gold border' },
  { name: 'Extraterrestrial', color_hex: '#39FF14', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 8, box_exclusivity: [HOBBY_BLASTER], description: 'Neon green alien theme, Hobby Blaster exclusive' },
  { name: 'Lava', color_hex: '#CF1020', print_run: 630, serial_numbered: true, is_one_of_one: false, rarity_rank: 9, box_exclusivity: [ALL], description: 'Lava flow pattern /630' },
  { name: 'Stars', color_hex: '#1C1C6B', print_run: 399, serial_numbered: true, is_one_of_one: false, rarity_rank: 10, box_exclusivity: [ALL], description: 'Dark blue star-field /399' },
  { name: 'Ellipse', color_hex: '#4169E1', print_run: 299, serial_numbered: true, is_one_of_one: false, rarity_rank: 11, box_exclusivity: [ALL], description: 'Blue elliptical pattern /299' },
  { name: 'Dots Gold', color_hex: '#DAA520', print_run: 240, serial_numbered: true, is_one_of_one: false, rarity_rank: 12, box_exclusivity: [ALL], description: 'Gold dot pattern /240' },
  { name: 'Spokes', color_hex: '#708090', print_run: 180, serial_numbered: true, is_one_of_one: false, rarity_rank: 13, box_exclusivity: [ALL], description: 'Geometric spoke pattern /180' },
  { name: 'Circular', color_hex: '#4682B4', print_run: 135, serial_numbered: true, is_one_of_one: false, rarity_rank: 14, box_exclusivity: [ALL], description: 'Circular ring pattern /135' },
  { name: 'Cubic', color_hex: '#2F4F4F', print_run: 120, serial_numbered: true, is_one_of_one: false, rarity_rank: 15, box_exclusivity: [ALL], description: 'Cubic geometric pattern /120' },
  { name: 'Showcase', color_hex: '#E5E4E2', print_run: 100, serial_numbered: true, is_one_of_one: false, rarity_rank: 16, box_exclusivity: [HOBBY], description: 'Premium showcase finish /100' },
  { name: 'Electric', color_hex: '#7DF9FF', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 17, box_exclusivity: [ALL], description: 'Electric blue lightning /99' },
  { name: 'Gold Zone', color_hex: '#FFD700', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 18, box_exclusivity: [HOBBY], description: 'Gold Zone premium /50' },
  { name: "Artist's Proof", color_hex: '#8B4513', print_run: 35, serial_numbered: true, is_one_of_one: false, rarity_rank: 19, box_exclusivity: [HOBBY], description: "Artist's proof finish /35" },
  { name: 'Red Zone', color_hex: '#B22222', print_run: 20, serial_numbered: true, is_one_of_one: false, rarity_rank: 20, box_exclusivity: [HOBBY], description: 'Deep red premium /20' },
  { name: 'Die-Cut', color_hex: '#C0C0C0', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 21, box_exclusivity: [HOBBY], description: 'Die-cut shaped border /10' },
  { name: 'Dots Red', color_hex: '#DC143C', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 22, box_exclusivity: [HOBBY], description: 'Red dot pattern /10' },
  { name: 'First Down', color_hex: '#228B22', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 23, box_exclusivity: [HOBBY], description: 'Green first-down marker themed /10' },
  { name: 'End Zone', color_hex: '#FF4500', print_run: 6, serial_numbered: true, is_one_of_one: false, rarity_rank: 24, box_exclusivity: [HOBBY], description: 'Ultra-rare end zone /6' },
  { name: 'Gem Masters', color_hex: '#E0115F', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 25, box_exclusivity: [HOBBY], description: 'Gem-finished 1/1' },
  { name: 'Printing Plates Black', color_hex: '#000000', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 26, box_exclusivity: [HOBBY], description: 'Black printing plate 1/1' },
  { name: 'Printing Plates Cyan', color_hex: '#00FFFF', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 27, box_exclusivity: [HOBBY], description: 'Cyan printing plate 1/1' },
  { name: 'Printing Plates Magenta', color_hex: '#FF00FF', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 28, box_exclusivity: [HOBBY], description: 'Magenta printing plate 1/1' },
  { name: 'Printing Plates Yellow', color_hex: '#FFFF00', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 29, box_exclusivity: [HOBBY], description: 'Yellow printing plate 1/1' },
];

async function main() {
  const total = parallels.length;
  console.log(`Seeding ${total} parallels for 2024 Score NFL\n`);

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
