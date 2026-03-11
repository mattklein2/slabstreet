#!/usr/bin/env node

/**
 * Fetches CardLadder player data (index, sales volume, market cap, cards)
 * via the Firestore REST API and stores structured data in Supabase.
 *
 * Requires a CardLadder account (Free or Pro).
 *
 * Usage:
 *   node scripts/scrape-cardladder.mjs                      # all leagues, top 20 per league
 *   node scripts/scrape-cardladder.mjs --league=NBA         # NBA only
 *   node scripts/scrape-cardladder.mjs --player=victor-wembanyama  # single player
 *   node scripts/scrape-cardladder.mjs --limit=5            # top 5 per league
 *   node scripts/scrape-cardladder.mjs --cards              # also fetch individual card details
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

// ── Constants ────────────────────────────────────────────────
const FIREBASE_API_KEY = 'AIzaSyBqbxgaaGlpeb1F6HRvEW319OcuCsbkAHM';
const FIREBASE_PROJECT = 'cardladder-71d53';
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents`;

// Map our league IDs to CardLadder categories
const LEAGUE_TO_CATEGORY = {
  NBA: 'Basketball',
  NFL: 'Football',
  MLB: 'Baseball',
  NHL: 'Hockey',
  WNBA: 'Basketball',
  F1: 'Racing',
  MLS: 'Soccer',
  PGA: 'Golf',
};

// ── Helpers ──────────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/** Extract a simple JS value from a Firestore value object */
function fsVal(v) {
  if (!v) return null;
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return parseInt(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('timestampValue' in v) return v.timestampValue;
  if ('nullValue' in v) return null;
  if ('mapValue' in v) {
    const result = {};
    for (const [k, val] of Object.entries(v.mapValue.fields || {})) {
      result[k] = fsVal(val);
    }
    return result;
  }
  if ('arrayValue' in v) {
    return (v.arrayValue.values || []).map(fsVal);
  }
  return null;
}

function formatMoney(num) {
  if (!num && num !== 0) return null;
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}m`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(2)}k`;
  return `$${num.toFixed(2)}`;
}

function formatPercent(num) {
  if (num === null || num === undefined) return null;
  return `${(num * 100).toFixed(2)}%`;
}

// ── Firebase Auth ────────────────────────────────────────────
async function firebaseSignIn() {
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

  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err?.error?.message || res.statusText;
    throw new Error(`Firebase auth failed: ${msg}`);
  }

  const data = await res.json();
  return data.idToken; // Bearer token for Firestore requests
}

// ── Firestore Queries ────────────────────────────────────────

