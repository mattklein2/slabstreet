#!/usr/bin/env node

/**
 * Seed complete 2024 Panini Prizm Football parallel data.
 * Sources: Cardboard Connection, Beckett, community break data.
 *
 * Usage:
 *   node scripts/seed-prizm-2024-nfl.mjs
 *   node scripts/seed-prizm-2024-nfl.mjs --dry-run
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

const PRODUCT_ID = 'c0000000-0000-0000-0000-000000000004'; // 2024 Prizm NFL

// Box type shorthand
const HOBBY = 'Hobby';
const FAST_BREAK = 'Fast Break';
const CHOICE = 'Choice';
const FOTL = 'FOTL';
const BLASTER = 'Retail Blaster';
const MEGA = 'Retail Mega';
const HANGER = 'Hanger';
const FAT_PACK = 'Fat Pack/Cello';
const H2 = 'H2';
const ALL = 'All';

// Complete parallel data for 2024 Prizm Football
const parallels = [
  // ── Unnumbered Parallels ──────────────────────────────────────
  { name: 'Base', color_hex: null, print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1, box_exclusivity: [ALL], description: 'Standard base card' },
  { name: 'Silver', color_hex: '#C0C0C0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 2, box_exclusivity: [ALL], description: 'The iconic Prizm parallel — shimmery silver refractor pattern' },
  { name: 'Hyper', color_hex: '#E8E8FF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 3, box_exclusivity: [HOBBY], description: 'Bright hyper-reflective finish — Hobby exclusive' },
  { name: 'Wave', color_hex: '#87CEEB', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 4, box_exclusivity: [ALL], description: 'Wavy holographic pattern across the card' },
  { name: 'Ice', color_hex: '#B0E0E6', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 5, box_exclusivity: [BLASTER], description: 'Frosted ice finish — Retail Blaster exclusive' },
  { name: 'Red/White/Blue', color_hex: '#3B82F6', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 6, box_exclusivity: [FAT_PACK, HANGER], description: 'Tri-color patriotic pattern — Fat Pack and Hanger exclusive' },
  { name: 'Pulsar', color_hex: '#FFD700', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 7, box_exclusivity: [FAT_PACK], description: 'Flash/pulse refractor effect — Retail exclusive' },
  { name: 'Ruby Wave', color_hex: '#9B111E', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 8, box_exclusivity: [HOBBY], description: 'Deep ruby red wave pattern — Hobby exclusive' },
  { name: 'Green Wave', color_hex: '#228B22', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 9, box_exclusivity: [BLASTER], description: 'Green wave pattern — Retail Blaster exclusive' },
  { name: 'Red Ice', color_hex: '#DC143C', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 10, box_exclusivity: [BLASTER, FAT_PACK], description: 'Red-tinted frosted ice finish — Retail exclusive' },
  { name: 'Orange Ice', color_hex: '#FF8C00', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 11, box_exclusivity: [HANGER], description: 'Orange-tinted frosted ice — Hanger exclusive' },
  { name: 'Pink Ice', color_hex: '#FFB6C1', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 12, box_exclusivity: [MEGA], description: 'Pink frosted ice finish — Retail Mega exclusive' },
  { name: 'Snakeskin', color_hex: '#556B2F', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 13, box_exclusivity: [HOBBY], description: 'Snakeskin texture pattern — Hobby exclusive' },
  { name: 'Black White', color_hex: '#1A1A1A', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 14, box_exclusivity: [ALL], description: 'Monochrome black and white design' },
  { name: 'White Sparkle', color_hex: '#F8F8FF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 15, box_exclusivity: [ALL], description: 'Sparkly white refractor finish' },
  { name: 'Fast Break', color_hex: '#6A5ACD', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 16, box_exclusivity: [FAST_BREAK], description: 'Circle background pattern — Fast Break exclusive' },
  { name: 'Green', color_hex: '#22C55E', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 17, box_exclusivity: [ALL], description: 'Green shimmer finish' },
  { name: 'Choice Blue/Yellow/Green', color_hex: '#0055A4', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 18, box_exclusivity: [CHOICE], description: 'Tri-color Choice pattern — Choice exclusive' },
  { name: 'Choice Tiger Stripe', color_hex: '#FF8C00', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 19, box_exclusivity: [CHOICE], description: 'Tiger stripe texture pattern — Choice exclusive' },
  { name: 'H2', color_hex: '#4682B4', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 20, box_exclusivity: [H2], description: 'Unique H2 pattern — H2 box exclusive' },

  // ── Numbered Parallels ────────────────────────────────────────
  { name: 'Red', color_hex: '#CC0000', print_run: 299, serial_numbered: true, is_one_of_one: false, rarity_rank: 21, box_exclusivity: [ALL], description: 'Red shimmer numbered to 299' },
  { name: 'White Lazer', color_hex: '#FFFFFF', print_run: 275, serial_numbered: true, is_one_of_one: false, rarity_rank: 22, box_exclusivity: [ALL], description: 'White with laser line accent /275' },
  { name: 'Pink', color_hex: '#FF69B4', print_run: 249, serial_numbered: true, is_one_of_one: false, rarity_rank: 23, box_exclusivity: [ALL], description: 'Pink shimmer numbered to 249' },
  { name: 'Football', color_hex: '#8B4513', print_run: 225, serial_numbered: true, is_one_of_one: false, rarity_rank: 24, box_exclusivity: [HOBBY], description: 'Football texture /225 — Hobby exclusive' },
  { name: 'Teal Ice', color_hex: '#008080', print_run: 225, serial_numbered: true, is_one_of_one: false, rarity_rank: 25, box_exclusivity: [ALL], description: 'Teal frosted ice finish /225' },
  { name: 'Blue', color_hex: '#0055A4', print_run: 199, serial_numbered: true, is_one_of_one: false, rarity_rank: 26, box_exclusivity: [ALL], description: 'Blue shimmer numbered to 199' },
  { name: 'White', color_hex: '#FFFFFF', print_run: 175, serial_numbered: true, is_one_of_one: false, rarity_rank: 27, box_exclusivity: [HOBBY], description: 'White shimmer /175 — Hobby exclusive' },
  { name: 'Fast Break Blue', color_hex: '#4169E1', print_run: 150, serial_numbered: true, is_one_of_one: false, rarity_rank: 28, box_exclusivity: [FAST_BREAK], description: 'Blue Fast Break /150 — Fast Break exclusive' },
  { name: 'Purple Ice', color_hex: '#800080', print_run: 149, serial_numbered: true, is_one_of_one: false, rarity_rank: 29, box_exclusivity: [ALL], description: 'Purple frosted ice finish /149' },
  { name: 'Blue Sparkle', color_hex: '#4169E1', print_run: 144, serial_numbered: true, is_one_of_one: false, rarity_rank: 30, box_exclusivity: [ALL], description: 'Blue sparkle refractor /144' },
  { name: 'Blue Ice', color_hex: '#6495ED', print_run: 125, serial_numbered: true, is_one_of_one: false, rarity_rank: 31, box_exclusivity: [ALL], description: 'Blue frosted ice finish /125' },
  { name: 'Wave Blue', color_hex: '#4682B4', print_run: 125, serial_numbered: true, is_one_of_one: false, rarity_rank: 32, box_exclusivity: [ALL], description: 'Blue wave pattern /125' },
  { name: 'Fast Break Orange', color_hex: '#FF8C00', print_run: 125, serial_numbered: true, is_one_of_one: false, rarity_rank: 33, box_exclusivity: [FAST_BREAK], description: 'Orange Fast Break /125 — Fast Break exclusive' },
  { name: 'Fast Break Red', color_hex: '#CC0000', print_run: 100, serial_numbered: true, is_one_of_one: false, rarity_rank: 34, box_exclusivity: [FAST_BREAK], description: 'Red Fast Break /100 — Fast Break exclusive' },
  { name: 'Purple', color_hex: '#800080', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 35, box_exclusivity: [ALL], description: 'Purple shimmer /99' },
  { name: 'Choice Red', color_hex: '#CC0000', print_run: 88, serial_numbered: true, is_one_of_one: false, rarity_rank: 36, box_exclusivity: [CHOICE], description: 'Red Choice /88 — Choice exclusive' },
  { name: 'Multi Wave', color_hex: '#FF00FF', print_run: 88, serial_numbered: true, is_one_of_one: false, rarity_rank: 37, box_exclusivity: [ALL], description: 'Multi-color wave pattern /88' },
  { name: 'Fast Break Purple', color_hex: '#800080', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 38, box_exclusivity: [FAST_BREAK], description: 'Purple Fast Break /75 — Fast Break exclusive' },
  { name: 'Red Power', color_hex: '#8B0000', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 39, box_exclusivity: [ALL], description: 'Dark red power finish /75' },
  { name: 'Wave Orange', color_hex: '#FF8C00', print_run: 60, serial_numbered: true, is_one_of_one: false, rarity_rank: 40, box_exclusivity: [ALL], description: 'Orange wave pattern /60' },
  { name: 'Fast Break Pink', color_hex: '#FF69B4', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 41, box_exclusivity: [FAST_BREAK], description: 'Pink Fast Break /50 — Fast Break exclusive' },
  { name: 'Choice Blue', color_hex: '#0055A4', print_run: 49, serial_numbered: true, is_one_of_one: false, rarity_rank: 42, box_exclusivity: [CHOICE], description: 'Blue Choice /49 — Choice exclusive' },
  { name: 'Orange', color_hex: '#FF8C00', print_run: 49, serial_numbered: true, is_one_of_one: false, rarity_rank: 43, box_exclusivity: [ALL], description: 'Orange shimmer numbered to 49' },
  { name: 'White Wave', color_hex: '#FFFFFF', print_run: 38, serial_numbered: true, is_one_of_one: false, rarity_rank: 44, box_exclusivity: [ALL], description: 'White wave pattern /38' },
  { name: 'Blue Shimmer FOTL', color_hex: '#4169E1', print_run: 35, serial_numbered: true, is_one_of_one: false, rarity_rank: 45, box_exclusivity: [FOTL], description: 'Blue shimmer /35 — First Off The Line exclusive' },
  { name: 'Red Lazer', color_hex: '#CC0000', print_run: 35, serial_numbered: true, is_one_of_one: false, rarity_rank: 46, box_exclusivity: [ALL], description: 'Red with laser line accent /35' },
  { name: 'Mojo', color_hex: '#FFD700', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 47, box_exclusivity: [ALL], description: 'Swirl mojo pattern /25' },
  { name: 'Gold Sparkle', color_hex: '#FFD700', print_run: 24, serial_numbered: true, is_one_of_one: false, rarity_rank: 48, box_exclusivity: [ALL], description: 'Gold sparkle refractor /24' },
  { name: 'Choice Cherry Blossom', color_hex: '#FFB7C5', print_run: 20, serial_numbered: true, is_one_of_one: false, rarity_rank: 49, box_exclusivity: [CHOICE], description: 'Cherry blossom pattern /20 — Choice exclusive' },
  { name: 'Fast Break Bronze', color_hex: '#CD7F32', print_run: 20, serial_numbered: true, is_one_of_one: false, rarity_rank: 50, box_exclusivity: [FAST_BREAK], description: 'Bronze Fast Break /20 — Fast Break exclusive' },
  { name: 'Gold', color_hex: '#FFD700', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 51, box_exclusivity: [ALL], description: 'Gold shimmer numbered to 10' },
  { name: 'Gold Shimmer FOTL', color_hex: '#FFD700', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 52, box_exclusivity: [FOTL], description: 'Gold shimmer /10 — First Off The Line exclusive' },
  { name: 'Ice Gold', color_hex: '#FFD700', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 53, box_exclusivity: [ALL], description: 'Gold frosted ice finish /10' },
  { name: 'Lazer Gold', color_hex: '#FFD700', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 54, box_exclusivity: [ALL], description: 'Gold with laser line accent /10' },
  { name: 'Wave Gold', color_hex: '#FFD700', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 55, box_exclusivity: [ALL], description: 'Gold wave pattern /10' },
  { name: 'Choice Green', color_hex: '#228B22', print_run: 8, serial_numbered: true, is_one_of_one: false, rarity_rank: 56, box_exclusivity: [CHOICE], description: 'Green Choice /8 — Choice exclusive' },
  { name: 'Green Sparkle', color_hex: '#228B22', print_run: 8, serial_numbered: true, is_one_of_one: false, rarity_rank: 57, box_exclusivity: [ALL], description: 'Green sparkle refractor /8' },
  { name: 'Black Gold', color_hex: '#1A1A1A', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 58, box_exclusivity: [ALL], description: 'Black with gold accents /5' },
  { name: 'Fast Break Neon Green', color_hex: '#39FF14', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 59, box_exclusivity: [FAST_BREAK], description: 'Neon green Fast Break /5 — Fast Break exclusive' },
  { name: 'Green Shimmer FOTL', color_hex: '#228B22', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 60, box_exclusivity: [FOTL], description: 'Green shimmer /5 — First Off The Line exclusive' },

  // ── 1-of-1 Parallels ─────────────────────────────────────────
  { name: 'Black', color_hex: '#000000', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 61, box_exclusivity: [ALL], description: 'Black shimmer — 1 of 1. The rarest standard parallel.' },
  { name: 'Black Shimmer FOTL', color_hex: '#000000', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 62, box_exclusivity: [FOTL], description: 'Black shimmer 1/1 — First Off The Line exclusive' },
  { name: 'Choice Nebula', color_hex: '#4B0082', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 63, box_exclusivity: [CHOICE], description: 'Nebula swirl pattern 1/1 — Choice exclusive' },
];

async function main() {
  console.log(`Seeding 2024 Prizm NFL Parallels: ${parallels.length} parallels\n`);

  if (DRY_RUN) {
    console.log('DRY RUN — no changes made.\n');
    console.log(`Unnumbered: ${parallels.filter(p => !p.serial_numbered).length}`);
    console.log(`Numbered: ${parallels.filter(p => p.serial_numbered && !p.is_one_of_one).length}`);
    console.log(`1-of-1: ${parallels.filter(p => p.is_one_of_one).length}`);
    console.log(`Total: ${parallels.length}`);
    return;
  }

  const { error: delErr } = await supabase
    .from('parallels')
    .delete()
    .eq('product_id', PRODUCT_ID);

  if (delErr) {
    console.error('Error deleting old parallels:', delErr.message);
    return;
  }
  console.log('Deleted old parallels for Prizm NFL 2024');

  const rows = parallels.map(p => ({
    product_id: PRODUCT_ID,
    name: p.name,
    color_hex: p.color_hex,
    print_run: p.print_run,
    serial_numbered: p.serial_numbered,
    is_one_of_one: p.is_one_of_one,
    rarity_rank: p.rarity_rank,
    description: p.description,
    box_exclusivity: p.box_exclusivity,
    special_attributes: null,
  }));

  const BATCH_SIZE = 50;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('parallels').insert(batch);
    if (error) {
      console.error(`Batch error at ${i}:`, error.message);
    } else {
      inserted += batch.length;
    }
  }

  console.log(`\nInserted ${inserted}/${parallels.length} parallels`);

  const { count } = await supabase
    .from('parallels')
    .select('*', { count: 'exact', head: true })
    .eq('product_id', PRODUCT_ID);
  console.log(`Verified: ${count} parallels in DB for Prizm NFL 2024`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
