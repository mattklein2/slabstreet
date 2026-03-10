#!/usr/bin/env node

/**
 * Automated Slab Score Engine
 * Computes all 5 pillar scores from real data, derives composite score + signal,
 * and tracks score history.
 *
 * Usage:
 *   node scripts/update-scores.mjs                              # all players
 *   node scripts/update-scores.mjs --league=NBA                 # NBA only
 *   node scripts/update-scores.mjs --player=victor-wembanyama   # single player
 *   node scripts/update-scores.mjs --dry-run                    # compute + log, don't write
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = {};
for (const line of readFileSync(resolve(__dirname, '..', '.env.local'), 'utf-8').split('\n')) {
  const m = line.match(/^([^#=][^=]*)=(.*)/);
  if (m) env[m[1].trim()] = m[2].trim();
}
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// ── CLI args ────────────────────────────────────────────────
const leagueFilter = process.argv.find(a => a.startsWith('--league='))?.split('=')[1]?.toUpperCase();
const playerFilter = process.argv.find(a => a.startsWith('--player='))?.split('=')[1]?.toLowerCase();
const dryRun = process.argv.includes('--dry-run');

// ── Per-league pillar weights ────────────────────────────────
// Each sport's card market behaves differently:
//   NBA/WNBA: star-driven, rich nightly stats, big card market
//   NFL:      injury risk dominates, position-dependent stats
//   MLB:      rookie-card hobby, slow-moving stats, market-heavy
//   NHL:      smaller market, performance + team matter most
//   F1:       tiny pool (20 drivers), almost pure market/scarcity
const LEAGUE_WEIGHTS = {
  NBA:  { market: 0.30, scarcity: 0.15, momentum: 0.15, performance: 0.25, risk: 0.15 },
  WNBA: { market: 0.30, scarcity: 0.15, momentum: 0.15, performance: 0.25, risk: 0.15 },
  NFL:  { market: 0.25, scarcity: 0.20, momentum: 0.10, performance: 0.20, risk: 0.25 },
  MLB:  { market: 0.35, scarcity: 0.20, momentum: 0.10, performance: 0.20, risk: 0.15 },
  NHL:  { market: 0.25, scarcity: 0.20, momentum: 0.15, performance: 0.25, risk: 0.15 },
  F1:   { market: 0.35, scarcity: 0.25, momentum: 0.20, performance: 0.10, risk: 0.10 },
};
const DEFAULT_WEIGHTS = { market: 0.30, scarcity: 0.15, momentum: 0.15, performance: 0.25, risk: 0.15 };

// ── Pillar display config ───────────────────────────────────
const PILLAR_META = {
  market:      { label: 'Market',      color: '#00ff87' },
  scarcity:    { label: 'Scarcity',    color: '#38bdf8' },
  momentum:    { label: 'Momentum',    color: '#a78bfa' },
  performance: { label: 'Performance', color: '#fb923c' },
  risk:        { label: 'Risk',        color: '#4ade80' },
};

// ── League ESPN config ──────────────────────────────────────
const LEAGUE_CFG = {
  NBA:  { sport: 'basketball', league: 'nba',  season: '2025', playoffSeeds: 10 },
  NFL:  { sport: 'football',   league: 'nfl',  season: '2025', playoffSeeds: 7  },
  MLB:  { sport: 'baseball',   league: 'mlb',  season: '2025', playoffSeeds: 6  },
  NHL:  { sport: 'hockey',     league: 'nhl',  season: '2025', playoffSeeds: 8  },
  WNBA: { sport: 'basketball', league: 'wnba', season: '2025', playoffSeeds: 8  },
  F1:   { sport: 'racing',     league: 'f1',   season: '2025', playoffSeeds: 0  },
};

// ── League stat configs for Performance pillar ──────────────
const STAT_WEIGHTS = {
  NBA:  [['avgPoints',0.35],['avgRebounds',0.20],['avgAssists',0.20],['fieldGoalPct',0.15],['gamesPlayed',0.10]],
  WNBA: [['avgPoints',0.35],['avgRebounds',0.20],['avgAssists',0.20],['fieldGoalPct',0.15],['gamesPlayed',0.10]],
  NFL:  [['passingYards',0.30],['passingTouchdowns',0.25],['QBRating',0.25],['gamesPlayed',0.20]],
  MLB:  [['avg',0.25],['homeRuns',0.25],['RBIs',0.20],['OPS',0.20],['gamesPlayed',0.10]],
  NHL:  [['points',0.35],['goals',0.25],['assists',0.20],['gamesPlayed',0.20]],
  F1:   [['championshipPts',0.40],['wins',0.30],['podiums',0.20],['poles',0.10]],
};

// Aliases: ESPN stat labels → our standard keys
const STAT_ALIASES = {
  PTS: 'avgPoints', PPG: 'avgPoints',
  REB: 'avgRebounds', RPG: 'avgRebounds',
  AST: 'avgAssists', APG: 'avgAssists',
  'FG%': 'fieldGoalPct',
  GP: 'gamesPlayed',
  'PASS YDS': 'passingYards', 'PASS TD': 'passingTouchdowns',
  'RUSH YDS': 'rushingYards', 'REC YDS': 'receivingYards',
  'QBR': 'QBRating', 'QB RTG': 'QBRating',
  AVG: 'avg', HR: 'homeRuns', RBI: 'RBIs', OPS: 'OPS', ERA: 'ERA',
  G: 'goals', A: 'assists', PTS_NHL: 'points', '+/-': 'plusMinus',
  WDC: 'championshipPts',
};

// ── Helpers ─────────────────────────────────────────────────
function clamp(v, lo = 0, hi = 100) { return Math.round(Math.max(lo, Math.min(hi, v))); }

function parsePrice(s) {
  if (!s) return 0;
  const n = parseFloat(String(s).replace(/[^0-9.-]/g, ''));
  return isNaN(n) ? 0 : n;
}

function parsePop(s) {
  if (!s) return 0;
  const n = parseInt(String(s).replace(/[^0-9]/g, ''), 10);
  return isNaN(n) ? 0 : n;
}

/** Returns 0-100 percentile rank of value within a sorted array */
function percentile(value, sorted) {
  if (!sorted.length) return 50;
  if (sorted.length === 1) return value >= sorted[0] ? 75 : 25;
  let below = 0;
  for (const v of sorted) { if (v < value) below++; }
  return clamp((below / sorted.length) * 100);
}

