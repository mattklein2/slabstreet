#!/usr/bin/env node
/**
 * 2024-25 Panini Select Premier League — base set parallels.
 * Three-tier base (Terrace, Mezzanine, Field Level). 250-card set.
 */
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const envPath = resolve(ROOT, '.env.local');
const env = {};
if (existsSync(envPath)) { readFileSync(envPath, 'utf-8').split('\n').forEach(line => { const m = line.match(/^([^#=][^=]*)=(.*)/); if (m) env[m[1].trim()] = m[2].trim(); }); }
const DRY_RUN = process.argv.includes('--dry-run');
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const PRODUCT_ID = 'd0000000-0000-0000-0000-000000000011';
const ALL = 'All';
const HOBBY = 'Hobby';
const RETAIL = 'Retail';

const parallels = [
  // ── Unnumbered ──
  { name: 'Base',           color_hex: '#FFFFFF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1,  box_exclusivity: [ALL],    description: 'Standard Select base' },
  { name: 'Blue',           color_hex: '#4169E1', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 2,  box_exclusivity: [ALL],    description: null },
  { name: 'Silver',         color_hex: '#C0C0C0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 3,  box_exclusivity: [ALL],    description: null },
  { name: 'Checkerboard',   color_hex: '#2C2C2C', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 4,  box_exclusivity: [ALL],    description: null },
  { name: 'Flash',          color_hex: '#E0E0FF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 5,  box_exclusivity: [ALL],    description: null },
  { name: 'Green Ice',      color_hex: '#00FA9A', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 6,  box_exclusivity: [ALL],    description: null },
  { name: 'Honeycomb',      color_hex: '#DAA520', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 7,  box_exclusivity: [ALL],    description: null },
  { name: 'Ice',            color_hex: '#B0E0E6', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 8,  box_exclusivity: [ALL],    description: null },
  { name: 'Multi-Color',    color_hex: '#FF69B4', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 9,  box_exclusivity: [ALL],    description: null },
  { name: 'Peacock',        color_hex: '#00CED1', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 10, box_exclusivity: [HOBBY],  description: null },
  { name: 'Pink Ice',       color_hex: '#FFB6C1', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 11, box_exclusivity: [RETAIL], description: null },
  { name: 'Pink Mojo',      color_hex: '#FF69B4', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 12, box_exclusivity: [ALL],    description: null },
  { name: 'Purple Mojo',    color_hex: '#9370DB', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 13, box_exclusivity: [HOBBY],  description: null },
  { name: 'Red',            color_hex: '#FF0000', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 14, box_exclusivity: [ALL],    description: null },
  { name: 'Red Ice',        color_hex: '#FF4444', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 15, box_exclusivity: [ALL],    description: null },
  { name: 'White Sparkle',  color_hex: '#F0F0F0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 16, box_exclusivity: [RETAIL], description: null },
  { name: 'Zebra',          color_hex: '#2C2C2C', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 17, box_exclusivity: [ALL],    description: 'SSP' },

  // ── Numbered ──
  { name: 'Orange Ice',           color_hex: '#FF8C00', print_run: 155, serial_numbered: true,  is_one_of_one: false, rarity_rank: 18, box_exclusivity: [ALL], description: null },
  { name: 'Camo',                 color_hex: '#556B2F', print_run: 150, serial_numbered: true,  is_one_of_one: false, rarity_rank: 19, box_exclusivity: [ALL], description: null },
  { name: 'Purple',               color_hex: '#9370DB', print_run: 140, serial_numbered: true,  is_one_of_one: false, rarity_rank: 20, box_exclusivity: [ALL], description: null },
  { name: 'Bronze Checker',       color_hex: '#CD7F32', print_run: 125, serial_numbered: true,  is_one_of_one: false, rarity_rank: 21, box_exclusivity: [ALL], description: null },
  { name: 'Green Fluorescent',    color_hex: '#39FF14', print_run: 125, serial_numbered: true,  is_one_of_one: false, rarity_rank: 22, box_exclusivity: [ALL], description: null },
  { name: 'Pink',                 color_hex: '#FF69B4', print_run: 99,  serial_numbered: true,  is_one_of_one: false, rarity_rank: 23, box_exclusivity: [ALL], description: null },
  { name: 'Red Wave',             color_hex: '#FF0000', print_run: 88,  serial_numbered: true,  is_one_of_one: false, rarity_rank: 24, box_exclusivity: [ALL], description: null },
  { name: 'White Ice',            color_hex: '#F0F0F0', print_run: 85,  serial_numbered: true,  is_one_of_one: false, rarity_rank: 25, box_exclusivity: [ALL], description: null },
  { name: 'Orange',               color_hex: '#FF8C00', print_run: 75,  serial_numbered: true,  is_one_of_one: false, rarity_rank: 26, box_exclusivity: [ALL], description: null },
  { name: 'Winter Camo',          color_hex: '#87CEEB', print_run: 49,  serial_numbered: true,  is_one_of_one: false, rarity_rank: 27, box_exclusivity: [ALL], description: null },
  { name: 'Jade Dragon Scale',    color_hex: '#00A86B', print_run: 48,  serial_numbered: true,  is_one_of_one: false, rarity_rank: 28, box_exclusivity: [ALL], description: null },
  { name: 'Tie-Dye',              color_hex: '#FF69B4', print_run: 25,  serial_numbered: true,  is_one_of_one: false, rarity_rank: 29, box_exclusivity: [ALL], description: null },
  { name: 'White',                color_hex: '#FFFFFF', print_run: 20,  serial_numbered: true,  is_one_of_one: false, rarity_rank: 30, box_exclusivity: [ALL], description: null },
  { name: 'Tessellation',         color_hex: '#9370DB', print_run: 15,  serial_numbered: true,  is_one_of_one: false, rarity_rank: 31, box_exclusivity: [ALL], description: null },
  { name: 'Pink Wave',            color_hex: '#FF69B4', print_run: 13,  serial_numbered: true,  is_one_of_one: false, rarity_rank: 32, box_exclusivity: [ALL], description: null },
  { name: 'Gold',                 color_hex: '#FFD700', print_run: 10,  serial_numbered: true,  is_one_of_one: false, rarity_rank: 33, box_exclusivity: [ALL], description: null },
  { name: 'Gold Ice',             color_hex: '#DAA520', print_run: 10,  serial_numbered: true,  is_one_of_one: false, rarity_rank: 34, box_exclusivity: [ALL], description: null },
  { name: 'Gold Mojo',            color_hex: '#FFD700', print_run: 10,  serial_numbered: true,  is_one_of_one: false, rarity_rank: 35, box_exclusivity: [ALL], description: null },
  { name: 'Green',                color_hex: '#00FF00', print_run: 5,   serial_numbered: true,  is_one_of_one: false, rarity_rank: 36, box_exclusivity: [ALL], description: null },
  { name: 'Black',                color_hex: '#000000', print_run: 1,   serial_numbered: true,  is_one_of_one: true,  rarity_rank: 37, box_exclusivity: [ALL], description: null },
];

async function main() {
  console.log(`Seeding 2024-25 Select Premier League: ${parallels.length} parallels`);
  if (DRY_RUN) { console.log(`Total: ${parallels.length}`); return; }
  await supabase.from('parallels').delete().eq('product_id', PRODUCT_ID);
  const rows = parallels.map(p => ({ product_id: PRODUCT_ID, ...p }));
  const { error } = await supabase.from('parallels').insert(rows);
  if (error) console.error('Insert error:', error.message);
  else console.log(`Inserted ${rows.length} parallels`);
  const { count } = await supabase.from('parallels').select('*', { count: 'exact', head: true }).eq('product_id', PRODUCT_ID);
  console.log(`Verified: ${count} parallels`);
}
main().catch(err => { console.error('Fatal:', err); process.exit(1); });
