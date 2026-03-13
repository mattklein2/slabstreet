#!/usr/bin/env node

/**
 * Seed complete 2025 Panini Mosaic Football parallel data.
 * Sources: Beckett, ChecklistInsider, Cardboard Connection, gogts.net.
 *
 * Usage:
 *   node scripts/seed-mosaic-2025-nfl.mjs
 *   node scripts/seed-mosaic-2025-nfl.mjs --dry-run
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

const PRODUCT_ID = 'c0000000-0000-0000-0000-000000000022'; // 2025 Panini Mosaic NFL

const HOBBY = 'Hobby';
const CHOICE = 'Choice Box';
const NO_HUDDLE = 'No Huddle Box';
const FOTL = 'FOTL';
const RETAIL_BLASTER = 'Retail Blaster';
const RETAIL_MEGA = 'Retail Mega';
const FAT_PACK = 'Fat Pack';
const ALL = 'All';

const parallels = [
  // ── Unnumbered Parallels ──────────────────────────────────
  { name: 'Base', color_hex: '#FFFFFF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1, box_exclusivity: [ALL], description: 'Standard Mosaic base card; 400-card set' },
  { name: 'Silver', color_hex: '#C0C0C0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 2, box_exclusivity: [ALL], description: 'Silver prizm finish' },
  { name: 'Mosaic', color_hex: '#4682B4', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 3, box_exclusivity: [ALL], description: 'Signature mosaic stained-glass pattern' },
  { name: 'Blue Scope', color_hex: '#4169E1', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 4, box_exclusivity: [ALL], description: 'Blue scope finish' },
  { name: 'Purple Scope', color_hex: '#9370DB', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 5, box_exclusivity: [ALL], description: 'Purple scope finish' },
  { name: 'Red Scope', color_hex: '#DC143C', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 6, box_exclusivity: [ALL], description: 'Red scope finish' },
  { name: 'Honeycomb', color_hex: '#DAA520', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 7, box_exclusivity: [ALL], description: 'Honeycomb hexagonal pattern' },
  { name: 'Camo Pink Mosaic', color_hex: '#FF69B4', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 8, box_exclusivity: [ALL], description: 'Pink camouflage mosaic pattern' },
  { name: 'Camo Red Mosaic', color_hex: '#CD5C5C', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 9, box_exclusivity: [ALL], description: 'Red camouflage mosaic pattern' },
  { name: 'Genesis Mosaic', color_hex: '#2F4F4F', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 10, box_exclusivity: [ALL], description: 'Genesis dark mosaic design' },
  { name: 'Green Mosaic', color_hex: '#228B22', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 11, box_exclusivity: [ALL], description: 'Green mosaic stained-glass' },
  { name: 'Red Mosaic', color_hex: '#B22222', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 12, box_exclusivity: [ALL], description: 'Red mosaic stained-glass' },
  { name: 'Reactive Blue Mosaic', color_hex: '#1E90FF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 13, box_exclusivity: [ALL], description: 'Reactive blue color-shifting mosaic' },
  { name: 'Reactive Purple Mosaic', color_hex: '#8A2BE2', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 14, box_exclusivity: [ALL], description: 'Reactive purple color-shifting mosaic' },
  { name: 'Reactive Yellow Mosaic', color_hex: '#FFD700', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 15, box_exclusivity: [ALL], description: 'Reactive yellow color-shifting mosaic' },
  { name: 'Red Sparkle', color_hex: '#FF0000', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 16, box_exclusivity: [ALL], description: 'Red sparkle finish' },
  { name: 'White Sparkle', color_hex: '#F8F8FF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 17, box_exclusivity: [ALL], description: 'White sparkle finish' },
  { name: 'Choice Peacock Mosaic', color_hex: '#009B7D', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 18, box_exclusivity: [CHOICE], description: 'Peacock mosaic; Choice box exclusive' },
  { name: 'No Huddle Silver Mosaic', color_hex: '#A9A9A9', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 19, box_exclusivity: [NO_HUDDLE], description: 'Silver mosaic; No Huddle exclusive' },

  // ── Numbered Parallels ────────────────────────────────────
  { name: 'Orange Mosaic', color_hex: '#FF8C00', print_run: 199, serial_numbered: true, is_one_of_one: false, rarity_rank: 20, box_exclusivity: [HOBBY], description: 'Orange mosaic /199' },
  { name: 'Silver Knight', color_hex: '#71797E', print_run: 149, serial_numbered: true, is_one_of_one: false, rarity_rank: 21, box_exclusivity: [HOBBY], description: 'Silver knight armor finish /149' },
  { name: 'Blue Mosaic', color_hex: '#4169E1', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 22, box_exclusivity: [HOBBY], description: 'Blue mosaic /99' },
  { name: 'No Huddle Blue Mosaic', color_hex: '#1E90FF', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 23, box_exclusivity: [NO_HUDDLE], description: 'Blue mosaic /99 — No Huddle exclusive' },
  { name: 'Blue Sparkle', color_hex: '#6495ED', print_run: 96, serial_numbered: true, is_one_of_one: false, rarity_rank: 24, box_exclusivity: [HOBBY], description: 'Blue sparkle /96' },
  { name: 'Choice Fusion Red & Yellow Mosaic', color_hex: '#FF6347', print_run: 89, serial_numbered: true, is_one_of_one: false, rarity_rank: 25, box_exclusivity: [CHOICE], description: 'Red & yellow fusion mosaic /89 — Choice exclusive' },
  { name: 'No Huddle Purple Mosaic', color_hex: '#9370DB', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 26, box_exclusivity: [NO_HUDDLE], description: 'Purple mosaic /50 — No Huddle exclusive' },
  { name: 'Purple Mosaic', color_hex: '#800080', print_run: 49, serial_numbered: true, is_one_of_one: false, rarity_rank: 27, box_exclusivity: [HOBBY], description: 'Purple mosaic /49' },
  { name: 'Red Wave Mosaic', color_hex: '#DC143C', print_run: 27, serial_numbered: true, is_one_of_one: false, rarity_rank: 28, box_exclusivity: [HOBBY], description: 'Red wave mosaic /27' },
  { name: 'Orange Fluorescent Mosaic', color_hex: '#FF4500', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 29, box_exclusivity: [HOBBY], description: 'Orange fluorescent mosaic /25' },
  { name: 'White Mosaic', color_hex: '#F5F5F5', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 30, box_exclusivity: [HOBBY], description: 'White mosaic /25' },
  { name: 'Gold Sparkle', color_hex: '#FFD700', print_run: 24, serial_numbered: true, is_one_of_one: false, rarity_rank: 31, box_exclusivity: [HOBBY], description: 'Gold sparkle /24' },
  { name: 'Choice Cherry Blossom Mosaic', color_hex: '#FFB7C5', print_run: 20, serial_numbered: true, is_one_of_one: false, rarity_rank: 32, box_exclusivity: [CHOICE], description: 'Cherry blossom mosaic /20 — Choice exclusive' },
  { name: 'No Huddle Pink Mosaic', color_hex: '#FF69B4', print_run: 20, serial_numbered: true, is_one_of_one: false, rarity_rank: 33, box_exclusivity: [NO_HUDDLE], description: 'Pink mosaic /20 — No Huddle exclusive' },
  { name: 'Blue Fluorescent Mosaic', color_hex: '#00BFFF', print_run: 15, serial_numbered: true, is_one_of_one: false, rarity_rank: 34, box_exclusivity: [HOBBY], description: 'Blue fluorescent mosaic /15' },
  { name: 'Tessellation Mosaic', color_hex: '#708090', print_run: 15, serial_numbered: true, is_one_of_one: false, rarity_rank: 35, box_exclusivity: [HOBBY], description: 'Tessellation geometric mosaic /15' },
  { name: 'Green Spectris FOTL Mosaic', color_hex: '#00FF7F', print_run: 13, serial_numbered: true, is_one_of_one: false, rarity_rank: 36, box_exclusivity: [FOTL], description: 'Green spectris mosaic /13 — FOTL exclusive' },
  { name: 'Pink Spectris FOTL Mosaic', color_hex: '#FF1493', print_run: 13, serial_numbered: true, is_one_of_one: false, rarity_rank: 37, box_exclusivity: [FOTL], description: 'Pink spectris mosaic /13 — FOTL exclusive' },
  { name: 'Gold Mosaic', color_hex: '#FFD700', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 38, box_exclusivity: [HOBBY], description: 'Gold mosaic /10' },
  { name: 'Gold Wave Mosaic', color_hex: '#DAA520', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 39, box_exclusivity: [HOBBY], description: 'Gold wave mosaic /10' },
  { name: 'Green Fluorescent Mosaic', color_hex: '#00FF00', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 40, box_exclusivity: [HOBBY], description: 'Green fluorescent mosaic /10' },
  { name: 'No Huddle Gold Mosaic', color_hex: '#FFD700', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 41, box_exclusivity: [NO_HUDDLE], description: 'Gold mosaic /10 — No Huddle exclusive' },
  { name: 'Pink Fluorescent Mosaic', color_hex: '#FF69B4', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 42, box_exclusivity: [HOBBY], description: 'Pink fluorescent mosaic /10' },
  { name: 'Green Sparkle', color_hex: '#00FF7F', print_run: 8, serial_numbered: true, is_one_of_one: false, rarity_rank: 43, box_exclusivity: [HOBBY], description: 'Green sparkle /8' },
  { name: 'Choice Black Gold Mosaic', color_hex: '#1C1C1C', print_run: 8, serial_numbered: true, is_one_of_one: false, rarity_rank: 44, box_exclusivity: [CHOICE], description: 'Black gold mosaic /8 — Choice exclusive' },
  { name: 'Gold Glitter', color_hex: '#FFD700', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 45, box_exclusivity: [HOBBY], description: 'Gold glitter finish /5' },

  // ── 1-of-1 Parallels ─────────────────────────────────────
  { name: 'Black Mosaic', color_hex: '#000000', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 46, box_exclusivity: [HOBBY], description: 'Black mosaic — true 1/1' },
  { name: 'Choice Nebula Mosaic', color_hex: '#4B0082', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 47, box_exclusivity: [CHOICE], description: 'Nebula mosaic — Choice exclusive, true 1/1' },
  { name: 'No Huddle Black Mosaic', color_hex: '#1C1C1C', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 48, box_exclusivity: [NO_HUDDLE], description: 'Black mosaic — No Huddle exclusive, true 1/1' },
];

async function main() {
  console.log(`Seeding 2025 Panini Mosaic NFL Parallels: ${parallels.length} parallels\n`);
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
  console.log('Deleted old parallels for 2025 Panini Mosaic NFL');
  const rows = parallels.map(p => ({ product_id: PRODUCT_ID, name: p.name, color_hex: p.color_hex, print_run: p.print_run, serial_numbered: p.serial_numbered, is_one_of_one: p.is_one_of_one, rarity_rank: p.rarity_rank, description: p.description, box_exclusivity: p.box_exclusivity, special_attributes: null }));
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
  console.log(`Verified: ${count} parallels in DB for 2025 Panini Mosaic NFL`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