async function firestoreQuery(token, collectionId, where, orderBy, limit = 100) {
  const url = `${FIRESTORE_BASE}:runQuery`;
  const query = {
    structuredQuery: {
      from: [{ collectionId }],
      limit,
    },
  };

  if (where) {
    if (Array.isArray(where)) {
      query.structuredQuery.where = {
        compositeFilter: {
          op: 'AND',
          filters: where.map(w => ({
            fieldFilter: {
              field: { fieldPath: w.field },
              op: w.op || 'EQUAL',
              value: w.value,
            },
          })),
        },
      };
    } else {
      query.structuredQuery.where = {
        fieldFilter: {
          field: { fieldPath: where.field },
          op: where.op || 'EQUAL',
          value: where.value,
        },
      };
    }
  }

  if (orderBy) {
    query.structuredQuery.orderBy = Array.isArray(orderBy) ? orderBy : [orderBy];
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(query),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Firestore query failed: ${err?.error?.message || res.statusText}`);
  }

  const results = await res.json();
  return results
    .filter(r => r.document)
    .map(r => {
      const fields = {};
      for (const [k, v] of Object.entries(r.document.fields || {})) {
        fields[k] = fsVal(v);
      }
      fields._id = r.document.name.split('/').pop();
      return fields;
    });
}

async function firestoreGet(token, path) {
  const res = await fetch(`${FIRESTORE_BASE}/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return null;

  const doc = await res.json();
  const fields = {};
  for (const [k, v] of Object.entries(doc.fields || {})) {
    fields[k] = fsVal(v);
  }
  fields._id = doc.name.split('/').pop();
  return fields;
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

// ── Common name suffixes/variations to try ───────────────────
const NAME_SUFFIXES = ['', ' II', ' III', ' IV', ' Jr.', ' Jr', ' Sr.', ' Sr'];

// ── Fetch player data from CardLadder Firestore ──────────────
async function fetchPlayerData(token, playerName) {
  // Try exact name first, then common variations (e.g. "Patrick Mahomes" → "Patrick Mahomes II")
  for (const suffix of NAME_SUFFIXES) {
    const tryName = playerName + suffix;
    const results = await firestoreQuery(token, 'players', {
      field: 'player',
      op: 'EQUAL',
      value: { stringValue: tryName },
    }, null, 1);

    if (results.length > 0) {
      if (suffix) process.stdout.write(`[as "${tryName}"] `);
      results[0]._clName = tryName; // Store the CardLadder name for card queries
      return results[0];
    }

    // Only try suffix if this is the first (exact) attempt that failed
    if (!suffix) continue;
  }

  return null;
}

// ── Fetch player's cards from CardLadder Firestore ───────────
async function fetchPlayerCards(token, playerName, limit = 30) {
  const results = await firestoreQuery(token, 'cards', {
    field: 'player',
    op: 'EQUAL',
    value: { stringValue: playerName },
  }, null, limit);

  return results;
}

// ── Build cardladder data object for Supabase ────────────────
function buildCardLadderData(playerDoc, cards) {
  const now = new Date().toISOString();

  const data = {
    updatedAt: now,
    // Index data (from the player document)
    indexValue: playerDoc.dailyIndex || null,
    indexStartingValue: 1000, // CardLadder starts all indices at 1000
    rateOfGrowth: formatPercent(playerDoc.allTimePercentChange),
    realValueChange: null,
    lowValue: null,
    highValue: null,
    averageValue: playerDoc.totalValue ? Math.round(playerDoc.totalValue / (playerDoc.totalCards || 1)) : null,
    totalCards: playerDoc.totalCards || null,
    // Sales volume data
    marketCap: formatMoney(playerDoc.totalMarketCap),
    marketCapNum: playerDoc.totalMarketCap || null,
    sales24h: playerDoc.dailySalesCount || null,
    avgDailyVolume: formatMoney(playerDoc.dailySales),
    avgDailyVolumeNum: playerDoc.dailySales || null,
    lowDailyVolume: null,
    highDailyVolume: null,
    // Percent changes
    dailyPercentChange: playerDoc.dailyPercentChange || null,
    weeklyPercentChange: playerDoc.weeklyPercentChange || null,
    monthlyPercentChange: playerDoc.monthlyPercentChange || null,
    quarterlyPercentChange: playerDoc.quarterlyPercentChange || null,
    annualPercentChange: playerDoc.annualPercentChange || null,
    allTimePercentChange: playerDoc.allTimePercentChange || null,
    // Key card
    keyCard: playerDoc.keyCard ? {
      id: playerDoc.keyCard.id || null,
      image: playerDoc.keyCard.image || null,
    } : null,
  };

  // Cards
  if (cards && cards.length > 0) {
    data.cards = cards.map(c => ({
      cardId: c._id || null,
      year: String(c.year || ''),
      set: c.set || '',
      cardNumber: String(c.number || ''),
      parallel: c.variation || 'Base',
      grade: c.condition || '',
      lastSold: formatMoney(c.stats?.marketValue) || '',
      clValue: formatMoney(c.currentValue) || '',
      score: c.stats?.score || null,
      pop: c.pop || null,
      marketCap: formatMoney(c.stats?.marketCap) || null,
      numSales: c.numSales || null,
      image: c.image || null,
      slug: c.slug || null,
      label: c.label || null,
    }));
  }

  return data;
}

// ── Main ─────────────────────────────────────────────────────
async function main() {
  console.log('SlabStreet CardLadder Scraper (Firestore API)\n');

  // 1. Get target players from Supabase
  console.log('Fetching target players from Supabase...');
  const players = await getTargetPlayers();
  console.log(`  ${players.length} players to fetch\n`);

  if (players.length === 0) {
    console.log('No players found. Check --league or --player args.');
    return;
  }

  // 2. Authenticate with Firebase
  console.log('Authenticating with CardLadder (Firebase)...');
  const token = await firebaseSignIn();
  console.log('  Auth OK\n');

  // 3. Fetch data for each player
  let ok = 0, fail = 0, skip = 0;

  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    process.stdout.write(`  [${i + 1}/${players.length}] ${player.name.padEnd(28)} `);

    try {
      // Fetch player data from CardLadder Firestore
      const playerDoc = await fetchPlayerData(token, player.name);

      if (!playerDoc) {
        console.log('not found — skipped');
        skip++;
        continue;
      }

      // Fetch cards using the CardLadder name (handles suffixes like "II")
      const clName = playerDoc._clName || player.name;
      const cards = await fetchPlayerCards(token, clName, SCRAPE_CARDS ? 50 : 20);

      // Build structured data
      const cardladderData = buildCardLadderData(playerDoc, cards);

      // Write to Supabase
      const { error } = await supabase
        .from('players')
        .update({ cardladder: cardladderData })
        .eq('slug', player.slug);

      if (error) {
        if (error.message.includes('cardladder')) {
          console.log(`ERROR: 'cardladder' column not found.`);
          console.log(`       Run: ALTER TABLE players ADD COLUMN cardladder JSONB;`);
          process.exit(1);
        }
        console.log(`ERROR: ${error.message}`);
        fail++;
      } else {
        const cardCount = cards.length;
        const mktCap = formatMoney(playerDoc.totalMarketCap) || 'N/A';
        console.log(`${cardCount} cards, mktcap=${mktCap} — saved`);
        ok++;
      }
    } catch (err) {
      console.log(`FAIL: ${err.message}`);
      fail++;
    }

    // Rate limit: 500ms between players (Firestore API is fast, no need for long delays)
    await sleep(500);
  }

  console.log(`\nDone! ${ok} updated, ${skip} skipped, ${fail} failed.`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
