#!/usr/bin/env node

/**
 * Seed 2024 Panini Mosaic Football parallel data.
 * Sources: Beckett, Checklist Insider, Cardboard Connection, DA Card World.
 *
 * Usage:
 *   node scripts/seed-mosaic-2024-nfl.mjs
 *   node scripts/seed-mosaic-2024-nfl.mjs --dry-run
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

const PRODUCT_ID = 'c0000000-0000-0000-0000-00000000000f'; // 2024 Mosaic NFL

const HOBBY = 'Hobby';
const NO_HUDDLE = 'No Huddle';
const CHOICE = 'Choice';
const RETAIL_MEGA = 'Retail Mega';
const HOBBY_MEGA = 'Hobby Mega';
const BLASTER = 'Blaster';
const FOTL = 'FOTL';
const RETAIL = 'Retail';
const ALL = 'All';

const parallels = [
  { name: 'Base', color_hex: '#FFFFFF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1, box_exclusivity: [ALL], description: 'Standard base card' },
  { name: 'Silver', color_hex: '#C0C0C0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 2, box_exclusivity: [ALL], description: 'Classic silver prizm finish' },
  { name: 'Mosaic', color_hex: '#B0C4DE', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 3, box_exclusivity: [HOBBY], description: 'Signature mosaic tile pattern' },
  { name: 'Red Mosaic', color_hex: '#CC0000', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 4, box_exclusivity: [RETAIL], description: 'Red mosaic tile pattern, retail exclusive' },
  { name: 'Green Mosaic', color_hex: '#228B22', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 5, box_exclusivity: [HOBBY], description: 'Green mosaic tile pattern' },
  { name: 'Reactive Blue Mosaic', color_hex: '#4682B4', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 6, box_exclusivity: [RETAIL_MEGA], description: 'Blue reactive shimmer, Retail Mega exclusive' },
  { name: 'Reactive Yellow Mosaic', color_hex: '#FFD700', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 7, box_exclusivity: [HOBBY], description: 'Yellow reactive shimmer mosaic' },
  { name: 'Camo Pink Mosaic', color_hex: '#E75480', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 8, box_exclusivity: [HOBBY], description: 'Pink camouflage mosaic pattern' },
  { name: 'Camo Red Mosaic', color_hex: '#8B0000', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 9, box_exclusivity: [HOBBY_MEGA], description: 'Red camo mosaic, Hobby Mega exclusive' },
  { name: 'Genesis Mosaic', color_hex: '#2E0854', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 10, box_exclusivity: [HOBBY], description: 'Dark swirling genesis pattern, highly sought after' },
  { name: 'Honeycomb', color_hex: '#DAA520', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 11, box_exclusivity: [HOBBY], description: 'Hexagonal honeycomb texture' },
  { name: 'Red Sparkle', color_hex: '#DC143C', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 12, box_exclusivity: [ALL], description: 'Red glitter sparkle finish' },
  { name: 'White Sparkle', color_hex: '#F5F5F5', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 13, box_exclusivity: [ALL], description: 'White glitter sparkle finish' },
  { name: 'No Huddle Silver Mosaic', color_hex: '#A9A9A9', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 14, box_exclusivity: [NO_HUDDLE], description: 'Silver mosaic, No Huddle exclusive' },
  { name: 'Choice Peacock Mosaic', color_hex: '#00A693', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 15, box_exclusivity: [CHOICE], description: 'Iridescent peacock pattern, Choice exclusive' },
  { name: 'Choice Red & Green', color_hex: '#CC3333', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 16, box_exclusivity: [CHOICE], description: 'Red and green mosaic, Choice exclusive' },
  { name: 'Orange Mosaic', color_hex: '#FF8C00', print_run: 199, serial_numbered: true, is_one_of_one: false, rarity_rank: 17, box_exclusivity: [HOBBY], description: 'Orange mosaic /199' },
  { name: 'Blue Mosaic', color_hex: '#0055BF', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 18, box_exclusivity: [HOBBY], description: 'Blue mosaic /99' },
  { name: 'Blue Sparkle Mosaic', color_hex: '#4169E1', print_run: 96, serial_numbered: true, is_one_of_one: false, rarity_rank: 19, box_exclusivity: [HOBBY], description: 'Blue sparkle glitter mosaic /96' },
  { name: 'Choice Fusion Red & Yellow Mosaic', color_hex: '#FF4500', print_run: 80, serial_numbered: true, is_one_of_one: false, rarity_rank: 20, box_exclusivity: [CHOICE], description: 'Fusion red/yellow, Choice exclusive /80' },
  { name: 'No Huddle Blue Mosaic', color_hex: '#1E90FF', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 21, box_exclusivity: [NO_HUDDLE], description: 'Blue mosaic, No Huddle exclusive /75' },
  { name: 'No Huddle Purple Mosaic', color_hex: '#7B2D8E', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 22, box_exclusivity: [NO_HUDDLE], description: 'Purple mosaic, No Huddle exclusive /50' },
  { name: 'Purple Mosaic', color_hex: '#6A0DAD', print_run: 49, serial_numbered: true, is_one_of_one: false, rarity_rank: 23, box_exclusivity: [HOBBY], description: 'Purple mosaic /49' },
  { name: 'Orange Fluorescent Mosaic', color_hex: '#FF5F1F', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 24, box_exclusivity: [BLASTER], description: 'Neon orange fluorescent, Blaster exclusive /25' },
  { name: 'White Mosaic', color_hex: '#F8F8FF', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 25, box_exclusivity: [HOBBY], description: 'White mosaic /25' },
  { name: 'Gold Sparkle Mosaic', color_hex: '#FFD700', print_run: 24, serial_numbered: true, is_one_of_one: false, rarity_rank: 26, box_exclusivity: [HOBBY], description: 'Gold sparkle glitter /24' },
  { name: 'No Huddle Pink Mosaic', color_hex: '#FF69B4', print_run: 20, serial_numbered: true, is_one_of_one: false, rarity_rank: 27, box_exclusivity: [NO_HUDDLE], description: 'Pink mosaic, No Huddle exclusive /20' },
  { name: 'Gold Wave Mosaic', color_hex: '#DAA520', print_run: 17, serial_numbered: true, is_one_of_one: false, rarity_rank: 28, box_exclusivity: [HOBBY], description: 'Gold wave pattern /17' },
  { name: 'Blue Fluorescent Mosaic', color_hex: '#1B03A3', print_run: 15, serial_numbered: true, is_one_of_one: false, rarity_rank: 29, box_exclusivity: [HOBBY], description: 'Neon blue fluorescent /15' },
  { name: 'Tessellation Mosaic', color_hex: '#9966CC', print_run: 15, serial_numbered: true, is_one_of_one: false, rarity_rank: 30, box_exclusivity: [HOBBY], description: 'Geometric tessellation pattern /15' },
  { name: 'Green Swirl Mosaic', color_hex: '#00AA44', print_run: 13, serial_numbered: true, is_one_of_one: false, rarity_rank: 31, box_exclusivity: [FOTL], description: 'Green swirl, FOTL exclusive /13' },
  { name: 'Pink Swirl Mosaic', color_hex: '#FF1493', print_run: 13, serial_numbered: true, is_one_of_one: false, rarity_rank: 32, box_exclusivity: [FOTL], description: 'Pink swirl, FOTL exclusive /13' },
  { name: 'Gold Mosaic', color_hex: '#FFD700', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 33, box_exclusivity: [HOBBY], description: 'Gold mosaic /10' },
  { name: 'Green Fluorescent Mosaic', color_hex: '#39FF14', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 34, box_exclusivity: [HOBBY], description: 'Neon green fluorescent /10' },
  { name: 'No Huddle Gold Mosaic', color_hex: '#FFD700', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 35, box_exclusivity: [NO_HUDDLE], description: 'Gold mosaic, No Huddle exclusive /10' },
  { name: 'Pink Fluorescent Mosaic', color_hex: '#FF10F0', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 36, box_exclusivity: [HOBBY], description: 'Neon pink fluorescent /10' },
  { name: 'Red Wave Mosaic', color_hex: '#CC0000', print_run: 9, serial_numbered: true, is_one_of_one: false, rarity_rank: 37, box_exclusivity: [HOBBY], description: 'Red wave pattern /9' },
  { name: 'Choice Black Gold Mosaic', color_hex: '#1A1A00', print_run: 8, serial_numbered: true, is_one_of_one: false, rarity_rank: 38, box_exclusivity: [CHOICE], description: 'Black/gold, Choice exclusive /8' },
  { name: 'Green Sparkle Mosaic', color_hex: '#00CC44', print_run: 8, serial_numbered: true, is_one_of_one: false, rarity_rank: 39, box_exclusivity: [HOBBY], description: 'Green sparkle glitter /8' },
  { name: 'Black Mosaic', color_hex: '#000000', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 40, box_exclusivity: [HOBBY], description: 'Black mosaic 1/1' },
  { name: 'Choice Nebula Mosaic', color_hex: '#1B0533', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 41, box_exclusivity: [CHOICE], description: 'Nebula galaxy 1/1, Choice exclusive' },
  { name: 'No Huddle Black Mosaic', color_hex: '#0D0D0D', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 42, box_exclusivity: [NO_HUDDLE], description: 'Black mosaic 1/1, No Huddle exclusive' },
];

async function main() {
  const total = parallels.length;
  console.log(`Seeding ${total} parallels for 2024 Mosaic NFL\n`);

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
