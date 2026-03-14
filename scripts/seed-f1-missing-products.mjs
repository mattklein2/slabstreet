#!/usr/bin/env node

/**
 * Insert missing F1 product rows.
 *
 * Usage:
 *   node scripts/seed-f1-missing-products.mjs
 *   node scripts/seed-f1-missing-products.mjs --dry-run
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

const TOPPS = 'b0000000-0000-0000-0000-000000000002';

const products = [
  {
    id: 'c0000000-0000-0000-0000-00000000003d',
    brand_id: TOPPS,
    name: 'Topps Chrome Sapphire F1',
    sport: 'F1',
    year: '2025',
    description: 'Premium all-sapphire chrome F1 product. Every card has a distinctive blue sapphire chrome finish. Online-exclusive, limited production.',
    release_date: '2026-02-12',
    is_flagship: false,
    pros_cons: {
      pros: ['Stunning sapphire blue chrome finish', 'Limited production run', 'Padparadscha 1/1 chase', 'Premium collector appeal'],
      cons: ['Online exclusive — not at retail', 'Higher price point', 'Small parallel rainbow'],
    },
  },
  {
    id: 'c0000000-0000-0000-0000-00000000003e',
    brand_id: TOPPS,
    name: 'Topps Chrome LogoFractor F1',
    sport: 'F1',
    year: '2025',
    description: 'Mega Box exclusive F1 Chrome product featuring the LogoFractor pattern background. Available at retail (Target, Walmart).',
    release_date: '2026-01-30',
    is_flagship: false,
    pros_cons: {
      pros: ['Mega Box retail price point', 'Unique LogoFractor pattern', 'Rose Gold 1/1 chase', 'Available at Target/Walmart'],
      cons: ['Smaller parallel rainbow', 'Single box format only', 'Less depth than Hobby Chrome'],
    },
  },
  {
    id: 'c0000000-0000-0000-0000-00000000003f',
    brand_id: TOPPS,
    name: 'Topps Lights Out F1',
    sport: 'F1',
    year: '2025',
    description: 'On-demand/print-to-order F1 product celebrating the "Lights out and away we go" race start. 57-card set.',
    release_date: '2025-08-29',
    is_flagship: false,
    pros_cons: {
      pros: ['Unique race-start theme', 'Print-to-order availability', 'Clean parallel rainbow', 'Gold Framed 1/1 chase'],
      cons: ['Smaller 57-card base set', 'On-demand — not at retail', 'Limited secondary market'],
    },
  },
  {
    id: 'c0000000-0000-0000-0000-000000000040',
    brand_id: TOPPS,
    name: 'Topps Eccellenza F1',
    sport: 'F1',
    year: '2025',
    description: 'Italian-themed premium F1 product ("Eccellenza" = Excellence). On-demand print-to-order format celebrating F1 excellence.',
    release_date: '2025-12-11',
    is_flagship: false,
    pros_cons: {
      pros: ['Unique Italian-themed design', 'Clean parallel rainbow', 'On-demand availability', 'Gold 1/1 chase'],
      cons: ['On-demand — not at retail', 'Smaller set', 'Niche appeal'],
    },
  },
  {
    id: 'c0000000-0000-0000-0000-000000000041',
    brand_id: TOPPS,
    name: 'Topps Finest F1',
    sport: 'F1',
    year: '2024',
    description: 'Premium Finest-brand F1 product with 3 rarity tiers (Common, Uncommon, Rare). Each tier has its own parallel rainbow with different print runs. Hobby only.',
    release_date: '2025-06-15',
    is_flagship: false,
    pros_cons: {
      pros: ['Three rarity tiers add depth', 'Die-cut refractors', 'Red/Black Vapor refractors', 'SuperFractor chase per tier'],
      cons: ['Hobby only — no retail', 'Higher price point', 'Complex tier system'],
    },
  },
  {
    id: 'c0000000-0000-0000-0000-000000000042',
    brand_id: TOPPS,
    name: 'Topps Dynasty F1',
    sport: 'F1',
    year: '2025',
    description: 'Ultra high-end F1 product. 1 card per box — every card is a patch autograph numbered /10 or less. The pinnacle of F1 card collecting.',
    release_date: '2025-11-19',
    is_flagship: false,
    pros_cons: {
      pros: ['Every card is a patch auto', 'All cards /10 or less', 'Gold 1/1 ultimate chase', 'Prestige product'],
      cons: ['$500+ per box', '1 card per box', 'Extremely limited audience', 'Investment risk'],
    },
  },
];

async function main() {
  console.log(`Inserting ${products.length} missing F1 products\n`);
  if (DRY_RUN) {
    products.forEach(p => console.log(`  ${p.id.slice(-4)} ${p.sport} ${p.year} ${p.name}`));
    return;
  }
  for (const p of products) {
    const { error } = await supabase.from('products').upsert(p, { onConflict: 'id' });
    if (error) console.error(`Error: ${p.name}:`, error.message);
    else console.log(`✓ ${p.sport} ${p.year} ${p.name} (${p.id.slice(-4)})`);
  }
  const { count } = await supabase.from('products').select('*', { count: 'exact', head: true });
  console.log(`\nTotal products in DB: ${count}`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
