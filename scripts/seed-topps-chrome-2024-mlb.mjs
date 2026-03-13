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
const DELIGHT = 'Breaker Delight';
const BLASTER = 'Value Blaster';
const MONSTER = 'Monster Box';
const MEGA = 'Mega Box';
const FANATICS = 'Fanatics Fest NYC';
const ALL = 'All';

// Complete parallel data for 2024 Topps Chrome Baseball
// Corrected via Beckett, BaseballCardPedia, Topps Ripped, ChecklistInsider
const parallels = [
  // ── Unnumbered Parallels (9) ──────────────────────────────────
  { name: 'Base', color_hex: '#E8E8E8', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1, box_exclusivity: [ALL], description: 'Standard chrome base card' },
  { name: 'Refractor', color_hex: '#C0C0C0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 2, box_exclusivity: [ALL], description: 'Standard chrome refractor with rainbow sheen' },
  { name: 'Prism Refractor', color_hex: '#D8BFD8', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 3, box_exclusivity: [ALL], description: 'Prism-patterned refractor with mosaic light effect' },
  { name: 'X-Fractor', color_hex: '#A9A9A9', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 4, box_exclusivity: [MEGA], description: 'X-shaped refraction pattern — Mega Box exclusive (10 per box)' },
  { name: 'Sepia Refractor', color_hex: '#704214', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 5, box_exclusivity: [BLASTER], description: 'Warm sepia-toned refractor — Value Blaster exclusive' },
  { name: 'Pink Refractor', color_hex: '#FF69B4', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 6, box_exclusivity: [BLASTER], description: 'Pink-tinted refractor — Value Blaster exclusive' },
  { name: 'RayWave Refractor', color_hex: '#00CED1', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 7, box_exclusivity: [BLASTER, MONSTER], description: 'Wavy ray-pattern refractor — retail exclusive' },
  { name: 'Negative Refractor', color_hex: '#1A1A2E', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 8, box_exclusivity: [ALL], description: 'Color-inverted negative image refractor — scarce unnumbered SSP' },
  { name: 'Lightboard Logo Refractor', color_hex: '#39FF14', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 9, box_exclusivity: [BLASTER, MONSTER], description: 'Illuminated team logo variation — retail exclusive SSP' },

  // ── Numbered Parallels (28) ───────────────────────────────────
  { name: 'Magenta Speckle Refractor', color_hex: '#FF00FF', print_run: 350, serial_numbered: true, is_one_of_one: false, rarity_rank: 10, box_exclusivity: [ALL], description: 'Magenta speckled pattern refractor /350' },
  { name: 'Purple Speckle Refractor', color_hex: '#800080', print_run: 299, serial_numbered: true, is_one_of_one: false, rarity_rank: 11, box_exclusivity: [ALL], description: 'Purple speckled pattern refractor /299' },
  { name: 'Purple Sonar Refractor', color_hex: '#9B30FF', print_run: 275, serial_numbered: true, is_one_of_one: false, rarity_rank: 12, box_exclusivity: [BLASTER, MONSTER, MEGA], description: 'Purple sonar-wave pattern refractor /275 — retail exclusive' },
  { name: 'Purple Refractor', color_hex: '#7B2D8E', print_run: 250, serial_numbered: true, is_one_of_one: false, rarity_rank: 13, box_exclusivity: [ALL], description: 'Purple chrome refractor /250' },
  { name: 'Aqua Refractor', color_hex: '#00FFFF', print_run: 199, serial_numbered: true, is_one_of_one: false, rarity_rank: 14, box_exclusivity: [ALL], description: 'Aqua chrome refractor /199' },
  { name: 'Aqua Lava Refractor', color_hex: '#008B8B', print_run: 199, serial_numbered: true, is_one_of_one: false, rarity_rank: 15, box_exclusivity: [ALL], description: 'Aqua lava-textured refractor /199' },
  { name: 'Aqua RayWave Refractor', color_hex: '#20B2AA', print_run: 199, serial_numbered: true, is_one_of_one: false, rarity_rank: 16, box_exclusivity: [BLASTER, MONSTER, MEGA], description: 'Aqua ray-wave pattern refractor /199 — retail exclusive' },
  { name: 'Blue Refractor', color_hex: '#0000FF', print_run: 150, serial_numbered: true, is_one_of_one: false, rarity_rank: 17, box_exclusivity: [ALL], description: 'Blue chrome refractor /150' },
  { name: 'Blue RayWave Refractor', color_hex: '#1E90FF', print_run: 150, serial_numbered: true, is_one_of_one: false, rarity_rank: 18, box_exclusivity: [BLASTER, MONSTER, MEGA], description: 'Blue ray-wave pattern refractor /150 — retail exclusive' },
  { name: 'Blue Sonar Refractor', color_hex: '#4169E1', print_run: 125, serial_numbered: true, is_one_of_one: false, rarity_rank: 19, box_exclusivity: [ALL], description: 'Blue sonar-wave pattern refractor /125' },
  { name: 'Green Refractor', color_hex: '#00A550', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 20, box_exclusivity: [ALL], description: 'Green chrome refractor /99' },
  { name: 'Green Wave Refractor', color_hex: '#2E8B57', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 21, box_exclusivity: [HOBBY, JUMBO, DELIGHT], description: 'Green wave-pattern refractor /99 — Hobby/Jumbo/Delight exclusive' },
  { name: 'Green RayWave Refractor', color_hex: '#3CB371', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 22, box_exclusivity: [BLASTER, MONSTER, MEGA], description: 'Green ray-wave pattern refractor /99 — retail exclusive' },
  { name: 'Green Sonar Refractor', color_hex: '#228B22', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 23, box_exclusivity: [ALL], description: 'Green sonar-wave pattern refractor /99' },
  { name: 'Blue Wave Refractor', color_hex: '#0047AB', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 24, box_exclusivity: [HOBBY, JUMBO, DELIGHT], description: 'Blue wave-pattern refractor /75 — Hobby/Jumbo/Delight exclusive' },
  { name: 'Gold Refractor', color_hex: '#FFD700', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 25, box_exclusivity: [ALL], description: 'Gold chrome refractor /50' },
  { name: 'Gold Wave Refractor', color_hex: '#DAA520', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 26, box_exclusivity: [HOBBY, JUMBO, DELIGHT], description: 'Gold wave-pattern refractor /50 — Hobby/Jumbo/Delight exclusive' },
  { name: 'Gold RayWave Refractor', color_hex: '#B8860B', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 27, box_exclusivity: [BLASTER, MONSTER, MEGA], description: 'Gold ray-wave pattern refractor /50 — retail exclusive' },
  { name: 'Orange Refractor', color_hex: '#FF8C00', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 28, box_exclusivity: [HOBBY], description: 'Orange chrome refractor /25 — Hobby exclusive' },
  { name: 'Orange Wave Refractor', color_hex: '#FF6600', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 29, box_exclusivity: [HOBBY, JUMBO, DELIGHT], description: 'Orange wave-pattern refractor /25 — Hobby/Jumbo/Delight exclusive' },
  { name: 'Orange RayWave Refractor', color_hex: '#CC5500', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 30, box_exclusivity: [BLASTER, MONSTER, MEGA], description: 'Orange ray-wave pattern refractor /25 — retail exclusive' },
  { name: 'Black Refractor', color_hex: '#1C1C1C', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 31, box_exclusivity: [ALL], description: 'Black chrome refractor /10' },
  { name: 'Black RayWave Refractor', color_hex: '#2C2C2C', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 32, box_exclusivity: [BLASTER, MONSTER, MEGA], description: 'Black ray-wave pattern refractor /10 — retail exclusive' },
  { name: 'FrozenFractor', color_hex: '#A5F2F3', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 33, box_exclusivity: [JUMBO], description: 'Ice-textured refractor with sub-zero numbering — Jumbo exclusive' },
  { name: 'Red Refractor', color_hex: '#FF0000', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 34, box_exclusivity: [ALL], description: 'Red chrome refractor /5' },
  { name: 'Red Wave Refractor', color_hex: '#CC0000', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 35, box_exclusivity: [HOBBY, JUMBO, DELIGHT], description: 'Red wave-pattern refractor /5 — Hobby/Jumbo/Delight exclusive' },
  { name: 'Red RayWave Refractor', color_hex: '#8B0000', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 36, box_exclusivity: [BLASTER, MONSTER, MEGA], description: 'Red ray-wave pattern refractor /5 — retail exclusive' },

  // ── 1-of-1 Parallels (5) ─────────────────────────────────────
  { name: 'Printing Plate Black', color_hex: '#000000', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 37, box_exclusivity: [ALL], description: 'Black printing plate — 1 of 1' },
  { name: 'Printing Plate Cyan', color_hex: '#00FFFF', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 38, box_exclusivity: [ALL], description: 'Cyan printing plate — 1 of 1' },
  { name: 'Printing Plate Magenta', color_hex: '#FF00FF', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 39, box_exclusivity: [ALL], description: 'Magenta printing plate — 1 of 1' },
  { name: 'Printing Plate Yellow', color_hex: '#FFFF00', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 40, box_exclusivity: [ALL], description: 'Yellow printing plate — 1 of 1' },
  { name: 'Superfractor', color_hex: '#FFD700', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 41, box_exclusivity: [ALL], description: 'The ultimate 1/1 chrome parallel — gold-bordered superfractor' },
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
