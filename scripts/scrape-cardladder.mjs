#!/usr/bin/env node

/**
 * Fetches CardLadder player data (index, sales volume, market cap, cards)
 * via the Firestore REST API and stores structured data in Supabase.
 *
 * Requires a CardLadder account (Free or Pro).
 *
 * Usage:
 *   node scripts/scrape-cardladder.mjs                      # update existing players (top 20/league)
 *   node scripts/scrape-cardladder.mjs --league=NBA         # NBA only
 *   node scripts/scrape-cardladder.mjs --player=victor-wembanyama  # single player
 *   node scripts/scrape-cardladder.mjs --limit=50           # top 50 per league
 *   node scripts/scrape-cardladder.mjs --cards              # also fetch individual card details (50/player)
 *   node scripts/scrape-cardladder.mjs --all-cards          # fetch ALL cards per player (paginated)
 *   node scripts/scrape-cardladder.mjs --sales              # fetch sales history per card → card_sales table
 *   node scripts/scrape-cardladder.mjs --all-cards --sales  # full cards + sales sync
 *   node scripts/scrape-cardladder.mjs --import             # import ALL CardLadder sports players
 *   node scripts/scrape-cardladder.mjs --import --dry-run   # preview import without writing
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
const SCRAPE_CARDS = args.cards === 'true';
const ALL_CARDS = args['all-cards'] === 'true';
const FETCH_SALES = args.sales === 'true';
const IMPORT_MODE = args.import === 'true';
const DRY_RUN = args['dry-run'] === 'true';

// ── Constants ────────────────────────────────────────────────
const FIREBASE_API_KEY = env.FIREBASE_API_KEY;
const FIREBASE_PROJECT = 'cardladder-71d53';
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents`;

// CardLadder category → our league ID
const CATEGORY_TO_LEAGUE = {
  Basketball: 'NBA',
  Football: 'NFL',
  Baseball: 'MLB',
  Hockey: 'NHL',
  WNBA: 'WNBA',
  Racing: 'F1',
  Soccer: 'MLS',
  Golf: 'PGA',
  Tennis: 'TENNIS',
  Boxing: 'BOXING',
  'UFC/MMA': 'UFC',
  Wrestling: 'WRESTLING',
  Softball: 'SOFTBALL',
};

// Categories we consider "sports" (skip Pokemon, Magic, Star Wars, etc.)
const SPORTS_CATEGORIES = new Set(Object.keys(CATEGORY_TO_LEAGUE));

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

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Normalize a name for matching: lowercase, strip suffixes, trim */
function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/\s+(ii|iii|iv|jr\.?|sr\.?)$/i, '')
    .replace(/[^a-z\s]/g, '')
    .trim();
}

