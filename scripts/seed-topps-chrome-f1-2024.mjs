#!/usr/bin/env node

/**
 * Seed complete 2024 Topps Chrome F1 parallel data.
 *
 * Usage:
 *   node scripts/seed-topps-chrome-f1-2024.mjs
 *   node scripts/seed-topps-chrome-f1-2024.mjs --dry-run
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

const PRODUCT_ID = 'c0000000-0000-0000-0000-000000000037'; // 2024 Topps Chrome F1

const HOBBY = 'Hobby';
const MEGA = 'Mega Box';
const ALL = 'All';

const parallels = [
  { name: 'Base', color_hex: '#FFFFFF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1, box_exclusivity: [ALL], description: 'Standard chrome base card' },
  { name: 'Refractor', color_hex: '#C0C0C0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 2, box_exclusivity: [ALL], description: 'Classic refractor finish' },
  { name: 'Wave Refractor', color_hex: '#4682B4', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 3, box_exclusivity: [HOBBY], description: 'Wave-pattern refractor; Hobby exclusive' },
  { name: 'Prism Refractor', color_hex: '#E8E8E8', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 4, box_exclusivity: [ALL], description: 'Prismatic refractor finish' },
  { name: 'Purple Refractor', color_hex: '#9370DB', print_run: 399, serial_numbered: true, is_one_of_one: false, rarity_rank: 5, box_exclusivity: [HOBBY], description: 'Purple refractor /399; Hobby' },
  { name: 'Aqua Refractor', color_hex: '#00CED1', print_run: 299, serial_numbered: true, is_one_of_one: false, rarity_rank: 6, box_exclusivity: [HOBBY], description: 'Aqua refractor /299; Hobby' },
  { name: 'Blue Refractor', color_hex: '#4169E1', print_run: 199, serial_numbered: true, is_one_of_one: false, rarity_rank: 7, box_exclusivity: [HOBBY], description: 'Blue refractor /199; Hobby' },
  { name: 'Green Refractor', color_hex: '#228B22', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 8, box_exclusivity: [HOBBY], description: 'Green refractor /99; Hobby' },
  { name: 'Yellow Refractor', color_hex: '#FFD700', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 9, box_exclusivity: [HOBBY], description: 'Yellow refractor /75; Hobby' },
  { name: 'Gold Refractor', color_hex: '#DAA520', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 10, box_exclusivity: [HOBBY], description: 'Gold refractor /50; Hobby' },
  { name: 'Orange Refractor', color_hex: '#FF8C00', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 11, box_exclusivity: [HOBBY], description: 'Orange refractor /25; Hobby' },
  { name: 'Black Refractor', color_hex: '#1A1A1A', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 12, box_exclusivity: [HOBBY], description: 'Black refractor /10; Hobby' },
  { name: 'Red Refractor', color_hex: '#DC143C', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 13, box_exclusivity: [HOBBY], description: 'Red refractor /5; Hobby' },
  { name: 'SuperFractor', color_hex: '#FFD700', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 14, box_exclusivity: [HOBBY], description: 'Gold SuperFractor — true 1/1' },
  { name: 'Printing Plate Cyan', color_hex: '#00FFFF', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 15, box_exclusivity: [ALL], description: 'Cyan printing plate — 1/1' },
  { name: 'Printing Plate Magenta', color_hex: '#FF00FF', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 16, box_exclusivity: [ALL], description: 'Magenta printing plate — 1/1' },
  { name: 'Printing Plate Yellow', color_hex: '#FFFF00', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 17, box_exclusivity: [ALL], description: 'Yellow printing plate — 1/1' },
  { name: 'Printing Plate Black', color_hex: '#000000', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 18, box_exclusivity: [ALL], description: 'Black printing plate — 1/1' },
];

async function main() {
  console.log(`Seeding 2024 Topps Chrome F1 Parallels: ${parallels.length} parallels\n`);
  if (DRY_RUN) { parallels.forEach(p => console.log(`  ${p.name}`)); return; }
  const { error: delErr } = await supabase.from('parallels').delete().eq('product_id', PRODUCT_ID);
  if (delErr) { console.error('Delete error:', delErr.message); return; }
  const rows = parallels.map(p => ({ product_id: PRODUCT_ID, ...p }));
  const { error } = await supabase.from('parallels').insert(rows);
  if (error) console.error('Insert error:', error.message);
  else console.log(`Inserted ${rows.length}/${parallels.length} parallels`);
  const { count } = await supabase.from('parallels').select('*', { count: 'exact', head: true }).eq('product_id', PRODUCT_ID);
  console.log(`Verified: ${count} parallels in DB for 2024 Topps Chrome F1`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
