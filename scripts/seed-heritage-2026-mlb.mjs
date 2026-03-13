#!/usr/bin/env node

/**
 * Seed complete 2026 Topps Heritage Baseball parallel data.
 * Sources: Beckett, ChecklistInsider.
 *
 * Usage:
 *   node scripts/seed-heritage-2026-mlb.mjs
 *   node scripts/seed-heritage-2026-mlb.mjs --dry-run
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

const PRODUCT_ID = 'c0000000-0000-0000-0000-000000000031'; // 2026 Topps Heritage MLB

const HOBBY = 'Hobby';
const ALL = 'All';

const parallels = [
  // ── Paper Parallels ───────────────────────────────────────
  { name: 'Base', color_hex: '#FFFFFF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1, box_exclusivity: [ALL], description: 'Standard Heritage base card (1977 Topps design tribute)' },
  { name: 'Dark Gray Border', color_hex: '#696969', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 2, box_exclusivity: [HOBBY], description: 'Dark gray bordered parallel; Hobby exclusive' },
  { name: 'Deckle Edge', color_hex: '#F5F5DC', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 3, box_exclusivity: [ALL], description: 'Serrated deckle-edge border design (1977 throwback)' },
  { name: 'Color of the Year Heritage Orange', color_hex: '#FF8C00', print_run: 77, serial_numbered: true, is_one_of_one: false, rarity_rank: 4, box_exclusivity: [ALL], description: 'Heritage orange Color of the Year /77 (1977 tribute)' },

  // ── Chrome Parallels ──────────────────────────────────────
  { name: 'Chrome Refractor', color_hex: '#C0C0C0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 5, box_exclusivity: [ALL], description: 'Chrome refractor version of the base card' },
  { name: 'Light Blue Sparkle Refractor', color_hex: '#ADD8E6', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 6, box_exclusivity: [HOBBY], description: 'Light blue sparkle chrome refractor; Hobby exclusive' },
  { name: 'Blue Bordered Refractor', color_hex: '#4169E1', print_run: 150, serial_numbered: true, is_one_of_one: false, rarity_rank: 7, box_exclusivity: [ALL], description: 'Blue bordered chrome refractor /150' },
  { name: 'Green Bordered Refractor', color_hex: '#228B22', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 8, box_exclusivity: [ALL], description: 'Green bordered chrome refractor /99' },
  { name: 'Black Bordered Refractor', color_hex: '#1C1C1C', print_run: 77, serial_numbered: true, is_one_of_one: false, rarity_rank: 9, box_exclusivity: [ALL], description: 'Black bordered chrome refractor /77' },
  { name: 'Gold Bordered Refractor', color_hex: '#FFD700', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 10, box_exclusivity: [ALL], description: 'Gold bordered chrome refractor /50' },
  { name: 'Orange Bordered Refractor', color_hex: '#FF8C00', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 11, box_exclusivity: [ALL], description: 'Orange bordered chrome refractor /25' },
  { name: 'Red Bordered Refractor', color_hex: '#DC143C', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 12, box_exclusivity: [ALL], description: 'Red bordered chrome refractor /5' },
  { name: 'SuperFractor', color_hex: '#FFD700', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 13, box_exclusivity: [ALL], description: 'Chrome SuperFractor — true 1/1' },
];

async function main() {
  console.log(`Seeding 2026 Topps Heritage MLB Parallels: ${parallels.length} parallels\n`);
  if (DRY_RUN) {
    console.log('DRY RUN — no changes made.\n');
    console.log(`Paper: ${parallels.filter(p => p.rarity_rank <= 4).length}`);
    console.log(`Chrome: ${parallels.filter(p => p.rarity_rank > 4).length}`);
    console.log(`Total: ${parallels.length}`);
    return;
  }
  const { error: delErr } = await supabase.from('parallels').delete().eq('product_id', PRODUCT_ID);
  if (delErr) { console.error('Delete error:', delErr.message); return; }
  console.log('Deleted old parallels for 2026 Topps Heritage MLB');
  const rows = parallels.map(p => ({ product_id: PRODUCT_ID, name: p.name, color_hex: p.color_hex, print_run: p.print_run, serial_numbered: p.serial_numbered, is_one_of_one: p.is_one_of_one, rarity_rank: p.rarity_rank, description: p.description, box_exclusivity: p.box_exclusivity, special_attributes: null }));
  const { error } = await supabase.from('parallels').insert(rows);
  if (error) console.error('Insert error:', error.message);
  else console.log(`Inserted ${rows.length}/${parallels.length} parallels`);
  const { count } = await supabase.from('parallels').select('*', { count: 'exact', head: true }).eq('product_id', PRODUCT_ID);
  console.log(`Verified: ${count} parallels in DB for 2026 Topps Heritage MLB`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
