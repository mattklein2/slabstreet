#!/usr/bin/env node

/**
 * Import Panini product data from JSON into Supabase.
 *
 * Usage:
 *   node scripts/import-panini.mjs data/panini/products.json
 *   node scripts/import-panini.mjs --dry-run data/panini/products.json
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
  console.error('Usage: node scripts/import-panini.mjs <products.json>');
  process.exit(1);
}

const fullPath = resolve(ROOT, jsonPath);
if (!existsSync(fullPath)) {
  console.error(`File not found: ${fullPath}`);
  process.exit(1);
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

function parseTimestamp(str) {
  if (!str) return null;
  try {
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d.toISOString();
  } catch { return null; }
}

async function main() {
  const raw = JSON.parse(readFileSync(fullPath, 'utf-8'));
  const products = Array.isArray(raw) ? raw : Object.values(raw);

  console.log(`Panini Import: ${products.length} products from ${jsonPath}\n`);

  // Summary
  const bySport = {};
  const bySubBrand = {};
  products.forEach(p => {
    const sport = p.sport || 'Unknown';
    const sb = p.sub_brand || 'None';
    bySport[sport] = (bySport[sport] || 0) + 1;
    bySubBrand[sb] = (bySubBrand[sb] || 0) + 1;
  });

  console.log('By sport:', JSON.stringify(bySport));
  console.log('By sub-brand:', JSON.stringify(bySubBrand));
  console.log(`With price: ${products.filter(p => p.price_usd).length}`);
  console.log(`In stock: ${products.filter(p => p.in_stock).length}`);
  console.log(`Coming soon: ${products.filter(p => p.coming_soon === '1' || p.coming_soon === true).length}\n`);

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
      panini_id: p.panini_id || null,
      sku: p.sku || null,
      name: p.name || '',
      url_key: p.url_key || null,
      sport: p.sport || null,
      product_type: p.product_type || null,
      product_year: p.product_year || null,
      brand: 'Panini',
      sub_brand: p.sub_brand || null,
      price_usd: p.price_usd || null,
      special_price: p.special_price || null,
      in_stock: p.in_stock ?? false,
      coming_soon: p.coming_soon === '1' || p.coming_soon === true,
      offer_start_date: parseTimestamp(p.offer_start_date),
      offer_end_date: parseTimestamp(p.offer_end_date),
      image_url: p.image_url || null,
      status: p.status || null,
      category_ids: p.category_ids || [],
      raw: p.raw || {},
      source_category: p.source_category || null,
      product_url: p.product_url || null,
      scraped_at: p.scraped_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('panini_products')
      .upsert(rows, { onConflict: 'sku' });

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
