#!/usr/bin/env node

/**
 * Seed 2024-25 Panini Select Basketball parallel data.
 * Sources: Beckett, Checklist Insider, Cardboard Connection, Cardsmith Breaks.
 * Released June 18, 2025. Multi-tier (Concourse/Premier/Courtside/Mezzanine).
 *
 * Usage:
 *   node scripts/seed-select-2024-25-nba.mjs
 *   node scripts/seed-select-2024-25-nba.mjs --dry-run
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

const PRODUCT_ID = 'c0000000-0000-0000-0000-00000000000a'; // 2024-25 Select NBA

const HOBBY = 'Hobby';
const H2 = 'H2';
const BLASTER = 'Blaster';
const MEGA = 'Mega';
const FOTL = 'FOTL';
const RETAIL = 'Retail';
const ALL = 'All';

const parallels = [
  // Unnumbered
  { name: 'Blue', color_hex: '#3B82F6', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1, box_exclusivity: [ALL], description: 'Standard blue-bordered base parallel' },
  { name: 'Silver Prizm', color_hex: '#C0C0C0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 2, box_exclusivity: [ALL], description: 'Classic silver refractor' },
  { name: 'Red Wave Prizm', color_hex: '#DC2626', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 3, box_exclusivity: [ALL], description: 'Red with wave pattern' },
  { name: 'White Sparkle Prizm', color_hex: '#F8F8FF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 4, box_exclusivity: [ALL], description: 'White glitter sparkle' },
  { name: 'Scope Prizm', color_hex: '#7C3AED', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 5, box_exclusivity: [HOBBY, FOTL], description: 'Purple kaleidoscopic scope pattern' },
  { name: 'Cosmic Prizm', color_hex: '#1E1B4B', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 6, box_exclusivity: [HOBBY, FOTL], description: 'Deep space galaxy pattern' },
  { name: 'Tri-Color Prizm', color_hex: '#8B5CF6', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 7, box_exclusivity: [HOBBY, FOTL], description: 'Three-tone color refractor' },
  { name: 'Gold Glitter Prizm', color_hex: '#D97706', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 8, box_exclusivity: [HOBBY, FOTL], description: 'Gold shimmer glitter' },
  { name: 'Zebra Prizm', color_hex: '#111827', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 9, box_exclusivity: [HOBBY, FOTL], description: 'Black/white zebra stripe' },
  { name: 'Disco Prizm', color_hex: '#EC4899', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 10, box_exclusivity: [H2], description: 'Disco-ball refractor, H2 exclusive' },
  { name: 'Green Mojo Prizm', color_hex: '#059669', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 11, box_exclusivity: [BLASTER], description: 'Green swirling mojo, Blaster exclusive' },
  { name: 'Green Stars Prizm', color_hex: '#065F46', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 12, box_exclusivity: [BLASTER], description: 'Green with star pattern, Blaster exclusive' },
  { name: 'Green White Purple Prizm', color_hex: '#6D28D9', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 13, box_exclusivity: [BLASTER], description: 'Tri-color Blaster exclusive' },
  { name: 'Orange Flash Prizm', color_hex: '#F97316', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 14, box_exclusivity: [BLASTER], description: 'Orange flash, Blaster exclusive' },
  { name: 'Tectonic Prizm', color_hex: '#78716C', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 15, box_exclusivity: [BLASTER], description: 'Fractured tectonic pattern, Blaster exclusive' },
  { name: 'Green Tectonic Prizm', color_hex: '#16A34A', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 16, box_exclusivity: [BLASTER], description: 'Green tectonic, Blaster exclusive' },
  { name: 'Orange Tectonic Prizm', color_hex: '#EA580C', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 17, box_exclusivity: [BLASTER], description: 'Orange tectonic, Blaster exclusive' },
  { name: 'Blue Cracked Ice Prizm', color_hex: '#60A5FA', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 18, box_exclusivity: [MEGA], description: 'Blue cracked ice, Mega exclusive' },
  { name: 'Red Cracked Ice Prizm', color_hex: '#EF4444', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 19, box_exclusivity: [MEGA], description: 'Red cracked ice, Mega exclusive' },
  { name: 'Elephant Prizm', color_hex: '#9CA3AF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 20, box_exclusivity: [RETAIL], description: 'Gray elephant-skin texture, Retail exclusive' },
  { name: 'Tiger Prizm', color_hex: '#B45309', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 21, box_exclusivity: [RETAIL], description: 'Tiger stripe, Retail exclusive' },

  // Numbered
  { name: 'Light Blue Prizm', color_hex: '#BAE6FD', print_run: 299, serial_numbered: true, is_one_of_one: false, rarity_rank: 22, box_exclusivity: [HOBBY, FOTL], description: 'Light blue /299' },
  { name: 'Red Flash Prizm', color_hex: '#B91C1C', print_run: 299, serial_numbered: true, is_one_of_one: false, rarity_rank: 23, box_exclusivity: [BLASTER], description: 'Red flash, Blaster exclusive /299' },
  { name: 'Orange Cracked Ice Prizm', color_hex: '#FB923C', print_run: 275, serial_numbered: true, is_one_of_one: false, rarity_rank: 24, box_exclusivity: [MEGA], description: 'Orange cracked ice, Mega exclusive /275' },
  { name: 'Blue Scope Prizm', color_hex: '#2563EB', print_run: 249, serial_numbered: true, is_one_of_one: false, rarity_rank: 25, box_exclusivity: [HOBBY, FOTL], description: 'Blue scope /249' },
  { name: 'Red Scope Prizm', color_hex: '#DC2626', print_run: 249, serial_numbered: true, is_one_of_one: false, rarity_rank: 26, box_exclusivity: [HOBBY, FOTL], description: 'Red scope /249' },
  { name: 'Purple Flash Prizm', color_hex: '#7C3AED', print_run: 249, serial_numbered: true, is_one_of_one: false, rarity_rank: 27, box_exclusivity: [BLASTER], description: 'Purple flash, Blaster exclusive /249' },
  { name: 'Red Prizm', color_hex: '#EF4444', print_run: 199, serial_numbered: true, is_one_of_one: false, rarity_rank: 28, box_exclusivity: [HOBBY, FOTL], description: 'Solid red /199' },
  { name: 'Maroon Prizm', color_hex: '#7F1D1D', print_run: 175, serial_numbered: true, is_one_of_one: false, rarity_rank: 29, box_exclusivity: [HOBBY, FOTL], description: 'Deep maroon /175' },
  { name: 'White Prizm', color_hex: '#F9FAFB', print_run: 149, serial_numbered: true, is_one_of_one: false, rarity_rank: 30, box_exclusivity: [HOBBY, FOTL], description: 'White /149' },
  { name: 'Green Camo Prizm', color_hex: '#4D7C0F', print_run: 125, serial_numbered: true, is_one_of_one: false, rarity_rank: 31, box_exclusivity: [HOBBY, FOTL], description: 'Green camouflage /125' },
  { name: 'Blue Camo Prizm', color_hex: '#1E40AF', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 32, box_exclusivity: [HOBBY, FOTL], description: 'Blue camouflage /99' },
  { name: 'Purple Prizm', color_hex: '#6D28D9', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 33, box_exclusivity: [HOBBY, FOTL], description: 'Purple /99' },
  { name: 'White Wave Prizm', color_hex: '#E5E7EB', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 34, box_exclusivity: [HOBBY, FOTL], description: 'White wave /99' },
  { name: 'Light Blue Disco Prizm', color_hex: '#7DD3FC', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 35, box_exclusivity: [H2], description: 'Light blue disco, H2 exclusive /99' },
  { name: 'Pink Cracked Ice Prizm', color_hex: '#F472B6', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 36, box_exclusivity: [MEGA], description: 'Pink cracked ice, Mega exclusive /99' },
  { name: 'Purple Cracked Ice Prizm', color_hex: '#8B5CF6', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 37, box_exclusivity: [MEGA], description: 'Purple cracked ice, Mega exclusive /99' },
  { name: 'Blue Flash Prizm', color_hex: '#3B82F6', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 38, box_exclusivity: [BLASTER], description: 'Blue flash, Blaster exclusive /99' },
  { name: 'Blue Tectonic Prizm', color_hex: '#1D4ED8', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 39, box_exclusivity: [BLASTER], description: 'Blue tectonic, Blaster exclusive /99' },
  { name: 'Neon Green Prizm', color_hex: '#4ADE80', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 40, box_exclusivity: [HOBBY, FOTL], description: 'Neon green /75' },
  { name: 'Blue Wave Prizm', color_hex: '#2563EB', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 41, box_exclusivity: [HOBBY, FOTL], description: 'Blue wave /75' },
  { name: 'White Disco Prizm', color_hex: '#F3F4F6', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 42, box_exclusivity: [H2], description: 'White disco, H2 exclusive /75' },
  { name: 'Orange Prizm', color_hex: '#F97316', print_run: 65, serial_numbered: true, is_one_of_one: false, rarity_rank: 43, box_exclusivity: [HOBBY, FOTL], description: 'Orange /65' },
  { name: 'Red Tectonic Prizm', color_hex: '#B91C1C', print_run: 65, serial_numbered: true, is_one_of_one: false, rarity_rank: 44, box_exclusivity: [BLASTER], description: 'Red tectonic, Blaster exclusive /65' },
  { name: 'Green Wave Prizm', color_hex: '#16A34A', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 45, box_exclusivity: [HOBBY, FOTL], description: 'Green wave /50' },
  { name: 'Bronze Checker Prizm', color_hex: '#92400E', print_run: 49, serial_numbered: true, is_one_of_one: false, rarity_rank: 46, box_exclusivity: [HOBBY, FOTL], description: 'Bronze checkerboard /49' },
  { name: 'Red Disco Prizm', color_hex: '#DC2626', print_run: 49, serial_numbered: true, is_one_of_one: false, rarity_rank: 47, box_exclusivity: [H2], description: 'Red disco, H2 exclusive /49' },
  { name: 'Teal White Pink Prizm', color_hex: '#14B8A6', print_run: 49, serial_numbered: true, is_one_of_one: false, rarity_rank: 48, box_exclusivity: [HOBBY, FOTL], description: 'Tri-color teal/white/pink /49' },
  { name: 'White Scope Prizm', color_hex: '#F9FAFB', print_run: 35, serial_numbered: true, is_one_of_one: false, rarity_rank: 49, box_exclusivity: [HOBBY, FOTL], description: 'White scope /35' },
  { name: 'Blue Disco Prizm', color_hex: '#1E40AF', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 50, box_exclusivity: [H2], description: 'Blue disco, H2 exclusive /25' },
  { name: 'Tie-Dye Prizm', color_hex: '#8B5CF6', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 51, box_exclusivity: [HOBBY, FOTL], description: 'Tie-dye multicolor /25' },
  { name: 'Blue Stars Prizm', color_hex: '#3B82F6', print_run: 20, serial_numbered: true, is_one_of_one: false, rarity_rank: 52, box_exclusivity: [HOBBY, FOTL], description: 'Blue stars /20' },
  { name: 'Multi Wave Prizm', color_hex: '#A78BFA', print_run: 20, serial_numbered: true, is_one_of_one: false, rarity_rank: 53, box_exclusivity: [HOBBY, FOTL], description: 'Multicolor wave /20' },
  { name: 'Red Mojo Prizm', color_hex: '#EF4444', print_run: 20, serial_numbered: true, is_one_of_one: false, rarity_rank: 54, box_exclusivity: [BLASTER], description: 'Red mojo, Blaster exclusive /20' },
  { name: 'Neon Orange Pulsar Prizm', color_hex: '#FB923C', print_run: 18, serial_numbered: true, is_one_of_one: false, rarity_rank: 55, box_exclusivity: [FOTL], description: 'Neon orange pulsar, FOTL exclusive /18' },
  { name: 'Gold Wave Prizm', color_hex: '#B45309', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 56, box_exclusivity: [HOBBY, FOTL], description: 'Gold wave /10' },
  { name: 'Gold Prizm', color_hex: '#D97706', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 57, box_exclusivity: [HOBBY, FOTL], description: 'Gold /10' },
  { name: 'Gold Disco Prizm', color_hex: '#CA8A04', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 58, box_exclusivity: [H2], description: 'Gold disco, H2 exclusive /10' },
  { name: 'Gold Cracked Ice Prizm', color_hex: '#D97706', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 59, box_exclusivity: [MEGA], description: 'Gold cracked ice, Mega exclusive /10' },
  { name: 'Gold Flash Prizm', color_hex: '#F59E0B', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 60, box_exclusivity: [BLASTER], description: 'Gold flash, Blaster exclusive /10' },
  { name: 'Gold Tectonic Prizm', color_hex: '#B45309', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 61, box_exclusivity: [BLASTER], description: 'Gold tectonic, Blaster exclusive /10' },
  { name: 'Dragon Scale Prizm', color_hex: '#1E3A5F', print_run: 8, serial_numbered: true, is_one_of_one: false, rarity_rank: 62, box_exclusivity: [HOBBY, FOTL], description: 'Dragon scale texture /8' },
  { name: 'Lucky Envelopes Prizm', color_hex: '#DC2626', print_run: 8, serial_numbered: true, is_one_of_one: false, rarity_rank: 63, box_exclusivity: [HOBBY, FOTL], description: 'Chinese New Year themed /8' },
  { name: 'Neon Purple Pulsar Prizm', color_hex: '#C026D3', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 64, box_exclusivity: [FOTL], description: 'Neon purple pulsar, FOTL exclusive /5' },
  { name: 'Green Disco Prizm', color_hex: '#16A34A', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 65, box_exclusivity: [H2], description: 'Green disco, H2 exclusive /5' },
  { name: 'Green Prizm', color_hex: '#15803D', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 66, box_exclusivity: [HOBBY, FOTL], description: 'Green /5' },
  // 1/1s
  { name: 'Black Finite Prizm', color_hex: '#111827', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 67, box_exclusivity: [HOBBY, FOTL], description: 'All-black 1/1 crown jewel' },
  { name: 'Black Disco Prizm', color_hex: '#1F2937', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 68, box_exclusivity: [H2], description: 'Black disco 1/1, H2 exclusive' },
  { name: 'Black Snake Skin Pulsar Prizm', color_hex: '#374151', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 69, box_exclusivity: [FOTL], description: 'Black snake skin 1/1, FOTL exclusive' },
  { name: 'Black White Gold Prizm', color_hex: '#000000', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 70, box_exclusivity: [HOBBY, FOTL], description: 'Black/white/gold tri-tone 1/1' },
];

async function main() {
  const total = parallels.length;
  console.log(`Seeding ${total} parallels for 2024-25 Select NBA\n`);

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
