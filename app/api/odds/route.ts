import { NextResponse } from 'next/server';

/*
  GET /api/odds?player=Wembanyama&team=spurs
  
  Returns:
  - Player championship odds (from The Odds API)
  - Team success score (0-100) derived from:
      * Current standings (win %, playoff seed) — ESPN free API
      * Playoff odds — derived from standings position
      * Championship futures odds — from The Odds API
  - Team success multiplier (0.80 – 1.25) for use in Momentum scoring
  
  Cached 1 hour — futures and standings don't change minute to minute.
*/

// ─────────────────────────────────────────────────────────────
// PLAYER → TEAM MAPPING
// Hardcoded for now — will be driven by Supabase once roster is live
// ─────────────────────────────────────────────────────────────
const PLAYER_TEAM_MAP: Record<string, { espnSlug: string; fullName: string; champOddsKeyword: string }> = {
  wembanyama:  { espnSlug: 'san-antonio-spurs',     fullName: 'San Antonio Spurs',   champOddsKeyword: 'san antonio spurs' },
  wemby:       { espnSlug: 'san-antonio-spurs',     fullName: 'San Antonio Spurs',   champOddsKeyword: 'san antonio spurs' },
  luka:        { espnSlug: 'los-angeles-lakers',    fullName: 'Los Angeles Lakers',  champOddsKeyword: 'los angeles lakers' },
  doncic:      { espnSlug: 'los-angeles-lakers',    fullName: 'Los Angeles Lakers',  champOddsKeyword: 'los angeles lakers' },
  morant:      { espnSlug: 'memphis-grizzlies',     fullName: 'Memphis Grizzlies',   champOddsKeyword: 'memphis grizzlies' },
  ja:          { espnSlug: 'memphis-grizzlies',     fullName: 'Memphis Grizzlies',   champOddsKeyword: 'memphis grizzlies' },
  edwards:     { espnSlug: 'minnesota-timberwolves',fullName: 'Minnesota Timberwolves', champOddsKeyword: 'minnesota timberwolves' },
  ant:         { espnSlug: 'minnesota-timberwolves',fullName: 'Minnesota Timberwolves', champOddsKeyword: 'minnesota timberwolves' },
};

// ─────────────────────────────────────────────────────────────
// TEAM SUCCESS SCORING
// Combines standings position + win % + championship odds
// Returns score 0-100 and multiplier 0.80-1.25
// ─────────────────────────────────────────────────────────────

interface StandingsData {
  wins: number;
  losses: number;
  winPct: number;
  playoffSeed: number | null;   // 1-10 in conf, null if out of playoff picture
  conferenceRank: number;
}

interface TeamSuccessResult {
  score: number;           // 0-100
  multiplier: number;      // 0.80-1.25
  label: string;           // human-readable tier
  wins: number;
  losses: number;
  winPct: number;
  playoffSeed: number | null;
  champOdds: string | null;
}

