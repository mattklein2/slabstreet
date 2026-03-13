#!/usr/bin/env node

/**
 * Seed complete 2025 Panini Contenders Football parallel data.
 * Based on 2024 Contenders (latest full checklist) + 2025 preview additions.
 * Sources: Beckett, ChecklistInsider, ChecklistCenter, CardSense.
 *
 * Usage:
 *   node scripts/seed-contenders-2025-nfl.mjs
 *   node scripts/seed-contenders-2025-nfl.mjs --dry-run
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

const PRODUCT_ID = 'c0000000-0000-0000-0000-000000000024'; // 2025 Contenders NFL

const HOBBY = 'Hobby';
const FOTL = 'First Off The Line';
const BLASTER = 'Blaster';
const MEGA = 'Mega Box';
const FAT_PACK = 'Fat Pack';
const RETAIL = 'Retail';
const ALL = 'All';

const parallels = [
  // ── Unnumbered Parallels ──────────────────────────────────
  { name: 'Season Ticket', color_hex: '#FFFFFF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1, box_exclusivity: [ALL], description: 'Standard base card; 100-card ticket-style set' },
  { name: 'Retail', color_hex: '#B0B0B0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 2, box_exclusivity: [RETAIL], description: 'Retail-only base variation' },
  { name: 'Game Ticket Bronze', color_hex: '#CD7F32', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 3, box_exclusivity: [ALL], description: 'Bronze-tinted game ticket parallel' },
  { name: 'Game Ticket Orange', color_hex: '#F97316', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 4, box_exclusivity: [ALL], description: 'Orange-tinted game ticket parallel' },
  { name: 'Game Ticket Red', color_hex: '#EF4444', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 5, box_exclusivity: [ALL], description: 'Red-tinted game ticket parallel' },
  { name: 'Opening Kickoff Ticket', color_hex: '#6366F1', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 6, box_exclusivity: [ALL], description: 'Opening kickoff themed ticket design' },
  { name: 'Stardust', color_hex: '#C4B5FD', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 7, box_exclusivity: [BLASTER], description: 'Sparkle/shimmer finish; Blaster exclusive (new for 2025)' },
  { name: 'Shimmer', color_hex: '#E0E7FF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 8, box_exclusivity: [FOTL], description: 'Shimmer refractor; FOTL exclusive (new for 2025)' },

  // ── Numbered Parallels ────────────────────────────────────
  { name: 'Game Ticket Blue', color_hex: '#3B82F6', print_run: 499, serial_numbered: true, is_one_of_one: false, rarity_rank: 9, box_exclusivity: [BLASTER], description: 'Blue game ticket /499; Blaster exclusive' },
  { name: 'Playoff Ticket', color_hex: '#10B981', print_run: 199, serial_numbered: true, is_one_of_one: false, rarity_rank: 10, box_exclusivity: [HOBBY], description: 'Die-cut playoff ticket /199; Hobby' },
  { name: 'Game Ticket Green', color_hex: '#22C55E', print_run: 175, serial_numbered: true, is_one_of_one: false, rarity_rank: 11, box_exclusivity: [FAT_PACK], description: 'Green game ticket /175; Fat Pack exclusive' },
  { name: 'Divisional Ticket', color_hex: '#8B5CF6', print_run: 149, serial_numbered: true, is_one_of_one: false, rarity_rank: 12, box_exclusivity: [HOBBY], description: 'Divisional round themed ticket /149; Hobby' },
  { name: 'Conference Ticket', color_hex: '#EC4899', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 13, box_exclusivity: [HOBBY], description: 'Conference championship themed ticket /99; Hobby' },
  { name: 'Game Ticket Teal', color_hex: '#14B8A6', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 14, box_exclusivity: [MEGA], description: 'Teal game ticket /75; Mega Box exclusive' },
  { name: 'Championship Ticket', color_hex: '#FFD700', print_run: 49, serial_numbered: true, is_one_of_one: false, rarity_rank: 15, box_exclusivity: [HOBBY], description: 'Championship-round themed die-cut ticket /49; Hobby (new for 2025)' },
  { name: 'Red Zone Ticket', color_hex: '#DC2626', print_run: 49, serial_numbered: true, is_one_of_one: false, rarity_rank: 16, box_exclusivity: [FOTL], description: 'Red zone themed ticket /49; FOTL exclusive' },
  { name: 'Midfield Ticket', color_hex: '#F59E0B', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 17, box_exclusivity: [HOBBY], description: 'Midfield-themed premium ticket /50; Hobby' },
  { name: 'Cracked Ice Ticket', color_hex: '#67E8F9', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 18, box_exclusivity: [HOBBY], description: 'Cracked ice refractor-style finish /25; Hobby' },
  { name: 'Red Cracked Ice Ticket', color_hex: '#FF1744', print_run: 22, serial_numbered: true, is_one_of_one: false, rarity_rank: 19, box_exclusivity: [FOTL], description: 'Red cracked ice finish /22; FOTL exclusive (new for 2025)' },
  { name: 'Week 18 Ticket', color_hex: '#7C3AED', print_run: 18, serial_numbered: true, is_one_of_one: false, rarity_rank: 20, box_exclusivity: [HOBBY], description: 'Numbered /18 for final regular season week; Hobby' },
  { name: 'Game Ticket Gold', color_hex: '#EAB308', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 21, box_exclusivity: [HOBBY], description: 'Ultra-premium gold game ticket /10; Hobby' },
  { name: 'Goal Line Ticket', color_hex: '#F43F5E', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 22, box_exclusivity: [FOTL], description: 'Goal line themed ticket /5; FOTL exclusive' },

  // ── 1-of-1 Parallels ──────────────────────────────────────
  { name: 'Super Bowl Ticket', color_hex: '#FBBF24', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 23, box_exclusivity: [HOBBY], description: 'Ultimate 1/1 Super Bowl themed ticket' },
  { name: 'Printing Plate Black', color_hex: '#1C1917', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 24, box_exclusivity: [HOBBY], description: 'Black printing plate 1/1' },
  { name: 'Printing Plate Cyan', color_hex: '#06B6D4', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 25, box_exclusivity: [HOBBY], description: 'Cyan printing plate 1/1' },
  { name: 'Printing Plate Magenta', color_hex: '#DB2777', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 26, box_exclusivity: [HOBBY], description: 'Magenta printing plate 1/1' },
  { name: 'Printing Plate Yellow', color_hex: '#FDE047', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 27, box_exclusivity: [HOBBY], description: 'Yellow printing plate 1/1' },
];

async function main() {
  console.log(`Seeding 2025 Contenders NFL Parallels: ${parallels.length} parallels\n`);

  if (DRY_RUN) {
    console.log('DRY RUN — no changes made.\n');
    console.log(`Unnumbered: ${parallels.filter(p => !p.serial_numbered).length}`);
    console.log(`Numbered: ${parallels.filter(p => p.serial_numbered && !p.is_one_of_one).length}`);
    console.log(`1-of-1: ${parallels.filter(p => p.is_one_of_one).length}`);
    console.log(`Total: ${parallels.length}`);
    return;
  }

  const { error: delErr } = await supabase.from('parallels').delete().eq('product_id', PRODUCT_ID);
  if (delErr) { console.error('Delete error:', delErr.message); return; }
  console.log('Deleted old parallels for 2025 Contenders NFL');

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

  const { error } = await supabase.from('parallels').insert(rows);
  if (error) console.error('Insert error:', error.message);
  else console.log(`Inserted ${rows.length}/${parallels.length} parallels`);

  const { count } = await supabase.from('parallels').select('*', { count: 'exact', head: true }).eq('product_id', PRODUCT_ID);
  console.log(`Verified: ${count} parallels in DB for 2025 Contenders NFL`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
