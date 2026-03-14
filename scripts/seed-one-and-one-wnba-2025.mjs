#!/usr/bin/env node
/**
 * 2025 Panini One and One WNBA — base set parallels.
 * First-ever One and One WNBA. Ultra-premium, 2 cards per box.
 * All base cards numbered /99. Released Mar 2026.
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
const PRODUCT_ID = 'c0000000-0000-0000-0000-000000000046';
const ALL = 'Hobby';
const FOTL = 'FOTL';
const parallels = [
  { name: 'Base Holo', color_hex: '#C0C0C0', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: 1, box_exclusivity: [ALL], description: 'Silver holo base /99 — every card is serial numbered' },
  { name: 'Blue', color_hex: '#1E90FF', print_run: 49, serial_numbered: true, is_one_of_one: false, rarity_rank: 2, box_exclusivity: [ALL], description: 'Blue /49' },
  { name: 'Purple', color_hex: '#7B2D8E', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 3, box_exclusivity: [ALL], description: 'Purple /25' },
  { name: 'Holo Gold', color_hex: '#FFD700', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 4, box_exclusivity: [ALL], description: 'Holo Gold /10' },
  { name: 'Pink', color_hex: '#FF69B4', print_run: 6, serial_numbered: true, is_one_of_one: false, rarity_rank: 5, box_exclusivity: [ALL], description: 'Pink /6' },
  { name: 'Holo Emerald', color_hex: '#50C878', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 6, box_exclusivity: [ALL], description: 'Holo Emerald /5' },
  { name: 'Pink FOTL', color_hex: '#FF1493', print_run: 4, serial_numbered: true, is_one_of_one: false, rarity_rank: 7, box_exclusivity: [FOTL], description: 'Pink /4 — First Off The Line auto exclusive' },
  { name: 'Holo Platinum Blue', color_hex: '#1C3F94', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 8, box_exclusivity: [ALL], description: 'Platinum Blue — true 1/1' },
];
async function main() {
  console.log(`Seeding 2025 One and One WNBA: ${parallels.length} parallels`);
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
