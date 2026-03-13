#!/usr/bin/env node

/**
 * Seed complete 2024-25 Upper Deck Series 1 Hockey parallel data.
 * Sources: Cardboard Connection, Beckett, community break data.
 *
 * Usage:
 *   node scripts/seed-upper-deck-s1-2024-25-nhl.mjs
 *   node scripts/seed-upper-deck-s1-2024-25-nhl.mjs --dry-run
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

const PRODUCT_ID = 'c0000000-0000-0000-0000-000000000008'; // 2024-25 Upper Deck Series 1 NHL

const HOBBY = 'Hobby';
const BLASTER = 'Retail Blaster';
const MEGA = 'Retail Mega';
const TIN = 'Tin';
const HANGER = 'Hanger';
const FAT_PACK = 'Fat Pack';
const ALL = 'All';

// Complete parallel data for 2024-25 Upper Deck Series 1 Hockey
const parallels = [
  // ── Unnumbered Parallels ──────────────────────────────────────
  { name: 'Base', color_hex: null, print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1, box_exclusivity: [ALL], description: 'Standard base card' },
  { name: 'French Variation', color_hex: null, print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 2, box_exclusivity: [ALL], description: 'French language version of the base card' },
  { name: 'Silver Foil', color_hex: '#C0C0C0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 3, box_exclusivity: [ALL], description: 'Silver foil board parallel' },
  { name: 'Clear Cut', color_hex: '#F0F8FF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 4, box_exclusivity: [HOBBY], description: 'Acetate clear card — Hobby exclusive' },
  { name: 'Dazzlers Blue', color_hex: '#4169E1', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 5, box_exclusivity: [ALL], description: 'Blue dazzler sparkle pattern' },
  { name: 'Dazzlers Pink', color_hex: '#FF69B4', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 6, box_exclusivity: [BLASTER], description: 'Pink dazzler sparkle — Retail Blaster exclusive' },
  { name: 'Dazzlers Orange', color_hex: '#FF8C00', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 7, box_exclusivity: [HANGER], description: 'Orange dazzler sparkle — Hanger exclusive' },

  // ── Numbered Parallels ────────────────────────────────────────
  { name: 'Exclusives', color_hex: '#228B22', print_run: 100, serial_numbered: true, is_one_of_one: false, rarity_rank: 8, box_exclusivity: [ALL], description: 'Green-bordered exclusives /100' },
  { name: 'Dazzlers Gold', color_hex: '#FFD700', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 9, box_exclusivity: [ALL], description: 'Gold dazzler sparkle /50' },
  { name: 'Speckled Rainbow Foil', color_hex: '#FF00FF', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 10, box_exclusivity: [HOBBY], description: 'Speckled rainbow foil /25 — Hobby exclusive' },
  { name: 'Gold Foil', color_hex: '#FFD700', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 11, box_exclusivity: [ALL], description: 'Gold foil board parallel /25' },
  { name: 'Red Foil', color_hex: '#CC0000', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 12, box_exclusivity: [ALL], description: 'Red foil board parallel /10' },

  // ── 1-of-1 Parallels ─────────────────────────────────────────
  { name: 'High Gloss', color_hex: '#E5E4E2', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 13, box_exclusivity: [ALL], description: 'High gloss finish — 1 of 1. The rarest Upper Deck base parallel.' },
  { name: 'Printing Plates Black', color_hex: '#000000', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 14, box_exclusivity: [ALL], description: 'Black printing plate — 1 of 1' },
  { name: 'Printing Plates Cyan', color_hex: '#00FFFF', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 15, box_exclusivity: [ALL], description: 'Cyan printing plate — 1 of 1' },
  { name: 'Printing Plates Magenta', color_hex: '#FF00FF', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 16, box_exclusivity: [ALL], description: 'Magenta printing plate — 1 of 1' },
  { name: 'Printing Plates Yellow', color_hex: '#FFFF00', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 17, box_exclusivity: [ALL], description: 'Yellow printing plate — 1 of 1' },
];

async function main() {
  console.log(`Seeding 2024-25 Upper Deck Series 1 NHL Parallels: ${parallels.length} parallels\n`);

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
  console.log('Deleted old parallels for Upper Deck Series 1 NHL 2024-25');

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
  console.log(`Verified: ${count} parallels in DB for Upper Deck Series 1 NHL 2024-25`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
