#!/usr/bin/env node

/**
 * Seed 2024 Bowman Baseball parallel data.
 * Sources: Cardboard Connection, Beckett, Checklist Insider, Topps Ripped.
 *
 * Usage:
 *   node scripts/seed-bowman-2024-mlb.mjs
 *   node scripts/seed-bowman-2024-mlb.mjs --dry-run
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

const PRODUCT_ID = 'c0000000-0000-0000-0000-000000000015'; // 2024 Bowman MLB

const HOBBY = 'Hobby';
const RETAIL = 'Retail';
const BLASTER = 'Blaster';
const ALL = 'All';

const parallels = [
  { name: 'Base', color_hex: '#FFFFFF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1, box_exclusivity: [ALL], description: 'Standard base card, white border' },
  { name: 'Sky Blue Border', color_hex: '#87CEEB', print_run: 499, serial_numbered: true, is_one_of_one: false, rarity_rank: 2, box_exclusivity: [ALL], description: 'Light sky blue border /499' },
  { name: 'Neon Green Border', color_hex: '#39FF14', print_run: 399, serial_numbered: true, is_one_of_one: false, rarity_rank: 3, box_exclusivity: [ALL], description: 'Bright neon green border /399' },
  { name: 'Fuchsia Border', color_hex: '#FF00FF', print_run: 299, serial_numbered: true, is_one_of_one: false, rarity_rank: 4, box_exclusivity: [ALL], description: 'Vivid fuchsia border /299' },
  { name: 'Purple Border', color_hex: '#800080', print_run: 250, serial_numbered: true, is_one_of_one: false, rarity_rank: 5, box_exclusivity: [ALL], description: 'Solid purple border /250' },
  { name: 'Purple Pattern', color_hex: '#9B30FF', print_run: 199, serial_numbered: true, is_one_of_one: false, rarity_rank: 6, box_exclusivity: [ALL], description: 'Purple with geometric pattern /199' },
  { name: 'Pink Border', color_hex: '#FF69B4', print_run: 175, serial_numbered: true, is_one_of_one: false, rarity_rank: 7, box_exclusivity: [ALL], description: 'Hot pink border /175' },
  { name: 'Blue Border', color_hex: '#0000FF', print_run: 150, serial_numbered: true, is_one_of_one: false, rarity_rank: 8, box_exclusivity: [ALL], description: 'Solid blue border /150' },
  { name: 'Blue Pattern', color_hex: '#4169E1', print_run: 125, serial_numbered: true, is_one_of_one: false, rarity_rank: 9, box_exclusivity: [ALL], description: 'Blue with geometric pattern /125' },
  { name: 'Green Border', color_hex: '#00C853', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 10, box_exclusivity: [RETAIL, BLASTER], description: 'Green border, retail exclusive /99' },
  { name: 'Green Pattern', color_hex: '#2E8B57', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 11, box_exclusivity: [RETAIL, BLASTER], description: 'Green with geometric pattern, retail exclusive /99' },
  { name: 'Yellow Border', color_hex: '#FFD700', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 12, box_exclusivity: [ALL], description: 'Bright yellow border /75' },
  { name: 'Gold Border', color_hex: '#DAA520', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 13, box_exclusivity: [ALL], description: 'Metallic gold border /50' },
  { name: 'Orange Border', color_hex: '#FF8C00', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 14, box_exclusivity: [HOBBY], description: 'Orange border, hobby exclusive /25' },
  { name: 'Black Pattern', color_hex: '#1A1A1A', print_run: 15, serial_numbered: true, is_one_of_one: false, rarity_rank: 15, box_exclusivity: [HOBBY], description: 'Black with geometric pattern, hobby exclusive /15' },
  { name: 'Red Border', color_hex: '#FF0000', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 16, box_exclusivity: [ALL], description: 'Red border /5' },
  { name: 'Platinum Border', color_hex: '#E5E4E2', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 17, box_exclusivity: [ALL], description: 'Platinum rainbow foil 1/1' },
  { name: 'Printing Plate Black', color_hex: '#000000', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 18, box_exclusivity: [ALL], description: 'Black printing plate 1/1' },
  { name: 'Printing Plate Cyan', color_hex: '#00FFFF', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 19, box_exclusivity: [ALL], description: 'Cyan printing plate 1/1' },
  { name: 'Printing Plate Magenta', color_hex: '#FF00FF', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 20, box_exclusivity: [ALL], description: 'Magenta printing plate 1/1' },
  { name: 'Printing Plate Yellow', color_hex: '#FFFF00', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 21, box_exclusivity: [ALL], description: 'Yellow printing plate 1/1' },
];

async function main() {
  const total = parallels.length;
  console.log(`Seeding ${total} parallels for 2024 Bowman MLB\n`);

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