// ── Firebase Auth ────────────────────────────────────────────
async function firebaseSignIn() {
  const email = env.CARDLADDER_EMAIL;
  const password = env.CARDLADDER_PASSWORD;

  if (!email || !password || !FIREBASE_API_KEY) {
    throw new Error(
      'Missing CardLadder credentials in .env.local. Required:\n' +
      '  CARDLADDER_EMAIL=your@email.com\n' +
      '  CARDLADDER_PASSWORD=yourpassword\n' +
      '  FIREBASE_API_KEY=your_firebase_api_key'
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
  return data.idToken;
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

// ── Pre-fetch ALL CardLadder players ─────────────────────────
async function fetchAllCardLadderPlayers(token) {
  console.log('  Fetching all CardLadder players...');
  const allPlayers = [];
  let pageToken = null;
  let pages = 0;

  while (true) {
    let url = `${FIRESTORE_BASE}/players?pageSize=300`;
    url += '&mask.fieldPaths=player&mask.fieldPaths=category&mask.fieldPaths=totalMarketCap';
    url += '&mask.fieldPaths=totalCards&mask.fieldPaths=dailyIndex&mask.fieldPaths=dailySalesCount';
    url += '&mask.fieldPaths=dailySales&mask.fieldPaths=dailyPercentChange';
    url += '&mask.fieldPaths=weeklyPercentChange&mask.fieldPaths=monthlyPercentChange';
    url += '&mask.fieldPaths=quarterlyPercentChange&mask.fieldPaths=annualPercentChange';
    url += '&mask.fieldPaths=allTimePercentChange&mask.fieldPaths=totalValue';
    url += '&mask.fieldPaths=keyCard&mask.fieldPaths=playerId&mask.fieldPaths=lastUpdated';
    if (pageToken) url += `&pageToken=${pageToken}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    const docs = data.documents || [];

    for (const doc of docs) {
      const fields = {};
      for (const [k, v] of Object.entries(doc.fields || {})) {
        fields[k] = fsVal(v);
      }
      fields._id = doc.name.split('/').pop();
      allPlayers.push(fields);
    }

    pages++;
    process.stdout.write('.');

    if (data.nextPageToken) {
      pageToken = data.nextPageToken;
    } else {
      break;
    }
  }

  console.log(` ${allPlayers.length} players fetched (${pages} pages)`);
  return allPlayers;
}

// ── Fetch player's cards from CardLadder Firestore ───────────
async function fetchPlayerCards(token, playerName, limit = 30) {
  if (!ALL_CARDS) {
    // Original behavior: single query with limit
    const results = await firestoreQuery(token, 'cards', {
      field: 'player',
      op: 'EQUAL',
      value: { stringValue: playerName },
    }, null, limit);
    return results;
  }

  // ALL_CARDS mode: paginate through all cards for this player
  const allCards = [];
  const PAGE_SIZE = 100;
  let lastDocName = null;

  while (true) {
    const url = `${FIRESTORE_BASE}:runQuery`;
    const query = {
      structuredQuery: {
        from: [{ collectionId: 'cards' }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'player' },
            op: 'EQUAL',
            value: { stringValue: playerName },
          },
        },
        orderBy: [{ field: { fieldPath: '__name__' }, direction: 'ASCENDING' }],
        limit: PAGE_SIZE,
      },
    };

    if (lastDocName) {
      query.structuredQuery.startAt = {
        values: [{ referenceValue: lastDocName }],
        before: false,
      };
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
    const docs = results.filter(r => r.document);

    if (docs.length === 0) break;

    for (const r of docs) {
      const fields = {};
      for (const [k, v] of Object.entries(r.document.fields || {})) {
        fields[k] = fsVal(v);
      }
      fields._id = r.document.name.split('/').pop();
      allCards.push(fields);
      lastDocName = r.document.name;
    }

    if (docs.length < PAGE_SIZE) break;
    await sleep(50); // small delay between pages
  }

  return allCards;
}

// ── Fetch sales for a single card from CardLadder ────────────
async function fetchCardSales(token, cardFirestoreId) {
  const allSales = [];
  let pageToken = null;

  while (true) {
    let url = `${FIRESTORE_BASE}/cards/${cardFirestoreId}/sales?pageSize=100`;
    if (pageToken) url += `&pageToken=${pageToken}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) break;
    const data = await res.json();
    const docs = data.documents || [];
    if (docs.length === 0) break;

    for (const doc of docs) {
      const f = doc.fields || {};
      const price = parseFloat(fsVal(f.price) || 0);
      if (price <= 0) continue;

      allSales.push({
        price, // CardLadder stores prices in dollars
        date: fsVal(f.date) || null,
        platform: fsVal(f.platform) || 'eBay',
        listingType: fsVal(f.listingType) || '',
        title: fsVal(f.title) || '',
        condition: fsVal(f.condition) || '',
        url: fsVal(f.url) || '',
        image: fsVal(f.image) || fsVal(f.thumbnail) || '',
        listingId: fsVal(f.listingId) || fsVal(f.itemId) || '',
      });
    }

    if (data.nextPageToken) {
      pageToken = data.nextPageToken;
    } else {
      break;
    }
  }

  return allSales;
}

// ── Write CardLadder sales to card_sales + cards tables ──────
async function writeCardSalesToDB(sales, cardInfo, playerSlug, league) {
  if (sales.length === 0) return 0;

  // Ensure the card exists in cards table
  const slug = generateCardSlug(
    playerSlug,
    cardInfo.year || '0',
    cardInfo.set || 'Unknown',
    cardInfo.variation || 'Base',
    cardInfo.number || ''
  );

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
        player_slug: playerSlug,
        year: parseInt(cardInfo.year) || 0,
        set_name: cardInfo.set || 'Unknown',
        parallel: cardInfo.variation || 'Base',
        card_number: cardInfo.number || null,
        league,
        image_url: cardInfo.image || null,
        cardladder_slug: cardInfo.slug || null,
        slug,
      })
      .select('id')
      .single();

    if (insertErr) return 0;
    card = newCard;
  }

  if (!card) return 0;

  // Batch upsert sales
  let written = 0;
  const rows = sales.map(s => {
    // Parse grade from condition string (e.g. "PSA 10" → grader=PSA, grade_number=10)
    let grader = null, gradeNumber = null, grade = s.condition || null;
    const gradeMatch = (s.condition || '').match(/^(PSA|BGS|SGC|CGC|HGA|CSG|TAG)\s*(\d+\.?\d*)/i);
    if (gradeMatch) {
      grader = gradeMatch[1].toUpperCase();
      gradeNumber = parseFloat(gradeMatch[2]);
    }

    // Parse date
    let soldDate;
    try {
      soldDate = s.date ? new Date(s.date).toISOString() : null;
    } catch {
      soldDate = null;
    }
    if (!soldDate) return null;

    // Build a unique listing URL/ID
    const listingUrl = s.url || (s.listingId ? `cardladder://${s.listingId}` : null);
    if (!listingUrl) return null;

    return {
      card_id: card.id,
      price: s.price,
      grade,
      grader,
      grade_number: gradeNumber,
      sold_date: soldDate,
      platform: s.platform || 'eBay',
      listing_url: listingUrl,
      image_url: s.image || null,
    };
  }).filter(Boolean);

  // Upsert in batches of 50
  for (let i = 0; i < rows.length; i += 50) {
    const batch = rows.slice(i, i + 50);
    const { error } = await supabase
      .from('card_sales')
      .upsert(batch, { onConflict: 'listing_url', ignoreDuplicates: true });
    if (!error) written += batch.length;
  }

  return written;
}

