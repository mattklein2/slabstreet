#!/usr/bin/env node

/**
 * Seed 2024 Topps Series 1 Baseball parallel data.
 * Sources: Beckett, Cardboard Connection, BaseballCardPedia, TradeCracks.
 *
 * Usage:
 *   node scripts/seed-topps-series1-2024-mlb.mjs
 *   node scripts/seed-topps-series1-2024-mlb.mjs --dry-run
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

const PRODUCT_ID = 'c0000000-0000-0000-0000-000000000013'; // 2024 Topps S1 MLB

const HOBBY = 'Hobby';
const JUMBO = 'Jumbo';
const HANGER = 'Hanger';
const VALUE_BLASTER = 'Value Blaster';
const SUPER_BOX = 'Super Box';
const FANATICS = 'Fanatics';
const MEIJER = 'Meijer Blister';
const RETAIL = 'Retail';
const BLASTER = 'Blaster';
const ALL = 'All';

const parallels = [
  // Unnumbered
  { name: 'Base', color_hex: '#FFFFFF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1, box_exclusivity: [ALL], description: 'Standard base card, 350-card set' },
  { name: 'Rainbow Foil', color_hex: '#C0C0C0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 2, box_exclusivity: [HOBBY, JUMBO, RETAIL, BLASTER], description: 'Rainbow sheen, ~7,375 copies est.' },
  { name: 'Royal Blue', color_hex: '#1E3A8A', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 3, box_exclusivity: [RETAIL, BLASTER], description: 'Retail-exclusive blue border' },
  { name: 'Yellow', color_hex: '#FACC15', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 4, box_exclusivity: [HANGER], description: 'Hanger exclusive, 2 per box' },
  { name: 'Holiday', color_hex: '#8BC34A', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 5, box_exclusivity: [VALUE_BLASTER], description: 'Spring-themed, Value Blaster exclusive' },
  { name: 'Aqua', color_hex: '#06B6D4', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 6, box_exclusivity: [FANATICS], description: 'Fanatics box exclusive' },
  { name: 'Purple', color_hex: '#7C3AED', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 7, box_exclusivity: [MEIJER], description: 'Meijer store exclusive' },
  { name: 'Silver Crackle Foilboard', color_hex: '#D1D5DB', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 8, box_exclusivity: [SUPER_BOX], description: 'Super Box exclusive crackle foil' },
  { name: 'Gold Foil', color_hex: '#D4A017', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 9, box_exclusivity: [JUMBO], description: 'HTA Jumbo exclusive' },
  { name: 'Yellow Foil', color_hex: '#EAB308', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 10, box_exclusivity: [HANGER], description: 'Hanger exclusive foil' },
  { name: 'Eggs', color_hex: '#FDE68A', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 11, box_exclusivity: [VALUE_BLASTER], description: 'Easter-themed, Value Blaster exclusive' },
  { name: 'Rabbits', color_hex: '#FBCFE8', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 12, box_exclusivity: [VALUE_BLASTER], description: 'Easter-themed, Value Blaster exclusive, ~300 copies est.' },
  // Variations
  { name: 'Team Color Border', color_hex: '#6366F1', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 13, box_exclusivity: [ALL], description: 'Team-colored border, ~315 copies est.' },
  { name: 'Golden Mirror Image', color_hex: '#FFD700', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 14, box_exclusivity: [ALL], description: 'Alternate image, gold back, SSP' },
  { name: 'True Photo', color_hex: '#E5E7EB', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 15, box_exclusivity: [ALL], description: 'Full-bleed photo, no design frame, SSSP' },
  // Numbered
  { name: 'Gold', color_hex: '#FFD700', print_run: 2024, serial_numbered: true, is_one_of_one: false, rarity_rank: 16, box_exclusivity: [ALL], description: 'Gold border /2024' },
  { name: 'Blue Holofoil', color_hex: '#3B82F6', print_run: 999, serial_numbered: true, is_one_of_one: false, rarity_rank: 17, box_exclusivity: [ALL], description: 'Blue holofoil board /999' },
  { name: 'Purple Holofoil', color_hex: '#8B5CF6', print_run: 799, serial_numbered: true, is_one_of_one: false, rarity_rank: 18, box_exclusivity: [ALL], description: 'Purple holofoil board /799' },
  { name: 'Green Crackle Foilboard', color_hex: '#22C55E', print_run: 499, serial_numbered: true, is_one_of_one: false, rarity_rank: 19, box_exclusivity: [ALL], description: 'Green crackle foil /499' },
  { name: 'Orange Crackle Foilboard', color_hex: '#F97316', print_run: 299, serial_numbered: true, is_one_of_one: false, rarity_rank: 20, box_exclusivity: [ALL], description: 'Orange crackle foil /299' },
  { name: 'Red Crackle Foilboard', color_hex: '#EF4444', print_run: 199, serial_numbered: true, is_one_of_one: false, rarity_rank: 21, box_exclusivity: [ALL], description: 'Red crackle foil /199' },
  { name: 'Vintage Stock', color_hex: '#D2B48C', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 22, box_exclusivity: [ALL], description: 'Vintage cardstock /99' },
  { name: 'Independence Day', color_hex: '#1D4ED8', print_run: 76, serial_numbered: true, is_one_of_one: false, rarity_rank: 23, box_exclusivity: [ALL], description: 'Patriotic flag border /76' },
  { name: 'Black', color_hex: '#1F2937', print_run: 73, serial_numbered: true, is_one_of_one: false, rarity_rank: 24, box_exclusivity: [HOBBY, JUMBO], description: 'Black border, Hobby/Jumbo exclusive /73' },
  { name: 'Flowers', color_hex: '#EC4899', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 25, box_exclusivity: [VALUE_BLASTER], description: 'Spring floral, Value Blaster exclusive /50' },
  { name: "Father's Day Powder Blue", color_hex: '#93C5FD', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 26, box_exclusivity: [ALL], description: "Powder blue Father's Day /50" },
  { name: "Mother's Day Hot Pink", color_hex: '#F472B6', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 27, box_exclusivity: [ALL], description: "Hot pink Mother's Day /50" },
  { name: 'Yellow Crackle Foilboard', color_hex: '#FDE047', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 28, box_exclusivity: [HANGER], description: 'Yellow crackle foil, Hanger exclusive /50' },
  { name: 'Memorial Day Camo', color_hex: '#4B5320', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 29, box_exclusivity: [ALL], description: 'Camouflage pattern /25' },
  { name: 'Clear', color_hex: '#F0F9FF', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 30, box_exclusivity: [HOBBY], description: 'Acetate card stock, Hobby exclusive /10' },
  { name: 'Umbrella', color_hex: '#A78BFA', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 31, box_exclusivity: [VALUE_BLASTER], description: 'Spring umbrella, Value Blaster exclusive /10' },
  { name: 'Watering Can', color_hex: '#2DD4BF', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 32, box_exclusivity: [VALUE_BLASTER], description: 'Spring watering can, Value Blaster exclusive /5' },
  // 1/1s
  { name: 'Birds', color_hex: '#60A5FA', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 33, box_exclusivity: [VALUE_BLASTER], description: 'Spring birds, Value Blaster exclusive 1/1' },
  { name: 'First Card', color_hex: '#F5F5F4', print_run: 1, serial_numbered: false, is_one_of_one: true, rarity_rank: 34, box_exclusivity: [ALL], description: 'First card off print sheet 1/1' },
  { name: 'Platinum', color_hex: '#E5E4E2', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 35, box_exclusivity: [ALL], description: 'Platinum finish 1/1' },
  { name: 'Printing Plate Black', color_hex: '#111827', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 36, box_exclusivity: [ALL], description: 'Black printing plate 1/1' },
  { name: 'Printing Plate Cyan', color_hex: '#06B6D4', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 37, box_exclusivity: [ALL], description: 'Cyan printing plate 1/1' },
  { name: 'Printing Plate Magenta', color_hex: '#EC4899', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 38, box_exclusivity: [ALL], description: 'Magenta printing plate 1/1' },
  { name: 'Printing Plate Yellow', color_hex: '#FACC15', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 39, box_exclusivity: [ALL], description: 'Yellow printing plate 1/1' },
];

async function main() {
  const total = parallels.length;
  console.log(`Seeding ${total} parallels for 2024 Topps Series 1 MLB\n`);

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
