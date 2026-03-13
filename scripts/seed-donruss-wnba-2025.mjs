#!/usr/bin/env node

/**
 * Seed 2025 Panini Donruss WNBA parallel data.
 * 28 parallels — one of the deepest WNBA rainbows.
 * Sources: Beckett, ChecklistInsider.
 *
 * Usage:
 *   node scripts/seed-donruss-wnba-2025.mjs
 *   node scripts/seed-donruss-wnba-2025.mjs --dry-run
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

// First create the product, then seed parallels
const PRODUCT_ID = 'c0000000-0000-0000-0000-00000000003c'; // 2025 Donruss WNBA

const ALL = 'All';

const parallels = [
  // ── Unnumbered ─────────────────────────────────────────
  { name: 'Base', color_hex: '#FFFFFF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1, box_exclusivity: [ALL], description: 'Standard Donruss base card' },
  { name: 'Cubic', color_hex: '#B0B0B0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 2, box_exclusivity: [ALL], description: 'Cubic pattern finish' },
  { name: 'Dragon', color_hex: '#8B0000', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 3, box_exclusivity: [ALL], description: 'Dragon pattern finish' },
  { name: 'Green Laser', color_hex: '#00FF00', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 4, box_exclusivity: [ALL], description: 'Green laser finish' },
  { name: 'Green Shimmer', color_hex: '#228B22', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 5, box_exclusivity: [ALL], description: 'Green shimmer finish' },
  { name: 'Holo WNBA Logo', color_hex: '#FF6600', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 6, box_exclusivity: [ALL], description: 'Holographic WNBA logo finish' },
  { name: 'Lava', color_hex: '#CC3300', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 7, box_exclusivity: [ALL], description: 'Lava texture finish' },

  // ── Numbered ───────────────────────────────────────────
  { name: 'Red Lava', color_hex: '#DC143C', print_run: 399, serial_numbered: true, is_one_of_one: false, rarity_rank: 8, box_exclusivity: [ALL], description: 'Red lava /399' },
  { name: 'Red Shimmer', color_hex: '#FF0000', print_run: 399, serial_numbered: true, is_one_of_one: false, rarity_rank: 9, box_exclusivity: [ALL], description: 'Red shimmer /399' },
  { name: 'Red Holo', color_hex: '#CC0000', print_run: 299, serial_numbered: true, is_one_of_one: false, rarity_rank: 10, box_exclusivity: [ALL], description: 'Red holographic /299' },
  { name: 'Orange Laser', color_hex: '#FF8C00', print_run: 199, serial_numbered: true, is_one_of_one: false, rarity_rank: 11, box_exclusivity: [ALL], description: 'Orange laser /199' },
  { name: 'Orange Lava', color_hex: '#FF6600', print_run: 199, serial_numbered: true, is_one_of_one: false, rarity_rank: 12, box_exclusivity: [ALL], description: 'Orange lava /199' },
  { name: 'Teal Laser', color_hex: '#008080', print_run: 125, serial_numbered: true, is_one_of_one: false, rarity_rank: 13, box_exclusivity: [ALL], description: 'Teal laser /125' },
  { name: 'Purple Laser', color_hex: '#9370DB', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 14, box_exclusivity: [ALL], description: 'Purple laser /99' },
  { name: 'Purple Lava', color_hex: '#800080', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 15, box_exclusivity: [ALL], description: 'Purple lava /99' },
  { name: 'Purple Shimmer', color_hex: '#9932CC', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 16, box_exclusivity: [ALL], description: 'Purple shimmer /99' },
  { name: 'Light Blue Lava', color_hex: '#87CEEB', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 17, box_exclusivity: [ALL], description: 'Light blue lava /75' },
  { name: 'Blue Laser', color_hex: '#4169E1', print_run: 49, serial_numbered: true, is_one_of_one: false, rarity_rank: 18, box_exclusivity: [ALL], description: 'Blue laser /49' },
  { name: 'Blue Shimmer', color_hex: '#1E90FF', print_run: 49, serial_numbered: true, is_one_of_one: false, rarity_rank: 19, box_exclusivity: [ALL], description: 'Blue shimmer /49' },
  { name: 'Artist Proof', color_hex: '#DEB887', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 20, box_exclusivity: [ALL], description: 'Artist proof /25' },
  { name: 'Pink Laser', color_hex: '#FF69B4', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 21, box_exclusivity: [ALL], description: 'Pink laser /25' },
  { name: 'Pink Shimmer', color_hex: '#FF1493', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 22, box_exclusivity: [ALL], description: 'Pink shimmer /25' },
  { name: 'Holo Team Logo', color_hex: '#C0C0C0', print_run: 13, serial_numbered: true, is_one_of_one: false, rarity_rank: 23, box_exclusivity: [ALL], description: 'Holo team logo /13' },
  { name: 'Gold Shimmer', color_hex: '#FFD700', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 24, box_exclusivity: [ALL], description: 'Gold shimmer /10' },
  { name: 'Black Gold Laser', color_hex: '#1A1A1A', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 25, box_exclusivity: [ALL], description: 'Black gold laser /5' },
  { name: 'Yellow Lava', color_hex: '#FFD700', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 26, box_exclusivity: [ALL], description: 'Yellow lava /5' },

  // ── 1-of-1 ─────────────────────────────────────────────
  { name: 'Black Holo Press Proof', color_hex: '#0D0D0D', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 27, box_exclusivity: [ALL], description: 'Black holographic press proof — true 1/1' },
  { name: 'Black Shimmer', color_hex: '#1A1A1A', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 28, box_exclusivity: [ALL], description: 'Black shimmer — true 1/1' },
  { name: 'Holo Black Laser', color_hex: '#000000', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 29, box_exclusivity: [ALL], description: 'Holo black laser — true 1/1' },
];

async function main() {
  console.log(`Seeding 2025 Donruss WNBA: ${parallels.length} parallels\n`);

  if (DRY_RUN) {
    console.log('DRY RUN — no changes made.\n');
    console.log(`Total: ${parallels.length}`);
    return;
  }

  // Create product entry
  const product = {
    id: PRODUCT_ID,
    brand_id: 'b0000000-0000-0000-0000-000000000001', // Panini
    name: 'Donruss WNBA',
    sport: 'WNBA',
    year: '2025',
    description: 'Deep parallel rainbow Donruss product for WNBA. 28 parallels including 3 different 1/1 variants. Features laser, lava, and shimmer finishes.',
    release_date: '2025-10-15',
    is_flagship: false,
    pros_cons: {
      pros: ['Deepest WNBA parallel rainbow (28+)', 'Unique lava and laser finishes', 'More affordable than Prizm', '3 different 1/1 variants'],
      cons: ['Paper base cards', 'Less brand recognition than Prizm', 'Hobby focused'],
    },
  };

  const { error: prodErr } = await supabase.from('products').upsert(product, { onConflict: 'id' });
  if (prodErr) console.error('Product error:', prodErr.message);
  else console.log(`✓ Product created: ${product.name} ${product.year}`);

  // Seed parallels
  const { error: delErr } = await supabase.from('parallels').delete().eq('product_id', PRODUCT_ID);
  if (delErr) { console.error('Delete error:', delErr.message); return; }
  const rows = parallels.map(p => ({ product_id: PRODUCT_ID, ...p }));
  const { error } = await supabase.from('parallels').insert(rows);
  if (error) console.error('Insert error:', error.message);
  else console.log(`Inserted ${rows.length}/${parallels.length} parallels`);
  const { count } = await supabase.from('parallels').select('*', { count: 'exact', head: true }).eq('product_id', PRODUCT_ID);
  console.log(`Verified: ${count} parallels in DB for 2025 Donruss WNBA`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
