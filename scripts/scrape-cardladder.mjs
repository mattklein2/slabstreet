#!/usr/bin/env node

/**
 * Scrapes CardLadder player data (index, sales volume, market cap, cards)
 * and stores structured data in Supabase.
 *
 * Requires a CardLadder Pro account.
 *
 * Usage:
 *   node scripts/scrape-cardladder.mjs                      # all leagues, top 20 per league
 *   node scripts/scrape-cardladder.mjs --league=NBA         # NBA only
 *   node scripts/scrape-cardladder.mjs --player=victor-wembanyama  # single player
 *   node scripts/scrape-cardladder.mjs --limit=5            # top 5 per league
 *   node scripts/scrape-cardladder.mjs --cards              # also scrape individual card details
 *
 * Environment variables (in .env.local):
 *   CARDLADDER_EMAIL     - CardLadder account email
 *   CARDLADDER_PASSWORD  - CardLadder account password
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
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
const LIMIT_PER_LEAGUE = parseInt(args.limit || '20');
const SCRAPE_CARDS = args.cards === 'true';

// ── Helpers ──────────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function parsePrice(text) {
  if (!text) return 0;
  const cleaned = text.replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
}

function parseGrowth(text) {
  if (!text) return null;
  const match = text.match(/([+-]?\d+\.?\d*)%?/);
  return match ? parseFloat(match[1]) : null;
}

function parseLargeNumber(text) {
  if (!text) return 0;
  const match = text.match(/([\d,.]+)\s*(k|m|b)?/i);
  if (!match) return parsePrice(text);
  let num = parseFloat(match[1].replace(/,/g, ''));
  const suffix = (match[2] || '').toLowerCase();
  if (suffix === 'k') num *= 1000;
  else if (suffix === 'm') num *= 1000000;
  else if (suffix === 'b') num *= 1000000000;
  return num;
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

// ── Login to CardLadder ──────────────────────────────────────
async function loginToCardLadder(page) {
  const email = env.CARDLADDER_EMAIL;
  const password = env.CARDLADDER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'Missing CARDLADDER_EMAIL and/or CARDLADDER_PASSWORD in .env.local\n' +
      'Add them to .env.local:\n' +
      '  CARDLADDER_EMAIL=your@email.com\n' +
      '  CARDLADDER_PASSWORD=yourpassword'
    );
  }

  console.log('  Navigating to login page...');
  await page.goto('https://app.cardladder.com/login', {
    waitUntil: 'networkidle',
    timeout: 30000,
  });

  // Wait for login form to render
  await page.waitForSelector('input[type="email"], input[type="text"]', { timeout: 10000 });
  await sleep(1000);

  // Fill email
  const emailInput = await page.$('input[type="email"]') || await page.$('input[type="text"]');
  if (!emailInput) throw new Error('Could not find email input on login page');
  await emailInput.fill(email);

  // Fill password
  const passwordInput = await page.$('input[type="password"]');
  if (!passwordInput) throw new Error('Could not find password input on login page');
  await passwordInput.fill(password);

  // Click login button
  const loginBtn = await page.$('button[type="submit"]');
  if (!loginBtn) throw new Error('Could not find login button');
  await loginBtn.click();

  // Wait for navigation to dashboard or player page
  console.log('  Waiting for login to complete...');
  await page.waitForURL('**/dashboard**', { timeout: 30000 }).catch(() => {});
  await sleep(2000);

  // Verify we're logged in by checking for sidebar nav
  const sidebar = await page.$('text=PLAYERS').catch(() => null);
  if (!sidebar) {
    // Try alternative: check if we're still on login page
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      throw new Error('Login failed — still on login page. Check credentials.');
    }
  }

  console.log('  Logged in successfully!\n');
}

