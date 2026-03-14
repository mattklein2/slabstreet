#!/usr/bin/env node
/**
 * 2024 Panini Rookie Royalty WNBA — consolidated parallels.
 * Ultra-premium product ($3K/box). Features card designs from National Treasures,
 * Immaculate, Flawless, Contenders, Noir, Crown Royale, Elite, and Donruss.
 * 2 cards per box: 1 hard-signed auto + 1 Kaboom/Downtown insert.
 * Parallels consolidated across all sub-brands into unified rainbow.
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
const PRODUCT_ID = 'c0000000-0000-0000-0000-000000000044';
const HOBBY = 'Hobby';
const parallels = [
  // ── Unnumbered ─────────────────────────────────────────
  { name: 'Base', color_hex: '#C0C0C0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: 1, box_exclusivity: [HOBBY], description: 'Base card — varies by sub-brand (NT, Immaculate, Flawless, etc.)' },

  // ── Numbered ───────────────────────────────────────────
  { name: 'Red', color_hex: '#E63946', print_run: 49, serial_numbered: true, is_one_of_one: false, rarity_rank: 2, box_exclusivity: [HOBBY], description: 'Red /49 — NT and Immaculate RPAs' },
  { name: 'Bronze', color_hex: '#CD7F32', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 3, box_exclusivity: [HOBBY], description: 'Bronze /25 — NT, Noir, Elite sub-brands' },
  { name: 'Cracked Ice', color_hex: '#B0E0E6', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: 4, box_exclusivity: [HOBBY], description: 'Cracked Ice /25 — Contenders, Crown Royale, Kaboom, Downtown' },
  { name: 'Ruby', color_hex: '#E0115F', print_run: 20, serial_numbered: true, is_one_of_one: false, rarity_rank: 5, box_exclusivity: [HOBBY], description: 'Ruby /20 — Immaculate, Flawless RPAs' },
  { name: 'Sapphire', color_hex: '#0F52BA', print_run: 15, serial_numbered: true, is_one_of_one: false, rarity_rank: 6, box_exclusivity: [HOBBY], description: 'Sapphire /15 — Immaculate, Flawless RPAs' },
  { name: 'Holo Gold', color_hex: '#FFD700', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 7, box_exclusivity: [HOBBY], description: 'Holo Gold /10 — across most sub-brands' },
  { name: 'Gold', color_hex: '#DAA520', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: 8, box_exclusivity: [HOBBY], description: 'Gold /10 — Contenders, Crown Royale, Kaboom, Downtown' },
  { name: 'Green', color_hex: '#2ECC71', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 9, box_exclusivity: [HOBBY], description: 'Green /5 — NT, Noir, Elite sub-brands' },
  { name: 'Emerald', color_hex: '#50C878', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: 10, box_exclusivity: [HOBBY], description: 'Emerald /5 — Immaculate, Flawless RPAs' },

  // ── 1-of-1 ─────────────────────────────────────────────
  { name: 'Holo Platinum Blue', color_hex: '#4DA6FF', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 11, box_exclusivity: [HOBBY], description: 'Holo Platinum Blue — true 1/1, across all sub-brands' },
  { name: 'WNBA Logo', color_hex: '#FF6B00', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: 12, box_exclusivity: [HOBBY], description: 'WNBA Logoman — true 1/1, NT/Immaculate/Flawless RPAs only' },
];
async function main() {
  console.log(`Seeding 2024 Rookie Royalty WNBA: ${parallels.length} parallels`);
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
