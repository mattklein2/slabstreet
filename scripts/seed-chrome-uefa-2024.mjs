#!/usr/bin/env node
/**
 * 2024-25 Topps Chrome UEFA Club Competitions — base set parallels.
 * 200-card base, 40+ refractor parallels. The most collected European soccer product.
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
const PRODUCT_ID = 'd0000000-0000-0000-0000-000000000002';
const ALL = 'All';
const HOBBY = 'Hobby';
const JUMBO = 'Jumbo';
const RETAIL = 'Retail';
const BREAKER = 'Breaker';
const HANGER = 'Hanger';
const BLASTER = 'Blaster';
const HONGBAO = 'Hongbao';

const parallels = [
  // ── Unnumbered ──
  { name: 'Base',                     color_hex: '#FFFFFF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1,  box_exclusivity: [ALL],            description: 'Standard base card' },
  { name: 'Refractor',               color_hex: '#C0C0C0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 2,  box_exclusivity: [HOBBY, JUMBO],   description: 'Classic chrome refractor finish' },
  { name: 'Red Gold Refractor',      color_hex: '#B8860B', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 3,  box_exclusivity: [HONGBAO],        description: 'Red gold refractor exclusive to Hongbao packs' },
  { name: 'Hongbao Red Refractor',   color_hex: '#FF0000', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 4,  box_exclusivity: [HONGBAO],        description: 'Red refractor exclusive to Hongbao packs' },
  { name: 'Magenta Shimmer Refractor', color_hex: '#FF00FF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 5, box_exclusivity: [HANGER],        description: 'Magenta shimmer finish exclusive to hanger boxes' },
  { name: 'Speckle Refractor',       color_hex: '#D3D3D3', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 6,  box_exclusivity: [JUMBO],          description: 'Speckle pattern refractor exclusive to jumbo boxes' },
  { name: 'Geometric Refractor',     color_hex: '#4682B4', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 7,  box_exclusivity: [BREAKER],        description: 'Geometric pattern refractor exclusive to breaker boxes' },
  { name: 'Pulsar Refractor',        color_hex: '#00FF87', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 8,  box_exclusivity: [HOBBY, JUMBO],   description: 'Pulsar refractor with pulsing light effect' },
  { name: 'Wave Refractor',          color_hex: '#4169E1', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 9,  box_exclusivity: [BLASTER],        description: 'Wave pattern refractor exclusive to blaster boxes' },

  // ── Numbered ──
  { name: 'Violet Refractor',        color_hex: '#8B00FF', print_run: 299,  serial_numbered: true,  is_one_of_one: false, rarity_rank: 10, box_exclusivity: [HOBBY, JUMBO, BREAKER], description: 'Violet refractor numbered to 299' },
  { name: 'Violet Prism Refractor',  color_hex: '#9370DB', print_run: 299,  serial_numbered: true,  is_one_of_one: false, rarity_rank: 11, box_exclusivity: [BLASTER, HANGER],       description: 'Violet prism refractor numbered to 299' },
  { name: 'Pink Refractor',          color_hex: '#FF69B4', print_run: 250,  serial_numbered: true,  is_one_of_one: false, rarity_rank: 12, box_exclusivity: [ALL],            description: 'Pink refractor numbered to 250' },
  { name: 'Pink Lava Refractor',     color_hex: '#FF1493', print_run: 250,  serial_numbered: true,  is_one_of_one: false, rarity_rank: 13, box_exclusivity: [ALL],            description: 'Pink lava refractor numbered to 250' },
  { name: 'Night Vision RayWave',    color_hex: '#00FF00', print_run: 225,  serial_numbered: true,  is_one_of_one: false, rarity_rank: 14, box_exclusivity: [HOBBY],          description: 'Night vision RayWave numbered to 225' },
  { name: 'Aqua Refractor',          color_hex: '#00CED1', print_run: 199,  serial_numbered: true,  is_one_of_one: false, rarity_rank: 15, box_exclusivity: [ALL],            description: 'Aqua refractor numbered to 199' },
  { name: 'Aqua Lava Refractor',     color_hex: '#20B2AA', print_run: 199,  serial_numbered: true,  is_one_of_one: false, rarity_rank: 16, box_exclusivity: [HOBBY],          description: 'Aqua lava refractor numbered to 199' },
  { name: 'Aqua Prism Refractor',    color_hex: '#48D1CC', print_run: 199,  serial_numbered: true,  is_one_of_one: false, rarity_rank: 17, box_exclusivity: [HOBBY],          description: 'Aqua prism refractor numbered to 199' },
  { name: 'Neon Pink RayWave',       color_hex: '#FF6EB4', print_run: 175,  serial_numbered: true,  is_one_of_one: false, rarity_rank: 18, box_exclusivity: [ALL],            description: 'Neon pink RayWave numbered to 175' },
  { name: 'Neon Pink Prism',         color_hex: '#FF69B4', print_run: 175,  serial_numbered: true,  is_one_of_one: false, rarity_rank: 19, box_exclusivity: [ALL],            description: 'Neon pink prism numbered to 175' },
  { name: 'Blue Refractor',          color_hex: '#4169E1', print_run: 150,  serial_numbered: true,  is_one_of_one: false, rarity_rank: 20, box_exclusivity: [ALL],            description: 'Blue refractor numbered to 150' },
  { name: 'Blue Lava Refractor',     color_hex: '#0000CD', print_run: 150,  serial_numbered: true,  is_one_of_one: false, rarity_rank: 21, box_exclusivity: [HOBBY],          description: 'Blue lava refractor numbered to 150' },
  { name: 'Blue Prism Refractor',    color_hex: '#1E90FF', print_run: 150,  serial_numbered: true,  is_one_of_one: false, rarity_rank: 22, box_exclusivity: [ALL],            description: 'Blue prism refractor numbered to 150' },
  { name: 'Neon Green RayWave',      color_hex: '#39FF14', print_run: 125,  serial_numbered: true,  is_one_of_one: false, rarity_rank: 23, box_exclusivity: [HOBBY],          description: 'Neon green RayWave numbered to 125' },
  { name: 'Green Refractor',         color_hex: '#00FF00', print_run: 99,   serial_numbered: true,  is_one_of_one: false, rarity_rank: 24, box_exclusivity: [ALL],            description: 'Green refractor numbered to 99' },
  { name: 'Green Lava Refractor',    color_hex: '#228B22', print_run: 99,   serial_numbered: true,  is_one_of_one: false, rarity_rank: 25, box_exclusivity: [HOBBY],          description: 'Green lava refractor numbered to 99' },
  { name: 'Green Prism Refractor',   color_hex: '#32CD32', print_run: 99,   serial_numbered: true,  is_one_of_one: false, rarity_rank: 26, box_exclusivity: [ALL],            description: 'Green prism refractor numbered to 99' },
  { name: 'Magenta Refractor',       color_hex: '#FF00FF', print_run: 75,   serial_numbered: true,  is_one_of_one: false, rarity_rank: 27, box_exclusivity: [ALL],            description: 'Magenta refractor numbered to 75' },
  { name: 'Magenta Lava Refractor',  color_hex: '#8B008B', print_run: 75,   serial_numbered: true,  is_one_of_one: false, rarity_rank: 28, box_exclusivity: [HOBBY],          description: 'Magenta lava refractor numbered to 75' },
  { name: 'Magenta Prism Refractor', color_hex: '#DA70D6', print_run: 75,   serial_numbered: true,  is_one_of_one: false, rarity_rank: 29, box_exclusivity: [ALL],            description: 'Magenta prism refractor numbered to 75' },
  { name: 'ToppsFractor',            color_hex: '#FFD700', print_run: 52,   serial_numbered: true,  is_one_of_one: false, rarity_rank: 30, box_exclusivity: [HOBBY],          description: 'ToppsFractor numbered to 52' },
  { name: 'Gold Refractor',          color_hex: '#FFD700', print_run: 50,   serial_numbered: true,  is_one_of_one: false, rarity_rank: 31, box_exclusivity: [ALL],            description: 'Gold refractor numbered to 50' },
  { name: 'Gold Lava Refractor',     color_hex: '#DAA520', print_run: 50,   serial_numbered: true,  is_one_of_one: false, rarity_rank: 32, box_exclusivity: [HOBBY],          description: 'Gold lava refractor numbered to 50' },
  { name: 'Gold Prism Refractor',    color_hex: '#B8860B', print_run: 50,   serial_numbered: true,  is_one_of_one: false, rarity_rank: 33, box_exclusivity: [ALL],            description: 'Gold prism refractor numbered to 50' },
  { name: 'Orange Refractor',        color_hex: '#FF8C00', print_run: 25,   serial_numbered: true,  is_one_of_one: false, rarity_rank: 34, box_exclusivity: [ALL],            description: 'Orange refractor numbered to 25' },
  { name: 'Orange Lava Refractor',   color_hex: '#FF4500', print_run: 25,   serial_numbered: true,  is_one_of_one: false, rarity_rank: 35, box_exclusivity: [HOBBY],          description: 'Orange lava refractor numbered to 25' },
  { name: 'Orange Prism Refractor',  color_hex: '#FF6347', print_run: 25,   serial_numbered: true,  is_one_of_one: false, rarity_rank: 36, box_exclusivity: [ALL],            description: 'Orange prism refractor numbered to 25' },
  { name: 'Red Refractor',           color_hex: '#FF0000', print_run: 10,   serial_numbered: true,  is_one_of_one: false, rarity_rank: 37, box_exclusivity: [ALL],            description: 'Red refractor numbered to 10' },
  { name: 'Red Lava Refractor',      color_hex: '#8B0000', print_run: 10,   serial_numbered: true,  is_one_of_one: false, rarity_rank: 38, box_exclusivity: [HOBBY],          description: 'Red lava refractor numbered to 10' },
  { name: 'Red Prism Refractor',     color_hex: '#DC143C', print_run: 10,   serial_numbered: true,  is_one_of_one: false, rarity_rank: 39, box_exclusivity: [ALL],            description: 'Red prism refractor numbered to 10' },
  { name: 'XI Refractor',            color_hex: '#1A1A1A', print_run: 11,   serial_numbered: true,  is_one_of_one: false, rarity_rank: 40, box_exclusivity: [ALL],            description: 'XI refractor numbered to 11' },

  // ── 1-of-1 ──
  { name: 'Black Refractor',         color_hex: '#000000', print_run: 1,    serial_numbered: true,  is_one_of_one: true,  rarity_rank: 41, box_exclusivity: [ALL],            description: 'Black refractor 1-of-1' },
  { name: 'Superfractor',            color_hex: '#FFD700', print_run: 1,    serial_numbered: true,  is_one_of_one: true,  rarity_rank: 42, box_exclusivity: [ALL],            description: 'Superfractor 1-of-1, the ultimate chase card' },
];

async function main() {
  console.log(`Seeding 2024-25 Chrome UEFA: ${parallels.length} parallels`);
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
