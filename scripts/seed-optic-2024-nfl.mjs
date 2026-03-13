#!/usr/bin/env node

/**
 * Seed 2024 Donruss Optic Football parallel data.
 * Sources: Beckett, Checklist Insider, DA Card World.
 *
 * Usage:
 *   node scripts/seed-optic-2024-nfl.mjs
 *   node scripts/seed-optic-2024-nfl.mjs --dry-run
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

const PRODUCT_ID = 'c0000000-0000-0000-0000-000000000010'; // 2024 Optic NFL

const HOBBY = 'Hobby';
const H2 = 'H2';
const RETAIL_MEGA = 'Retail Mega';
const HOBBY_MEGA = 'Hobby Mega';
const RETAIL_BLASTER = 'Retail Blaster';
const HOBBY_BLASTER = 'Hobby Blaster';
const FAT_PACK = 'Fat Pack';
const RETAIL = 'Retail';
const ALL = 'All';

const parallels = [
  { name: 'Base', color_hex: '#FFFFFF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1, box_exclusivity: [ALL], description: 'Standard base card' },
  { name: 'Holo', color_hex: '#C0C0C0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 2, box_exclusivity: [ALL], description: 'Holographic refractor, most common parallel' },
  { name: 'Stars', color_hex: '#FFD700', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 3, box_exclusivity: [RETAIL], description: 'Star pattern overlay, retail exclusive' },
  { name: 'One Hundred', color_hex: '#E8E8E8', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 4, box_exclusivity: [RETAIL], description: 'Centurion pattern, retail exclusive' },
  { name: 'Red Stars', color_hex: '#CC0000', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 5, box_exclusivity: [ALL], description: 'Red star pattern overlay' },
  { name: 'Fire', color_hex: '#FF4500', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 6, box_exclusivity: [ALL], description: 'Flame/fire pattern effect' },
  { name: 'Freedom', color_hex: '#3C3B6E', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 7, box_exclusivity: [ALL], description: 'Red/white/blue patriotic pattern' },
  { name: 'Jazz', color_hex: '#00CED1', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 8, box_exclusivity: [ALL], description: 'Retro jazz cup design pattern' },
  { name: 'Rocket', color_hex: '#FF6347', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 9, box_exclusivity: [ALL], description: 'Rocket/launch trail pattern' },
  { name: 'White Sparkle', color_hex: '#F5F5F5', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 10, box_exclusivity: [ALL], description: 'White glitter sparkle finish' },
  { name: 'Blue Hyper', color_hex: '#0077CC', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 11, box_exclusivity: [RETAIL_MEGA], description: 'Blue hyper shimmer, Retail Mega exclusive (Rated Rookies only)' },
  { name: 'Purple Shock', color_hex: '#7B2D8E', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 12, box_exclusivity: [RETAIL_BLASTER], description: 'Purple shock, Retail Blaster exclusive (Rated Rookies only)' },
  { name: 'Blue Scope', color_hex: '#4682B4', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 13, box_exclusivity: [HOBBY_BLASTER], description: 'Blue scope, Hobby Blaster exclusive (Rated Rookies only)' },
  { name: 'Red Hyper', color_hex: '#DC143C', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 14, box_exclusivity: [HOBBY_MEGA], description: 'Red hyper shimmer, Hobby Mega exclusive (Rated Rookies only)' },
  { name: 'Green Velocity', color_hex: '#00AA44', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 15, box_exclusivity: [FAT_PACK], description: 'Green velocity, Fat Pack/Cello exclusive' },
  { name: 'Wave', color_hex: '#87CEEB', print_run: 300, serial_numbered: true, is_one_of_one: false, rarity_rank: 16, box_exclusivity: [ALL], description: 'Wave refractor pattern /300' },
  { name: 'Aqua', color_hex: '#00FFFF', print_run: 299, serial_numbered: true, is_one_of_one: false, rarity_rank: 17, box_exclusivity: [ALL], description: 'Aqua refractor /299' },
  { name: 'Orange', color_hex: '#FF8C00', print_run: 249, serial_numbered: true, is_one_of_one: false, rarity_rank: 18, box_exclusivity: [ALL], description: 'Solid orange refractor /249' },
  { name: 'Blue', color_hex: '#0055BF', print_run: 199, serial_numbered: true, is_one_of_one: false, rarity_rank: 19, box_exclusivity: [ALL], description: 'Solid blue refractor /199' },
  { name: 'Flex', color_hex: '#8B4513', print_run: 149, serial_numbered: true, is_one_of_one: false, rarity_rank: 20, box_exclusivity: [ALL], description: 'Flex pattern refractor /149' },
  { name: 'Red', color_hex: '#CC0000', print_run: 125, serial_numbered: true, is_one_of_one: false, rarity_rank: 21, box_exclusivity: [ALL], description: 'Solid red refractor /125' },
  { name: 'Pink Velocity', color_hex: '#FF69B4', print_run: 80, serial_numbered: true, is_one_of_one: false, rarity_rank: 22, box_exclusivity: [ALL], description: 'Pink velocity shimmer /80' },
  { name: 'Orange Scope', color_hex: '#FF6600', print_run: 79, serial_numbered: true, is_one_of_one: false, rarity_rank: 23, box_exclusivity: [ALL], description: 'Orange scope finish /79' },
  { name: 'Electricity', color_hex: '#FFFF00', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 24, box_exclusivity: [ALL], description: 'Electric yellow lightning /75' },
  { name: 'Purple', color_hex: '#6A0DAD', print_run: 60, serial_numbered: true, is_one_of_one: false, rarity_rank: 25, box_exclusivity: [ALL], description: 'Solid purple refractor /60' },
  { name: 'Lime Green', color_hex: '#32CD32', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 26, box_exclusivity: [ALL], description: 'Bright lime green refractor /50' },
  { name: 'Team Logo', color_hex: '#A0A0A0', print_run: 32, serial_numbered: true, is_one_of_one: false, rarity_rank: 27, box_exclusivity: [ALL], description: 'Team logo holographic overlay /32' },
  { name: 'Black Pandora', color_hex: '#1A1A2E', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 28, box_exclusivity: [ALL], description: 'Dark iridescent Pandora pattern /25' },
  { name: 'Dragon', color_hex: '#8B0000', print_run: 24, serial_numbered: true, is_one_of_one: false, rarity_rank: 29, box_exclusivity: [ALL], description: 'Dragon scale iridescent /24' },
  { name: 'Footballs', color_hex: '#8B4513', print_run: 16, serial_numbered: true, is_one_of_one: false, rarity_rank: 30, box_exclusivity: [ALL], description: 'Football leather texture /16' },
  { name: 'Ice', color_hex: '#B0E0E6', print_run: 15, serial_numbered: true, is_one_of_one: false, rarity_rank: 31, box_exclusivity: [ALL], description: 'Frosted ice crystal /15' },
  { name: 'Purple Stars', color_hex: '#800080', print_run: 15, serial_numbered: true, is_one_of_one: false, rarity_rank: 32, box_exclusivity: [ALL], description: 'Purple with star pattern /15' },
  { name: 'Gold', color_hex: '#FFD700', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 33, box_exclusivity: [ALL], description: 'Solid gold refractor /10' },
  { name: 'Red Mojo', color_hex: '#FF0000', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 34, box_exclusivity: [H2], description: 'Red mojo, H2 exclusive /5' },
  { name: 'Blue Mojo', color_hex: '#0000FF', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 35, box_exclusivity: [H2], description: 'Blue mojo, H2 exclusive /5' },
  { name: 'Green', color_hex: '#008000', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 36, box_exclusivity: [ALL], description: 'Solid green refractor /5' },
  { name: 'Black', color_hex: '#000000', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 37, box_exclusivity: [ALL], description: 'Solid black refractor 1/1' },
  { name: 'Gold Vinyl', color_hex: '#FFD700', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 38, box_exclusivity: [ALL], description: 'Gold vinyl record texture 1/1' },
  { name: 'Nebula', color_hex: '#1B0533', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 39, box_exclusivity: [ALL], description: 'Deep space nebula pattern 1/1' },
];

async function main() {
  const total = parallels.length;
  console.log(`Seeding ${total} parallels for 2024 Optic NFL\n`);

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
