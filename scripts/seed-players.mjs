#!/usr/bin/env node

/**
 * Fetches current rosters from ESPN's free API and seeds them into Supabase.
 * Safe to re-run — skips players whose slug already exists.
 *
 * Usage: node scripts/seed-players.mjs
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

// ── ESPN config ──────────────────────────────────────────────
const ESPN_LEAGUES = {
  NBA:  { sport: 'basketball', league: 'nba'  },
  NFL:  { sport: 'football',   league: 'nfl'  },
  MLB:  { sport: 'baseball',   league: 'mlb'  },
  NHL:  { sport: 'hockey',     league: 'nhl'  },
  WNBA: { sport: 'basketball', league: 'wnba' },
};

// ── Position mapping (ESPN abbreviation → our positions) ─────
const POS = {
  NBA: { PG: 'GUARD', SG: 'GUARD', G: 'GUARD', SF: 'FORWARD', PF: 'FORWARD', F: 'FORWARD', C: 'CENTER' },
  NFL: { QB: 'QB', RB: 'RB', FB: 'RB', WR: 'WR', TE: 'TE', OT: 'OL', OG: 'OL', OL: 'OL', C: 'OL', DE: 'DL', DT: 'DL', DL: 'DL', NT: 'DL', LB: 'LB', ILB: 'LB', OLB: 'LB', MLB: 'LB', CB: 'DB', S: 'DB', FS: 'DB', SS: 'DB', DB: 'DB', K: 'K/P', P: 'K/P', LS: 'OL' },
  MLB: { SP: 'PITCHER', RP: 'PITCHER', CP: 'PITCHER', P: 'PITCHER', C: 'CATCHER', '1B': 'INFIELDER', '2B': 'INFIELDER', '3B': 'INFIELDER', SS: 'INFIELDER', IF: 'INFIELDER', LF: 'OUTFIELDER', CF: 'OUTFIELDER', RF: 'OUTFIELDER', OF: 'OUTFIELDER', DH: 'DH', UT: 'INFIELDER' },
  NHL:  { C: 'CENTER', LW: 'WING', RW: 'WING', W: 'WING', D: 'DEFENSEMAN', LD: 'DEFENSEMAN', RD: 'DEFENSEMAN', G: 'GOALIE' },
  WNBA: { PG: 'GUARD', SG: 'GUARD', G: 'GUARD', SF: 'FORWARD', PF: 'FORWARD', F: 'FORWARD', C: 'CENTER' },
};

// ── Defaults ─────────────────────────────────────────────────
const DEFAULT_PILLARS = [
  { label: 'Market',      score: 50, color: '#00ff87', key: 'market' },
  { label: 'Scarcity',    score: 50, color: '#38bdf8', key: 'scarcity' },
  { label: 'Momentum',    score: 50, color: '#a78bfa', key: 'momentum' },
  { label: 'Performance', score: 50, color: '#fb923c', key: 'performance' },
  { label: 'Risk',        score: 50, color: '#4ade80', key: 'risk' },
];

const DEFAULT_SCORE_HISTORY = {
  daily:   { labels: [], scores: [] },
  weekly:  { labels: [], scores: [] },
  monthly: { labels: [], scores: [] },
  yearly:  { labels: [], scores: [] },
};

// ── F1 drivers (2025 grid — only 20 drivers, easier to list) ─
const F1_DRIVERS = [
  { name: 'Max Verstappen',        team: 'RBR', number: '1'  },
  { name: 'Liam Lawson',           team: 'RBR', number: '30' },
  { name: 'Lewis Hamilton',        team: 'FER', number: '44' },
  { name: 'Charles Leclerc',       team: 'FER', number: '16' },
  { name: 'Lando Norris',          team: 'MCL', number: '4'  },
  { name: 'Oscar Piastri',         team: 'MCL', number: '81' },
  { name: 'George Russell',        team: 'MER', number: '63' },
  { name: 'Andrea Kimi Antonelli', team: 'MER', number: '12' },
  { name: 'Fernando Alonso',       team: 'AMR', number: '14' },
  { name: 'Lance Stroll',          team: 'AMR', number: '18' },
  { name: 'Pierre Gasly',          team: 'ALP', number: '10' },
  { name: 'Jack Doohan',           team: 'ALP', number: '7'  },
  { name: 'Yuki Tsunoda',          team: 'RB',  number: '22' },
  { name: 'Isack Hadjar',          team: 'RB',  number: '6'  },
  { name: 'Nico Hulkenberg',       team: 'SAU', number: '27' },
  { name: 'Gabriel Bortoleto',     team: 'SAU', number: '5'  },
  { name: 'Alexander Albon',       team: 'WIL', number: '23' },
  { name: 'Carlos Sainz',          team: 'WIL', number: '55' },
  { name: 'Esteban Ocon',          team: 'HAA', number: '31' },
  { name: 'Oliver Bearman',        team: 'HAA', number: '87' },
];

// ── Helpers ──────────────────────────────────────────────────
function makeSlug(name) {
  return name.toLowerCase().replace(/['']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function mapPos(league, abbrev) { return POS[league]?.[abbrev] || abbrev || 'UNKNOWN'; }

function buildRecord(name, firstName, lastName, team, position, number, league) {
  return {
    slug:             makeSlug(name),
    name,
    first_name:       firstName.toUpperCase(),
    last_name:        lastName.toUpperCase(),
    last_name_search: lastName.toLowerCase(),
    full_name:        name,
    team:             team.toUpperCase(),
    position,
    number:           number || '',
    score:            50,
    signal:           'HOLD',
    league,
    pillars:          DEFAULT_PILLARS,
    stats:            [],
    score_history:    DEFAULT_SCORE_HISTORY,
    cards:            [],
    sales:            [],
    fallback_odds:    [],
    news:             [],
    active:           true,
  };
}

// ── ESPN fetch helpers ───────────────────────────────────────
async function fetchTeams(sport, league) {
  const url = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams?limit=100`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`ESPN teams ${res.status}`);
  const data = await res.json();
  return (data.sports?.[0]?.leagues?.[0]?.teams || []).map(t => t.team);
}

async function fetchRoster(sport, league, teamId) {
  const url = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams/${teamId}/roster`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  // ESPN returns athletes grouped by position category
  const athletes = [];
  if (Array.isArray(data.athletes)) {
    for (const group of data.athletes) {
      if (Array.isArray(group.items)) athletes.push(...group.items);
      else if (group.displayName) athletes.push(group); // flat athlete
    }
  }
  return athletes;
}

// ── Main ─────────────────────────────────────────────────────
async function main() {
  console.log('SlabStreet Player Seed\n');

  // 1. Fetch existing slugs so we skip them
  console.log('Fetching existing players...');
  const { data: existing } = await supabase.from('players').select('slug');
  const existingSlugs = new Set((existing || []).map(p => p.slug));
  console.log(`  ${existingSlugs.size} players already in DB\n`);

  const allPlayers = [];

  // 2. ESPN leagues
  for (const [leagueId, cfg] of Object.entries(ESPN_LEAGUES)) {
    console.log(`── ${leagueId} ──`);
    try {
      const teams = await fetchTeams(cfg.sport, cfg.league);
      console.log(`  ${teams.length} teams`);

      for (const team of teams) {
        await sleep(150);
        const roster = await fetchRoster(cfg.sport, cfg.league, team.id);
        const players = roster.map(a => {
          const fullName = a.displayName || a.fullName || `${a.firstName} ${a.lastName}`;
          const pos = mapPos(leagueId, a.position?.abbreviation);
          return buildRecord(fullName, a.firstName || '', a.lastName || '', team.abbreviation, pos, a.jersey, leagueId);
        });
        console.log(`  ${team.abbreviation.padEnd(4)} ${String(players.length).padStart(3)} players`);
        allPlayers.push(...players);
      }
    } catch (err) {
      console.error(`  FAILED: ${err.message}`);
    }
  }

  // 3. F1
  console.log(`── F1 ──`);
  for (const d of F1_DRIVERS) {
    const parts = d.name.split(' ');
    allPlayers.push(buildRecord(d.name, parts[0], parts.slice(1).join(' '), d.team, 'DRIVER', d.number, 'F1'));
  }
  console.log(`  ${F1_DRIVERS.length} drivers`);

  // 4. Deduplicate by slug
  const seen = new Set();
  const unique = [];
  for (const p of allPlayers) {
    if (seen.has(p.slug)) p.slug = `${p.slug}-${p.team.toLowerCase()}`;
    if (!seen.has(p.slug)) {
      seen.add(p.slug);
      unique.push(p);
    }
  }

  // 5. Filter out existing
  const newPlayers = unique.filter(p => !existingSlugs.has(p.slug));
  console.log(`\nTotal fetched: ${unique.length}`);
  console.log(`Already exist: ${unique.length - newPlayers.length}`);
  console.log(`New to insert: ${newPlayers.length}\n`);

  if (newPlayers.length === 0) {
    console.log('Nothing to insert. Done!');
    return;
  }

  // 6. Insert in batches
  const BATCH = 50;
  let ok = 0, fail = 0;

  for (let i = 0; i < newPlayers.length; i += BATCH) {
    const batch = newPlayers.slice(i, i + BATCH);
    const { error } = await supabase.from('players').insert(batch);

    if (error) {
      // Retry individually to find bad records
      for (const p of batch) {
        const { error: e } = await supabase.from('players').insert([p]);
        if (e) { console.error(`  SKIP ${p.name}: ${e.message}`); fail++; }
        else ok++;
      }
    } else {
      ok += batch.length;
    }
    process.stdout.write(`  Inserted ${ok}/${newPlayers.length}...\r`);
  }

  console.log(`\nDone! ${ok} inserted, ${fail} failed.`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
