#!/usr/bin/env node

/**
 * Import Topps product data from JSON (scraped by topps-scraper.html) into Supabase.
 *
 * Usage:
 *   node scripts/import-topps.mjs <path-to-json>
 *   node scripts/import-topps.mjs data/topps/topps-products-2026-03-12.json
 *   node scripts/import-topps.mjs --dry-run data/topps/products.json
 *
 * The JSON file should be an array of product objects from the browser scraper.
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// Load .env.local
const envPath = resolve(ROOT, '.env.local');
const env = {};
if (existsSync(envPath)) {
  readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
    const m = line.match(/^([^#=][^=]*)=(.*)/);
    if (m) env[m[1].trim()] = m[2].trim();
  });
}

const DRY_RUN = process.argv.includes('--dry-run');
const jsonPath = process.argv.find(a => a.endsWith('.json'));

if (!jsonPath) {
  console.error('Usage: node scripts/import-topps.mjs <products.json>');
  process.exit(1);
}

const fullPath = resolve(ROOT, jsonPath);
if (!existsSync(fullPath)) {
  console.error(`File not found: ${fullPath}`);
  process.exit(1);
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

function parseDate(str) {
  if (!str) return null;
  try {
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
  } catch { return null; }
}

async function main() {
  const raw = JSON.parse(readFileSync(fullPath, 'utf-8'));
  const products = Array.isArray(raw) ? raw : Object.values(raw);

  console.log(`Topps Import: ${products.length} products from ${jsonPath}\n`);

  // Summary
  const bySport = {};
  const byCat = {};
  products.forEach(p => {
    const sport = p.sport || 'Unknown';
    const cat = p.category || 'Unknown';
    bySport[sport] = (bySport[sport] || 0) + 1;
    byCat[cat] = (byCat[cat] || 0) + 1;
  });

  console.log('By sport:', JSON.stringify(bySport));
  console.log('By category:', JSON.stringify(byCat));

  const withChecklist = products.filter(p => p.checklist_pdf_url).length;
  const withOdds = products.filter(p => p.odds_pdf_url).length;
  console.log(`\nWith checklist PDF: ${withChecklist}`);
  console.log(`With odds PDF: ${withOdds}`);
  console.log(`With pack config: ${products.filter(p => p.packs_per_box).length}\n`);

  if (DRY_RUN) {
    console.log('DRY RUN — no data written to Supabase.\n');
    console.log('Sample product:', JSON.stringify(products[0], null, 2));
    return;
  }

  // Upsert to Supabase in batches
  let upserted = 0, failed = 0;
  const BATCH_SIZE = 50;

  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    const rows = batch.map(p => ({
      handle: p.handle,
      title: p.title || '',
      shopify_product_id: p.shopify_product_id || null,
      sku: p.sku || null,
      sport: p.sport || null,
      category: p.category || null,
      product_type: p.product_type || null,
      product_year: p.product_year || null,
      brand: p.brand || 'Topps',
      sub_brand: p.sub_brand || null,
      description: p.description || null,
      overview: p.overview || null,
      packs_per_box: p.packs_per_box || null,
      cards_per_pack: p.cards_per_pack || null,
      guaranteed_hits: p.guaranteed_hits || null,
      price_usd: p.price_usd || null,
      available_from: parseDate(p.available_from),
      in_stock: p.in_stock ?? false,
      image_url: p.image_url || null,
      checklist_pdf_url: p.checklist_pdf_url || null,
      odds_pdf_url: p.odds_pdf_url || null,
      specs: p.specs || {},
      product_url: p.product_url || null,
      scraped_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('topps_products')
      .upsert(rows, { onConflict: 'handle' });

    if (error) {
      console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1} error: ${error.message}`);
      failed += batch.length;
    } else {
      upserted += batch.length;
      process.stdout.write(`  Uploaded ${upserted}/${products.length}\r`);
    }
  }

  console.log(`\n\nDone! Upserted: ${upserted}, Failed: ${failed}`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
