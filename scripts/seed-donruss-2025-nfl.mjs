#!/usr/bin/env node

/**
 * Seed 2025 Donruss Football parallel data.
 * Sources: Checklist Insider, Beckett, gogts.net.
 *
 * Usage:
 *   node scripts/seed-donruss-2025-nfl.mjs
 *   node scripts/seed-donruss-2025-nfl.mjs --dry-run
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

const PRODUCT_ID = 'c0000000-0000-0000-0000-00000000001f'; // 2025 Donruss NFL

const HOBBY = 'Hobby';
const MEGA = 'Mega';
const RETAIL = 'Retail';
const BLASTER = 'Blaster';
const VALUE_PACK = 'Value Pack';
const HOLIDAY_TIN = 'Holiday Tin';
const ALL = 'All';

const parallels = [
  // Unnumbered
  { name: 'Base', color_hex: '#FFFFFF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1, box_exclusivity: [ALL], description: 'Standard base card' },
  { name: 'Rated Rookie', color_hex: '#FFFFFF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 2, box_exclusivity: [ALL], description: 'Classic Donruss Rated Rookie design; unnumbered' },
  { name: 'Aqueous Test', color_hex: '#B0E0E6', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 3, box_exclusivity: [HOBBY, MEGA, RETAIL, BLASTER], description: 'Light blue test-print style parallel; new in 2025' },
  { name: 'Canvas', color_hex: '#D2B48C', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 4, box_exclusivity: [HOBBY, MEGA, RETAIL, BLASTER], description: 'Textured canvas-style painted look; new in 2025' },
  { name: 'No Name', color_hex: '#C0C0C0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 5, box_exclusivity: [HOBBY, MEGA, RETAIL, BLASTER], description: 'Error-style variation with player name omitted; SP' },
  { name: 'Press Proof Blue', color_hex: '#1E90FF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 6, box_exclusivity: [HOBBY, MEGA, RETAIL, BLASTER, VALUE_PACK], description: 'Blue Press Proof; 4 per Value Pack' },
  { name: 'Press Proof Green', color_hex: '#228B22', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 7, box_exclusivity: [HOBBY, MEGA], description: 'Green Press Proof; new color for 2025' },
  { name: 'Press Proof Purple', color_hex: '#800080', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 8, box_exclusivity: [HOBBY, MEGA, BLASTER, HOLIDAY_TIN], description: 'Purple Press Proof; 3 per Holiday Tin' },
  { name: 'Press Proof Red', color_hex: '#DC143C', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 9, box_exclusivity: [HOBBY, MEGA, RETAIL], description: 'Red Press Proof; 4 per Retail box' },
  { name: 'Press Proof Yellow', color_hex: '#FFD700', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 10, box_exclusivity: [HOBBY, MEGA, RETAIL, BLASTER], description: 'Yellow Press Proof; new in 2025' },
  // Numbered
  { name: 'Season Stat Line', color_hex: '#4169E1', print_run: null, serial_numbered: true, is_one_of_one: false, rarity_rank: 11, box_exclusivity: [HOBBY, MEGA], description: 'Numbered to career stat (max /500); varies per player' },
  { name: 'Press Proof Silver', color_hex: '#C0C0C0', print_run: 199, serial_numbered: true, is_one_of_one: false, rarity_rank: 12, box_exclusivity: [HOBBY, MEGA], description: 'Silver-foil Press Proof /199' },
  { name: 'Jersey Number', color_hex: '#708090', print_run: null, serial_numbered: true, is_one_of_one: false, rarity_rank: 13, box_exclusivity: [HOBBY, MEGA], description: 'Numbered to jersey number (max /99); varies per player' },
  { name: 'Press Proof Silver Die-Cut', color_hex: '#A8A9AD', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 14, box_exclusivity: [HOBBY], description: 'Silver die-cut Press Proof /99; Hobby exclusive' },
  { name: 'Press Proof Gold', color_hex: '#FFD700', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 15, box_exclusivity: [HOBBY], description: 'Gold-foil Press Proof /50' },
  { name: 'Press Proof Gold Die-Cut', color_hex: '#DAA520', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 16, box_exclusivity: [HOBBY], description: 'Gold die-cut Press Proof /25; Hobby exclusive' },
  { name: 'Press Proof Black', color_hex: '#1C1C1C', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 17, box_exclusivity: [HOBBY], description: 'Black Press Proof /10' },
  // 1/1
  { name: 'Press Proof Black Die-Cut', color_hex: '#000000', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 18, box_exclusivity: [HOBBY], description: 'Black die-cut Press Proof 1/1; ultimate parallel' },
];

async function main() {
  const total = parallels.length;
  console.log(`Seeding ${total} parallels for 2025 Donruss NFL\n`);

  if (DRY_RUN) {
    console.log('DRY RUN — no changes made.');
    parallels.forEach((p, i) => console.log(`  ${i + 1}. ${p.name} ${p.print_run ? '/' + p.print_run : '(unnumbered)'}`));
    return;
  }

  const { error: delError } = await supabase.from('parallels').delete().eq('product_id', PRODUCT_ID);
  if (delError) console.warn('Delete warning:', delError.message);

  const BATCH_SIZE = 50;
  let inserted = 0;
  for (let i = 0; i < parallels.length; i += BATCH_SIZE) {
    const batch = parallels.slice(i, i + BATCH_SIZE).map(p => ({ product_id: PRODUCT_ID, ...p }));
    const { error } = await supabase.from('parallels').insert(batch);
    if (error) console.error(`Batch error at ${i}:`, error.message);
    else inserted += batch.length;
  }

  console.log(`Inserted ${inserted}/${total} parallels`);
  const { count } = await supabase.from('parallels').select('*', { count: 'exact', head: true }).eq('product_id', PRODUCT_ID);
  console.log(`Verified: ${count} parallels in DB for this product`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
