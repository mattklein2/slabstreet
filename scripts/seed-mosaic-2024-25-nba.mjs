#!/usr/bin/env node

/**
 * Seed 2024-25 Panini Mosaic Basketball parallel data.
 * Sources: Checklist Insider, Beckett, Checklist Center, OTIA, gogts.net, SI Collectibles.
 *
 * Usage:
 *   node scripts/seed-mosaic-2024-25-nba.mjs
 *   node scripts/seed-mosaic-2024-25-nba.mjs --dry-run
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

const PRODUCT_ID = 'c0000000-0000-0000-0000-00000000000b'; // 2024-25 Mosaic NBA

const HOBBY = 'Hobby';
const FOTL = 'FOTL';
const RETAIL = 'Retail';
const HOBBY_BLASTER = 'Hobby Blaster';
const CHOICE = 'Choice';
const FAST_BREAK = 'Fast Break';
const INTERNATIONAL = 'International';
const ALL = 'All';

const parallels = [
  // ─── UNNUMBERED / WIDE DISTRIBUTION ───
  { name: 'Base', color_hex: '#FFFFFF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1, box_exclusivity: [ALL], description: 'Standard base card, no parallel treatment' },
  { name: 'Silver Mosaic', color_hex: '#C0C0C0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 2, box_exclusivity: [ALL], description: 'Silver Prizm pattern; the classic Mosaic parallel' },
  { name: 'Premium', color_hex: '#D4AF37', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 3, box_exclusivity: [HOBBY, FOTL], description: 'Premium foil parallel exclusive to Hobby and FOTL' },
  { name: 'White Sparkle Mosaic', color_hex: '#F5F5F5', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 4, box_exclusivity: [ALL], description: 'White sparkle Prizm pattern; short-printed relative to Silver' },
  { name: 'Red Mosaic', color_hex: '#CC0000', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 5, box_exclusivity: [ALL], description: 'Red Prizm pattern; unnumbered' },
  { name: 'Green Mosaic', color_hex: '#2E8B57', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 6, box_exclusivity: [ALL], description: 'Green Prizm pattern; unnumbered' },
  { name: 'Reactive Blue Mosaic', color_hex: '#0055AA', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 7, box_exclusivity: [ALL], description: 'Reactive Blue Prizm pattern; unnumbered' },
  { name: 'Reactive Yellow Mosaic', color_hex: '#FFD700', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 8, box_exclusivity: [ALL], description: 'Reactive Yellow Prizm pattern; unnumbered' },
  { name: 'Glitter Mosaic', color_hex: '#E8C84A', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 9, box_exclusivity: [ALL], description: 'Glitter foil effect Prizm pattern; unnumbered' },
  { name: 'Genesis Mosaic', color_hex: '#7B2FBE', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 10, box_exclusivity: [RETAIL], description: 'Retail-exclusive short-printed Genesis Prizm pattern' },
  { name: 'Green Ice Mosaic', color_hex: '#00C878', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 11, box_exclusivity: [HOBBY_BLASTER], description: 'Hobby Blaster-exclusive Green Ice Prizm pattern; unnumbered' },
  { name: 'Honeycomb Mosaic', color_hex: '#E8A020', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 12, box_exclusivity: [HOBBY], description: 'Hobby-exclusive Honeycomb pattern; new for 2024-25' },

  // ─── NUMBERED — WIDE DISTRIBUTION ───
  { name: 'Red Seismic Mosaic', color_hex: '#990000', print_run: 299, serial_numbered: true, is_one_of_one: false, rarity_rank: 13, box_exclusivity: [ALL], description: 'Red Seismic wave pattern /299' },
  { name: 'Orange Mosaic', color_hex: '#FF6600', print_run: 249, serial_numbered: true, is_one_of_one: false, rarity_rank: 14, box_exclusivity: [HOBBY, FOTL], description: 'Orange Prizm pattern /249, Hobby/FOTL exclusive' },
  { name: 'Purple Fluorescent Mosaic', color_hex: '#9B59B6', print_run: 249, serial_numbered: true, is_one_of_one: false, rarity_rank: 15, box_exclusivity: [ALL], description: 'Purple Fluorescent Prizm /249' },
  { name: 'Blue Mosaic', color_hex: '#1E6BB0', print_run: 199, serial_numbered: true, is_one_of_one: false, rarity_rank: 16, box_exclusivity: [ALL], description: 'Blue Prizm pattern /199' },
  { name: 'Pink Mosaic', color_hex: '#FF69B4', print_run: 175, serial_numbered: true, is_one_of_one: false, rarity_rank: 17, box_exclusivity: [ALL], description: 'Pink Prizm pattern /175' },
  { name: 'Blue Seismic Mosaic', color_hex: '#1A4C8B', print_run: 149, serial_numbered: true, is_one_of_one: false, rarity_rank: 18, box_exclusivity: [ALL], description: 'Blue Seismic wave pattern /149' },
  { name: 'Ice Mosaic', color_hex: '#A8D8EA', print_run: 125, serial_numbered: true, is_one_of_one: false, rarity_rank: 19, box_exclusivity: [ALL], description: 'Ice Prizm pattern /125' },
  { name: 'Purple Mosaic', color_hex: '#6A0DAD', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 20, box_exclusivity: [ALL], description: 'Purple Prizm pattern /99' },
  { name: 'Blue Fluorescent Mosaic', color_hex: '#0080FF', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 21, box_exclusivity: [ALL], description: 'Blue Fluorescent Prizm /75' },
  { name: 'Bronze Mosaic', color_hex: '#CD7F32', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 22, box_exclusivity: [HOBBY, FOTL], description: 'Bronze Prizm pattern /75, Hobby/FOTL exclusive' },
  { name: 'Red Fluorescent Mosaic', color_hex: '#FF2400', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 23, box_exclusivity: [ALL], description: 'Red Fluorescent Prizm /75' },
  { name: 'Orange Ice Mosaic', color_hex: '#FF8C42', print_run: 49, serial_numbered: true, is_one_of_one: false, rarity_rank: 24, box_exclusivity: [HOBBY_BLASTER], description: 'Hobby Blaster-exclusive Orange Ice Prizm /49. New for 2024-25' },
  { name: 'Orange Fluorescent Mosaic', color_hex: '#FF6000', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 25, box_exclusivity: [ALL], description: 'Orange Fluorescent Prizm /25' },
  { name: 'White Mosaic', color_hex: '#F0F0F0', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 26, box_exclusivity: [ALL], description: 'White Prizm pattern /25' },
  { name: 'Purple Snakeskin Mosaic', color_hex: '#5B2D8E', print_run: 24, serial_numbered: true, is_one_of_one: false, rarity_rank: 27, box_exclusivity: [HOBBY, FOTL], description: 'Purple Snakeskin texture /24, Hobby/FOTL exclusive' },
  { name: 'Tessellation Mosaic', color_hex: '#3A7D44', print_run: 15, serial_numbered: true, is_one_of_one: false, rarity_rank: 28, box_exclusivity: [HOBBY, FOTL], description: 'Tessellation geometric pattern /15, Hobby/FOTL exclusive' },
  { name: 'Gold Mosaic', color_hex: '#CFB53B', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 29, box_exclusivity: [ALL], description: 'Gold Prizm pattern /10' },
  { name: 'Green Fluorescent Mosaic', color_hex: '#00FF40', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 30, box_exclusivity: [ALL], description: 'Green Fluorescent Prizm /10' },
  { name: 'Pink Fluorescent Mosaic', color_hex: '#FF1493', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 31, box_exclusivity: [ALL], description: 'Pink Fluorescent Prizm /10' },
  { name: 'Gold Snakeskin Mosaic', color_hex: '#B8860B', print_run: 8, serial_numbered: true, is_one_of_one: false, rarity_rank: 32, box_exclusivity: [HOBBY, FOTL], description: 'Gold Snakeskin texture /8, Hobby/FOTL exclusive' },
  { name: 'Lucky Envelopes Mosaic', color_hex: '#C8102E', print_run: 8, serial_numbered: true, is_one_of_one: false, rarity_rank: 33, box_exclusivity: [ALL], description: 'Lucky Envelopes red pattern (Lunar New Year theme) /8' },
  { name: 'Gold Glitter Mosaic', color_hex: '#FFD700', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 34, box_exclusivity: [ALL], description: 'Gold Glitter Prizm /5' },
  { name: 'Black Mosaic', color_hex: '#1A1A1A', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 35, box_exclusivity: [ALL], description: 'Black Prizm 1/1' },

  // ─── FOTL EXCLUSIVES ───
  { name: 'Spectris Blue Mosaic', color_hex: '#4169E1', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 36, box_exclusivity: [FOTL], description: 'FOTL-exclusive Spectris Blue Prizm /25' },
  { name: 'Spectris Gold Mosaic', color_hex: '#DAA520', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 37, box_exclusivity: [FOTL], description: 'FOTL-exclusive Spectris Gold Prizm /10' },
  { name: 'Spectris Green Mosaic', color_hex: '#228B22', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 38, box_exclusivity: [FOTL], description: 'FOTL-exclusive Spectris Green Prizm /5' },
  { name: 'Spectris Gold Vinyl Mosaic', color_hex: '#FFC200', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 39, box_exclusivity: [FOTL], description: 'FOTL-exclusive Spectris Gold Vinyl 1/1' },

  // ─── CHOICE BOX EXCLUSIVES ───
  { name: 'Choice Peacock Mosaic', color_hex: '#00897B', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 40, box_exclusivity: [CHOICE], description: 'Choice-exclusive Peacock Prizm pattern; unnumbered SP' },
  { name: 'Choice Astral Mosaic', color_hex: '#1B2A4A', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 41, box_exclusivity: [CHOICE], description: 'Choice-exclusive Astral Prizm; unnumbered SP, Rookies only' },
  { name: 'Choice Fusion Red and Yellow Mosaic', color_hex: '#FF4500', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 42, box_exclusivity: [CHOICE], description: 'Choice-exclusive Fusion Red/Yellow Prizm /75' },
  { name: 'Choice Blue Mosaic', color_hex: '#0047AB', print_run: 45, serial_numbered: true, is_one_of_one: false, rarity_rank: 43, box_exclusivity: [CHOICE], description: 'Choice-exclusive Blue Prizm /45. New for 2024-25' },
  { name: 'Choice White Mosaic', color_hex: '#E8E8E8', print_run: 35, serial_numbered: true, is_one_of_one: false, rarity_rank: 44, box_exclusivity: [CHOICE], description: 'Choice-exclusive White Prizm /35. New for 2024-25' },
  { name: 'Choice Cherry Blossom Mosaic', color_hex: '#FFB7C5', print_run: 20, serial_numbered: true, is_one_of_one: false, rarity_rank: 45, box_exclusivity: [CHOICE], description: 'Choice-exclusive Cherry Blossom Prizm /20. New for 2024-25' },
  { name: 'Choice Black Gold Mosaic', color_hex: '#2C2C2C', print_run: 8, serial_numbered: true, is_one_of_one: false, rarity_rank: 46, box_exclusivity: [CHOICE], description: 'Choice-exclusive Black Gold Prizm /8' },
  { name: 'Choice Nebula Mosaic', color_hex: '#0D0221', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 47, box_exclusivity: [CHOICE], description: 'Choice-exclusive Nebula Prizm 1/1' },

  // ─── FAST BREAK BOX EXCLUSIVES ───
  { name: 'Fast Break Silver Mosaic', color_hex: '#B8B8B8', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 48, box_exclusivity: [FAST_BREAK], description: 'Fast Break-exclusive Silver Prizm; unnumbered' },
  { name: 'Fast Break Red Mosaic', color_hex: '#DD0000', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 49, box_exclusivity: [FAST_BREAK], description: 'Fast Break-exclusive Red Prizm /99. New for 2024-25' },
  { name: 'Fast Break Blue Mosaic', color_hex: '#003DA5', print_run: 85, serial_numbered: true, is_one_of_one: false, rarity_rank: 50, box_exclusivity: [FAST_BREAK], description: 'Fast Break-exclusive Blue Prizm /85' },
  { name: 'Fast Break Purple Mosaic', color_hex: '#7B0D8C', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 51, box_exclusivity: [FAST_BREAK], description: 'Fast Break-exclusive Purple Prizm /50' },
  { name: 'Fast Break Blue Camo Mosaic', color_hex: '#4A6FA5', print_run: 35, serial_numbered: true, is_one_of_one: false, rarity_rank: 52, box_exclusivity: [FAST_BREAK], description: 'Fast Break-exclusive Blue Camo Prizm /35' },
  { name: 'Fast Break Pink Mosaic', color_hex: '#FF85A2', print_run: 20, serial_numbered: true, is_one_of_one: false, rarity_rank: 53, box_exclusivity: [FAST_BREAK], description: 'Fast Break-exclusive Pink Prizm /20' },
  { name: 'Fast Break Gold Mosaic', color_hex: '#C9A82C', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 54, box_exclusivity: [FAST_BREAK], description: 'Fast Break-exclusive Gold Prizm /10' },
  { name: 'Fast Break Neon Green Mosaic', color_hex: '#39FF14', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 55, box_exclusivity: [FAST_BREAK], description: 'Fast Break-exclusive Neon Green Prizm /5' },
  { name: 'Fast Break Gold Black Mosaic', color_hex: '#8B7536', print_run: 3, serial_numbered: true, is_one_of_one: false, rarity_rank: 56, box_exclusivity: [FAST_BREAK], description: 'Fast Break-exclusive Gold Black Prizm /3' },
  { name: 'Fast Break Black Mosaic', color_hex: '#111111', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 57, box_exclusivity: [FAST_BREAK], description: 'Fast Break-exclusive Black Prizm 1/1' },

  // ─── INTERNATIONAL HOBBY BOX EXCLUSIVES ───
  { name: 'International Mosaic', color_hex: '#4682B4', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 58, box_exclusivity: [INTERNATIONAL], description: 'International Hobby box-exclusive base Prizm; unnumbered' },
  { name: 'Year of the Snake Mosaic', color_hex: '#8B1A1A', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 59, box_exclusivity: [INTERNATIONAL], description: 'International-exclusive Year of the Snake Prizm; unnumbered, Lunar New Year theme' },
  { name: 'International Red Mosaic', color_hex: '#B22222', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 60, box_exclusivity: [INTERNATIONAL], description: 'International-exclusive Red Prizm /75' },
  { name: 'International Blue Mosaic', color_hex: '#1560BD', print_run: 35, serial_numbered: true, is_one_of_one: false, rarity_rank: 61, box_exclusivity: [INTERNATIONAL], description: 'International-exclusive Blue Prizm /35' },
  { name: 'International White Mosaic', color_hex: '#DCDCDC', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 62, box_exclusivity: [INTERNATIONAL], description: 'International-exclusive White Prizm /25' },
  { name: 'International Green Mosaic', color_hex: '#228B22', print_run: 15, serial_numbered: true, is_one_of_one: false, rarity_rank: 63, box_exclusivity: [INTERNATIONAL], description: 'International-exclusive Green Prizm /15' },
  { name: 'International Gold Mosaic', color_hex: '#B8960C', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 64, box_exclusivity: [INTERNATIONAL], description: 'International-exclusive Gold Prizm /10' },
  { name: 'International Black Mosaic', color_hex: '#0A0A0A', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 65, box_exclusivity: [INTERNATIONAL], description: 'International-exclusive Black Prizm 1/1' },
];

async function main() {
  const total = parallels.length;
  console.log(`Seeding ${total} parallels for 2024-25 Mosaic NBA\n`);

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
