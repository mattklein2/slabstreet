#!/usr/bin/env node

/**
 * Seed 2025-26 Topps Finest Basketball parallel data.
 * Sources: Checklist Insider, Beckett, Cardboard Connection.
 *
 * Note: Finest has a tiered base set (common, uncommon, rare).
 * Every parallel except Purple Refractor appears across all three tiers.
 * Purple Refractor only exists in common and uncommon tiers.
 *
 * Usage:
 *   node scripts/seed-topps-finest-2025-26-nba.mjs
 *   node scripts/seed-topps-finest-2025-26-nba.mjs --dry-run
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

const PRODUCT_ID = 'c0000000-0000-0000-0000-00000000002f'; // 2025-26 Topps Finest Basketball

const HOBBY = 'Hobby';
const BREAKER = 'Breaker';
const ALL = 'All';

// Hobby parallels + Breaker Delight (Geometric) parallels
const parallels = [
  // ── Unnumbered — Hobby ──────────────────────────────
  { name: 'Base', color_hex: '#FFFFFF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1, box_exclusivity: [ALL], description: 'Standard Finest base card (tiered: common, uncommon, rare)' },
  { name: 'Refractor', color_hex: '#C0C0C0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 2, box_exclusivity: [HOBBY], description: 'Base Refractor — ~1:6 Hobby' },
  { name: 'X-Fractor', color_hex: '#A9A9A9', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 3, box_exclusivity: [HOBBY], description: 'X-Fractor — ~1:12 Hobby' },
  { name: 'Oil Spill Refractor', color_hex: '#2F4F4F', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 4, box_exclusivity: [HOBBY], description: 'Oil Spill Refractor — ~1:24 Hobby' },

  // ── Unnumbered — Breaker ────────────────────────────
  { name: 'Geometric Refractor', color_hex: '#708090', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 5, box_exclusivity: [BREAKER], description: 'Geometric Refractor — ~1:2 Breaker Delight' },

  // ── Numbered — Hobby ────────────────────────────────
  { name: 'Sky Blue Refractor', color_hex: '#87CEEB', print_run: 250, serial_numbered: true, is_one_of_one: false, rarity_rank: 6, box_exclusivity: [HOBBY], description: 'Sky Blue Refractor /250 — ~1:14 Hobby' },
  { name: 'Purple Refractor', color_hex: '#800080', print_run: 200, serial_numbered: true, is_one_of_one: false, rarity_rank: 7, box_exclusivity: [HOBBY], description: 'Purple Refractor /200 — ~1:18 Hobby (common/uncommon tiers only)' },
  { name: 'Blue Refractor', color_hex: '#0000CD', print_run: 150, serial_numbered: true, is_one_of_one: false, rarity_rank: 8, box_exclusivity: [HOBBY], description: 'Blue Refractor /150 — ~1:24 Hobby' },
  { name: 'Purple X-Fractor', color_hex: '#9B30FF', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 9, box_exclusivity: [HOBBY], description: 'Purple X-Fractor /99 — ~1:36 Hobby' },
  { name: 'Blue X-Fractor', color_hex: '#4169E1', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 10, box_exclusivity: [HOBBY], description: 'Blue X-Fractor /75 — ~1:47 Hobby' },

  // ── Numbered — Breaker ──────────────────────────────
  { name: 'Purple Geometric Refractor', color_hex: '#9932CC', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 11, box_exclusivity: [BREAKER], description: 'Purple Geometric Refractor /75 — ~1:3 Breaker' },
  { name: 'Blue Geometric Refractor', color_hex: '#1E90FF', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 12, box_exclusivity: [BREAKER], description: 'Blue Geometric Refractor /50 — ~1:4 Breaker' },

  // ── Numbered — Hobby (continued) ────────────────────
  { name: 'Green Refractor', color_hex: '#00A651', print_run: 35, serial_numbered: true, is_one_of_one: false, rarity_rank: 13, box_exclusivity: [HOBBY], description: 'Green Refractor /35 — ~1:100 Hobby' },
  { name: 'Gold Refractor', color_hex: '#FFD700', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 14, box_exclusivity: [HOBBY], description: 'Gold Refractor /25 — ~1:140 Hobby' },

  // ── Numbered — Breaker (continued) ──────────────────
  { name: 'Gold Geometric Refractor', color_hex: '#DAA520', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 15, box_exclusivity: [BREAKER], description: 'Gold Geometric Refractor /25 — ~1:7 Breaker' },

  // ── Numbered — Hobby (continued) ────────────────────
  { name: 'Orange Refractor', color_hex: '#FF8C00', print_run: 20, serial_numbered: true, is_one_of_one: false, rarity_rank: 16, box_exclusivity: [HOBBY], description: 'Orange Refractor /20 — ~1:175 Hobby' },
  { name: 'Black Refractor', color_hex: '#1C1C1C', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 17, box_exclusivity: [HOBBY], description: 'Black Refractor /10 — ~1:350 Hobby' },

  // ── Numbered — Breaker (continued) ──────────────────
  { name: 'Red/Black Geometric Refractor', color_hex: '#8B0000', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 18, box_exclusivity: [BREAKER], description: 'Red/Black Geometric Refractor /10 — ~1:17 Breaker' },

  // ── Numbered — Hobby/Breaker low runs ───────────────
  { name: 'Red Refractor', color_hex: '#FF0000', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 19, box_exclusivity: [HOBBY], description: 'Red Refractor /5 — ~1:700 Hobby' },
  { name: 'Red Geometric Refractor', color_hex: '#CC0000', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 20, box_exclusivity: [BREAKER], description: 'Red Geometric Refractor /5 — ~1:34 Breaker' },

  // ── 1-of-1 ──────────────────────────────────────────
  { name: 'SuperFractor', color_hex: '#FFD700', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 21, box_exclusivity: [HOBBY], description: 'SuperFractor 1/1 — ~1:3,514 Hobby. The ultimate Finest chase card.' },
  { name: 'Black Geometric Refractor', color_hex: '#000000', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 22, box_exclusivity: [BREAKER], description: 'Black Geometric Refractor 1/1 — ~1:167 Breaker' },
];

async function main() {
  console.log(`Seeding 2025-26 Topps Finest Basketball: ${parallels.length} parallels\n`);

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
  console.log(`Verified: ${count} parallels in DB for 2025-26 Topps Finest Basketball`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
