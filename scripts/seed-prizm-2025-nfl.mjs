#!/usr/bin/env node

/**
 * Seed 2025 Panini Prizm Football parallel data.
 * Sources: Beckett, Checklist Insider.
 *
 * Usage:
 *   node scripts/seed-prizm-2025-nfl.mjs
 *   node scripts/seed-prizm-2025-nfl.mjs --dry-run
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

const PRODUCT_ID = 'c0000000-0000-0000-0000-00000000001e'; // 2025 Prizm NFL

const HOBBY = 'Hobby';
const FOTL = 'FOTL';
const NO_HUDDLE = 'No Huddle';
const BLASTER = 'Blaster';
const MEGA = 'Mega';
const RETAIL = 'Retail';
const FAT_PACK = 'Fat Pack';
const CHOICE = 'Choice';
const PREMIUM_BOX = 'Premium Box Set';
const ALL = 'All';

const parallels = [
  // ─── UNNUMBERED ───
  { name: 'Silver Prizm', color_hex: '#C0C0C0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1, box_exclusivity: [ALL], description: 'The flagship silver chrome refractor; found in all box types' },
  { name: 'Red Prizm', color_hex: '#CC2200', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 2, box_exclusivity: [HOBBY, FOTL, BLASTER, MEGA, RETAIL, FAT_PACK, NO_HUDDLE], description: 'Unnumbered red refractor' },
  { name: 'Blue Prizm', color_hex: '#1A4BC4', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 3, box_exclusivity: [HOBBY, FOTL, BLASTER, MEGA, RETAIL, FAT_PACK, NO_HUDDLE], description: 'Unnumbered blue refractor' },
  { name: 'Green Wave Prizm', color_hex: '#2D8C3E', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 4, box_exclusivity: [HOBBY, FOTL, BLASTER, MEGA, RETAIL, FAT_PACK, NO_HUDDLE], description: 'Unnumbered green wave-pattern refractor' },
  { name: 'Pink Prizm', color_hex: '#FF69B4', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 5, box_exclusivity: [HOBBY, FOTL, BLASTER, MEGA, RETAIL, FAT_PACK, NO_HUDDLE], description: 'Unnumbered pink refractor' },
  { name: 'Pink Wave Prizm', color_hex: '#FF85C1', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 6, box_exclusivity: [HOBBY, FOTL, BLASTER, MEGA, RETAIL, FAT_PACK, NO_HUDDLE], description: 'Unnumbered pink wave-pattern refractor' },
  { name: 'Red Flash Prizm', color_hex: '#FF2200', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 7, box_exclusivity: [HOBBY, FOTL, BLASTER, MEGA, RETAIL, FAT_PACK, NO_HUDDLE], description: 'Unnumbered red flash-pattern refractor' },
  { name: 'Red Sparkle Prizm', color_hex: '#FF3322', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 8, box_exclusivity: [HOBBY, FOTL, BLASTER, MEGA, RETAIL, FAT_PACK, NO_HUDDLE], description: 'Unnumbered red sparkle-pattern refractor' },
  { name: 'Red White and Blue Prizm', color_hex: '#B22234', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 9, box_exclusivity: [HOBBY, FOTL, BLASTER, MEGA, RETAIL, FAT_PACK, NO_HUDDLE], description: 'Unnumbered patriotic tri-color refractor' },
  { name: 'Orange Ice Prizm', color_hex: '#FF7A1A', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 10, box_exclusivity: [HOBBY, FOTL, BLASTER, MEGA, RETAIL, FAT_PACK, NO_HUDDLE], description: 'Unnumbered orange ice-pattern refractor' },
  { name: 'Purple Pulsar Prizm', color_hex: '#7B2FBE', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 11, box_exclusivity: [HOBBY, FOTL, BLASTER, MEGA, RETAIL, FAT_PACK, NO_HUDDLE], description: 'Unnumbered purple pulsar-pattern refractor' },
  { name: 'Press Proof Prizm', color_hex: '#888888', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 12, box_exclusivity: [HOBBY, FOTL, BLASTER, MEGA, RETAIL, FAT_PACK, NO_HUDDLE], description: 'Unnumbered black-and-white press proof refractor' },
  { name: 'Black and Blue Checker Prizm', color_hex: '#1A1A4E', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 13, box_exclusivity: [HOBBY, FOTL, BLASTER, MEGA, NO_HUDDLE], description: 'Unnumbered black/blue checkerboard refractor' },
  { name: 'Black and Red Checker Prizm', color_hex: '#3D0000', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 14, box_exclusivity: [HOBBY, FOTL, BLASTER, MEGA, NO_HUDDLE], description: 'Unnumbered black/red checkerboard refractor' },
  { name: 'White Disco Prizm', color_hex: '#F5F5F5', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 15, box_exclusivity: [HOBBY, FOTL, BLASTER], description: 'Unnumbered white disco-ball-pattern refractor' },
  { name: 'White Sparkle Prizm', color_hex: '#FAFAFA', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 16, box_exclusivity: [HOBBY, FOTL, BLASTER], description: 'Unnumbered white sparkle-pattern refractor' },
  { name: 'Snakeskin Prizm', color_hex: '#8B7355', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 17, box_exclusivity: [HOBBY, FOTL], description: 'Hobby/FOTL exclusive snakeskin-pattern refractor' },
  // Box-exclusive unnumbered
  { name: 'No Huddle Prizm', color_hex: '#4A90D9', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 18, box_exclusivity: [NO_HUDDLE], description: 'No Huddle box exclusive; unnumbered' },
  { name: 'Lazer Prizm', color_hex: '#00CFFF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 19, box_exclusivity: [BLASTER], description: 'Blaster box exclusive laser-pattern refractor' },
  { name: 'Neon Green Pulsar Prizm', color_hex: '#39FF14', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 20, box_exclusivity: [MEGA], description: 'Mega box exclusive neon green pulsar refractor' },
  { name: 'Green Ice Prizm', color_hex: '#3CB371', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 21, box_exclusivity: [RETAIL], description: 'Retail counter display exclusive green ice refractor' },
  { name: 'Black and White Checker Prizm', color_hex: '#333333', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 22, box_exclusivity: [RETAIL], description: 'Retail counter display exclusive black/white checker' },
  { name: 'Green Prizm', color_hex: '#228B22', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 23, box_exclusivity: [FAT_PACK], description: 'Fat Pack exclusive solid green refractor' },
  { name: 'Green Flash Prizm', color_hex: '#00CC44', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 24, box_exclusivity: [FAT_PACK], description: 'Fat Pack exclusive green flash-pattern refractor' },
  { name: 'Choice Blue Yellow and Green Prizm', color_hex: '#4169E1', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 25, box_exclusivity: [CHOICE], description: 'Choice box exclusive tri-color refractor' },
  { name: 'Choice Tiger Stripe Prizm', color_hex: '#CC7722', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 26, box_exclusivity: [CHOICE], description: 'Choice box exclusive tiger stripe refractor' },

  // ─── NUMBERED ───
  { name: 'Pandora Prizm', color_hex: '#9B59B6', print_run: 400, serial_numbered: true, is_one_of_one: false, rarity_rank: 27, box_exclusivity: [PREMIUM_BOX], description: 'Premium Box Set exclusive /400' },
  { name: 'Orange Prizm', color_hex: '#FF6600', print_run: 249, serial_numbered: true, is_one_of_one: false, rarity_rank: 28, box_exclusivity: [HOBBY, FOTL, NO_HUDDLE], description: 'Classic orange refractor /249' },
  { name: 'Blue Wave Prizm', color_hex: '#1565C0', print_run: 230, serial_numbered: true, is_one_of_one: false, rarity_rank: 29, box_exclusivity: [HOBBY, FOTL, NO_HUDDLE], description: 'Blue wave-pattern refractor /230' },
  { name: 'Purple Ice Prizm', color_hex: '#6A0DAD', print_run: 225, serial_numbered: true, is_one_of_one: false, rarity_rank: 30, box_exclusivity: [HOBBY, FOTL, NO_HUDDLE], description: 'Purple ice-pattern refractor /225' },
  { name: 'Hyper Prizm', color_hex: '#FF00FF', print_run: 200, serial_numbered: true, is_one_of_one: false, rarity_rank: 31, box_exclusivity: [HOBBY, FOTL, NO_HUDDLE], description: 'Multi-color hyper refractor /200' },
  { name: 'Pigskin Prizm', color_hex: '#A0522D', print_run: 180, serial_numbered: true, is_one_of_one: false, rarity_rank: 32, box_exclusivity: [HOBBY, FOTL, NO_HUDDLE], description: 'Football leather-textured refractor /180; new in 2025' },
  { name: 'Red Wave Prizm', color_hex: '#CC0000', print_run: 149, serial_numbered: true, is_one_of_one: false, rarity_rank: 33, box_exclusivity: [HOBBY, FOTL, NO_HUDDLE], description: 'Red wave-pattern refractor /149' },
  { name: 'No Huddle Blue Prizm', color_hex: '#0D47A1', print_run: 125, serial_numbered: true, is_one_of_one: false, rarity_rank: 34, box_exclusivity: [NO_HUDDLE], description: 'No Huddle exclusive /125' },
  { name: 'Purple Prizm', color_hex: '#5B0DBF', print_run: 125, serial_numbered: true, is_one_of_one: false, rarity_rank: 35, box_exclusivity: [HOBBY, FOTL, NO_HUDDLE], description: 'Purple refractor /125' },
  { name: 'Blue Ice Prizm', color_hex: '#0099CC', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 36, box_exclusivity: [HOBBY, FOTL, NO_HUDDLE], description: 'Blue ice-pattern refractor /99' },
  { name: 'No Huddle Red Prizm', color_hex: '#B71C1C', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 37, box_exclusivity: [NO_HUDDLE], description: 'No Huddle exclusive /99' },
  { name: 'Purple Wave Prizm', color_hex: '#7B1FA2', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 38, box_exclusivity: [HOBBY, FOTL, NO_HUDDLE], description: 'Purple wave-pattern refractor /99' },
  { name: 'Blue Sparkle Prizm', color_hex: '#1976D2', print_run: 96, serial_numbered: true, is_one_of_one: false, rarity_rank: 39, box_exclusivity: [HOBBY, FOTL, NO_HUDDLE], description: 'Blue sparkle-pattern refractor /96' },
  { name: 'Green Scope Prizm', color_hex: '#1B5E20', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 40, box_exclusivity: [HOBBY, FOTL, NO_HUDDLE], description: 'Green scope-pattern refractor /75' },
  { name: 'No Huddle Purple Prizm', color_hex: '#4A148C', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 41, box_exclusivity: [NO_HUDDLE], description: 'No Huddle exclusive /75' },
  { name: 'Orange Wave Prizm', color_hex: '#E65100', print_run: 65, serial_numbered: true, is_one_of_one: false, rarity_rank: 42, box_exclusivity: [HOBBY, FOTL, NO_HUDDLE], description: 'Orange wave-pattern refractor /65' },
  { name: 'Kangaroo Prizm', color_hex: '#C8A96E', print_run: 61, serial_numbered: true, is_one_of_one: false, rarity_rank: 43, box_exclusivity: [HOBBY, FOTL], description: 'Kangaroo-hide textured refractor /61; new in 2025' },
  { name: 'Super Bowl LX Prizm', color_hex: '#C9A84C', print_run: 60, serial_numbered: true, is_one_of_one: false, rarity_rank: 44, box_exclusivity: [HOBBY, FOTL, NO_HUDDLE], description: 'Super Bowl LX commemorative refractor /60' },
  { name: 'Purple Power Prizm', color_hex: '#6200EA', print_run: 49, serial_numbered: true, is_one_of_one: false, rarity_rank: 45, box_exclusivity: [HOBBY, FOTL, NO_HUDDLE], description: 'Purple power refractor /49' },
  { name: 'Red Shimmer Prizm', color_hex: '#CC1100', print_run: 49, serial_numbered: true, is_one_of_one: false, rarity_rank: 46, box_exclusivity: [FOTL], description: 'FOTL exclusive red shimmer /49' },
  { name: 'Red and Yellow Prizm', color_hex: '#FF4400', print_run: 44, serial_numbered: true, is_one_of_one: false, rarity_rank: 47, box_exclusivity: [HOBBY, FOTL, NO_HUDDLE], description: 'Red and yellow dual-tone refractor /44' },
  { name: 'Blue Shimmer Prizm', color_hex: '#0D47A1', print_run: 35, serial_numbered: true, is_one_of_one: false, rarity_rank: 48, box_exclusivity: [FOTL], description: 'FOTL exclusive blue shimmer /35' },
  { name: 'White Prizm', color_hex: '#FFFFFF', print_run: 35, serial_numbered: true, is_one_of_one: false, rarity_rank: 49, box_exclusivity: [HOBBY, FOTL, NO_HUDDLE], description: 'White refractor /35' },
  { name: 'Navy Camo Prizm', color_hex: '#1C2951', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 50, box_exclusivity: [HOBBY, FOTL, NO_HUDDLE], description: 'Navy camouflage refractor /25' },
  { name: 'No Huddle Pink Prizm', color_hex: '#FF1493', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 51, box_exclusivity: [NO_HUDDLE], description: 'No Huddle exclusive /25' },
  { name: 'Gold Sparkle Prizm', color_hex: '#FFD700', print_run: 24, serial_numbered: true, is_one_of_one: false, rarity_rank: 52, box_exclusivity: [HOBBY, FOTL, NO_HUDDLE], description: 'Gold sparkle refractor /24' },
  { name: 'Choice Red Prizm', color_hex: '#C62828', print_run: 20, serial_numbered: true, is_one_of_one: false, rarity_rank: 53, box_exclusivity: [CHOICE], description: 'Choice exclusive /20' },
  { name: 'Panini Logo Prizm', color_hex: '#1565C0', print_run: 20, serial_numbered: true, is_one_of_one: false, rarity_rank: 54, box_exclusivity: [HOBBY, FOTL], description: 'Panini logo on design frame /20' },
  { name: 'Lotus Flower Prizm', color_hex: '#FF85A1', print_run: 18, serial_numbered: true, is_one_of_one: false, rarity_rank: 55, box_exclusivity: [HOBBY, FOTL], description: 'Lotus flower-pattern refractor /18; new in 2025' },
  { name: 'Choice Cherry Blossom Prizm', color_hex: '#FFB7C5', print_run: 15, serial_numbered: true, is_one_of_one: false, rarity_rank: 56, box_exclusivity: [CHOICE], description: 'Choice exclusive cherry blossom /15' },
  { name: 'Forest Camo Prizm', color_hex: '#228B22', print_run: 15, serial_numbered: true, is_one_of_one: false, rarity_rank: 57, box_exclusivity: [HOBBY, FOTL, NO_HUDDLE], description: 'Forest green camouflage refractor /15' },
  { name: 'Purple Shimmer Prizm', color_hex: '#6A0DAD', print_run: 15, serial_numbered: true, is_one_of_one: false, rarity_rank: 58, box_exclusivity: [FOTL], description: 'FOTL exclusive purple shimmer /15' },
  { name: 'Choice Blue Prizm', color_hex: '#003399', print_run: 14, serial_numbered: true, is_one_of_one: false, rarity_rank: 59, box_exclusivity: [CHOICE], description: 'Choice exclusive /14' },
  { name: 'Choice Gold Prizm', color_hex: '#D4AF37', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 60, box_exclusivity: [CHOICE], description: 'Choice exclusive /10' },
  { name: 'Gold Prizm', color_hex: '#FFD700', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 61, box_exclusivity: [HOBBY, FOTL, NO_HUDDLE], description: 'Iconic gold refractor /10' },
  { name: 'Gold Shimmer Prizm', color_hex: '#DAA520', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 62, box_exclusivity: [FOTL], description: 'FOTL exclusive gold shimmer /10' },
  { name: 'Gold Wave Prizm', color_hex: '#F5C518', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 63, box_exclusivity: [HOBBY, FOTL, NO_HUDDLE], description: 'Gold wave-pattern refractor /10' },
  { name: 'No Huddle Neon Green Prizm', color_hex: '#39FF14', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 64, box_exclusivity: [NO_HUDDLE], description: 'No Huddle exclusive /10' },
  { name: 'Green Sparkle Prizm', color_hex: '#00AA44', print_run: 8, serial_numbered: true, is_one_of_one: false, rarity_rank: 65, box_exclusivity: [HOBBY, FOTL, NO_HUDDLE], description: 'Green sparkle refractor /8' },
  { name: 'Plum Blossom Prizm', color_hex: '#8B008B', print_run: 8, serial_numbered: true, is_one_of_one: false, rarity_rank: 66, box_exclusivity: [HOBBY, FOTL], description: 'Plum blossom-pattern refractor /8; new in 2025' },
  { name: 'Gold Vinyl Prizm', color_hex: '#FFB000', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 67, box_exclusivity: [HOBBY, FOTL], description: 'Gold vinyl glossy refractor /5' },
  { name: 'Green Shimmer Prizm', color_hex: '#006400', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 68, box_exclusivity: [FOTL], description: 'FOTL exclusive green shimmer /5' },
  { name: 'White Knight Prizm', color_hex: '#F0F0F0', print_run: 3, serial_numbered: true, is_one_of_one: false, rarity_rank: 69, box_exclusivity: [HOBBY, FOTL], description: 'Prestigious white knight refractor /3' },

  // ─── 1/1s ───
  { name: 'Black Finite Prizm', color_hex: '#0A0A0A', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 70, box_exclusivity: [HOBBY, FOTL], description: 'Black finite 1/1; ultimate chase card' },
  { name: 'Black Shimmer Prizm', color_hex: '#111111', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 71, box_exclusivity: [FOTL], description: 'FOTL exclusive black shimmer 1/1' },
  { name: 'Black Stars Prizm', color_hex: '#1A0033', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 72, box_exclusivity: [PREMIUM_BOX], description: 'Premium Box Set exclusive 1/1' },
  { name: 'Choice Nebula Prizm', color_hex: '#1A003A', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 73, box_exclusivity: [CHOICE], description: 'Choice exclusive nebula 1/1' },
];

async function main() {
  const total = parallels.length;
  console.log(`Seeding ${total} parallels for 2025 Prizm NFL\n`);

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
