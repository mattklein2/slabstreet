#!/usr/bin/env node

/**
 * Seed 2024 Panini Select WNBA parallel data.
 * First-ever Select WNBA release. Three tiers: Concourse, Premier, Courtside.
 * Sources: Beckett, Cardboard Connection.
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
const FOTL = 'First Off The Line';
const BLASTER = 'Blaster';
const ALL = 'All';

const parallels = [
  // ── Unnumbered ─────────────────────────────────────────
  { name: 'Base', color_hex: '#FFFFFF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1, box_exclusivity: [ALL], description: 'Standard base card (all 3 tiers)' },
  { name: 'Silver', color_hex: '#C0C0C0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 2, box_exclusivity: [ALL], description: 'Silver Prizm finish' },
  { name: 'Silver Flash', color_hex: '#D0D0D0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 3, box_exclusivity: [ALL], description: 'Silver flash Prizm finish' },
  { name: 'Green Ice', color_hex: '#00FA9A', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 4, box_exclusivity: [ALL], description: 'Green ice finish' },
  { name: 'Red Ice', color_hex: '#FF4444', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 5, box_exclusivity: [ALL], description: 'Red ice finish' },
  { name: 'Pink Ice', color_hex: '#FFB6C1', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 6, box_exclusivity: [BLASTER], description: 'Pink ice; Blaster exclusive' },
  { name: 'Tiger', color_hex: '#FF8C00', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 7, box_exclusivity: [BLASTER], description: 'Tiger stripe pattern; Blaster exclusive' },
  { name: 'Zebra', color_hex: '#2C2C2C', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 8, box_exclusivity: [ALL], description: 'Zebra stripe pattern' },

  // ── Numbered ───────────────────────────────────────────
  { name: 'Red & Blue', color_hex: '#B22234', print_run: 399, serial_numbered: true, is_one_of_one: false, rarity_rank: 9, box_exclusivity: [ALL], description: 'Red and blue dual-color /399' },
  { name: 'Purple Ice', color_hex: '#9370DB', print_run: 149, serial_numbered: true, is_one_of_one: false, rarity_rank: 10, box_exclusivity: [ALL], description: 'Purple ice /149' },
  { name: 'Red', color_hex: '#FF0000', print_run: 149, serial_numbered: true, is_one_of_one: false, rarity_rank: 11, box_exclusivity: [ALL], description: 'Red /149' },
  { name: 'Light Blue Disco', color_hex: '#87CEEB', print_run: 125, serial_numbered: true, is_one_of_one: false, rarity_rank: 12, box_exclusivity: [ALL], description: 'Light blue disco /125' },
  { name: 'Pink & Purple', color_hex: '#DA70D6', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 13, box_exclusivity: [ALL], description: 'Pink and purple /99' },
  { name: 'White', color_hex: '#FFFFFF', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 14, box_exclusivity: [ALL], description: 'White /99' },
  { name: 'Neon Green', color_hex: '#39FF14', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 15, box_exclusivity: [ALL], description: 'Neon green /75' },
  { name: 'Bronze Checker', color_hex: '#CD7F32', print_run: 49, serial_numbered: true, is_one_of_one: false, rarity_rank: 16, box_exclusivity: [ALL], description: 'Bronze checkered /49' },
  { name: 'Tie-Dye', color_hex: '#FF69B4', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 17, box_exclusivity: [ALL], description: 'Tie-dye pattern /25' },
  { name: 'Gold Flash', color_hex: '#FFD700', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 18, box_exclusivity: [ALL], description: 'Gold flash /10' },
  { name: 'Gold Ice', color_hex: '#DAA520', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 19, box_exclusivity: [ALL], description: 'Gold ice /10' },
  { name: 'Gold', color_hex: '#FFD700', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 20, box_exclusivity: [ALL], description: 'Gold /10' },
  { name: 'Black Gold', color_hex: '#1A1A1A', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 21, box_exclusivity: [ALL], description: 'Black and gold /5' },
  { name: 'Pink Shimmer FOTL', color_hex: '#FF69B4', print_run: 3, serial_numbered: true, is_one_of_one: false, rarity_rank: 22, box_exclusivity: [FOTL], description: 'Pink shimmer /3; FOTL exclusive' },

  // ── 1-of-1 ─────────────────────────────────────────────
  { name: 'Black Finite', color_hex: '#000000', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 23, box_exclusivity: [ALL], description: 'True 1/1 black Prizm' },
  { name: 'Gold Vinyl', color_hex: '#FFD700', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 24, box_exclusivity: [ALL], description: 'True 1/1 gold vinyl' },
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
