#!/usr/bin/env node

/**
 * Seed complete 2024 Topps F1 parallel data.
 *
 * Usage:
 *   node scripts/seed-topps-f1-2024.mjs
 *   node scripts/seed-topps-f1-2024.mjs --dry-run
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

const PRODUCT_ID = 'c0000000-0000-0000-0000-000000000036'; // 2024 Topps F1

const HOBBY = 'Hobby';
const BLASTER = 'Blaster';
const MEGA = 'Mega Box';
const HANGER = 'Hanger';
const ALL = 'All';

const parallels = [
  { name: 'Base', color_hex: '#FFFFFF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1, box_exclusivity: [ALL], description: 'Standard base card; 200-card set' },
  { name: 'Rainbow Foil', color_hex: '#C4C4C4', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 2, box_exclusivity: [ALL], description: 'Rainbow foil finish' },
  { name: 'Checkered Flag', color_hex: '#1C1C1C', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 3, box_exclusivity: [ALL], description: 'Checkered flag pattern' },
  { name: 'Blue', color_hex: '#1E90FF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 4, box_exclusivity: [BLASTER], description: 'Blue finish; Blaster exclusive' },
  { name: 'Green', color_hex: '#228B22', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 5, box_exclusivity: [MEGA], description: 'Green finish; Mega exclusive' },
  { name: 'Red', color_hex: '#DC143C', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 6, box_exclusivity: [HANGER], description: 'Red finish; Hanger exclusive' },
  { name: 'Gold', color_hex: '#FFD700', print_run: 2024, serial_numbered: true, is_one_of_one: false, rarity_rank: 7, box_exclusivity: [ALL], description: 'Gold border /2024' },
  { name: 'Yellow', color_hex: '#FFC125', print_run: 399, serial_numbered: true, is_one_of_one: false, rarity_rank: 8, box_exclusivity: [HOBBY], description: 'Yellow /399; Hobby' },
  { name: 'Purple', color_hex: '#9370DB', print_run: 250, serial_numbered: true, is_one_of_one: false, rarity_rank: 9, box_exclusivity: [HOBBY], description: 'Purple /250; Hobby' },
  { name: 'Blue Foil', color_hex: '#4169E1', print_run: 150, serial_numbered: true, is_one_of_one: false, rarity_rank: 10, box_exclusivity: [HOBBY], description: 'Blue foil /150; Hobby' },
  { name: 'Green Foil', color_hex: '#228B22', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 11, box_exclusivity: [HOBBY], description: 'Green foil /99; Hobby' },
  { name: 'Black', color_hex: '#1C1C1C', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 12, box_exclusivity: [HOBBY], description: 'Black border /75; Hobby' },
  { name: 'Gold Foil', color_hex: '#DAA520', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 13, box_exclusivity: [HOBBY], description: 'Gold foil /50; Hobby' },
  { name: 'Orange', color_hex: '#FF8C00', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 14, box_exclusivity: [HOBBY], description: 'Orange /25; Hobby' },
  { name: 'Clear', color_hex: '#E0F7FA', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 15, box_exclusivity: [HOBBY], description: 'Clear acetate /10; Hobby' },
  { name: 'Red Foil', color_hex: '#DC143C', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 16, box_exclusivity: [HOBBY], description: 'Red foil /5; Hobby' },
  { name: 'FoilFractor', color_hex: '#C0C0C0', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 17, box_exclusivity: [HOBBY], description: 'Full foilfractor — true 1/1' },
  { name: 'Printing Plate Cyan', color_hex: '#00FFFF', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 18, box_exclusivity: [ALL], description: 'Cyan printing plate — 1/1' },
  { name: 'Printing Plate Magenta', color_hex: '#FF00FF', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 19, box_exclusivity: [ALL], description: 'Magenta printing plate — 1/1' },
  { name: 'Printing Plate Yellow', color_hex: '#FFFF00', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 20, box_exclusivity: [ALL], description: 'Yellow printing plate — 1/1' },
  { name: 'Printing Plate Black', color_hex: '#000000', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 21, box_exclusivity: [ALL], description: 'Black printing plate — 1/1' },
];

async function main() {
  console.log(`Seeding 2024 Topps F1 Parallels: ${parallels.length} parallels\n`);
  if (DRY_RUN) { parallels.forEach(p => console.log(`  ${p.name}`)); return; }
  const { error: delErr } = await supabase.from('parallels').delete().eq('product_id', PRODUCT_ID);
  if (delErr) { console.error('Delete error:', delErr.message); return; }
  const rows = parallels.map(p => ({ product_id: PRODUCT_ID, ...p }));
  const { error } = await supabase.from('parallels').insert(rows);
  if (error) console.error('Insert error:', error.message);
  else console.log(`Inserted ${rows.length}/${parallels.length} parallels`);
  const { count } = await supabase.from('parallels').select('*', { count: 'exact', head: true }).eq('product_id', PRODUCT_ID);
  console.log(`Verified: ${count} parallels in DB for 2024 Topps F1`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
