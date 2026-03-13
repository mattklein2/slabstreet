#!/usr/bin/env node

/**
 * Seed complete 2025 Donruss Optic Football parallel data.
 * Sources: Beckett, ChecklistInsider, Cardboard Connection, CardsmithsBreaks.
 *
 * Usage:
 *   node scripts/seed-optic-2025-nfl.mjs
 *   node scripts/seed-optic-2025-nfl.mjs --dry-run
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

const PRODUCT_ID = 'c0000000-0000-0000-0000-000000000023'; // 2025 Donruss Optic NFL

const HOBBY = 'Hobby';
const PREMIUM = 'Premium Box Set';
const FOTL = 'FOTL';
const RETAIL_BLASTER = 'Retail Blaster';
const RETAIL_MEGA = 'Retail Mega';
const FAT_PACK = 'Fat Pack';
const ALL = 'All';

const parallels = [
  // ── Unnumbered Parallels ──────────────────────────────────
  { name: 'Base', color_hex: '#FFFFFF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1, box_exclusivity: [ALL], description: 'Standard optichrome base card; 300-card set' },
  { name: 'Holo', color_hex: '#C0C0C0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 2, box_exclusivity: [ALL], description: 'Holographic finish parallel' },
  { name: 'Fire', color_hex: '#FF4500', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 3, box_exclusivity: [ALL], description: 'Fire-themed design parallel' },
  { name: 'Freedom', color_hex: '#B22222', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 4, box_exclusivity: [ALL], description: 'Patriotic freedom design parallel' },
  { name: 'Jazz', color_hex: '#9B59B6', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 5, box_exclusivity: [ALL], description: 'Jazz cup 90s-inspired design' },
  { name: 'One Hundred', color_hex: '#2C3E50', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 6, box_exclusivity: [ALL], description: '$100 bill inspired design' },
  { name: 'Red Stars', color_hex: '#DC143C', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 7, box_exclusivity: [ALL], description: 'Red star pattern design' },
  { name: 'Rocket', color_hex: '#FF6347', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 8, box_exclusivity: [ALL], description: 'Rocket-themed design parallel' },
  { name: 'Stars', color_hex: '#FFD700', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 9, box_exclusivity: [ALL], description: 'Star pattern design parallel' },
  { name: 'White Sparkle', color_hex: '#F8F8FF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 10, box_exclusivity: [ALL], description: 'White sparkle finish parallel' },

  // ── Numbered Parallels ────────────────────────────────────
  { name: 'Neon Blue', color_hex: '#1E90FF', print_run: 399, serial_numbered: true, is_one_of_one: false, rarity_rank: 11, box_exclusivity: [HOBBY], description: 'Neon blue optichrome /399' },
  { name: 'Aqua', color_hex: '#00CED1', print_run: 349, serial_numbered: true, is_one_of_one: false, rarity_rank: 12, box_exclusivity: [HOBBY], description: 'Aqua optichrome /349' },
  { name: 'Wave', color_hex: '#4682B4', print_run: 300, serial_numbered: true, is_one_of_one: false, rarity_rank: 13, box_exclusivity: [PREMIUM], description: 'Wave-pattern optichrome /300 — Premium Box Set exclusive' },
  { name: 'Orange', color_hex: '#FF8C00', print_run: 299, serial_numbered: true, is_one_of_one: false, rarity_rank: 14, box_exclusivity: [HOBBY], description: 'Orange optichrome /299' },
  { name: 'Blue', color_hex: '#4169E1', print_run: 249, serial_numbered: true, is_one_of_one: false, rarity_rank: 15, box_exclusivity: [HOBBY], description: 'Blue optichrome /249' },
  { name: 'Flex', color_hex: '#E0E0E0', print_run: 199, serial_numbered: true, is_one_of_one: false, rarity_rank: 16, box_exclusivity: [HOBBY], description: 'Flex finish optichrome /199' },
  { name: 'Neon Green', color_hex: '#39FF14', print_run: 199, serial_numbered: true, is_one_of_one: false, rarity_rank: 17, box_exclusivity: [HOBBY], description: 'Neon green optichrome /199' },
  { name: 'Red', color_hex: '#DC143C', print_run: 149, serial_numbered: true, is_one_of_one: false, rarity_rank: 18, box_exclusivity: [HOBBY], description: 'Red optichrome /149' },
  { name: 'Pink Velocity', color_hex: '#FF69B4', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 19, box_exclusivity: [HOBBY], description: 'Pink velocity finish /99' },
  { name: 'Orange Scope', color_hex: '#CC5500', print_run: 79, serial_numbered: true, is_one_of_one: false, rarity_rank: 20, box_exclusivity: [HOBBY], description: 'Orange scope finish /79' },
  { name: 'Electricity', color_hex: '#FFFF00', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 21, box_exclusivity: [HOBBY], description: 'Electric lightning design /75' },
  { name: 'Purple', color_hex: '#9370DB', print_run: 60, serial_numbered: true, is_one_of_one: false, rarity_rank: 22, box_exclusivity: [HOBBY], description: 'Purple optichrome /60' },
  { name: 'Blue Mojo', color_hex: '#0000CD', print_run: 55, serial_numbered: true, is_one_of_one: false, rarity_rank: 23, box_exclusivity: [HOBBY], description: 'Blue mojo finish /55' },
  { name: 'Lime Green', color_hex: '#32CD32', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 24, box_exclusivity: [HOBBY], description: 'Lime green optichrome /50' },
  { name: 'Team Logo', color_hex: '#808080', print_run: 32, serial_numbered: true, is_one_of_one: false, rarity_rank: 25, box_exclusivity: [HOBBY], description: 'Team logo hologram /32' },
  { name: 'Black Pandora', color_hex: '#1C1C1C', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 26, box_exclusivity: [HOBBY], description: 'Black Pandora finish /25 — Hobby exclusive' },
  { name: 'Dragon', color_hex: '#8B0000', print_run: 24, serial_numbered: true, is_one_of_one: false, rarity_rank: 27, box_exclusivity: [HOBBY], description: 'Dragon scale design /24' },
  { name: 'Footballs', color_hex: '#8B4513', print_run: 16, serial_numbered: true, is_one_of_one: false, rarity_rank: 28, box_exclusivity: [HOBBY], description: 'Football leather texture /16' },
  { name: 'Ice', color_hex: '#E0F7FA', print_run: 15, serial_numbered: true, is_one_of_one: false, rarity_rank: 29, box_exclusivity: [HOBBY], description: 'Ice crystal finish /15' },
  { name: 'Neon Yellow', color_hex: '#FFFF00', print_run: 15, serial_numbered: true, is_one_of_one: false, rarity_rank: 30, box_exclusivity: [HOBBY], description: 'Neon yellow optichrome /15' },
  { name: 'Purple Stars', color_hex: '#800080', print_run: 15, serial_numbered: true, is_one_of_one: false, rarity_rank: 31, box_exclusivity: [HOBBY], description: 'Purple star pattern /15' },
  { name: 'Gold', color_hex: '#FFD700', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 32, box_exclusivity: [HOBBY], description: 'Gold optichrome /10' },
  { name: 'Green', color_hex: '#006400', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 33, box_exclusivity: [HOBBY], description: 'Green optichrome /5' },

  // ── 1-of-1 Parallels ─────────────────────────────────────
  { name: 'Black', color_hex: '#000000', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 34, box_exclusivity: [HOBBY], description: 'Black optichrome — true 1/1' },
  { name: 'Gold Vinyl', color_hex: '#FFD700', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 35, box_exclusivity: [HOBBY], description: 'Gold vinyl finish — true 1/1' },
  { name: 'Nebula', color_hex: '#4B0082', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 36, box_exclusivity: [HOBBY], description: 'Nebula cosmic design — true 1/1' },
];

async function main() {
  console.log(`Seeding 2025 Donruss Optic NFL Parallels: ${parallels.length} parallels\n`);
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
  console.log('Deleted old parallels for 2025 Donruss Optic NFL');
  const rows = parallels.map(p => ({ product_id: PRODUCT_ID, name: p.name, color_hex: p.color_hex, print_run: p.print_run, serial_numbered: p.serial_numbered, is_one_of_one: p.is_one_of_one, rarity_rank: p.rarity_rank, description: p.description, box_exclusivity: p.box_exclusivity, special_attributes: null }));
  const { error } = await supabase.from('parallels').insert(rows);
  if (error) console.error('Insert error:', error.message);
  else console.log(`Inserted ${rows.length}/${parallels.length} parallels`);
  const { count } = await supabase.from('parallels').select('*', { count: 'exact', head: true }).eq('product_id', PRODUCT_ID);
  console.log(`Verified: ${count} parallels in DB for 2025 Donruss Optic NFL`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
