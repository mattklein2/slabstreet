#!/usr/bin/env node
/**
 * 2024-25 Topps Finest UEFA Club Competitions — base set parallels.
 * 150-card base, premium chrome. Hobby-only, two autos per box.
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
const PRODUCT_ID = 'd0000000-0000-0000-0000-000000000003';
const ALL = 'All';
const HOBBY = 'Hobby';

const parallels = [
  // Unnumbered
  { name: 'Base',                    color_hex: '#FFFFFF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1,  box_exclusivity: [HOBBY], description: 'Base card' },
  { name: 'Refractor',              color_hex: '#C0C0C0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 2,  box_exclusivity: [HOBBY], description: 'Standard refractor parallel' },

  // Numbered
  { name: 'Purple Refractor',       color_hex: '#9370DB', print_run: 299,  serial_numbered: true,  is_one_of_one: false, rarity_rank: 3,  box_exclusivity: [HOBBY], description: 'Purple refractor numbered to 299' },
  { name: 'Sky Blue Refractor',     color_hex: '#87CEEB', print_run: 275,  serial_numbered: true,  is_one_of_one: false, rarity_rank: 4,  box_exclusivity: [HOBBY], description: 'Sky blue refractor numbered to 275' },
  { name: 'Pink RayWave Refractor', color_hex: '#FF69B4', print_run: 250,  serial_numbered: true,  is_one_of_one: false, rarity_rank: 5,  box_exclusivity: [HOBBY], description: 'Pink RayWave refractor numbered to 250' },
  { name: 'Purple Lava Refractor',  color_hex: '#8B008B', print_run: 199,  serial_numbered: true,  is_one_of_one: false, rarity_rank: 6,  box_exclusivity: [HOBBY], description: 'Purple lava refractor numbered to 199' },
  { name: 'Blue RayWave Refractor', color_hex: '#4169E1', print_run: 150,  serial_numbered: true,  is_one_of_one: false, rarity_rank: 7,  box_exclusivity: [HOBBY], description: 'Blue RayWave refractor numbered to 150' },
  { name: 'Pink Prism Refractor',   color_hex: '#FF1493', print_run: 125,  serial_numbered: true,  is_one_of_one: false, rarity_rank: 8,  box_exclusivity: [HOBBY], description: 'Pink prism refractor numbered to 125' },
  { name: 'Green Lava Refractor',   color_hex: '#228B22', print_run: 99,   serial_numbered: true,  is_one_of_one: false, rarity_rank: 9,  box_exclusivity: [HOBBY], description: 'Green lava refractor numbered to 99' },
  { name: 'Green Refractor',        color_hex: '#00FF00', print_run: 99,   serial_numbered: true,  is_one_of_one: false, rarity_rank: 10, box_exclusivity: [HOBBY], description: 'Green refractor numbered to 99' },
  { name: 'Magenta Refractor',      color_hex: '#FF00FF', print_run: 75,   serial_numbered: true,  is_one_of_one: false, rarity_rank: 11, box_exclusivity: [HOBBY], description: 'Magenta refractor numbered to 75' },
  { name: 'Magenta Lava Refractor', color_hex: '#8B008B', print_run: 75,   serial_numbered: true,  is_one_of_one: false, rarity_rank: 12, box_exclusivity: [HOBBY], description: 'Magenta lava refractor numbered to 75' },
  { name: 'Gold Refractor',         color_hex: '#FFD700', print_run: 50,   serial_numbered: true,  is_one_of_one: false, rarity_rank: 13, box_exclusivity: [HOBBY], description: 'Gold refractor numbered to 50' },
  { name: 'Gold Lava Refractor',    color_hex: '#DAA520', print_run: 50,   serial_numbered: true,  is_one_of_one: false, rarity_rank: 14, box_exclusivity: [HOBBY], description: 'Gold lava refractor numbered to 50' },
  { name: 'Orange Refractor',       color_hex: '#FF8C00', print_run: 25,   serial_numbered: true,  is_one_of_one: false, rarity_rank: 15, box_exclusivity: [HOBBY], description: 'Orange refractor numbered to 25' },
  { name: 'Orange Lava Refractor',  color_hex: '#FF4500', print_run: 25,   serial_numbered: true,  is_one_of_one: false, rarity_rank: 16, box_exclusivity: [HOBBY], description: 'Orange lava refractor numbered to 25' },
  { name: 'Red Refractor',          color_hex: '#FF0000', print_run: 10,   serial_numbered: true,  is_one_of_one: false, rarity_rank: 17, box_exclusivity: [HOBBY], description: 'Red refractor numbered to 10' },
  { name: 'Red Lava Refractor',     color_hex: '#8B0000', print_run: 10,   serial_numbered: true,  is_one_of_one: false, rarity_rank: 18, box_exclusivity: [HOBBY], description: 'Red lava refractor numbered to 10' },
  { name: 'Black Refractor',        color_hex: '#1A1A1A', print_run: 5,    serial_numbered: true,  is_one_of_one: false, rarity_rank: 19, box_exclusivity: [HOBBY], description: 'Black refractor numbered to 5' },

  // 1-of-1
  { name: 'Superfractor',           color_hex: '#FFD700', print_run: 1,    serial_numbered: true,  is_one_of_one: true,  rarity_rank: 20, box_exclusivity: [HOBBY], description: 'Superfractor 1/1' },
  { name: 'Black Canary',           color_hex: '#000000', print_run: 1,    serial_numbered: true,  is_one_of_one: true,  rarity_rank: 21, box_exclusivity: [HOBBY], description: 'Black Canary 1/1' },
];

async function main() {
  console.log(`Seeding 2024-25 Finest UEFA: ${parallels.length} parallels`);
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