/** Extract a stat value from player.stats[] by label */
function getStatVal(stats, label) {
  if (!Array.isArray(stats)) return null;
  const entry = stats.find(s => {
    const key = STAT_ALIASES[s.label] || s.label;
    return key === label || s.label === label;
  });
  if (!entry) return null;
  const v = parseFloat(String(entry.val).replace(/[^0-9.-]/g, ''));
  return isNaN(v) ? null : v;
}

// ── ESPN Standings (fetch all teams for a league at once) ───
async function fetchAllStandings(sport, league, season) {
  const teamMap = {}; // abbrev → { wins, losses, winPct, playoffSeed }
  try {
    const url = `https://site.api.espn.com/apis/v2/sports/${sport}/${league}/standings?season=${season}`;
    const res = await fetch(url);
    if (!res.ok) return teamMap;
    const data = await res.json();
    const groups = data?.children || [];

    for (const group of groups) {
      const entries = group?.standings?.entries || [];
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const abbrev = (entry?.team?.abbreviation || '').toUpperCase();
        if (!abbrev) continue;
        const stats = entry.stats || [];
        const wins   = stats.find(s => s.name === 'wins')?.value ?? 0;
        const losses = stats.find(s => s.name === 'losses')?.value ?? 0;
        const winPct = parseFloat(stats.find(s => s.name === 'winPercent')?.value ?? (wins / (wins + losses || 1)));
        const conferenceRank = i + 1;
        teamMap[abbrev] = { wins, losses, winPct, conferenceRank };
      }
    }
  } catch (e) {
    console.error(`  ESPN standings error (${league}):`, e.message);
  }
  return teamMap;
}

// ── calcTeamSuccessScore (ported from app/api/odds/route.ts) ─
function calcTeamSuccessScore(standings, playoffSeeds) {
  if (!standings) return 50;
  let score = 50;

  // Win % component
  if (standings.winPct >= 0.650) score += 30;
  else if (standings.winPct >= 0.580) score += 20;
  else if (standings.winPct >= 0.500) score += 10;
  else if (standings.winPct >= 0.400) score -= 5;
  else if (standings.winPct >= 0.300) score -= 15;
  else score -= 25;

  // Playoff seed component
  const seed = standings.conferenceRank;
  if (seed && playoffSeeds > 0) {
    if (seed <= 3) score += 10;
    else if (seed <= 6) score += 5;
    else if (seed <= playoffSeeds) score += 2;
    else score -= 10;
  }

  return clamp(score);
}

