#!/usr/bin/env node

/**
 * Seed complete 2025 Bowman's Best Baseball parallel data.
 * Sources: Beckett, ChecklistInsider, Topps Ripped.
 *
 * Usage:
 *   node scripts/seed-bowmans-best-2025-mlb.mjs
 *   node scripts/seed-bowmans-best-2025-mlb.mjs --dry-run
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

const PRODUCT_ID = 'c0000000-0000-0000-0000-000000000032'; // 2025 Bowman's Best MLB

const HOBBY = 'Hobby';

const parallels = [
  // ── Unnumbered Parallels ──────────────────────────────────
  { name: 'Base', color_hex: '#E8E8E8', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1, box_exclusivity: [HOBBY], description: 'Standard chrome base card; 100-card set' },
  { name: 'Refractor', color_hex: '#C0C0C0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 2, box_exclusivity: [HOBBY], description: 'Classic refractor finish (~1:1 packs)' },
  { name: 'Wave Refractor', color_hex: '#4682B4', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 3, box_exclusivity: [HOBBY], description: 'Wave-pattern refractor (~1:12 packs)' },

  // ── Numbered Parallels ────────────────────────────────────
  { name: 'Lazer Refractor', color_hex: '#7B68EE', print_run: 350, serial_numbered: true, is_one_of_one: false, rarity_rank: 4, box_exclusivity: [HOBBY], description: 'Lazer-pattern refractor /350 (new for 2025)' },
  { name: 'Mini-Diamond Refractor', color_hex: '#B9F2FF', print_run: 299, serial_numbered: true, is_one_of_one: false, rarity_rank: 5, box_exclusivity: [HOBBY], description: 'Mini diamond-pattern refractor /299' },
  { name: 'Purple Refractor', color_hex: '#9370DB', print_run: 250, serial_numbered: true, is_one_of_one: false, rarity_rank: 6, box_exclusivity: [HOBBY], description: 'Purple-tinted refractor /250' },
  { name: 'Purple Mojo Refractor', color_hex: '#8A2BE2', print_run: 250, serial_numbered: true, is_one_of_one: false, rarity_rank: 7, box_exclusivity: [HOBBY], description: 'Purple mojo-pattern refractor /250' },
  { name: 'Purple Lazer Refractor', color_hex: '#7B68EE', print_run: 250, serial_numbered: true, is_one_of_one: false, rarity_rank: 8, box_exclusivity: [HOBBY], description: 'Purple lazer-pattern refractor /250' },
  { name: 'Aqua Refractor', color_hex: '#00CED1', print_run: 199, serial_numbered: true, is_one_of_one: false, rarity_rank: 9, box_exclusivity: [HOBBY], description: 'Aqua-tinted refractor /199' },
  { name: 'Aqua Lava Refractor', color_hex: '#48D1CC', print_run: 199, serial_numbered: true, is_one_of_one: false, rarity_rank: 10, box_exclusivity: [HOBBY], description: 'Aqua lava-pattern refractor /199' },
  { name: 'Blue Refractor', color_hex: '#4169E1', print_run: 150, serial_numbered: true, is_one_of_one: false, rarity_rank: 11, box_exclusivity: [HOBBY], description: 'Blue-tinted refractor /150' },
  { name: 'Blue X-Fractor', color_hex: '#1E90FF', print_run: 150, serial_numbered: true, is_one_of_one: false, rarity_rank: 12, box_exclusivity: [HOBBY], description: 'Blue X-pattern refractor /150' },
  { name: 'Blue Lazer Refractor', color_hex: '#6495ED', print_run: 150, serial_numbered: true, is_one_of_one: false, rarity_rank: 13, box_exclusivity: [HOBBY], description: 'Blue lazer-pattern refractor /150' },
  { name: 'Green Refractor', color_hex: '#228B22', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 14, box_exclusivity: [HOBBY], description: 'Green-tinted refractor /99' },
  { name: 'Green Mini-Diamond Refractor', color_hex: '#32CD32', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 15, box_exclusivity: [HOBBY], description: 'Green mini diamond-pattern refractor /99' },
  { name: 'Yellow Refractor', color_hex: '#FFD700', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 16, box_exclusivity: [HOBBY], description: 'Yellow-tinted refractor /75' },
  { name: 'Yellow Lazer Refractor', color_hex: '#FFC125', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 17, box_exclusivity: [HOBBY], description: 'Yellow lazer-pattern refractor /75' },
  { name: 'Gold Refractor', color_hex: '#FFD700', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 18, box_exclusivity: [HOBBY], description: 'Gold-tinted refractor /50' },
  { name: 'Gold Lava Refractor', color_hex: '#DAA520', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 19, box_exclusivity: [HOBBY], description: 'Gold lava-pattern refractor /50' },
  { name: 'Orange Refractor', color_hex: '#FF8C00', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 20, box_exclusivity: [HOBBY], description: 'Orange-tinted refractor /25' },
  { name: 'Black Refractor', color_hex: '#1C1C1C', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 21, box_exclusivity: [HOBBY], description: 'Black-tinted refractor /10' },
  { name: 'Red Refractor', color_hex: '#DC143C', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 22, box_exclusivity: [HOBBY], description: 'Red-tinted refractor /5' },
  { name: 'Red Lava Refractor', color_hex: '#FF0000', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 23, box_exclusivity: [HOBBY], description: 'Red lava-pattern refractor /5' },

  // ── 1-of-1 ────────────────────────────────────────────────
  { name: 'SuperFractor', color_hex: '#FFD700', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 24, box_exclusivity: [HOBBY], description: 'The ultimate chrome chase — SuperFractor 1/1' },
];

async function main() {
  console.log(`Seeding 2025 Bowman's Best MLB Parallels: ${parallels.length} parallels\n`);
  if (DRY_RUN) {
    console.log('DRY RUN — no changes made.\n');
    console.log(`Unnumbered: ${parallels.filter(p => !p.serial_numbered).length}`);
    console.log(`Numbered: ${parallels.filter(p => p.serial_numbered && !p.is_one_of_one).length}`);
    console.log(`1-of-1: ${parallels.filter(p => p.is_one_of_one).length}`);
    console.log(`Total: ${parallels.length}`);
    return;
  }
  const { error: delErr } = await supabase.from('parallels').delete().eq('product_id', PRODUCT_ID);
  if (delErr) { console.error('Delete error:', delErr.message); return; }
  console.log("Deleted old parallels for Bowman's Best MLB 2025");
  const rows = parallels.map(p => ({ product_id: PRODUCT_ID, name: p.name, color_hex: p.color_hex, print_run: p.print_run, serial_numbered: p.serial_numbered, is_one_of_one: p.is_one_of_one, rarity_rank: p.rarity_rank, description: p.description, box_exclusivity: p.box_exclusivity, special_attributes: null }));
  const { error } = await supabase.from('parallels').insert(rows);
  if (error) console.error('Insert error:', error.message);
  else console.log(`Inserted ${rows.length}/${parallels.length} parallels`);
  const { count } = await supabase.from('parallels').select('*', { count: 'exact', head: true }).eq('product_id', PRODUCT_ID);
  console.log(`Verified: ${count} parallels in DB for Bowman's Best MLB 2025`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
