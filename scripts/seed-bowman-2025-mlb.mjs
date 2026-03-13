#!/usr/bin/env node

/**
 * Seed complete 2025 Bowman Baseball parallel data.
 * Includes both base paper parallels and chrome prospect parallels.
 * Sources: Beckett, ChecklistInsider, Cardboard Connection.
 *
 * Usage:
 *   node scripts/seed-bowman-2025-mlb.mjs
 *   node scripts/seed-bowman-2025-mlb.mjs --dry-run
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

const PRODUCT_ID = 'c0000000-0000-0000-0000-000000000027'; // 2025 Bowman MLB

const HOBBY = 'Hobby';
const JUMBO = 'Jumbo';
const BREAKER = 'Breaker Box';
const BLASTER = 'Value Blaster';
const ALL = 'All';
const MULTI = 'All'; // "Multi" in source means available across formats

const parallels = [
  // ══════════════════════════════════════════════════════════
  // BASE PAPER PARALLELS (100-card base set)
  // ══════════════════════════════════════════════════════════
  { name: 'Base Paper', color_hex: '#FFFFFF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1, box_exclusivity: [ALL], description: 'Standard paper base card; 100-card set' },
  { name: 'Bowman Retro Logo Foil', color_hex: '#C0C0C0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 2, box_exclusivity: [HOBBY], description: 'Retro Bowman logo foil pattern; Hobby exclusive unnumbered' },
  { name: 'Sky Blue Border', color_hex: '#87CEEB', print_run: 499, serial_numbered: true, is_one_of_one: false, rarity_rank: 3, box_exclusivity: [HOBBY], description: 'Sky blue paper border /499' },
  { name: 'Neon Green Border', color_hex: '#39FF14', print_run: 399, serial_numbered: true, is_one_of_one: false, rarity_rank: 4, box_exclusivity: [HOBBY], description: 'Neon green paper border /399' },
  { name: 'Fuchsia Border', color_hex: '#FF00FF', print_run: 299, serial_numbered: true, is_one_of_one: false, rarity_rank: 5, box_exclusivity: [HOBBY], description: 'Fuchsia paper border /299' },
  { name: 'Purple Border', color_hex: '#9370DB', print_run: 250, serial_numbered: true, is_one_of_one: false, rarity_rank: 6, box_exclusivity: [HOBBY], description: 'Purple paper border /250' },
  { name: 'Purple Pattern Border', color_hex: '#8A2BE2', print_run: 199, serial_numbered: true, is_one_of_one: false, rarity_rank: 7, box_exclusivity: [HOBBY], description: 'Purple pattern paper border /199' },
  { name: 'Pink Border', color_hex: '#FF69B4', print_run: 175, serial_numbered: true, is_one_of_one: false, rarity_rank: 8, box_exclusivity: [HOBBY], description: 'Pink paper border /175' },
  { name: 'Blue Border', color_hex: '#4169E1', print_run: 150, serial_numbered: true, is_one_of_one: false, rarity_rank: 9, box_exclusivity: [HOBBY], description: 'Blue paper border /150' },
  { name: 'Blue Pattern Border', color_hex: '#1E90FF', print_run: 125, serial_numbered: true, is_one_of_one: false, rarity_rank: 10, box_exclusivity: [HOBBY], description: 'Blue pattern paper border /125' },
  { name: 'Green Border', color_hex: '#228B22', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 11, box_exclusivity: [BLASTER], description: 'Green paper border /99 — Value Blaster exclusive' },
  { name: 'Green Pattern Border', color_hex: '#32CD32', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 12, box_exclusivity: [BLASTER], description: 'Green pattern paper border /99 — Value Blaster exclusive' },
  { name: 'Yellow Border', color_hex: '#FFD700', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 13, box_exclusivity: [HOBBY], description: 'Yellow paper border /75' },
  { name: 'Yellow Pattern Border', color_hex: '#FFC125', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 14, box_exclusivity: [HOBBY], description: 'Yellow pattern paper border /75' },
  { name: 'Gold Border', color_hex: '#DAA520', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 15, box_exclusivity: [HOBBY], description: 'Gold paper border /50' },
  { name: 'Orange Border', color_hex: '#FF8C00', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 16, box_exclusivity: [HOBBY], description: 'Orange paper border /25' },
  { name: 'Black Border', color_hex: '#1C1C1C', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 17, box_exclusivity: [HOBBY], description: 'Black paper border /10' },
  { name: 'Black Pattern Border', color_hex: '#2F2F2F', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 18, box_exclusivity: [HOBBY], description: 'Black pattern paper border /10' },
  { name: 'Red Border', color_hex: '#DC143C', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 19, box_exclusivity: [HOBBY], description: 'Red paper border /5' },
  { name: 'Platinum Border', color_hex: '#E5E4E2', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 20, box_exclusivity: [HOBBY], description: 'Platinum paper border — true 1/1' },
  { name: 'Paper Printing Plate Cyan', color_hex: '#00FFFF', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 21, box_exclusivity: [HOBBY], description: 'Cyan printing plate (paper) — 1 of 1' },
  { name: 'Paper Printing Plate Magenta', color_hex: '#FF00FF', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 22, box_exclusivity: [HOBBY], description: 'Magenta printing plate (paper) — 1 of 1' },
  { name: 'Paper Printing Plate Yellow', color_hex: '#FFFF00', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 23, box_exclusivity: [HOBBY], description: 'Yellow printing plate (paper) — 1 of 1' },
  { name: 'Paper Printing Plate Black', color_hex: '#000000', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 24, box_exclusivity: [HOBBY], description: 'Black printing plate (paper) — 1 of 1' },

  // ══════════════════════════════════════════════════════════
  // CHROME PROSPECT PARALLELS (150-card prospect set)
  // ══════════════════════════════════════════════════════════
  { name: 'Chrome Base', color_hex: '#E8E8E8', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 25, box_exclusivity: [ALL], description: 'Standard chrome prospect card; 150-card set' },
  { name: 'Mini Diamond Refractor', color_hex: '#B9F2FF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 26, box_exclusivity: [HOBBY], description: 'Mini diamond-pattern refractor; unnumbered' },
  { name: 'X-Fractor', color_hex: '#B0B0B0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 27, box_exclusivity: [HOBBY], description: 'X-pattern refractor; unnumbered' },
  { name: 'Pearl Refractor', color_hex: '#FDEEF4', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 28, box_exclusivity: [HOBBY], description: 'Pearl finish refractor; unnumbered' },
  { name: 'Gum Ball Refractor', color_hex: '#FF6B81', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 29, box_exclusivity: [HOBBY], description: 'Gum ball themed refractor; unnumbered' },
  { name: 'Sunflower Seeds Refractor', color_hex: '#F4D03F', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 30, box_exclusivity: [HOBBY], description: 'Sunflower seeds themed refractor; unnumbered' },
  { name: 'Peanuts Refractor', color_hex: '#C19A6B', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 31, box_exclusivity: [HOBBY], description: 'Peanuts themed refractor; unnumbered' },
  { name: 'Popcorn Refractor', color_hex: '#FFFDD0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 32, box_exclusivity: [HOBBY], description: 'Popcorn themed refractor; unnumbered' },
  { name: 'Reptilian Refractor', color_hex: '#4B6F44', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 33, box_exclusivity: [ALL], description: 'Reptilian scale-pattern refractor; unnumbered' },
  { name: 'FireFractor', color_hex: '#FF4500', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 34, box_exclusivity: [BLASTER], description: 'Fire-pattern refractor; Value Blaster exclusive unnumbered' },
  { name: 'Refractor', color_hex: '#C0C0C0', print_run: 499, serial_numbered: true, is_one_of_one: false, rarity_rank: 35, box_exclusivity: [ALL], description: 'Classic chrome refractor /499' },
  { name: 'Lava Refractor', color_hex: '#E25822', print_run: 399, serial_numbered: true, is_one_of_one: false, rarity_rank: 36, box_exclusivity: [ALL], description: 'Lava-pattern refractor /399' },
  { name: 'Wave Refractor', color_hex: '#4682B4', print_run: 350, serial_numbered: true, is_one_of_one: false, rarity_rank: 37, box_exclusivity: [HOBBY], description: 'Wave-pattern refractor /350 — Hobby exclusive' },
  { name: 'Speckle Refractor', color_hex: '#A9A9A9', print_run: 299, serial_numbered: true, is_one_of_one: false, rarity_rank: 38, box_exclusivity: [ALL], description: 'Speckled-pattern refractor /299' },
  { name: 'Purple Refractor', color_hex: '#9370DB', print_run: 250, serial_numbered: true, is_one_of_one: false, rarity_rank: 39, box_exclusivity: [ALL], description: 'Purple-tinted refractor /250' },
  { name: 'Purple RayWave Refractor', color_hex: '#8A2BE2', print_run: 250, serial_numbered: true, is_one_of_one: false, rarity_rank: 40, box_exclusivity: [ALL], description: 'Purple RayWave refractor /250' },
  { name: 'Purple Geometric Refractor', color_hex: '#7B68EE', print_run: 250, serial_numbered: true, is_one_of_one: false, rarity_rank: 41, box_exclusivity: [BREAKER], description: 'Purple geometric refractor /250 — Breaker exclusive' },
  { name: 'Fuchsia Refractor', color_hex: '#FF00FF', print_run: 199, serial_numbered: true, is_one_of_one: false, rarity_rank: 42, box_exclusivity: [ALL], description: 'Fuchsia-tinted refractor /199' },
  { name: 'Reptilian Fuchsia Refractor', color_hex: '#DA70D6', print_run: 199, serial_numbered: true, is_one_of_one: false, rarity_rank: 43, box_exclusivity: [ALL], description: 'Fuchsia reptilian-scale refractor /199' },
  { name: 'Fuchsia Wave Refractor', color_hex: '#EE82EE', print_run: 199, serial_numbered: true, is_one_of_one: false, rarity_rank: 44, box_exclusivity: [ALL], description: 'Fuchsia wave-pattern refractor /199' },
  { name: 'Blue Refractor', color_hex: '#4169E1', print_run: 150, serial_numbered: true, is_one_of_one: false, rarity_rank: 45, box_exclusivity: [ALL], description: 'Blue-tinted refractor /150' },
  { name: 'Reptilian Blue Refractor', color_hex: '#4682B4', print_run: 150, serial_numbered: true, is_one_of_one: false, rarity_rank: 46, box_exclusivity: [ALL], description: 'Blue reptilian-scale refractor /150' },
  { name: 'Blue Shimmer Refractor', color_hex: '#6495ED', print_run: 150, serial_numbered: true, is_one_of_one: false, rarity_rank: 47, box_exclusivity: [ALL], description: 'Blue shimmer refractor /150' },
  { name: 'Blue RayWave Refractor', color_hex: '#1E90FF', print_run: 150, serial_numbered: true, is_one_of_one: false, rarity_rank: 48, box_exclusivity: [HOBBY], description: 'Blue RayWave refractor /150 — Hobby exclusive' },
  { name: 'Blue Geometric Refractor', color_hex: '#0000CD', print_run: 150, serial_numbered: true, is_one_of_one: false, rarity_rank: 49, box_exclusivity: [BREAKER], description: 'Blue geometric refractor /150 — Breaker exclusive' },
  { name: 'Aqua X-Fractor', color_hex: '#00CED1', print_run: 125, serial_numbered: true, is_one_of_one: false, rarity_rank: 50, box_exclusivity: [ALL], description: 'Aqua X-pattern refractor /125' },
  { name: 'Aqua Shimmer Refractor', color_hex: '#48D1CC', print_run: 125, serial_numbered: true, is_one_of_one: false, rarity_rank: 51, box_exclusivity: [ALL], description: 'Aqua shimmer refractor /125' },
  { name: 'Steel Metal Refractor', color_hex: '#71797E', print_run: 100, serial_numbered: true, is_one_of_one: false, rarity_rank: 52, box_exclusivity: [ALL], description: 'Steel metal finish refractor /100' },
  { name: 'Green Grass Refractor', color_hex: '#228B22', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 53, box_exclusivity: [ALL], description: 'Green grass-textured refractor /99' },
  { name: 'Green Refractor', color_hex: '#32CD32', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 54, box_exclusivity: [BLASTER], description: 'Green refractor /99 — Value Blaster exclusive' },
  { name: 'Reptilian Green Refractor', color_hex: '#006400', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 55, box_exclusivity: [BLASTER], description: 'Green reptilian-scale refractor /99 — Value Blaster exclusive' },
  { name: 'Green Shimmer Refractor', color_hex: '#3CB371', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 56, box_exclusivity: [BLASTER], description: 'Green shimmer refractor /99 — Value Blaster exclusive' },
  { name: 'Green Geometric Refractor', color_hex: '#2E8B57', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 57, box_exclusivity: [BREAKER], description: 'Green geometric refractor /99 — Breaker exclusive' },
  { name: 'Yellow Refractor', color_hex: '#FFD700', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 58, box_exclusivity: [ALL], description: 'Yellow-tinted refractor /75' },
  { name: 'Yellow X-Fractor', color_hex: '#FFC125', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 59, box_exclusivity: [ALL], description: 'Yellow X-pattern refractor /75' },
  { name: 'Yellow Wave Refractor', color_hex: '#DAA520', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 60, box_exclusivity: [ALL], description: 'Yellow wave-pattern refractor /75' },
  { name: 'Yellow Geometric Refractor', color_hex: '#B8860B', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 61, box_exclusivity: [BREAKER], description: 'Yellow geometric refractor /75 — Breaker exclusive' },
  { name: 'Gold Refractor', color_hex: '#FFD700', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 62, box_exclusivity: [ALL], description: 'Gold-tinted refractor /50' },
  { name: 'Gold Shimmer Refractor', color_hex: '#DAA520', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 63, box_exclusivity: [ALL], description: 'Gold shimmer refractor /50' },
  { name: 'Reptilian Gold Refractor', color_hex: '#CD950C', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 64, box_exclusivity: [ALL], description: 'Gold reptilian-scale refractor /50' },
  { name: 'Gold Geometric Refractor', color_hex: '#B8860B', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 65, box_exclusivity: [BREAKER], description: 'Gold geometric refractor /50 — Breaker exclusive' },
  { name: 'Orange Refractor', color_hex: '#FF8C00', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 66, box_exclusivity: [HOBBY], description: 'Orange-tinted refractor /25 — Hobby exclusive' },
  { name: 'Orange Shimmer Refractor', color_hex: '#FF6347', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 67, box_exclusivity: [HOBBY], description: 'Orange shimmer refractor /25 — Hobby exclusive' },
  { name: 'Reptilian Orange Refractor', color_hex: '#CC5500', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 68, box_exclusivity: [HOBBY], description: 'Orange reptilian-scale refractor /25 — Hobby exclusive' },
  { name: 'Orange Geometric Refractor', color_hex: '#E2681C', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 69, box_exclusivity: [BREAKER], description: 'Orange geometric refractor /25 — Breaker exclusive' },
  { name: 'Rose Gold Refractor', color_hex: '#B76E79', print_run: 15, serial_numbered: true, is_one_of_one: false, rarity_rank: 70, box_exclusivity: [ALL], description: 'Rose gold-tinted refractor /15' },
  { name: 'Rose Gold Mini Diamond Refractor', color_hex: '#C9837A', print_run: 15, serial_numbered: true, is_one_of_one: false, rarity_rank: 71, box_exclusivity: [ALL], description: 'Rose gold mini diamond refractor /15' },
  { name: 'Black Refractor', color_hex: '#1C1C1C', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 72, box_exclusivity: [ALL], description: 'Black-tinted refractor /10' },
  { name: 'Black X-Fractor', color_hex: '#2F2F2F', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 73, box_exclusivity: [ALL], description: 'Black X-pattern refractor /10' },
  { name: 'Black Geometric Refractor', color_hex: '#292929', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 74, box_exclusivity: [BREAKER], description: 'Black geometric refractor /10 — Breaker exclusive' },
  { name: 'Red Refractor', color_hex: '#DC143C', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 75, box_exclusivity: [ALL], description: 'Red-tinted refractor /5' },
  { name: 'Red Lava Refractor', color_hex: '#FF0000', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 76, box_exclusivity: [ALL], description: 'Red lava-pattern refractor /5' },
  { name: 'Reptilian Red Refractor', color_hex: '#8B0000', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 77, box_exclusivity: [ALL], description: 'Red reptilian-scale refractor /5' },
  { name: 'Red Geometric Refractor', color_hex: '#B22222', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 78, box_exclusivity: [BREAKER], description: 'Red geometric refractor — Breaker exclusive, true 1/1' },
  { name: 'SuperFractor', color_hex: '#FFD700', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 79, box_exclusivity: [ALL], description: 'The ultimate chrome chase — SuperFractor 1/1' },
  { name: 'Chrome Printing Plate Cyan', color_hex: '#00FFFF', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 80, box_exclusivity: [HOBBY], description: 'Cyan printing plate (chrome) — 1 of 1' },
  { name: 'Chrome Printing Plate Magenta', color_hex: '#FF00FF', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 81, box_exclusivity: [HOBBY], description: 'Magenta printing plate (chrome) — 1 of 1' },
  { name: 'Chrome Printing Plate Yellow', color_hex: '#FFFF00', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 82, box_exclusivity: [HOBBY], description: 'Yellow printing plate (chrome) — 1 of 1' },
  { name: 'Chrome Printing Plate Black', color_hex: '#000000', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 83, box_exclusivity: [HOBBY], description: 'Black printing plate (chrome) — 1 of 1' },
];

async function main() {
  console.log(`Seeding 2025 Bowman MLB Parallels: ${parallels.length} parallels\n`);

  if (DRY_RUN) {
    console.log('DRY RUN — no changes made.\n');
    const paper = parallels.filter(p => p.rarity_rank <= 24);
    const chrome = parallels.filter(p => p.rarity_rank > 24);
    console.log(`Paper base parallels: ${paper.length}`);
    console.log(`Chrome prospect parallels: ${chrome.length}`);
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
  console.log('Deleted old parallels for Bowman MLB 2025');

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
  console.log(`Verified: ${count} parallels in DB for Bowman MLB 2025`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