// ═══════════════════════════════════════════════════════════
// PILLAR CALCULATORS
// ═══════════════════════════════════════════════════════════

function calcMarket(player, leaguePrices) {
  const cards = player.cards || [];
  const sales = player.sales || [];
  if (!cards.length) return 50;

  // Median card price
  const prices = cards.map(c => parsePrice(c.price)).filter(p => p > 0).sort((a, b) => a - b);
  const median = prices.length ? prices[Math.floor(prices.length / 2)] : 0;

  // Price rank: percentile within league
  const priceRank = percentile(median, leaguePrices);

  // Trend: % of cards with up=true
  const withTrend = cards.filter(c => c.up !== undefined);
  const trendPct = withTrend.length ? (withTrend.filter(c => c.up).length / withTrend.length) * 100 : 50;

  // Tier quality: weighted average
  const tierVal = { RARE: 100, MID: 60, COMMON: 20 };
  const tierAvg = cards.length
    ? cards.reduce((sum, c) => sum + (tierVal[c.tier] || 20), 0) / cards.length
    : 20;

  // Volume
  const volumeScore = Math.min(sales.length * 10, 100);

  return clamp(priceRank * 0.40 + trendPct * 0.25 + tierAvg * 0.20 + volumeScore * 0.15);
}

function calcScarcity(player) {
  const cards = player.cards || [];
  const pops = cards.map(c => parsePop(c.pop)).filter(p => p > 0);
  if (!pops.length) return 50;

  const avgPop = pops.reduce((a, b) => a + b, 0) / pops.length;

  if (avgPop <= 25)   return 95;
  if (avgPop <= 100)  return 85;
  if (avgPop <= 300)  return 70;
  if (avgPop <= 750)  return 55;
  if (avgPop <= 2000) return 40;
  if (avgPop <= 5000) return 25;
  return 15;
}

function calcMomentum(player, teamSuccess) {
  const cards = player.cards || [];
  const withTrend = cards.filter(c => c.up !== undefined);

  // Price momentum: % of cards trending up
  const priceMomentum = withTrend.length
    ? (withTrend.filter(c => c.up).length / withTrend.length) * 100
    : 50;

  // Team success score (0-100)
  const teamScore = teamSuccess ?? 50;

  // If we have card trend data, blend; otherwise rely on team success
  if (withTrend.length) {
    return clamp(priceMomentum * 0.60 + teamScore * 0.40);
  }
  return clamp(teamScore);
}

function calcPerformance(player, leagueStatArrays) {
  const stats = player.stats;
  const league = player.league;
  const weights = STAT_WEIGHTS[league];
  if (!weights || !Array.isArray(stats) || !stats.length) return 50;

  let totalWeight = 0;
  let weightedSum = 0;

  for (const [statKey, weight] of weights) {
    const val = getStatVal(stats, statKey);
    if (val === null) continue;
    const sorted = leagueStatArrays[statKey] || [];
    if (!sorted.length) continue;
    const pct = percentile(val, sorted);
    weightedSum += pct * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) return 50;
  return clamp(weightedSum / totalWeight);
}

const RISK_KEYWORDS = /injur|injured|out |questionable|doubtful|suspend|arrest|trade|waive|cut |concussion|acl|torn|mcl|hamstring|fracture/i;

function calcRisk(player, teamSuccess, leagueGPsorted) {
  // Team stability (50%)
  const teamScore = teamSuccess ?? 50;

  // Durability: games played percentile (30%)
  const gp = getStatVal(player.stats, 'gamesPlayed');
  const durability = (gp !== null && leagueGPsorted.length)
    ? percentile(gp, leagueGPsorted)
    : 50;

  // News risk scan (20%)
  const news = player.news || [];
  let riskPenalty = 0;
  for (const article of news) {
    const text = (article.headline || '') + ' ' + (article.source || '');
    if (RISK_KEYWORDS.test(text)) riskPenalty += 5;
  }
  const newsScore = Math.max(0, 70 - riskPenalty);

  return clamp(teamScore * 0.50 + durability * 0.30 + newsScore * 0.20);
}

