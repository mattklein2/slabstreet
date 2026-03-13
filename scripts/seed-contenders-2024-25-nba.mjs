#!/usr/bin/env node

/**
 * Seed 2024-25 Panini Contenders Basketball parallel data.
 * NOTE: 2024-25 Contenders has NOT been released yet. Using 2023-24 data
 * as the parallel structure is historically consistent year-to-year.
 * Sources: Beckett, Checklist Insider, Cardboard Connection.
 *
 * Usage:
 *   node scripts/seed-contenders-2024-25-nba.mjs
 *   node scripts/seed-contenders-2024-25-nba.mjs --dry-run
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

const PRODUCT_ID = 'c0000000-0000-0000-0000-00000000000d'; // 2024-25 Contenders NBA

const HOBBY = 'Hobby';
const BLASTER = 'Blaster';
const FOTL = 'FOTL';
const ALL = 'All';

const parallels = [
  { name: 'Season Ticket', color_hex: '#FFFFFF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1, box_exclusivity: [HOBBY, BLASTER], description: 'Standard base card' },
  { name: 'Retail', color_hex: '#D3D3D3', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 2, box_exclusivity: [BLASTER], description: 'Retail-exclusive base parallel' },
  { name: 'Game Ticket Bronze', color_hex: '#CD7F32', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 3, box_exclusivity: [HOBBY], description: 'Hobby bronze-tinted' },
  { name: 'Game Ticket Green', color_hex: '#228B22', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 4, box_exclusivity: [HOBBY], description: 'Hobby green-tinted' },
  { name: 'Play-In Ticket', color_hex: '#A9A9A9', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 5, box_exclusivity: [HOBBY], description: 'Hobby play-in ticket design' },
  { name: 'Premium Edition', color_hex: '#B8860B', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 6, box_exclusivity: [HOBBY], description: 'Chromium stock premium version' },
  { name: 'Playoff Ticket', color_hex: '#4169E1', print_run: 249, serial_numbered: true, is_one_of_one: false, rarity_rank: 7, box_exclusivity: [HOBBY], description: 'Blue playoff ticket /249' },
  { name: 'Game Ticket Red', color_hex: '#DC143C', print_run: 199, serial_numbered: true, is_one_of_one: false, rarity_rank: 8, box_exclusivity: [BLASTER], description: 'Blaster-exclusive red /199' },
  { name: 'Game Ticket Pink', color_hex: '#FF69B4', print_run: 199, serial_numbered: true, is_one_of_one: false, rarity_rank: 9, box_exclusivity: [HOBBY], description: 'Hobby pink /199' },
  { name: 'First Round Ticket', color_hex: '#2E8B57', print_run: 149, serial_numbered: true, is_one_of_one: false, rarity_rank: 10, box_exclusivity: [HOBBY], description: 'Green first-round ticket /149' },
  { name: 'Semifinal Ticket', color_hex: '#FF8C00', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 11, box_exclusivity: [HOBBY], description: 'Orange semifinal ticket /99' },
  { name: 'Ticket Stub', color_hex: '#8B8682', print_run: 77, serial_numbered: true, is_one_of_one: false, rarity_rank: 12, box_exclusivity: [HOBBY], description: 'Torn ticket stub design /77' },
  { name: 'Conference Finals Ticket', color_hex: '#9400D3', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 13, box_exclusivity: [HOBBY], description: 'Purple conference finals /75' },
  { name: 'Game Ticket Blue', color_hex: '#0000CD', print_run: 49, serial_numbered: true, is_one_of_one: false, rarity_rank: 14, box_exclusivity: [BLASTER], description: 'Blaster-exclusive blue /49' },
  { name: 'The Finals Ticket', color_hex: '#FFD700', print_run: 49, serial_numbered: true, is_one_of_one: false, rarity_rank: 15, box_exclusivity: [HOBBY], description: 'Gold finals ticket /49' },
  { name: 'Cracked Ice Ticket', color_hex: '#E0FFFF', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 16, box_exclusivity: [HOBBY], description: 'Cracked ice refractor /25' },
  { name: 'Game Ticket Purple', color_hex: '#6A0DAD', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 17, box_exclusivity: [HOBBY], description: 'Hobby purple /25' },
  { name: 'Opening Night Ticket FOTL', color_hex: '#00CED1', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 18, box_exclusivity: [FOTL], description: 'FOTL exclusive /25' },
  { name: 'Game 7 Ticket', color_hex: '#8B0000', print_run: 7, serial_numbered: true, is_one_of_one: false, rarity_rank: 19, box_exclusivity: [HOBBY], description: 'Ultra-rare Game 7 ticket /7' },
  { name: 'Championship Ticket', color_hex: '#FFD700', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 20, box_exclusivity: [HOBBY], description: 'Championship ticket 1/1' },
];

async function main() {
  const total = parallels.length;
  console.log(`Seeding ${total} parallels for 2024-25 Contenders NBA\n`);

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
