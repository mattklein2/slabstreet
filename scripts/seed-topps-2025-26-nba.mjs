#!/usr/bin/env node

/**
 * Seed 2025-26 Topps Basketball parallel data.
 * Sources: Checklist Insider, Beckett, Cardboard Connection.
 *
 * Usage:
 *   node scripts/seed-topps-2025-26-nba.mjs
 *   node scripts/seed-topps-2025-26-nba.mjs --dry-run
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

const PRODUCT_ID = 'c0000000-0000-0000-0000-00000000002d'; // 2025-26 Topps Basketball

const HOBBY = 'Hobby';
const JUMBO = 'Hobby Jumbo';
const RETAIL = 'Retail';
const BLASTER = 'Retail Blaster';
const MEGA = 'Retail Mega';
const HANGER = 'Hanger';
const ALL = 'All';

const parallels = [
  // ── Unnumbered ──────────────────────────────────────
  { name: 'Base', color_hex: '#FFFFFF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1, box_exclusivity: [ALL], description: 'Standard base card' },
  { name: 'Rainbow Foilboard', color_hex: '#E0E0E0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 2, box_exclusivity: [ALL], description: 'Rainbow foilboard parallel — ~1:11 all formats' },
  { name: 'Victory', color_hex: '#C0C0C0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 3, box_exclusivity: [HOBBY], description: 'Hobby exclusive unnumbered parallel — ~1:22' },
  { name: 'Holo Foil', color_hex: '#D4E6F1', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 4, box_exclusivity: [RETAIL, BLASTER, MEGA, HANGER], description: 'Retail Holo Foil parallel — ~1:11 retail' },
  { name: 'Sandglitter', color_hex: '#F5DEB3', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 5, box_exclusivity: [JUMBO], description: 'Sandglitter textured parallel — Jumbo exclusive ~1:2' },
  { name: 'Blue Sandglitter', color_hex: '#4682B4', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 6, box_exclusivity: [JUMBO], description: 'Blue Sandglitter — Jumbo exclusive ~1:6' },
  { name: 'Pink Holo Foil', color_hex: '#FF69B4', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 7, box_exclusivity: [RETAIL, BLASTER, MEGA, HANGER], description: 'Pink Holo Foil — retail exclusive ~1:124' },
  { name: 'Aqua Holo Foil', color_hex: '#00CED1', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 8, box_exclusivity: [RETAIL, BLASTER, MEGA, HANGER], description: 'Aqua Holo Foil — retail exclusive ~1:500' },

  // ── Numbered ────────────────────────────────────────
  { name: 'Gold', color_hex: '#FFD700', print_run: 2025, serial_numbered: true, is_one_of_one: false, rarity_rank: 9, box_exclusivity: [ALL], description: 'Gold parallel /2025 — all formats' },
  { name: 'Purple Rainbow', color_hex: '#9B59B6', print_run: 250, serial_numbered: true, is_one_of_one: false, rarity_rank: 10, box_exclusivity: [HOBBY, JUMBO], description: 'Purple Rainbow /250 — Hobby/Jumbo' },
  { name: 'Purple Holo Foil', color_hex: '#8E44AD', print_run: 250, serial_numbered: true, is_one_of_one: false, rarity_rank: 11, box_exclusivity: [RETAIL, BLASTER, MEGA, HANGER], description: 'Purple Holo Foil /250 — retail' },
  { name: 'Blue Rainbow', color_hex: '#2980B9', print_run: 150, serial_numbered: true, is_one_of_one: false, rarity_rank: 12, box_exclusivity: [HOBBY, JUMBO], description: 'Blue Rainbow /150 — Hobby/Jumbo' },
  { name: 'Blue Holo Foil', color_hex: '#3498DB', print_run: 150, serial_numbered: true, is_one_of_one: false, rarity_rank: 13, box_exclusivity: [RETAIL, BLASTER, MEGA, HANGER], description: 'Blue Holo Foil /150 — retail' },
  { name: 'Green Rainbow', color_hex: '#27AE60', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 14, box_exclusivity: [HOBBY, JUMBO], description: 'Green Rainbow /99 — Hobby/Jumbo' },
  { name: 'Green Holo Foil', color_hex: '#2ECC71', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 15, box_exclusivity: [RETAIL, BLASTER, MEGA, HANGER], description: 'Green Holo Foil /99 — retail' },
  { name: 'Black', color_hex: '#1C1C1C', print_run: 68, serial_numbered: true, is_one_of_one: false, rarity_rank: 16, box_exclusivity: [HOBBY, JUMBO], description: 'Black parallel /68 — Hobby/Jumbo' },
  { name: 'Gold Rainbow', color_hex: '#F1C40F', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 17, box_exclusivity: [HOBBY, JUMBO], description: 'Gold Rainbow /50 — Hobby/Jumbo' },
  { name: 'Gold Holo Foil', color_hex: '#DAA520', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 18, box_exclusivity: [RETAIL, BLASTER, MEGA, HANGER], description: 'Gold Holo Foil /50 — retail' },
  { name: 'Wood', color_hex: '#8B4513', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 19, box_exclusivity: [ALL], description: 'Wood grain textured parallel /25 — all formats' },
  { name: 'Orange Rainbow', color_hex: '#E67E22', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 20, box_exclusivity: [HOBBY, JUMBO], description: 'Orange Rainbow /25 — Hobby/Jumbo' },
  { name: 'Orange Holo Foil', color_hex: '#F39C12', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 21, box_exclusivity: [RETAIL, BLASTER, MEGA, HANGER], description: 'Orange Holo Foil /25 — retail' },
  { name: 'Black Rainbow', color_hex: '#2C3E50', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 22, box_exclusivity: [HOBBY, JUMBO], description: 'Black Rainbow /10 — Hobby/Jumbo' },
  { name: 'Black Holo Foil', color_hex: '#17202A', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 23, box_exclusivity: [RETAIL, BLASTER, MEGA, HANGER], description: 'Black Holo Foil /10 — retail' },
  { name: 'Red Rainbow', color_hex: '#E74C3C', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 24, box_exclusivity: [HOBBY, JUMBO], description: 'Red Rainbow /5 — Hobby/Jumbo' },
  { name: 'Red Holo Foil', color_hex: '#C0392B', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 25, box_exclusivity: [RETAIL, BLASTER, MEGA, HANGER], description: 'Red Holo Foil /5 — retail' },

  // ── 1-of-1 ──────────────────────────────────────────
  { name: 'FoilFractor', color_hex: '#B8B8B8', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 26, box_exclusivity: [HOBBY, JUMBO], description: 'FoilFractor 1/1 — Hobby/Jumbo' },
  { name: 'First Card', color_hex: '#FFD700', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 27, box_exclusivity: [ALL], description: 'First Card 1/1 — all formats' },
  { name: 'Platinum Holo Foil', color_hex: '#E5E4E2', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 28, box_exclusivity: [RETAIL, BLASTER, MEGA, HANGER], description: 'Platinum Holo Foil 1/1 — retail exclusive' },
];

async function main() {
  console.log(`Seeding 2025-26 Topps Basketball: ${parallels.length} parallels\n`);

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
  console.log('Deleted old parallels');

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
    if (error) console.error(`Batch error at ${i}:`, error.message);
    else inserted += batch.length;
  }

  console.log(`\nInserted ${inserted}/${parallels.length} parallels`);
  const { count } = await supabase.from('parallels').select('*', { count: 'exact', head: true }).eq('product_id', PRODUCT_ID);
  console.log(`Verified: ${count} parallels in DB for 2025-26 Topps Basketball`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
