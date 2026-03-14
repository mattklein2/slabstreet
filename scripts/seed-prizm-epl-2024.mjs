#!/usr/bin/env node
/**
 * 2024-25 Panini Prizm Premier League — base set parallels.
 * Final Panini-licensed EPL Prizm. 300-card base, 30+ parallels.
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
const PRODUCT_ID = 'd0000000-0000-0000-0000-000000000010';
const ALL = 'All';
const HOBBY = 'Hobby';
const RETAIL = 'Retail';
const CHOICE = 'Choice';
const BREAKAWAY = 'Breakaway';

const parallels = [
  // --- Unnumbered parallels ---
  { name: 'Base',                    color_hex: '#FFFFFF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1,  box_exclusivity: [ALL],       description: 'Standard base card' },
  { name: 'Silver Prizm',           color_hex: '#C0C0C0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 2,  box_exclusivity: [ALL],       description: 'Classic silver refractor finish' },
  { name: 'Red White & Blue',       color_hex: '#B22234', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 3,  box_exclusivity: [ALL],       description: 'Red, white, and blue tri-color prizm' },
  { name: 'Hyper Prizm',            color_hex: '#E0E0FF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 4,  box_exclusivity: [RETAIL],    description: 'Retail-exclusive hyper refractor' },
  { name: 'Green Pulsar',           color_hex: '#00FF87', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 5,  box_exclusivity: [ALL],       description: 'Green pulsar pattern prizm' },
  { name: 'Ice Prizm',              color_hex: '#B0E0E6', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 6,  box_exclusivity: [HOBBY],     description: 'Hobby-exclusive ice refractor' },
  { name: 'Mojo Prizm',             color_hex: '#8B00FF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 7,  box_exclusivity: [HOBBY],     description: 'Hobby-exclusive mojo swirl pattern' },
  { name: 'Lazer Prizm',            color_hex: '#FF4500', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 8,  box_exclusivity: [ALL],       description: 'Lazer-etched refractor finish' },
  { name: 'Green Ice Prizm',        color_hex: '#00FA9A', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 9,  box_exclusivity: [ALL],       description: 'Green-tinted ice refractor' },
  { name: 'Choice Prizm',           color_hex: '#DAA520', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 10, box_exclusivity: [CHOICE],    description: 'Choice box base prizm' },
  { name: 'Choice Red White & Blue', color_hex: '#B22234', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 11, box_exclusivity: [CHOICE],   description: 'Choice-exclusive red white & blue prizm' },
  { name: 'Choice Tiger Stripe',    color_hex: '#FF8C00', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 12, box_exclusivity: [CHOICE],    description: 'Choice-exclusive tiger stripe pattern' },
  { name: 'Breakaway Prizm',        color_hex: '#FF6347', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 13, box_exclusivity: [BREAKAWAY], description: 'Breakaway box base prizm' },
  { name: 'Breakaway Orange',       color_hex: '#FF8C00', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 14, box_exclusivity: [BREAKAWAY], description: 'Breakaway-exclusive orange prizm' },
  { name: 'Black & White Checker',  color_hex: '#2C2C2C', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 15, box_exclusivity: [ALL],       description: 'Black and white checkerboard pattern' },
  { name: 'Blue Mosaic',            color_hex: '#4169E1', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 16, box_exclusivity: [ALL],       description: 'Blue mosaic tile pattern' },
  { name: 'Pink Mosaic',            color_hex: '#FF69B4', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 17, box_exclusivity: [ALL],       description: 'Pink mosaic tile pattern' },
  { name: 'Orange Mosaic',          color_hex: '#FF8C00', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 18, box_exclusivity: [ALL],       description: 'Orange mosaic tile pattern' },
  { name: 'Red Mosaic',             color_hex: '#FF0000', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 19, box_exclusivity: [ALL],       description: 'Red mosaic tile pattern' },
  { name: 'Pink Stars',             color_hex: '#FFB6C1', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 20, box_exclusivity: [ALL],       description: 'Pink with star pattern overlay' },
  { name: 'Glitter Prizm',          color_hex: '#FFD700', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 21, box_exclusivity: [HOBBY],     description: 'Hobby-exclusive glitter finish' },
  { name: 'Genesis Prizm',          color_hex: '#8B008B', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 22, box_exclusivity: [HOBBY],     description: 'Hobby-exclusive genesis refractor' },
  { name: 'White Sparkle',          color_hex: '#F0F0F0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 23, box_exclusivity: [RETAIL],    description: 'Retail-exclusive white sparkle finish' },
  { name: 'Snakeskin',              color_hex: '#556B2F', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 24, box_exclusivity: [HOBBY],     description: 'Hobby-exclusive snakeskin texture' },
  { name: 'Orange Hyper',           color_hex: '#FF8C00', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 25, box_exclusivity: [RETAIL],    description: 'Retail-exclusive orange hyper refractor' },

  // --- Numbered parallels ---
  { name: 'Blue',                   color_hex: '#4169E1', print_run: 299,  serial_numbered: true,  is_one_of_one: false, rarity_rank: 26, box_exclusivity: [ALL],       description: 'Blue prizm numbered /299' },
  { name: 'Purple Mosaic',          color_hex: '#9370DB', print_run: 249,  serial_numbered: true,  is_one_of_one: false, rarity_rank: 27, box_exclusivity: [ALL],       description: 'Purple mosaic tile pattern numbered /249' },
  { name: 'Red',                    color_hex: '#FF0000', print_run: 199,  serial_numbered: true,  is_one_of_one: false, rarity_rank: 28, box_exclusivity: [ALL],       description: 'Red prizm numbered /199' },
  { name: 'Purple & White Stripes', color_hex: '#9370DB', print_run: 92,   serial_numbered: true,  is_one_of_one: false, rarity_rank: 29, box_exclusivity: [HOBBY],     description: 'Purple and white striped prizm numbered /92' },
  { name: 'Blue Ice',               color_hex: '#87CEEB', print_run: 75,   serial_numbered: true,  is_one_of_one: false, rarity_rank: 30, box_exclusivity: [HOBBY],     description: 'Hobby-exclusive blue ice prizm numbered /75' },
  { name: 'Red Lazer',              color_hex: '#FF0000', print_run: 49,   serial_numbered: true,  is_one_of_one: false, rarity_rank: 31, box_exclusivity: [HOBBY],     description: 'Hobby-exclusive red lazer prizm numbered /49' },
  { name: 'White',                  color_hex: '#FFFFFF', print_run: 35,   serial_numbered: true,  is_one_of_one: false, rarity_rank: 32, box_exclusivity: [HOBBY],     description: 'Hobby-exclusive white prizm numbered /35' },
  { name: 'Choice Red',             color_hex: '#FF0000', print_run: 30,   serial_numbered: true,  is_one_of_one: false, rarity_rank: 33, box_exclusivity: [CHOICE],    description: 'Choice-exclusive red prizm numbered /30' },
  { name: 'Purple Mojo',            color_hex: '#9370DB', print_run: 25,   serial_numbered: true,  is_one_of_one: false, rarity_rank: 34, box_exclusivity: [HOBBY],     description: 'Hobby-exclusive purple mojo prizm numbered /25' },
  { name: 'Red Stars',              color_hex: '#FF0000', print_run: 25,   serial_numbered: true,  is_one_of_one: false, rarity_rank: 35, box_exclusivity: [ALL],       description: 'Red with star pattern numbered /25' },
  { name: 'Choice Cherry Blossom',  color_hex: '#FFB7C5', print_run: 20,   serial_numbered: true,  is_one_of_one: false, rarity_rank: 36, box_exclusivity: [CHOICE],    description: 'Choice-exclusive cherry blossom prizm numbered /20' },
  { name: 'Lotus Flower',           color_hex: '#FF69B4', print_run: 18,   serial_numbered: true,  is_one_of_one: false, rarity_rank: 37, box_exclusivity: [BREAKAWAY], description: 'Breakaway-exclusive lotus flower prizm numbered /18' },
  { name: 'Choice Zebra',           color_hex: '#2C2C2C', print_run: 15,   serial_numbered: true,  is_one_of_one: false, rarity_rank: 38, box_exclusivity: [CHOICE],    description: 'Choice-exclusive zebra stripe prizm numbered /15' },
  { name: 'Pink Mojo',              color_hex: '#FF69B4', print_run: 11,   serial_numbered: true,  is_one_of_one: false, rarity_rank: 39, box_exclusivity: [HOBBY],     description: 'Hobby-exclusive pink mojo prizm numbered /11' },
  { name: 'Gold',                   color_hex: '#FFD700', print_run: 10,   serial_numbered: true,  is_one_of_one: false, rarity_rank: 40, box_exclusivity: [ALL],       description: 'Gold prizm numbered /10' },
  { name: 'Black Gold',             color_hex: '#1A1A1A', print_run: 8,    serial_numbered: true,  is_one_of_one: false, rarity_rank: 41, box_exclusivity: [HOBBY],     description: 'Hobby-exclusive black gold prizm numbered /8' },
  { name: 'Blue Shimmer',           color_hex: '#4169E1', print_run: 8,    serial_numbered: true,  is_one_of_one: false, rarity_rank: 42, box_exclusivity: [HOBBY],     description: 'Hobby-exclusive blue shimmer prizm numbered /8' },

  // --- 1-of-1 ---
  { name: 'Black',                  color_hex: '#000000', print_run: 1,    serial_numbered: true,  is_one_of_one: true,  rarity_rank: 43, box_exclusivity: [ALL],       description: 'True 1/1 black prizm' },
];

async function main() {
  console.log(`Seeding 2024-25 Prizm Premier League: ${parallels.length} parallels`);
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