function calcTeamSuccessScore(standings: StandingsData, champOddsAmerican: number | null): TeamSuccessResult {
  let score = 50; // neutral baseline

  // Standing position component (up to +/- 30 points)
  // Win % drives this — .600+ is contender territory in NBA
  if (standings.winPct >= 0.650) score += 30;
  else if (standings.winPct >= 0.580) score += 20;
  else if (standings.winPct >= 0.500) score += 10;
  else if (standings.winPct >= 0.400) score -= 5;
  else if (standings.winPct >= 0.300) score -= 15;
  else score -= 25; // tank territory

  // Playoff seed component (up to +/- 10 points)
  if (standings.playoffSeed !== null) {
    if (standings.playoffSeed <= 3) score += 10;       // top seed, bye week
    else if (standings.playoffSeed <= 6) score += 5;   // solid playoff spot
    else if (standings.playoffSeed <= 10) score += 2;  // play-in range
  } else {
    score -= 10; // fully out of playoff picture
  }

  // Championship odds component (up to +15 points)
  // American odds: -200 = heavy favorite, +10000 = longshot
  if (champOddsAmerican !== null) {
    if (champOddsAmerican <= -200) score += 15;       // massive favorite
    else if (champOddsAmerican <= 300) score += 12;   // top contender
    else if (champOddsAmerican <= 800) score += 8;    // legitimate contender
    else if (champOddsAmerican <= 2000) score += 4;   // dark horse
    else if (champOddsAmerican <= 5000) score += 2;   // longshot but alive
    // above 5000 = no meaningful boost
  }

  score = Math.round(Math.max(0, Math.min(100, score)));

  // Map score to multiplier
  let multiplier: number;
  let label: string;
  if (score >= 80) {
    multiplier = 1.25;
    label = 'Championship Contender';
  } else if (score >= 65) {
    multiplier = 1.15;
    label = 'Playoff Contender';
  } else if (score >= 50) {
    multiplier = 1.05;
    label = 'Playoff Bound';
  } else if (score >= 35) {
    multiplier = 1.00;
    label = 'Play-In Range';
  } else if (score >= 20) {
    multiplier = 0.90;
    label = 'Lottery Bound';
  } else {
    multiplier = 0.80;
    label = 'Rebuilding';
  }

  return {
    score,
    multiplier,
    label,
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
// ESPN STANDINGS FETCH
// Free API — no key required
// ─────────────────────────────────────────────────────────────
async function fetchTeamStandings(espnSlug: string): Promise<StandingsData | null> {
  try {
    const url = 'https://site.api.espn.com/apis/v2/sports/basketball/nba/standings?season=2025';
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;

    const data = await res.json();
    const groups = data?.children || [];

    let teamEntry: any = null;
    let conferenceRank = 0;
    let seed = 0;

    for (const group of groups) {
      const standings = group?.standings?.entries || [];
      for (let i = 0; i < standings.length; i++) {
        const entry = standings[i];
        const teamSlug = entry?.team?.slug?.toLowerCase() || '';
        const teamLink = entry?.team?.links?.find((l: any) => l.rel?.includes('clubhouse'))?.href || '';
        
        if (teamSlug === espnSlug || teamLink.toLowerCase().includes(espnSlug)) {
          teamEntry = entry;
          seed = i + 1;
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

    // Top 10 in conference = playoff/play-in eligible
    const playoffSeed = conferenceRank <= 10 ? conferenceRank : null;

    return { wins, losses, winPct: parseFloat(winPct), playoffSeed, conferenceRank };
  } catch (err) {
    console.error('ESPN standings fetch error:', err);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// CHAMPIONSHIP ODDS FETCH
// From The Odds API — same as before, now returns raw number
// ─────────────────────────────────────────────────────────────
async function fetchChampOdds(champOddsKeyword: string, apiKey: string): Promise<number | null> {
  try {
    const url = `https://api.the-odds-api.com/v4/sports/basketball_nba_championship_winner/odds?apiKey=${apiKey}&regions=us&markets=outrights&oddsFormat=american`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;

    const events = await res.json();
    for (const event of events) {
      for (const bookmaker of (event.bookmakers || [])) {
        for (const market of (bookmaker.markets || [])) {
          for (const outcome of (market.outcomes || [])) {
            if (outcome.name?.toLowerCase().includes(champOddsKeyword)) {
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

  const apiKey = process.env.ODDS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'ODDS_API_KEY not configured', odds: [] }, { status: 500 });
  }

  // Look up team for this player
  const teamInfo = PLAYER_TEAM_MAP[playerSlug] || null;

  // Fetch player championship odds (existing behavior — kept for player page display)
  const playerOdds: { market: string; book: string; odds: string }[] = [];
  try {
    const url = `https://api.the-odds-api.com/v4/sports/basketball_nba_championship_winner/odds?apiKey=${apiKey}&regions=us&markets=outrights&oddsFormat=american`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (res.ok) {
      const events = await res.json();
      for (const event of events) {
        for (const bookmaker of (event.bookmakers || [])) {
          for (const market of (bookmaker.markets || [])) {
            for (const outcome of (market.outcomes || [])) {
              const outcomeName: string = outcome.name?.toLowerCase() || '';
              if (playerSlug && outcomeName.includes(playerSlug)) {
                if (!playerOdds.find(r => r.market === 'NBA Champion')) {
                  const price: number = outcome.price;
                  playerOdds.push({
                    market: 'NBA Champion',
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
  if (teamInfo) {
    const [standings, champOdds] = await Promise.all([
      fetchTeamStandings(teamInfo.espnSlug),
      fetchChampOdds(teamInfo.champOddsKeyword, apiKey),
    ]);

    if (standings) {
      teamSuccess = calcTeamSuccessScore(standings, champOdds);
    }
  }

  return NextResponse.json({
    odds: playerOdds,
    team_success: teamSuccess,
    team_name: teamInfo?.fullName || null,
  });
}
