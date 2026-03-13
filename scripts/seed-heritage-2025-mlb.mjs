#!/usr/bin/env node

/**
 * Seed complete 2025 Topps Heritage Baseball parallel data.
 * Includes both standard paper parallels and chrome base parallels.
 * Sources: Beckett, ChecklistInsider, Cardboard Connection.
 *
 * Usage:
 *   node scripts/seed-heritage-2025-mlb.mjs
 *   node scripts/seed-heritage-2025-mlb.mjs --dry-run
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

const PRODUCT_ID = 'c0000000-0000-0000-0000-000000000028'; // 2025 Topps Heritage MLB

const HOBBY = 'Hobby';
const BLASTER = 'Value Blaster';
const MEGA = 'Mega Box';
const HANGER = 'Hanger';
const FAT_PACK = 'Fat Pack';
const ALL = 'All';

const parallels = [
  // ══════════════════════════════════════════════════════════
  // STANDARD PAPER PARALLELS
  // ══════════════════════════════════════════════════════════
  { name: 'Base', color_hex: '#FFFFFF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1, box_exclusivity: [ALL], description: 'Standard Heritage base card (1976 Topps design tribute)' },
  { name: 'Dark Blue Border', color_hex: '#00008B', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 2, box_exclusivity: [HOBBY], description: 'Dark blue bordered parallel; Hobby exclusive (~1:4 packs)' },
  { name: 'Dark Green Border', color_hex: '#006400', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 3, box_exclusivity: [BLASTER], description: 'Dark green bordered parallel; Value Blaster exclusive (~1:5 packs)' },
  { name: 'Dark Yellow Border', color_hex: '#DAA520', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 4, box_exclusivity: [FAT_PACK], description: 'Dark yellow bordered parallel; Fat Pack exclusive (~1:2 packs)' },
  { name: 'Light Purple Border', color_hex: '#D8BFD8', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 5, box_exclusivity: [HANGER], description: 'Light purple bordered parallel; Hanger exclusive (~1:1-2 packs)' },
  { name: 'Red Border', color_hex: '#DC143C', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 6, box_exclusivity: [MEGA], description: 'Red bordered parallel; Mega Box exclusive (~1:5 packs)' },
  { name: 'Black Border', color_hex: '#1C1C1C', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 7, box_exclusivity: [HOBBY], description: 'Black bordered parallel; Hobby exclusive (~1:107 packs)' },
  { name: 'Flip Stock', color_hex: '#F5DEB3', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 8, box_exclusivity: [HOBBY], description: 'Reverse-printed card stock; Hobby exclusive (~1:1,059 packs)' },
  { name: 'Bicentennial', color_hex: '#B22222', print_run: 200, serial_numbered: true, is_one_of_one: false, rarity_rank: 9, box_exclusivity: [ALL], description: 'Bicentennial-themed parallel /200 (1976 tribute)' },
  { name: 'Color of the Year', color_hex: '#6A5ACD', print_run: 76, serial_numbered: true, is_one_of_one: false, rarity_rank: 10, box_exclusivity: [ALL], description: 'Color of the Year themed parallel /76 (1976 tribute)' },

  // ══════════════════════════════════════════════════════════
  // CHROME BASE PARALLELS
  // ══════════════════════════════════════════════════════════
  { name: 'Chrome Refractor', color_hex: '#C0C0C0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 11, box_exclusivity: [ALL], description: 'Chrome refractor version of the base card' },
  { name: 'Light Blue Sparkle Refractor', color_hex: '#ADD8E6', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 12, box_exclusivity: [HOBBY], description: 'Light blue sparkle chrome refractor; Hobby exclusive' },
  { name: 'Pink Sparkle Refractor', color_hex: '#FFB6C1', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 13, box_exclusivity: [BLASTER], description: 'Pink sparkle chrome refractor; Value Blaster exclusive' },
  { name: 'Aqua Sparkle Refractor', color_hex: '#48D1CC', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 14, box_exclusivity: [FAT_PACK], description: 'Aqua sparkle chrome refractor; Fat Pack exclusive' },
  { name: 'Burgundy Sparkle Refractor', color_hex: '#800020', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 15, box_exclusivity: [HANGER], description: 'Burgundy sparkle chrome refractor; Hanger exclusive' },
  { name: 'Silver Sparkle Refractor', color_hex: '#C0C0C0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 16, box_exclusivity: [MEGA], description: 'Silver sparkle chrome refractor; Mega Box exclusive' },
  { name: 'Blue Bordered Refractor', color_hex: '#4169E1', print_run: 150, serial_numbered: true, is_one_of_one: false, rarity_rank: 17, box_exclusivity: [ALL], description: 'Blue bordered chrome refractor /150' },
  { name: 'Green Bordered Refractor', color_hex: '#228B22', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 18, box_exclusivity: [ALL], description: 'Green bordered chrome refractor /99' },
  { name: 'Black Bordered Refractor', color_hex: '#1C1C1C', print_run: 76, serial_numbered: true, is_one_of_one: false, rarity_rank: 19, box_exclusivity: [ALL], description: 'Black bordered chrome refractor /76' },
  { name: 'Gold Bordered Refractor', color_hex: '#FFD700', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 20, box_exclusivity: [HOBBY], description: 'Gold bordered chrome refractor /50 — Hobby exclusive' },
  { name: 'Orange Bordered Refractor', color_hex: '#FF8C00', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 21, box_exclusivity: [ALL], description: 'Orange bordered chrome refractor /25' },
  { name: 'Red Bordered Refractor', color_hex: '#DC143C', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 22, box_exclusivity: [ALL], description: 'Red bordered chrome refractor /5' },
  { name: 'SuperFractor', color_hex: '#FFD700', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 23, box_exclusivity: [ALL], description: 'Chrome SuperFractor — true 1/1' },
];

async function main() {
  console.log(`Seeding 2025 Topps Heritage MLB Parallels: ${parallels.length} parallels\n`);

  if (DRY_RUN) {
    console.log('DRY RUN — no changes made.\n');
    const paper = parallels.filter(p => p.rarity_rank <= 10);
    const chrome = parallels.filter(p => p.rarity_rank > 10);
    console.log(`Paper parallels: ${paper.length}`);
    console.log(`Chrome parallels: ${chrome.length}`);
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
  console.log('Deleted old parallels for Topps Heritage MLB 2025');

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
  console.log(`Verified: ${count} parallels in DB for Topps Heritage MLB 2025`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
