#!/usr/bin/env node

/**
 * Seed 2025 Panini Select Football parallel data.
 * Sources: Checklist Insider, Beckett, gogts.net.
 *
 * Usage:
 *   node scripts/seed-select-2025-nfl.mjs
 *   node scripts/seed-select-2025-nfl.mjs --dry-run
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

const PRODUCT_ID = 'c0000000-0000-0000-0000-000000000021'; // 2025 Select NFL

const HOBBY = 'Hobby';
const FOTL = 'FOTL';
const H2 = 'H2';
const HOBBY_BLASTER = 'Hobby Blaster';
const HOBBY_MEGA = 'Hobby Mega';
const ALL = 'All';

const parallels = [
  // ─── UNNUMBERED ───
  { name: 'Cosmic', color_hex: '#9B59B6', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1, box_exclusivity: [HOBBY, FOTL, H2, HOBBY_BLASTER, HOBBY_MEGA], description: 'Cosmic-patterned Prizm; unnumbered' },
  { name: 'White Sparkle', color_hex: '#F5F5F5', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 2, box_exclusivity: [HOBBY, FOTL, H2, HOBBY_BLASTER, HOBBY_MEGA], description: 'White sparkle refractor; unnumbered' },
  { name: 'Silver Prizm', color_hex: '#C0C0C0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 3, box_exclusivity: [HOBBY, FOTL, H2], description: 'Flagship silver refractor; unnumbered' },
  { name: 'Silver Prizm Shock', color_hex: '#A9A9A9', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 4, box_exclusivity: [HOBBY_BLASTER, HOBBY_MEGA], description: 'Silver Shock lightning pattern; Blaster/Mega exclusive' },
  { name: 'Tiger Prizm', color_hex: '#FF8C00', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 5, box_exclusivity: [FOTL], description: 'Orange tiger-stripe refractor; FOTL exclusive' },
  { name: 'Disco Prizm', color_hex: '#FF69B4', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 6, box_exclusivity: [H2], description: 'Multicolor disco-pattern refractor; H2 exclusive' },
  { name: 'Zebra Prizm', color_hex: '#1A1A1A', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 7, box_exclusivity: [HOBBY, FOTL, H2], description: 'Black-and-white zebra stripe refractor' },
  { name: 'Zebra Prizm Shock', color_hex: '#2C2C2C', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 8, box_exclusivity: [HOBBY, FOTL, H2, HOBBY_BLASTER, HOBBY_MEGA], description: 'Zebra stripe with Shock lightning pattern' },
  { name: 'Black & Blue Prizm Shock', color_hex: '#1C2B5E', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 9, box_exclusivity: [HOBBY, FOTL, H2, HOBBY_BLASTER, HOBBY_MEGA], description: 'Black/blue Shock pattern' },
  { name: 'Black & Gold Prizm Shock', color_hex: '#B8860B', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 10, box_exclusivity: [HOBBY, FOTL, H2, HOBBY_BLASTER, HOBBY_MEGA], description: 'Black/gold Shock pattern' },
  { name: 'Black & Green Prizm Shock', color_hex: '#006400', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 11, box_exclusivity: [HOBBY, FOTL, H2, HOBBY_BLASTER, HOBBY_MEGA], description: 'Black/green Shock pattern' },
  { name: 'Black & Orange Prizm Shock', color_hex: '#FF4500', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 12, box_exclusivity: [HOBBY_MEGA], description: 'Black/orange Shock; Mega featured (10 per box)' },
  { name: 'Black & Red Prizm Shock', color_hex: '#8B0000', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 13, box_exclusivity: [HOBBY, FOTL, H2, HOBBY_BLASTER, HOBBY_MEGA], description: 'Black/red Shock pattern' },
  { name: 'Green & Red Prizm Shock', color_hex: '#C41E3A', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 14, box_exclusivity: [HOBBY_BLASTER], description: 'Green/red Shock; Blaster featured (3 per box)' },
  { name: 'Green & Yellow Prizm Shock', color_hex: '#9ACD32', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 15, box_exclusivity: [HOBBY, FOTL, H2, HOBBY_BLASTER, HOBBY_MEGA], description: 'Green/yellow Shock pattern' },
  { name: 'Pink Prizm Shock', color_hex: '#FF69B4', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 16, box_exclusivity: [HOBBY, FOTL, H2, HOBBY_BLASTER, HOBBY_MEGA], description: 'Pink Shock pattern' },
  { name: 'Red & Blue Prizm Shock', color_hex: '#3C3CFF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 17, box_exclusivity: [HOBBY, FOTL, H2, HOBBY_BLASTER, HOBBY_MEGA], description: 'Red/blue Shock pattern' },

  // ─── NUMBERED ───
  { name: 'Copper Prizm Shock', color_hex: '#B87333', print_run: 899, serial_numbered: true, is_one_of_one: false, rarity_rank: 18, box_exclusivity: [HOBBY, FOTL, H2, HOBBY_BLASTER, HOBBY_MEGA], description: 'Copper Shock pattern /899' },
  { name: 'White Prizm Shock', color_hex: '#E8E8E8', print_run: 799, serial_numbered: true, is_one_of_one: false, rarity_rank: 19, box_exclusivity: [HOBBY, FOTL, H2, HOBBY_BLASTER, HOBBY_MEGA], description: 'White Shock pattern /799' },
  { name: 'Neon Green Prizm Shock', color_hex: '#39FF14', print_run: 699, serial_numbered: true, is_one_of_one: false, rarity_rank: 20, box_exclusivity: [HOBBY, FOTL, H2, HOBBY_BLASTER, HOBBY_MEGA], description: 'Neon green Shock pattern /699' },
  { name: 'Purple Prizm Shock', color_hex: '#800080', print_run: 699, serial_numbered: true, is_one_of_one: false, rarity_rank: 21, box_exclusivity: [HOBBY, FOTL, H2, HOBBY_BLASTER, HOBBY_MEGA], description: 'Purple Shock pattern /699' },
  { name: 'Orange Prizm Shock', color_hex: '#FF8C00', print_run: 499, serial_numbered: true, is_one_of_one: false, rarity_rank: 22, box_exclusivity: [HOBBY, FOTL, H2, HOBBY_BLASTER, HOBBY_MEGA], description: 'Orange Shock pattern /499' },
  { name: 'Tri-Color Prizm', color_hex: '#FF4500', print_run: 399, serial_numbered: true, is_one_of_one: false, rarity_rank: 23, box_exclusivity: [HOBBY, FOTL, H2], description: 'Three-color stripe Prizm /399' },
  { name: 'Blue Prizm', color_hex: '#1E90FF', print_run: 249, serial_numbered: true, is_one_of_one: false, rarity_rank: 24, box_exclusivity: [HOBBY, FOTL, H2], description: 'Blue refractor /249' },
  { name: 'Red Prizm Shock', color_hex: '#DC143C', print_run: 249, serial_numbered: true, is_one_of_one: false, rarity_rank: 25, box_exclusivity: [HOBBY, FOTL, H2, HOBBY_BLASTER, HOBBY_MEGA], description: 'Red Shock pattern /249' },
  { name: 'Maroon Prizm', color_hex: '#800000', print_run: 149, serial_numbered: true, is_one_of_one: false, rarity_rank: 26, box_exclusivity: [HOBBY, FOTL, H2], description: 'Maroon refractor /149' },
  { name: 'Red Prizm', color_hex: '#FF0000', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 27, box_exclusivity: [HOBBY, FOTL, H2], description: 'Red refractor /99' },
  { name: 'Purple Prizm', color_hex: '#9400D3', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 28, box_exclusivity: [HOBBY, FOTL, H2], description: 'Purple refractor /75' },
  { name: 'Dragon Scale Prizm', color_hex: '#2E8B57', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 29, box_exclusivity: [HOBBY, FOTL, H2], description: 'Dragon scale texture refractor /50' },
  { name: 'Orange Prizm', color_hex: '#FF6600', print_run: 49, serial_numbered: true, is_one_of_one: false, rarity_rank: 30, box_exclusivity: [HOBBY, FOTL, H2], description: 'Orange refractor /49' },
  { name: 'Red Disco Prizm', color_hex: '#CC0000', print_run: 49, serial_numbered: true, is_one_of_one: false, rarity_rank: 31, box_exclusivity: [H2], description: 'Red disco pattern; H2 exclusive /49' },
  { name: 'Blue & Orange Prizm Shock', color_hex: '#FF8C00', print_run: 35, serial_numbered: true, is_one_of_one: false, rarity_rank: 32, box_exclusivity: [HOBBY, FOTL, H2, HOBBY_BLASTER, HOBBY_MEGA], description: 'Blue/orange Shock pattern /35' },
  { name: 'White Prizm', color_hex: '#FFFFFF', print_run: 35, serial_numbered: true, is_one_of_one: false, rarity_rank: 33, box_exclusivity: [HOBBY, FOTL, H2], description: 'White refractor /35' },
  { name: 'Blue Disco Prizm', color_hex: '#0000CD', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 34, box_exclusivity: [H2], description: 'Blue disco pattern; H2 exclusive /25' },
  { name: 'Tie-Dye Prizm', color_hex: '#FF1493', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 35, box_exclusivity: [HOBBY, FOTL, H2], description: 'Tie-dye multicolor swirl /25' },
  { name: 'Tie-Dye Prizm Shock', color_hex: '#DA70D6', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 36, box_exclusivity: [HOBBY, FOTL, H2, HOBBY_BLASTER, HOBBY_MEGA], description: 'Tie-dye Shock pattern /25' },
  { name: 'Pink Glitter Prizm', color_hex: '#FF69B4', print_run: 15, serial_numbered: true, is_one_of_one: false, rarity_rank: 37, box_exclusivity: [HOBBY, FOTL, H2], description: 'Pink glitter-texture refractor /15' },
  { name: 'Gold Disco Prizm', color_hex: '#FFD700', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 38, box_exclusivity: [H2], description: 'Gold disco pattern; H2 exclusive /10' },
  { name: 'Gold Dragon Scale Prizm', color_hex: '#DAA520', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 39, box_exclusivity: [HOBBY, FOTL, H2], description: 'Gold dragon scale texture /10' },
  { name: 'Gold Prizm', color_hex: '#FFD700', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 40, box_exclusivity: [HOBBY, FOTL, H2], description: 'Gold refractor /10' },
  { name: 'Gold Prizm Shock', color_hex: '#B8860B', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 41, box_exclusivity: [HOBBY, FOTL, H2, HOBBY_BLASTER, HOBBY_MEGA], description: 'Gold Shock pattern /10' },
  { name: 'Pink Prizm', color_hex: '#FF1493', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 42, box_exclusivity: [HOBBY, FOTL, H2], description: 'Pink refractor /10' },
  { name: 'Lucky Envelope Prizm', color_hex: '#CC0000', print_run: 8, serial_numbered: true, is_one_of_one: false, rarity_rank: 43, box_exclusivity: [HOBBY, FOTL, H2], description: 'Red lucky envelope design /8' },
  { name: 'Neon Orange Pulsar Prizm', color_hex: '#FF4500', print_run: 7, serial_numbered: true, is_one_of_one: false, rarity_rank: 44, box_exclusivity: [HOBBY, FOTL], description: 'Neon orange pulsar /7; FOTL exclusive' },
  { name: 'Green Disco Prizm', color_hex: '#00A550', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 45, box_exclusivity: [H2], description: 'Green disco pattern; H2 exclusive /5' },
  { name: 'Green Prizm', color_hex: '#008000', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 46, box_exclusivity: [HOBBY, FOTL, H2], description: 'Green refractor /5' },
  { name: 'Green Prizm Shock', color_hex: '#228B22', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 47, box_exclusivity: [HOBBY, FOTL, H2, HOBBY_BLASTER, HOBBY_MEGA], description: 'Green Shock pattern /5' },
  { name: 'Green & Black Snakeskin Prizm', color_hex: '#013220', print_run: 2, serial_numbered: true, is_one_of_one: false, rarity_rank: 48, box_exclusivity: [HOBBY, FOTL, H2], description: 'Green/black snakeskin texture /2' },

  // ─── 1/1s ───
  { name: 'Black Disco Prizm', color_hex: '#0D0D0D', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 49, box_exclusivity: [H2], description: 'Black disco; H2 exclusive 1/1' },
  { name: 'Black Dragon Scale Prizm', color_hex: '#111111', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 50, box_exclusivity: [HOBBY, FOTL, H2], description: 'Black dragon scale 1/1' },
  { name: 'Black Prizm', color_hex: '#000000', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 51, box_exclusivity: [HOBBY, FOTL, H2], description: 'Black refractor 1/1' },
  { name: 'Black Prizm Shock', color_hex: '#0A0A0A', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 52, box_exclusivity: [HOBBY, FOTL, H2, HOBBY_BLASTER, HOBBY_MEGA], description: 'Black Shock 1/1' },
];

async function main() {
  const total = parallels.length;
  console.log(`Seeding ${total} parallels for 2025 Select NFL\n`);

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
