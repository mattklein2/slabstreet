#!/usr/bin/env node

/**
 * Scrapes SportCardsPro for structured card market data and stores
 * it in Supabase. Much richer data than eBay scraping — prices by
 * grade, price history, pop reports, and sold listings.
 *
 * Usage:
 *   node scripts/scrape-sportscardspro.mjs                           # all leagues, top 50/league
 *   node scripts/scrape-sportscardspro.mjs --league=NBA              # NBA only
 *   node scripts/scrape-sportscardspro.mjs --player=victor-wembanyama
 *   node scripts/scrape-sportscardspro.mjs --limit=10                # top 10/league
 *   node scripts/scrape-sportscardspro.mjs --detail=0                # search only, no detail pages
 *   node scripts/scrape-sportscardspro.mjs --detail=5                # 5 detail pages per player
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { chromium } from 'playwright';

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
const LIMIT_PER_LEAGUE = parseInt(args.limit || '50');
const DETAIL_COUNT = parseInt(args.detail ?? '3');

// ── Helpers ──────────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function tierFromPrice(price) {
  if (price >= 200) return 'RARE';
  if (price >= 50) return 'MID';
  return 'COMMON';
}

function parsePrice(str) {
  if (!str || str === 'N/A' || str === '--' || str === '-') return 0;
  return parseFloat(str.replace(/[^0-9.]/g, '')) || 0;
}

function formatPrice(num) {
  return num > 0 ? `$${num.toFixed(2)}` : '';
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

// ── Level 1: Scrape search results page ──────────────────────
async function scrapeSearchResults(page, playerName) {
  const query = encodeURIComponent(playerName);
  const url = `https://www.sportscardspro.com/search-products?q=${query}&type=prices`;

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('table', { timeout: 10000 }).catch(() => null);
    await sleep(1500);

    const playerNameLower = playerName.toLowerCase();
    const cards = await page.evaluate((playerNameLower) => {
      const results = [];
      const rows = document.querySelectorAll('tbody tr, table tr');

      // Helper: parse set + card from URL slug
      // e.g. "/game/basketball-cards-2023-panini-prizm/victor-wembanyama-silver-136"
      //   → set: "2023 Panini Prizm", card: "Victor Wembanyama [Silver] #136"
      function parseDetailUrl(href) {
        const parts = href.replace(/^.*\/game\//, '').split('/');
        const setSlug = parts[0] || '';
        const cardSlug = parts[1] || '';

        // Parse set: remove sport prefix, extract year + set name
        let set = '';
        const setMatch = setSlug.match(/(?:basketball|football|baseball|hockey|racing|soccer)-cards?-(.+)/);
        if (setMatch) {
          set = setMatch[1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        }

        // Parse card name from slug: last segment is usually card number
        let cardName = cardSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        // Extract card number (trailing digits) and add # prefix
        const numMatch = cardSlug.match(/-(\d+)$/);
        if (numMatch) {
          const num = numMatch[1];
          const prefix = cardSlug.slice(0, -(num.length + 1));
          cardName = prefix.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) + ' #' + num;
        }

        return { set, cardName };
      }

      for (const row of rows) {
        const titleLink = row.querySelector('a[href*="/game/"]');
        if (!titleLink) continue;

        const setLink = row.querySelector('a[href*="/console/"]');
        const tds = row.querySelectorAll('td');

        const detailUrl = titleLink.getAttribute('href') || titleLink.href;
        const setText = setLink ? setLink.textContent.trim() : '';

        // Extract name: try link text first, then parse from URL
        let displayName = titleLink.textContent.trim();
        const { set: urlSet, cardName: urlCardName } = parseDetailUrl(detailUrl);

        // Build a clean short name from the URL (removes player name, keeps variant + number)
        // e.g. "victor-wembanyama-silver-136" → "[Silver] #136"
        let shortName = '';
        if (urlCardName) {
          // Remove player name parts from card name to get just the variant info
          const playerParts = playerNameLower.split(' ');
          let variant = urlCardName;
          for (const part of playerParts) {
            const regex = new RegExp('\\b' + part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
            variant = variant.replace(regex, '').trim();
          }
          variant = variant.replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ').trim();
          if (variant) {
            // Add brackets for parallel/variant names
            const numMatch = variant.match(/^(.+?)#(\d+)$/);
            if (numMatch && numMatch[1].trim()) {
              shortName = `[${numMatch[1].trim()}] #${numMatch[2]}`;
            } else {
              shortName = variant;
            }
          }
        }

        // Build full display name: "2023 Prizm [Silver] #136"
        const set = urlSet || setText;
        const name = set ? `${set}${shortName ? ' ' + shortName : ''}` : (displayName || urlCardName);

        // Extract price columns
        const prices = [];
        for (const td of tds) {
          const text = td.textContent.trim();
          if (text.startsWith('$')) prices.push(text);
        }

        // prices[0] = Ungraded, prices[1] = Grade 9, prices[2] = PSA 10
        const priceUngraded = prices[0] || '';
        const priceGrade9 = prices[1] || '';
        const pricePSA10 = prices[2] || '';

        if (name && (priceUngraded || priceGrade9 || pricePSA10)) {
          results.push({
            name,
            shortName: name,
            set,
            detailUrl,
            priceUngraded,
            priceGrade9,
            pricePSA10,
          });
        }

        if (results.length >= 50) break;
      }

      return results;
    }, playerNameLower);

    return cards;
  } catch (err) {
    console.error(`    Search error for ${playerName}: ${err.message}`);
    return [];
  }
}

// ── Level 2: Scrape card detail page ─────────────────────────
async function scrapeDetailPage(page, cardUrl, cardName) {
  try {
    const fullUrl = cardUrl.startsWith('http') ? cardUrl : `https://www.sportscardspro.com${cardUrl}`;
    await page.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Wait for Highcharts to load
    await page.waitForFunction(
      () => typeof Highcharts !== 'undefined' && Highcharts.charts && Highcharts.charts.filter(Boolean).length > 0,
      { timeout: 8000 }
    ).catch(() => null);
    await sleep(2000);

    const detail = await page.evaluate((name) => {
      const result = {
        change: '',
        up: true,
        pop: '',
        sales: [],
        prices: {},
      };

      // ── Extract data from Highcharts ──
      try {
        if (typeof Highcharts !== 'undefined') {
          const charts = Highcharts.charts.filter(Boolean);

          for (const chart of charts) {
            const seriesNames = chart.series.map(s => s.name);

            // Pop report chart: has "PSA" and "CGC" series (grade numbers on x-axis)
            if (seriesNames.includes('PSA') && seriesNames.includes('CGC')) {
              // Sum grade 10 pops from both PSA and CGC
              let totalPop10 = 0;
              for (const s of chart.series) {
                for (const p of s.data) {
                  const grade = String(p.category || p.x);
                  if (grade === '10' && p.y > 0) {
                    totalPop10 += p.y;
                  }
                }
              }
              if (totalPop10 > 0) {
                result.pop = totalPop10.toLocaleString();
              }
              continue;
            }

            // Price chart: has series like "Ungraded", "7", "8", "9", "BGS 9.5", "PSA 10"
            if (seriesNames.includes('Ungraded') || seriesNames.includes('PSA 10')) {
              // Get PSA 10 price change (or highest available grade)
              const targetSeries = chart.series.find(s => s.name === 'PSA 10')
                || chart.series.find(s => s.name === 'BGS 9.5')
                || chart.series.find(s => s.name === '9');

              if (targetSeries && targetSeries.data.length >= 2) {
                const last = targetSeries.data[targetSeries.data.length - 1];
                const prev = targetSeries.data[targetSeries.data.length - 2];
                if (last?.y != null && prev?.y != null) {
                  const diff = last.y - prev.y;
                  result.change = (diff >= 0 ? '+' : '-') + '$' + Math.abs(diff).toFixed(2);
                  result.up = diff >= 0;
                }
              }

              // Current prices for all grades
              for (const s of chart.series) {
                if (s.data.length > 0) {
                  const lastPoint = s.data[s.data.length - 1];
                  if (lastPoint?.y != null) {
                    result.prices[s.name] = lastPoint.y;
                  }
                }
              }
            }
          }
        }
      } catch (e) { /* Highcharts extraction failed, continue */ }

      // ── Detect active grade tab ──
      let activeGrade = 'Ungraded';
      try {
        const tabs = document.querySelectorAll('li.active a, .tab.active, [class*="tab"][class*="active"]');
        for (const tab of tabs) {
          const text = tab.textContent.trim();
          if (text.includes('PSA 10')) { activeGrade = 'PSA 10'; break; }
          if (text.includes('Grade 9')) { activeGrade = 'Grade 9'; break; }
          if (text.includes('Grade 8')) { activeGrade = 'Grade 8'; break; }
          if (text.includes('Ungraded')) { activeGrade = 'Ungraded'; break; }
        }
      } catch (e) {}

      // ── Extract sold listings from table ──
      try {
        const tables = document.querySelectorAll('table');
        for (const table of tables) {
          const headers = table.querySelectorAll('th');
          let hasSaleDate = false;
          for (const h of headers) {
            if (h.textContent.includes('Sale Date')) { hasSaleDate = true; break; }
          }
          if (!hasSaleDate) continue;

          const rows = table.querySelectorAll('tr');
          for (const row of rows) {
            const cells = [...row.querySelectorAll('td')].map(c => c.innerText?.trim());
            if (cells.length < 3) continue;
            const dateStr = cells[0];
            if (!dateStr || !dateStr.match(/^\d{4}-\d{2}-\d{2}/)) continue;

            // cells[0] = date, cells[1] = TW (optional), cells[2] = title, cells[3] = price
            const title = cells.find((c, i) => i > 0 && c.length > 20) || '';
            const priceCell = cells.find(c => c.startsWith('$'));
            const price = priceCell || '';

            if (price) {
              result.sales.push({
                card: name,
                grade: activeGrade,
                price,
                date: dateStr,
              });
            }

            if (result.sales.length >= 10) break;
          }
          break; // Only process first matching table
        }
      } catch (e) { /* Sales extraction failed */ }

      return result;
    }, cardName);

    return detail;
  } catch (err) {
    console.error(`      Detail error for ${cardName}: ${err.message}`);
    return null;
  }
}

