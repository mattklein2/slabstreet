import { NextResponse } from 'next/server';
import { getLeagueConfig, type LeagueId } from '@/lib/leagues';

/*
  GET /api/schedule?league=NBA&date=20260310

  Merges ESPN scoreboard data with The Odds API odds for a full daily
  schedule view. Returns game scores, statuses, and betting lines.

  Query params:
    league  — required, one of LeagueId (NBA, NFL, MLB, NHL, WNBA, F1)
    date    — optional, YYYYMMDD format, defaults to today

  Response: { games: ScheduleGame[], league: string, date: string }
*/

// ─── Types ───────────────────────────────────────────────────

interface ScheduleGame {
  id: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  home_score: string | null;
  away_score: string | null;
  status: string;
  period: number | null;
  clock: string | null;
  spread: string | null;
  total: string | null;
  boxscoreUrl: string | null;
}

// ─── In-memory cache (5-minute TTL) ─────────────────────────

interface CacheEntry {
  data: { games: ScheduleGame[]; league: string; date: string };
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCached(key: string): CacheEntry['data'] | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: CacheEntry['data']): void {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

// ─── Helpers ─────────────────────────────────────────────────

/** Extract the last word of a team name, lowercased, for fuzzy matching. */
function teamKey(name: string): string {
  const parts = name.trim().split(/\s+/);
  return (parts[parts.length - 1] || '').toLowerCase();
}

/** Get today's date as YYYYMMDD in local server time. */
function todayYYYYMMDD(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

// ─── ESPN scoreboard fetch ───────────────────────────────────

interface ESPNEvent {
  id: string;
  date: string;
  competitions: Array<{
    competitors: Array<{
      homeAway: 'home' | 'away';
      team: { displayName: string; abbreviation: string };
      score: string;
    }>;
    status: {
      type: { name: string; completed: boolean; description: string };
      period: number;
      displayClock: string;
    };
  }>;
}

async function fetchESPNScoreboard(
  espnSport: string,
  espnLeague: string,
  date: string,
): Promise<ESPNEvent[]> {
  const url = `https://site.api.espn.com/apis/site/v2/sports/${espnSport}/${espnLeague}/scoreboard?dates=${date}`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) return [];
  const data = await res.json();
  return data?.events ?? [];
}

// ─── Odds API fetch ──────────────────────────────────────────

interface OddsEvent {
  id: string;
  home_team: string;
  away_team: string;
  bookmakers: Array<{
    markets: Array<{
      key: string;
      outcomes: Array<{ name: string; price: number; point?: number }>;
    }>;
  }>;
}

interface ParsedOdds {
  spread: string | null;
  total: string | null;
}

async function fetchOdds(oddsApiGameKey: string): Promise<OddsEvent[]> {
  const apiKey = process.env.ODDS_API_KEY;
  if (!apiKey) return [];

  const url = `https://api.the-odds-api.com/v4/sports/${oddsApiGameKey}/odds?apiKey=${apiKey}&regions=us&markets=spreads,totals&oddsFormat=american`;
  const res = await fetch(url, { next: { revalidate: 900 } });
  if (!res.ok) return [];
  return (await res.json()) ?? [];
}

/** Build a lookup: teamKey(home) -> { spread, total } from odds data. */
function buildOddsLookup(events: OddsEvent[]): Map<string, ParsedOdds> {
  const lookup = new Map<string, ParsedOdds>();

  for (const event of events) {
    // Use the first bookmaker that has data (consensus-ish)
    const bk = event.bookmakers?.[0];
    if (!bk) continue;

    let spread: string | null = null;
    let total: string | null = null;

    for (const market of bk.markets ?? []) {
      if (market.key === 'spreads') {
        const homeOut = market.outcomes.find((o) => o.name === event.home_team);
        if (homeOut?.point != null) {
          spread = homeOut.point > 0 ? `+${homeOut.point}` : `${homeOut.point}`;
        }
      }
      if (market.key === 'totals') {
        const overOut = market.outcomes.find((o) => o.name === 'Over');
        if (overOut?.point != null) {
          total = `${overOut.point}`;
        }
      }
    }

    // Key by both home and away team last-word for flexible matching
    const hk = teamKey(event.home_team);
    const ak = teamKey(event.away_team);
    const compositeKey = `${hk}|${ak}`;
    lookup.set(compositeKey, { spread, total });
  }

  return lookup;
}

// ─── Route handler ───────────────────────────────────────────

const VALID_LEAGUES = new Set<string>(['NBA', 'NFL', 'MLB', 'F1', 'NHL', 'WNBA']);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const leagueId = searchParams.get('league') || 'NBA';
  const date = searchParams.get('date') || todayYYYYMMDD();

  // Validate league
  if (!VALID_LEAGUES.has(leagueId)) {
    return NextResponse.json(
      { games: [], league: leagueId, date, error: `Invalid league: ${leagueId}` },
      { status: 400 },
    );
  }

  // Check cache
  const cacheKey = `schedule:${leagueId}:${date}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  const config = getLeagueConfig(leagueId);

  // If the league has no ESPN config, return empty gracefully
  if (!config.espnSport || !config.espnLeague) {
    const result = { games: [], league: leagueId, date };
    setCache(cacheKey, result);
    return NextResponse.json(result);
  }

  try {
    // Fetch ESPN scoreboard and odds in parallel
    const [espnEvents, oddsEvents] = await Promise.all([
      fetchESPNScoreboard(config.espnSport, config.espnLeague, date),
      config.oddsApiGameKey ? fetchOdds(config.oddsApiGameKey) : Promise.resolve([]),
    ]);

    // Build odds lookup by team name
    const oddsLookup = buildOddsLookup(oddsEvents);

    // Transform ESPN events into ScheduleGame objects
    const games: ScheduleGame[] = espnEvents.map((event) => {
      const comp = event.competitions?.[0];
      const homeComp = comp?.competitors?.find((c) => c.homeAway === 'home');
      const awayComp = comp?.competitors?.find((c) => c.homeAway === 'away');

      const homeName = homeComp?.team?.displayName ?? 'TBD';
      const awayName = awayComp?.team?.displayName ?? 'TBD';
      const homeScore = homeComp?.score ?? null;
      const awayScore = awayComp?.score ?? null;

      const statusType = comp?.status?.type?.name ?? 'STATUS_SCHEDULED';
      const statusDesc = comp?.status?.type?.description ?? 'Scheduled';
      const period = comp?.status?.period ?? null;
      const clock = comp?.status?.displayClock ?? null;

      // Fuzzy match odds by last word of home + away team names
      const hk = teamKey(homeName);
      const ak = teamKey(awayName);
      const compositeKey = `${hk}|${ak}`;
      const odds = oddsLookup.get(compositeKey);

      // Build boxscore URL for completed or in-progress games
      const isFinished = statusType === 'STATUS_FINAL';
      const boxscoreUrl = isFinished
        ? `/games/${config.espnSport}/${config.espnLeague}/${event.id}`
        : null;

      return {
        id: event.id,
        commence_time: event.date,
        home_team: homeName,
        away_team: awayName,
        home_score: homeScore,
        away_score: awayScore,
        status: statusDesc,
        period,
        clock,
        spread: odds?.spread ?? null,
        total: odds?.total ?? null,
        boxscoreUrl,
      };
    });

    // Sort by commence time
    games.sort(
      (a, b) => new Date(a.commence_time).getTime() - new Date(b.commence_time).getTime(),
    );

    const result = { games, league: leagueId, date };
    setCache(cacheKey, result);
    return NextResponse.json(result);
  } catch (err) {
    // Never crash — return empty with error info
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({
      games: [],
      league: leagueId,
      date,
      error: message,
    });
  }
}
