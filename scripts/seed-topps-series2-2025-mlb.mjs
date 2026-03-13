#!/usr/bin/env node

/**
 * Seed complete 2025 Topps Series 2 Baseball parallel data.
 * Sources: Beckett, ChecklistInsider, Topps Ripped.
 *
 * Usage:
 *   node scripts/seed-topps-series2-2025-mlb.mjs
 *   node scripts/seed-topps-series2-2025-mlb.mjs --dry-run
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

const PRODUCT_ID = 'c0000000-0000-0000-0000-000000000025'; // 2025 Topps Series 2 MLB

const HOBBY = 'Hobby';
const JUMBO = 'Jumbo';
const BLASTER = 'Value Blaster';
const MEGA = 'Mega Box';
const HANGER = 'Hanger';
const FAT_PACK = 'Fat Pack';
const SUPER = 'Super Box';
const FANATICS = 'Fanatics';
const DISPLAY = 'Display Box';
const ALL = 'All';

const RETAIL = [BLASTER, HANGER, FAT_PACK, MEGA, DISPLAY];

const parallels = [
  // ── Unnumbered Parallels ──────────────────────────────────
  { name: 'Base', color_hex: '#FFFFFF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1, box_exclusivity: [ALL], description: 'Standard base card; 350-card set' },
  { name: 'Rainbow Foil', color_hex: '#C4C4C4', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 2, box_exclusivity: [HOBBY, JUMBO, ...RETAIL, SUPER, FANATICS], description: 'Rainbow foil refractor finish' },
  { name: 'Holo Foil', color_hex: '#D8D8D8', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 3, box_exclusivity: [...RETAIL, MEGA, SUPER, FANATICS], description: 'Holographic foil finish; retail-side parallel' },
  { name: 'Pink Holo Foil', color_hex: '#FF69B4', print_run: 800, serial_numbered: true, is_one_of_one: false, rarity_rank: 4, box_exclusivity: [...RETAIL], description: 'Pink-tinted holographic foil /800 — Retail side' },
  { name: 'Aqua Rainbow Foil', color_hex: '#00CED1', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 5, box_exclusivity: [HOBBY, JUMBO, ...RETAIL, SUPER, FANATICS], description: 'Aqua-tinted rainbow foil; scarce unnumbered parallel' },
  { name: 'Aqua Holo Foil', color_hex: '#48D1CC', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 6, box_exclusivity: [...RETAIL], description: 'Aqua-tinted holographic foil; retail-side scarce parallel' },
  { name: 'Diamante Foil', color_hex: '#B0C4DE', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 7, box_exclusivity: [HANGER], description: 'Diamond-pattern foil finish; Hanger exclusive' },
  { name: 'Pink Diamante Foil', color_hex: '#FFB6C1', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 8, box_exclusivity: [HANGER], description: 'Pink diamond-pattern foil; Hanger exclusive' },
  { name: 'Silver Crackle Foilboard', color_hex: '#A9A9A9', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 9, box_exclusivity: [SUPER], description: 'Crackled silver foilboard finish; Super Box exclusive' },
  { name: 'Topps Foil Pattern', color_hex: '#B8860B', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 10, box_exclusivity: [FANATICS], description: 'Repeating Topps logo foil pattern; Fanatics exclusive' },
  { name: 'Sandglitter', color_hex: '#C2B280', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 11, box_exclusivity: [JUMBO], description: 'Sandy glitter texture finish; Jumbo exclusive' },

  // ── Value Blaster Holiday Parallels ────────────────────────
  { name: 'Sun', color_hex: '#FFD700', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 12, box_exclusivity: [BLASTER], description: 'Sun border design; Value Blaster exclusive' },
  { name: 'Hot Dog', color_hex: '#CD5C5C', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 13, box_exclusivity: [BLASTER], description: 'Hot dog border /99 — Value Blaster exclusive' },
  { name: 'Statue of Liberty', color_hex: '#00CED1', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 14, box_exclusivity: [BLASTER], description: 'Statue of Liberty border /50 — Value Blaster exclusive' },
  { name: 'Beach Umbrella', color_hex: '#FF6347', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 15, box_exclusivity: [BLASTER], description: 'Beach umbrella border /25 — Value Blaster exclusive' },
  { name: 'Fireworks', color_hex: '#FF4500', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 16, box_exclusivity: [BLASTER], description: 'Fireworks border /5 — Value Blaster exclusive' },
  { name: 'Waves', color_hex: '#1E90FF', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 17, box_exclusivity: [BLASTER], description: 'Waves border — Value Blaster exclusive, true 1/1' },

  // ── Numbered Parallels ────────────────────────────────────
  { name: 'Gold', color_hex: '#FFD700', print_run: 2025, serial_numbered: true, is_one_of_one: false, rarity_rank: 18, box_exclusivity: [ALL], description: 'Gold border /2025 (year-matched print run)' },
  { name: 'Purple Rainbow Foil', color_hex: '#9370DB', print_run: 250, serial_numbered: true, is_one_of_one: false, rarity_rank: 19, box_exclusivity: [HOBBY, JUMBO], description: 'Purple-tinted rainbow foil /250 — Hobby exclusive' },
  { name: 'Purple Holo Foil', color_hex: '#8A2BE2', print_run: 250, serial_numbered: true, is_one_of_one: false, rarity_rank: 20, box_exclusivity: [...RETAIL], description: 'Purple-tinted holographic foil /250 — Retail side' },
  { name: 'Blue Rainbow Foil', color_hex: '#4169E1', print_run: 150, serial_numbered: true, is_one_of_one: false, rarity_rank: 21, box_exclusivity: [HOBBY, JUMBO], description: 'Blue-tinted rainbow foil /150 — Hobby exclusive' },
  { name: 'Blue Holo Foil', color_hex: '#1E90FF', print_run: 150, serial_numbered: true, is_one_of_one: false, rarity_rank: 22, box_exclusivity: [...RETAIL], description: 'Blue-tinted holographic foil /150 — Retail side' },
  { name: 'Green Rainbow Foil', color_hex: '#228B22', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 23, box_exclusivity: [HOBBY, JUMBO], description: 'Green-tinted rainbow foil /99 — Hobby exclusive' },
  { name: 'Green Holo Foil', color_hex: '#32CD32', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 24, box_exclusivity: [...RETAIL], description: 'Green-tinted holographic foil /99 — Retail side' },
  { name: 'Vintage Stock', color_hex: '#DEB887', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 25, box_exclusivity: [ALL], description: 'Vintage cardboard stock with aged look /99' },
  { name: 'Independence Day', color_hex: '#B22222', print_run: 76, serial_numbered: true, is_one_of_one: false, rarity_rank: 26, box_exclusivity: [ALL], description: 'Patriotic red/white/blue design /76 (1776 tribute)' },
  { name: 'Black', color_hex: '#1C1C1C', print_run: 74, serial_numbered: true, is_one_of_one: false, rarity_rank: 27, box_exclusivity: [HOBBY, JUMBO], description: 'Black border /74 — Hobby exclusive' },
  { name: 'Gold Rainbow Foil', color_hex: '#DAA520', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 28, box_exclusivity: [HOBBY, JUMBO], description: 'Gold-tinted rainbow foil /50 — Hobby exclusive' },
  { name: 'Gold Holo Foil', color_hex: '#FFC125', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 29, box_exclusivity: [...RETAIL], description: 'Gold-tinted holographic foil /50 — Retail side' },
  { name: 'Gold Diamante Foil', color_hex: '#FFD700', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 30, box_exclusivity: [HANGER], description: 'Gold diamond-pattern foil /50 — Hanger exclusive' },
  { name: 'Canvas', color_hex: '#F5DEB3', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 31, box_exclusivity: [ALL], description: 'Canvas textured card stock /50' },
  { name: 'Memorial Day Camo', color_hex: '#556B2F', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 32, box_exclusivity: [ALL], description: 'Military camouflage pattern /25' },
  { name: 'Orange Rainbow Foil', color_hex: '#FF8C00', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 33, box_exclusivity: [HOBBY, JUMBO], description: 'Orange-tinted rainbow foil /25 — Hobby exclusive' },
  { name: 'Orange Holo Foil', color_hex: '#FF6347', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 34, box_exclusivity: [...RETAIL], description: 'Orange-tinted holographic foil /25 — Retail side' },
  { name: 'Orange Diamante Foil', color_hex: '#FF7F50', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 35, box_exclusivity: [HANGER], description: 'Orange diamond-pattern foil /25 — Hanger exclusive' },
  { name: 'Wood', color_hex: '#8B4513', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 36, box_exclusivity: [ALL], description: 'Wood-grain textured card stock /25' },
  { name: 'Clear', color_hex: '#E0F7FA', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 37, box_exclusivity: [JUMBO], description: 'Clear acetate card stock /10 — Jumbo exclusive' },
  { name: 'Black Rainbow Foil', color_hex: '#1C1C1C', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 38, box_exclusivity: [HOBBY, JUMBO], description: 'Black-tinted rainbow foil /10 — Hobby exclusive' },
  { name: 'Black Holo Foil', color_hex: '#2F2F2F', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 39, box_exclusivity: [...RETAIL], description: 'Black-tinted holographic foil /10 — Retail side' },
  { name: 'Black Diamante Foil', color_hex: '#3B3B3B', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 40, box_exclusivity: [HANGER], description: 'Black diamond-pattern foil /10 — Hanger exclusive' },
  { name: 'Red Rainbow Foil', color_hex: '#DC143C', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 41, box_exclusivity: [HOBBY, JUMBO], description: 'Red-tinted rainbow foil /5 — Hobby exclusive' },
  { name: 'Red Holo Foil', color_hex: '#FF0000', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 42, box_exclusivity: [...RETAIL], description: 'Red-tinted holographic foil /5 — Retail side' },
  { name: 'Red Diamante Foil', color_hex: '#CD5C5C', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 43, box_exclusivity: [HANGER], description: 'Red diamond-pattern foil /5 — Hanger exclusive' },

  // ── 1-of-1 Parallels ─────────────────────────────────────
  { name: 'FoilFractor', color_hex: '#C0C0C0', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 44, box_exclusivity: [HOBBY, JUMBO], description: 'Full foilfractor refractor finish — true 1/1, Hobby exclusive' },
  { name: 'Platinum Holo Foil', color_hex: '#E5E4E2', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 45, box_exclusivity: [...RETAIL], description: 'Platinum holographic foil — true 1/1, Retail side' },
  { name: 'First Card', color_hex: '#FFD700', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 46, box_exclusivity: [ALL], description: 'Stamped as first card off the production line — true 1/1' },
  { name: 'Printing Plate Cyan', color_hex: '#00FFFF', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 47, box_exclusivity: [ALL], description: 'Cyan printing plate — 1 of 1' },
  { name: 'Printing Plate Magenta', color_hex: '#FF00FF', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 48, box_exclusivity: [ALL], description: 'Magenta printing plate — 1 of 1' },
  { name: 'Printing Plate Yellow', color_hex: '#FFFF00', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 49, box_exclusivity: [ALL], description: 'Yellow printing plate — 1 of 1' },
  { name: 'Printing Plate Black', color_hex: '#000000', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 50, box_exclusivity: [ALL], description: 'Black printing plate — 1 of 1' },
];

async function main() {
  console.log(`Seeding 2025 Topps Series 2 MLB Parallels: ${parallels.length} parallels\n`);

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
  console.log('Deleted old parallels for Topps Series 2 MLB 2025');

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
  console.log(`Verified: ${count} parallels in DB for Topps Series 2 MLB 2025`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
