#!/usr/bin/env node

/**
 * Seed 2024 Panini Select Football parallel data.
 * Sources: Beckett, Checklist Insider, DA Card World.
 *
 * Usage:
 *   node scripts/seed-select-2024-nfl.mjs
 *   node scripts/seed-select-2024-nfl.mjs --dry-run
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

const PRODUCT_ID = 'c0000000-0000-0000-0000-00000000000e'; // 2024 Select NFL

const HOBBY = 'Hobby';
const H2 = 'H2';
const HOBBY_BLASTER = 'Hobby Blaster';
const HOBBY_MEGA = 'Hobby Mega';
const HOBBY_INTL = 'Hobby International';
const FOTL = 'FOTL';
const ALL = 'All';

const parallels = [
  { name: 'Base', color_hex: '#FFFFFF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1, box_exclusivity: [ALL], description: 'Standard base card' },
  { name: 'Silver Prizm', color_hex: '#C0C0C0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 2, box_exclusivity: [ALL], description: 'Classic silver refractor finish' },
  { name: 'Disco Prizm', color_hex: '#E8D0F0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 3, box_exclusivity: [HOBBY], description: 'Disco ball shimmer pattern' },
  { name: 'Cosmic Prizm', color_hex: '#1B0533', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 4, box_exclusivity: [ALL], description: 'Deep space/galaxy pattern effect' },
  { name: 'White Sparkle', color_hex: '#F5F5F5', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 5, box_exclusivity: [ALL], description: 'White glitter sparkle finish' },
  { name: 'Zebra Prizm', color_hex: '#3D3D3D', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 6, box_exclusivity: [ALL], description: 'Black and white zebra stripe pattern' },
  { name: 'Zebra Prizm Shock', color_hex: '#4A4A4A', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 7, box_exclusivity: [ALL], description: 'Zebra stripe with electric shock effect' },
  { name: 'Tiger Prizm', color_hex: '#FF8C00', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 8, box_exclusivity: [FOTL], description: 'Orange/black tiger stripe pattern, FOTL exclusive' },
  { name: 'Silver Prizm Die-Cut', color_hex: '#C0C0C0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 9, box_exclusivity: [ALL], description: 'Silver refractor with die-cut edge shape' },
  { name: 'Black & Blue Prizm Shock', color_hex: '#000080', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 10, box_exclusivity: [HOBBY], description: 'Black and blue two-tone shock finish' },
  { name: 'Black & Gold Prizm Shock', color_hex: '#1A1A00', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 11, box_exclusivity: [HOBBY], description: 'Black and gold two-tone shock finish' },
  { name: 'Black & Green Prizm Shock', color_hex: '#003300', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 12, box_exclusivity: [HOBBY], description: 'Black and green two-tone shock finish' },
  { name: 'Black & Orange Prizm Shock', color_hex: '#1A0A00', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 13, box_exclusivity: [HOBBY_MEGA], description: 'Black and orange shock, Hobby Mega exclusive' },
  { name: 'Black & Red Prizm Shock', color_hex: '#330000', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 14, box_exclusivity: [HOBBY], description: 'Black and red two-tone shock finish' },
  { name: 'Green & Red Prizm Shock', color_hex: '#228B22', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 15, box_exclusivity: [HOBBY_BLASTER], description: 'Green and red shock, Hobby Blaster exclusive' },
  { name: 'Green & Yellow Prizm Shock', color_hex: '#6B8E23', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 16, box_exclusivity: [HOBBY], description: 'Green and yellow two-tone shock finish' },
  { name: 'Red & Blue Prizm Shock', color_hex: '#8B0000', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 17, box_exclusivity: [HOBBY], description: 'Red and blue two-tone shock finish' },
  { name: 'Red & Yellow Prizm Shock', color_hex: '#CC3300', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 18, box_exclusivity: [HOBBY], description: 'Red and yellow two-tone shock finish' },
  { name: 'Neon Green Prizm Shock', color_hex: '#39FF14', print_run: 599, serial_numbered: true, is_one_of_one: false, rarity_rank: 19, box_exclusivity: [ALL], description: 'Bright neon green shock finish /599' },
  { name: 'Orange Prizm Shock', color_hex: '#FF6600', print_run: 499, serial_numbered: true, is_one_of_one: false, rarity_rank: 20, box_exclusivity: [ALL], description: 'Vibrant orange shock finish /499' },
  { name: 'Purple Prizm Shock', color_hex: '#7B2D8E', print_run: 360, serial_numbered: true, is_one_of_one: false, rarity_rank: 21, box_exclusivity: [ALL], description: 'Purple shock finish /360' },
  { name: 'Tri-Color Prizm', color_hex: '#CC0033', print_run: 299, serial_numbered: true, is_one_of_one: false, rarity_rank: 22, box_exclusivity: [HOBBY], description: 'Three-color refractor pattern /299' },
  { name: 'Copper Prizm Shock', color_hex: '#B87333', print_run: 299, serial_numbered: true, is_one_of_one: false, rarity_rank: 23, box_exclusivity: [ALL], description: 'Copper metallic shock finish /299' },
  { name: 'Blue Prizm', color_hex: '#0055BF', print_run: 249, serial_numbered: true, is_one_of_one: false, rarity_rank: 24, box_exclusivity: [ALL], description: 'Solid blue refractor /249' },
  { name: 'Red Prizm Shock', color_hex: '#FF0000', print_run: 249, serial_numbered: true, is_one_of_one: false, rarity_rank: 25, box_exclusivity: [ALL], description: 'Red shock finish /249' },
  { name: 'White Prizm Shock', color_hex: '#F0F0F0', print_run: 199, serial_numbered: true, is_one_of_one: false, rarity_rank: 26, box_exclusivity: [ALL], description: 'White shock finish /199' },
  { name: 'Maroon Prizm', color_hex: '#800000', print_run: 149, serial_numbered: true, is_one_of_one: false, rarity_rank: 27, box_exclusivity: [ALL], description: 'Deep maroon refractor /149' },
  { name: 'Red Prizm', color_hex: '#CC0000', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 28, box_exclusivity: [ALL], description: 'Solid red refractor /99' },
  { name: 'Dragon Scale Prizm', color_hex: '#4B0082', print_run: 81, serial_numbered: true, is_one_of_one: false, rarity_rank: 29, box_exclusivity: [HOBBY_INTL], description: 'Dragon scale texture, International exclusive /81' },
  { name: 'Purple Prizm', color_hex: '#6A0DAD', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 30, box_exclusivity: [ALL], description: 'Solid purple refractor /75' },
  { name: 'Orange Prizm', color_hex: '#FF8C00', print_run: 49, serial_numbered: true, is_one_of_one: false, rarity_rank: 31, box_exclusivity: [ALL], description: 'Solid orange refractor /49' },
  { name: 'Red Disco Prizm', color_hex: '#DC143C', print_run: 49, serial_numbered: true, is_one_of_one: false, rarity_rank: 32, box_exclusivity: [H2], description: 'Red disco shimmer, H2 exclusive /49' },
  { name: 'Blue & Orange Prizm Shock', color_hex: '#1E90FF', print_run: 35, serial_numbered: true, is_one_of_one: false, rarity_rank: 33, box_exclusivity: [ALL], description: 'Blue and orange two-tone shock /35' },
  { name: 'White Prizm', color_hex: '#FAFAFA', print_run: 35, serial_numbered: true, is_one_of_one: false, rarity_rank: 34, box_exclusivity: [ALL], description: 'Solid white refractor /35' },
  { name: 'Blue Disco Prizm', color_hex: '#4169E1', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 35, box_exclusivity: [H2], description: 'Blue disco shimmer, H2 exclusive /25' },
  { name: 'Tie-Dye Prizm', color_hex: '#FF69B4', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 36, box_exclusivity: [ALL], description: 'Multi-color tie-dye swirl /25' },
  { name: 'Tie-Dye Prizm Shock', color_hex: '#DA70D6', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 37, box_exclusivity: [ALL], description: 'Tie-dye with shock effect /25' },
  { name: 'Pink Glitter Prizm', color_hex: '#FF69B4', print_run: 15, serial_numbered: true, is_one_of_one: false, rarity_rank: 38, box_exclusivity: [ALL], description: 'Pink glitter sparkle /15' },
  { name: 'Gold Disco Prizm', color_hex: '#FFD700', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 39, box_exclusivity: [H2], description: 'Gold disco shimmer, H2 exclusive /10' },
  { name: 'Gold Dragon Scale Prizm', color_hex: '#DAA520', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 40, box_exclusivity: [HOBBY_INTL], description: 'Gold dragon scale, International exclusive /10' },
  { name: 'Gold Prizm', color_hex: '#FFD700', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 41, box_exclusivity: [ALL], description: 'Solid gold refractor /10' },
  { name: 'Gold Prizm Shock', color_hex: '#FFC200', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 42, box_exclusivity: [ALL], description: 'Gold shock finish /10' },
  { name: 'Pink Prizm', color_hex: '#FF1493', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 43, box_exclusivity: [ALL], description: 'Solid pink refractor /10' },
  { name: 'Neon Orange Pulsar Prizm', color_hex: '#FF4500', print_run: 7, serial_numbered: true, is_one_of_one: false, rarity_rank: 44, box_exclusivity: [FOTL], description: 'Neon orange pulsar, FOTL exclusive /7' },
  { name: 'Green Disco Prizm', color_hex: '#00CC44', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 45, box_exclusivity: [H2], description: 'Green disco shimmer, H2 exclusive /5' },
  { name: 'Green Prizm', color_hex: '#008000', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 46, box_exclusivity: [ALL], description: 'Solid green refractor /5' },
  { name: 'Green Prizm Shock', color_hex: '#00A550', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 47, box_exclusivity: [ALL], description: 'Green shock finish /5' },
  { name: 'Green & Black Snakeskin Prizm', color_hex: '#006400', print_run: 2, serial_numbered: true, is_one_of_one: false, rarity_rank: 48, box_exclusivity: [ALL], description: 'Green/black snakeskin texture /2' },
  { name: 'Black Disco Prizm', color_hex: '#1A1A1A', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 49, box_exclusivity: [H2], description: 'Black disco shimmer 1/1, H2 exclusive' },
  { name: 'Black Dragon Scale Prizm', color_hex: '#0D0D0D', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 50, box_exclusivity: [HOBBY_INTL], description: 'Black dragon scale 1/1, International exclusive' },
  { name: 'Black Prizm', color_hex: '#000000', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 51, box_exclusivity: [ALL], description: 'Solid black refractor 1/1' },
  { name: 'Black Prizm Shock', color_hex: '#0A0A0A', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 52, box_exclusivity: [ALL], description: 'Black shock finish 1/1' },
];

async function main() {
  const total = parallels.length;
  console.log(`Seeding ${total} parallels for 2024 Select NFL\n`);

  if (DRY_RUN) {
    console.log('DRY RUN — no changes made.');
    parallels.forEach((p, i) => console.log(`  ${i + 1}. ${p.name} ${p.print_run ? '/' + p.print_run : '(unnumbered)'}`));
    return;
  }

  // Delete existing parallels for this product
  const { error: delError } = await supabase
    .from('parallels')
    .delete()
    .eq('product_id', PRODUCT_ID);
  if (delError) console.warn('Delete warning:', delError.message);

  // Insert in batches
  const BATCH_SIZE = 50;
  let inserted = 0;
  for (let i = 0; i < parallels.length; i += BATCH_SIZE) {
    const batch = parallels.slice(i, i + BATCH_SIZE).map(p => ({
      product_id: PRODUCT_ID,
      ...p,
    }));
    const { error } = await supabase.from('parallels').insert(batch);
    if (error) {
      console.error(`Batch error at ${i}:`, error.message);
    } else {
      inserted += batch.length;
    }
  }

  console.log(`Inserted ${inserted}/${total} parallels`);

  // Verify
  const { count } = await supabase
    .from('parallels')
    .select('*', { count: 'exact', head: true })
    .eq('product_id', PRODUCT_ID);
  console.log(`Verified: ${count} parallels in DB for this product`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
