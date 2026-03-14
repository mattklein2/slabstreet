#!/usr/bin/env node
/**
 * Seed 2024 Topps Finest F1 — 3 rarity tiers (Common, Uncommon, Rare),
 * each with its own parallel rainbow at different print runs.
 * 27 total parallels. Sources: Beckett, ChecklistInsider.
 */
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const envPath = resolve(ROOT, '.env.local');
const env = {};
if (existsSync(envPath)) { readFileSync(envPath, 'utf-8').split('\n').forEach(line => { const m = line.match(/^([^#=][^=]*)=(.*)/); if (m) env[m[1].trim()] = m[2].trim(); }); }
const DRY_RUN = process.argv.includes('--dry-run');
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const PRODUCT_ID = 'c0000000-0000-0000-0000-000000000041';
const HOBBY = 'Hobby';

const parallels = [
  // ── Common Tier ────────────────────────────────────────
  { name: 'Common Base', color_hex: '#FFFFFF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1, box_exclusivity: [HOBBY], description: 'Common tier base card' },
  { name: 'Common Refractor', color_hex: '#C0C0C0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 2, box_exclusivity: [HOBBY], description: 'Common tier refractor' },
  { name: 'Common Blue Refractor', color_hex: '#4169E1', print_run: 200, serial_numbered: true, is_one_of_one: false, rarity_rank: 3, box_exclusivity: [HOBBY], description: 'Common blue /200' },
  { name: 'Common Die-Cut Refractor', color_hex: '#C0C0C0', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 4, box_exclusivity: [HOBBY], description: 'Common die-cut /99' },
  { name: 'Common Gold Refractor', color_hex: '#FFD700', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 5, box_exclusivity: [HOBBY], description: 'Common gold /50' },
  { name: 'Common Black Refractor', color_hex: '#1C1C1C', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 6, box_exclusivity: [HOBBY], description: 'Common black /25' },
  { name: 'Common Red/Black Vapor', color_hex: '#8B0000', print_run: 20, serial_numbered: true, is_one_of_one: false, rarity_rank: 7, box_exclusivity: [HOBBY], description: 'Common red/black vapor /20' },
  { name: 'Common Red Refractor', color_hex: '#DC143C', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 8, box_exclusivity: [HOBBY], description: 'Common red /10' },
  { name: 'Common SuperFractor', color_hex: '#FFD700', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 9, box_exclusivity: [HOBBY], description: 'Common SuperFractor — true 1/1' },

  // ── Uncommon Tier ──────────────────────────────────────
  { name: 'Uncommon Base', color_hex: '#F0F0F0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 10, box_exclusivity: [HOBBY], description: 'Uncommon tier base card' },
  { name: 'Uncommon Refractor', color_hex: '#C0C0C0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 11, box_exclusivity: [HOBBY], description: 'Uncommon tier refractor' },
  { name: 'Uncommon Blue Refractor', color_hex: '#4169E1', print_run: 150, serial_numbered: true, is_one_of_one: false, rarity_rank: 12, box_exclusivity: [HOBBY], description: 'Uncommon blue /150' },
  { name: 'Uncommon Die-Cut Refractor', color_hex: '#C0C0C0', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 13, box_exclusivity: [HOBBY], description: 'Uncommon die-cut /75' },
  { name: 'Uncommon Gold Refractor', color_hex: '#FFD700', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 14, box_exclusivity: [HOBBY], description: 'Uncommon gold /25' },
  { name: 'Uncommon Black Refractor', color_hex: '#1C1C1C', print_run: 20, serial_numbered: true, is_one_of_one: false, rarity_rank: 15, box_exclusivity: [HOBBY], description: 'Uncommon black /20' },
  { name: 'Uncommon Red/Black Vapor', color_hex: '#8B0000', print_run: 15, serial_numbered: true, is_one_of_one: false, rarity_rank: 16, box_exclusivity: [HOBBY], description: 'Uncommon red/black vapor /15' },
  { name: 'Uncommon Red Refractor', color_hex: '#DC143C', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 17, box_exclusivity: [HOBBY], description: 'Uncommon red /5' },
  { name: 'Uncommon SuperFractor', color_hex: '#FFD700', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 18, box_exclusivity: [HOBBY], description: 'Uncommon SuperFractor — true 1/1' },

  // ── Rare Tier ──────────────────────────────────────────
  { name: 'Rare Base', color_hex: '#E8E8E8', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 19, box_exclusivity: [HOBBY], description: 'Rare tier base card' },
  { name: 'Rare Refractor', color_hex: '#C0C0C0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 20, box_exclusivity: [HOBBY], description: 'Rare tier refractor' },
  { name: 'Rare Blue Refractor', color_hex: '#4169E1', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 21, box_exclusivity: [HOBBY], description: 'Rare blue /99' },
  { name: 'Rare Die-Cut Refractor', color_hex: '#C0C0C0', print_run: 40, serial_numbered: true, is_one_of_one: false, rarity_rank: 22, box_exclusivity: [HOBBY], description: 'Rare die-cut /40' },
  { name: 'Rare Gold Refractor', color_hex: '#FFD700', print_run: 20, serial_numbered: true, is_one_of_one: false, rarity_rank: 23, box_exclusivity: [HOBBY], description: 'Rare gold /20' },
  { name: 'Rare Black Refractor', color_hex: '#1C1C1C', print_run: 15, serial_numbered: true, is_one_of_one: false, rarity_rank: 24, box_exclusivity: [HOBBY], description: 'Rare black /15' },
  { name: 'Rare Red/Black Vapor', color_hex: '#8B0000', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 25, box_exclusivity: [HOBBY], description: 'Rare red/black vapor /10' },
  { name: 'Rare Red Refractor', color_hex: '#DC143C', print_run: 3, serial_numbered: true, is_one_of_one: false, rarity_rank: 26, box_exclusivity: [HOBBY], description: 'Rare red /3' },
  { name: 'Rare SuperFractor', color_hex: '#FFD700', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 27, box_exclusivity: [HOBBY], description: 'Rare SuperFractor — true 1/1' },
];

async function main() {
  console.log(`Seeding 2024 Finest F1: ${parallels.length} parallels`);
  if (DRY_RUN) { console.log(`Total: ${parallels.length}`); return; }
  await supabase.from('parallels').delete().eq('product_id', PRODUCT_ID);
  const rows = parallels.map(p => ({ product_id: PRODUCT_ID, ...p }));
  const { error } = await supabase.from('parallels').insert(rows);
  if (error) console.error('Insert error:', error.message);
  else console.log(`Inserted ${rows.length} parallels`);
  const { count } = await supabase.from('parallels').select('*', { count: 'exact', head: true }).eq('product_id', PRODUCT_ID);
  console.log(`Verified: ${count} parallels`);
}
main().catch(err => { console.error('Fatal:', err); process.exit(1); });