// ── Build cards[] and sales[] from scraped data ──────────────
function processResults(searchResults, detailDataMap) {
  if (searchResults.length === 0) return { cards: [], sales: [] };

  // Build cards array — pick best grade per card, sort by price desc
  const cardsList = searchResults.map(r => {
    const psa10 = parsePrice(r.pricePSA10);
    const g9 = parsePrice(r.priceGrade9);
    const raw = parsePrice(r.priceUngraded);

    // Pick the best available grade
    let price, grade;
    if (psa10 > 0) { price = psa10; grade = 'PSA 10'; }
    else if (g9 > 0) { price = g9; grade = 'Grade 9'; }
    else if (raw > 0) { price = raw; grade = 'Ungraded'; }
    else return null;

    const detail = detailDataMap.get(r.detailUrl);

    return {
      name: r.shortName,
      grade,
      pop: detail?.pop || '',
      tier: tierFromPrice(price),
      price: formatPrice(price),
      change: detail?.change || '',
      up: detail?.up ?? true,
    };
  }).filter(Boolean);

  // Sort by price descending, take top 8
  cardsList.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
  const cards = cardsList.slice(0, 8);

  // Build sales array from detail pages
  const allSales = [];
  for (const [, detail] of detailDataMap) {
    if (detail?.sales) allSales.push(...detail.sales);
  }

  // Sort by date descending, take top 10
  allSales.sort((a, b) => b.date.localeCompare(a.date));
  const sales = allSales.slice(0, 10);

  return { cards, sales };
}

