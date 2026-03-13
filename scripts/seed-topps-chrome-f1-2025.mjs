#!/usr/bin/env node

/**
 * Seed complete 2025 Topps Chrome Formula 1 parallel data.
 * This IS the F1 flagship product (no separate paper Topps F1 exists).
 * 37 parallels including SSPs.
 * Sources: Beckett, ChecklistInsider.
 *
 * Usage:
 *   node scripts/seed-topps-chrome-f1-2025.mjs
 *   node scripts/seed-topps-chrome-f1-2025.mjs --dry-run
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

const PRODUCT_ID = 'c0000000-0000-0000-0000-000000000035'; // 2025 Topps Chrome F1

const HOBBY = 'Hobby';
const BLASTER = 'Value Blaster';
const ALL = 'All';

const parallels = [
  // ── Unnumbered ─────────────────────────────────────────
  { name: 'Base', color_hex: '#FFFFFF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1, box_exclusivity: [ALL], description: 'Standard chrome base card; 200-card set' },
  { name: 'Refractor', color_hex: '#C0C0C0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 2, box_exclusivity: [ALL], description: 'Classic refractor (~1:5 Hobby, ~1:3 Blaster)' },
  { name: 'B&W Ray Wave Refractor', color_hex: '#D3D3D3', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 3, box_exclusivity: [BLASTER], description: 'Black & white ray wave; Value Blaster exclusive (~1:2)' },
  { name: 'B&W Lazer Refractor', color_hex: '#A9A9A9', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 4, box_exclusivity: [HOBBY], description: 'Black & white lazer; Hobby exclusive (~1:7)' },
  { name: 'Checker Flag Refractor', color_hex: '#1C1C1C', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 5, box_exclusivity: [HOBBY], description: 'Checkered flag pattern; Hobby (~1:20)' },

  // ── SSP Unnumbered (ultra-rare) ────────────────────────
  { name: 'Helix', color_hex: '#C0C0C0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 6, box_exclusivity: [HOBBY], description: 'Helix pattern SSP (~1:900 packs); Hobby exclusive' },
  { name: 'Ultrasonic', color_hex: '#B0C4DE', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 7, box_exclusivity: [HOBBY], description: 'Ultrasonic pattern SSP (~1:1,200 packs); Hobby exclusive' },
  { name: 'Vegas At Night', color_hex: '#191970', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 8, box_exclusivity: [HOBBY], description: 'Night cityscape SSP (~1:1,920 packs); Hobby exclusive' },
  { name: 'F1 75th Anniversary Logo', color_hex: '#DAA520', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 9, box_exclusivity: [HOBBY], description: '75th anniversary logo SSP (~1:2,066 packs); Hobby exclusive' },
  { name: 'The Grid', color_hex: '#2F4F4F', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 10, box_exclusivity: [HOBBY], description: 'Starting grid SSP (~1:2,400 packs); Hobby exclusive' },
  { name: 'The Grail', color_hex: '#FFD700', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 11, box_exclusivity: [HOBBY], description: 'Ultimate SSP chase (~1:5,951 packs); Hobby exclusive' },

  // ── Numbered ───────────────────────────────────────────
  { name: 'Teal Refractor', color_hex: '#008080', print_run: 299, serial_numbered: true, is_one_of_one: false, rarity_rank: 12, box_exclusivity: [ALL], description: 'Teal refractor /299' },
  { name: 'Pink Refractor', color_hex: '#FF69B4', print_run: 250, serial_numbered: true, is_one_of_one: false, rarity_rank: 13, box_exclusivity: [ALL], description: 'Pink refractor /250' },
  { name: 'Pink Checker Flag Refractor', color_hex: '#FF1493', print_run: 250, serial_numbered: true, is_one_of_one: false, rarity_rank: 14, box_exclusivity: [HOBBY], description: 'Pink checker flag /250; Hobby exclusive' },
  { name: 'Aqua Refractor', color_hex: '#00CED1', print_run: 199, serial_numbered: true, is_one_of_one: false, rarity_rank: 15, box_exclusivity: [ALL], description: 'Aqua refractor /199' },
  { name: 'Aqua Checker Flag Refractor', color_hex: '#20B2AA', print_run: 199, serial_numbered: true, is_one_of_one: false, rarity_rank: 16, box_exclusivity: [HOBBY], description: 'Aqua checker flag /199; Hobby exclusive' },
  { name: 'Blue Refractor', color_hex: '#4169E1', print_run: 150, serial_numbered: true, is_one_of_one: false, rarity_rank: 17, box_exclusivity: [ALL], description: 'Blue refractor /150' },
  { name: 'Blue RayWave Refractor', color_hex: '#1E90FF', print_run: 150, serial_numbered: true, is_one_of_one: false, rarity_rank: 18, box_exclusivity: [BLASTER], description: 'Blue ray wave /150; Value Blaster exclusive' },
  { name: 'Blue Checker Flag Refractor', color_hex: '#0000CD', print_run: 150, serial_numbered: true, is_one_of_one: false, rarity_rank: 19, box_exclusivity: [HOBBY], description: 'Blue checker flag /150; Hobby exclusive' },
  { name: 'Green Refractor', color_hex: '#228B22', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 20, box_exclusivity: [ALL], description: 'Green refractor /99' },
  { name: 'Green RayWave Refractor', color_hex: '#32CD32', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 21, box_exclusivity: [BLASTER], description: 'Green ray wave /99; Value Blaster exclusive' },
  { name: 'Green Checker Flag Refractor', color_hex: '#006400', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 22, box_exclusivity: [HOBBY], description: 'Green checker flag /99; Hobby exclusive' },
  { name: 'F1 75th Anniversary Refractor', color_hex: '#DAA520', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 23, box_exclusivity: [HOBBY], description: '75th anniversary refractor /75; Hobby exclusive' },
  { name: 'Gold Refractor', color_hex: '#FFD700', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 24, box_exclusivity: [ALL], description: 'Gold refractor /50' },
  { name: 'Gold RayWave Refractor', color_hex: '#FFC125', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 25, box_exclusivity: [BLASTER], description: 'Gold ray wave /50; Value Blaster exclusive' },
  { name: 'Gold Checker Flag Refractor', color_hex: '#DAA520', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 26, box_exclusivity: [HOBBY], description: 'Gold checker flag /50; Hobby exclusive' },
  { name: 'Orange Refractor', color_hex: '#FF8C00', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 27, box_exclusivity: [ALL], description: 'Orange refractor /25' },
  { name: 'Orange Checker Flag Refractor', color_hex: '#FF6600', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 28, box_exclusivity: [HOBBY], description: 'Orange checker flag /25; Hobby exclusive' },
  { name: 'Black Refractor', color_hex: '#1C1C1C', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 29, box_exclusivity: [HOBBY], description: 'Black refractor /10; Hobby exclusive' },
  { name: 'Black Checker Flag Refractor', color_hex: '#000000', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 30, box_exclusivity: [HOBBY], description: 'Black checker flag /10; Hobby exclusive' },
  { name: 'Red Refractor', color_hex: '#DC143C', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 31, box_exclusivity: [HOBBY], description: 'Red refractor /5; Hobby exclusive' },
  { name: 'Red Checker Flag Refractor', color_hex: '#8B0000', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 32, box_exclusivity: [HOBBY], description: 'Red checker flag /5; Hobby exclusive' },

  // ── 1-of-1 ─────────────────────────────────────────────
  { name: 'SuperFractor', color_hex: '#FFD700', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 33, box_exclusivity: [HOBBY], description: 'Gold SuperFractor — true 1/1' },
  { name: 'Printing Plate Cyan', color_hex: '#00FFFF', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 34, box_exclusivity: [ALL], description: 'Cyan printing plate — 1/1' },
  { name: 'Printing Plate Magenta', color_hex: '#FF00FF', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 35, box_exclusivity: [ALL], description: 'Magenta printing plate — 1/1' },
  { name: 'Printing Plate Yellow', color_hex: '#FFFF00', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 36, box_exclusivity: [ALL], description: 'Yellow printing plate — 1/1' },
  { name: 'Printing Plate Black', color_hex: '#000000', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 37, box_exclusivity: [ALL], description: 'Black printing plate — 1/1' },
];

async function main() {
  console.log(`Seeding 2025 Topps Chrome F1 Parallels: ${parallels.length} parallels\n`);
  if (DRY_RUN) {
    console.log('DRY RUN — no changes made.\n');
    console.log(`Unnumbered: ${parallels.filter(p => !p.serial_numbered).length}`);
    console.log(`Numbered: ${parallels.filter(p => p.serial_numbered && !p.is_one_of_one).length}`);
    console.log(`1-of-1: ${parallels.filter(p => p.is_one_of_one).length}`);
    console.log(`Total: ${parallels.length}`);
    return;
  }

  // Update product description to reflect flagship status
  const { error: prodErr } = await supabase.from('products').update({
    description: 'THE flagship Formula 1 trading card product. All-chromium cards with 37 parallels including 6 ultra-rare SSPs. Features all 20 F1 drivers. Available in Hobby and Value Blaster.',
    is_flagship: true,
  }).eq('id', PRODUCT_ID);
  if (prodErr) console.error('Product update error:', prodErr.message);
  else console.log('✓ Updated product as F1 flagship');

  const { error: delErr } = await supabase.from('parallels').delete().eq('product_id', PRODUCT_ID);
  if (delErr) { console.error('Delete error:', delErr.message); return; }
  const rows = parallels.map(p => ({ product_id: PRODUCT_ID, ...p }));
  const { error } = await supabase.from('parallels').insert(rows);
  if (error) console.error('Insert error:', error.message);
  else console.log(`Inserted ${rows.length}/${parallels.length} parallels`);
  const { count } = await supabase.from('parallels').select('*', { count: 'exact', head: true }).eq('product_id', PRODUCT_ID);
  console.log(`Verified: ${count} parallels in DB for 2025 Topps Chrome F1`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
