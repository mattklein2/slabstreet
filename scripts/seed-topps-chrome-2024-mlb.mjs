#!/usr/bin/env node

/**
 * Seed complete 2024 Topps Chrome Baseball parallel data.
 * Sources: Cardboard Connection, Beckett, community break data.
 *
 * Usage:
 *   node scripts/seed-topps-chrome-2024-mlb.mjs
 *   node scripts/seed-topps-chrome-2024-mlb.mjs --dry-run
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

const PRODUCT_ID = 'c0000000-0000-0000-0000-000000000006'; // 2024 Topps Chrome MLB

const HOBBY = 'Hobby';
const JUMBO = 'Jumbo';
const LITE = 'Lite';
const BLASTER = 'Retail Blaster';
const MEGA = 'Retail Mega';
const HANGER = 'Hanger';
const CELLO = 'Fat Pack/Cello';
const ALL = 'All';

// Complete parallel data for 2024 Topps Chrome Baseball
const parallels = [
  // ── Unnumbered Parallels ──────────────────────────────────────
  { name: 'Base', color_hex: null, print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1, box_exclusivity: [ALL], description: 'Standard base Chrome card' },
  { name: 'Refractor', color_hex: '#C0C0C0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 2, box_exclusivity: [ALL], description: 'The iconic Chrome refractor — rainbow shimmer finish' },
  { name: 'Prism Refractor', color_hex: '#E8E8FF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 3, box_exclusivity: [HOBBY, JUMBO], description: 'Prism pattern refractor — Hobby/Jumbo exclusive' },
  { name: 'Wave Refractor', color_hex: '#87CEEB', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 4, box_exclusivity: [ALL], description: 'Wavy holographic pattern across the card' },
  { name: 'X-Fractor', color_hex: '#D4D4D4', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 5, box_exclusivity: [ALL], description: 'X-pattern refractor with criss-cross lines' },
  { name: 'Sepia Refractor', color_hex: '#704214', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 6, box_exclusivity: [ALL], description: 'Sepia-toned vintage-look refractor' },
  { name: 'Pink Refractor', color_hex: '#FF69B4', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 7, box_exclusivity: [MEGA], description: 'Pink refractor — Retail Mega exclusive' },
  { name: 'Aqua Refractor', color_hex: '#00CED1', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 8, box_exclusivity: [BLASTER], description: 'Aqua/teal refractor — Retail Blaster exclusive' },
  { name: 'Camo Refractor', color_hex: '#556B2F', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 9, box_exclusivity: [HANGER], description: 'Camouflage pattern refractor — Hanger exclusive' },
  { name: 'Purple Refractor', color_hex: '#800080', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 10, box_exclusivity: [CELLO], description: 'Purple refractor — Fat Pack/Cello exclusive' },
  { name: 'Sapphire', color_hex: '#0F52BA', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 11, box_exclusivity: [LITE], description: 'Deep sapphire blue refractor — Lite exclusive' },

  // ── Numbered Parallels ────────────────────────────────────────
  { name: 'Green Refractor', color_hex: '#228B22', print_run: 299, serial_numbered: true, is_one_of_one: false, rarity_rank: 12, box_exclusivity: [ALL], description: 'Green refractor numbered to 299' },
  { name: 'Blue Refractor', color_hex: '#0055A4', print_run: 199, serial_numbered: true, is_one_of_one: false, rarity_rank: 13, box_exclusivity: [ALL], description: 'Blue refractor numbered to 199' },
  { name: 'Rose Gold Refractor', color_hex: '#B76E79', print_run: 175, serial_numbered: true, is_one_of_one: false, rarity_rank: 14, box_exclusivity: [ALL], description: 'Rose gold refractor /175' },
  { name: 'Black Refractor', color_hex: '#1A1A1A', print_run: 149, serial_numbered: true, is_one_of_one: false, rarity_rank: 15, box_exclusivity: [ALL], description: 'Black refractor numbered to 149' },
  { name: 'Magenta Refractor', color_hex: '#FF00FF', print_run: 125, serial_numbered: true, is_one_of_one: false, rarity_rank: 16, box_exclusivity: [JUMBO], description: 'Magenta refractor /125 — Jumbo exclusive' },
  { name: 'Aqua Wave Refractor', color_hex: '#00CED1', print_run: 125, serial_numbered: true, is_one_of_one: false, rarity_rank: 17, box_exclusivity: [BLASTER], description: 'Aqua wave refractor /125 — Blaster exclusive' },
  { name: 'Orange Refractor', color_hex: '#FF8C00', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 18, box_exclusivity: [ALL], description: 'Orange refractor numbered to 75' },
  { name: 'Negative Refractor', color_hex: '#2F4F4F', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 19, box_exclusivity: [HOBBY], description: 'Color-inverted negative refractor /75 — Hobby exclusive' },
  { name: 'Red Refractor', color_hex: '#CC0000', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 20, box_exclusivity: [ALL], description: 'Red refractor numbered to 50' },
  { name: 'Gold Refractor', color_hex: '#FFD700', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 21, box_exclusivity: [ALL], description: 'Gold refractor numbered to 50' },
  { name: 'Orange Wave Refractor', color_hex: '#FF8C00', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 22, box_exclusivity: [ALL], description: 'Orange wave refractor /25' },
  { name: 'Red Wave Refractor', color_hex: '#CC0000', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 23, box_exclusivity: [ALL], description: 'Red wave refractor /10' },
  { name: 'Gold Wave Refractor', color_hex: '#FFD700', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 24, box_exclusivity: [ALL], description: 'Gold wave refractor /5' },

  // ── 1-of-1 Parallels ─────────────────────────────────────────
  { name: 'Superfractor', color_hex: '#FFD700', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 25, box_exclusivity: [ALL], description: 'The Superfractor — 1 of 1. The most coveted Chrome parallel.' },
  { name: 'Printing Plates Black', color_hex: '#000000', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 26, box_exclusivity: [ALL], description: 'Black printing plate — 1 of 1' },
  { name: 'Printing Plates Cyan', color_hex: '#00FFFF', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 27, box_exclusivity: [ALL], description: 'Cyan printing plate — 1 of 1' },
  { name: 'Printing Plates Magenta', color_hex: '#FF00FF', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 28, box_exclusivity: [ALL], description: 'Magenta printing plate — 1 of 1' },
  { name: 'Printing Plates Yellow', color_hex: '#FFFF00', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 29, box_exclusivity: [ALL], description: 'Yellow printing plate — 1 of 1' },
];

async function main() {
  console.log(`Seeding 2024 Topps Chrome MLB Parallels: ${parallels.length} parallels\n`);

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
  console.log('Deleted old parallels for Topps Chrome MLB 2024');

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
  console.log(`Verified: ${count} parallels in DB for Topps Chrome MLB 2024`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
