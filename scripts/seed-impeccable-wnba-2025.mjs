#!/usr/bin/env node
/**
 * 2025 Panini Impeccable WNBA — base set parallels.
 * First-ever Impeccable WNBA. Every card is serial numbered.
 * Hobby-only with FOTL variant. Released Dec 23, 2025.
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
const PRODUCT_ID = 'c0000000-0000-0000-0000-000000000045';
const HOBBY = 'Hobby';
const FOTL = 'FOTL';
const parallels = [
  { name: 'Base', color_hex: '#C0C0C0', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 1, box_exclusivity: [HOBBY], description: 'Silver-toned base /75 — every card is serial numbered' },
  { name: 'Silver', color_hex: '#A8A9AD', print_run: 40, serial_numbered: true, is_one_of_one: false, rarity_rank: 2, box_exclusivity: [HOBBY], description: 'Silver /40' },
  { name: 'Gold', color_hex: '#FFD700', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 3, box_exclusivity: [HOBBY], description: 'Gold /25' },
  { name: 'Holo Silver', color_hex: '#D4E4F7', print_run: 15, serial_numbered: true, is_one_of_one: false, rarity_rank: 4, box_exclusivity: [HOBBY], description: 'Holo Silver /15' },
  { name: 'Holo Gold', color_hex: '#E8D44D', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 5, box_exclusivity: [HOBBY], description: 'Holo Gold /10' },
  { name: 'Pink FOTL', color_hex: '#FF69B4', print_run: 7, serial_numbered: true, is_one_of_one: false, rarity_rank: 6, box_exclusivity: [FOTL], description: 'Pink /7 — First Off The Line exclusive' },
  { name: 'Amethyst', color_hex: '#9966CC', print_run: 8, serial_numbered: true, is_one_of_one: false, rarity_rank: 7, box_exclusivity: [HOBBY], description: 'Amethyst /8' },
  { name: 'Purple FOTL', color_hex: '#800080', print_run: 3, serial_numbered: true, is_one_of_one: false, rarity_rank: 8, box_exclusivity: [FOTL], description: 'Purple /3 — First Off The Line exclusive' },
  { name: 'Platinum', color_hex: '#E5E4E2', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 9, box_exclusivity: [HOBBY], description: 'Platinum — true 1/1' },
];
async function main() {
  console.log(`Seeding 2025 Impeccable WNBA: ${parallels.length} parallels`);
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
