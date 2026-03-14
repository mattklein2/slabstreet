#!/usr/bin/env node
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
const PRODUCT_ID = 'c0000000-0000-0000-0000-00000000003e';
const MEGA = 'Mega Box';
const parallels = [
  { name: 'Base LogoFractor', color_hex: '#C0C0C0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1, box_exclusivity: [MEGA], description: 'F1 logo pattern chrome base card; Mega Box exclusive' },
  { name: 'Yellow LogoFractor', color_hex: '#FFD700', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 2, box_exclusivity: [MEGA], description: 'Yellow logo pattern /75 (~1:2 Mega)' },
  { name: 'Gold LogoFractor', color_hex: '#DAA520', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 3, box_exclusivity: [MEGA], description: 'Gold logo pattern /50 (~1:3 Mega)' },
  { name: 'Orange LogoFractor', color_hex: '#FF8C00', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 4, box_exclusivity: [MEGA], description: 'Orange logo pattern /25 (~1:5 Mega)' },
  { name: 'Black LogoFractor', color_hex: '#1C1C1C', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 5, box_exclusivity: [MEGA], description: 'Black logo pattern /10 (~1:11 Mega)' },
  { name: 'Red LogoFractor', color_hex: '#DC143C', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 6, box_exclusivity: [MEGA], description: 'Red logo pattern /5 (~1:22 Mega)' },
  { name: 'Rose Gold LogoFractor', color_hex: '#B76E79', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 7, box_exclusivity: [MEGA], description: 'Rose gold 1/1 — Mega Box ultimate chase (~1:106 Mega)' },
];
async function main() {
  console.log(`Seeding 2025 Chrome LogoFractor F1: ${parallels.length} parallels`);
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
