#!/usr/bin/env node

/**
 * Seed 2024-25 Panini Court Kings Basketball parallel data.
 * Sources: Beckett, Checklist Insider, Cardboard Connection.
 *
 * Usage:
 *   node scripts/seed-court-kings-2024-25-nba.mjs
 *   node scripts/seed-court-kings-2024-25-nba.mjs --dry-run
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

const PRODUCT_ID = 'c0000000-0000-0000-0000-00000000000c'; // 2024-25 Court Kings NBA

const HOBBY = 'Hobby';
const BLASTER = 'Blaster';
const ALL = 'All';

const parallels = [
  { name: 'Base', color_hex: '#FFFFFF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1, box_exclusivity: [HOBBY, BLASTER], description: 'Standard base card' },
  { name: 'Artist Proof', color_hex: '#C0C0C0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 2, box_exclusivity: [BLASTER], description: 'Blaster-exclusive silver foil treatment' },
  { name: 'Canvas', color_hex: '#F5F0E1', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 3, box_exclusivity: [HOBBY, BLASTER], description: 'New for 2024-25, textured canvas finish' },
  { name: 'Red and Blue', color_hex: '#B22234', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 4, box_exclusivity: [HOBBY, BLASTER], description: 'Red and blue split design' },
  { name: 'Ruby', color_hex: '#9B111E', print_run: 149, serial_numbered: true, is_one_of_one: false, rarity_rank: 5, box_exclusivity: [HOBBY, BLASTER], description: 'Deep red /149' },
  { name: 'Burgundy', color_hex: '#800020', print_run: 125, serial_numbered: true, is_one_of_one: false, rarity_rank: 6, box_exclusivity: [BLASTER], description: 'Blaster-exclusive burgundy /125' },
  { name: 'Pink', color_hex: '#FF69B4', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 7, box_exclusivity: [HOBBY, BLASTER], description: 'Pink /99' },
  { name: 'Amber', color_hex: '#FFBF00', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 8, box_exclusivity: [HOBBY, BLASTER], description: 'Golden amber /75' },
  { name: 'Violet', color_hex: '#7F00FF', print_run: 49, serial_numbered: true, is_one_of_one: false, rarity_rank: 9, box_exclusivity: [HOBBY, BLASTER], description: 'Purple/violet /49' },
  { name: 'Jade', color_hex: '#00A86B', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 10, box_exclusivity: [BLASTER], description: 'Blaster-exclusive green jade /25' },
  { name: 'Sapphire', color_hex: '#0F52BA', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 11, box_exclusivity: [HOBBY, BLASTER], description: 'Deep blue sapphire /25' },
  { name: 'Gold', color_hex: '#FFD700', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 12, box_exclusivity: [HOBBY, BLASTER], description: 'Gold /10' },
  { name: 'Obsidian', color_hex: '#1C1C1C', print_run: 8, serial_numbered: true, is_one_of_one: false, rarity_rank: 13, box_exclusivity: [BLASTER], description: 'Blaster-exclusive black obsidian /8' },
  { name: 'Masterpiece', color_hex: '#E5E4E2', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 14, box_exclusivity: [HOBBY, BLASTER], description: 'One-of-one masterpiece' },
];

async function main() {
  const total = parallels.length;
  console.log(`Seeding ${total} parallels for 2024-25 Court Kings NBA\n`);

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
