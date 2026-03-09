import { NextResponse } from 'next/server';
import { getLeagueConfig } from '../../../lib/leagues';

/*
  GET /api/stats?player=Victor+Wembanyama&league=NBA&team=SAS

  Fetches live season stats from ESPN's free API.
  Returns formatted {label, val}[] matching our player stats schema.
  Cached 1 hour. Falls back gracefully if ESPN search fails.
*/

// ── ESPN stat key → display label, per league ────────────────
const STAT_MAP: Record<string, { keys: string[]; labels: string[] }> = {
  NBA: {
    keys:   ['avgPoints', 'avgRebounds', 'avgAssists', 'avgBlocks', 'fieldGoalPct', 'gamesPlayed'],
    labels: ['PPG',       'RPG',         'APG',        'BPG',       'FG%',          'GP'],
  },
  NFL: {
    keys:   ['passingYards', 'passingTouchdowns', 'rushingYards', 'receivingYards', 'QBRating', 'gamesPlayed'],
    labels: ['PASS YDS',     'PASS TD',           'RUSH YDS',     'REC YDS',        'QBR',      'GP'],
  },
  MLB: {
    keys:   ['avg', 'homeRuns', 'RBIs', 'OPS', 'ERA', 'gamesPlayed'],
    labels: ['AVG', 'HR',       'RBI',  'OPS', 'ERA', 'GP'],
  },
  NHL: {
    keys:   ['goals', 'assists', 'points', 'plusMinus', 'gamesPlayed'],
    labels: ['G',     'A',       'PTS',    '+/-',       'GP'],
  },
  F1: {
    keys:   ['championshipPts', 'wins', 'poles', 'podiums'],
    labels: ['PTS',             'WINS', 'POLES', 'PODIUMS'],
  },
};

// ── Search ESPN for a player ─────────────────────────────────
async function searchEspnPlayer(
  name: string,
  sport: string,
  league: string,
): Promise<{ id: string; name: string } | null> {
  try {
    const url = `https://site.api.espn.com/apis/common/v3/search?query=${encodeURIComponent(name)}&type=player&sport=${sport}&league=${league}&limit=5`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();

    // Search results are in data.items or data.results
    const items = data.items || data.results || [];
    if (items.length === 0) return null;

    // Return first match
    const first = items[0];
    return {
      id: first.id || first.$ref?.match(/athletes\/(\d+)/)?.[1] || '',
      name: first.displayName || first.name || name,
    };
  } catch {
    return null;
  }
}

