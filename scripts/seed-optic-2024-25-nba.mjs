#!/usr/bin/env node

/**
 * Seed complete 2024-25 Donruss Optic Basketball parallel data.
 * Sources: Cardboard Connection, Beckett, Checklist Insider, Cardlines,
 *          Cardsmithsbreaks, GoGTS, Fanatics Live.
 *
 * Usage:
 *   node scripts/seed-optic-2024-25-nba.mjs
 *   node scripts/seed-optic-2024-25-nba.mjs --dry-run
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

const PRODUCT_ID = 'c0000000-0000-0000-0000-000000000003'; // 2024-25 Optic NBA

const HOBBY = 'Hobby';
const FAST_BREAK = 'Fast Break';
const CHOICE = 'Choice';
const FOTL = 'FOTL';
const HOBBY_BLASTER = 'Hobby Blaster';
const HOBBY_MEGA = 'Hobby Mega';
const BLASTER = 'Retail Blaster';
const MEGA = 'Retail Mega';
const HANGER = 'Hanger';
const FAT_PACK = 'Fat Pack/Cello';
const INTERNATIONAL = 'International';
const ALL = 'All';

// Shorthand for standard retail formats
const RETAIL = [BLASTER, MEGA, HANGER, FAT_PACK];

// Complete parallel data for 2024-25 Donruss Optic Basketball
// Corrected via Beckett, Checklist Insider, Cardlines, Cardsmithsbreaks, GoGTS
// Previous version had 39 parallels with many Prizm terms mixed in; this is fully corrected
const parallels = [
  // ── Base ────────────────────────────────────────────────────────
  { name: 'Base', color_hex: '#FFFFFF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1, box_exclusivity: [ALL], description: 'Standard base Optic card' },

  // ── Hobby Unnumbered (3) ────────────────────────────────────────
  { name: 'Holo', color_hex: '#C0C0C0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 2, box_exclusivity: [HOBBY], description: 'Iconic Optic holographic rainbow shimmer; Hobby exclusive' },
  { name: 'Jazz', color_hex: '#DAA520', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 3, box_exclusivity: [HOBBY], description: 'Jazz pattern overlay; Hobby exclusive' },
  { name: 'Photon', color_hex: '#E0E7FF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 4, box_exclusivity: [HOBBY], description: 'Light-burst photon effect; Hobby exclusive SSP' },

  // ── Hobby Numbered (14) ─────────────────────────────────────────
  { name: 'Aqua', color_hex: '#00CED1', print_run: 225, serial_numbered: true, is_one_of_one: false, rarity_rank: 5, box_exclusivity: [HOBBY], description: 'Aqua shimmer /225; Hobby exclusive' },
  { name: 'Orange', color_hex: '#FF8C00', print_run: 175, serial_numbered: true, is_one_of_one: false, rarity_rank: 6, box_exclusivity: [HOBBY], description: 'Orange shimmer /175; Hobby exclusive' },
  { name: 'Lime Green', color_hex: '#32CD32', print_run: 149, serial_numbered: true, is_one_of_one: false, rarity_rank: 7, box_exclusivity: [HOBBY], description: 'Lime green shimmer /149; Hobby exclusive' },
  { name: 'Red', color_hex: '#CC0000', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 8, box_exclusivity: [HOBBY], description: 'Red shimmer /99; Hobby exclusive' },
  { name: 'Pink Velocity', color_hex: '#FF69B4', print_run: 79, serial_numbered: true, is_one_of_one: false, rarity_rank: 9, box_exclusivity: [HOBBY], description: 'Pink velocity finish /79; Hobby exclusive' },
  { name: 'Blue Shimmer', color_hex: '#4169E1', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 10, box_exclusivity: [HOBBY], description: 'Blue shimmer finish /75; Hobby exclusive' },
  { name: 'Blue', color_hex: '#0055A4', print_run: 49, serial_numbered: true, is_one_of_one: false, rarity_rank: 11, box_exclusivity: [HOBBY], description: 'Blue shimmer /49; Hobby exclusive' },
  { name: 'Black Velocity', color_hex: '#1A1A2E', print_run: 39, serial_numbered: true, is_one_of_one: false, rarity_rank: 12, box_exclusivity: [HOBBY], description: 'Black velocity finish /39; Hobby exclusive' },
  { name: 'Cracked Ice', color_hex: '#B0E0E6', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 13, box_exclusivity: [HOBBY], description: 'Cracked ice refractor pattern /25; Hobby exclusive' },
  { name: 'Black Pandora', color_hex: '#0D0D0D', print_run: 15, serial_numbered: true, is_one_of_one: false, rarity_rank: 14, box_exclusivity: [HOBBY], description: 'Black Pandora pattern /15; Hobby exclusive' },
  { name: 'Gold', color_hex: '#FFD700', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 15, box_exclusivity: [HOBBY], description: 'Gold shimmer /10; Hobby exclusive' },
  { name: 'Lucky Envelopes', color_hex: '#FF2400', print_run: 8, serial_numbered: true, is_one_of_one: false, rarity_rank: 16, box_exclusivity: [HOBBY], description: 'Lucky envelopes red & gold /8; Hobby exclusive' },
  { name: 'Green', color_hex: '#228B22', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 17, box_exclusivity: [HOBBY], description: 'Green shimmer /5; Hobby exclusive' },

  // ── Hobby 1-of-1 (2) ───────────────────────────────────────────
  { name: 'Gold Vinyl', color_hex: '#FFD700', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 18, box_exclusivity: [HOBBY], description: 'Gold vinyl finish — true 1/1; Hobby exclusive' },
  { name: 'Black', color_hex: '#000000', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 19, box_exclusivity: [HOBBY], description: 'Black shimmer — true 1/1; the rarest Hobby parallel' },

  // ── Fast Break Unnumbered (1) ───────────────────────────────────
  { name: 'Fast Break Holo', color_hex: '#6A5ACD', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 20, box_exclusivity: [FAST_BREAK], description: 'Holographic Fast Break parallel; Fast Break exclusive' },

  // ── Fast Break Numbered (7) ─────────────────────────────────────
  { name: 'Fast Break Purple', color_hex: '#800080', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 21, box_exclusivity: [FAST_BREAK], description: 'Purple Fast Break /99; Fast Break exclusive' },
  { name: 'Fast Break Red', color_hex: '#CC0000', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 22, box_exclusivity: [FAST_BREAK], description: 'Red Fast Break /75; Fast Break exclusive' },
  { name: 'Fast Break Blue', color_hex: '#4169E1', print_run: 49, serial_numbered: true, is_one_of_one: false, rarity_rank: 23, box_exclusivity: [FAST_BREAK], description: 'Blue Fast Break /49; Fast Break exclusive' },
  { name: 'Fast Break Pink', color_hex: '#FF69B4', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 24, box_exclusivity: [FAST_BREAK], description: 'Pink Fast Break /25; Fast Break exclusive' },
  { name: 'Fast Break Gold', color_hex: '#FFD700', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 25, box_exclusivity: [FAST_BREAK], description: 'Gold Fast Break /10; Fast Break exclusive' },
  { name: 'Fast Break Red & Yellow', color_hex: '#FF4500', print_run: 7, serial_numbered: true, is_one_of_one: false, rarity_rank: 26, box_exclusivity: [FAST_BREAK], description: 'Red & Yellow Fast Break /7; Fast Break exclusive' },
  { name: 'Fast Break Neon Green', color_hex: '#39FF14', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 27, box_exclusivity: [FAST_BREAK], description: 'Neon green Fast Break /5; Fast Break exclusive' },

  // ── Fast Break 1-of-1 (1) ──────────────────────────────────────
  { name: 'Fast Break Black', color_hex: '#000000', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 28, box_exclusivity: [FAST_BREAK], description: 'Black Fast Break — true 1/1; Fast Break exclusive' },

  // ── Choice Unnumbered (1) ──────────────────────────────────────
  { name: 'Choice Dragon', color_hex: '#8B0000', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 29, box_exclusivity: [CHOICE], description: 'Dragon scale pattern; Choice exclusive' },

  // ── Choice Numbered (4) ────────────────────────────────────────
  { name: 'Choice Red', color_hex: '#CC0000', print_run: 88, serial_numbered: true, is_one_of_one: false, rarity_rank: 30, box_exclusivity: [CHOICE], description: 'Red Choice /88; Choice exclusive' },
  { name: 'Choice White', color_hex: '#F5F5F5', print_run: 48, serial_numbered: true, is_one_of_one: false, rarity_rank: 31, box_exclusivity: [CHOICE], description: 'White Choice /48; Choice exclusive' },
  { name: 'Choice Blue', color_hex: '#0055A4', print_run: 24, serial_numbered: true, is_one_of_one: false, rarity_rank: 32, box_exclusivity: [CHOICE], description: 'Blue Choice /24; Choice exclusive' },
  { name: 'Choice Black Gold', color_hex: '#1A1A1A', print_run: 8, serial_numbered: true, is_one_of_one: false, rarity_rank: 33, box_exclusivity: [CHOICE], description: 'Black with gold accents Choice /8; Choice exclusive' },

  // ── Choice 1-of-1 (1) ──────────────────────────────────────────
  { name: 'Choice Nebula', color_hex: '#4B0082', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 34, box_exclusivity: [CHOICE], description: 'Nebula swirl pattern — true 1/1; Choice exclusive' },

  // ── FOTL Numbered (2) ──────────────────────────────────────────
  { name: 'Green FOTL', color_hex: '#228B22', print_run: 14, serial_numbered: true, is_one_of_one: false, rarity_rank: 35, box_exclusivity: [FOTL], description: 'Green /14; First Off The Line exclusive' },
  { name: 'Black FOTL', color_hex: '#000000', print_run: 3, serial_numbered: true, is_one_of_one: false, rarity_rank: 36, box_exclusivity: [FOTL], description: 'Black /3; First Off The Line exclusive' },

  // ── Hobby Mega — Hyper Family (4) ──────────────────────────────
  { name: 'Hyper Pink', color_hex: '#FF69B4', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 37, box_exclusivity: [HOBBY_MEGA], description: 'Pink hyper-reflective finish; Hobby Mega exclusive' },
  { name: 'Hyper Orange', color_hex: '#FF8C00', print_run: 299, serial_numbered: true, is_one_of_one: false, rarity_rank: 38, box_exclusivity: [HOBBY_MEGA], description: 'Orange hyper-reflective /299; Hobby Mega exclusive' },
  { name: 'Hyper Green', color_hex: '#22C55E', print_run: 249, serial_numbered: true, is_one_of_one: false, rarity_rank: 39, box_exclusivity: [HOBBY_MEGA], description: 'Green hyper-reflective /249; Hobby Mega exclusive' },
  { name: 'Hyper Blue', color_hex: '#3B82F6', print_run: 175, serial_numbered: true, is_one_of_one: false, rarity_rank: 40, box_exclusivity: [HOBBY_MEGA], description: 'Blue hyper-reflective /175; Hobby Mega exclusive' },

  // ── Hobby Mega — Seismic Family (2) ────────────────────────────
  { name: 'Green Seismic', color_hex: '#16A34A', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 41, box_exclusivity: [HOBBY_MEGA], description: 'Green seismic wave pattern; Hobby Mega exclusive' },
  { name: 'Red Seismic', color_hex: '#DC2626', print_run: 149, serial_numbered: true, is_one_of_one: false, rarity_rank: 42, box_exclusivity: [HOBBY_MEGA], description: 'Red seismic wave pattern /149; Hobby Mega exclusive' },

  // ── Hobby Blaster — Shimmer Family (2) ─────────────────────────
  { name: 'Purple Shimmer', color_hex: '#7C3AED', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 43, box_exclusivity: [HOBBY_BLASTER], description: 'Purple shimmer finish; Hobby Blaster exclusive' },
  { name: 'Red Shimmer', color_hex: '#DC2626', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 44, box_exclusivity: [HOBBY_BLASTER], description: 'Red shimmer finish; Hobby Blaster exclusive' },

  // ── Retail Blaster — Glitter Family (5) ────────────────────────
  { name: 'Pink Glitter', color_hex: '#FF69B4', print_run: 275, serial_numbered: true, is_one_of_one: false, rarity_rank: 45, box_exclusivity: [BLASTER], description: 'Pink glitter finish /275; Retail Blaster exclusive' },
  { name: 'Copper Glitter', color_hex: '#B87333', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 46, box_exclusivity: [BLASTER], description: 'Copper glitter finish /99; Retail Blaster exclusive' },
  { name: 'Red Glitter', color_hex: '#CC0000', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 47, box_exclusivity: [BLASTER], description: 'Red glitter finish /75; Retail Blaster exclusive' },
  { name: 'Blue Glitter', color_hex: '#0055A4', print_run: 15, serial_numbered: true, is_one_of_one: false, rarity_rank: 48, box_exclusivity: [BLASTER], description: 'Blue glitter finish /15; Retail Blaster exclusive' },
  { name: 'Green Glitter', color_hex: '#228B22', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 49, box_exclusivity: [BLASTER], description: 'Green glitter finish /5; Retail Blaster exclusive' },

  // ── Retail Blaster — Other (2) ─────────────────────────────────
  { name: 'Checkerboard', color_hex: '#4B4B4B', print_run: 49, serial_numbered: true, is_one_of_one: false, rarity_rank: 50, box_exclusivity: [BLASTER], description: 'Checkerboard pattern /49; Retail Blaster exclusive' },
  { name: 'Swirlorama', color_hex: '#9333EA', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 51, box_exclusivity: [BLASTER], description: 'Swirl pattern /5; Retail Blaster exclusive' },

  // ── Retail Sparkle Family (5) ──────────────────────────────────
  { name: 'Red Sparkle', color_hex: '#DC2626', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 52, box_exclusivity: [...RETAIL], description: 'Red sparkle finish; retail exclusive' },
  { name: 'White Sparkle', color_hex: '#F5F5F5', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 53, box_exclusivity: [...RETAIL], description: 'White sparkle finish; retail exclusive' },
  { name: 'Blue Sparkle', color_hex: '#2563EB', print_run: 180, serial_numbered: true, is_one_of_one: false, rarity_rank: 54, box_exclusivity: [...RETAIL], description: 'Blue sparkle /180; retail exclusive' },
  { name: 'Gold Sparkle', color_hex: '#EAB308', print_run: 24, serial_numbered: true, is_one_of_one: false, rarity_rank: 55, box_exclusivity: [...RETAIL], description: 'Gold sparkle /24; retail exclusive' },
  { name: 'Green Sparkle', color_hex: '#16A34A', print_run: 8, serial_numbered: true, is_one_of_one: false, rarity_rank: 56, box_exclusivity: [...RETAIL], description: 'Green sparkle /8; retail exclusive' },

  // ── Hanger Exclusive (1) ───────────────────────────────────────
  { name: 'Purple Velocity', color_hex: '#7C3AED', print_run: 12, serial_numbered: true, is_one_of_one: false, rarity_rank: 57, box_exclusivity: [HANGER], description: 'Purple velocity /12; Hanger exclusive' },

  // ── Fat Pack / Retail (2) ──────────────────────────────────────
  { name: 'Red Velocity', color_hex: '#CC0000', print_run: 299, serial_numbered: true, is_one_of_one: false, rarity_rank: 58, box_exclusivity: [FAT_PACK], description: 'Red velocity /299; Fat Pack exclusive' },
  { name: 'Black Retail', color_hex: '#000000', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 59, box_exclusivity: [...RETAIL], description: 'Black — true 1/1; retail exclusive' },

  // ── International Exclusives (7) ───────────────────────────────
  { name: 'Red International', color_hex: '#DC2626', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 60, box_exclusivity: [INTERNATIONAL], description: 'Red finish; International box exclusive' },
  { name: 'Red Stars International', color_hex: '#B91C1C', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 61, box_exclusivity: [INTERNATIONAL], description: 'Red with stars pattern; International box exclusive' },
  { name: 'Red & Gold International', color_hex: '#FF4500', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 62, box_exclusivity: [INTERNATIONAL], description: 'Red & gold /99; International box exclusive' },
  { name: 'Electricity International', color_hex: '#FFD700', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 63, box_exclusivity: [INTERNATIONAL], description: 'Electricity pattern /75; International box exclusive' },
  { name: 'Green International', color_hex: '#228B22', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 64, box_exclusivity: [INTERNATIONAL], description: 'Green /25; International box exclusive' },
  { name: 'White International', color_hex: '#FFFFFF', print_run: 15, serial_numbered: true, is_one_of_one: false, rarity_rank: 65, box_exclusivity: [INTERNATIONAL], description: 'White /15; International box exclusive' },
  { name: 'Gold International', color_hex: '#FFD700', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 66, box_exclusivity: [INTERNATIONAL], description: 'Gold /10; International box exclusive' },

  // ── Premium Box Set (1) ────────────────────────────────────────
  { name: 'Premium Box Set', color_hex: '#1E293B', print_run: 249, serial_numbered: true, is_one_of_one: false, rarity_rank: 67, box_exclusivity: ['Premium Box Set'], description: 'Factory set parallel /249; every card in the 300-card set is numbered' },
];

async function main() {
  console.log(`Seeding 2024-25 Optic NBA Parallels: ${parallels.length} parallels\n`);

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
  console.log('Deleted old parallels for Optic NBA 2024-25');

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
  console.log(`Verified: ${count} parallels in DB for Optic NBA 2024-25`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
