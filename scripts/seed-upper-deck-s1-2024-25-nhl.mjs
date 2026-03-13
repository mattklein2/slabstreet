#!/usr/bin/env node

/**
 * Seed complete 2024-25 Upper Deck Series 1 Hockey parallel data.
 * Sources: Cardboard Connection, Beckett, community break data.
 *
 * Usage:
 *   node scripts/seed-upper-deck-s1-2024-25-nhl.mjs
 *   node scripts/seed-upper-deck-s1-2024-25-nhl.mjs --dry-run
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

const PRODUCT_ID = 'c0000000-0000-0000-0000-000000000008'; // 2024-25 Upper Deck Series 1 NHL

const HOBBY = 'Hobby';
const EPACK = 'ePack';
const BLASTER = 'Retail Blaster';
const TIN = 'Tin';
const HANGER = 'Hanger';
const STARTER = 'Starter Kit';
const ALL = 'All';

// Complete parallel data for 2024-25 Upper Deck Series 1 Hockey
// Corrected via Cardboard Connection, Beckett, Upper Deck official checklist
// Note: Dazzlers are INSERTS not parallels; French variation removed (not in this year);
// No base printing plates (only on insert sets like Canvas, A-Lines, etc.)
const parallels = [
  // ── Unnumbered Parallels ──────────────────────────────────────
  { name: 'Base', color_hex: '#FFFFFF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1, box_exclusivity: [ALL], description: 'Standard base card with white border design' },
  { name: 'Outburst Silver', color_hex: '#C0C0C0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 2, box_exclusivity: [HOBBY, EPACK, BLASTER, STARTER, TIN, HANGER], description: 'Silver refractor-style parallel — ~1:30 Hobby/ePack, ~1:90 retail' },
  { name: 'Clear Cut', color_hex: '#F0F8FF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 3, box_exclusivity: [HOBBY], description: 'Acetate transparent card stock — Hobby exclusive (~1:96 packs)' },

  // ── Numbered Parallels ────────────────────────────────────────
  { name: 'Deluxe', color_hex: '#1E3A5F', print_run: 250, serial_numbered: true, is_one_of_one: false, rarity_rank: 4, box_exclusivity: [HOBBY, EPACK], description: 'Premium stock parallel /250 — Hobby and ePack only' },
  { name: 'Exclusives', color_hex: '#1C1C1C', print_run: 100, serial_numbered: true, is_one_of_one: false, rarity_rank: 5, box_exclusivity: [HOBBY, EPACK], description: 'Classic UD chase parallel /100 — Hobby and ePack only' },
  { name: 'Outburst Red', color_hex: '#CC0000', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 6, box_exclusivity: [HOBBY, EPACK], description: 'Red refractor-style parallel /25 — Hobby and ePack only' },
  { name: 'High Gloss', color_hex: '#2A2A2A', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 7, box_exclusivity: [HOBBY, EPACK], description: 'Ultra-glossy finish parallel /10 — Hobby and ePack only' },

  // ── 1-of-1 Parallels ─────────────────────────────────────────
  { name: 'Outburst Gold', color_hex: '#FFD700', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 8, box_exclusivity: [HOBBY, EPACK], description: 'Gold refractor-style 1/1 — The ultimate base chase card. Hobby and ePack only.' },
];

async function main() {
  console.log(`Seeding 2024-25 Upper Deck Series 1 NHL Parallels: ${parallels.length} parallels\n`);

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
  console.log('Deleted old parallels for Upper Deck Series 1 NHL 2024-25');

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
  console.log(`Verified: ${count} parallels in DB for Upper Deck Series 1 NHL 2024-25`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
