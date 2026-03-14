#!/usr/bin/env node
/**
 * 2024-25 Panini Donruss Soccer — base set parallels (including Optic).
 * Global soccer product. 200-card base with Rated Rookies.
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
const PRODUCT_ID = 'd0000000-0000-0000-0000-000000000020';
const ALL = 'All';
const HOBBY = 'Hobby';

const parallels = [
  // Base parallels (unnumbered)
  { name: 'Base',           color_hex: '#FFFFFF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1,  box_exclusivity: [ALL],  description: 'Standard base card' },
  { name: 'Cubic',          color_hex: '#E0E0FF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 2,  box_exclusivity: [ALL],  description: 'Cubic texture pattern parallel' },

  // Numbered base
  { name: 'Silver',         color_hex: '#C0C0C0', print_run: 349,  serial_numbered: true,  is_one_of_one: false, rarity_rank: 3,  box_exclusivity: [ALL],  description: 'Silver parallel numbered to 349' },
  { name: 'Teal',           color_hex: '#008080', print_run: 199,  serial_numbered: true,  is_one_of_one: false, rarity_rank: 4,  box_exclusivity: [ALL],  description: 'Teal parallel numbered to 199' },
  { name: 'Blue Cubic',     color_hex: '#4169E1', print_run: 99,   serial_numbered: true,  is_one_of_one: false, rarity_rank: 5,  box_exclusivity: [ALL],  description: 'Blue Cubic parallel numbered to 99' },
  { name: 'Pink Cubic',     color_hex: '#FF69B4', print_run: 99,   serial_numbered: true,  is_one_of_one: false, rarity_rank: 6,  box_exclusivity: [ALL],  description: 'Pink Cubic parallel numbered to 99' },
  { name: 'Red Cubic',      color_hex: '#FF0000', print_run: 99,   serial_numbered: true,  is_one_of_one: false, rarity_rank: 7,  box_exclusivity: [ALL],  description: 'Red Cubic parallel numbered to 99' },
  { name: 'Blue',           color_hex: '#4169E1', print_run: 49,   serial_numbered: true,  is_one_of_one: false, rarity_rank: 8,  box_exclusivity: [HOBBY], description: 'Blue parallel numbered to 49, Hobby exclusive' },
  { name: 'Pink Diamond',   color_hex: '#FF69B4', print_run: 25,   serial_numbered: true,  is_one_of_one: false, rarity_rank: 9,  box_exclusivity: [HOBBY], description: 'Pink Diamond parallel numbered to 25, Hobby exclusive' },
  { name: 'Purple',         color_hex: '#9370DB', print_run: 25,   serial_numbered: true,  is_one_of_one: false, rarity_rank: 10, box_exclusivity: [HOBBY], description: 'Purple parallel numbered to 25, Hobby exclusive' },
  { name: 'Gold',           color_hex: '#FFD700', print_run: 10,   serial_numbered: true,  is_one_of_one: false, rarity_rank: 11, box_exclusivity: [HOBBY], description: 'Gold parallel numbered to 10, Hobby exclusive' },
  { name: 'Green',          color_hex: '#00FF00', print_run: 5,    serial_numbered: true,  is_one_of_one: false, rarity_rank: 12, box_exclusivity: [HOBBY], description: 'Green parallel numbered to 5, Hobby exclusive' },
  { name: 'Black',          color_hex: '#000000', print_run: 1,    serial_numbered: true,  is_one_of_one: true,  rarity_rank: 13, box_exclusivity: [HOBBY], description: 'Black parallel, true 1/1' },

  // Optic parallels (unnumbered)
  { name: 'Optic Base',          color_hex: '#E8E8E8', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 14, box_exclusivity: [ALL], description: 'Optic base card with chrome finish' },
  { name: 'Optic Argyle',        color_hex: '#8B0000', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 15, box_exclusivity: [ALL], description: 'Optic Argyle pattern parallel' },
  { name: 'Optic Holo',          color_hex: '#C0C0C0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 16, box_exclusivity: [ALL], description: 'Optic holographic parallel' },
  { name: 'Optic Ice',           color_hex: '#B0E0E6', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 17, box_exclusivity: [ALL], description: 'Optic Ice parallel with frosted finish' },
  { name: 'Optic Plum Blossom',  color_hex: '#DDA0DD', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 18, box_exclusivity: [ALL], description: 'Optic Plum Blossom parallel' },
  { name: 'Optic Velocity',      color_hex: '#FF4500', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 19, box_exclusivity: [ALL], description: 'Optic Velocity parallel with motion effect' },

  // Optic numbered
  { name: 'Optic Red',           color_hex: '#FF0000', print_run: 299, serial_numbered: true,  is_one_of_one: false, rarity_rank: 20, box_exclusivity: [ALL],   description: 'Optic Red parallel numbered to 299' },
  { name: 'Optic Blue',          color_hex: '#4169E1', print_run: 149, serial_numbered: true,  is_one_of_one: false, rarity_rank: 21, box_exclusivity: [ALL],   description: 'Optic Blue parallel numbered to 149' },
  { name: 'Optic Pink Velocity', color_hex: '#FF69B4', print_run: 99,  serial_numbered: true,  is_one_of_one: false, rarity_rank: 22, box_exclusivity: [ALL],   description: 'Optic Pink Velocity parallel numbered to 99' },
  { name: 'Optic Teal Mojo',     color_hex: '#008080', print_run: 49,  serial_numbered: true,  is_one_of_one: false, rarity_rank: 23, box_exclusivity: [HOBBY], description: 'Optic Teal Mojo parallel numbered to 49, Hobby exclusive' },
  { name: 'Optic Pink Ice',      color_hex: '#FFB6C1', print_run: 25,  serial_numbered: true,  is_one_of_one: false, rarity_rank: 24, box_exclusivity: [HOBBY], description: 'Optic Pink Ice parallel numbered to 25, Hobby exclusive' },
  { name: 'Optic Purple Mojo',   color_hex: '#9370DB', print_run: 25,  serial_numbered: true,  is_one_of_one: false, rarity_rank: 25, box_exclusivity: [HOBBY], description: 'Optic Purple Mojo parallel numbered to 25, Hobby exclusive' },
  { name: 'Optic Gold',          color_hex: '#FFD700', print_run: 10,  serial_numbered: true,  is_one_of_one: false, rarity_rank: 26, box_exclusivity: [HOBBY], description: 'Optic Gold parallel numbered to 10, Hobby exclusive' },
  { name: 'Optic Dragon Scale',  color_hex: '#00A86B', print_run: 8,   serial_numbered: true,  is_one_of_one: false, rarity_rank: 27, box_exclusivity: [HOBBY], description: 'Optic Dragon Scale parallel numbered to 8, Hobby exclusive' },
  { name: 'Optic Green',         color_hex: '#00FF00', print_run: 5,   serial_numbered: true,  is_one_of_one: false, rarity_rank: 28, box_exclusivity: [HOBBY], description: 'Optic Green parallel numbered to 5, Hobby exclusive' },
  { name: 'Optic Black',         color_hex: '#000000', print_run: 1,   serial_numbered: true,  is_one_of_one: true,  rarity_rank: 29, box_exclusivity: [HOBBY], description: 'Optic Black parallel, true 1/1' },
  { name: 'Optic Black Pandora', color_hex: '#1A1A1A', print_run: 1,   serial_numbered: true,  is_one_of_one: true,  rarity_rank: 30, box_exclusivity: [HOBBY], description: 'Optic Black Pandora parallel, true 1/1' },
  { name: 'Optic Gold Power',    color_hex: '#FFD700', print_run: 1,   serial_numbered: true,  is_one_of_one: true,  rarity_rank: 31, box_exclusivity: [HOBBY], description: 'Optic Gold Power parallel, true 1/1' },
];

async function main() {
  console.log(`Seeding 2024-25 Donruss Soccer: ${parallels.length} parallels`);
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
