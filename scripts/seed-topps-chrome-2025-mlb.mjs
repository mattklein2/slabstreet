#!/usr/bin/env node

/**
 * Seed complete 2025 Topps Chrome Baseball parallel data.
 * Sources: Beckett, ChecklistInsider, Topps Ripped.
 *
 * Usage:
 *   node scripts/seed-topps-chrome-2025-mlb.mjs
 *   node scripts/seed-topps-chrome-2025-mlb.mjs --dry-run
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

const PRODUCT_ID = 'c0000000-0000-0000-0000-000000000026'; // 2025 Topps Chrome MLB

const HOBBY = 'Hobby';
const JUMBO = 'Jumbo';
const BREAKER = 'Breaker Box';
const MEGA = 'Mega Box';
const BLASTER = 'Value Blaster';
const FANATICS_MEGA = 'Fanatics Mega';
const RETAIL = 'Retail';
const ALL = 'All';

const parallels = [
  // ── Unnumbered Parallels ──────────────────────────────────
  { name: 'Base', color_hex: '#FFFFFF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1, box_exclusivity: [ALL], description: 'Standard chrome base card' },
  { name: 'Refractor', color_hex: '#C0C0C0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 2, box_exclusivity: [HOBBY, JUMBO, BREAKER, RETAIL], description: 'Classic refractor finish' },
  { name: 'Prism Refractor', color_hex: '#D8BFD8', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 3, box_exclusivity: [HOBBY, JUMBO, RETAIL], description: 'Prism-pattern refractor finish' },
  { name: 'Negative Refractor', color_hex: '#2F4F4F', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 4, box_exclusivity: [ALL], description: 'Inverted color negative refractor' },
  { name: 'X-Fractor', color_hex: '#B0B0B0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 5, box_exclusivity: [MEGA], description: 'X-pattern refractor; Mega exclusive' },
  { name: 'Sepia Refractor', color_hex: '#704214', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 6, box_exclusivity: [BLASTER], description: 'Sepia-toned refractor; Value Blaster exclusive' },
  { name: 'RayWave Refractor', color_hex: '#87CEEB', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 7, box_exclusivity: [RETAIL], description: 'RayWave pattern refractor; Retail exclusive' },
  { name: 'Topps Refractor', color_hex: '#B8860B', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 8, box_exclusivity: [FANATICS_MEGA], description: 'Topps-branded refractor; Fanatics Mega exclusive' },
  { name: 'Geometric Refractor', color_hex: '#708090', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 9, box_exclusivity: [BREAKER], description: 'Geometric pattern refractor; Breaker exclusive' },

  // ── Numbered Parallels ────────────────────────────────────
  { name: 'Teal Refractor', color_hex: '#008080', print_run: 299, serial_numbered: true, is_one_of_one: false, rarity_rank: 10, box_exclusivity: [ALL], description: 'Teal-tinted refractor /299' },
  { name: 'Purple Refractor', color_hex: '#9370DB', print_run: 250, serial_numbered: true, is_one_of_one: false, rarity_rank: 11, box_exclusivity: [HOBBY, JUMBO, BREAKER, RETAIL, MEGA], description: 'Purple-tinted refractor /250' },
  { name: 'Purple RayWave Refractor', color_hex: '#8A2BE2', print_run: 250, serial_numbered: true, is_one_of_one: false, rarity_rank: 12, box_exclusivity: [RETAIL], description: 'Purple RayWave refractor /250 — Retail exclusive' },
  { name: 'Aqua Refractor', color_hex: '#00CED1', print_run: 199, serial_numbered: true, is_one_of_one: false, rarity_rank: 13, box_exclusivity: [ALL], description: 'Aqua-tinted refractor /199' },
  { name: 'Aqua Lava Refractor', color_hex: '#48D1CC', print_run: 199, serial_numbered: true, is_one_of_one: false, rarity_rank: 14, box_exclusivity: [ALL], description: 'Aqua lava-pattern refractor /199' },
  { name: 'Aqua RayWave Refractor', color_hex: '#40E0D0', print_run: 199, serial_numbered: true, is_one_of_one: false, rarity_rank: 15, box_exclusivity: [RETAIL], description: 'Aqua RayWave refractor /199 — Retail exclusive' },
  { name: 'Blue Refractor', color_hex: '#4169E1', print_run: 150, serial_numbered: true, is_one_of_one: false, rarity_rank: 16, box_exclusivity: [ALL], description: 'Blue-tinted refractor /150' },
  { name: 'Blue Lava Refractor', color_hex: '#1E90FF', print_run: 150, serial_numbered: true, is_one_of_one: false, rarity_rank: 17, box_exclusivity: [ALL], description: 'Blue lava-pattern refractor /150' },
  { name: 'Blue RayWave Refractor', color_hex: '#6495ED', print_run: 150, serial_numbered: true, is_one_of_one: false, rarity_rank: 18, box_exclusivity: [RETAIL], description: 'Blue RayWave refractor /150 — Retail exclusive' },
  { name: 'Green Refractor', color_hex: '#228B22', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 19, box_exclusivity: [ALL], description: 'Green-tinted refractor /99' },
  { name: 'Green Lava Refractor', color_hex: '#32CD32', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 20, box_exclusivity: [ALL], description: 'Green lava-pattern refractor /99' },
  { name: 'Green RayWave Refractor', color_hex: '#3CB371', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 21, box_exclusivity: [RETAIL], description: 'Green RayWave refractor /99 — Retail exclusive' },
  { name: 'Green Wave Refractor', color_hex: '#2E8B57', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 22, box_exclusivity: [HOBBY], description: 'Green wave-pattern refractor /99 — Hobby exclusive' },
  { name: 'Green Geometric Refractor', color_hex: '#006400', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 23, box_exclusivity: [BREAKER], description: 'Green geometric refractor /99 — Breaker exclusive' },
  { name: 'Gold Refractor', color_hex: '#FFD700', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 24, box_exclusivity: [ALL], description: 'Gold-tinted refractor /50' },
  { name: 'Gold Lava Refractor', color_hex: '#DAA520', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 25, box_exclusivity: [ALL], description: 'Gold lava-pattern refractor /50' },
  { name: 'Gold RayWave Refractor', color_hex: '#FFC125', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 26, box_exclusivity: [RETAIL], description: 'Gold RayWave refractor /50 — Retail exclusive' },
  { name: 'Gold Wave Refractor', color_hex: '#B8860B', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 27, box_exclusivity: [HOBBY], description: 'Gold wave-pattern refractor /50 — Hobby exclusive' },
  { name: 'Gold Geometric Refractor', color_hex: '#CD950C', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 28, box_exclusivity: [BREAKER], description: 'Gold geometric refractor /50 — Breaker exclusive' },
  { name: 'Orange Refractor', color_hex: '#FF8C00', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 29, box_exclusivity: [ALL], description: 'Orange-tinted refractor /25' },
  { name: 'Orange Lava Refractor', color_hex: '#FF6347', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 30, box_exclusivity: [ALL], description: 'Orange lava-pattern refractor /25' },
  { name: 'Orange RayWave Refractor', color_hex: '#FF7F50', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 31, box_exclusivity: [RETAIL], description: 'Orange RayWave refractor /25 — Retail exclusive' },
  { name: 'Orange Wave Refractor', color_hex: '#E2681C', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 32, box_exclusivity: [HOBBY], description: 'Orange wave-pattern refractor /25 — Hobby exclusive' },
  { name: 'Orange Geometric Refractor', color_hex: '#CC5500', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 33, box_exclusivity: [BREAKER], description: 'Orange geometric refractor /25 — Breaker exclusive' },
  { name: 'Black Refractor', color_hex: '#1C1C1C', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 34, box_exclusivity: [ALL], description: 'Black-tinted refractor /10' },
  { name: 'Black Lava Refractor', color_hex: '#2F2F2F', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 35, box_exclusivity: [ALL], description: 'Black lava-pattern refractor /10' },
  { name: 'Black RayWave Refractor', color_hex: '#3B3B3B', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 36, box_exclusivity: [RETAIL], description: 'Black RayWave refractor /10 — Retail exclusive' },
  { name: 'Black Wave Refractor', color_hex: '#333333', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 37, box_exclusivity: [HOBBY], description: 'Black wave-pattern refractor /10 — Hobby exclusive' },
  { name: 'Black Geometric Refractor', color_hex: '#292929', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 38, box_exclusivity: [BREAKER], description: 'Black geometric refractor /10 — Breaker exclusive' },
  { name: 'Red Refractor', color_hex: '#DC143C', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 39, box_exclusivity: [ALL], description: 'Red-tinted refractor /5' },
  { name: 'Red Lava Refractor', color_hex: '#FF0000', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 40, box_exclusivity: [ALL], description: 'Red lava-pattern refractor /5' },
  { name: 'Red RayWave Refractor', color_hex: '#CD5C5C', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 41, box_exclusivity: [RETAIL], description: 'Red RayWave refractor /5 — Retail exclusive' },
  { name: 'Red Wave Refractor', color_hex: '#B22222', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 42, box_exclusivity: [HOBBY], description: 'Red wave-pattern refractor /5 — Hobby exclusive' },
  { name: 'Red Geometric Refractor', color_hex: '#8B0000', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 43, box_exclusivity: [BREAKER], description: 'Red geometric refractor /5 — Breaker exclusive' },
  { name: 'FrozenFractor', color_hex: '#E0F7FA', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 44, box_exclusivity: [HOBBY], description: 'Frozen crystal refractor /5 — Hobby exclusive' },
  { name: 'Murakami Variation', color_hex: '#FF69B4', print_run: 3, serial_numbered: true, is_one_of_one: false, rarity_rank: 45, box_exclusivity: [HOBBY, JUMBO, BREAKER], description: 'Takashi Murakami collaboration variation /3' },

  // ── 1-of-1 Parallels ─────────────────────────────────────
  { name: 'SuperFractor', color_hex: '#FFD700', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 46, box_exclusivity: [ALL], description: 'The ultimate chrome chase — SuperFractor 1/1' },
  { name: 'Printing Plate Cyan', color_hex: '#00FFFF', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 47, box_exclusivity: [ALL], description: 'Cyan printing plate — 1 of 1' },
  { name: 'Printing Plate Magenta', color_hex: '#FF00FF', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 48, box_exclusivity: [ALL], description: 'Magenta printing plate — 1 of 1' },
  { name: 'Printing Plate Yellow', color_hex: '#FFFF00', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 49, box_exclusivity: [ALL], description: 'Yellow printing plate — 1 of 1' },
  { name: 'Printing Plate Black', color_hex: '#000000', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 50, box_exclusivity: [ALL], description: 'Black printing plate — 1 of 1' },
];

async function main() {
  console.log(`Seeding 2025 Topps Chrome MLB Parallels: ${parallels.length} parallels\n`);

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
  console.log('Deleted old parallels for Topps Chrome MLB 2025');

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
  console.log(`Verified: ${count} parallels in DB for Topps Chrome MLB 2025`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