// ── Scrape player STATS tab (index data + sales volume) ──────
async function scrapePlayerStats(page, playerName) {
  const encodedName = encodeURIComponent(playerName);
  const url = `https://app.cardladder.com/players/${encodedName}`;

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(2000);

    // Check if player was found
    const notFound = await page.$('text=Player not found').catch(() => null);
    if (notFound) return null;

    // Make sure we're on the STATS tab
    const statsTab = await page.$('button:has-text("Stats")');
    if (statsTab) {
      await statsTab.click();
      await sleep(1000);
    }

    // Extract all data from the page
    const stats = await page.evaluate(() => {
      const result = {
        index: {},
        salesVolume: {},
      };

      // Helper: find text near a label
      function findValueNear(labelText) {
        const allElements = document.querySelectorAll('*');
        for (const el of allElements) {
          if (el.children.length === 0 && el.textContent.trim() === labelText) {
            // Look at next sibling or parent's next child
            const parent = el.parentElement;
            if (parent) {
              const children = [...parent.children];
              const idx = children.indexOf(el);
              if (idx >= 0 && idx + 1 < children.length) {
                return children[idx + 1].textContent.trim();
              }
            }
            // Also check next sibling
            const next = el.nextElementSibling;
            if (next) return next.textContent.trim();
          }
        }
        return null;
      }

      // Grab all the key-value pairs from the stats section
      // The page structure uses pairs of elements: label then value
      const textPairs = [
        // Index Data
        ['Starting Value', 'startingValue'],
        ['Current Value', 'currentValue'],
        ['Rate of Growth', 'rateOfGrowth'],
        ['Real Value Change', 'realValueChange'],
        ['Low Value', 'lowValue'],
        ['High Value', 'highValue'],
        ['Average Value', 'averageValue'],
        ['Total Cards', 'totalCards'],
        // Sales Volume
        ['Low Daily Volume', 'lowDailyVolume'],
        ['High Daily Volume', 'highDailyVolume'],
        ['Average Daily Volume', 'avgDailyVolume'],
        ['# of Sales 24H', 'sales24h'],
        ['Market Cap', 'marketCap'],
      ];

      for (const [label, key] of textPairs) {
        const val = findValueNear(label);
        if (val) {
          // Store in appropriate section
          if (['startingValue', 'currentValue', 'rateOfGrowth', 'realValueChange',
               'lowValue', 'highValue', 'averageValue', 'totalCards'].includes(key)) {
            result.index[key] = val;
          } else {
            result.salesVolume[key] = val;
          }
        }
      }

      return result;
    });

    return stats;
  } catch (err) {
    console.error(`    Error scraping stats for ${playerName}: ${err.message}`);
    return null;
  }
}

