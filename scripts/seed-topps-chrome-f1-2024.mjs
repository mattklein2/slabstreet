#!/usr/bin/env node

/**
 * Seed complete 2024 Topps Chrome Formula 1 parallel data.
 * 31 parallels with Hobby, Qualifying Lap, and Value Blaster exclusives.
 * Sources: Beckett, ChecklistInsider.
 *
 * Usage:
 *   node scripts/seed-topps-chrome-f1-2024.mjs
 *   node scripts/seed-topps-chrome-f1-2024.mjs --dry-run
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

const PRODUCT_ID = 'c0000000-0000-0000-0000-000000000037'; // 2024 Topps Chrome F1

const HOBBY = 'Hobby';
const QL = 'Qualifying Lap';
const BLASTER = 'Value Blaster';
const ALL = 'All';

const parallels = [
  // ── Unnumbered ─────────────────────────────────────────
  { name: 'Base', color_hex: '#FFFFFF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1, box_exclusivity: [ALL], description: 'Standard chrome base card; 200-card set' },
  { name: 'Refractor', color_hex: '#C0C0C0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 2, box_exclusivity: [ALL], description: 'Classic refractor (~1:3 packs)' },
  { name: 'Checker Flag Refractor', color_hex: '#1C1C1C', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 3, box_exclusivity: [ALL], description: 'Checkered flag pattern (~1 per box)' },
  { name: 'Purple/Green Refractor', color_hex: '#9370DB', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 4, box_exclusivity: [ALL], description: 'Purple/green dual-tone (~1:6 packs)' },
  { name: 'Gold/Purple Refractor', color_hex: '#DAA520', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 5, box_exclusivity: [ALL], description: 'Gold/purple dual-tone (~1:24 packs)' },
  { name: 'Orange/Red Refractor', color_hex: '#FF6600', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 6, box_exclusivity: [ALL], description: 'Orange/red dual-tone (~1:36 packs)' },
  { name: 'Red/Green Refractor', color_hex: '#DC143C', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 7, box_exclusivity: [ALL], description: 'Red/green dual-tone (~1:72 packs)' },

  // ── Numbered ───────────────────────────────────────────
  { name: 'Mini-Diamond Refractor', color_hex: '#B9F2FF', print_run: 299, serial_numbered: true, is_one_of_one: false, rarity_rank: 8, box_exclusivity: [ALL], description: 'Mini-diamond pattern /299' },
  { name: 'Fuchsia Lava Refractor', color_hex: '#FF00FF', print_run: 225, serial_numbered: true, is_one_of_one: false, rarity_rank: 9, box_exclusivity: [ALL], description: 'Fuchsia lava pattern /225' },
  { name: 'Purple Checker Flag Refractor', color_hex: '#800080', print_run: 199, serial_numbered: true, is_one_of_one: false, rarity_rank: 10, box_exclusivity: [HOBBY], description: 'Purple checker flag /199; Hobby exclusive' },
  { name: 'Aqua Sonar Refractor', color_hex: '#00CED1', print_run: 150, serial_numbered: true, is_one_of_one: false, rarity_rank: 11, box_exclusivity: [ALL], description: 'Aqua sonar pattern /150' },
  { name: 'Green Refractor', color_hex: '#228B22', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 12, box_exclusivity: [ALL], description: 'Green refractor /99' },
  { name: 'Green RayWave', color_hex: '#32CD32', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 13, box_exclusivity: [QL], description: 'Green ray wave /99; Qualifying Lap exclusive' },
  { name: 'Pink Refractor', color_hex: '#FF69B4', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 14, box_exclusivity: [ALL], description: 'Pink refractor /75' },
  { name: 'Pink RayWave', color_hex: '#FF1493', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 15, box_exclusivity: [QL], description: 'Pink ray wave /75; Qualifying Lap exclusive' },
  { name: 'Gold Refractor', color_hex: '#FFD700', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 16, box_exclusivity: [ALL], description: 'Gold refractor /50' },
  { name: 'Gold Checker Flag Refractor', color_hex: '#DAA520', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 17, box_exclusivity: [HOBBY], description: 'Gold checker flag /50; Hobby exclusive' },
  { name: 'Gold RayWave', color_hex: '#FFC125', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 18, box_exclusivity: [QL], description: 'Gold ray wave /50; Qualifying Lap exclusive' },
  { name: 'Orange Refractor', color_hex: '#FF8C00', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 19, box_exclusivity: [ALL], description: 'Orange refractor /25' },
  { name: 'Orange Checker Flag Refractor', color_hex: '#FF6600', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 20, box_exclusivity: [HOBBY], description: 'Orange checker flag /25; Hobby exclusive' },
  { name: 'Orange RayWave', color_hex: '#FF4500', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 21, box_exclusivity: [QL], description: 'Orange ray wave /25; Qualifying Lap exclusive' },
  { name: 'Black Refractor', color_hex: '#1C1C1C', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 22, box_exclusivity: [HOBBY], description: 'Black refractor /10; Hobby exclusive' },
  { name: 'Red Refractor', color_hex: '#DC143C', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 23, box_exclusivity: [HOBBY], description: 'Red refractor /5; Hobby exclusive' },
  { name: 'Red Checker Flag Refractor', color_hex: '#8B0000', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 24, box_exclusivity: [HOBBY], description: 'Red checker flag /5; Hobby exclusive' },
  { name: 'Red RayWave', color_hex: '#B22222', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 25, box_exclusivity: [QL], description: 'Red ray wave /5; Qualifying Lap exclusive' },

  // ── 1-of-1 ─────────────────────────────────────────────
  { name: 'Black RayWave', color_hex: '#000000', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 26, box_exclusivity: [QL], description: 'Black ray wave — true 1/1; Qualifying Lap exclusive' },
  { name: 'SuperFractor', color_hex: '#FFD700', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 27, box_exclusivity: [HOBBY], description: 'Gold SuperFractor — true 1/1' },
  { name: 'Printing Plate Cyan', color_hex: '#00FFFF', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 28, box_exclusivity: [ALL], description: 'Cyan printing plate — 1/1' },
  { name: 'Printing Plate Magenta', color_hex: '#FF00FF', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 29, box_exclusivity: [ALL], description: 'Magenta printing plate — 1/1' },
  { name: 'Printing Plate Yellow', color_hex: '#FFFF00', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 30, box_exclusivity: [ALL], description: 'Yellow printing plate — 1/1' },
  { name: 'Printing Plate Black', color_hex: '#000000', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 31, box_exclusivity: [ALL], description: 'Black printing plate — 1/1' },
];

async function main() {
  console.log(`Seeding 2024 Topps Chrome F1 Parallels: ${parallels.length} parallels\n`);
  if (DRY_RUN) {
    console.log('DRY RUN — no changes made.\n');
    console.log(`Total: ${parallels.length}`);
    return;
  }

  // Update product to be flagship
  await supabase.from('products').update({ is_flagship: true }).eq('id', PRODUCT_ID);

  const { error: delErr } = await supabase.from('parallels').delete().eq('product_id', PRODUCT_ID);
  if (delErr) { console.error('Delete error:', delErr.message); return; }
  const rows = parallels.map(p => ({ product_id: PRODUCT_ID, ...p }));
  const { error } = await supabase.from('parallels').insert(rows);
  if (error) console.error('Insert error:', error.message);
  else console.log(`Inserted ${rows.length}/${parallels.length} parallels`);
  const { count } = await supabase.from('parallels').select('*', { count: 'exact', head: true }).eq('product_id', PRODUCT_ID);
  console.log(`Verified: ${count} parallels in DB for 2024 Topps Chrome F1`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
