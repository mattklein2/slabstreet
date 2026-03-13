#!/usr/bin/env node

/**
 * Seed 2024 Panini Contenders Football parallel data.
 * Sources: Beckett, Checklist Insider, ChecklistCenter, CardsmithsBreaks.
 *
 * Usage:
 *   node scripts/seed-contenders-2024-nfl.mjs
 *   node scripts/seed-contenders-2024-nfl.mjs --dry-run
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

const PRODUCT_ID = 'c0000000-0000-0000-0000-000000000012'; // 2024 Contenders NFL

const HOBBY = 'Hobby';
const RETAIL_BLASTER = 'Retail Blaster';
const RETAIL_MEGA = 'Retail Mega';
const FAT_PACK = 'Fat Pack';
const FOTL = 'FOTL';
const ALL = 'All';

const parallels = [
  { name: 'Base', color_hex: '#FFFFFF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1, box_exclusivity: [ALL], description: 'Standard Season Ticket base card' },
  { name: 'Retail', color_hex: '#D3D3D3', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 2, box_exclusivity: [RETAIL_BLASTER, RETAIL_MEGA, FAT_PACK], description: 'Retail-only base variant' },
  { name: 'Game Ticket Bronze', color_hex: '#CD7F32', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 3, box_exclusivity: [ALL], description: 'Bronze-toned Game Ticket' },
  { name: 'Game Ticket Orange', color_hex: '#FF8C00', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 4, box_exclusivity: [ALL], description: 'Orange Game Ticket' },
  { name: 'Game Ticket Red', color_hex: '#ED1C24', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 5, box_exclusivity: [ALL], description: 'Red Game Ticket' },
  { name: 'Opening Kickoff Ticket', color_hex: '#1E90FF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 6, box_exclusivity: [ALL], description: 'Opening Kickoff themed ticket' },
  { name: 'Game Ticket Blue', color_hex: '#0033A0', print_run: 499, serial_numbered: true, is_one_of_one: false, rarity_rank: 7, box_exclusivity: [RETAIL_BLASTER], description: 'Blue Game Ticket, Blaster exclusive /499' },
  { name: 'Playoff Ticket', color_hex: '#4B0082', print_run: 199, serial_numbered: true, is_one_of_one: false, rarity_rank: 8, box_exclusivity: [HOBBY], description: 'Purple playoff ticket /199' },
  { name: 'Game Ticket Green', color_hex: '#00A651', print_run: 175, serial_numbered: true, is_one_of_one: false, rarity_rank: 9, box_exclusivity: [FAT_PACK], description: 'Green Game Ticket, Fat Pack exclusive /175' },
  { name: 'Divisional Ticket', color_hex: '#800020', print_run: 149, serial_numbered: true, is_one_of_one: false, rarity_rank: 10, box_exclusivity: [HOBBY], description: 'Burgundy divisional ticket /149' },
  { name: 'Conference Ticket', color_hex: '#B8860B', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 11, box_exclusivity: [HOBBY], description: 'Dark gold conference ticket /99' },
  { name: 'Game Ticket Teal', color_hex: '#008080', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 12, box_exclusivity: [RETAIL_MEGA], description: 'Teal Game Ticket, Mega exclusive /75' },
  { name: 'Ticket Stub', color_hex: '#A0522D', print_run: 54, serial_numbered: true, is_one_of_one: false, rarity_rank: 13, box_exclusivity: [HOBBY], description: 'Torn ticket stub design /54' },
  { name: 'Midfield Ticket', color_hex: '#2E8B57', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 14, box_exclusivity: [HOBBY], description: 'Midfield logo ticket /50' },
  { name: 'Red Zone Ticket FOTL', color_hex: '#DC143C', print_run: 49, serial_numbered: true, is_one_of_one: false, rarity_rank: 15, box_exclusivity: [FOTL], description: 'Red Zone ticket, FOTL exclusive /49' },
  { name: 'Cracked Ice Ticket', color_hex: '#A5F2F3', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 16, box_exclusivity: [HOBBY], description: 'Cracked ice refractor-style /25' },
  { name: 'Week 18 Ticket', color_hex: '#191970', print_run: 18, serial_numbered: true, is_one_of_one: false, rarity_rank: 17, box_exclusivity: [HOBBY], description: 'Week 18 finale themed /18' },
  { name: 'Game Ticket Gold', color_hex: '#FFD700', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 18, box_exclusivity: [HOBBY], description: 'Gold Game Ticket /10' },
  { name: 'Goal Line Ticket FOTL', color_hex: '#FF2400', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 19, box_exclusivity: [FOTL], description: 'Goal line ticket, FOTL exclusive /5' },
  { name: 'Super Bowl Ticket', color_hex: '#FFD700', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 20, box_exclusivity: [HOBBY], description: 'Super Bowl ticket 1/1' },
  { name: 'Printing Plates Black', color_hex: '#000000', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 21, box_exclusivity: [HOBBY], description: 'Black printing plate 1/1' },
  { name: 'Printing Plates Cyan', color_hex: '#00FFFF', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 22, box_exclusivity: [HOBBY], description: 'Cyan printing plate 1/1' },
  { name: 'Printing Plates Magenta', color_hex: '#FF00FF', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 23, box_exclusivity: [HOBBY], description: 'Magenta printing plate 1/1' },
  { name: 'Printing Plates Yellow', color_hex: '#FFFF00', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 24, box_exclusivity: [HOBBY], description: 'Yellow printing plate 1/1' },
];

async function main() {
  const total = parallels.length;
  console.log(`Seeding ${total} parallels for 2024 Contenders NFL\n`);

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
