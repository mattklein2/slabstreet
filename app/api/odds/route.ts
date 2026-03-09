import { NextResponse } from 'next/server';
import { getLeagueConfig } from '../../../lib/leagues';

/*
  GET /api/odds?player=wemby&league=NBA&team=SAS

  Returns:
  - Player championship odds (from The Odds API)
  - Team success score (0-100) derived from:
      * Current standings (win %, playoff seed) — ESPN free API
      * Championship futures odds — from The Odds API
  - Team success multiplier (0.80 – 1.25) for use in Momentum scoring

  League-aware: uses lib/leagues.ts config for API endpoints and scoring.
  Cached 1 hour — futures and standings don't change minute to minute.
*/

// ─────────────────────────────────────────────────────────────
// TEAM SUCCESS SCORING
// Combines standings position + win % + championship odds
// Returns score 0-100 and multiplier 0.80-1.25
// ─────────────────────────────────────────────────────────────

interface StandingsData {
  wins: number;
  losses: number;
  winPct: number;
  playoffSeed: number | null;
  conferenceRank: number;
}

interface TeamSuccessResult {
  score: number;
  multiplier: number;
  label: string;
  wins: number;
  losses: number;
  winPct: number;
  playoffSeed: number | null;
  champOdds: string | null;
}

function calcTeamSuccessScore(standings: StandingsData, champOddsAmerican: number | null, playoffSeeds: number): TeamSuccessResult {
  let score = 50;

  // Win % component (up to +/- 30 points)
  if (standings.winPct >= 0.650) score += 30;
  else if (standings.winPct >= 0.580) score += 20;
  else if (standings.winPct >= 0.500) score += 10;
  else if (standings.winPct >= 0.400) score -= 5;
  else if (standings.winPct >= 0.300) score -= 15;
  else score -= 25;

  // Playoff seed component (up to +/- 10 points)
  if (standings.playoffSeed !== null) {
    if (standings.playoffSeed <= 3) score += 10;
    else if (standings.playoffSeed <= 6) score += 5;
    else if (standings.playoffSeed <= playoffSeeds) score += 2;
  } else {
    score -= 10;
  }

  // Championship odds component (up to +15 points)
  if (champOddsAmerican !== null) {
    if (champOddsAmerican <= -200) score += 15;
    else if (champOddsAmerican <= 300) score += 12;
    else if (champOddsAmerican <= 800) score += 8;
    else if (champOddsAmerican <= 2000) score += 4;
    else if (champOddsAmerican <= 5000) score += 2;
  }

  score = Math.round(Math.max(0, Math.min(100, score)));

  let multiplier: number;
  let label: string;
  if (score >= 80) { multiplier = 1.25; label = 'Championship Contender'; }
  else if (score >= 65) { multiplier = 1.15; label = 'Playoff Contender'; }
  else if (score >= 50) { multiplier = 1.05; label = 'Playoff Bound'; }
  else if (score >= 35) { multiplier = 1.00; label = 'Middle of Pack'; }
  else if (score >= 20) { multiplier = 0.90; label = 'Rebuilding'; }
  else { multiplier = 0.80; label = 'Bottom Tier'; }

  return {
    score, multiplier, label,
    wins: standings.wins,
    losses: standings.losses,
    winPct: standings.winPct,
    playoffSeed: standings.playoffSeed,
    champOdds: champOddsAmerican !== null
      ? (champOddsAmerican > 0 ? `+${champOddsAmerican}` : `${champOddsAmerican}`)
      : null,
  };
}

