#!/usr/bin/env node

/**
 * Insert product rows for F1 and WNBA.
 *
 * Usage:
 *   node scripts/seed-f1-wnba-products.mjs
 *   node scripts/seed-f1-wnba-products.mjs --dry-run
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
const PANINI = 'b0000000-0000-0000-0000-000000000001';

const products = [
  // ── F1 Products ────────────────────────────────────────
  {
    id: 'c0000000-0000-0000-0000-000000000034',
    brand_id: TOPPS,
    name: 'Topps F1',
    sport: 'F1',
    year: '2025',
    description: 'The flagship Formula 1 trading card product. Features all 20 F1 drivers, team cards, and race highlights from the 2025 season.',
    release_date: '2025-03-15',
    is_flagship: true,
    pros_cons: {
      pros: ['Official F1 license', 'Most accessible F1 product', 'Available at retail', 'Broad driver checklist'],
      cons: ['Paper base cards', 'Lower ceiling per box than Chrome', 'Newer market — less established values'],
    },
  },
  {
    id: 'c0000000-0000-0000-0000-000000000035',
    brand_id: TOPPS,
    name: 'Topps Chrome F1',
    sport: 'F1',
    year: '2025',
    description: 'Premium chrome version of Topps F1. All-chromium cards with deep refractor rainbow. The premium F1 collecting product.',
    release_date: '2025-11-15',
    is_flagship: false,
    pros_cons: {
      pros: ['All chrome cards', 'Deep refractor rainbow', 'Numbered parallels', 'Better long-term hold value'],
      cons: ['Higher price point', 'Hobby-focused distribution', 'Limited retail availability'],
    },
  },
  {
    id: 'c0000000-0000-0000-0000-000000000036',
    brand_id: TOPPS,
    name: 'Topps F1',
    sport: 'F1',
    year: '2024',
    description: 'Flagship F1 product for the 2024 season. Features Verstappen, Hamilton, Norris, and the full grid.',
    release_date: '2024-03-20',
    is_flagship: true,
    pros_cons: {
      pros: ['First full year of mature F1 card market', 'Strong driver rookies', 'Retail availability'],
      cons: ['Paper base cards', '2024 product — superseded by 2025'],
    },
  },
  {
    id: 'c0000000-0000-0000-0000-000000000037',
    brand_id: TOPPS,
    name: 'Topps Chrome F1',
    sport: 'F1',
    year: '2024',
    description: 'Chrome F1 product for the 2024 season. All-chromium with refractor rainbow.',
    release_date: '2024-10-15',
    is_flagship: false,
    pros_cons: {
      pros: ['All chrome cards', 'Deep refractor rainbow', 'Established parallel structure'],
      cons: ['Higher price point', '2024 product — superseded by 2025'],
    },
  },

  // ── WNBA Products ─────────────────────────────────────
  {
    id: 'c0000000-0000-0000-0000-000000000038',
    brand_id: PANINI,
    name: 'Prizm WNBA',
    sport: 'WNBA',
    year: '2025',
    description: 'The premier WNBA card product. Features all WNBA players with the iconic Prizm parallel rainbow. Caitlin Clark\'s second-year cards.',
    release_date: '2025-09-15',
    is_flagship: true,
    pros_cons: {
      pros: ['Iconic Prizm brand', 'Deep parallel rainbow', 'Caitlin Clark year 2', 'Exploding WNBA market'],
      cons: ['High demand drives up box prices', 'Hobby boxes can be expensive', 'Smaller checklist than NBA'],
    },
  },
  {
    id: 'c0000000-0000-0000-0000-000000000039',
    brand_id: PANINI,
    name: 'Prizm WNBA',
    sport: 'WNBA',
    year: '2024',
    description: 'The blockbuster WNBA product. Caitlin Clark\'s true rookie Prizm cards drove unprecedented demand.',
    release_date: '2024-08-30',
    is_flagship: true,
    pros_cons: {
      pros: ['Caitlin Clark true rookie Prizms', 'Historic demand', 'Strong resale market', 'Deep parallel rainbow'],
      cons: ['Extremely high secondary market prices', '2024 product — hard to find at retail'],
    },
  },
  {
    id: 'c0000000-0000-0000-0000-00000000003a',
    brand_id: PANINI,
    name: 'Select WNBA',
    sport: 'WNBA',
    year: '2024',
    description: 'Multi-tiered WNBA product with Concourse, Premier, and Courtside tiers. Premium die-cut parallels.',
    release_date: '2024-12-15',
    is_flagship: false,
    pros_cons: {
      pros: ['Three-tier card design', 'Die-cut parallels', 'Caitlin Clark rookie Select cards', 'Premium feel'],
      cons: ['Hobby only', 'Higher price per box', 'Smaller checklist'],
    },
  },
  {
    id: 'c0000000-0000-0000-0000-00000000003b',
    brand_id: PANINI,
    name: 'Hoops WNBA',
    sport: 'WNBA',
    year: '2024',
    description: 'Budget-friendly WNBA product. Great entry point for WNBA card collecting with accessible price point.',
    release_date: '2024-06-15',
    is_flagship: false,
    pros_cons: {
      pros: ['Most affordable WNBA product', 'Available at retail', 'Good for beginners', 'Caitlin Clark rookie Hoops'],
      cons: ['Lower resale ceiling', 'Paper cards — not chrome', 'Simpler parallel structure'],
    },
  },
];

async function main() {
  console.log(`Inserting ${products.length} F1/WNBA products\n`);

  if (DRY_RUN) {
    console.log('DRY RUN — no changes made.\n');
    products.forEach(p => console.log(`  ${p.id.slice(-4)} ${p.sport} ${p.year} ${p.name}`));
    return;
  }

  for (const p of products) {
    const { error } = await supabase.from('products').upsert(p, { onConflict: 'id' });
    if (error) {
      console.error(`Error inserting ${p.name}:`, error.message);
    } else {
      console.log(`✓ ${p.sport} ${p.year} ${p.name} (${p.id.slice(-4)})`);
    }
  }

  const { count } = await supabase.from('products').select('*', { count: 'exact', head: true });
  console.log(`\nTotal products in DB: ${count}`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
