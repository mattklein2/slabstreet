#!/usr/bin/env node

/**
 * Bulk-updates player stats from ESPN's free API.
 * Fetches team rosters (which include ESPN athlete IDs),
 * then fetches stats for each athlete and writes to Supabase.
 *
 * Usage: node scripts/update-stats.mjs [--league NBA]
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

// ── Config ───────────────────────────────────────────────────
const ESPN_LEAGUES = {
  NBA: { sport: 'basketball', league: 'nba' },
  NFL: { sport: 'football',   league: 'nfl' },
  MLB: { sport: 'baseball',   league: 'mlb' },
  NHL: { sport: 'hockey',     league: 'nhl' },
};

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function makeSlug(name) {
  return name.toLowerCase().replace(/['']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// ── Fetch athlete stats from ESPN overview ───────────────────
// ESPN returns parallel arrays: statistics.labels[] + statistics.splits[].stats[]
async function fetchAthleteStats(sport, league, athleteId) {
  try {
    const url = `https://site.api.espn.com/apis/common/v3/sports/${sport}/${league}/athletes/${athleteId}/overview`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();

    const statistics = data?.statistics;
    if (!statistics) return [];

    const labels = statistics.labels || [];
    const splits = statistics.splits || [];
    const values = splits[0]?.stats || [];

    if (labels.length === 0 || values.length === 0) return [];

    const stats = [];
    for (let i = 0; i < labels.length; i++) {
      if (labels[i] && values[i]) {
        stats.push({ label: labels[i], val: values[i] });
      }
    }
    return stats;
  } catch {
    return [];
  }
}

// ── Fetch full athlete data (fallback) ───────────────────────
// Same parallel array format at the athlete detail endpoint
async function fetchAthleteStatsFallback(sport, league, athleteId) {
  try {
    const url = `https://site.api.espn.com/apis/common/v3/sports/${sport}/${league}/athletes/${athleteId}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();

    const statistics = data?.statistics;
    if (!statistics) return [];

    const labels = statistics.labels || [];
    const splits = statistics.splits || [];
    const values = splits[0]?.stats || [];

    if (labels.length === 0 || values.length === 0) return [];

    const stats = [];
    for (let i = 0; i < labels.length; i++) {
      if (labels[i] && values[i]) {
        stats.push({ label: labels[i], val: values[i] });
      }
    }
    return stats;
  } catch {
    return [];
  }
}

// ── Fetch roster for a team ──────────────────────────────────
async function fetchRoster(sport, league, teamId) {
  const url = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams/${teamId}/roster`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  const athletes = [];
  if (Array.isArray(data.athletes)) {
    for (const group of data.athletes) {
      if (Array.isArray(group.items)) athletes.push(...group.items);
      else if (group.displayName) athletes.push(group);
    }
  }
  return athletes;
}

// ── Fetch teams ──────────────────────────────────────────────
async function fetchTeams(sport, league) {
  const url = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams?limit=100`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`ESPN teams ${res.status}`);
  const data = await res.json();
  return (data.sports?.[0]?.leagues?.[0]?.teams || []).map(t => t.team);
}

// ── Main ─────────────────────────────────────────────────────
async function main() {
  const leagueFilter = process.argv.find(a => a.startsWith('--league='))?.split('=')[1]?.toUpperCase();
  const leagues = leagueFilter ? { [leagueFilter]: ESPN_LEAGUES[leagueFilter] } : ESPN_LEAGUES;

  if (leagueFilter && !ESPN_LEAGUES[leagueFilter]) {
    console.error(`Unknown league: ${leagueFilter}. Options: NBA, NFL, MLB, NHL`);
    process.exit(1);
  }

  console.log('SlabStreet Stats Updater\n');

  let updated = 0, skipped = 0, notFound = 0;

  for (const [leagueId, cfg] of Object.entries(leagues)) {
    console.log(`\n── ${leagueId} ──`);
    const teams = await fetchTeams(cfg.sport, cfg.league);
    console.log(`  ${teams.length} teams`);

    for (const team of teams) {
      await sleep(100);
      const roster = await fetchRoster(cfg.sport, cfg.league, team.id);

      for (const athlete of roster) {
        const name = athlete.displayName || athlete.fullName || `${athlete.firstName} ${athlete.lastName}`;
        const slug = makeSlug(name);
        const espnId = athlete.id;

        if (!espnId) { skipped++; continue; }

        await sleep(150); // polite delay

        // Fetch stats
        let stats = await fetchAthleteStats(cfg.sport, cfg.league, espnId);
        if (stats.length === 0) {
          stats = await fetchAthleteStatsFallback(cfg.sport, cfg.league, espnId);
        }

        if (stats.length === 0) { skipped++; continue; }

        // Trim to top 6 stats
        stats = stats.slice(0, 6);

        // Update in Supabase — match by slug
        const { error } = await sb
          .from('players')
          .update({ stats })
          .eq('slug', slug);

        if (error) {
          // Try with team-disambiguated slug
          const altSlug = `${slug}-${team.abbreviation.toLowerCase()}`;
          const { error: e2 } = await sb.from('players').update({ stats }).eq('slug', altSlug);
          if (e2) { notFound++; }
          else updated++;
        } else {
          updated++;
        }
      }

      process.stdout.write(`  ${team.abbreviation.padEnd(4)} ${roster.length} players\r`);
    }
    console.log();
  }

  console.log(`\nDone! ${updated} updated, ${skipped} skipped (no stats), ${notFound} not found in DB.`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
