#!/usr/bin/env node
/**
 * SlabStreet Panini Scraper
 *
 * Uses Playwright to navigate paniniamerica.net and intercept GraphQL responses.
 * The site is a React SPA behind Cloudflare that blocks direct API calls,
 * so we use a real browser and capture the network responses.
 *
 * Usage:
 *   node scripts/scrape-panini.mjs              # Scrape all categories
 *   node scripts/scrape-panini.mjs --test       # Scrape first category only
 *   node scripts/scrape-panini.mjs --checklist  # Also scrape checklist data
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

// ── Config ──────────────────────────────────────────────────────────────────
const DATA_DIR = path.join(process.cwd(), 'data', 'panini');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const CHECKLIST_FILE = path.join(DATA_DIR, 'checklists.json');
const DELAY_MS = 2000;
const PAGE_SIZE = 30;
const TEST_MODE = process.argv.includes('--test');
const SCRAPE_CHECKLISTS = process.argv.includes('--checklist');
const HEADLESS = !process.argv.includes('--visible');

const BASE_URL = 'https://www.paniniamerica.net';

// Category pages from the sitemap — each has a category_id for the GraphQL API
const CATEGORY_PAGES = [
  { path: '/cards/trading-cards.html', name: 'All Trading Cards' },
  { path: '/cards/trading-cards/football.html', name: 'Football' },
  { path: '/cards/trading-cards/basketball.html', name: 'Basketball' },
  { path: '/cards/trading-cards/baseball.html', name: 'Baseball' },
  { path: '/cards/trading-cards/soccer.html', name: 'Soccer' },
  { path: '/cards/trading-cards/fifa.html', name: 'FIFA' },
  { path: '/cards/trading-cards/golf.html', name: 'Golf' },
  { path: '/cards/trading-cards/mma.html', name: 'MMA/Fight' },
  { path: '/cards/trading-cards/racing.html', name: 'Racing' },
  { path: '/cards/trading-cards/hockey.html', name: 'Hockey' },
  { path: '/cards/trading-cards/entertainment.html', name: 'Entertainment' },
  { path: '/cards/trading-cards/wnba.html', name: 'WNBA' },
  { path: '/cards/1st-off-the-line.html', name: '1st Off The Line' },
];

// Checklist sports from the site
const CHECKLIST_SPORTS = [
  'Baseball', 'Basketball', 'Entertainment', 'Fight',
  'Football', 'Golf', 'Hockey', 'Racing', 'Soccer', 'UFC', 'WWE'
];

// ── Helpers ─────────────────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));

function loadExisting(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch { return []; }
}

function saveProducts(products) {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
  process.stdout.write(`  Saved ${products.length} products to ${PRODUCTS_FILE}\n`);
}

function parseProduct(item) {
  // Parse the GraphQL product item into our structured format
  const name = item.name || '';

  // Extract sport from name or category
  let sport = '';
  const sportPatterns = [
    [/\bNFL\b|\bFOOTBALL\b/i, 'Football'],
    [/\bNBA\b|\bBASKETBALL\b/i, 'Basketball'],
    [/\bWNBA\b/i, 'WNBA'],
    [/\bBASEBALL\b|\bMLB\b/i, 'Baseball'],
    [/\bSOCCER\b|\bFIFA\b|\bPREMIER LEAGUE\b|\bLIGA\b|\bEUROLEAGUE\b|\bSERIE A\b|\bK LEAGUE\b/i, 'Soccer'],
    [/\bHOCKEY\b|\bNHL\b/i, 'Hockey'],
    [/\bGOLF\b|\bLIV GOLF\b|\bPGA\b/i, 'Golf'],
    [/\bUFC\b|\bMMA\b|\bPFL\b/i, 'MMA/Fight'],
    [/\bRACING\b|\bNASCAR\b/i, 'Racing'],
    [/\bWWE\b/i, 'WWE'],
    [/\bSTARS & STRIPES\b|\bUSA\b/i, 'Baseball'], // USA Stars & Stripes is typically baseball
    [/\bCAITLIN CLARK\b/i, 'Basketball'],
    [/\bNIL\b|\bUNIVERSITY\b|\bOHIO STATE\b|\bTEXAS\b/i, 'College'],
  ];
  for (const [pattern, s] of sportPatterns) {
    if (pattern.test(name)) { sport = s; break; }
  }

  // Extract brand/sub-brand from name
  // Common Panini brands: Prizm, Select, Donruss, Optic, National Treasures, Obsidian, etc.
  let subBrand = '';
  const brandPatterns = [
    /PRIZM/i, /SELECT/i, /DONRUSS/i, /OPTIC/i, /NATIONAL TREASURES/i,
    /OBSIDIAN/i, /CONTENDERS/i, /CHRONICLES/i, /MOSAIC/i, /IMMACULATE/i,
    /FLAWLESS/i, /ONE/i, /NOIR/i, /SILHOUETTE/i, /SCORE/i, /PRESTIGE/i,
    /PHOENIX/i, /CERTIFIED/i, /ABSOLUTE/i, /CLASSICS/i, /ORIGINS/i,
    /LUMINANCE/i, /SIGNATURES SERIES/i, /PROSPECT EDITION/i,
  ];
  for (const pattern of brandPatterns) {
    const match = name.match(pattern);
    if (match) { subBrand = match[0].replace(/\b\w/g, c => c.toUpperCase()).replace(/\B\w+/g, c => c.toLowerCase()); break; }
  }

  // Extract product type from name
  let productType = '';
  if (/HOBBY/i.test(name)) productType = 'Hobby';
  else if (/BLASTER/i.test(name)) productType = 'Blaster';
  else if (/MEGA/i.test(name)) productType = 'Mega';
  else if (/HANGER/i.test(name)) productType = 'Hanger';
  else if (/FAT PACK/i.test(name)) productType = 'Fat Pack';
  else if (/CHOICE/i.test(name)) productType = 'Choice';
  else if (/H2/i.test(name)) productType = 'Hobby H2';
  else if (/DUTCH AUCTION/i.test(name)) productType = 'Dutch Auction';
  else if (/BOX SET/i.test(name)) productType = 'Box Set';
  else if (/CELLO/i.test(name)) productType = 'Cello';

  // Extract year from name
  const yearMatch = name.match(/(\d{4})(?:\s*[-–]\s*(\d{2,4}))?/);
  const productYear = yearMatch ? yearMatch[0] : '';

  // Image URL — add asset domain if relative
  let imageUrl = item.image || item.thumbnail || '';
  if (imageUrl && !imageUrl.startsWith('http')) {
    imageUrl = `https://assets.paniniamerica.net/catalog/product${imageUrl}`;
  }

  return {
    // Identity
    panini_id: item.id ? String(item.id) : null,
    sku: item.sku || null,
    name: name,
    url_key: item.url_key || null,

    // Classification
    sport,
    brand: 'Panini',
    sub_brand: subBrand,
    product_type: productType,
    product_year: productYear,

    // Pricing
    price_usd: item.price || item.final_price || null,
    special_price: item.special_price || null,

    // Availability
    in_stock: item.is_in_stock || false,
    coming_soon: item.pan_coming_soon || false,
    release_date: item.pan_release_date || null,
    offer_start_date: item.pan_offer_start_date || null,
    offer_end_date: item.pan_offer_end_date || null,

    // Media
    image_url: imageUrl,

    // Status
    status: item.status || null,

    // Category
    category_ids: item.category_ids || [],

    // Raw data for anything we missed
    raw: {
      reward_points: item.reward_points,
      type_id: item.type_id,
      pan_physical_gift: item.pan_physical_gift,
      is_promo_product: item.is_promo_product,
    },

    // Metadata
    product_url: item.url_key ? `${BASE_URL}/${item.url_key}.html` : null,
    scraped_at: new Date().toISOString(),
  };
}

// ── Main Scraper ────────────────────────────────────────────────────────────
async function scrapeProducts(page) {
  const allProducts = new Map(); // keyed by sku to deduplicate
  const categories = TEST_MODE ? CATEGORY_PAGES.slice(0, 2) : CATEGORY_PAGES;

  // Set up response interceptor for GraphQL
  const graphqlResponses = [];
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('/onepanini') && response.status() === 200) {
      try {
        const json = await response.json();
        graphqlResponses.push(json);
      } catch { /* not JSON */ }
    }
  });

  for (const category of categories) {
    process.stdout.write(`\n  Scraping: ${category.name} (${category.path})\n`);
    graphqlResponses.length = 0; // clear

    // Navigate to category page
    await page.goto(`${BASE_URL}${category.path}`, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Wait for React app to render and GraphQL to respond
    await page.waitForSelector('#root', { timeout: 10000 }).catch(() => {});
    await sleep(4000); // Give GraphQL time to respond

    // Check for GraphQL product responses
    let productsData = null;
    for (const resp of graphqlResponses) {
      if (resp?.data?.products?.items) {
        productsData = resp.data.products;
        break;
      }
    }

    if (!productsData) {
      // Check all captured responses for any product-like data
      for (const resp of graphqlResponses) {
        const keys = Object.keys(resp?.data || {});
        process.stdout.write(`    GraphQL response keys: ${keys.join(', ')}\n`);
      }
      process.stdout.write(`    No product data captured for ${category.name}\n`);
      continue;
    }

    const totalCount = productsData.total_count || productsData.totalCount || 0;
    const pageInfo = productsData.page_info || productsData.pageInfo || {};
    const items = productsData.items || [];
    const totalPages = pageInfo.total_pages || pageInfo.totalPages || Math.ceil(totalCount / PAGE_SIZE) || 0;
    process.stdout.write(`    Found ${totalCount} total (${totalPages} pages), ${items.length} in first page\n`);
    if (totalCount === 0 && items.length > 0) {
      process.stdout.write(`    (total_count=0 but got items — response keys: ${Object.keys(productsData).join(', ')})\n`);
    }

    // Parse and store products
    for (const item of items) {
      const product = parseProduct(item);
      product.source_category = category.name;
      if (product.sku) {
        allProducts.set(product.sku, product);
      } else if (product.panini_id) {
        allProducts.set(product.panini_id, product);
      }
    }

    // If there are more pages, scroll to load them (infinite scroll)
    // or click pagination. We detect by checking if we got exactly PAGE_SIZE items.
    const needsPaging = totalPages > 1 || (totalCount === 0 && items.length >= PAGE_SIZE);
    if (needsPaging) {
      const maxPages = totalPages || 20; // cap at 20 if unknown
      process.stdout.write(`    Paging through more results (max ${maxPages} pages)...\n`);

      for (let pg = 2; pg <= maxPages; pg++) {
        const prevCount = allProducts.size;
        graphqlResponses.length = 0;

        // Try scrolling to bottom to trigger infinite scroll
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await sleep(DELAY_MS);

        // Also try clicking "Load More" or pagination button if present
        const loadMore = page.locator('button:has-text("Load More"), button:has-text("Show More"), .load-more-btn, [class*="loadMore"]');
        if (await loadMore.count() > 0) {
          await loadMore.first().click().catch(() => {});
          await sleep(DELAY_MS);
        }

        // Collect new data
        let newItems = 0;
        for (const resp of graphqlResponses) {
          if (resp?.data?.products?.items) {
            for (const item of resp.data.products.items) {
              const product = parseProduct(item);
              product.source_category = category.name;
              const key = product.sku || product.panini_id;
              if (key && !allProducts.has(key)) {
                allProducts.set(key, product);
                newItems++;
              }
            }
          }
        }

        process.stdout.write(`    Page ${pg}: +${newItems} new (${allProducts.size} total)\n`);

        // Stop if no new items were added
        if (newItems === 0) {
          process.stdout.write(`    No new items — done paging this category\n`);
          break;
        }
      }
    }

    process.stdout.write(`    Running total: ${allProducts.size} unique products\n`);

    // Save incrementally
    saveProducts([...allProducts.values()]);
  }

  return [...allProducts.values()];
}

