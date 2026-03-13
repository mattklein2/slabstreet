#!/usr/bin/env node

/**
 * Seed complete 2024 Panini Prizm WNBA parallel data.
 * The Caitlin Clark rookie Prizm product — historically significant.
 * Sources: Beckett, Cardboard Connection, ChecklistInsider.
 *
 * Usage:
 *   node scripts/seed-prizm-wnba-2024.mjs
 *   node scripts/seed-prizm-wnba-2024.mjs --dry-run
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

const PRODUCT_ID = 'c0000000-0000-0000-0000-000000000039'; // 2024 Prizm WNBA

const HOBBY = 'Hobby';
const FOTL = 'First Off The Line';
const BLASTER = 'Blaster';
const MEGA = 'Mega Box';
const FAT_PACK = 'Fat Pack';
const CHOICE = 'Choice';
const ALL = 'All';

const parallels = [
  // ── Unnumbered ─────────────────────────────────────────
  { name: 'Base', color_hex: '#FFFFFF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1, box_exclusivity: [ALL], description: 'Standard base card; 100-card set' },
  { name: 'Silver', color_hex: '#C0C0C0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 2, box_exclusivity: [ALL], description: 'Classic silver Prizm refractor' },
  { name: 'Red', color_hex: '#FF0000', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 3, box_exclusivity: [ALL], description: 'Red Prizm finish' },
  { name: 'Blue', color_hex: '#1E90FF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 4, box_exclusivity: [ALL], description: 'Blue Prizm finish' },
  { name: 'Pink', color_hex: '#FF69B4', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 5, box_exclusivity: [ALL], description: 'Pink Prizm finish' },
  { name: 'Red White and Blue', color_hex: '#B22234', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 6, box_exclusivity: [ALL], description: 'Patriotic tri-color Prizm' },
  { name: 'White Sparkle', color_hex: '#FFFAFA', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 7, box_exclusivity: [ALL], description: 'White with sparkle/glitter finish' },
  { name: 'Snakeskin', color_hex: '#6B8E23', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 8, box_exclusivity: [ALL], description: 'Textured snakeskin pattern' },
  { name: 'Purple Pulsar', color_hex: '#9B30FF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 9, box_exclusivity: [ALL], description: 'Purple pulsating finish' },
  { name: 'Green Flash', color_hex: '#00FF00', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 10, box_exclusivity: [ALL], description: 'Green flash effect' },
  { name: 'Lazer', color_hex: '#FF4500', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 11, box_exclusivity: [BLASTER], description: 'Laser-cut pattern; Blaster exclusive' },
  { name: 'Neon Green Pulsar', color_hex: '#39FF14', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 12, box_exclusivity: [MEGA], description: 'Neon green pulsating; Mega exclusive' },

  // ── Numbered ───────────────────────────────────────────
  { name: 'Pandora', color_hex: '#E6E6FA', print_run: 200, serial_numbered: true, is_one_of_one: false, rarity_rank: 13, box_exclusivity: [ALL], description: 'Iridescent Pandora Prizm /200' },
  { name: 'Orange', color_hex: '#FF8C00', print_run: 149, serial_numbered: true, is_one_of_one: false, rarity_rank: 14, box_exclusivity: [HOBBY], description: 'Orange Prizm /149; Hobby' },
  { name: 'Purple', color_hex: '#800080', print_run: 125, serial_numbered: true, is_one_of_one: false, rarity_rank: 15, box_exclusivity: [HOBBY], description: 'Purple Prizm /125; Hobby' },
  { name: 'Blue Ice', color_hex: '#00BFFF', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 16, box_exclusivity: [ALL], description: 'Blue with icy finish /99' },
  { name: 'Green Scope', color_hex: '#228B22', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 17, box_exclusivity: [HOBBY], description: 'Green with scope pattern /75; Hobby' },
  { name: 'Red Shimmer', color_hex: '#E60026', print_run: 49, serial_numbered: true, is_one_of_one: false, rarity_rank: 18, box_exclusivity: [FOTL], description: 'Red shimmer /49; FOTL exclusive' },
  { name: 'Blue Shimmer', color_hex: '#4682B4', print_run: 35, serial_numbered: true, is_one_of_one: false, rarity_rank: 19, box_exclusivity: [FOTL], description: 'Blue shimmer /35; FOTL exclusive' },
  { name: 'Gold', color_hex: '#FFD700', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 20, box_exclusivity: [HOBBY], description: 'Gold Prizm /10; Hobby' },
  { name: 'Gold Shimmer', color_hex: '#DAA520', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 21, box_exclusivity: [FOTL], description: 'Gold shimmer /10; FOTL exclusive' },
  { name: 'Green Shimmer', color_hex: '#00A86B', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 22, box_exclusivity: [FOTL], description: 'Green shimmer /5; FOTL exclusive' },
  { name: 'Gold Vinyl', color_hex: '#FFD700', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 23, box_exclusivity: [HOBBY], description: 'Gold vinyl finish /5; Hobby' },

  // ── 1-of-1 ─────────────────────────────────────────────
  { name: 'Black Finite', color_hex: '#000000', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 24, box_exclusivity: [HOBBY], description: 'True 1/1 black Prizm finish' },
  { name: 'Black Shimmer', color_hex: '#1A1A1A', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 25, box_exclusivity: [FOTL], description: 'True 1/1 black shimmer; FOTL exclusive' },
];

async function main() {
  console.log(`Seeding 2024 Prizm WNBA Parallels: ${parallels.length} parallels\n`);
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
  const rows = parallels.map(p => ({ product_id: PRODUCT_ID, ...p }));
  const { error } = await supabase.from('parallels').insert(rows);
  if (error) console.error('Insert error:', error.message);
  else console.log(`Inserted ${rows.length}/${parallels.length} parallels`);
  const { count } = await supabase.from('parallels').select('*', { count: 'exact', head: true }).eq('product_id', PRODUCT_ID);
  console.log(`Verified: ${count} parallels in DB for 2024 Prizm WNBA`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