// ── Main ─────────────────────────────────────────────────────
async function main() {
  console.log('SlabStreet SportCardsPro Scraper\n');

  // 1. Get target players
  console.log('Fetching target players...');
  const players = await getTargetPlayers();
  console.log(`  ${players.length} players to scrape`);
  console.log(`  Detail pages per player: ${DETAIL_COUNT}\n`);

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
      // Level 1: Search results
      const searchResults = await scrapeSearchResults(page, player.name);

      if (searchResults.length === 0) {
        console.log('  0 cards — skipped');
        skip++;
        await sleep(2000);
        continue;
      }

      // Level 2: Detail pages for top N cards
      const detailDataMap = new Map();
      if (DETAIL_COUNT > 0) {
        // Sort by PSA 10 price desc, take top N
        const topCards = [...searchResults]
          .sort((a, b) => parsePrice(b.pricePSA10) - parsePrice(a.pricePSA10))
          .slice(0, DETAIL_COUNT);

        for (const card of topCards) {
          const detail = await scrapeDetailPage(page, card.detailUrl, card.shortName);
          if (detail) detailDataMap.set(card.detailUrl, detail);
          await sleep(3000);
        }
      }

      // Process into cards[] + sales[]
      const { cards, sales } = processResults(searchResults, detailDataMap);

      if (cards.length === 0) {
        console.log(`  ${searchResults.length} found, 0 valid — skipped`);
        skip++;
        await sleep(2000);
        continue;
      }

      // Write to Supabase
      const { error } = await supabase
        .from('players')
        .update({ sales, cards })
        .eq('slug', player.slug);

      if (error) {
        console.log(`  ERROR: ${error.message}`);
        fail++;
      } else {
        console.log(`  ${cards.length} cards, ${sales.length} sales — saved`);
        ok++;
      }
    } catch (err) {
      console.log(`  FAIL: ${err.message}`);
      fail++;
    }

    // Rate limiting
    await sleep(2000);

    // Batch pause
    if ((i + 1) % BATCH_SIZE === 0 && i + 1 < players.length) {
      console.log(`  --- batch pause (7s) ---`);
      await sleep(7000);
    }
  }

  // 4. Cleanup
  await browser.close();

  console.log(`\nDone! ${ok} updated, ${skip} skipped, ${fail} failed.`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
