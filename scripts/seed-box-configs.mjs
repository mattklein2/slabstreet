#!/usr/bin/env node

/**
 * Seed box_configurations for all retail products.
 * Sources: Beckett, Cardboard Connection, Target, Walmart, manufacturer sites.
 *
 * Usage:
 *   node scripts/seed-box-configs.mjs
 *   node scripts/seed-box-configs.mjs --dry-run
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import pg from 'pg';

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
const pgClient = new pg.Client({ connectionString: env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

// Product IDs from seed-all-products.mjs
const ID = {
  // NBA 2024-25
  PRIZM_NBA:        'c0000000-0000-0000-0000-000000000001',
  DONRUSS_NBA:      'c0000000-0000-0000-0000-000000000002',
  HOOPS_NBA:        'c0000000-0000-0000-0000-000000000009',
  SELECT_NBA:       'c0000000-0000-0000-0000-00000000000a',
  MOSAIC_NBA:       'c0000000-0000-0000-0000-00000000000b',
  COURT_KINGS_NBA:  'c0000000-0000-0000-0000-00000000000c',
  // NFL 2024
  PRIZM_NFL:        'c0000000-0000-0000-0000-000000000004',
  DONRUSS_NFL:      'c0000000-0000-0000-0000-000000000005',
  MOSAIC_NFL:       'c0000000-0000-0000-0000-00000000000f',
  SCORE_NFL:        'c0000000-0000-0000-0000-000000000011',
  CERTIFIED_NFL:    'c0000000-0000-0000-0000-000000000012', // Contenders → we'll use for Totally Certified
  // MLB 2025
  TOPPS_S1_MLB:     'c0000000-0000-0000-0000-000000000007',
  CHROME_MLB:       'c0000000-0000-0000-0000-000000000006',
  BOWMAN_MLB:       'c0000000-0000-0000-0000-000000000027',
  HERITAGE_MLB:     'c0000000-0000-0000-0000-000000000028',
  // NHL 2024-25
  UD_S1_NHL:        'c0000000-0000-0000-0000-000000000008',
};

// Check if Contenders 2024 NFL was stored as 0012 or different
// We'll look up by name if needed

const configs = [
  // ══════════════════════════════════════════════════════════════
  // NBA 2024-25
  // ══════════════════════════════════════════════════════════════

  // Prizm NBA (already had hobby + blaster, adding mega and fat pack)
  {
    product_id: ID.PRIZM_NBA, config_type: 'mega_box',
    retail_price_usd: 49.99, packs_per_box: 8, cards_per_pack: 4,
    guaranteed_hits: 'One guaranteed numbered card per box.',
    odds_numbered: '1:8',
    description: 'Mega-exclusive Pink Ice and Green Pulsar parallels. 32 cards total.',
  },
  {
    product_id: ID.PRIZM_NBA, config_type: 'fat_pack',
    retail_price_usd: 14.99, packs_per_box: 1, cards_per_pack: 22,
    guaranteed_hits: 'Three guaranteed Prizm parallels per pack.',
    description: 'Fat Pack-exclusive Red, White and Blue parallels.',
  },

  // Donruss NBA (already had hobby + blaster, adding mega and fat pack)
  {
    product_id: ID.DONRUSS_NBA, config_type: 'mega_box',
    retail_price_usd: 39.99, packs_per_box: 6, cards_per_pack: 10,
    guaranteed_hits: 'One guaranteed autograph or memorabilia card per box.',
    odds_auto: '1:60',
    description: '60 cards total. Mega-exclusive Holo Green parallels.',
  },
  {
    product_id: ID.DONRUSS_NBA, config_type: 'fat_pack',
    retail_price_usd: 6.99, packs_per_box: 1, cards_per_pack: 30,
    guaranteed_hits: 'Two guaranteed parallels per pack.',
    description: 'Fat Pack-exclusive Press Proof Red parallels.',
  },

  // Select NBA
  {
    product_id: ID.SELECT_NBA, config_type: 'blaster',
    retail_price_usd: 34.99, packs_per_box: 6, cards_per_pack: 4,
    guaranteed_hits: null,
    description: '24 cards total. Blaster-exclusive Orange Flash, Purple Flash (/175), Blue Flash (/99), Gold Flash (/10) parallels.',
  },
  {
    product_id: ID.SELECT_NBA, config_type: 'mega_box',
    retail_price_usd: 39.99, packs_per_box: 10, cards_per_pack: 4,
    guaranteed_hits: null,
    odds_auto: '~1:40',
    description: '40 cards total. Mega-exclusive Blue Cracked Ice, Pink Cracked Ice (/99), Orange Cracked Ice (/135) parallels. Possible autographs.',
  },

  // Hoops NBA
  {
    product_id: ID.HOOPS_NBA, config_type: 'blaster',
    retail_price_usd: 24.99, packs_per_box: 6, cards_per_pack: 15,
    guaranteed_hits: 'Six guaranteed Opti-Chrome Premium cards per box.',
    description: '90 cards total. Blaster-exclusive Storm and Yellow Checkerboard parallels. Blaster-exclusive Rise N Shine and Rookie Remembrance memorabilia.',
  },
  {
    product_id: ID.HOOPS_NBA, config_type: 'fat_pack',
    retail_price_usd: 6.99, packs_per_box: 1, cards_per_pack: 30,
    guaranteed_hits: null,
    description: 'Fat Pack-exclusive Teal Explosion, White Explosion (/149), Orange Explosion (/25) parallels on holographic card stock.',
  },

  // Court Kings NBA
  {
    product_id: ID.COURT_KINGS_NBA, config_type: 'blaster',
    retail_price_usd: 24.99, packs_per_box: 6, cards_per_pack: 6,
    guaranteed_hits: 'Averages two acetate cards, four inserts, and one parallel per box.',
    description: '36 cards total. Blaster-exclusive Artist Proof, Burgundy (/125), Jade (/25), Obsidian (/8) parallels. International Blaster format only.',
  },

  // Mosaic NBA
  {
    product_id: ID.MOSAIC_NBA, config_type: 'blaster',
    retail_price_usd: 24.99, packs_per_box: 6, cards_per_pack: 6,
    guaranteed_hits: 'Averages six Base Mosaic Prizms and three inserts per box.',
    description: '36 cards total. Blaster-exclusive Red Seismic (/299), Blue Seismic (/149), Orange Fluorescent (/25) parallels. SSP Stained Glass, Micro Mosaic inserts possible.',
  },
  {
    product_id: ID.MOSAIC_NBA, config_type: 'mega_box',
    retail_price_usd: 44.99, packs_per_box: 6, cards_per_pack: 10,
    guaranteed_hits: 'Averages ten exclusive Prizms and seven inserts per box.',
    description: '60 cards total. Mega-exclusive Reactive Blue, Purple Fluorescent (/249), Red Fluorescent (/75), Pink Fluorescent (/10) parallels.',
  },

  // ══════════════════════════════════════════════════════════════
  // NFL 2024
  // ══════════════════════════════════════════════════════════════

  // Prizm NFL (already had hobby + blaster, adding mega and fat pack)
  {
    product_id: ID.PRIZM_NFL, config_type: 'mega_box',
    retail_price_usd: 49.99, packs_per_box: 8, cards_per_pack: 4,
    guaranteed_hits: 'One guaranteed numbered card per box.',
    odds_numbered: '1:8',
    description: '32 cards total. Mega-exclusive Pink Ice and Green Pulsar parallels.',
  },
  {
    product_id: ID.PRIZM_NFL, config_type: 'fat_pack',
    retail_price_usd: 14.99, packs_per_box: 1, cards_per_pack: 22,
    guaranteed_hits: 'Three guaranteed Prizm parallels per pack.',
    description: 'Fat Pack-exclusive Red, White and Blue parallels.',
  },

  // Donruss NFL
  {
    product_id: ID.DONRUSS_NFL, config_type: 'blaster',
    retail_price_usd: 24.99, packs_per_box: 6, cards_per_pack: 15,
    guaranteed_hits: null,
    description: '90 cards total. Look for blaster-exclusive Donruss Threads memorabilia. Retail-exclusive Red Hot Rookies and Optic Rated Rookies Preview Holo.',
  },
  {
    product_id: ID.DONRUSS_NFL, config_type: 'mega_box',
    retail_price_usd: 39.99, packs_per_box: 6, cards_per_pack: 10,
    guaranteed_hits: 'One guaranteed autograph or memorabilia card per box.',
    odds_auto: '1:60',
    description: '60 cards total. Averages 6 Rated Rookies, 5 Green parallels, 4 Optic Preview Pinks. Downtown insert possible.',
  },
  {
    product_id: ID.DONRUSS_NFL, config_type: 'fat_pack',
    retail_price_usd: 6.99, packs_per_box: 1, cards_per_pack: 30,
    guaranteed_hits: null,
    description: 'Fat Pack-exclusive Press Proof Red parallels.',
  },

  // Score NFL
  {
    product_id: ID.SCORE_NFL, config_type: 'blaster',
    retail_price_usd: 24.99, packs_per_box: 6, cards_per_pack: 22,
    guaranteed_hits: 'One guaranteed numbered card per box.',
    odds_numbered: '1:132',
    description: '132 cards total — best card count of any NFL box. Look for Rookies Signatures Green. 35th Anniversary inserts.',
  },
  {
    product_id: ID.SCORE_NFL, config_type: 'fat_pack',
    retail_price_usd: 6.99, packs_per_box: 1, cards_per_pack: 30,
    guaranteed_hits: null,
    description: 'Fat Pack-exclusive Dots Gold and Red parallels. Possible autographs.',
  },

  // Mosaic NFL
  {
    product_id: ID.MOSAIC_NFL, config_type: 'blaster',
    retail_price_usd: 29.99, packs_per_box: 6, cards_per_pack: 6,
    guaranteed_hits: null,
    description: '36 cards total. Blaster-exclusive Orange Fluorescent parallels. SSP Stained Glass, Kaleidoscopic, Micro Mosaic inserts possible.',
  },
  {
    product_id: ID.MOSAIC_NFL, config_type: 'mega_box',
    retail_price_usd: 44.99, packs_per_box: 7, cards_per_pack: 6,
    guaranteed_hits: 'Averages ten exclusive Reactive Blue parallels and three additional parallels per box.',
    description: '42 cards total. Mega-exclusive Reactive Blue parallels.',
  },

  // ══════════════════════════════════════════════════════════════
  // MLB 2025
  // ══════════════════════════════════════════════════════════════

  // Topps Series 1 (already had hobby + blaster, adding mega and fat pack)
  {
    product_id: ID.TOPPS_S1_MLB, config_type: 'mega_box',
    retail_price_usd: 44.99, packs_per_box: 16, cards_per_pack: 16,
    guaranteed_hits: 'One guaranteed autograph or relic card per box.',
    odds_auto: '1:256',
    odds_relic: '1:128',
    description: '256 cards total. Mega-exclusive Ice parallels.',
  },
  {
    product_id: ID.TOPPS_S1_MLB, config_type: 'fat_pack',
    retail_price_usd: 14.99, packs_per_box: 1, cards_per_pack: 40,
    guaranteed_hits: 'Two guaranteed foilboard parallels per pack.',
    description: 'Fat Pack-exclusive foilboard parallels.',
  },

  // Chrome MLB (already had hobby + blaster, adding mega)
  {
    product_id: ID.CHROME_MLB, config_type: 'mega_box',
    retail_price_usd: 49.99, packs_per_box: 10, cards_per_pack: 4,
    guaranteed_hits: 'One guaranteed autograph per box.',
    odds_auto: '1:40',
    description: '40 cards total. Mega-exclusive Aqua Refractor parallels.',
  },

  // Bowman MLB 2025
  {
    product_id: ID.BOWMAN_MLB, config_type: 'blaster',
    retail_price_usd: 29.99, packs_per_box: 6, cards_per_pack: 12,
    guaranteed_hits: null,
    description: '72 cards total (7 base + 3 paper prospects + 2 Chrome prospects per pack). Retail-exclusive Green parallels, Firefractors (/3). Possible exclusive Paper autographs.',
  },
  {
    product_id: ID.BOWMAN_MLB, config_type: 'mega_box',
    retail_price_usd: 49.99, packs_per_box: 7, cards_per_pack: 5,
    guaranteed_hits: null,
    description: '35 cards total (5 Chrome packs + 2 Mega-exclusive packs). Mega-exclusive Steel Metal and Black Refractors (new for 2025). Purple, Pink, Aqua, Blue parallels. Rose Gold Mojo 1/1 possible.',
  },

  // Heritage MLB 2025
  {
    product_id: ID.HERITAGE_MLB, config_type: 'blaster',
    retail_price_usd: 24.99, packs_per_box: 8, cards_per_pack: 8,
    guaranteed_hits: 'Two high-numbered short prints, two Dark Green parallels (blaster-exclusive), two Chrome Pink Sparkle parallels (blaster-exclusive) per box.',
    description: '64 cards total. 1976 design tribute. Also includes two base Chrome or Refractor parallels and one insert per box.',
  },
  {
    product_id: ID.HERITAGE_MLB, config_type: 'mega_box',
    retail_price_usd: 49.99, packs_per_box: 17, cards_per_pack: 8,
    guaranteed_hits: null,
    description: '136 cards total. Mega-exclusive Base Red parallels and Silver Sparkle Chrome Variations.',
  },

  // ══════════════════════════════════════════════════════════════
  // NHL 2024-25
  // ══════════════════════════════════════════════════════════════

  // UD Series 1 (already had hobby + blaster, adding mega/fat pack)
  {
    product_id: ID.UD_S1_NHL, config_type: 'mega_box',
    retail_price_usd: 39.99, packs_per_box: 10, cards_per_pack: 8,
    guaranteed_hits: 'One guaranteed Young Guns rookie per box.',
    description: '80 cards total. Mega-exclusive Blue parallels. Young Guns rookies are the main chase.',
  },
  {
    product_id: ID.UD_S1_NHL, config_type: 'fat_pack',
    retail_price_usd: 12.99, packs_per_box: 1, cards_per_pack: 32,
    guaranteed_hits: 'One guaranteed Young Guns rookie per pack.',
    description: 'Fat Pack-exclusive Purple parallels.',
  },
];

async function main() {
  console.log(`Seeding ${configs.length} box configurations\n`);

  // First, verify all product IDs exist
  const productIds = [...new Set(configs.map(c => c.product_id))];
  const { data: existing } = await supabase
    .from('products')
    .select('id, name, sport, year')
    .in('id', productIds);

  const existingIds = new Set((existing || []).map(p => p.id));
  const missing = productIds.filter(id => !existingIds.has(id));

  if (missing.length > 0) {
    console.error('Missing product IDs:', missing);
    console.error('Run seed-all-products.mjs first.');
    process.exit(1);
  }

  console.log(`All ${productIds.length} product IDs verified.\n`);

  // Show what we're seeding
  for (const p of existing) {
    const count = configs.filter(c => c.product_id === p.id).length;
    console.log(`  ${p.sport} ${p.year} ${p.name}: ${count} box type(s)`);
  }

  if (DRY_RUN) {
    console.log('\nDRY RUN — no changes made.');
    return;
  }

  // Use pg directly to bypass RLS
  await pgClient.connect();

  let success = 0;
  let errors = 0;
  for (const cfg of configs) {
    const cols = Object.keys(cfg);
    const vals = Object.values(cfg);
    const placeholders = vals.map((_, i) => `$${i + 1}`).join(', ');
    const updates = cols.filter(c => c !== 'product_id' && c !== 'config_type')
      .map(c => `${c} = EXCLUDED.${c}`).join(', ');

    const sql = `INSERT INTO box_configurations (${cols.join(', ')})
      VALUES (${placeholders})
      ON CONFLICT (product_id, config_type) DO UPDATE SET ${updates}`;

    try {
      await pgClient.query(sql, vals);
      success++;
    } catch (err) {
      const p = existing.find(p => p.id === cfg.product_id);
      console.error(`  ERROR: ${p?.name} ${cfg.config_type}: ${err.message}`);
      errors++;
    }
  }

  await pgClient.end();
  console.log(`\nDone: ${success} upserted, ${errors} errors`);

  // Final count
  const { count } = await supabase
    .from('box_configurations')
    .select('*', { count: 'exact', head: true });
  console.log(`Total box configurations in DB: ${count}`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