// ─────────────────────────────────────────────────────────────
// ESPN STANDINGS FETCH (league-aware)
// ─────────────────────────────────────────────────────────────
async function fetchTeamStandings(
  espnSport: string,
  espnLeague: string,
  season: string,
  teamAbbrev: string,
  playoffSeeds: number,
): Promise<StandingsData | null> {
  try {
    const url = `https://site.api.espn.com/apis/v2/sports/${espnSport}/${espnLeague}/standings?season=${season}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;

    const data = await res.json();
    const groups = data?.children || [];

    let teamEntry: any = null;
    let conferenceRank = 0;

    // Search through conference/division groups for the team
    for (const group of groups) {
      const standings = group?.standings?.entries || [];
      for (let i = 0; i < standings.length; i++) {
        const entry = standings[i];
        const abbrev = entry?.team?.abbreviation?.toUpperCase() || '';
        const teamSlug = entry?.team?.slug?.toLowerCase() || '';

        if (abbrev === teamAbbrev.toUpperCase() || teamSlug.includes(teamAbbrev.toLowerCase())) {
          teamEntry = entry;
          conferenceRank = i + 1;
          break;
        }
      }
      if (teamEntry) break;
    }

    if (!teamEntry) return null;

    const stats = teamEntry.stats || [];
    const wins   = stats.find((s: any) => s.name === 'wins')?.value ?? 0;
    const losses = stats.find((s: any) => s.name === 'losses')?.value ?? 0;
    const winPct = stats.find((s: any) => s.name === 'winPercent')?.value ?? (wins / (wins + losses || 1));
    const playoffSeed = conferenceRank <= playoffSeeds ? conferenceRank : null;

    return { wins, losses, winPct: parseFloat(winPct), playoffSeed, conferenceRank };
  } catch (err) {
    console.error('ESPN standings fetch error:', err);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// CHAMPIONSHIP ODDS FETCH (league-aware)
// ─────────────────────────────────────────────────────────────
async function fetchChampOdds(sportKey: string, teamKeyword: string, apiKey: string): Promise<number | null> {
  try {
    const url = `https://api.the-odds-api.com/v4/sports/${sportKey}/odds?apiKey=${apiKey}&regions=us&markets=outrights&oddsFormat=american`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;

    const events = await res.json();
    const keyword = teamKeyword.toLowerCase();
    for (const event of events) {
      for (const bookmaker of (event.bookmakers || [])) {
        for (const market of (bookmaker.markets || [])) {
          for (const outcome of (market.outcomes || [])) {
            if (outcome.name?.toLowerCase().includes(keyword)) {
              return outcome.price as number;
            }
          }
        }
      }
    }
    return null;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// ROUTE HANDLER
// ─────────────────────────────────────────────────────────────
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const playerSlug = (searchParams.get('player') || '').toLowerCase();
  const leagueId   = searchParams.get('league') || 'NBA';
  const teamAbbrev = (searchParams.get('team') || '').toUpperCase();

  const config = getLeagueConfig(leagueId);
  const apiKey = process.env.ODDS_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'ODDS_API_KEY not configured', odds: [] }, { status: 500 });
  }

  // If league has no odds/ESPN support, return empty gracefully
  if (!config.oddsApiSportKey || !config.espnSport || !config.espnLeague) {
    return NextResponse.json({ odds: [], team_success: null, team_name: teamAbbrev || null });
  }

  // Fetch player championship odds for display
  const playerOdds: { market: string; book: string; odds: string }[] = [];
  try {
    const url = `https://api.the-odds-api.com/v4/sports/${config.oddsApiSportKey}/odds?apiKey=${apiKey}&regions=us&markets=outrights&oddsFormat=american`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (res.ok) {
      const events = await res.json();
      for (const event of events) {
        for (const bookmaker of (event.bookmakers || [])) {
          for (const market of (bookmaker.markets || [])) {
            for (const outcome of (market.outcomes || [])) {
              const outcomeName: string = outcome.name?.toLowerCase() || '';
              // Match by team abbreviation or player slug in outcome name
              if (
                (teamAbbrev && outcomeName.includes(teamAbbrev.toLowerCase())) ||
                (playerSlug && outcomeName.includes(playerSlug))
              ) {
                if (!playerOdds.find(r => r.market === config.oddsApiMarketLabel)) {
                  const price: number = outcome.price;
                  playerOdds.push({
                    market: config.oddsApiMarketLabel,
                    book: bookmaker.title,
                    odds: price > 0 ? `+${price}` : `${price}`,
                  });
                }
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('Player odds fetch error:', err);
  }

  // Fetch team success data if team is known
  let teamSuccess: TeamSuccessResult | null = null;
  if (teamAbbrev && config.espnSport && config.espnLeague) {
    const [standings, champOdds] = await Promise.all([
      fetchTeamStandings(config.espnSport, config.espnLeague, config.espnStandingsSeason, teamAbbrev, config.teamSuccess.playoffSeeds),
      fetchChampOdds(config.oddsApiSportKey!, teamAbbrev.toLowerCase(), apiKey),
    ]);

    if (standings) {
      teamSuccess = calcTeamSuccessScore(standings, champOdds, config.teamSuccess.playoffSeeds);
    }
  }

  return NextResponse.json({
    odds: playerOdds,
    team_success: teamSuccess,
    team_name: teamAbbrev || null,
  });
}
