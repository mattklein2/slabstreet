#!/usr/bin/env node

/**
 * Seed 2025-26 Topps Chrome Basketball parallel data.
 * Sources: Checklist Insider, Beckett.
 *
 * Usage:
 *   node scripts/seed-topps-chrome-2025-26-nba.mjs
 *   node scripts/seed-topps-chrome-2025-26-nba.mjs --dry-run
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

const PRODUCT_ID = 'c0000000-0000-0000-0000-00000000002e'; // 2025-26 Topps Chrome Basketball

const HOBBY = 'Hobby';
const JUMBO = 'Hobby Jumbo';
const BLASTER = 'Retail Blaster';
const MEGA = 'Retail Mega';
const HANGER = 'Hanger';
const BREAKER = 'Breaker';
const ALL = 'All';

// Chrome has format-specific refractor families:
// Base Refractor = all, Prism/Negative/Wave = Hobby/Jumbo,
// X-Fractor/RayWave = Mega, Basketball = Blaster, Pulsar = Hanger,
// Geometric = Breaker, Lightboard Logos = Blaster/Hanger/Mega,
// 1st Day Issue = Jumbo, Skylight = Fanatics Mega
const parallels = [
  // ── Unnumbered ──────────────────────────────────────
  { name: 'Base', color_hex: '#FFFFFF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1, box_exclusivity: [ALL], description: 'Standard Chrome base card' },
  { name: 'Refractor', color_hex: '#C0C0C0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 2, box_exclusivity: [ALL], description: 'Base Refractor — all formats' },
  { name: 'Prism Refractor', color_hex: '#E8E8E8', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 3, box_exclusivity: [HOBBY, JUMBO], description: 'Prism Refractor — Hobby/Jumbo' },
  { name: 'Negative Refractor', color_hex: '#2C2C2C', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 4, box_exclusivity: [HOBBY, JUMBO], description: 'Negative (inverted color) Refractor — Hobby/Jumbo' },
  { name: 'Wave Refractor', color_hex: '#87CEEB', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 5, box_exclusivity: [HOBBY, JUMBO], description: 'Wave pattern Refractor — Hobby/Jumbo' },
  { name: 'X-Fractor', color_hex: '#A9A9A9', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 6, box_exclusivity: [MEGA], description: 'X-Fractor — Mega exclusive' },
  { name: 'RayWave Refractor', color_hex: '#B0C4DE', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 7, box_exclusivity: [MEGA], description: 'RayWave Refractor — Mega exclusive' },
  { name: 'Basketball Refractor', color_hex: '#FF8C00', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 8, box_exclusivity: [BLASTER], description: 'Basketball texture Refractor — Blaster exclusive' },
  { name: 'Red/White/Blue Refractor', color_hex: '#B22234', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 9, box_exclusivity: [BLASTER], description: 'Red/White/Blue Refractor — Blaster exclusive' },
  { name: 'Pulsar Refractor', color_hex: '#DA70D6', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 10, box_exclusivity: [HANGER], description: 'Pulsar Refractor — Hanger exclusive' },
  { name: 'Lightboard Logos Refractor', color_hex: '#00FF7F', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 11, box_exclusivity: [BLASTER, HANGER, MEGA], description: 'Lightboard Logos Refractor — retail multi-format' },
  { name: 'Skylight Refractor', color_hex: '#ADD8E6', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 12, box_exclusivity: [MEGA], description: 'Skylight Refractor — Fanatics Mega exclusive' },
  { name: '1st Day Issue Refractor', color_hex: '#FFD700', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 13, box_exclusivity: [JUMBO], description: '1st Day Issue Refractor — Jumbo exclusive' },

  // ── Numbered — Magenta /399 ─────────────────────────
  { name: 'Magenta Refractor', color_hex: '#FF00FF', print_run: 399, serial_numbered: true, is_one_of_one: false, rarity_rank: 14, box_exclusivity: [ALL], description: 'Magenta Refractor /399 — all formats' },

  // ── Numbered — Teal /299 ────────────────────────────
  { name: 'Teal Refractor', color_hex: '#008080', print_run: 299, serial_numbered: true, is_one_of_one: false, rarity_rank: 15, box_exclusivity: [ALL], description: 'Teal Refractor /299 — all formats' },

  // ── Numbered — Yellow /275 ──────────────────────────
  { name: 'Yellow Refractor', color_hex: '#FFD700', print_run: 275, serial_numbered: true, is_one_of_one: false, rarity_rank: 16, box_exclusivity: [ALL], description: 'Yellow Refractor /275 — all formats' },
  { name: 'Yellow Basketball Refractor', color_hex: '#FFC300', print_run: 275, serial_numbered: true, is_one_of_one: false, rarity_rank: 17, box_exclusivity: [BLASTER], description: 'Yellow Basketball Refractor /275 — Blaster exclusive' },
  { name: 'RayWave Yellow Refractor', color_hex: '#FFE066', print_run: 275, serial_numbered: true, is_one_of_one: false, rarity_rank: 18, box_exclusivity: [MEGA], description: 'RayWave Yellow Refractor /275 — Mega exclusive' },

  // ── Numbered — Aqua /199 ────────────────────────────
  { name: 'Aqua Refractor', color_hex: '#00CED1', print_run: 199, serial_numbered: true, is_one_of_one: false, rarity_rank: 19, box_exclusivity: [ALL], description: 'Aqua Refractor /199 — all formats' },
  { name: 'Aqua Basketball Refractor', color_hex: '#20B2AA', print_run: 199, serial_numbered: true, is_one_of_one: false, rarity_rank: 20, box_exclusivity: [BLASTER], description: 'Aqua Basketball Refractor /199 — Blaster exclusive' },
  { name: 'RayWave Aqua Refractor', color_hex: '#48D1CC', print_run: 199, serial_numbered: true, is_one_of_one: false, rarity_rank: 21, box_exclusivity: [MEGA], description: 'RayWave Aqua Refractor /199 — Mega exclusive' },

  // ── Numbered — Blue /150 ────────────────────────────
  { name: 'Blue Refractor', color_hex: '#0000CD', print_run: 150, serial_numbered: true, is_one_of_one: false, rarity_rank: 22, box_exclusivity: [ALL], description: 'Blue Refractor /150 — all formats' },
  { name: 'Blue Basketball Refractor', color_hex: '#1E90FF', print_run: 150, serial_numbered: true, is_one_of_one: false, rarity_rank: 23, box_exclusivity: [BLASTER], description: 'Blue Basketball Refractor /150 — Blaster exclusive' },
  { name: 'Blue Wave Refractor', color_hex: '#4169E1', print_run: 150, serial_numbered: true, is_one_of_one: false, rarity_rank: 24, box_exclusivity: [HOBBY, JUMBO, BREAKER], description: 'Blue Wave Refractor /150 — Hobby/Jumbo/Breaker' },
  { name: 'RayWave Blue Refractor', color_hex: '#6495ED', print_run: 150, serial_numbered: true, is_one_of_one: false, rarity_rank: 25, box_exclusivity: [MEGA], description: 'RayWave Blue Refractor /150 — Mega exclusive' },

  // ── Numbered — Green /99 ────────────────────────────
  { name: 'Green Refractor', color_hex: '#00A651', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 26, box_exclusivity: [ALL], description: 'Green Refractor /99 — all formats' },
  { name: 'Green Basketball Refractor', color_hex: '#228B22', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 27, box_exclusivity: [BLASTER], description: 'Green Basketball Refractor /99 — Blaster exclusive' },
  { name: 'Green Wave Refractor', color_hex: '#2E8B57', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 28, box_exclusivity: [HOBBY, JUMBO, BREAKER], description: 'Green Wave Refractor /99 — Hobby/Jumbo/Breaker' },
  { name: 'RayWave Green Refractor', color_hex: '#3CB371', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 29, box_exclusivity: [MEGA], description: 'RayWave Green Refractor /99 — Mega exclusive' },

  // ── Numbered — Purple /75 ───────────────────────────
  { name: 'Purple Refractor', color_hex: '#800080', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 30, box_exclusivity: [ALL], description: 'Purple Refractor /75 — all formats' },
  { name: 'Purple Basketball Refractor', color_hex: '#9932CC', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 31, box_exclusivity: [BLASTER], description: 'Purple Basketball Refractor /75 — Blaster exclusive' },
  { name: 'Purple Wave Refractor', color_hex: '#9370DB', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 32, box_exclusivity: [HOBBY, JUMBO, BREAKER], description: 'Purple Wave Refractor /75 — Hobby/Jumbo/Breaker' },
  { name: 'Pulsar Purple Refractor', color_hex: '#BA55D3', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 33, box_exclusivity: [HANGER], description: 'Pulsar Purple Refractor /75 — Hanger exclusive' },
  { name: 'RayWave Purple Refractor', color_hex: '#8B008B', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 34, box_exclusivity: [MEGA], description: 'RayWave Purple Refractor /75 — Mega exclusive' },

  // ── Numbered — Gold /50 ─────────────────────────────
  { name: 'Gold Refractor', color_hex: '#FFD700', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 35, box_exclusivity: [ALL], description: 'Gold Refractor /50 — all formats' },
  { name: 'Gold Basketball Refractor', color_hex: '#DAA520', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 36, box_exclusivity: [BLASTER], description: 'Gold Basketball Refractor /50 — Blaster exclusive' },
  { name: 'Gold Wave Refractor', color_hex: '#B8860B', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 37, box_exclusivity: [HOBBY, JUMBO, BREAKER], description: 'Gold Wave Refractor /50 — Hobby/Jumbo/Breaker' },
  { name: 'Geometric Gold Refractor', color_hex: '#CD950C', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 38, box_exclusivity: [BREAKER], description: 'Geometric Gold Refractor /50 — Breaker exclusive' },
  { name: 'Pulsar Gold Refractor', color_hex: '#EEC900', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 39, box_exclusivity: [HANGER], description: 'Pulsar Gold Refractor /50 — Hanger exclusive' },
  { name: 'RayWave Gold Refractor', color_hex: '#FFC125', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 40, box_exclusivity: [MEGA], description: 'RayWave Gold Refractor /50 — Mega exclusive' },

  // ── Numbered — Orange /25 ───────────────────────────
  { name: 'Orange Refractor', color_hex: '#FF8C00', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 41, box_exclusivity: [ALL], description: 'Orange Refractor /25 — all formats' },
  { name: 'Orange Basketball Refractor', color_hex: '#FF7F00', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 42, box_exclusivity: [BLASTER], description: 'Orange Basketball Refractor /25 — Blaster exclusive' },
  { name: 'Orange Wave Refractor', color_hex: '#FF6347', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 43, box_exclusivity: [HOBBY, JUMBO, BREAKER], description: 'Orange Wave Refractor /25 — Hobby/Jumbo/Breaker' },
  { name: 'Geometric Orange Refractor', color_hex: '#E65100', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 44, box_exclusivity: [BREAKER], description: 'Geometric Orange Refractor /25 — Breaker exclusive' },
  { name: 'Pulsar Orange Refractor', color_hex: '#FF5722', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 45, box_exclusivity: [HANGER], description: 'Pulsar Orange Refractor /25 — Hanger exclusive' },
  { name: 'RayWave Orange Refractor', color_hex: '#FF4500', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 46, box_exclusivity: [MEGA], description: 'RayWave Orange Refractor /25 — Mega exclusive' },

  // ── Numbered — Silver 1st Day /12 ───────────────────
  { name: 'Silver 1st Day Issue Refractor', color_hex: '#C0C0C0', print_run: 12, serial_numbered: true, is_one_of_one: false, rarity_rank: 47, box_exclusivity: [JUMBO], description: 'Silver 1st Day Issue Refractor /12 — Jumbo exclusive' },

  // ── Numbered — Black /10 ────────────────────────────
  { name: 'Black Refractor', color_hex: '#1C1C1C', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 48, box_exclusivity: [ALL], description: 'Black Refractor /10 — all formats' },
  { name: 'Black Basketball Refractor', color_hex: '#2D2D2D', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 49, box_exclusivity: [BLASTER], description: 'Black Basketball Refractor /10 — Blaster exclusive' },
  { name: 'Black Wave Refractor', color_hex: '#3D3D3D', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 50, box_exclusivity: [HOBBY, JUMBO, BREAKER], description: 'Black Wave Refractor /10 — Hobby/Jumbo/Breaker' },
  { name: 'Geometric Black Refractor', color_hex: '#0D0D0D', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 51, box_exclusivity: [BREAKER], description: 'Geometric Black Refractor /10 — Breaker exclusive' },
  { name: 'Pulsar Black Refractor', color_hex: '#111111', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 52, box_exclusivity: [HANGER], description: 'Pulsar Black Refractor /10 — Hanger exclusive' },
  { name: 'RayWave Black Refractor', color_hex: '#1A1A1A', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 53, box_exclusivity: [MEGA], description: 'RayWave Black Refractor /10 — Mega exclusive' },

  // ── Numbered — Tri-Color 1st Day /8 ─────────────────
  { name: 'Tri-Color 1st Day Issue Refractor', color_hex: '#B22234', print_run: 8, serial_numbered: true, is_one_of_one: false, rarity_rank: 54, box_exclusivity: [JUMBO], description: 'Tri-Color 1st Day Issue Refractor /8 — Jumbo exclusive' },

  // ── Numbered — Red /5 ──────────────────────────────
  { name: 'Red Refractor', color_hex: '#FF0000', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 55, box_exclusivity: [ALL], description: 'Red Refractor /5 — all formats' },
  { name: 'Red Basketball Refractor', color_hex: '#CC0000', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 56, box_exclusivity: [BLASTER], description: 'Red Basketball Refractor /5 — Blaster exclusive' },
  { name: 'Red Wave Refractor', color_hex: '#DC143C', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 57, box_exclusivity: [HOBBY, JUMBO, BREAKER], description: 'Red Wave Refractor /5 — Hobby/Jumbo/Breaker' },
  { name: 'Pulsar Red Refractor', color_hex: '#B22222', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 58, box_exclusivity: [HANGER], description: 'Pulsar Red Refractor /5 — Hanger exclusive' },
  { name: 'RayWave Red Refractor', color_hex: '#8B0000', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 59, box_exclusivity: [MEGA], description: 'RayWave Red Refractor /5 — Mega exclusive' },
  { name: 'Geometric Red Refractor', color_hex: '#A52A2A', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 60, box_exclusivity: [BREAKER], description: 'Geometric Red Refractor /5 — Breaker exclusive' },

  // ── Numbered — FrozenFractor /5 ─────────────────────
  { name: 'FrozenFractor', color_hex: '#E0FFFF', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 61, box_exclusivity: [ALL], description: 'FrozenFractor /5 — all formats' },

  // ── Numbered — Geometric White /2 ───────────────────
  { name: 'Geometric White Refractor', color_hex: '#F8F8FF', print_run: 2, serial_numbered: true, is_one_of_one: false, rarity_rank: 62, box_exclusivity: [BREAKER], description: 'Geometric White Refractor /2 — Breaker exclusive' },

  // ── 1-of-1 ──────────────────────────────────────────
  { name: 'SuperFractor', color_hex: '#FFD700', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 63, box_exclusivity: [ALL], description: 'SuperFractor 1/1 — the ultimate Chrome chase card' },
];

async function main() {
  console.log(`Seeding 2025-26 Topps Chrome Basketball: ${parallels.length} parallels\n`);

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
  console.log(`Verified: ${count} parallels in DB for 2025-26 Topps Chrome Basketball`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
