#!/usr/bin/env node

/**
 * Seed 2024-25 Panini NBA Hoops Basketball parallel data.
 * Sources: Beckett, Checklist Insider, Cardboard Connection, Cardlines.
 * NOTE: Includes both standard base parallels AND Premium Prizms (Opti-Chrome sub-line).
 *
 * Usage:
 *   node scripts/seed-hoops-2024-25-nba.mjs
 *   node scripts/seed-hoops-2024-25-nba.mjs --dry-run
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

const PRODUCT_ID = 'c0000000-0000-0000-0000-000000000009'; // 2024-25 Hoops NBA

const HOBBY = 'Hobby';
const HOBBY_BLASTER = 'Hobby Blaster';
const BLASTER = 'Blaster';
const FAT_PACK = 'Fat Pack';
const COUNTER = 'Counter Display';
const WINTER = 'Winter Blaster';
const PREMIUM_BOX = 'Premium Box Set';
const RETAIL = 'Retail';

const parallels = [
  // ── Standard Base Parallels ──
  { name: 'Red Back', color_hex: '#CC2200', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1, box_exclusivity: [HOBBY], description: 'Hobby-exclusive red card back' },
  { name: 'Texture', color_hex: '#C0A080', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 2, box_exclusivity: [HOBBY], description: 'Hobby-exclusive textured card stock' },
  { name: 'Blue', color_hex: '#0057B8', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 3, box_exclusivity: [BLASTER], description: 'Retail Blaster-exclusive blue' },
  { name: 'Teal Explosion', color_hex: '#00C5CD', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 4, box_exclusivity: [FAT_PACK], description: 'Fat Pack-exclusive teal holographic foil' },
  { name: 'Winter', color_hex: '#B0C8E0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 5, box_exclusivity: [WINTER], description: 'Winter Blaster-exclusive winter foil' },
  { name: 'Purple Winter', color_hex: '#9B59B6', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 6, box_exclusivity: [WINTER], description: 'Winter Blaster-exclusive purple winter' },
  { name: 'Impulse', color_hex: '#E040FB', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 7, box_exclusivity: [RETAIL], description: 'Retail impulse foil' },
  { name: 'Storm', color_hex: '#7B8FA1', print_run: 299, serial_numbered: true, is_one_of_one: false, rarity_rank: 8, box_exclusivity: [BLASTER], description: 'Retail Blaster-exclusive storm foil /299' },
  { name: 'Silver', color_hex: '#C0C0C0', print_run: 199, serial_numbered: true, is_one_of_one: false, rarity_rank: 9, box_exclusivity: [HOBBY], description: 'Hobby-exclusive silver foil /199' },
  { name: 'Premium Box Set', color_hex: '#D4AF37', print_run: 199, serial_numbered: true, is_one_of_one: false, rarity_rank: 10, box_exclusivity: [PREMIUM_BOX], description: 'Premium Box Set exclusive /199' },
  { name: 'Teal', color_hex: '#008080', print_run: 175, serial_numbered: true, is_one_of_one: false, rarity_rank: 11, box_exclusivity: [BLASTER], description: 'Retail Blaster-exclusive teal /175' },
  { name: 'Orange', color_hex: '#FF6A00', print_run: 149, serial_numbered: true, is_one_of_one: false, rarity_rank: 12, box_exclusivity: [HOBBY], description: 'Hobby-exclusive orange /149' },
  { name: 'White Explosion', color_hex: '#F0F0F0', print_run: 149, serial_numbered: true, is_one_of_one: false, rarity_rank: 13, box_exclusivity: [FAT_PACK], description: 'Fat Pack-exclusive white explosion /149' },
  { name: 'Purple Explosion', color_hex: '#7030A0', print_run: 110, serial_numbered: true, is_one_of_one: false, rarity_rank: 14, box_exclusivity: [COUNTER], description: 'Counter Display-exclusive purple explosion /110' },
  { name: 'Green', color_hex: '#1DB954', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 15, box_exclusivity: [HOBBY], description: 'Hobby-exclusive green /99' },
  { name: 'Blue Scope', color_hex: '#1E90FF', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 16, box_exclusivity: [HOBBY_BLASTER], description: 'Hobby Blaster-exclusive blue scope /99' },
  { name: 'Green Explosion', color_hex: '#00B050', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 17, box_exclusivity: [COUNTER], description: 'Counter Display-exclusive green explosion /99' },
  { name: 'Blue Winter Holo', color_hex: '#4169E1', print_run: 88, serial_numbered: true, is_one_of_one: false, rarity_rank: 18, box_exclusivity: [WINTER], description: 'Winter Blaster-exclusive blue holo /88' },
  { name: 'Dragon Year', color_hex: '#C8102E', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 19, box_exclusivity: [HOBBY], description: 'Hobby-exclusive Year of the Dragon /75' },
  { name: 'Red', color_hex: '#E00000', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 20, box_exclusivity: [BLASTER], description: 'Retail Blaster-exclusive red /75' },
  { name: 'Blue Explosion', color_hex: '#0070C0', print_run: 59, serial_numbered: true, is_one_of_one: false, rarity_rank: 21, box_exclusivity: [COUNTER], description: 'Counter Display-exclusive blue explosion /59' },
  { name: 'Red Scope', color_hex: '#DC143C', print_run: 49, serial_numbered: true, is_one_of_one: false, rarity_rank: 22, box_exclusivity: [HOBBY_BLASTER], description: 'Hobby Blaster-exclusive red scope /49' },
  { name: 'Artist Proof', color_hex: '#8B5CF6', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 23, box_exclusivity: [HOBBY], description: 'Hobby-exclusive Artist Proof /25' },
  { name: 'Orange Explosion', color_hex: '#FF8C00', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 24, box_exclusivity: [FAT_PACK], description: 'Fat Pack-exclusive orange explosion /25' },
  { name: 'Red Explosion', color_hex: '#C00000', print_run: 15, serial_numbered: true, is_one_of_one: false, rarity_rank: 25, box_exclusivity: [COUNTER], description: 'Counter Display-exclusive red explosion /15' },
  { name: 'Artist Proof Gold', color_hex: '#FFD700', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 26, box_exclusivity: [HOBBY], description: 'Hobby-exclusive gold Artist Proof /10' },
  { name: 'Green Scope', color_hex: '#00A550', print_run: 8, serial_numbered: true, is_one_of_one: false, rarity_rank: 27, box_exclusivity: [HOBBY_BLASTER], description: 'Hobby Blaster-exclusive green scope /8' },
  { name: 'Yellow Checkerboard', color_hex: '#F5C518', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 28, box_exclusivity: [BLASTER], description: 'Retail Blaster-exclusive yellow checkerboard /5' },
  { name: 'Artist Proof Black', color_hex: '#111111', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 29, box_exclusivity: [HOBBY], description: 'Hobby-exclusive black Artist Proof 1/1' },

  // ── Premium Prizms (Opti-Chrome sub-line) ──
  { name: 'Premium Prizms Silver', color_hex: '#D0D0D0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 30, box_exclusivity: [HOBBY, HOBBY_BLASTER, COUNTER, FAT_PACK], description: 'Chrome silver Premium Prizm' },
  { name: 'Premium Prizms Checkerboard', color_hex: '#888888', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 31, box_exclusivity: [HOBBY, HOBBY_BLASTER, COUNTER, FAT_PACK], description: 'Chrome checkerboard pattern' },
  { name: 'Premium Prizms Green', color_hex: '#28A745', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 32, box_exclusivity: [HOBBY, HOBBY_BLASTER, COUNTER, FAT_PACK], description: 'Chrome green' },
  { name: 'Premium Prizms Winter', color_hex: '#AED6F1', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 33, box_exclusivity: [WINTER], description: 'Winter Blaster-exclusive chrome winter' },
  { name: 'Premium Prizms Purple Winter', color_hex: '#8E44AD', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 34, box_exclusivity: [WINTER], description: 'Winter Blaster-exclusive chrome purple winter' },
  { name: 'Premium Prizms Purple', color_hex: '#6A0DAD', print_run: 249, serial_numbered: true, is_one_of_one: false, rarity_rank: 35, box_exclusivity: [HOBBY, HOBBY_BLASTER], description: 'Chrome purple /249' },
  { name: 'Premium Prizms Orange', color_hex: '#FD7E14', print_run: 199, serial_numbered: true, is_one_of_one: false, rarity_rank: 36, box_exclusivity: [HOBBY, HOBBY_BLASTER], description: 'Chrome orange /199' },
  { name: 'Premium Prizms Red Pulsar', color_hex: '#E74C3C', print_run: 199, serial_numbered: true, is_one_of_one: false, rarity_rank: 37, box_exclusivity: [HOBBY, HOBBY_BLASTER], description: 'Chrome red pulsar /199' },
  { name: 'Premium Prizms Lime Green', color_hex: '#90EE90', print_run: 149, serial_numbered: true, is_one_of_one: false, rarity_rank: 38, box_exclusivity: [HOBBY, HOBBY_BLASTER], description: 'Chrome lime green /149' },
  { name: 'Premium Prizms Blue Scope', color_hex: '#1565C0', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 39, box_exclusivity: [HOBBY_BLASTER], description: 'Hobby Blaster chrome blue scope /99' },
  { name: 'Premium Prizms Blue Wave', color_hex: '#1976D2', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 40, box_exclusivity: [COUNTER], description: 'Counter Display chrome blue wave /99' },
  { name: 'Premium Prizms Red Lazer', color_hex: '#FF0000', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 41, box_exclusivity: [FAT_PACK], description: 'Fat Pack chrome red lazer /99' },
  { name: 'Premium Prizms Blue Pulsar', color_hex: '#0050A0', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 42, box_exclusivity: [HOBBY, HOBBY_BLASTER], description: 'Chrome blue pulsar /99' },
  { name: 'Premium Prizms Red', color_hex: '#B22222', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 43, box_exclusivity: [HOBBY, HOBBY_BLASTER], description: 'Chrome red /99' },
  { name: 'Premium Prizms Winter Blizzard', color_hex: '#CFE2F3', print_run: 88, serial_numbered: true, is_one_of_one: false, rarity_rank: 44, box_exclusivity: [WINTER], description: 'Winter Blaster chrome blizzard /88' },
  { name: 'Premium Prizms Blue Lazer', color_hex: '#1A6EB5', print_run: 49, serial_numbered: true, is_one_of_one: false, rarity_rank: 45, box_exclusivity: [FAT_PACK], description: 'Fat Pack chrome blue lazer /49' },
  { name: 'Premium Prizms Blue', color_hex: '#2255CC', print_run: 49, serial_numbered: true, is_one_of_one: false, rarity_rank: 46, box_exclusivity: [HOBBY, HOBBY_BLASTER], description: 'Chrome blue /49' },
  { name: 'Premium Prizms Red Scope', color_hex: '#CC0022', print_run: 49, serial_numbered: true, is_one_of_one: false, rarity_rank: 47, box_exclusivity: [HOBBY_BLASTER], description: 'Hobby Blaster chrome red scope /49' },
  { name: 'Premium Prizms Green Lazer', color_hex: '#00CC44', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 48, box_exclusivity: [FAT_PACK], description: 'Fat Pack chrome green lazer /25' },
  { name: 'Premium Prizms Green Pulsar', color_hex: '#00AA33', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 49, box_exclusivity: [HOBBY, HOBBY_BLASTER], description: 'Chrome green pulsar /25' },
  { name: 'Premium Prizms Green Scope', color_hex: '#007A33', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 50, box_exclusivity: [HOBBY_BLASTER], description: 'Hobby Blaster chrome green scope /25' },
  { name: 'Premium Prizms Green Wave', color_hex: '#009950', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 51, box_exclusivity: [COUNTER], description: 'Counter Display chrome green wave /25' },
  { name: 'Premium Prizms Mojo', color_hex: '#CC8800', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 52, box_exclusivity: [HOBBY, HOBBY_BLASTER], description: 'Chrome multi-color mojo /25' },
  { name: 'Premium Prizms Gold', color_hex: '#FFC200', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 53, box_exclusivity: [HOBBY, HOBBY_BLASTER], description: 'Chrome gold /10' },
  { name: 'Premium Prizms Gold Vinyl', color_hex: '#D4AF37', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 54, box_exclusivity: [HOBBY], description: 'Hobby chrome gold vinyl 1/1' },
  { name: 'Premium Prizms Nebula', color_hex: '#4B0082', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 55, box_exclusivity: [HOBBY, HOBBY_BLASTER], description: 'Chrome nebula galaxy 1/1' },
];

async function main() {
  const total = parallels.length;
  console.log(`Seeding ${total} parallels for 2024-25 Hoops NBA\n`);

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
