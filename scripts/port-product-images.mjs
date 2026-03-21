#!/usr/bin/env node

/**
 * Port image URLs from scraped topps_products / panini_products tables
 * into the main products.image_url column.
 *
 * Strategy: match by sub_brand + year + sport, pick the first available image.
 * For products without a scraped match, use hardcoded URLs from manufacturer sites.
 *
 * Usage:
 *   node scripts/port-product-images.mjs
 *   node scripts/port-product-images.mjs --dry-run
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

// Sport name mapping: our DB → scraped tables
const SPORT_MAP = {
  'NBA': 'Basketball',
  'NFL': 'Football',
  'MLB': 'Baseball',
  'NHL': 'Hockey',
};

// Hardcoded fallback images for current retail products
// These are official product images from manufacturer/retailer sites
const FALLBACK_IMAGES = {
  // NBA 2024-25
  'Prizm|NBA|2024-25': 'https://assets.paniniamerica.net/catalog/product/cache/a88e6041f65bef199b85e9b4da3d46f7/2/0/2024-25_prizm_bk_blaster-box_main.jpg',
  'Donruss|NBA|2024-25': 'https://assets.paniniamerica.net/catalog/product/cache/a88e6041f65bef199b85e9b4da3d46f7/2/0/2024-25_donruss_bk_blaster-box_main.jpg',
  'Hoops|NBA|2024-25': 'https://assets.paniniamerica.net/catalog/product/cache/a88e6041f65bef199b85e9b4da3d46f7/2/0/2024-25_nba-hoops_bk_blaster-box_main.jpg',
  'Select|NBA|2024-25': 'https://assets.paniniamerica.net/catalog/product/cache/a88e6041f65bef199b85e9b4da3d46f7/2/0/2024-25_select_bk_blaster-box_main.jpg',
  'Mosaic|NBA|2024-25': 'https://assets.paniniamerica.net/catalog/product/cache/a88e6041f65bef199b85e9b4da3d46f7/2/0/2024-25_mosaic_bk_blaster-box_main.jpg',
  'Court Kings|NBA|2024-25': 'https://assets.paniniamerica.net/catalog/product/cache/a88e6041f65bef199b85e9b4da3d46f7/2/0/2024-25_court-kings_bk_int-blaster-box_main.jpg',
  // NFL 2024
  'Prizm|NFL|2024': 'https://assets.paniniamerica.net/catalog/product/cache/a88e6041f65bef199b85e9b4da3d46f7/2/0/2024_prizm_fb_blaster-box_main.jpg',
  'Donruss|NFL|2024': 'https://assets.paniniamerica.net/catalog/product/cache/a88e6041f65bef199b85e9b4da3d46f7/2/0/2024_donruss_fb_blaster-box_main.jpg',
  'Mosaic|NFL|2024': 'https://assets.paniniamerica.net/catalog/product/cache/a88e6041f65bef199b85e9b4da3d46f7/2/0/2024_mosaic_fb_blaster-box_main.jpg',
  'Score|NFL|2024': 'https://assets.paniniamerica.net/catalog/product/cache/a88e6041f65bef199b85e9b4da3d46f7/2/0/2024_score_fb_blaster-box_main.jpg',
  // MLB 2025
  'Topps Series 1|MLB|2025': 'https://cdn.shopify.com/s/files/1/0662/9749/5709/files/2025-topps-series-1-baseball-blaster-box.jpg',
  'Topps Chrome|MLB|2024': 'https://cdn.shopify.com/s/files/1/0662/9749/5709/files/2024-topps-chrome-baseball-blaster-box.jpg',
  'Bowman|MLB|2025': 'https://cdn.shopify.com/s/files/1/0662/9749/5709/files/2025-bowman-baseball-blaster-box.jpg',
  'Topps Heritage|MLB|2025': 'https://cdn.shopify.com/s/files/1/0662/9749/5709/files/2025-topps-heritage-baseball-blaster-box.jpg',
};

async function main() {
  // 1. Get all products that need images
  const { data: products, error: pErr } = await supabase
    .from('products')
    .select('id, name, sport, year, brand_id, image_url')
    .is('image_url', null);

  if (pErr) { console.error('Failed to fetch products:', pErr.message); process.exit(1); }
  console.log(`${products.length} products need images\n`);

  // 2. Try to match from scraped Panini products
  const { data: paniniProducts } = await supabase
    .from('panini_products')
    .select('sub_brand, product_year, sport, image_url')
    .not('image_url', 'is', null);

  // 3. Try to match from scraped Topps products (from JSON file — too many for a query)
  let toppsImages = {};
  const toppsPath = resolve(ROOT, 'data/topps/products.json');
  if (existsSync(toppsPath)) {
    try {
      const toppsData = JSON.parse(readFileSync(toppsPath, 'utf-8'));
      for (const tp of toppsData) {
        if (tp.image_url && tp.sub_brand && tp.product_year) {
          const key = `${tp.sub_brand}|${tp.sport}|${tp.product_year}`;
          if (!toppsImages[key]) toppsImages[key] = tp.image_url;
        }
      }
      console.log(`Loaded ${Object.keys(toppsImages).length} Topps image mappings from JSON\n`);
    } catch (e) {
      console.log('Could not load Topps JSON, using fallbacks only\n');
    }
  }

  if (!DRY_RUN) await pgClient.connect();

  let updated = 0;
  let notFound = 0;

  for (const p of products) {
    let imageUrl = null;

    // Try fallback (most reliable — we curated these)
    const fallbackKey = `${p.name}|${p.sport}|${p.year}`;
    if (FALLBACK_IMAGES[fallbackKey]) {
      imageUrl = FALLBACK_IMAGES[fallbackKey];
    }

    // Try Panini match
    if (!imageUrl && paniniProducts) {
      const sportName = SPORT_MAP[p.sport] || p.sport;
      const match = paniniProducts.find(pp =>
        pp.sub_brand?.toLowerCase() === p.name.toLowerCase() &&
        pp.product_year === p.year &&
        pp.sport?.toLowerCase() === sportName.toLowerCase()
      );
      if (match) imageUrl = match.image_url;
    }

    // Try Topps match
    if (!imageUrl) {
      const sportName = SPORT_MAP[p.sport] || p.sport;
      // Try various key formats
      const keys = [
        `${p.name}|${sportName}|${p.year}`,
        `${p.name.replace('Topps ', '')}|${sportName}|${p.year}`,
      ];
      for (const key of keys) {
        if (toppsImages[key]) {
          imageUrl = toppsImages[key];
          break;
        }
      }
    }

    if (imageUrl) {
      if (!DRY_RUN) {
        try {
          await pgClient.query('UPDATE products SET image_url = $1 WHERE id = $2', [imageUrl, p.id]);
        } catch (err) {
          console.error(`  ERROR updating ${p.name}: ${err.message}`);
          continue;
        }
      }
      console.log(`  ✓ ${p.sport} ${p.year} ${p.name}`);
      updated++;
    } else {
      console.log(`  ✗ ${p.sport} ${p.year} ${p.name} — no image found`);
      notFound++;
    }
  }

  if (!DRY_RUN) await pgClient.end();
  console.log(`\n${DRY_RUN ? 'DRY RUN — ' : ''}Updated: ${updated}, Not found: ${notFound}`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
