#!/usr/bin/env node

/**
 * Topps.com Product Scraper — Pure HTTP version
 *
 * Uses sitemaps to discover ALL product URLs, then fetches each product page
 * with a browser-like User-Agent. No browser automation needed — Cloudflare
 * passes standard HTTP requests with the right headers.
 *
 * Data is saved to:
 *   1. JSON files in data/topps/ (raw archive, resume-safe)
 *   2. Supabase topps_products table (via import-topps.mjs)
 *
 * Usage:
 *   node scripts/scrape-topps.mjs                    # full scrape (sitemap + all products)
 *   node scripts/scrape-topps.mjs --test             # sitemap + 5 product pages only
 *   node scripts/scrape-topps.mjs --details-only     # skip sitemap, scrape from saved handles
 *   node scripts/scrape-topps.mjs --no-db            # skip Supabase upload
 *   node scripts/scrape-topps.mjs --delay=800        # ms between product page fetches (default: 600)
 *   node scripts/scrape-topps.mjs --concurrency=3    # parallel product page fetches (default: 3)
 *   node scripts/scrape-topps.mjs --upload            # upload to Supabase after scraping
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import * as cheerio from 'cheerio';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DATA_DIR = resolve(ROOT, 'data', 'topps');

// ── Load .env.local ──────────────────────────────────────────
const envPath = resolve(ROOT, '.env.local');
const env = {};
if (existsSync(envPath)) {
  readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
    const m = line.match(/^([^#=][^=]*)=(.*)/);
    if (m) env[m[1].trim()] = m[2].trim();
  });
}

// ── CLI args ─────────────────────────────────────────────────
const args = Object.fromEntries(
  process.argv.slice(2)
    .filter(a => a.startsWith('--'))
    .map(a => { const [k, v] = a.slice(2).split('='); return [k, v || 'true']; })
);

const TEST_MODE = args.test === 'true';
const DETAILS_ONLY = args['details-only'] === 'true';
const UPLOAD = args.upload === 'true';
const DELAY_MS = parseInt(args.delay || '600');
const CONCURRENCY = parseInt(args.concurrency || '3');

const BASE_URL = 'https://www.topps.com';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

// ── Ensure data directory ────────────────────────────────────
mkdirSync(DATA_DIR, { recursive: true });

// ── Supabase client (optional) ───────────────────────────────
let supabase = null;
if (UPLOAD && env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  const { createClient } = await import('@supabase/supabase-js');
  supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

// ── HTTP helpers ─────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function httpGet(url, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Use curl to bypass Cloudflare TLS fingerprinting (Node.js fetch gets 403)
      const text = execSync(
        `curl -s -L --max-time 30 -H "User-Agent: ${UA}" -H "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" -H "Accept-Language: en-US,en;q=0.9" "${url}"`,
        { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
      );
      if (!text || text.length < 100) throw new Error('Empty response');
      // Detect actual CF challenge pages (not just the normal CF script inclusion)
      if (text.includes('cf-turnstile') && text.includes('Just a moment')) {
        throw new Error('CF challenge');
      }
      return text;
    } catch (err) {
      if (attempt === retries) throw err;
      const backoff = DELAY_MS * attempt * 2;
      process.stdout.write(`    Retry ${attempt}/${retries} (${err.message}), waiting ${backoff}ms...\n`);
      await sleep(backoff);
    }
  }
}

// ── Phase 1: Collect handles from sitemaps ────────────────────

async function collectHandlesFromSitemap() {
  console.log('=== Phase 1: Collecting product handles from sitemaps ===\n');

  const handlesFile = resolve(DATA_DIR, 'product-handles.json');

  // Load existing
  let allHandles = new Set();
  if (existsSync(handlesFile)) {
    const existing = JSON.parse(readFileSync(handlesFile, 'utf-8'));
    existing.forEach(h => allHandles.add(h));
    console.log(`  Loaded ${allHandles.size} existing handles from cache\n`);
  }

  // Step 1: Fetch sitemap index
  console.log('  Fetching sitemap index...');
  const indexXml = await httpGet(`${BASE_URL}/products/sitemap.xml`);

  // Extract sub-sitemap URLs
  const sitemapUrls = [];
  const locRe = /<loc>([^<]+)<\/loc>/g;
  let m;
  while ((m = locRe.exec(indexXml)) !== null) {
    if (m[1].includes('/sitemap/')) sitemapUrls.push(m[1]);
  }

  console.log(`  Found ${sitemapUrls.length} sub-sitemaps\n`);

  // Step 2: Fetch each sub-sitemap
  let fetched = 0;
  let cfBlocked = 0;
  const startTime = Date.now();

  for (let i = 0; i < sitemapUrls.length; i++) {
    try {
      const xml = await httpGet(sitemapUrls[i]);
      const urlRe = /<loc>([^<]+)<\/loc>/g;
      let um;
      while ((um = urlRe.exec(xml)) !== null) {
        const hm = um[1].match(/\/products\/([^<\s?#/]+)$/);
        if (hm) allHandles.add(decodeURIComponent(hm[1]));
      }
      fetched++;
    } catch (e) {
      if (e.message === 'CF challenge') cfBlocked++;
      else process.stdout.write(`    Sitemap ${i}: ${e.message}\n`);
    }

    // Progress every 25 sitemaps
    if ((i + 1) % 25 === 0 || i === sitemapUrls.length - 1) {
      const pct = ((i + 1) / sitemapUrls.length * 100).toFixed(0);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
      process.stdout.write(`  [${i + 1}/${sitemapUrls.length}] ${pct}% | ${allHandles.size} handles | ${elapsed}s\r`);
    }

    // Save checkpoint every 100
    if ((i + 1) % 100 === 0) {
      writeFileSync(handlesFile, JSON.stringify([...allHandles], null, 2));
    }

    await sleep(100); // polite delay between sitemaps
  }

  const handles = [...allHandles];
  writeFileSync(handlesFile, JSON.stringify(handles, null, 2));

  console.log(`\n\n  Phase 1 complete: ${handles.length} unique handles from ${fetched} sitemaps`);
  if (cfBlocked > 0) console.log(`  (${cfBlocked} sitemaps blocked by CF)`);
  console.log(`  Saved to: ${handlesFile}\n`);

  return handles;
}

// ── Phase 2: Scrape product detail pages ─────────────────────

function parseProductPage(html, handle) {
  const $ = cheerio.load(html);
  const p = { handle };

  // Title
  p.title = $('meta[property="og:title"]').attr('content')
    || $('title').text().replace(/\s*[|–-]\s*Topps.*$/i, '').trim() || '';

  // Shopify data attributes
  const productEl = $('[data-product-id]').first();
  if (productEl.length) {
    p.shopify_product_id = productEl.attr('data-product-id') || null;
    p.sku = productEl.attr('data-product-sku') || null;
    p.category = productEl.attr('data-product-category') || null;
    p.sport = productEl.attr('data-product-sub-category') || null;
  }

  // OG meta
  p.og_description = $('meta[property="og:description"]').attr('content')?.trim() || '';
  p.image_url = $('meta[property="og:image"]').attr('content') || null;
  p.product_url = $('meta[property="og:url"]').attr('content') || `${BASE_URL}/products/${handle}`;

  // PDF links
  p.checklist_pdf_url = null;
  p.odds_pdf_url = null;
  $('a[href*=".pdf"]').each((_, el) => {
    const href = $(el).attr('href');
    const text = $(el).text().toLowerCase();
    if (text.includes('checklist')) p.checklist_pdf_url = href;
    else if (text.includes('odd')) p.odds_pdf_url = href;
  });

  // Specs from dt/dd and th/td pairs (human-readable keys)
  p.specs = {};
  $('dt, th').each((_, el) => {
    const key = $(el).text().trim();
    const val = $(el).next('dd, td').text().trim();
    if (key && val && key.length < 40) p.specs[key] = val;
  });

  // Body text for text-based extraction
  const bodyText = $('body').text();

  // Overview
  const ovM = bodyText.match(/Overview\s*\n([\s\S]*?)(?=Description|$)/i);
  p.overview = ovM ? ovM[1].trim().replace(/\s+/g, ' ') : '';

  // Description
  const descM = bodyText.match(/Description\s*\n([\s\S]*?)(?=Specs|Products|$)/i);
  p.description = descM ? descM[1].trim().replace(/\s+/g, ' ') : '';

  // Derived fields from specs
  p.product_year = p.specs['Product Year'] || p.specs['product_year'] || null;
  p.brand = p.specs['Brand'] || p.specs['brand'] || 'Topps';
  p.sub_brand = p.specs['Sub Brand'] || p.specs['sub_brand'] || null;
  p.product_type = p.specs['Product Type'] || p.specs['Sub Type'] || p.specs['product_type'] || p.category || null;
  p.available_from = p.specs['Available From'] || p.specs['street_date_value'] || null;
  if (!p.sport) p.sport = p.specs['Sub Categories'] || p.specs['category'] || null;
  if (!p.sku) p.sku = p.specs['SKU'] || null;

  // Pack configuration
  p.packs_per_box = null;
  p.cards_per_pack = null;
  p.guaranteed_hits = null;
  const cfg = p.overview || p.og_description || p.description || '';
  const pkM = cfg.match(/(\d+)\s*packs?\s*per\s*box/i);
  if (pkM) p.packs_per_box = parseInt(pkM[1]);
  const cdM = cfg.match(/(\d+)\s*cards?\s*per\s*pack/i);
  if (cdM) p.cards_per_pack = parseInt(cdM[1]);
  const htM = cfg.match(/(\d+\s*(?:autograph|auto|relic|memorabilia|hit|signature|patch|jersey)[^!.]*[!.]?)/i);
  if (htM) p.guaranteed_hits = htM[1].trim();

  // Stock & price
  p.in_stock = !(bodyText.includes('Out of Stock') || bodyText.includes('Sold Out') || bodyText.includes('SOLD OUT'));
  p.price_usd = null;
  const prM = bodyText.match(/\$(\d+(?:\.\d{2})?)/);
  if (prM) { const v = parseFloat(prM[1]); if (v >= 1 && v <= 50000) p.price_usd = v; }

  return p;
}

async function scrapeProductDetails(handles) {
  console.log('=== Phase 2: Scraping product details ===\n');

  const productsFile = resolve(DATA_DIR, 'products.json');
  const errorsFile = resolve(DATA_DIR, 'errors.json');

  // Load existing (resume support)
  let products = {};
  if (existsSync(productsFile)) {
    const existing = JSON.parse(readFileSync(productsFile, 'utf-8'));
    if (Array.isArray(existing)) existing.forEach(p => { products[p.handle] = p; });
    else products = existing;
    console.log(`  Loaded ${Object.keys(products).length} existing products from cache\n`);
  }

  let errors = [];
  if (existsSync(errorsFile)) errors = JSON.parse(readFileSync(errorsFile, 'utf-8'));

  let todo = handles.filter(h => !products[h]);
  if (TEST_MODE) todo = todo.slice(0, 5);

  console.log(`  ${handles.length} total handles, ${Object.keys(products).length} cached, ${todo.length} remaining`);
  console.log(`  Concurrency: ${CONCURRENCY}, Delay: ${DELAY_MS}ms\n`);

  if (todo.length === 0) {
    console.log('  Nothing to scrape — all products already cached.\n');
    return Object.values(products);
  }

  const startTime = Date.now();
  let completed = 0;
  let failed = 0;

  // Process in batches for concurrency
  for (let i = 0; i < todo.length; i += CONCURRENCY) {
    const batch = todo.slice(i, i + CONCURRENCY);

    const results = await Promise.allSettled(
      batch.map(async handle => {
        const url = `${BASE_URL}/products/${encodeURIComponent(handle)}`;
        const html = await httpGet(url);
        return { handle, product: parseProductPage(html, handle) };
      })
    );

    for (const result of results) {
      if (result.status === 'fulfilled') {
        products[result.value.handle] = result.value.product;
        completed++;
      } else {
        const handle = batch[results.indexOf(result)] || 'unknown';
        errors.push({ handle, error: result.reason?.message, time: new Date().toISOString() });
        failed++;
      }
    }

    // Progress
    const total = completed + failed;
    const pct = ((total / todo.length) * 100).toFixed(1);
    const elapsed = (Date.now() - startTime) / 1000;
    const rate = elapsed > 1 ? (total / (elapsed / 60)).toFixed(1) : '...';
    const etaMin = rate !== '...' ? ((todo.length - total) / parseFloat(rate)).toFixed(0) : '...';
    process.stdout.write(`  [${total}/${todo.length}] ${pct}% | ${rate}/min | ETA ~${etaMin}min | ok:${completed} fail:${failed}\r`);

    // Save every 50 products
    if (total % 50 === 0 || i + CONCURRENCY >= todo.length) {
      writeFileSync(productsFile, JSON.stringify(Object.values(products), null, 2));
      if (errors.length > 0) writeFileSync(errorsFile, JSON.stringify(errors, null, 2));
    }

    await sleep(DELAY_MS);
  }

  // Final save
  const allProducts = Object.values(products);
  writeFileSync(productsFile, JSON.stringify(allProducts, null, 2));
  if (errors.length > 0) writeFileSync(errorsFile, JSON.stringify(errors, null, 2));

  const totalTime = ((Date.now() - startTime) / 60000).toFixed(1);
  console.log(`\n\n  Completed: ${completed}, Failed: ${failed} (${totalTime} min)`);
  console.log(`  Total products: ${allProducts.length}`);
  console.log(`  Saved to: ${productsFile}\n`);

  return allProducts;
}

// ── Phase 3: Upload to Supabase ──────────────────────────────

function parseDate(str) {
  if (!str) return null;
  try { const d = new Date(str); return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0]; }
  catch { return null; }
}

async function uploadToSupabase(products) {
  if (!supabase) {
    console.log('  Skipping Supabase upload (use --upload flag or run import-topps.mjs separately)\n');
    return;
  }

  console.log('=== Phase 3: Uploading to Supabase ===\n');

  let upserted = 0, failed = 0;
  const BATCH = 50;

  for (let i = 0; i < products.length; i += BATCH) {
    const batch = products.slice(i, i + BATCH);
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

    const { error } = await supabase.from('topps_products').upsert(rows, { onConflict: 'handle' });
    if (error) { console.log(`  Batch error: ${error.message}`); failed += batch.length; }
    else { upserted += batch.length; process.stdout.write(`  Uploaded ${upserted}/${products.length}\r`); }
  }

  console.log(`\n  Upserted: ${upserted}, Failed: ${failed}\n`);
}

// ── Summary ──────────────────────────────────────────────────

function printSummary(products) {
  console.log('=== Summary ===\n');
  console.log(`  Total products: ${products.length}`);

  const group = (arr, fn) => {
    const map = {};
    arr.forEach(p => { const k = fn(p) || 'Unknown'; map[k] = (map[k] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  };

  console.log('\n  By sport:');
  group(products, p => p.sport).forEach(([k, v]) => console.log(`    ${k.padEnd(20)} ${v}`));

  console.log('\n  By category:');
  group(products, p => p.category).forEach(([k, v]) => console.log(`    ${k.padEnd(20)} ${v}`));

  console.log('\n  By brand (top 10):');
  group(products, p => p.brand).slice(0, 10).forEach(([k, v]) => console.log(`    ${k.padEnd(20)} ${v}`));

  console.log('\n  By sub-brand (top 15):');
  group(products, p => p.sub_brand).slice(0, 15).forEach(([k, v]) => console.log(`    ${k.padEnd(30)} ${v}`));

  console.log('\n  By year (top 10):');
  group(products, p => p.product_year).slice(0, 10).forEach(([k, v]) => console.log(`    ${k.padEnd(10)} ${v}`));

  const ct = fn => products.filter(fn).length;
  console.log(`\n  With checklist PDF: ${ct(p => p.checklist_pdf_url)}`);
  console.log(`  With odds PDF:     ${ct(p => p.odds_pdf_url)}`);
  console.log(`  With packs/box:    ${ct(p => p.packs_per_box)}`);
  console.log(`  With cards/pack:   ${ct(p => p.cards_per_pack)}`);
  console.log(`  With price:        ${ct(p => p.price_usd)}`);
  console.log(`  In stock:          ${ct(p => p.in_stock)}`);
  console.log('');
}

// ── Main ─────────────────────────────────────────────────────

async function main() {
  console.log('SlabStreet Topps.com Scraper (HTTP mode)\n');
  console.log(`  Mode:        ${TEST_MODE ? 'TEST (5 products)' : 'FULL'}`);
  console.log(`  Delay:       ${DELAY_MS}ms`);
  console.log(`  Concurrency: ${CONCURRENCY}`);
  console.log(`  Database:    ${supabase ? 'Supabase' : 'JSON only'}`);
  console.log(`  Data dir:    ${DATA_DIR}`);
  console.log('');

  let handles;

  if (DETAILS_ONLY) {
    const handlesFile = resolve(DATA_DIR, 'product-handles.json');
    if (!existsSync(handlesFile)) {
      console.error('No product-handles.json found. Run without --details-only first.');
      process.exit(1);
    }
    handles = JSON.parse(readFileSync(handlesFile, 'utf-8'));
    console.log(`  Loaded ${handles.length} handles from cache\n`);
  } else {
    handles = await collectHandlesFromSitemap();
    // Cool down after hitting 426 sitemaps to avoid CF rate limiting
    console.log('  Cooling down 10s before Phase 2...\n');
    await sleep(10000);
  }

  const products = await scrapeProductDetails(handles);
  if (UPLOAD) await uploadToSupabase(products);
  printSummary(products);

  console.log('Done!');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
