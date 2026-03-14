#!/usr/bin/env node

/**
 * Seed soccer/football trading card products (2024-2025 seasons).
 * Sources: Beckett, Checklist Insider, Cardboard Connection, Soccer Cards HQ.
 *
 * Usage:
 *   node scripts/seed-soccer-products.mjs
 *   node scripts/seed-soccer-products.mjs --dry-run
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

// Brand IDs (already in DB)
const PANINI = 'b0000000-0000-0000-0000-000000000001';
const TOPPS = 'b0000000-0000-0000-0000-000000000002';

// Soccer product IDs — s0 prefix to avoid collisions with c0 series
// Using d0 prefix (for "decoder soccer") to keep separate from other sports
const products = [
  // ══════════════════════════════════════════════════════════════════
  // TOPPS UEFA Products (2024-25)
  // ══════════════════════════════════════════════════════════════════
  {
    id: 'd0000000-0000-0000-0000-000000000001',
    brand_id: TOPPS, name: 'Topps UEFA Club Competitions', sport: 'Soccer', year: '2024-25',
    is_flagship: true,
    description: 'The base Topps UEFA product. 200-card set covering Champions League, Europa League, and Conference League. Over 30 parallels per card including FlowFractor, Inferno, and Foil variants.',
    pros_cons: {
      pros: ['Affordable entry point for European soccer', 'Massive 30+ parallel rainbow', 'Covers all three UEFA competitions', 'Easy to find at retail'],
      cons: ['Non-chrome base cards', 'Base cards have low value', 'Parallels can be confusing for beginners'],
    },
  },
  {
    id: 'd0000000-0000-0000-0000-000000000002',
    brand_id: TOPPS, name: 'Topps Chrome UEFA Club Competitions', sport: 'Soccer', year: '2024-25',
    is_flagship: true,
    description: 'The premier chrome soccer product. 200-card base set with 40+ refractor parallels including Lava, Geometric, and Prism variants. The most collected European soccer product.',
    pros_cons: {
      pros: ['Best resale value in soccer cards', '40+ parallel variations per card', 'Chrome finish is premium', 'Strong rookie/prospect demand'],
      cons: ['Expensive hobby boxes', 'Overwhelming number of parallel types', 'Retail boxes have limited refractors'],
    },
  },
  {
    id: 'd0000000-0000-0000-0000-000000000003',
    brand_id: TOPPS, name: 'Topps Finest UEFA Club Competitions', sport: 'Soccer', year: '2024-25',
    is_flagship: false,
    description: 'Premium chrome product with 150-card base set and 17 refractor parallels. Hobby-only release with two autographs per box. Features Raywave and Prism refractor finishes.',
    pros_cons: {
      pros: ['Premium hobby-only product', 'Two autographs per box', 'Beautiful Raywave refractors', '185-player autograph checklist'],
      cons: ['Very expensive hobby boxes', 'Only 6 packs per box', 'Hobby-only limits availability'],
    },
  },
  {
    id: 'd0000000-0000-0000-0000-000000000004',
    brand_id: TOPPS, name: 'Topps Merlin UEFA Club Competitions', sport: 'Soccer', year: '2024-25',
    is_flagship: false,
    description: 'Chrome product with retro Merlin branding. 200-card base set with refractor parallels and Vintage Merlin exclusive variants. Blends modern chrome with nostalgic sticker-era design.',
    pros_cons: {
      pros: ['Nostalgic Merlin branding', 'Vintage Merlin exclusives /8', 'Atomic and Mojo refractors', 'Strong European collector base'],
      cons: ['Less prestige than Chrome UCC', 'Niche nostalgia appeal', 'Confusing product overlap with Chrome UCC'],
    },
  },
  {
    id: 'd0000000-0000-0000-0000-000000000005',
    brand_id: TOPPS, name: 'Topps Museum Collection UEFA Club Competitions', sport: 'Soccer', year: '2024-25',
    is_flagship: false,
    description: 'Ultra-premium product with 100-card base set. Every box includes autographs, memorabilia, and autographed relics. Gem-quality card stock with colored parallels.',
    pros_cons: {
      pros: ['Multiple hits per box guaranteed', 'Premium card stock and design', 'Autographed memorabilia cards', 'Low print run parallels'],
      cons: ['Very expensive ($300+ per box)', 'Only 8 cards per box', 'Small base set limits player coverage'],
    },
  },
  {
    id: 'd0000000-0000-0000-0000-000000000006',
    brand_id: TOPPS, name: 'Topps Knockout UEFA Club Competitions', sport: 'Soccer', year: '2024-25',
    is_flagship: false,
    description: 'Online-exclusive product focused on knockout stage stars. Six levels of numbered parallels with 1:2 chance for an autograph per box.',
    pros_cons: {
      pros: ['Every parallel is numbered', 'High auto odds (1:2 boxes)', 'Focused on star players', 'Affordable online-exclusive format'],
      cons: ['Online-only release', 'Small checklist', 'Limited parallel variety'],
    },
  },

  // ══════════════════════════════════════════════════════════════════
  // PANINI Premier League Products (2024-25)
  // ══════════════════════════════════════════════════════════════════
  {
    id: 'd0000000-0000-0000-0000-000000000010',
    brand_id: PANINI, name: 'Prizm Premier League', sport: 'Soccer', year: '2024-25',
    is_flagship: true,
    description: 'The flagship Premier League chrome product. 300-card base set with 50+ Prizm parallels including Silver, Mojo, Ice, Hyper, and Snakeskin variants. The final Panini EPL Prizm before Topps takes over.',
    pros_cons: {
      pros: ['Iconic Silver Prizm parallel', 'Massive 50+ parallel rainbow', 'Strong EPL rookie demand', 'Last Panini EPL Prizm ever (collectible)'],
      cons: ['Expensive hobby boxes', 'Confusing number of parallels', 'Retail hard to find', 'Panini losing EPL license adds uncertainty'],
    },
  },
  {
    id: 'd0000000-0000-0000-0000-000000000011',
    brand_id: PANINI, name: 'Select Premier League', sport: 'Soccer', year: '2024-25',
    is_flagship: false,
    description: 'Premium EPL product with three tiers: Terrace, Mezzanine, and Field Level. 250-card base set with chrome finish and extensive parallel rainbow including Tie-Dye and Zebra.',
    pros_cons: {
      pros: ['Three-tier card design looks great', 'Strong parallel variety', 'Three autos + memorabilia per hobby box', 'Field Level cards are premium chase'],
      cons: ['Very expensive hobby boxes', 'Tier system confusing for beginners', 'Last Panini EPL Select ever'],
    },
  },

  // ══════════════════════════════════════════════════════════════════
  // PANINI Global Soccer Products (2024-25)
  // ══════════════════════════════════════════════════════════════════
  {
    id: 'd0000000-0000-0000-0000-000000000020',
    brand_id: PANINI, name: 'Donruss Soccer', sport: 'Soccer', year: '2024-25',
    is_flagship: false,
    description: 'Global soccer product covering 20+ countries. 200-card base set with 25 Rated Rookies. Includes Optic chrome versions averaging six per hobby pack. Affordable entry point.',
    pros_cons: {
      pros: ['Affordable entry to soccer cards', 'Rated Rookies are collectible', 'Optic chrome parallels included', 'Broad international player coverage'],
      cons: ['No league license (no team logos)', 'Lower resale than Prizm', 'Base cards worth very little'],
    },
  },

  {
    id: 'd0000000-0000-0000-0000-000000000012',
    brand_id: PANINI, name: 'Select FIFA', sport: 'Soccer', year: '2024-25',
    is_flagship: false,
    description: 'Global soccer Select with FIFA license. Three-tier base with Pandora and Blue Lazer parallels not found in league-specific releases. Broad international roster.',
    pros_cons: {
      pros: ['FIFA license means official branding', 'Unique Pandora and Blue Lazer parallels', 'International player coverage', 'Three-tier Select design'],
      cons: ['Crowded Select market', 'Competes with league-specific Select', 'Hobby boxes are expensive'],
    },
  },

  // ══════════════════════════════════════════════════════════════════
  // Tournament / Event Products (2024-2025)
  // ══════════════════════════════════════════════════════════════════
  {
    id: 'd0000000-0000-0000-0000-000000000030',
    brand_id: TOPPS, name: 'Topps Chrome UEFA Euro 2024', sport: 'Soccer', year: '2024',
    is_flagship: false,
    description: 'Chrome product for UEFA Euro 2024 in Germany. 150-card checklist covering all 24 nations. Features Euro Debut notations and unique parallels like EURO Styleguide /24 and XI Refractor /11.',
    pros_cons: {
      pros: ['Commemorates major tournament', 'Unique tournament-specific parallels', 'National team cards are popular', 'Color Match refractors are creative'],
      cons: ['One-time event product', 'No club team cards', 'Limited long-term demand', 'Hobby-only product'],
    },
  },
  {
    id: 'd0000000-0000-0000-0000-000000000031',
    brand_id: PANINI, name: 'Prizm Copa America 2024', sport: 'Soccer', year: '2024',
    is_flagship: false,
    description: 'Prizm product for the 2024 Copa America tournament. 200-card base set with full Prizm rainbow including Stars and Stripes /24 parallel.',
    pros_cons: {
      pros: ['Major tournament product', 'Full Prizm rainbow', 'Stars and Stripes /24 is unique', 'South American stars featured'],
      cons: ['One-time event product', 'Less demand than Euro/World Cup', 'Limited long-term value'],
    },
  },
  {
    id: 'd0000000-0000-0000-0000-000000000032',
    brand_id: PANINI, name: 'Prizm FIFA Club World Cup', sport: 'Soccer', year: '2025',
    is_flagship: false,
    description: 'Prizm product for the inaugural expanded FIFA Club World Cup. 200-card base set with 40 Prizm parallels. Features top club players from around the world.',
    pros_cons: {
      pros: ['Historic first expanded Club World Cup', '40 different Prizm parallels', 'Mix of club and international stars', 'Five numbered parallels per hobby box'],
      cons: ['Inaugural tournament has unproven demand', 'Expensive hobby boxes', 'Large parallel count is overwhelming'],
    },
  },

  // ══════════════════════════════════════════════════════════════════
  // League-Specific Products (2024-25)
  // ══════════════════════════════════════════════════════════════════
  {
    id: 'd0000000-0000-0000-0000-000000000040',
    brand_id: TOPPS, name: 'Topps Chrome MLS', sport: 'Soccer', year: '2024',
    is_flagship: true,
    description: 'Chrome product for Major League Soccer. Features refractor parallels with Lava and Wave variants. Hobby boxes include exclusive Aqua Lava and Neon Green Lava refractors.',
    pros_cons: {
      pros: ['Only chrome MLS product', 'Hobby-exclusive Lava refractors', 'Growing MLS collector base', 'Multiple box formats (Hobby/Value/Mania)'],
      cons: ['Smaller collector market than EPL/UEFA', 'MLS cards have lower resale', 'Limited international appeal'],
    },
  },
  {
    id: 'd0000000-0000-0000-0000-000000000041',
    brand_id: TOPPS, name: 'Topps Chrome Bundesliga', sport: 'Soccer', year: '2024-25',
    is_flagship: false,
    description: 'Chrome product for the German Bundesliga. 100-card base set with refractor and Lava parallels. Covers top Bundesliga clubs and players.',
    pros_cons: {
      pros: ['Only Bundesliga chrome product', 'Clean 100-card set', 'Lava refractors are popular', 'German market collector demand'],
      cons: ['Smaller market than UEFA/EPL products', 'Limited box format options', 'Niche league appeal outside Germany'],
    },
  },
];

async function main() {
  console.log(`Adding ${products.length} soccer products\n`);

  if (DRY_RUN) {
    console.log('DRY RUN — no changes made.\n');
    for (const p of products) {
      console.log(`  ${p.year} ${p.name} (${p.is_flagship ? 'FLAGSHIP' : 'standard'})`);
    }
    console.log(`\n  Total: ${products.length}`);
    return;
  }

  // Upsert to avoid duplicates if re-run
  const BATCH_SIZE = 20;
  let inserted = 0;
  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('products').upsert(batch, { onConflict: 'id' });
    if (error) {
      console.error(`Batch error at ${i}:`, error.message);
    } else {
      inserted += batch.length;
    }
  }

  console.log(`Upserted ${inserted}/${products.length} products`);

  // Verify
  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('sport', 'Soccer');
  console.log(`Total soccer products in DB: ${count}`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