// ── Score History ───────────────────────────────────────────
function updateScoreHistory(existing, newScore) {
  const h = existing || {
    daily:   { labels: [], scores: [] },
    weekly:  { labels: [], scores: [] },
    monthly: { labels: [], scores: [] },
    yearly:  { labels: [], scores: [] },
  };

  const now = new Date();
  const dayLabel = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const weekLabel = `Wk ${Math.ceil(now.getDate() / 7)} ${now.toLocaleDateString('en-US', { month: 'short' })}`;
  const monthLabel = now.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  const yearLabel = now.getFullYear().toString();

  // Daily: always append (max 30)
  h.daily.labels.push(dayLabel);
  h.daily.scores.push(newScore);
  if (h.daily.labels.length > 30) { h.daily.labels.shift(); h.daily.scores.shift(); }

  // Weekly: append if last entry label differs (max 12)
  const lastWeek = h.weekly.labels[h.weekly.labels.length - 1];
  if (lastWeek !== weekLabel) {
    h.weekly.labels.push(weekLabel);
    h.weekly.scores.push(newScore);
    if (h.weekly.labels.length > 12) { h.weekly.labels.shift(); h.weekly.scores.shift(); }
  }

  // Monthly: append if last entry label differs (max 12)
  const lastMonth = h.monthly.labels[h.monthly.labels.length - 1];
  if (lastMonth !== monthLabel) {
    h.monthly.labels.push(monthLabel);
    h.monthly.scores.push(newScore);
    if (h.monthly.labels.length > 12) { h.monthly.labels.shift(); h.monthly.scores.shift(); }
  }

  // Yearly: append if last entry label differs (max 5)
  const lastYear = h.yearly.labels[h.yearly.labels.length - 1];
  if (lastYear !== yearLabel) {
    h.yearly.labels.push(yearLabel);
    h.yearly.scores.push(newScore);
    if (h.yearly.labels.length > 5) { h.yearly.labels.shift(); h.yearly.scores.shift(); }
  }

  return h;
}

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════
async function main() {
  console.log('SlabStreet Score Engine\n');
  if (dryRun) console.log('  *** DRY RUN — no writes ***\n');

  // ── 1. Fetch all players from Supabase (paginated) ────────
  const players = [];
  const PAGE = 1000;
  let from = 0;
  while (true) {
    let query = sb.from('players').select('slug,name,team,league,cards,sales,stats,news,pillars,score_history').range(from, from + PAGE - 1);
    if (playerFilter) query = query.eq('slug', playerFilter);
    else if (leagueFilter) query = query.eq('league', leagueFilter);
    const { data, error } = await query;
    if (error) { console.error('Supabase fetch error:', error.message); process.exit(1); }
    if (!data || !data.length) break;
    players.push(...data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  if (!players.length) { console.log('No players found.'); return; }
  console.log(`  ${players.length} players loaded\n`);

  // ── 2. Group by league ────────────────────────────────────
  const byLeague = {};
  for (const p of players) {
    (byLeague[p.league] = byLeague[p.league] || []).push(p);
  }

  // ── 3. Pre-fetch standings & compute league percentiles ───
  const standings = {};    // league → { teamAbbrev → standings }
  const leaguePrices = {}; // league → sorted price array
  const leagueStats = {};  // league → { statKey → sorted array }
  const leagueGP = {};     // league → sorted games played array

  for (const [league, leaguePlayers] of Object.entries(byLeague)) {
    const cfg = LEAGUE_CFG[league];

    // Fetch ESPN standings for this league
    if (cfg && cfg.sport && cfg.league) {
      console.log(`  Fetching ${league} standings...`);
      standings[league] = await fetchAllStandings(cfg.sport, cfg.league, cfg.season);
      const teamCount = Object.keys(standings[league]).length;
      console.log(`    ${teamCount} teams found`);
    } else {
      standings[league] = {};
    }

    // Compute league-wide median card prices (for percentile ranking)
    const allPrices = [];
    for (const p of leaguePlayers) {
      const cards = p.cards || [];
      const prices = cards.map(c => parsePrice(c.price)).filter(v => v > 0);
      if (prices.length) {
        prices.sort((a, b) => a - b);
        allPrices.push(prices[Math.floor(prices.length / 2)]); // median per player
      }
    }
    leaguePrices[league] = allPrices.sort((a, b) => a - b);

    // Compute league-wide stat distributions (for percentile ranking)
    const statArrays = {};
    const weights = STAT_WEIGHTS[league] || [];
    for (const [statKey] of weights) {
      const vals = [];
      for (const p of leaguePlayers) {
        const v = getStatVal(p.stats, statKey);
        if (v !== null) vals.push(v);
      }
      statArrays[statKey] = vals.sort((a, b) => a - b);
    }
    leagueStats[league] = statArrays;

    // Games played distribution (for risk durability)
    const gpVals = [];
    for (const p of leaguePlayers) {
      const gp = getStatVal(p.stats, 'gamesPlayed');
      if (gp !== null) gpVals.push(gp);
    }
    leagueGP[league] = gpVals.sort((a, b) => a - b);
  }

  // ── 4. Score each player ──────────────────────────────────
  let updated = 0, failed = 0;
  const results = []; // for dry-run display
  const updates = [];  // batch for parallel writes

  for (const p of players) {
    const cfg = LEAGUE_CFG[p.league] || {};
    const teamStandings = standings[p.league]?.[p.team?.toUpperCase()];
    const teamSuccess = calcTeamSuccessScore(teamStandings, cfg.playoffSeeds || 0);

    // Compute pillars
    const pillarScores = {
      market:      calcMarket(p, leaguePrices[p.league] || []),
      scarcity:    calcScarcity(p),
      momentum:    calcMomentum(p, teamSuccess),
      performance: calcPerformance(p, leagueStats[p.league] || {}),
      risk:        calcRisk(p, teamSuccess, leagueGP[p.league] || []),
    };

    // Composite score (league-specific weights)
    const w = LEAGUE_WEIGHTS[p.league] || DEFAULT_WEIGHTS;
    const score = clamp(
      pillarScores.market * w.market +
      pillarScores.scarcity * w.scarcity +
      pillarScores.momentum * w.momentum +
      pillarScores.performance * w.performance +
      pillarScores.risk * w.risk
    );

    // Signal
    const signal = score >= 70 ? 'BUY' : score >= 40 ? 'HOLD' : 'SELL';

    // Build pillars array
    const pillars = Object.entries(pillarScores).map(([key, s]) => ({
      label: PILLAR_META[key].label,
      score: s,
      color: PILLAR_META[key].color,
      key,
    }));

    // Score history
    const scoreHistory = updateScoreHistory(p.score_history, score);

    if (dryRun || playerFilter) {
      results.push({ slug: p.slug, score, signal, pillarScores });
    }

    if (!dryRun) {
      updates.push({ slug: p.slug, score, signal, pillars, score_history: scoreHistory, updated_at: new Date().toISOString() });
    }
  }

  // ── 4b. Batch write to Supabase (25 concurrent) ──────────
  if (!dryRun && updates.length) {
    const BATCH = 25;
    for (let i = 0; i < updates.length; i += BATCH) {
      const batch = updates.slice(i, i + BATCH);
      const results = await Promise.allSettled(
        batch.map(u => sb.from('players').update({
          score: u.score, signal: u.signal, pillars: u.pillars,
          score_history: u.score_history, updated_at: u.updated_at,
        }).eq('slug', u.slug))
      );
      for (const r of results) {
        if (r.status === 'fulfilled' && !r.value.error) updated++;
        else failed++;
      }
      if (i % 500 === 0 && i > 0) process.stdout.write(`  ${i}/${updates.length} updated\r`);
    }
    console.log();
  }

  // ── 5. Output ─────────────────────────────────────────────
  if (results.length) {
    console.log('\n── Results ──\n');
    for (const r of results) {
      const ps = r.pillarScores;
      console.log(
        `  ${r.slug.padEnd(30)} Score: ${String(r.score).padStart(3)} [${r.signal}]  ` +
        `M:${ps.market} S:${ps.scarcity} Mo:${ps.momentum} P:${ps.performance} R:${ps.risk}`
      );
    }
  }

  if (!dryRun) {
    console.log(`\nDone! ${updated} updated, ${failed} failed.`);
  } else {
    console.log(`\nDry run complete. ${results.length} players scored.`);
  }
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