// ── Checklist Scraper ───────────────────────────────────────────────────────
async function scrapeChecklists(page) {
  process.stdout.write('\n=== Scraping Checklists ===\n');
  const allChecklists = loadExisting(CHECKLIST_FILE);
  const seenKeys = new Set(allChecklists.map(c => `${c.sport}-${c.year}-${c.brand}-${c.program}`));

  // Navigate to checklist page
  await page.goto(`${BASE_URL}/checklist.html`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(3000);

  // Set up response interceptor for checklist API
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('get-product-checklist') && response.status() === 200) {
      try {
        const json = await response.json();
        if (json.status === 200 && json.data) {
          const params = new URL(url).searchParams;
          const entry = {
            sport: params.get('sport'),
            year: params.get('year'),
            brand: params.get('brand'),
            program: params.get('program'),
            data: json.data,
            scraped_at: new Date().toISOString()
          };
          const key = `${entry.sport}-${entry.year}-${entry.brand}-${entry.program}`;
          if (!seenKeys.has(key)) {
            seenKeys.add(key);
            allChecklists.push(entry);
            fs.writeFileSync(CHECKLIST_FILE, JSON.stringify(allChecklists, null, 2));
            process.stdout.write(`    Saved checklist: ${key}\n`);
          }
        }
      } catch { /* not JSON */ }
    }
  });

  // Iterate through sports
  const sports = TEST_MODE ? CHECKLIST_SPORTS.slice(0, 2) : CHECKLIST_SPORTS;

  for (const sport of sports) {
    process.stdout.write(`\n  Sport: ${sport}\n`);

    // Click the Sport dropdown
    const sportDropdown = page.locator('.dropdown.btn-group.cst_collapse').first();
    await sportDropdown.locator('button').click();
    await sleep(500);

    // Select the sport
    const sportOption = sportDropdown.locator(`.dropdown-menu button:has-text("${sport}")`);
    if (await sportOption.count() === 0) {
      process.stdout.write(`    Sport "${sport}" not found in dropdown\n`);
      continue;
    }
    await sportOption.click();
    await sleep(2000);

    // Get years from the Year dropdown
    const yearDropdown = page.locator('.dropdown.btn-group.cst_collapse').nth(1);
    await yearDropdown.locator('button').click();
    await sleep(500);

    const yearButtons = yearDropdown.locator('.dropdown-menu button');
    const yearCount = await yearButtons.count();
    const years = [];
    for (let i = 0; i < yearCount; i++) {
      years.push(await yearButtons.nth(i).textContent());
    }
    process.stdout.write(`    Years: ${years.join(', ')}\n`);

    // Close year dropdown
    await yearDropdown.locator('button').first().click();
    await sleep(300);

    // Iterate through years
    for (const year of years) {
      if (!year || year.trim() === '') continue;
      process.stdout.write(`    Year: ${year.trim()}\n`);

      // Select year
      await yearDropdown.locator('button').first().click();
      await sleep(300);
      await yearDropdown.locator(`.dropdown-menu button:has-text("${year.trim()}")`).click();
      await sleep(1500);

      // Get brands
      const brandDropdown = page.locator('.dropdown.btn-group.cst_collapse').nth(2);
      await brandDropdown.locator('button').first().click();
      await sleep(500);

      const brandButtons = brandDropdown.locator('.dropdown-menu button');
      const brandCount = await brandButtons.count();
      const brands = [];
      for (let i = 0; i < brandCount; i++) {
        brands.push(await brandButtons.nth(i).textContent());
      }

      if (brands.length === 0) {
        process.stdout.write(`      No brands found\n`);
        continue;
      }
      process.stdout.write(`      Brands: ${brands.length} (${brands.slice(0, 3).join(', ')}...)\n`);

      // Close brand dropdown
      await brandDropdown.locator('button').first().click();
      await sleep(300);

      // For each brand, get programs and trigger checklist search
      for (const brand of brands) {
        if (!brand || brand.trim() === '') continue;

        await brandDropdown.locator('button').first().click();
        await sleep(300);
        await brandDropdown.locator(`.dropdown-menu button:has-text("${brand.trim()}")`).click();
        await sleep(1500);

        // Get programs
        const programDropdown = page.locator('.dropdown.btn-group.cst_collapse').nth(3);
        await programDropdown.locator('button').first().click();
        await sleep(500);

        const programButtons = programDropdown.locator('.dropdown-menu button');
        const programCount = await programButtons.count();
        const programs = [];
        for (let i = 0; i < programCount; i++) {
          programs.push(await programButtons.nth(i).textContent());
        }

        if (programs.length === 0) {
          process.stdout.write(`        No programs for ${brand.trim()}\n`);
          continue;
        }

        // Close program dropdown
        await programDropdown.locator('button').first().click();
        await sleep(300);

        for (const program of programs) {
          if (!program || program.trim() === '') continue;
          const key = `${sport}-${year.trim()}-${brand.trim()}-${program.trim()}`;
          if (seenKeys.has(key)) {
            process.stdout.write(`        Skip (cached): ${key}\n`);
            continue;
          }

          process.stdout.write(`        Fetching: ${key}\n`);
          await programDropdown.locator('button').first().click();
          await sleep(300);
          await programDropdown.locator(`.dropdown-menu button:has-text("${program.trim()}")`).click();
          await sleep(3000); // Wait for checklist API response
        }
      }
    }
  }

  process.stdout.write(`\n  Total checklists saved: ${allChecklists.length}\n`);
  return allChecklists;
}