// ── Build cardladder data object for Supabase ────────────────
function buildCardLadderData(playerDoc, cards) {
  const now = new Date().toISOString();

  const data = {
    updatedAt: now,
    indexValue: playerDoc.dailyIndex || null,
    indexStartingValue: 1000,
    rateOfGrowth: formatPercent(playerDoc.allTimePercentChange),
    realValueChange: null,
    lowValue: null,
    highValue: null,
    averageValue: playerDoc.totalValue ? Math.round(playerDoc.totalValue / (playerDoc.totalCards || 1)) : null,
    totalCards: playerDoc.totalCards || null,
    marketCap: formatMoney(playerDoc.totalMarketCap),
    marketCapNum: playerDoc.totalMarketCap || null,
    sales24h: playerDoc.dailySalesCount || null,
    avgDailyVolume: formatMoney(playerDoc.dailySales),
    avgDailyVolumeNum: playerDoc.dailySales || null,
    lowDailyVolume: null,
    highDailyVolume: null,
    dailyPercentChange: playerDoc.dailyPercentChange || null,
    weeklyPercentChange: playerDoc.weeklyPercentChange || null,
    monthlyPercentChange: playerDoc.monthlyPercentChange || null,
    quarterlyPercentChange: playerDoc.quarterlyPercentChange || null,
    annualPercentChange: playerDoc.annualPercentChange || null,
    allTimePercentChange: playerDoc.allTimePercentChange || null,
    keyCard: playerDoc.keyCard ? {
      id: playerDoc.keyCard.id || null,
      image: playerDoc.keyCard.image || null,
    } : null,
  };

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

// ── Match CardLadder players against Supabase ────────────────
function matchPlayers(clPlayers, supabasePlayers) {
  // Build lookup maps from Supabase players
  const byExactName = new Map();   // "Patrick Mahomes" → player
  const byNormalized = new Map();  // "patrick mahomes" → player

  for (const sp of supabasePlayers) {
    byExactName.set(sp.name, sp);
    byNormalized.set(normalizeName(sp.name), sp);
  }

  const matched = [];   // { clDoc, supabaseSlug } — existing player, update cardladder
  const newPlayers = []; // { clDoc } — not in Supabase, need to insert

  for (const cl of clPlayers) {
    const clName = cl.player;
    if (!clName) continue;

    // Try exact match
    let sp = byExactName.get(clName);
    if (sp) {
      matched.push({ clDoc: cl, supabaseSlug: sp.slug, clName });
      continue;
    }

    // Try normalized match (strips suffixes like II, Jr.)
    sp = byNormalized.get(normalizeName(clName));
    if (sp) {
      matched.push({ clDoc: cl, supabaseSlug: sp.slug, clName });
      continue;
    }

    // No match → new player to import
    newPlayers.push({ clDoc: cl, clName });
  }

  return { matched, newPlayers };
}

// ── IMPORT MODE ──────────────────────────────────────────────
async function runImport(token) {
  console.log('=== IMPORT MODE ===\n');

  // 1. Pre-fetch all CardLadder players
  const allCL = await fetchAllCardLadderPlayers(token);

  // 2. Filter to sports categories only
  const sportsCL = allCL.filter(p => {
    const cat = p.category || 'Unknown';
    return SPORTS_CATEGORIES.has(cat);
  });
  console.log(`  ${sportsCL.length} sports players (of ${allCL.length} total)\n`);

  // Apply league filter if specified
  const filteredCL = LEAGUE_FILTER
    ? sportsCL.filter(p => CATEGORY_TO_LEAGUE[p.category] === LEAGUE_FILTER)
    : sportsCL;

  if (LEAGUE_FILTER) {
    console.log(`  Filtered to ${LEAGUE_FILTER}: ${filteredCL.length} players\n`);
  }

  // 3. Fetch ALL Supabase players for matching
  console.log('  Fetching all Supabase players for matching...');
  const allSupabase = [];
  let page = 0;
  while (true) {
    const { data } = await supabase
      .from('players')
      .select('slug, name, league')
      .range(page * 1000, (page + 1) * 1000 - 1);
    if (!data || data.length === 0) break;
    allSupabase.push(...data);
    page++;
  }
  console.log(`  ${allSupabase.length} Supabase players loaded\n`);

  // 4. Match
  const { matched, newPlayers } = matchPlayers(filteredCL, allSupabase);

  // Sort new players by market cap descending (most valuable first)
  newPlayers.sort((a, b) => (b.clDoc.totalMarketCap || 0) - (a.clDoc.totalMarketCap || 0));

  console.log(`  Matched (existing): ${matched.length}`);
  console.log(`  New (to import):    ${newPlayers.length}\n`);

  // Show top new players
  if (newPlayers.length > 0) {
    console.log('  Top 20 new players to import:');
    for (const np of newPlayers.slice(0, 20)) {
      const mktCap = formatMoney(np.clDoc.totalMarketCap) || '$0';
      const cat = np.clDoc.category || '?';
      console.log(`    ${np.clName.padEnd(30)} ${cat.padEnd(12)} mktcap=${mktCap}`);
    }
    if (newPlayers.length > 20) console.log(`    ... and ${newPlayers.length - 20} more`);
    console.log('');
  }

  if (DRY_RUN) {
    console.log('DRY RUN — no changes written.\n');

    // Show category breakdown of new players
    const catCounts = {};
    for (const np of newPlayers) {
      const cat = np.clDoc.category || 'Unknown';
      catCounts[cat] = (catCounts[cat] || 0) + 1;
    }
    console.log('New players by category:', JSON.stringify(catCounts, null, 2));
    return;
  }

  // 5. Insert new players into Supabase
  let inserted = 0, insertFailed = 0;

  if (newPlayers.length > 0) {
    console.log('Inserting new players into Supabase...');

    // Batch insert in chunks of 50
    const BATCH_SIZE = 50;
    for (let i = 0; i < newPlayers.length; i += BATCH_SIZE) {
      const batch = newPlayers.slice(i, i + BATCH_SIZE);
      const rows = batch.map(np => {
        const cl = np.clDoc;
        const name = np.clName;
        const league = CATEGORY_TO_LEAGUE[cl.category] || 'OTHER';
        const slug = slugify(name);
        const nameParts = name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        return {
          slug,
          name,
          first_name: firstName,
          last_name: lastName,
          last_name_search: lastName.toLowerCase(),
          full_name: name,
          team: '',
          position: '',
          number: '',
          score: 0,
          signal: 'HOLD',
          pillars: [],
          stats: [],
          score_history: {},
          cards: [],
          sales: [],
          fallback_odds: [],
          news: [],
          active: true,
          retired: true,
          sport: league === 'NBA' || league === 'WNBA' ? 'basketball'
            : league === 'NFL' ? 'football'
            : league === 'MLB' ? 'baseball'
            : league === 'NHL' ? 'hockey'
            : league === 'F1' ? 'racing'
            : league === 'MLS' ? 'soccer'
            : league === 'PGA' ? 'golf'
            : 'other',
          league,
        };
      });

      const { error } = await supabase.from('players').upsert(rows, {
        onConflict: 'slug',
        ignoreDuplicates: true,
      });

      if (error) {
        console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1} error: ${error.message}`);
        insertFailed += batch.length;
      } else {
        inserted += batch.length;
        process.stdout.write(`  Inserted ${inserted}/${newPlayers.length}\r`);
      }
    }
    console.log(`\n  Inserted: ${inserted}, Failed: ${insertFailed}\n`);
  }

  // 6. Now update CardLadder data for ALL matched + newly inserted players
  const allToUpdate = [
    ...matched.map(m => ({ slug: m.supabaseSlug, clDoc: m.clDoc, clName: m.clName })),
    ...newPlayers.map(np => ({ slug: slugify(np.clName), clDoc: np.clDoc, clName: np.clName })),
  ];

  console.log(`Updating CardLadder data for ${allToUpdate.length} players...`);
  let ok = 0, fail = 0;

  for (let i = 0; i < allToUpdate.length; i++) {
    const { slug, clDoc, clName } = allToUpdate[i];

    if ((i + 1) % 100 === 0 || i + 1 === allToUpdate.length) {
      process.stdout.write(`  Progress: ${i + 1}/${allToUpdate.length}\r`);
    }

    try {
      // Fetch cards for this player
      const cards = await fetchPlayerCards(token, clName, ALL_CARDS ? 9999 : (SCRAPE_CARDS ? 50 : 20));

      // Build and save
      const cardladderData = buildCardLadderData(clDoc, cards);

      const { error } = await supabase
        .from('players')
        .update({ cardladder: cardladderData })
        .eq('slug', slug);

      if (error) {
        fail++;
      } else {
        ok++;
      }
    } catch {
      fail++;
    }

    // Light rate limit (Firestore is fast but don't hammer it)
    await sleep(200);
  }

  console.log(`\n\nDone! ${ok} updated, ${fail} failed.`);
  console.log(`  New players inserted: ${inserted}`);
  console.log(`  Existing players matched: ${matched.length}`);
}

// ── STANDARD MODE ────────────────────────────────────────────
async function runStandard(token) {
  // 1. Get target players from Supabase
  console.log('Fetching target players from Supabase...');
  let players;

  if (PLAYER_FILTER) {
    const { data } = await supabase
      .from('players')
      .select('slug, name, league, team')
      .eq('slug', PLAYER_FILTER)
      .limit(1);
    players = data || [];
  } else {
    const leagues = LEAGUE_FILTER ? [LEAGUE_FILTER] : ['NBA', 'NFL', 'MLB', 'NHL', 'WNBA', 'F1'];
    players = [];
    for (const league of leagues) {
      const { data } = await supabase
        .from('players')
        .select('slug, name, league, team')
        .eq('league', league)
        .eq('active', true)
        .order('score', { ascending: false })
        .limit(LIMIT_PER_LEAGUE);
      if (data) players.push(...data);
    }
  }

  console.log(`  ${players.length} players to fetch\n`);
  if (players.length === 0) {
    console.log('No players found. Check --league or --player args.');
    return;
  }

  // 2. Pre-fetch all CardLadder players for fast local matching
  const allCL = await fetchAllCardLadderPlayers(token);

  // Build lookup: normalized name → CardLadder doc
  const clByName = new Map();
  const clByNormalized = new Map();
  for (const cl of allCL) {
    if (cl.player) {
      clByName.set(cl.player, cl);
      clByNormalized.set(normalizeName(cl.player), cl);
    }
  }
  console.log(`  ${clByName.size} CardLadder players indexed\n`);

  // 3. Match and fetch data
  let ok = 0, fail = 0, skip = 0;

  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    process.stdout.write(`  [${i + 1}/${players.length}] ${player.name.padEnd(28)} `);

    try {
      // Fast local lookup instead of per-player Firestore queries
      let clDoc = clByName.get(player.name);
      let clName = player.name;

      if (!clDoc) {
        clDoc = clByNormalized.get(normalizeName(player.name));
        if (clDoc) clName = clDoc.player;
      }

      if (!clDoc) {
        console.log('not found — skipped');
        skip++;
        continue;
      }

      if (clName !== player.name) {
        process.stdout.write(`[as "${clName}"] `);
      }

      // Fetch cards (still requires per-player Firestore query)
      const cardLimit = FETCH_SALES ? 9999 : (ALL_CARDS ? 9999 : (SCRAPE_CARDS ? 50 : 20));
      const cards = await fetchPlayerCards(token, clName, cardLimit);

      const cardladderData = buildCardLadderData(clDoc, cards);

      const { error } = await supabase
        .from('players')
        .update({ cardladder: cardladderData })
        .eq('slug', player.slug);

      if (error) {
        console.log(`ERROR: ${error.message}`);
        fail++;
      } else {
        let salesMsg = '';
        // Fetch and store sales per card if --sales flag is set
        if (FETCH_SALES && cards.length > 0) {
          let totalSalesWritten = 0;
          for (const card of cards) {
            const cardId = card._id;
            if (!cardId) continue;
            const sales = await fetchCardSales(token, cardId);
            if (sales.length > 0) {
              const written = await writeCardSalesToDB(sales, card, player.slug, player.league);
              totalSalesWritten += written;
            }
            await sleep(50); // small delay between card sales fetches
          }
          salesMsg = `, ${totalSalesWritten} sales`;
        }
        const mktCap = formatMoney(clDoc.totalMarketCap) || 'N/A';
        console.log(`${cards.length} cards${salesMsg}, mktcap=${mktCap} — saved`);
        ok++;
      }
    } catch (err) {
      console.log(`FAIL: ${err.message}`);
      fail++;
    }

    await sleep(300);
  }

  console.log(`\nDone! ${ok} updated, ${skip} skipped, ${fail} failed.`);
}

// ── Main ─────────────────────────────────────────────────────
async function main() {
  console.log('SlabStreet CardLadder Scraper (Firestore API)\n');

  console.log('Authenticating with CardLadder (Firebase)...');
  const token = await firebaseSignIn();
  console.log('  Auth OK\n');

  if (IMPORT_MODE) {
    await runImport(token);
  } else {
    await runStandard(token);
  }
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
