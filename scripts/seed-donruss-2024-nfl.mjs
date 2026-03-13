#!/usr/bin/env node

/**
 * Seed complete 2024 Donruss Football parallel data.
 * Sources: Cardboard Connection, Beckett, community break data.
 *
 * Usage:
 *   node scripts/seed-donruss-2024-nfl.mjs
 *   node scripts/seed-donruss-2024-nfl.mjs --dry-run
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

const PRODUCT_ID = 'c0000000-0000-0000-0000-000000000005'; // 2024 Donruss NFL

const HOBBY = 'Hobby';
const BLASTER = 'Retail Blaster';
const MEGA = 'Retail Mega';
const HANGER = 'Hanger';
const FAT_PACK = 'Fat Pack/Cello';
const GRAVITY_FEED = 'Gravity Feed';
const WINTER_TIN = 'Winter Tin';
const ALL = 'All';

// Shorthand for all retail formats
const RETAIL = [BLASTER, MEGA, HANGER, FAT_PACK];

// Complete parallel data for 2024 Donruss Football
// Corrected via Cardboard Connection, Beckett, Checklist Insider, Cardlines
// Note: "Holo Laser" parallels, FOTL parallels, and "White/Red Hot Rookies" are INSERT sets, not base parallels
const parallels = [
  // ── Unnumbered Parallels (9) ──────────────────────────────────
  { name: 'Base', color_hex: '#FFFFFF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1, box_exclusivity: [ALL], description: 'Standard base card' },
  { name: 'Press Proof Red', color_hex: '#DC2626', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 2, box_exclusivity: [BLASTER, HANGER], description: 'Red-tinted press proof; Blaster and Hanger exclusive' },
  { name: 'Press Proof Yellow', color_hex: '#FACC15', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 3, box_exclusivity: [GRAVITY_FEED], description: 'Yellow-tinted press proof; Gravity Feed exclusive (1 per pack)' },
  { name: 'Press Proof Green', color_hex: '#16A34A', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 4, box_exclusivity: [HOBBY, ...RETAIL], description: 'Green-tinted press proof; common across most box types' },
  { name: 'Press Proof Blue', color_hex: '#2563EB', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 5, box_exclusivity: [HOBBY], description: 'Blue-tinted press proof; hobby-exclusive unnumbered parallel' },
  { name: 'Canvas', color_hex: '#D4C5A9', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 6, box_exclusivity: [HOBBY, ...RETAIL], description: 'Textured canvas finish with a painted-art look; unnumbered SSP' },
  { name: 'Press Proof Purple', color_hex: '#7C3AED', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 7, box_exclusivity: [WINTER_TIN], description: 'Purple-tinted press proof; Winter Tin exclusive, 3 per box' },
  { name: 'No Name', color_hex: '#1E293B', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 8, box_exclusivity: [HOBBY, ...RETAIL], description: 'Player name removed from card front for clean design; short print' },
  { name: 'Aqueous Test', color_hex: '#38BDF8', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 9, box_exclusivity: [HOBBY, ...RETAIL], description: 'Water-like translucent finish; rare unnumbered SSP' },

  // ── Numbered Parallels (7) ─────────────────────────────────────
  { name: 'Season Stat Line', color_hex: '#F97316', print_run: 500, serial_numbered: true, is_one_of_one: false, rarity_rank: 10, box_exclusivity: [HOBBY], description: 'Numbered to player season stat (500 or less); print run varies per card' },
  { name: 'Press Proof Silver', color_hex: '#C0C0C0', print_run: 100, serial_numbered: true, is_one_of_one: false, rarity_rank: 11, box_exclusivity: [HOBBY], description: 'Silver metallic press proof /100' },
  { name: 'Jersey Number', color_hex: '#E11D48', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 12, box_exclusivity: [HOBBY], description: 'Numbered to player jersey number (99 or less); print run varies per card' },
  { name: 'Press Proof Silver Die-Cut', color_hex: '#D1D5DB', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 13, box_exclusivity: [HOBBY], description: 'Silver press proof with die-cut edge /75' },
  { name: 'Press Proof Gold', color_hex: '#EAB308', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 14, box_exclusivity: [HOBBY], description: 'Gold metallic press proof /50' },
  { name: 'Press Proof Gold Die-Cut', color_hex: '#CA8A04', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 15, box_exclusivity: [HOBBY], description: 'Gold press proof with die-cut edge /25' },
  { name: 'Press Proof Black', color_hex: '#171717', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 16, box_exclusivity: [HOBBY], description: 'Black press proof /10; extremely limited' },

  // ── 1-of-1 Parallels (1) ──────────────────────────────────────
  { name: 'Press Proof Black Die-Cut', color_hex: '#000000', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 17, box_exclusivity: [HOBBY], description: 'Black press proof with die-cut edge — true 1/1, the rarest base parallel' },
];

async function main() {
  console.log(`Seeding 2024 Donruss NFL Parallels: ${parallels.length} parallels\n`);

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
  console.log('Deleted old parallels for Donruss NFL 2024');

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
  console.log(`Verified: ${count} parallels in DB for Donruss NFL 2024`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