// ── Fetch athlete stats from ESPN ────────────────────────────
async function fetchEspnStats(
  athleteId: string,
  sport: string,
  league: string,
): Promise<Record<string, any> | null> {
  try {
    const url = `https://site.api.espn.com/apis/common/v3/sports/${sport}/${league}/athletes/${athleteId}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch {
    return null;
  }
}

// ── Extract stats from ESPN athlete data ─────────────────────
function extractStats(
  athleteData: any,
  leagueId: string,
): { label: string; val: string }[] {
  const mapping = STAT_MAP[leagueId];
  if (!mapping) return [];

  // ESPN stores stats in different places depending on the sport
  // Try: athlete.statistics[0].splits[0].stats or categories
  const stats: Record<string, string> = {};

  try {
    // Navigate the stats structure
    const categories = athleteData?.statistics?.categories
      || athleteData?.statistics
      || [];

    if (Array.isArray(categories)) {
      for (const cat of categories) {
        // Each category has stats array or splits
        const statItems = cat?.stats || cat?.splits?.[0]?.stats || [];
        if (Array.isArray(statItems)) {
          for (const s of statItems) {
            if (s.name && s.displayValue !== undefined) {
              stats[s.name] = s.displayValue;
            }
          }
        }
      }
    }

    // Also check top-level stats (some endpoints use this)
    if (athleteData?.stats) {
      for (const s of athleteData.stats) {
        if (s.name && s.displayValue !== undefined) {
          stats[s.name] = s.displayValue;
        }
      }
    }
  } catch {
    // stats extraction failed, return empty
  }

  // Map ESPN stat keys to our labels
  const result: { label: string; val: string }[] = [];
  for (let i = 0; i < mapping.keys.length; i++) {
    const key = mapping.keys[i];
    const label = mapping.labels[i];
    const val = stats[key] || '';
    if (val) result.push({ label, val });
  }

  return result;
}

// ── Fetch stats from ESPN athlete overview ───────────────────
// ESPN overview returns parallel arrays: statistics.labels[] + statistics.splits[].stats[]
async function fetchEspnAthleteOverview(
  sport: string,
  league: string,
  athleteId: string,
): Promise<{ label: string; val: string }[]> {
  try {
    const url = `https://site.api.espn.com/apis/common/v3/sports/${sport}/${league}/athletes/${athleteId}/overview`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();

    const statistics = data?.statistics;
    if (!statistics) return [];

    // ESPN uses parallel arrays: labels[i] maps to splits[0].stats[i]
    const labels: string[] = statistics.labels || [];
    const splits = statistics.splits || [];
    // Use "Regular Season" split (first one) by default
    const values: string[] = splits[0]?.stats || [];

    if (labels.length === 0 || values.length === 0) return [];

    const stats: { label: string; val: string }[] = [];
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

// ── Fetch F1 stats from ESPN F1 standings ────────────────────
async function fetchF1Stats(driverName: string): Promise<{ label: string; val: string }[]> {
  try {
    const url = 'https://site.api.espn.com/apis/v2/sports/racing/f1/standings?season=2025';
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();

    const entries = data?.standings?.[0]?.entries || data?.children?.[0]?.standings?.entries || [];
    const nameLower = driverName.toLowerCase();

    for (const entry of entries) {
      const athleteName = (entry?.athlete?.displayName || '').toLowerCase();
      if (athleteName.includes(nameLower) || nameLower.includes(athleteName.split(' ').pop() || '')) {
        const stats = entry?.stats || [];
        const result: { label: string; val: string }[] = [];
        for (const s of stats) {
          if (s.abbreviation && s.displayValue) {
            result.push({ label: s.abbreviation.toUpperCase(), val: s.displayValue });
          }
        }
        if (result.length > 0) return result;
      }
    }
    return [];
  } catch {
    return [];
  }
}

// ── ROUTE HANDLER ────────────────────────────────────────────
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const playerName = searchParams.get('player') || '';
  const leagueId   = searchParams.get('league') || 'NBA';
  const teamAbbrev = searchParams.get('team') || '';

  if (!playerName) {
    return NextResponse.json({ stats: [], error: 'player= required' }, { status: 400 });
  }

  const config = getLeagueConfig(leagueId);

  // F1 uses standings endpoint (no individual athlete pages on ESPN)
  if (leagueId === 'F1') {
    const stats = await fetchF1Stats(playerName);
    return NextResponse.json({
      stats,
      source: stats.length > 0 ? 'espn_f1_standings' : 'none',
      cached_at: new Date().toISOString(),
    });
  }

  if (!config.espnSport || !config.espnLeague) {
    return NextResponse.json({ stats: [], source: 'none' });
  }

  // Search for the player on ESPN
  const player = await searchEspnPlayer(playerName, config.espnSport, config.espnLeague);
  if (!player?.id) {
    return NextResponse.json({
      stats: [],
      source: 'none',
      note: `Player "${playerName}" not found on ESPN`,
    });
  }

  // Try overview endpoint first (most structured)
  let stats = await fetchEspnAthleteOverview(config.espnSport, config.espnLeague, player.id);

  // Fall back to full athlete endpoint
  if (stats.length === 0) {
    const athleteData = await fetchEspnStats(player.id, config.espnSport, config.espnLeague);
    if (athleteData) {
      stats = extractStats(athleteData, leagueId);
    }
  }

  return NextResponse.json({
    stats,
    espn_id: player.id,
    espn_name: player.name,
    source: stats.length > 0 ? 'espn' : 'none',
    cached_at: new Date().toISOString(),
  });
}