// ── Entry Point ─────────────────────────────────────────────────────────────
async function main() {
  console.log('SlabStreet Panini Scraper (Playwright)\n');
  console.log(`  Mode:        ${TEST_MODE ? 'TEST' : 'FULL'}`);
  console.log(`  Headless:    ${HEADLESS}`);
  console.log(`  Checklists:  ${SCRAPE_CHECKLISTS}`);
  console.log(`  Data dir:    ${DATA_DIR}\n`);

  fs.mkdirSync(DATA_DIR, { recursive: true });

  // Launch browser
  const browser = await chromium.launch({
    headless: HEADLESS,
    channel: 'chrome',
    args: ['--disable-blink-features=AutomationControlled'],
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  try {
    // Phase 1: Scrape store products
    console.log('=== Phase 1: Scraping Store Products ===');
    const products = await scrapeProducts(page);
    console.log(`\n  Total products scraped: ${products.length}`);

    // Phase 2: Scrape checklists (optional)
    if (SCRAPE_CHECKLISTS) {
      console.log('\n=== Phase 2: Scraping Checklists ===');
      const checklists = await scrapeChecklists(page);
      console.log(`\n  Total checklists scraped: ${checklists.length}`);
    }

    console.log('\n=== Done ===');
    console.log(`  Products: ${PRODUCTS_FILE}`);
    if (SCRAPE_CHECKLISTS) {
      console.log(`  Checklists: ${CHECKLIST_FILE}`);
    }
  } catch (err) {
    console.error('Error:', err.message);
    // Save what we have
    const existing = loadExisting(PRODUCTS_FILE);
    if (existing.length > 0) {
      console.log(`  (${existing.length} products saved before error)`);
    }
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
