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
const HOBBY_INTL = 'Hobby International';
const CHOICE = 'Choice';
const ALL = 'All';

// Complete parallel data for 2024-25 Donruss Basketball
// Corrected via Cardboard Connection, Beckett, ChecklistInsider, ChecklistCenter
// Note: No FOTL product for base Donruss (FOTL is Donruss Optic only)
const parallels = [
  // ── Unnumbered Parallels (13) ─────────────────────────────────
  { name: 'Base', color_hex: '#FFFFFF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1, box_exclusivity: [ALL], description: 'Standard base card' },
  { name: 'Yellow Flood', color_hex: '#FFD700', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 2, box_exclusivity: [ALL], description: 'Full yellow flood background effect' },
  { name: 'Wedges', color_hex: '#B0B0B0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 3, box_exclusivity: [ALL], description: 'Geometric wedge pattern overlay' },
  { name: 'Red Wedges', color_hex: '#CC0000', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 4, box_exclusivity: [ALL], description: 'Red-tinted wedge pattern overlay' },
  { name: 'Winter', color_hex: '#A8D8EA', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 5, box_exclusivity: [ALL], description: 'Icy winter theme with cool blue tones' },
  { name: 'Disco', color_hex: '#E8E8E8', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 6, box_exclusivity: [ALL], description: 'Shimmering disco-ball reflective finish' },
  { name: 'Press Proof Silver', color_hex: '#C0C0C0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 7, box_exclusivity: [ALL], description: 'Silver press proof finish' },
  { name: 'Holo Green Laser', color_hex: '#00CC44', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 8, box_exclusivity: [HOBBY, CHOICE], description: 'Green holographic laser refractor' },
  { name: 'Holo Winter', color_hex: '#88CCEE', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 9, box_exclusivity: [ALL], description: 'Holographic winter-themed laser finish' },
  { name: 'International', color_hex: '#1E90FF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 10, box_exclusivity: [HOBBY_INTL], description: 'International flag-themed border design' },
  { name: 'International Holo Maroon Laser', color_hex: '#800000', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 11, box_exclusivity: [HOBBY_INTL], description: 'Maroon holographic laser with international design' },
  { name: 'Choice', color_hex: '#4B0082', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 12, box_exclusivity: [CHOICE], description: 'Choice box base parallel with distinct design' },
  { name: 'Choice Dragon', color_hex: '#8B0000', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 13, box_exclusivity: [CHOICE], description: 'Dragon-scale textured Choice exclusive' },

  // ── Numbered Parallels (39) ───────────────────────────────────
  { name: 'Storm', color_hex: '#4A6274', print_run: 299, serial_numbered: true, is_one_of_one: false, rarity_rank: 14, box_exclusivity: [ALL], description: 'Storm cloud dark swirl pattern — new for 2024-25' },
  { name: 'Press Proof Purple', color_hex: '#7B2D8E', print_run: 199, serial_numbered: true, is_one_of_one: false, rarity_rank: 15, box_exclusivity: [ALL], description: 'Purple press proof finish /199' },
  { name: 'Cubic', color_hex: '#3D9970', print_run: 175, serial_numbered: true, is_one_of_one: false, rarity_rank: 16, box_exclusivity: [ALL], description: '3D cubic geometric pattern overlay /175' },
  { name: 'Holo Laser', color_hex: '#D4D4D4', print_run: 149, serial_numbered: true, is_one_of_one: false, rarity_rank: 17, box_exclusivity: [ALL], description: 'Standard holographic laser refractor /149' },
  { name: 'Red Disco', color_hex: '#DC143C', print_run: 149, serial_numbered: true, is_one_of_one: false, rarity_rank: 18, box_exclusivity: [ALL], description: 'Red-tinted disco shimmer finish /149' },
  { name: 'Teal Explosion', color_hex: '#008080', print_run: 149, serial_numbered: true, is_one_of_one: false, rarity_rank: 19, box_exclusivity: [ALL], description: 'Teal burst explosion pattern /149' },
  { name: 'Crystals', color_hex: '#A7D8DE', print_run: 125, serial_numbered: true, is_one_of_one: false, rarity_rank: 20, box_exclusivity: [ALL], description: 'Crystalline fracture pattern overlay /125' },
  { name: 'Holo Orange Laser', color_hex: '#FF8C00', print_run: 125, serial_numbered: true, is_one_of_one: false, rarity_rank: 21, box_exclusivity: [ALL], description: 'Orange holographic laser refractor /125' },
  { name: 'Hyper', color_hex: '#FF1493', print_run: 125, serial_numbered: true, is_one_of_one: false, rarity_rank: 22, box_exclusivity: [HOBBY], description: 'Hyper-reflective finish /125 — Hobby exclusive, new for 2024-25' },
  { name: 'International Red Stars', color_hex: '#B22222', print_run: 125, serial_numbered: true, is_one_of_one: false, rarity_rank: 23, box_exclusivity: [HOBBY_INTL], description: 'Red star pattern with international border /125' },
  { name: 'Choice Red', color_hex: '#CC0000', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 24, box_exclusivity: [CHOICE], description: 'Red-bordered Choice exclusive /99' },
  { name: 'Holo Purple Laser', color_hex: '#9932CC', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 25, box_exclusivity: [HOBBY, CHOICE], description: 'Purple holographic laser refractor /99' },
  { name: 'Holo Red and Green Laser', color_hex: '#CC3333', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 26, box_exclusivity: [ALL], description: 'Dual red and green holographic laser /99' },
  { name: 'Holo Red Laser', color_hex: '#FF0000', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 27, box_exclusivity: [HOBBY], description: 'Red holographic laser refractor /99 — Hobby exclusive' },
  { name: 'International Blue Fireworks', color_hex: '#1C39BB', print_run: 85, serial_numbered: true, is_one_of_one: false, rarity_rank: 28, box_exclusivity: [HOBBY_INTL], description: 'Blue fireworks burst with international border /85' },
  { name: 'Dots', color_hex: '#FF69B4', print_run: 85, serial_numbered: true, is_one_of_one: false, rarity_rank: 29, box_exclusivity: [ALL], description: 'Polka-dot pattern overlay /85' },
  { name: 'Blue Disco', color_hex: '#4169E1', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 30, box_exclusivity: [ALL], description: 'Blue-tinted disco shimmer finish /75' },
  { name: 'Blue Wedges', color_hex: '#4682B4', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 31, box_exclusivity: [ALL], description: 'Blue-tinted wedge pattern overlay /75' },
  { name: 'Blue Winter', color_hex: '#5B9BD5', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 32, box_exclusivity: [ALL], description: 'Blue winter frost theme /75' },
  { name: 'Press Proof Silver Die-Cut', color_hex: '#C0C0C0', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 33, box_exclusivity: [HOBBY], description: 'Die-cut silver press proof with shaped border /75 — Hobby exclusive' },
  { name: 'Holo Pink Laser', color_hex: '#FF69B4', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 34, box_exclusivity: [ALL], description: 'Pink holographic laser refractor /50' },
  { name: 'Checkerboard', color_hex: '#2F4F4F', print_run: 49, serial_numbered: true, is_one_of_one: false, rarity_rank: 35, box_exclusivity: [ALL], description: 'Checkerboard mosaic pattern overlay /49' },
  { name: 'Choice Blue', color_hex: '#0000CD', print_run: 49, serial_numbered: true, is_one_of_one: false, rarity_rank: 36, box_exclusivity: [CHOICE], description: 'Blue-bordered Choice exclusive /49' },
  { name: 'Holo Blue Laser', color_hex: '#0066FF', print_run: 49, serial_numbered: true, is_one_of_one: false, rarity_rank: 37, box_exclusivity: [HOBBY], description: 'Blue holographic laser refractor /49 — Hobby exclusive' },
  { name: 'Blue Explosion', color_hex: '#3B5998', print_run: 45, serial_numbered: true, is_one_of_one: false, rarity_rank: 38, box_exclusivity: [ALL], description: 'Blue burst explosion pattern /45' },
  { name: 'Holo Blue and Green Laser', color_hex: '#20B2AA', print_run: 30, serial_numbered: true, is_one_of_one: false, rarity_rank: 39, box_exclusivity: [ALL], description: 'Dual blue and green holographic laser /30' },
  { name: 'Press Proof Gold Die-Cut', color_hex: '#FFD700', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 40, box_exclusivity: [HOBBY], description: 'Die-cut gold press proof with shaped border /25 — Hobby exclusive' },
  { name: 'Pink Disco', color_hex: '#FF1493', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 41, box_exclusivity: [ALL], description: 'Pink-tinted disco shimmer finish /25' },
  { name: 'Holo Teal Laser', color_hex: '#008B8B', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 42, box_exclusivity: [ALL], description: 'Teal holographic laser refractor /25' },
  { name: 'Holo Yellow Laser', color_hex: '#FFD700', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 43, box_exclusivity: [ALL], description: 'Yellow holographic laser refractor /25' },
  { name: 'Lava', color_hex: '#CF1020', print_run: 15, serial_numbered: true, is_one_of_one: false, rarity_rank: 44, box_exclusivity: [ALL], description: 'Molten lava flow pattern in red-orange /15' },
  { name: 'Holo Red and Blue Laser', color_hex: '#8B008B', print_run: 15, serial_numbered: true, is_one_of_one: false, rarity_rank: 45, box_exclusivity: [ALL], description: 'Dual red and blue holographic laser /15' },
  { name: 'Choice Gold', color_hex: '#FFD700', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 46, box_exclusivity: [CHOICE], description: 'Gold-bordered Choice exclusive /10' },
  { name: 'Gold Wedges', color_hex: '#DAA520', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 47, box_exclusivity: [ALL], description: 'Gold-tinted wedge pattern overlay /10' },
  { name: 'Gold Winter', color_hex: '#DAA520', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 48, box_exclusivity: [ALL], description: 'Gold winter frost theme /10' },
  { name: 'Holo Gold Laser', color_hex: '#FFD700', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 49, box_exclusivity: [HOBBY], description: 'Gold holographic laser refractor /10 — Hobby exclusive' },
  { name: 'Choice Black Gold', color_hex: '#1C1C1C', print_run: 8, serial_numbered: true, is_one_of_one: false, rarity_rank: 50, box_exclusivity: [CHOICE], description: 'Black with gold accent Choice exclusive /8' },
  { name: 'International Green Scope', color_hex: '#006400', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 51, box_exclusivity: [HOBBY_INTL], description: 'Green scope crosshair with international border /5' },
  { name: 'Swirlorama', color_hex: '#FF4500', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 52, box_exclusivity: [ALL], description: 'Swirling psychedelic color pattern /5' },

  // ── 1-of-1 Parallels (3) ─────────────────────────────────────
  { name: 'Choice Black', color_hex: '#000000', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 53, box_exclusivity: [CHOICE], description: 'Black 1/1 Choice exclusive — ultimate Choice chase' },
  { name: 'Black Wedges', color_hex: '#000000', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 54, box_exclusivity: [ALL], description: 'Black wedge pattern 1/1 superfractor' },
  { name: 'Holo Black Laser', color_hex: '#000000', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 55, box_exclusivity: [HOBBY], description: 'Black holographic laser 1/1 — ultimate Hobby chase card' },
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
