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
const PRODUCT_ID = 'c0000000-0000-0000-0000-000000000042';
const HOBBY = 'Hobby';
const parallels = [
  { name: 'Base Patch Auto', color_hex: '#FFFFFF', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 1, box_exclusivity: [HOBBY], description: 'Patch autograph base card /10 — every card is a premium relic auto' },
  { name: 'Red', color_hex: '#DC143C', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 2, box_exclusivity: [HOBBY], description: 'Red patch auto /5' },
  { name: 'Black', color_hex: '#1C1C1C', print_run: 2, serial_numbered: true, is_one_of_one: false, rarity_rank: 3, box_exclusivity: [HOBBY], description: 'Black patch auto /2' },
  { name: 'Gold', color_hex: '#FFD700', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 4, box_exclusivity: [HOBBY], description: 'Gold patch auto — true 1/1, the ultimate F1 card' },
];
async function main() {
  console.log(`Seeding 2025 Dynasty F1: ${parallels.length} parallels`);
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
