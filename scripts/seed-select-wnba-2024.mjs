#!/usr/bin/env node

/**
 * Seed 2024 Panini Select WNBA parallel data.
 * Multi-tiered product (Concourse, Premier, Courtside).
 *
 * Usage:
 *   node scripts/seed-select-wnba-2024.mjs
 *   node scripts/seed-select-wnba-2024.mjs --dry-run
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

const PRODUCT_ID = 'c0000000-0000-0000-0000-00000000003a'; // 2024 Select WNBA

const HOBBY = 'Hobby';
const ALL = 'All';

const parallels = [
  // ── Concourse Tier ─────────────────────────────────────
  { name: 'Concourse Base', color_hex: '#FFFFFF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1, box_exclusivity: [ALL], description: 'Concourse tier base card' },
  { name: 'Concourse Silver', color_hex: '#C0C0C0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 2, box_exclusivity: [ALL], description: 'Concourse silver Prizm finish' },
  { name: 'Concourse Red & Yellow', color_hex: '#FF6347', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 3, box_exclusivity: [ALL], description: 'Concourse red & yellow dual-color' },
  { name: 'Concourse Blue', color_hex: '#4169E1', print_run: 199, serial_numbered: true, is_one_of_one: false, rarity_rank: 4, box_exclusivity: [HOBBY], description: 'Concourse blue /199' },
  { name: 'Concourse Purple', color_hex: '#800080', print_run: 149, serial_numbered: true, is_one_of_one: false, rarity_rank: 5, box_exclusivity: [HOBBY], description: 'Concourse purple /149' },
  { name: 'Concourse Green', color_hex: '#228B22', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 6, box_exclusivity: [HOBBY], description: 'Concourse green /75' },
  { name: 'Concourse Gold', color_hex: '#FFD700', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 7, box_exclusivity: [HOBBY], description: 'Concourse gold /10' },
  { name: 'Concourse Black', color_hex: '#1A1A1A', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 8, box_exclusivity: [HOBBY], description: 'Concourse black — true 1/1' },

  // ── Premier Tier ───────────────────────────────────────
  { name: 'Premier Base', color_hex: '#F0F0F0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 9, box_exclusivity: [ALL], description: 'Premier tier base card' },
  { name: 'Premier Silver', color_hex: '#C0C0C0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 10, box_exclusivity: [ALL], description: 'Premier silver Prizm finish' },
  { name: 'Premier Red & Yellow', color_hex: '#FF6347', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 11, box_exclusivity: [ALL], description: 'Premier red & yellow dual-color' },
  { name: 'Premier Blue', color_hex: '#4169E1', print_run: 149, serial_numbered: true, is_one_of_one: false, rarity_rank: 12, box_exclusivity: [HOBBY], description: 'Premier blue /149' },
  { name: 'Premier Purple', color_hex: '#800080', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 13, box_exclusivity: [HOBBY], description: 'Premier purple /99' },
  { name: 'Premier Green', color_hex: '#228B22', print_run: 49, serial_numbered: true, is_one_of_one: false, rarity_rank: 14, box_exclusivity: [HOBBY], description: 'Premier green /49' },
  { name: 'Premier Gold', color_hex: '#FFD700', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 15, box_exclusivity: [HOBBY], description: 'Premier gold /10' },
  { name: 'Premier Black', color_hex: '#1A1A1A', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 16, box_exclusivity: [HOBBY], description: 'Premier black — true 1/1' },

  // ── Courtside Tier (Die-cut) ───────────────────────────
  { name: 'Courtside Base', color_hex: '#E8E8E8', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 17, box_exclusivity: [HOBBY], description: 'Courtside tier die-cut base card' },
  { name: 'Courtside Silver', color_hex: '#C0C0C0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 18, box_exclusivity: [HOBBY], description: 'Courtside silver Prizm die-cut' },
  { name: 'Courtside Blue', color_hex: '#4169E1', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 19, box_exclusivity: [HOBBY], description: 'Courtside blue die-cut /99' },
  { name: 'Courtside Purple', color_hex: '#800080', print_run: 49, serial_numbered: true, is_one_of_one: false, rarity_rank: 20, box_exclusivity: [HOBBY], description: 'Courtside purple die-cut /49' },
  { name: 'Courtside Green', color_hex: '#228B22', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 21, box_exclusivity: [HOBBY], description: 'Courtside green die-cut /25' },
  { name: 'Courtside Gold', color_hex: '#FFD700', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 22, box_exclusivity: [HOBBY], description: 'Courtside gold die-cut /10' },
  { name: 'Courtside Black', color_hex: '#1A1A1A', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 23, box_exclusivity: [HOBBY], description: 'Courtside black die-cut — true 1/1' },
];

async function main() {
  console.log(`Seeding 2024 Select WNBA Parallels: ${parallels.length} parallels\n`);
  if (DRY_RUN) { console.log(`Total: ${parallels.length}`); return; }
  const { error: delErr } = await supabase.from('parallels').delete().eq('product_id', PRODUCT_ID);
  if (delErr) { console.error('Delete error:', delErr.message); return; }
  const rows = parallels.map(p => ({ product_id: PRODUCT_ID, ...p }));
  const { error } = await supabase.from('parallels').insert(rows);
  if (error) console.error('Insert error:', error.message);
  else console.log(`Inserted ${rows.length}/${parallels.length} parallels`);
  const { count } = await supabase.from('parallels').select('*', { count: 'exact', head: true }).eq('product_id', PRODUCT_ID);
  console.log(`Verified: ${count} parallels in DB for 2024 Select WNBA`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
