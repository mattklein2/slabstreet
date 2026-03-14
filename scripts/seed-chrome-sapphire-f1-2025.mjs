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
const PRODUCT_ID = 'c0000000-0000-0000-0000-00000000003d';
const ALL = 'All';
const parallels = [
  { name: 'Base Sapphire', color_hex: '#0F52BA', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1, box_exclusivity: [ALL], description: 'Blue sapphire chrome base card' },
  { name: 'Yellow', color_hex: '#FFD700', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: 2, box_exclusivity: [ALL], description: 'Yellow /75 (~1:6 packs)' },
  { name: 'Gold', color_hex: '#DAA520', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: 3, box_exclusivity: [ALL], description: 'Gold /50 (~1:9 packs)' },
  { name: 'Orange', color_hex: '#FF8C00', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 4, box_exclusivity: [ALL], description: 'Orange /25 (~1:17 packs)' },
  { name: 'Black & White', color_hex: '#808080', print_run: 20, serial_numbered: true, is_one_of_one: false, rarity_rank: 5, box_exclusivity: [ALL], description: 'Black & white treatment /20 (~1:21 packs)' },
  { name: 'Black', color_hex: '#1C1C1C', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 6, box_exclusivity: [ALL], description: 'Black /10 (~1:42 packs)' },
  { name: 'Red', color_hex: '#DC143C', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 7, box_exclusivity: [ALL], description: 'Red /5 (~1:84 packs)' },
  { name: 'Padparadscha', color_hex: '#FF6F61', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 8, box_exclusivity: [ALL], description: 'Pink-orange Padparadscha sapphire — true 1/1 (~1:419 packs)' },
];
async function main() {
  console.log(`Seeding 2025 Chrome Sapphire F1: ${parallels.length} parallels`);
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
