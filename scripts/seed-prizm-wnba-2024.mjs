#!/usr/bin/env node

/**
 * Seed complete 2024 Panini Prizm WNBA parallel data.
 * The Caitlin Clark / Angel Reese rookie Prizm product — 32 parallels.
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
const RETAIL = 'Retail';
const ALL = 'All';

const parallels = [
  // ── Unnumbered ─────────────────────────────────────────
  { name: 'Base', color_hex: '#FFFFFF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1, box_exclusivity: [ALL], description: 'Standard base card; 150-card set' },
  { name: 'Silver', color_hex: '#C0C0C0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 2, box_exclusivity: [ALL], description: 'Classic silver Prizm refractor' },
  { name: 'Green', color_hex: '#228B22', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 3, box_exclusivity: [ALL], description: 'Green Prizm finish' },
  { name: 'Blue Velocity', color_hex: '#1E90FF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 4, box_exclusivity: [ALL], description: 'Blue velocity pattern' },
  { name: 'Orange Velocity', color_hex: '#FF8C00', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 5, box_exclusivity: [ALL], description: 'Orange velocity pattern' },
  { name: 'Orange Ice', color_hex: '#FF8C00', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 6, box_exclusivity: [ALL], description: 'Orange ice finish' },
  { name: 'Ice', color_hex: '#B0E0E6', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 7, box_exclusivity: [BLASTER], description: 'Ice finish; Blaster exclusive' },
  { name: 'Snakeskin', color_hex: '#6B8E23', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 8, box_exclusivity: [ALL], description: 'Textured snakeskin pattern' },
  { name: 'White Sparkle', color_hex: '#FFFAFA', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 9, box_exclusivity: [ALL], description: 'White with sparkle finish' },
  { name: 'Checkerboard', color_hex: '#2C2C2C', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 10, box_exclusivity: [RETAIL], description: 'Checkerboard pattern; Retail exclusive' },
  { name: 'WNBA Logo', color_hex: '#FF6600', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 11, box_exclusivity: [BLASTER], description: 'WNBA logo design; Blaster exclusive' },

  // ── Numbered ───────────────────────────────────────────
  { name: 'Pulsar', color_hex: '#9B30FF', print_run: 499, serial_numbered: true, is_one_of_one: false, rarity_rank: 12, box_exclusivity: [ALL], description: 'Pulsar finish /499' },
  { name: 'Red', color_hex: '#FF0000', print_run: 299, serial_numbered: true, is_one_of_one: false, rarity_rank: 13, box_exclusivity: [ALL], description: 'Red Prizm /299' },
  { name: 'Red Pulsar', color_hex: '#DC143C', print_run: 299, serial_numbered: true, is_one_of_one: false, rarity_rank: 14, box_exclusivity: [ALL], description: 'Red pulsar /299' },
  { name: 'Blue', color_hex: '#1E90FF', print_run: 199, serial_numbered: true, is_one_of_one: false, rarity_rank: 15, box_exclusivity: [ALL], description: 'Blue Prizm /199' },
  { name: 'Blue Pulsar', color_hex: '#4169E1', print_run: 199, serial_numbered: true, is_one_of_one: false, rarity_rank: 16, box_exclusivity: [ALL], description: 'Blue pulsar /199' },
  { name: 'Purple', color_hex: '#800080', print_run: 149, serial_numbered: true, is_one_of_one: false, rarity_rank: 17, box_exclusivity: [ALL], description: 'Purple Prizm /149' },
  { name: 'Orange', color_hex: '#FF8C00', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 18, box_exclusivity: [ALL], description: 'Orange Prizm /99' },
  { name: 'Premium Box Set', color_hex: '#E6E6FA', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 19, box_exclusivity: ['Premium Box Set'], description: 'Premium Box Set exclusive /99' },
  { name: 'Pink Velocity', color_hex: '#FF69B4', print_run: 79, serial_numbered: true, is_one_of_one: false, rarity_rank: 20, box_exclusivity: [ALL], description: 'Pink velocity /79' },
  { name: 'Teal', color_hex: '#008080', print_run: 49, serial_numbered: true, is_one_of_one: false, rarity_rank: 21, box_exclusivity: [ALL], description: 'Teal Prizm /49' },
  { name: 'Black Velocity', color_hex: '#1A1A1A', print_run: 39, serial_numbered: true, is_one_of_one: false, rarity_rank: 22, box_exclusivity: [ALL], description: 'Black velocity /39' },
  { name: 'White Ice', color_hex: '#F0F8FF', print_run: 35, serial_numbered: true, is_one_of_one: false, rarity_rank: 23, box_exclusivity: [ALL], description: 'White ice /35' },
  { name: 'Green Pulsar', color_hex: '#00AA00', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 24, box_exclusivity: [ALL], description: 'Green pulsar /25' },
  { name: 'Mojo', color_hex: '#C0C0C0', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 25, box_exclusivity: [ALL], description: 'Mojo finish /25' },
  { name: 'Cherry Blossom FOTL', color_hex: '#FFB7C5', print_run: 20, serial_numbered: true, is_one_of_one: false, rarity_rank: 26, box_exclusivity: [FOTL], description: 'Cherry blossom pink /20; FOTL exclusive' },
  { name: 'Gold', color_hex: '#FFD700', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 27, box_exclusivity: [ALL], description: 'Gold Prizm /10' },
  { name: 'Gold Ice', color_hex: '#DAA520', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 28, box_exclusivity: [ALL], description: 'Gold ice /10' },
  { name: 'Black Gold', color_hex: '#1A1A1A', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 29, box_exclusivity: [ALL], description: 'Black and gold /5' },
  { name: 'Lotus Flower FOTL', color_hex: '#E8A2C4', print_run: 3, serial_numbered: true, is_one_of_one: false, rarity_rank: 30, box_exclusivity: [FOTL], description: 'Lotus flower design /3; FOTL exclusive' },
  { name: 'Mosaic', color_hex: '#C0C0C0', print_run: 3, serial_numbered: true, is_one_of_one: false, rarity_rank: 31, box_exclusivity: [ALL], description: 'Mosaic pattern /3' },

  // ── 1-of-1 ─────────────────────────────────────────────
  { name: 'Black Finite', color_hex: '#000000', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 32, box_exclusivity: [ALL], description: 'True 1/1 black Prizm finish' },
  { name: 'Gold Vinyl', color_hex: '#FFD700', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 33, box_exclusivity: [ALL], description: 'True 1/1 gold vinyl finish' },
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
