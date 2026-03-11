#!/usr/bin/env node

/**
 * Scrapes eBay sold/completed listings for top players and stores
 * structured card sales data in Supabase.
 *
 * Usage:
 *   node scripts/scrape-ebay-sales.mjs                  # all leagues, top 20 per league
 *   node scripts/scrape-ebay-sales.mjs --league=NBA     # NBA only
 *   node scripts/scrape-ebay-sales.mjs --player=victor-wembanyama  # single player by slug
 *   node scripts/scrape-ebay-sales.mjs --limit=5        # top 5 per league
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { chromium } from 'playwright';
import { parseCardTitle, buildCardName, cardGroupKey } from './lib/parse-card-title.mjs';
import { generateCardSlug } from './lib/card-slug.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Load .env.local ──────────────────────────────────────────
const envPath = resolve(__dirname, '..', '.env.local');
const envLines = readFileSync(envPath, 'utf-8').split('\n');
const env = {};
for (const line of envLines) {
  const m = line.match(/^([^#=][^=]*)=(.*)/);
  if (m) env[m[1].trim()] = m[2].trim();
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// ── CLI args ─────────────────────────────────────────────────
const args = Object.fromEntries(
  process.argv.slice(2)
    .filter(a => a.startsWith('--'))
    .map(a => { const [k, v] = a.slice(2).split('='); return [k, v || 'true']; })
);

const LEAGUE_FILTER = args.league?.toUpperCase() || '';
const PLAYER_FILTER = args.player || '';
const LIMIT_PER_LEAGUE = parseInt(args.limit || '20');

// ── Sport keywords for search queries ────────────────────────
const SPORT_KEYWORDS = {
  NBA: 'basketball',
  NFL: 'football',
  MLB: 'baseball',
  NHL: 'hockey',
  WNBA: 'basketball',
  F1: 'racing',
};

// ── Helpers ──────────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function tierFromPrice(price) {
  if (price >= 200) return 'RARE';
  if (price >= 50) return 'MID';
  return 'COMMON';
}

// ── Fetch target players from Supabase ───────────────────────
async function getTargetPlayers() {
  if (PLAYER_FILTER) {
    const { data } = await supabase
      .from('players')
      .select('slug, name, league, team')
      .eq('slug', PLAYER_FILTER)
      .limit(1);
    return data || [];
  }

  const leagues = LEAGUE_FILTER ? [LEAGUE_FILTER] : ['NBA', 'NFL', 'MLB', 'NHL', 'WNBA', 'F1'];
  const all = [];

  for (const league of leagues) {
    const { data } = await supabase
      .from('players')
      .select('slug, name, league, team')
      .eq('league', league)
      .eq('active', true)
      .order('score', { ascending: false })
      .limit(LIMIT_PER_LEAGUE);
    if (data) all.push(...data);
  }

  return all;
}

// ── Scrape eBay sold listings for one player ─────────────────
async function scrapePlayer(page, player) {
  const sport = SPORT_KEYWORDS[player.league] || 'sports';
  const query = encodeURIComponent(`${player.name} ${sport} card PSA`);
  const url = `https://www.ebay.com/sch/i.html?_nkw=${query}&_sop=13&LH_Sold=1&LH_Complete=1&_sacat=261328`;

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Wait for results to render
    await page.waitForSelector('ul.srp-results', { timeout: 10000 }).catch(() => null);
    // Give dynamic content a moment to hydrate
    await sleep(1500);

    // Extract listings
    const listings = await page.evaluate(() => {
      const items = document.querySelectorAll('ul.srp-results > li');
      const results = [];

      for (const item of items) {
        const titleEl = item.querySelector('span.su-styled-text.primary');
        if (!titleEl) continue;
        const title = titleEl.textContent.trim();
        if (!title || title === 'Shop on eBay' || title === 'Results matching fewer words') continue;

        const priceEl = item.querySelector('span.s-card__price');
        const soldEl = item.querySelector('span.su-styled-text.positive.default');
        const bidsEl = item.querySelector('span.su-styled-text.secondary.large');
        const linkEl = item.querySelector('a[href*="itm/"]');

        const priceText = priceEl ? priceEl.textContent.trim() : '';
        const price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;

        // Parse sold date text like "Sold  Mar 9, 2026"
        const soldText = soldEl ? soldEl.textContent.trim() : '';
        const dateStr = soldText.replace(/^Sold\s+/i, '').trim();

        const bidsText = bidsEl ? bidsEl.textContent.trim() : '';
        const itemId = linkEl ? (linkEl.href.match(/itm\/(\d+)/) || [])[1] || '' : '';

        if (price > 0 && title.length > 10) {
          results.push({ title, price, dateStr, bidsText, itemId });
        }

        if (results.length >= 20) break;
      }
      return results;
    });

    return listings;
  } catch (err) {
    console.error(`    Error scraping ${player.name}: ${err.message}`);
    return [];
  }
}

// ── Build cards and sales arrays from scraped listings ────────
function processListings(listings, playerName) {
  // Filter out listings that don't seem related to this player
  const nameParts = playerName.toLowerCase().split(' ');
  const lastName = nameParts[nameParts.length - 1];

  const relevant = listings.filter(l => {
    const lower = l.title.toLowerCase();
    return lower.includes(lastName);
  });

  if (relevant.length === 0) return { sales: [], cards: [] };

  // Build sales array (most recent 10)
  const sales = relevant.slice(0, 10).map(l => {
    const parsed = parseCardTitle(l.title);
    return {
      card: buildCardName(parsed, l.title),
      grade: parsed?.grade || 'RAW',
      price: `$${l.price.toFixed(2)}`,
      date: l.dateStr || '',
      bids: l.bidsText || '',
      ebay_id: l.itemId || '',
    };
  });

  // Build cards array by grouping sales by card
  const groups = new Map();
  for (const l of relevant) {
    const parsed = parseCardTitle(l.title);
    const key = cardGroupKey(parsed);
    if (!groups.has(key)) {
      groups.set(key, { parsed, prices: [], name: buildCardName(parsed, l.title) });
    }
    groups.get(key).prices.push(l.price);
  }

  // Convert groups to cards array (top 8 by volume, then by price)
  const cards = [...groups.values()]
    .sort((a, b) => b.prices.length - a.prices.length || median(b.prices) - median(a.prices))
    .slice(0, 8)
    .map(g => {
      const med = median(g.prices);
      return {
        name: g.name,
        grade: g.parsed?.grade || 'RAW',
        pop: '',
        tier: tierFromPrice(med),
        price: `$${med.toFixed(2)}`,
        change: '',
        up: true,
      };
    });

  return { sales, cards };
}

// ── Write sales to normalized card_sales table ────────────────
async function writeToCardSales(listings, player) {
  let written = 0;
  for (const l of listings) {
    const parsed = parseCardTitle(l.title);
    if (!parsed || !parsed.year || !parsed.set) continue;

    const slug = generateCardSlug(
      player.slug,
      parsed.year,
      parsed.set,
      parsed.parallel || 'Base',
      parsed.cardNumber || ''
    );

    // Find or create the card
    let { data: card } = await supabase
      .from('cards')
      .select('id')
      .eq('slug', slug)
      .limit(1)
      .single();

    if (!card) {
      const { data: newCard, error: insertErr } = await supabase
        .from('cards')
        .insert({
          player_slug: player.slug,
          year: parseInt(parsed.year) || 0,
          set_name: parsed.set,
          parallel: parsed.parallel || 'Base',
          card_number: parsed.cardNumber || null,
          numbered_to: parsed.numbered || null,
          league: player.league,
          slug,
        })
        .select('id')
        .single();

      if (insertErr) continue; // skip if duplicate slug race
      card = newCard;
    }

    if (!card) continue;

    // Parse sold date
    let soldDate;
    try {
      soldDate = l.dateStr ? new Date(l.dateStr).toISOString() : new Date().toISOString();
    } catch {
      soldDate = new Date().toISOString();
    }

    const listingUrl = l.itemId ? `https://www.ebay.com/itm/${l.itemId}` : null;

    // Insert sale (skip on duplicate listing_url)
    const { error: saleErr } = await supabase
      .from('card_sales')
      .upsert({
        card_id: card.id,
        price: l.price,
        grade: parsed.grade || null,
        grader: parsed.grader || null,
        grade_number: parsed.gradeNum || null,
        sold_date: soldDate,
        platform: 'eBay',
        listing_url: listingUrl,
      }, { onConflict: 'listing_url', ignoreDuplicates: true });

    if (!saleErr) written++;
  }
  return written;
}

function median(arr) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// ── Main ─────────────────────────────────────────────────────
async function main() {
  console.log('SlabStreet eBay Sales Scraper\n');

  // 1. Get target players
  console.log('Fetching target players...');
  const players = await getTargetPlayers();
  console.log(`  ${players.length} players to scrape\n`);

  if (players.length === 0) {
    console.log('No players found. Check --league or --player args.');
    return;
  }

  // 2. Launch browser
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();
  console.log('  Browser ready\n');

  // 3. Scrape each player
  let ok = 0, fail = 0, skip = 0;
  const BATCH_SIZE = 10;

  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    process.stdout.write(`  [${i + 1}/${players.length}] ${player.name.padEnd(28)} `);

    try {
      const listings = await scrapePlayer(page, player);

      if (listings.length === 0) {
        console.log('  0 listings — skipped');
        skip++;
        await sleep(1000);
        continue;
      }

      // Process into cards + sales
      const { sales, cards } = processListings(listings, player.name);

      if (sales.length === 0) {
        console.log(`  ${listings.length} found, 0 relevant — skipped`);
        skip++;
        await sleep(1000);
        continue;
      }

      // Write to Supabase (players table — legacy JSONB columns)
      const { error } = await supabase
        .from('players')
        .update({ sales, cards })
        .eq('slug', player.slug);

      // Also write to normalized card_sales table
      const cardSalesWritten = await writeToCardSales(listings, player);

      if (error) {
        console.log(`  ERROR: ${error.message}`);
        fail++;
      } else {
        console.log(`  ${sales.length} sales, ${cards.length} cards, ${cardSalesWritten} card_sales — saved`);
        ok++;
      }
    } catch (err) {
      console.log(`  FAIL: ${err.message}`);
      fail++;
    }

    // Rate limiting
    await sleep(2000);

    // Extra pause between batches
    if ((i + 1) % BATCH_SIZE === 0 && i + 1 < players.length) {
      console.log(`  --- batch pause (5s) ---`);
      await sleep(5000);
    }
  }

  // 4. Cleanup
  await browser.close();

  console.log(`\nDone! ${ok} updated, ${skip} skipped, ${fail} failed.`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