// ── Scrape player CARDS tab ──────────────────────────────────
async function scrapePlayerCards(page, playerName) {
  try {
    // Click CARDS tab
    const cardsTab = await page.$('button:has-text("Cards")');
    if (!cardsTab) {
      console.log('    No CARDS tab found');
      return [];
    }

    await cardsTab.click();
    await sleep(2000);

    // Extract cards list
    const cards = await page.evaluate(() => {
      const results = [];

      // Cards are listed as rows — each row contains:
      // image, year+set, name+number, tags (parallel, grade), Last Sold, Value, Score
      // We look for repeating patterns of card data

      // Strategy: find all elements that look like card rows
      // The card rows are direct children of the cards container
      // Each has: set info, card name, grade badge, last sold, value, score

      // Try to get structured data from the card list
      // Look for elements that contain "Last Sold" text pattern
      const allText = document.body.innerText;

      // Find card entries by looking for pattern: Year Set, Name #Number
      // with Last Sold and Value columns
      const rows = document.querySelectorAll('[class*="card"], [class*="row"], [class*="list"] > div, [class*="item"]');

      for (const row of rows) {
        const text = row.textContent || '';

        // Must have a year (19xx or 20xx) and price ($)
        if (!/\b(?:19|20)\d{2}\b/.test(text)) continue;
        if (!/\$/.test(text)) continue;
        // Skip very short or very long text blocks
        if (text.length < 20 || text.length > 500) continue;

        // Extract data from the row text
        const yearMatch = text.match(/\b((?:19|20)\d{2})\s+(.+?)(?=Victor|#|\n)/i);
        const nameMatch = text.match(/#(\w+)/);
        const gradeMatch = text.match(/\b(PSA|BGS|SGC|CGC)\s*(\d+\.?\d*)/i);
        const rawMatch = text.match(/\bRaw\b/i);
        const priceMatches = text.match(/\$[\d,.]+k?/gi) || [];
        const scoreMatch = text.match(/(\d+\.\d+)\s*$/);

        // Need at least a price to be useful
        if (priceMatches.length === 0) continue;

        // Detect parallel (Base, Silver, Gold, Pink Ice, etc.)
        const parallelMatch = text.match(/\b(Base|Silver|Gold|Green|Blue|Red|Orange|Pink Ice|Pink|Purple|Black|White|Shimmer|Cracked Ice|Mojo|Hyper|Camo|Tie-Dye|Holo|Rainbow|Refractor|Xfractor|Wave|Disco|Scope)\b/i);

        const card = {
          year: yearMatch ? yearMatch[1] : '',
          set: yearMatch ? yearMatch[2].trim() : '',
          cardNumber: nameMatch ? nameMatch[1] : '',
          parallel: parallelMatch ? parallelMatch[1] : 'Base',
          grade: gradeMatch ? `${gradeMatch[1].toUpperCase()} ${gradeMatch[2]}` : (rawMatch ? 'Raw' : ''),
          lastSold: priceMatches[0] || '',
          clValue: priceMatches.length > 1 ? priceMatches[1] : priceMatches[0] || '',
          score: scoreMatch ? parseFloat(scoreMatch[1]) : null,
        };

        // Dedup: skip if we already have this exact card
        const key = `${card.year}|${card.set}|${card.cardNumber}|${card.grade}`;
        if (!results.find(r => `${r.year}|${r.set}|${r.cardNumber}|${r.grade}` === key)) {
          results.push(card);
        }

        if (results.length >= 20) break;
      }

      return results;
    });

    return cards;
  } catch (err) {
    console.error(`    Error scraping cards for ${playerName}: ${err.message}`);
    return [];
  }
}

// ── Alternative: scrape cards using accessibility tree ────────
async function scrapePlayerCardsAlt(page, playerName) {
  try {
    // Click CARDS tab
    const cardsTab = await page.$('button:has-text("Cards")');
    if (!cardsTab) return [];

    await cardsTab.click();
    await sleep(2500);

    // Use a more targeted approach: look for the card list items
    // Each card row in CardLadder has a specific structure
    const cards = await page.evaluate(() => {
      const results = [];

      // Get all anchor/link elements that point to /card/ pages
      const cardLinks = document.querySelectorAll('a[href*="/card/"]');

      for (const link of cardLinks) {
        // Get the parent row container
        const row = link.closest('div[class]') || link.parentElement?.parentElement;
        if (!row) continue;

        const rowText = row.textContent || '';

        // Skip navigation links, etc.
        if (rowText.length < 15 || rowText.length > 500) continue;

        // Extract cardId from the link
        const cardIdMatch = link.href.match(/\/card\/([a-zA-Z0-9]+)/);
        const cardId = cardIdMatch ? cardIdMatch[1] : '';

        // Parse the row for data points
        const yearMatch = rowText.match(/\b((?:19|20)\d{2})\b/);
        const priceMatches = rowText.match(/\$[\d,.]+k?/gi) || [];
        const gradeMatch = rowText.match(/\b(PSA|BGS|SGC|CGC)\s*(\d+\.?\d*)/i);
        const rawMatch = rowText.match(/\bRaw\b/i);
        const scoreMatch = rowText.match(/(\d+\.\d+)\s*$/);

        // Extract set name: text between the year and the player name
        let set = '';
        if (yearMatch) {
          const afterYear = rowText.substring(rowText.indexOf(yearMatch[0]) + yearMatch[0].length).trim();
          // Set name is usually the text before the player's last name or card number
          const setMatch = afterYear.match(/^([A-Za-z\s()]+?)(?:Victor|#|\d+\.\d+)/i);
          if (setMatch) set = setMatch[1].trim();
        }

        const cardNumber = (rowText.match(/#(\w+)/) || [])[1] || '';

        // Detect parallel
        const parallelPatterns = ['Base', 'Silver', 'Gold', 'Green', 'Blue', 'Red', 'Orange',
          'Pink Ice', 'Pink', 'Purple', 'Black', 'White', 'Shimmer', 'Cracked Ice',
          'Mojo', 'Hyper', 'Camo', 'Tie-Dye', 'Holo', 'Rainbow', 'Refractor',
          'Xfractor', 'Wave', 'Disco', 'Scope', 'Sticker', 'Insert'];

        let parallel = 'Base';
        for (const p of parallelPatterns) {
          if (rowText.toLowerCase().includes(p.toLowerCase())) {
            parallel = p;
            break;
          }
        }

        const card = {
          cardId,
          year: yearMatch ? yearMatch[1] : '',
          set: set || '',
          cardNumber,
          parallel,
          grade: gradeMatch ? `${gradeMatch[1].toUpperCase()} ${gradeMatch[2]}` : (rawMatch ? 'Raw' : ''),
          lastSold: priceMatches[0] || '',
          clValue: priceMatches.length > 1 ? priceMatches[1] : priceMatches[0] || '',
          score: scoreMatch ? parseFloat(scoreMatch[1]) : null,
        };

        // Dedup
        if (card.cardId && !results.find(r => r.cardId === card.cardId)) {
          results.push(card);
        } else if (!card.cardId) {
          const key = `${card.year}|${card.set}|${card.cardNumber}|${card.grade}`;
          if (!results.find(r => `${r.year}|${r.set}|${r.cardNumber}|${r.grade}` === key)) {
            results.push(card);
          }
        }

        if (results.length >= 30) break;
      }

      return results;
    });

    return cards;
  } catch (err) {
    console.error(`    Error scraping cards (alt) for ${playerName}: ${err.message}`);
    return [];
  }
}

// ── Scrape individual card detail page ───────────────────────
async function scrapeCardDetail(page, cardId) {
  try {
    await page.goto(`https://app.cardladder.com/card/${cardId}`, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });
    await sleep(2000);

    const detail = await page.evaluate(() => {
      function findValue(labelText) {
        const allElements = document.querySelectorAll('*');
        for (const el of allElements) {
          if (el.children.length === 0 && el.textContent.trim() === labelText) {
            const parent = el.parentElement;
            if (parent) {
              const children = [...parent.children];
              const idx = children.indexOf(el);
              if (idx >= 0 && idx + 1 < children.length) {
                return children[idx + 1].textContent.trim();
              }
            }
            const next = el.nextElementSibling;
            if (next) return next.textContent.trim();
          }
        }
        return null;
      }

      return {
        lastSoldPrice: findValue('Last Sold Price'),
        lastSoldDate: findValue('Last Sold Date'),
        clValue: findValue('CL Value'),
        pop: findValue('Pop'),
        marketCap: findValue('Market Cap'),
        rateOfGrowth: findValue('Rate of Growth'),
        realDollarChange: findValue('Real Dollar Change'),
        startingPrice: findValue('Starting Price'),
        currentPrice: findValue('Current Price'),
        numberOfSales: findValue('Number of Sales'),
        averagePrice: findValue('Average Price'),
        lowPrice: findValue('Low Price'),
        highPrice: findValue('High Price'),
      };
    });

    return detail;
  } catch (err) {
    console.error(`    Error scraping card ${cardId}: ${err.message}`);
    return null;
  }
}

// ── Build cardladder data object for Supabase ────────────────
function buildCardLadderData(stats, cards) {
  const now = new Date().toISOString();

  const data = {
    updatedAt: now,
  };

  // Index data
  if (stats?.index) {
    const idx = stats.index;
    data.indexValue = parseFloat(idx.currentValue) || null;
    data.indexStartingValue = parseFloat(idx.startingValue) || null;
    data.rateOfGrowth = idx.rateOfGrowth || null;
    data.realValueChange = idx.realValueChange || null;
    data.lowValue = parseFloat(idx.lowValue) || null;
    data.highValue = parseFloat(idx.highValue) || null;
    data.averageValue = parseFloat(idx.averageValue) || null;
    data.totalCards = parseInt(idx.totalCards) || null;
  }

  // Sales volume data
  if (stats?.salesVolume) {
    const sv = stats.salesVolume;
    data.marketCap = sv.marketCap || null;
    data.marketCapNum = parseLargeNumber(sv.marketCap) || null;
    data.sales24h = parseInt(sv.sales24h) || null;
    data.avgDailyVolume = sv.avgDailyVolume || null;
    data.avgDailyVolumeNum = parseLargeNumber(sv.avgDailyVolume) || null;
    data.lowDailyVolume = sv.lowDailyVolume || null;
    data.highDailyVolume = sv.highDailyVolume || null;
  }

  // Cards
  if (cards && cards.length > 0) {
    data.cards = cards.map(c => ({
      cardId: c.cardId || null,
      year: c.year || '',
      set: c.set || '',
      cardNumber: c.cardNumber || '',
      parallel: c.parallel || 'Base',
      grade: c.grade || '',
      lastSold: c.lastSold || '',
      clValue: c.clValue || '',
      score: c.score || null,
      // Card detail fields (filled if --cards flag used)
      pop: c.pop || null,
      marketCap: c.marketCap || null,
    }));
  }

  return data;
}

// ── Main ─────────────────────────────────────────────────────
async function main() {
  console.log('SlabStreet CardLadder Scraper\n');

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
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  console.log('  Browser ready\n');

  // 3. Login to CardLadder
  console.log('Logging into CardLadder...');
  await loginToCardLadder(page);

  // 4. Scrape each player
  let ok = 0, fail = 0, skip = 0;
  const BATCH_SIZE = 5;

  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    process.stdout.write(`  [${i + 1}/${players.length}] ${player.name.padEnd(28)} `);

    try {
      // Scrape player stats (index + sales volume)
      const stats = await scrapePlayerStats(page, player.name);

      if (!stats) {
        console.log('  not found — skipped');
        skip++;
        await sleep(1500);
        continue;
      }

      // Scrape player cards
      const cards = await scrapePlayerCardsAlt(page, player.name);

      // Optionally scrape individual card details
      if (SCRAPE_CARDS && cards.length > 0) {
        const topCards = cards.slice(0, 5); // Limit to top 5 for speed
        for (let j = 0; j < topCards.length; j++) {
          if (topCards[j].cardId) {
            process.stdout.write('.');
            const detail = await scrapeCardDetail(page, topCards[j].cardId);
            if (detail) {
              topCards[j].pop = detail.pop;
              topCards[j].marketCap = detail.marketCap;
              topCards[j].lastSoldPrice = detail.lastSoldPrice;
              topCards[j].lastSoldDate = detail.lastSoldDate;
              topCards[j].numberOfSales = detail.numberOfSales;
              topCards[j].rateOfGrowth = detail.rateOfGrowth;
            }
            await sleep(2000);
          }
        }
      }

      // Build structured data
      const cardladderData = buildCardLadderData(stats, cards);

      // Write to Supabase
      const { error } = await supabase
        .from('players')
        .update({ cardladder: cardladderData })
        .eq('slug', player.slug);

      if (error) {
        // If 'cardladder' column doesn't exist yet, show helpful error
        if (error.message.includes('cardladder')) {
          console.log(`  ERROR: 'cardladder' column not found in players table.`);
          console.log(`         Run this SQL in Supabase: ALTER TABLE players ADD COLUMN cardladder JSONB;`);
          await browser.close();
          process.exit(1);
        }
        console.log(`  ERROR: ${error.message}`);
        fail++;
      } else {
        const cardCount = cards.length;
        const mktCap = stats?.salesVolume?.marketCap || 'N/A';
        console.log(`  ${cardCount} cards, mktcap=${mktCap} — saved`);
        ok++;
      }
    } catch (err) {
      console.log(`  FAIL: ${err.message}`);
      fail++;
    }

    // Rate limiting — be respectful to CardLadder
    await sleep(3000);

    // Extra pause between batches
    if ((i + 1) % BATCH_SIZE === 0 && i + 1 < players.length) {
      console.log(`  --- batch pause (8s) ---`);
      await sleep(8000);
    }
  }

  // 5. Cleanup
  await browser.close();

  console.log(`\nDone! ${ok} updated, ${skip} skipped, ${fail} failed.`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
