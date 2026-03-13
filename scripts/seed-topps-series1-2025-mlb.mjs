#!/usr/bin/env node

/**
 * Seed complete 2025 Topps Series 1 Baseball parallel data.
 * Sources: Cardboard Connection, Beckett, community break data.
 *
 * Usage:
 *   node scripts/seed-topps-series1-2025-mlb.mjs
 *   node scripts/seed-topps-series1-2025-mlb.mjs --dry-run
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

const PRODUCT_ID = 'c0000000-0000-0000-0000-000000000007'; // 2025 Topps Series 1 MLB

const HOBBY = 'Hobby';
const JUMBO = 'Jumbo';
const BLASTER = 'Retail Blaster';
const MEGA = 'Retail Mega';
const HANGER = 'Hanger';
const CELLO = 'Fat Pack/Cello';
const ALL = 'All';

// Complete parallel data for 2025 Topps Series 1 Baseball
const parallels = [
  // ── Unnumbered Parallels ──────────────────────────────────────
  { name: 'Base', color_hex: null, print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1, box_exclusivity: [ALL], description: 'Standard base card' },
  { name: 'Rainbow Foil', color_hex: '#C0C0C0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 2, box_exclusivity: [ALL], description: 'Rainbow foil finish — most common parallel' },
  { name: 'Royal Blue', color_hex: '#4169E1', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 3, box_exclusivity: [BLASTER], description: 'Royal blue border — Retail Blaster exclusive' },
  { name: 'Red', color_hex: '#CC0000', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 4, box_exclusivity: [HANGER], description: 'Red border — Hanger exclusive' },
  { name: 'Yellow', color_hex: '#FFD700', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 5, box_exclusivity: [CELLO], description: 'Yellow border — Fat Pack/Cello exclusive' },
  { name: 'Vintage Stock', color_hex: '#8B7355', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 6, box_exclusivity: [HOBBY, JUMBO], description: 'Vintage stock paper finish — Hobby/Jumbo exclusive' },
  { name: 'Foilboard', color_hex: '#E8E8FF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 7, box_exclusivity: [HOBBY, JUMBO], description: 'Full foilboard card stock — Hobby/Jumbo exclusive' },
  { name: 'Pink', color_hex: '#FF69B4', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 8, box_exclusivity: [MEGA], description: 'Pink border — Retail Mega exclusive' },

  // ── Numbered Parallels ────────────────────────────────────────
  { name: 'Green', color_hex: '#228B22', print_run: 499, serial_numbered: true, is_one_of_one: false, rarity_rank: 9, box_exclusivity: [ALL], description: 'Green border numbered to 499' },
  { name: 'Advanced Stats', color_hex: '#2F4F4F', print_run: 300, serial_numbered: true, is_one_of_one: false, rarity_rank: 10, box_exclusivity: [ALL], description: 'Advanced stats variation /300' },
  { name: 'Blue', color_hex: '#0055A4', print_run: 299, serial_numbered: true, is_one_of_one: false, rarity_rank: 11, box_exclusivity: [ALL], description: 'Blue border numbered to 299' },
  { name: 'Aqua', color_hex: '#00CED1', print_run: 250, serial_numbered: true, is_one_of_one: false, rarity_rank: 12, box_exclusivity: [ALL], description: 'Aqua border numbered to 250' },
  { name: 'Orange', color_hex: '#FF8C00', print_run: 199, serial_numbered: true, is_one_of_one: false, rarity_rank: 13, box_exclusivity: [ALL], description: 'Orange border numbered to 199' },
  { name: 'Purple', color_hex: '#800080', print_run: 150, serial_numbered: true, is_one_of_one: false, rarity_rank: 14, box_exclusivity: [ALL], description: 'Purple border numbered to 150' },
  { name: 'Independence Day', color_hex: '#3B82F6', print_run: 76, serial_numbered: true, is_one_of_one: false, rarity_rank: 15, box_exclusivity: [ALL], description: 'Stars and stripes pattern /76' },
  { name: 'Father\'s Day Blue', color_hex: '#4682B4', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 16, box_exclusivity: [ALL], description: 'Father\'s Day powder blue /50' },
  { name: 'Mother\'s Day Pink', color_hex: '#FFB6C1', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 17, box_exclusivity: [ALL], description: 'Mother\'s Day hot pink /50' },
  { name: 'Memorial Day Camo', color_hex: '#556B2F', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 18, box_exclusivity: [ALL], description: 'Memorial Day camouflage /25' },
  { name: 'Gold', color_hex: '#FFD700', print_run: 2025, serial_numbered: true, is_one_of_one: false, rarity_rank: 19, box_exclusivity: [ALL], description: 'Gold border numbered to 2025 (year match)' },
  { name: 'Clear', color_hex: '#F0F8FF', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 20, box_exclusivity: [ALL], description: 'Clear acetate card /10' },
  { name: 'Red Foil', color_hex: '#CC0000', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 21, box_exclusivity: [ALL], description: 'Red foil numbered to 5' },

  // ── 1-of-1 Parallels ─────────────────────────────────────────
  { name: 'Platinum', color_hex: '#E5E4E2', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 22, box_exclusivity: [ALL], description: 'Platinum — 1 of 1. The rarest Topps base parallel.' },
  { name: 'Printing Plates Black', color_hex: '#000000', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 23, box_exclusivity: [ALL], description: 'Black printing plate — 1 of 1' },
  { name: 'Printing Plates Cyan', color_hex: '#00FFFF', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 24, box_exclusivity: [ALL], description: 'Cyan printing plate — 1 of 1' },
  { name: 'Printing Plates Magenta', color_hex: '#FF00FF', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 25, box_exclusivity: [ALL], description: 'Magenta printing plate — 1 of 1' },
  { name: 'Printing Plates Yellow', color_hex: '#FFFF00', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 26, box_exclusivity: [ALL], description: 'Yellow printing plate — 1 of 1' },
];

async function main() {
  console.log(`Seeding 2025 Topps Series 1 MLB Parallels: ${parallels.length} parallels\n`);

  if (DRY_RUN) {
    console.log('DRY RUN — no changes made.\n');
    console.log(`Unnumbered: ${parallels.filter(p => !p.serial_numbered).length}`);
    console.log(`Numbered: ${parallels.filter(p => p.serial_numbered && !p.is_one_of_one).length}`);
    console.log(`1-of-1: ${parallels.filter(p => p.is_one_of_one).length}`);
    console.log(`Total: ${parallels.length}`);
    return;
  }

  const { error: delErr } = await supabase
    .from('parallels')
    .delete()
    .eq('product_id', PRODUCT_ID);

  if (delErr) {
    console.error('Error deleting old parallels:', delErr.message);
    return;
  }
  console.log('Deleted old parallels for Topps Series 1 MLB 2025');

  const rows = parallels.map(p => ({
    product_id: PRODUCT_ID,
    name: p.name,
    color_hex: p.color_hex,
    print_run: p.print_run,
    serial_numbered: p.serial_numbered,
    is_one_of_one: p.is_one_of_one,
    rarity_rank: p.rarity_rank,
    description: p.description,
    box_exclusivity: p.box_exclusivity,
    special_attributes: null,
  }));

  const BATCH_SIZE = 50;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('parallels').insert(batch);
    if (error) {
      console.error(`Batch error at ${i}:`, error.message);
    } else {
      inserted += batch.length;
    }
  }

  console.log(`\nInserted ${inserted}/${parallels.length} parallels`);

  const { count } = await supabase
    .from('parallels')
    .select('*', { count: 'exact', head: true })
    .eq('product_id', PRODUCT_ID);
  console.log(`Verified: ${count} parallels in DB for Topps Series 1 MLB 2025`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
