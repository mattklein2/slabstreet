#!/usr/bin/env node
/**
 * Create 5 missing WNBA product entries:
 * 0043 = 2024 Origins WNBA
 * 0044 = 2024 Rookie Royalty WNBA
 * 0045 = 2025 Impeccable WNBA
 * 0046 = 2025 One and One WNBA
 * 0047 = 2025 Select WNBA
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
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const PANINI = 'b0000000-0000-0000-0000-000000000001';

const products = [
  {
    id: 'c0000000-0000-0000-0000-000000000043',
    brand_id: PANINI, name: 'Origins WNBA', year: '2024', sport: 'WNBA',
    is_flagship: false,
    description: 'First mainstream WNBA product of the 2024 season. Hobby-only with on-card autos and relics. First traditional RCs of Caitlin Clark, Angel Reese, Cameron Brink class.',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000044',
    brand_id: PANINI, name: 'Rookie Royalty WNBA', year: '2024', sport: 'WNBA',
    is_flagship: false,
    description: 'Ultra-premium WNBA product featuring card designs from National Treasures, Immaculate, Flawless, and more. 2 cards per box. Hard-signed autos of Clark and Reese.',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000045',
    brand_id: PANINI, name: 'Impeccable WNBA', year: '2025', sport: 'WNBA',
    is_flagship: false,
    description: 'First-ever Impeccable WNBA. Premium on-card autos, metal Stainless Stars inserts. 5 autos per hobby box.',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000046',
    brand_id: PANINI, name: 'One and One WNBA', year: '2025', sport: 'WNBA',
    is_flagship: false,
    description: 'First-ever One and One WNBA. Ultra-premium, all base cards numbered /99. Features Kaboom inserts. 2 cards per box.',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000047',
    brand_id: PANINI, name: 'Select WNBA', year: '2025', sport: 'WNBA',
    is_flagship: false,
    description: 'Second year of Select WNBA. Three-tier base (Concourse, Premier, Courtside). SSP Black Color Blast chase cards.',
  },
];

async function main() {
  console.log(`Creating ${products.length} WNBA product entries...`);
  for (const p of products) {
    const { error } = await supabase.from('products').upsert(p, { onConflict: 'id' });
    if (error) console.error(`  Error ${p.name}:`, error.message);
    else console.log(`  ✓ ${p.year} ${p.name} (${p.id})`);
  }
  const { count } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('sport', 'WNBA');
  console.log(`Total WNBA products: ${count}`);
}
main().catch(err => { console.error('Fatal:', err); process.exit(1); });
