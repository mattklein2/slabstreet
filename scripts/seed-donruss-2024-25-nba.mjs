#!/usr/bin/env node

/**
 * Seed complete 2024-25 Donruss Basketball parallel data.
 * Sources: Cardboard Connection, Beckett, community break data.
 *
 * Usage:
 *   node scripts/seed-donruss-2024-25-nba.mjs
 *   node scripts/seed-donruss-2024-25-nba.mjs --dry-run
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

const PRODUCT_ID = 'c0000000-0000-0000-0000-000000000002'; // 2024-25 Donruss NBA

const HOBBY = 'Hobby';
const CHOICE = 'Choice';
const BLASTER = 'Retail Blaster';
const MEGA = 'Retail Mega';
const HANGER = 'Hanger';
const FAT_PACK = 'Fat Pack/Cello';
const FOTL = 'FOTL';
const ALL = 'All';

// Complete parallel data for 2024-25 Donruss Basketball
const parallels = [
  // ── Unnumbered Parallels ──────────────────────────────────────
  { name: 'Base', color_hex: null, print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1, box_exclusivity: [ALL], description: 'Standard base card' },
  { name: 'Press Proof Silver', color_hex: '#C0C0C0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 2, box_exclusivity: [ALL], description: 'Silver press proof finish — most common parallel' },
  { name: 'Holo Blue Laser', color_hex: '#4169E1', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 3, box_exclusivity: [HOBBY], description: 'Blue holographic laser pattern — Hobby exclusive' },
  { name: 'Holo Red Laser', color_hex: '#CC0000', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 4, box_exclusivity: [BLASTER], description: 'Red holographic laser — Retail Blaster exclusive' },
  { name: 'Holo Orange Laser', color_hex: '#FF8C00', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 5, box_exclusivity: [HANGER], description: 'Orange holographic laser — Hanger exclusive' },
  { name: 'Holo Pink Laser', color_hex: '#FF69B4', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 6, box_exclusivity: [MEGA], description: 'Pink holographic laser — Retail Mega exclusive' },
  { name: 'Holo Teal Laser', color_hex: '#008080', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 7, box_exclusivity: [FAT_PACK], description: 'Teal holographic laser — Fat Pack exclusive' },
  { name: 'Holo Green Laser', color_hex: '#228B22', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 8, box_exclusivity: [CHOICE], description: 'Green holographic laser — Choice exclusive' },
  { name: 'Press Proof Purple', color_hex: '#800080', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 9, box_exclusivity: [ALL], description: 'Purple press proof finish' },

  // ── Numbered Parallels ────────────────────────────────────────
  { name: 'Press Proof Red', color_hex: '#CC0000', print_run: 299, serial_numbered: true, is_one_of_one: false, rarity_rank: 10, box_exclusivity: [ALL], description: 'Red press proof numbered to 299' },
  { name: 'Press Proof Blue', color_hex: '#0055A4', print_run: 249, serial_numbered: true, is_one_of_one: false, rarity_rank: 11, box_exclusivity: [ALL], description: 'Blue press proof numbered to 249' },
  { name: 'Holo Purple Laser', color_hex: '#800080', print_run: 199, serial_numbered: true, is_one_of_one: false, rarity_rank: 12, box_exclusivity: [ALL], description: 'Purple holographic laser /199' },
  { name: 'Press Proof Orange', color_hex: '#FF8C00', print_run: 199, serial_numbered: true, is_one_of_one: false, rarity_rank: 13, box_exclusivity: [ALL], description: 'Orange press proof numbered to 199' },
  { name: 'Holo Gold Laser', color_hex: '#FFD700', print_run: 149, serial_numbered: true, is_one_of_one: false, rarity_rank: 14, box_exclusivity: [ALL], description: 'Gold holographic laser /149' },
  { name: 'Press Proof Green', color_hex: '#228B22', print_run: 149, serial_numbered: true, is_one_of_one: false, rarity_rank: 15, box_exclusivity: [ALL], description: 'Green press proof numbered to 149' },
  { name: 'Choice Blue', color_hex: '#4169E1', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 16, box_exclusivity: [CHOICE], description: 'Blue Choice /99 — Choice exclusive' },
  { name: 'Press Proof Pink', color_hex: '#FF69B4', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 17, box_exclusivity: [ALL], description: 'Pink press proof numbered to 99' },
  { name: 'FOTL Blue', color_hex: '#4169E1', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 18, box_exclusivity: [FOTL], description: 'Blue FOTL /75 — First Off The Line exclusive' },
  { name: 'Holo Silver Laser', color_hex: '#C0C0C0', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 19, box_exclusivity: [ALL], description: 'Silver holographic laser /75' },
  { name: 'Press Proof Gold', color_hex: '#FFD700', print_run: 49, serial_numbered: true, is_one_of_one: false, rarity_rank: 20, box_exclusivity: [ALL], description: 'Gold press proof numbered to 49' },
  { name: 'Choice Red', color_hex: '#CC0000', print_run: 49, serial_numbered: true, is_one_of_one: false, rarity_rank: 21, box_exclusivity: [CHOICE], description: 'Red Choice /49 — Choice exclusive' },
  { name: 'Holo Black Laser', color_hex: '#1A1A1A', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 22, box_exclusivity: [ALL], description: 'Black holographic laser /25' },
  { name: 'FOTL Gold', color_hex: '#FFD700', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 23, box_exclusivity: [FOTL], description: 'Gold FOTL /25 — First Off The Line exclusive' },
  { name: 'Choice Green', color_hex: '#228B22', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 24, box_exclusivity: [CHOICE], description: 'Green Choice /25 — Choice exclusive' },
  { name: 'Press Proof Platinum', color_hex: '#E5E4E2', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 25, box_exclusivity: [ALL], description: 'Platinum press proof numbered to 10' },
  { name: 'FOTL Green', color_hex: '#228B22', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 26, box_exclusivity: [FOTL], description: 'Green FOTL /10 — First Off The Line exclusive' },
  { name: 'Choice Gold', color_hex: '#FFD700', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 27, box_exclusivity: [CHOICE], description: 'Gold Choice /10 — Choice exclusive' },
  { name: 'Holo White Laser', color_hex: '#FFFFFF', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 28, box_exclusivity: [ALL], description: 'White holographic laser /5' },
  { name: 'FOTL Black', color_hex: '#000000', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 29, box_exclusivity: [FOTL], description: 'Black FOTL /5 — First Off The Line exclusive' },

  // ── 1-of-1 Parallels ─────────────────────────────────────────
  { name: 'Press Proof Black', color_hex: '#000000', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 30, box_exclusivity: [ALL], description: 'Black press proof — 1 of 1. The rarest Donruss parallel.' },
  { name: 'Holo Neon Laser', color_hex: '#39FF14', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 31, box_exclusivity: [ALL], description: 'Neon holographic laser — 1 of 1' },
  { name: 'Choice Nebula', color_hex: '#4B0082', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 32, box_exclusivity: [CHOICE], description: 'Nebula swirl pattern 1/1 — Choice exclusive' },
  { name: 'FOTL One of One', color_hex: '#000000', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 33, box_exclusivity: [FOTL], description: 'FOTL exclusive 1/1 — First Off The Line exclusive' },
];

async function main() {
  console.log(`Seeding 2024-25 Donruss NBA Parallels: ${parallels.length} parallels\n`);

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
  console.log('Deleted old parallels for Donruss NBA 2024-25');

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
  console.log(`Verified: ${count} parallels in DB for Donruss NBA 2024-25`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
