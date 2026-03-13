#!/usr/bin/env node

/**
 * Seed 2025 Score Football parallel data.
 * Sources: Beckett, Checklist Insider, Cardboard Connection, Checklistcenter, gogts.net.
 *
 * Usage:
 *   node scripts/seed-score-2025-nfl.mjs
 *   node scripts/seed-score-2025-nfl.mjs --dry-run
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

const PRODUCT_ID = 'c0000000-0000-0000-0000-000000000020'; // 2025 Score NFL

const HOBBY = 'Hobby';
const RETAIL_BLASTER = 'Retail Blaster';
const HOBBY_BLASTER = 'Hobby Blaster';
const MEGA = 'Mega Box';
const ALL = 'All';

const parallels = [
  // Unnumbered
  { name: 'Base', color_hex: '#FFFFFF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1, box_exclusivity: [ALL], description: 'Standard base card' },
  { name: 'Scorecard', color_hex: '#C0C0C0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 2, box_exclusivity: [ALL], description: 'Silver-toned scorecard texture' },
  { name: 'Green', color_hex: '#22C55E', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 3, box_exclusivity: [RETAIL_BLASTER, MEGA], description: 'Green border, Retail Blaster/Mega exclusive (4 per retail blaster)' },
  { name: 'Red', color_hex: '#EF4444', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 4, box_exclusivity: [ALL], description: 'Red border' },
  { name: 'Orange', color_hex: '#F97316', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 5, box_exclusivity: [ALL], description: 'Orange border' },
  { name: 'Purple', color_hex: '#A855F7', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 6, box_exclusivity: [ALL], description: 'Purple border' },
  { name: 'Gold', color_hex: '#EAB308', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 7, box_exclusivity: [ALL], description: 'Gold border' },
  { name: 'Extraterrestrial', color_hex: '#00FF87', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 8, box_exclusivity: [HOBBY], description: 'Alien holofoil SSP case hit; Hobby exclusive' },
  // Numbered
  { name: 'Lava', color_hex: '#FF4500', print_run: 799, serial_numbered: true, is_one_of_one: false, rarity_rank: 9, box_exclusivity: [MEGA], description: 'Lava flow pattern /799, Mega Box exclusive' },
  { name: 'Dots Gold', color_hex: '#F59E0B', print_run: 499, serial_numbered: true, is_one_of_one: false, rarity_rank: 10, box_exclusivity: [ALL], description: 'Gold dot pattern /499' },
  { name: 'Stars', color_hex: '#60A5FA', print_run: 499, serial_numbered: true, is_one_of_one: false, rarity_rank: 11, box_exclusivity: [ALL], description: 'Star-field pattern /499' },
  { name: 'Spokes', color_hex: '#818CF8', print_run: 415, serial_numbered: true, is_one_of_one: false, rarity_rank: 12, box_exclusivity: [ALL], description: 'Geometric spoke pattern /415' },
  { name: 'Dots Blue', color_hex: '#3B82F6', print_run: 399, serial_numbered: true, is_one_of_one: false, rarity_rank: 13, box_exclusivity: [ALL], description: 'Blue dot pattern /399; new in 2025' },
  { name: 'Ellipse', color_hex: '#EC4899', print_run: 399, serial_numbered: true, is_one_of_one: false, rarity_rank: 14, box_exclusivity: [ALL], description: 'Elliptical pattern /399' },
  { name: 'Circular', color_hex: '#14B8A6', print_run: 299, serial_numbered: true, is_one_of_one: false, rarity_rank: 15, box_exclusivity: [ALL], description: 'Circular ring pattern /299' },
  { name: 'Showcase', color_hex: '#F472B6', print_run: 250, serial_numbered: true, is_one_of_one: false, rarity_rank: 16, box_exclusivity: [ALL], description: 'Showcase finish /250' },
  { name: 'Cubic', color_hex: '#7C3AED', print_run: 185, serial_numbered: true, is_one_of_one: false, rarity_rank: 17, box_exclusivity: [HOBBY_BLASTER], description: 'Cubic geometric pattern /185, Hobby Blaster exclusive' },
  { name: 'Electric', color_hex: '#FACC15', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 18, box_exclusivity: [ALL], description: 'Electric lightning pattern /99' },
  { name: 'Gold Zone', color_hex: '#D97706', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 19, box_exclusivity: [ALL], description: 'Gold Zone premium /50' },
  { name: "Artist's Proof", color_hex: '#6B7280', print_run: 35, serial_numbered: true, is_one_of_one: false, rarity_rank: 20, box_exclusivity: [ALL], description: "Artist's proof finish /35" },
  { name: 'Dots Red', color_hex: '#DC2626', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 21, box_exclusivity: [HOBBY_BLASTER], description: 'Red dot pattern /25, Hobby Blaster exclusive' },
  { name: 'Red Zone', color_hex: '#B91C1C', print_run: 20, serial_numbered: true, is_one_of_one: false, rarity_rank: 22, box_exclusivity: [ALL], description: 'Deep red premium /20' },
  { name: 'Die-Cut', color_hex: '#0EA5E9', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 23, box_exclusivity: [HOBBY], description: 'Die-cut shaped border /10, Hobby case hit' },
  { name: 'First Down', color_hex: '#F97316', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 24, box_exclusivity: [ALL], description: 'First-down marker themed /10' },
  { name: 'End Zone', color_hex: '#16A34A', print_run: 6, serial_numbered: true, is_one_of_one: false, rarity_rank: 25, box_exclusivity: [ALL], description: 'Ultra-rare end zone /6' },
  // 1/1s
  { name: 'Gem Masters', color_hex: '#E2E8F0', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 26, box_exclusivity: [ALL], description: 'Gem-foil 1/1' },
  { name: 'Printing Plates Black', color_hex: '#1C1917', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 27, box_exclusivity: [HOBBY], description: 'Black printing plate 1/1' },
  { name: 'Printing Plates Cyan', color_hex: '#06B6D4', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 28, box_exclusivity: [HOBBY], description: 'Cyan printing plate 1/1' },
  { name: 'Printing Plates Magenta', color_hex: '#DB2777', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 29, box_exclusivity: [HOBBY], description: 'Magenta printing plate 1/1' },
  { name: 'Printing Plates Yellow', color_hex: '#FDE047', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 30, box_exclusivity: [HOBBY], description: 'Yellow printing plate 1/1' },
];

async function main() {
  const total = parallels.length;
  console.log(`Seeding ${total} parallels for 2025 Score NFL\n`);

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
