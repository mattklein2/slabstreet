#!/usr/bin/env node
/**
 * 2024-25 Panini Select FIFA Soccer — base set parallels.
 * Global soccer Select with FIFA license. Three-tier base.
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
const PRODUCT_ID = 'd0000000-0000-0000-0000-000000000012';
const ALL = 'All';
const HOBBY = 'Hobby';
const RETAIL = 'Retail';

const parallels = [
  // Unnumbered base parallels
  { name: 'Base',           color_hex: '#FFFFFF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1,  box_exclusivity: [ALL],    description: 'Standard base card' },
  { name: 'Blue',           color_hex: '#4169E1', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 2,  box_exclusivity: [ALL],    description: 'Blue parallel' },
  { name: 'Blue Lazer',     color_hex: '#1E90FF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 3,  box_exclusivity: [ALL],    description: 'Blue Lazer parallel' },
  { name: 'Silver',         color_hex: '#C0C0C0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 4,  box_exclusivity: [ALL],    description: 'Silver parallel' },
  { name: 'Checkerboard',   color_hex: '#2C2C2C', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 5,  box_exclusivity: [ALL],    description: 'Checkerboard pattern parallel' },
  { name: 'Flash',          color_hex: '#E0E0FF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 6,  box_exclusivity: [ALL],    description: 'Flash parallel' },
  { name: 'Green Ice',      color_hex: '#00FA9A', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 7,  box_exclusivity: [ALL],    description: 'Green Ice parallel' },
  { name: 'Honeycomb',      color_hex: '#DAA520', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 8,  box_exclusivity: [ALL],    description: 'Honeycomb pattern parallel' },
  { name: 'Ice',            color_hex: '#B0E0E6', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 9,  box_exclusivity: [ALL],    description: 'Ice parallel with frosted finish' },
  { name: 'Multi-Color',    color_hex: '#FF69B4', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 10, box_exclusivity: [ALL],    description: 'Multi-Color parallel' },
  { name: 'Pandora',        color_hex: '#9370DB', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 11, box_exclusivity: [ALL],    description: 'Pandora parallel' },
  { name: 'Peacock',        color_hex: '#00CED1', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 12, box_exclusivity: [HOBBY],  description: 'Peacock parallel, Hobby exclusive' },
  { name: 'Purple Mojo',    color_hex: '#9370DB', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 13, box_exclusivity: [HOBBY],  description: 'Purple Mojo parallel, Hobby exclusive' },
  { name: 'Red',            color_hex: '#FF0000', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 14, box_exclusivity: [ALL],    description: 'Red parallel' },
  { name: 'White Sparkle',  color_hex: '#F0F0F0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 15, box_exclusivity: [RETAIL], description: 'White Sparkle parallel, Retail exclusive' },
  { name: 'Zebra',          color_hex: '#2C2C2C', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 16, box_exclusivity: [ALL],    description: 'Zebra parallel, SSP' },

  // Numbered parallels
  { name: 'Pink Mojo',             color_hex: '#FF69B4', print_run: 299, serial_numbered: true,  is_one_of_one: false, rarity_rank: 17, box_exclusivity: [ALL],   description: 'Pink Mojo parallel numbered to 299' },
  { name: 'Camo',                  color_hex: '#556B2F', print_run: 135, serial_numbered: true,  is_one_of_one: false, rarity_rank: 18, box_exclusivity: [ALL],   description: 'Camo parallel numbered to 135' },
  { name: 'Orange Fluorescent',    color_hex: '#FF8C00', print_run: 125, serial_numbered: true,  is_one_of_one: false, rarity_rank: 19, box_exclusivity: [ALL],   description: 'Orange Fluorescent parallel numbered to 125' },
  { name: 'Bronze Checker',        color_hex: '#CD7F32', print_run: 75,  serial_numbered: true,  is_one_of_one: false, rarity_rank: 20, box_exclusivity: [ALL],   description: 'Bronze Checker parallel numbered to 75' },
  { name: 'Pink',                  color_hex: '#FF69B4', print_run: 59,  serial_numbered: true,  is_one_of_one: false, rarity_rank: 21, box_exclusivity: [HOBBY], description: 'Pink parallel numbered to 59, Hobby exclusive' },
  { name: 'Red Wave',              color_hex: '#FF0000', print_run: 59,  serial_numbered: true,  is_one_of_one: false, rarity_rank: 22, box_exclusivity: [ALL],   description: 'Red Wave parallel numbered to 59' },
  { name: 'Winter Camo',           color_hex: '#87CEEB', print_run: 30,  serial_numbered: true,  is_one_of_one: false, rarity_rank: 23, box_exclusivity: [ALL],   description: 'Winter Camo parallel numbered to 30' },
  { name: 'Jade Dragon Scale',     color_hex: '#00A86B', print_run: 28,  serial_numbered: true,  is_one_of_one: false, rarity_rank: 24, box_exclusivity: [ALL],   description: 'Jade Dragon Scale parallel numbered to 28' },
  { name: 'Tie-Dye',               color_hex: '#FF69B4', print_run: 25,  serial_numbered: true,  is_one_of_one: false, rarity_rank: 25, box_exclusivity: [HOBBY], description: 'Tie-Dye parallel numbered to 25, Hobby exclusive' },
  { name: 'Tessellation',          color_hex: '#9370DB', print_run: 15,  serial_numbered: true,  is_one_of_one: false, rarity_rank: 26, box_exclusivity: [HOBBY], description: 'Tessellation parallel numbered to 15, Hobby exclusive' },
  { name: 'Pink Wave',             color_hex: '#FF69B4', print_run: 13,  serial_numbered: true,  is_one_of_one: false, rarity_rank: 27, box_exclusivity: [HOBBY], description: 'Pink Wave parallel numbered to 13, Hobby exclusive' },
  { name: 'Gold',                  color_hex: '#FFD700', print_run: 10,  serial_numbered: true,  is_one_of_one: false, rarity_rank: 28, box_exclusivity: [HOBBY], description: 'Gold parallel numbered to 10, Hobby exclusive' },
  { name: 'Gold Ice',              color_hex: '#DAA520', print_run: 10,  serial_numbered: true,  is_one_of_one: false, rarity_rank: 29, box_exclusivity: [HOBBY], description: 'Gold Ice parallel numbered to 10, Hobby exclusive' },
  { name: 'Gold Mojo',             color_hex: '#FFD700', print_run: 10,  serial_numbered: true,  is_one_of_one: false, rarity_rank: 30, box_exclusivity: [HOBBY], description: 'Gold Mojo parallel numbered to 10, Hobby exclusive' },
  { name: 'Green',                 color_hex: '#00FF00', print_run: 5,   serial_numbered: true,  is_one_of_one: false, rarity_rank: 31, box_exclusivity: [HOBBY], description: 'Green parallel numbered to 5, Hobby exclusive' },

  // 1-of-1
  { name: 'Black',                 color_hex: '#000000', print_run: 1,   serial_numbered: true,  is_one_of_one: true,  rarity_rank: 32, box_exclusivity: [HOBBY], description: 'Black parallel, true 1/1' },
];

async function main() {
  console.log(`Seeding 2024-25 Select FIFA: ${parallels.length} parallels`);
  if (DRY_RUN) { console.log(`Total: ${parallels.length}`); return; }
  await supabase.from('parallels').delete().eq('product_id', PRODUCT_ID);
  const rows = parallels.map(p => ({ product_id: PRODUCT_ID, ...p }));
  const { error } = await supabase.from('parallels').insert(rows);
  if (error) console.error('Insert error:', error.message);
  else console.log(`Inserted ${rows.length} parallels`);
  const { count } = await supabase.from('parallels').select('*', { count: 'exact', head: true }).eq('product_id', PRODUCT_ID);
  console.log(`Verified: ${count} parallels`);
}
main().catch(err => { console.error('Fatal:', err); process.exit(1);
});
