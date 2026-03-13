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
const NO_HUDDLE = 'No Huddle';
const CHOICE = 'Choice';
const FOTL = 'FOTL';
const BLASTER = 'Retail Blaster';
const MEGA = 'Retail Mega';
const HANGER = 'Hanger';
const FAT_PACK = 'Fat Pack/Cello';
const HOBBY_BLASTER = 'Hobby Blaster';
const HOBBY_MEGA = 'Hobby Mega';
const ALL = 'All';

// Complete parallel data for 2024 Prizm Football
// Corrected via Beckett, Checklist Insider, Cardlines, Checklistcenter
// Note: "Fast Break" is basketball-only; NFL equivalent is "No Huddle"
const parallels = [
  // ── Unnumbered Parallels (24) ──────────────────────────────────
  { name: 'Base', color_hex: '#FFFFFF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1, box_exclusivity: [ALL], description: 'Standard base card, 400-card set with 100 rookies' },
  { name: 'Silver', color_hex: '#C0C0C0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 2, box_exclusivity: [ALL], description: 'The iconic Prizm parallel with silver refractor finish' },
  { name: 'Red, White and Blue', color_hex: '#B22234', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 3, box_exclusivity: [FAT_PACK], description: 'Fat pack/cello exclusive patriotic tri-color parallel' },
  { name: 'Black and White Checker', color_hex: '#1A1A1A', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 4, box_exclusivity: [BLASTER, MEGA], description: 'Retail exclusive black and white checkered pattern' },
  { name: 'Green Ice', color_hex: '#3EB489', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 5, box_exclusivity: [BLASTER, MEGA], description: 'Retail exclusive icy green refractor finish' },
  { name: 'Green', color_hex: '#00A651', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 6, box_exclusivity: [FAT_PACK], description: 'Green prizm parallel found in fat pack/cello packs' },
  { name: 'Green Wave', color_hex: '#00A651', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 7, box_exclusivity: [HANGER], description: 'Hanger box exclusive with green wave pattern' },
  { name: 'Pink Wave', color_hex: '#FF69B4', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 8, box_exclusivity: [HANGER], description: 'Hanger box exclusive with pink wave pattern' },
  { name: 'Disco', color_hex: '#E8E8E8', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 9, box_exclusivity: [BLASTER], description: 'Retail blaster exclusive with disco-ball refractor pattern' },
  { name: 'Lazer', color_hex: '#DAA520', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 10, box_exclusivity: [BLASTER], description: 'Retail blaster exclusive with laser-etched pattern' },
  { name: 'Neon Green Pulsar', color_hex: '#39FF14', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 11, box_exclusivity: [MEGA], description: 'Retail mega box exclusive with neon green pulsar effect' },
  { name: 'Orange Ice', color_hex: '#FF8C00', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 12, box_exclusivity: [HOBBY_BLASTER], description: 'Hobby blaster exclusive with orange icy refractor finish' },
  { name: 'Purple Pulsar', color_hex: '#800080', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 13, box_exclusivity: [HOBBY_MEGA], description: 'Hobby mega box exclusive with purple pulsar effect' },
  { name: 'Pink', color_hex: '#FF69B4', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 14, box_exclusivity: [HOBBY], description: 'Unnumbered pink prizm found in hobby boxes' },
  { name: 'Red', color_hex: '#FF0000', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 15, box_exclusivity: [HOBBY], description: 'Unnumbered red prizm found in hobby boxes' },
  { name: 'Blue', color_hex: '#0000FF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 16, box_exclusivity: [HOBBY], description: 'Unnumbered blue prizm found in hobby boxes' },
  { name: 'Black and Red Checker', color_hex: '#8B0000', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 17, box_exclusivity: [HOBBY], description: 'Black and red checkered pattern hobby parallel' },
  { name: 'Red Sparkle', color_hex: '#DC143C', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 18, box_exclusivity: [HOBBY], description: 'Sparkle-finish red prizm with glitter effect' },
  { name: 'White Sparkle', color_hex: '#F5F5F5', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 19, box_exclusivity: [HOBBY], description: 'Sparkle-finish white prizm, also available in Sparkle Packs' },
  { name: 'Press Proof', color_hex: '#4169E1', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 20, box_exclusivity: [HOBBY], description: 'Press proof parallel with matte finish' },
  { name: 'Snakeskin', color_hex: '#556B2F', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 21, box_exclusivity: [HOBBY], description: 'Textured snakeskin pattern overlay on prizm finish' },
  { name: 'No Huddle', color_hex: '#2F4F4F', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 22, box_exclusivity: [NO_HUDDLE], description: 'No Huddle box exclusive base parallel with circle background' },
  { name: 'Choice Blue, Yellow and Green', color_hex: '#1E90FF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 23, box_exclusivity: [CHOICE], description: 'Choice box exclusive tri-color parallel' },
  { name: 'Choice Tiger Stripe', color_hex: '#FF8C00', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 24, box_exclusivity: [CHOICE], description: 'Choice box exclusive with tiger stripe pattern' },

  // ── Numbered Parallels (37) ────────────────────────────────────
  { name: 'Pandora', color_hex: '#E6E6FA', print_run: 400, serial_numbered: true, is_one_of_one: false, rarity_rank: 25, box_exclusivity: [HOBBY], description: 'Iridescent multi-color shimmer /400' },
  { name: 'Orange', color_hex: '#FF6600', print_run: 249, serial_numbered: true, is_one_of_one: false, rarity_rank: 26, box_exclusivity: [HOBBY], description: 'Orange prizm numbered /249' },
  { name: 'Blue Wave', color_hex: '#4169E1', print_run: 230, serial_numbered: true, is_one_of_one: false, rarity_rank: 27, box_exclusivity: [HOBBY], description: 'Blue wave pattern numbered /230' },
  { name: 'Purple Ice', color_hex: '#9370DB', print_run: 225, serial_numbered: true, is_one_of_one: false, rarity_rank: 28, box_exclusivity: [HOBBY], description: 'Icy purple refractor numbered /225' },
  { name: 'Hyper', color_hex: '#FF1493', print_run: 180, serial_numbered: true, is_one_of_one: false, rarity_rank: 29, box_exclusivity: [HOBBY], description: 'Hyper-vibrant multi-color prizm numbered /180' },
  { name: 'Red Wave', color_hex: '#DC143C', print_run: 149, serial_numbered: true, is_one_of_one: false, rarity_rank: 30, box_exclusivity: [HOBBY], description: 'Red wave pattern numbered /149' },
  { name: 'Purple', color_hex: '#800080', print_run: 125, serial_numbered: true, is_one_of_one: false, rarity_rank: 31, box_exclusivity: [HOBBY], description: 'Purple prizm numbered /125' },
  { name: 'No Huddle Blue', color_hex: '#0000CD', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 32, box_exclusivity: [NO_HUDDLE], description: 'No Huddle exclusive blue numbered /99' },
  { name: 'Blue Ice', color_hex: '#00BFFF', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 33, box_exclusivity: [HOBBY], description: 'Icy blue refractor numbered /99' },
  { name: 'Purple Wave', color_hex: '#7B2D8E', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 34, box_exclusivity: [HOBBY], description: 'Purple wave pattern numbered /99' },
  { name: 'Blue Sparkle', color_hex: '#4682B4', print_run: 96, serial_numbered: true, is_one_of_one: false, rarity_rank: 35, box_exclusivity: [HOBBY], description: 'Sparkle-finish blue prizm numbered /96' },
  { name: 'Green Scope', color_hex: '#228B22', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 36, box_exclusivity: [HOBBY], description: 'Green scope pattern numbered /75' },
  { name: 'No Huddle Red', color_hex: '#FF0000', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 37, box_exclusivity: [NO_HUDDLE], description: 'No Huddle exclusive red numbered /75' },
  { name: 'Orange Wave', color_hex: '#FF8C00', print_run: 60, serial_numbered: true, is_one_of_one: false, rarity_rank: 38, box_exclusivity: [HOBBY], description: 'Orange wave pattern numbered /60' },
  { name: 'No Huddle Purple', color_hex: '#800080', print_run: 49, serial_numbered: true, is_one_of_one: false, rarity_rank: 39, box_exclusivity: [NO_HUDDLE], description: 'No Huddle exclusive purple numbered /49' },
  { name: 'Purple Power', color_hex: '#6A0DAD', print_run: 49, serial_numbered: true, is_one_of_one: false, rarity_rank: 40, box_exclusivity: [HOBBY], description: 'Deep purple power prizm numbered /49' },
  { name: 'Red and Yellow', color_hex: '#FF4500', print_run: 44, serial_numbered: true, is_one_of_one: false, rarity_rank: 41, box_exclusivity: [HOBBY], description: 'Red and yellow dual-tone prizm numbered /44' },
  { name: 'Red Shimmer', color_hex: '#CC0000', print_run: 35, serial_numbered: true, is_one_of_one: false, rarity_rank: 42, box_exclusivity: [HOBBY, FOTL], description: 'Shimmer-finish red prizm numbered /35' },
  { name: 'White', color_hex: '#FAFAFA', print_run: 35, serial_numbered: true, is_one_of_one: false, rarity_rank: 43, box_exclusivity: [HOBBY], description: 'Clean white prizm numbered /35' },
  { name: 'Blue Shimmer', color_hex: '#0047AB', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 44, box_exclusivity: [HOBBY, FOTL], description: 'Shimmer-finish blue prizm numbered /25' },
  { name: 'Navy Camo', color_hex: '#1B2A49', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 45, box_exclusivity: [HOBBY], description: 'Navy camouflage pattern numbered /25' },
  { name: 'No Huddle Pink', color_hex: '#FF69B4', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 46, box_exclusivity: [NO_HUDDLE], description: 'No Huddle exclusive pink numbered /25' },
  { name: 'Gold Sparkle', color_hex: '#FFD700', print_run: 24, serial_numbered: true, is_one_of_one: false, rarity_rank: 47, box_exclusivity: [HOBBY], description: 'Sparkle-finish gold prizm numbered /24' },
  { name: 'Choice Red', color_hex: '#CC0000', print_run: 20, serial_numbered: true, is_one_of_one: false, rarity_rank: 48, box_exclusivity: [CHOICE], description: 'Choice box exclusive red numbered /20' },
  { name: 'Choice Cherry Blossom', color_hex: '#FFB7C5', print_run: 15, serial_numbered: true, is_one_of_one: false, rarity_rank: 49, box_exclusivity: [CHOICE], description: 'Choice box exclusive cherry blossom pink numbered /15' },
  { name: 'Forest Camo', color_hex: '#2E5D34', print_run: 15, serial_numbered: true, is_one_of_one: false, rarity_rank: 50, box_exclusivity: [HOBBY], description: 'Forest green camouflage pattern numbered /15' },
  { name: 'Choice Blue', color_hex: '#0000FF', print_run: 14, serial_numbered: true, is_one_of_one: false, rarity_rank: 51, box_exclusivity: [CHOICE], description: 'Choice box exclusive blue numbered /14' },
  { name: 'Gold Wave', color_hex: '#FFD700', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 52, box_exclusivity: [HOBBY], description: 'Gold wave pattern numbered /10' },
  { name: 'Gold Shimmer', color_hex: '#DAA520', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 53, box_exclusivity: [HOBBY], description: 'Shimmer-finish gold prizm numbered /10' },
  { name: 'Choice Gold', color_hex: '#FFD700', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 54, box_exclusivity: [CHOICE], description: 'Choice box exclusive gold numbered /10' },
  { name: 'Choice Gold Shimmer', color_hex: '#DAA520', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 55, box_exclusivity: [CHOICE], description: 'Choice box exclusive gold shimmer numbered /10' },
  { name: 'No Huddle Neon Green', color_hex: '#39FF14', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 56, box_exclusivity: [NO_HUDDLE], description: 'No Huddle exclusive neon green numbered /10' },
  { name: 'Gold', color_hex: '#FFD700', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 57, box_exclusivity: [HOBBY], description: 'Gold prizm numbered /10' },
  { name: 'Green Sparkle', color_hex: '#00CC44', print_run: 8, serial_numbered: true, is_one_of_one: false, rarity_rank: 58, box_exclusivity: [HOBBY], description: 'Sparkle-finish green prizm numbered /8' },
  { name: 'Gold Vinyl', color_hex: '#CFB53B', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 59, box_exclusivity: [HOBBY], description: 'Gold vinyl textured finish numbered /5' },
  { name: 'Green Shimmer', color_hex: '#00A86B', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 60, box_exclusivity: [HOBBY, FOTL], description: 'Shimmer-finish green prizm numbered /5' },
  { name: 'White Knight', color_hex: '#F8F8FF', print_run: 3, serial_numbered: true, is_one_of_one: false, rarity_rank: 61, box_exclusivity: [HOBBY], description: 'Ultra-rare white knight prizm numbered /3' },

  // ── 1-of-1 Parallels (4) ──────────────────────────────────────
  { name: 'Black Finite', color_hex: '#000000', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 62, box_exclusivity: [HOBBY], description: 'True black 1/1 prizm, the ultimate chase card' },
  { name: 'Black Shimmer', color_hex: '#0A0A0A', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 63, box_exclusivity: [HOBBY, FOTL], description: 'Black shimmer finish 1/1' },
  { name: 'Stars', color_hex: '#FFD700', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 64, box_exclusivity: [HOBBY], description: 'Star pattern 1/1 parallel' },
  { name: 'Choice Nebula', color_hex: '#4B0082', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 65, box_exclusivity: [CHOICE], description: 'Choice box exclusive nebula pattern 1/1' },
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
