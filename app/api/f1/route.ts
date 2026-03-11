import { NextResponse } from 'next/server';

/*
  GET /api/f1?view=race|qualifying|standings

  Returns F1 data from ESPN:
  - race: Latest race results (driver positions)
  - qualifying: Latest qualifying results
  - standings: Championship standings (drivers + constructors)

  Response varies by view:
  - race/qualifying: { raceName, results: F1Result[], status }
  - standings: { drivers: StandingEntry[], constructors: StandingEntry[] }

  5-minute cache.
*/

// ─── Types ───────────────────────────────────────────────────
interface F1Result {
  position: number;
  driver: string;
  team: string;
  winner: boolean;
}

interface StandingEntry {
  rank: number;
  name: string;
  points: number;
}

// ─── Cache ───────────────────────────────────────────────────
interface CacheEntry {
  data: unknown;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000;

function getCached(key: string): unknown | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, timestamp: Date.now() });
}

// ─── ESPN Fetchers ───────────────────────────────────────────
async function fetchRaceResults(): Promise<{
  raceName: string;
  results: F1Result[];
  status: string;
}> {
  const res = await fetch(
    'https://site.api.espn.com/apis/site/v2/sports/racing/f1/scoreboard',
    { next: { revalidate: 300 } }
  );
  if (!res.ok) throw new Error(`ESPN returned ${res.status}`);
  const data = await res.json();

  const event = data.events?.[0];
  if (!event) return { raceName: '', results: [], status: 'No race data' };

  const raceName = event.name || 'Grand Prix';
  const status = event.status?.type?.description || 'Unknown';
  const competition = event.competitions?.[0];
  const competitors = competition?.competitors || [];

  const results: F1Result[] = competitors.map(
    (c: { order: number; athlete?: { displayName?: string }; team?: { displayName?: string }; winner?: boolean }) => ({
      position: c.order,
      driver: c.athlete?.displayName || 'Unknown',
      team: c.team?.displayName || '',
      winner: c.winner || false,
    })
  );

  return { raceName, results, status };
}

async function fetchQualifying(): Promise<{
  raceName: string;
  results: F1Result[];
  status: string;
}> {
  // ESPN doesn't have a separate qualifying endpoint — use the race schedule
  // and check for qualifying status. For now, return the most recent event data.
  // A future improvement could parse qualifying sessions if ESPN exposes them.
  const res = await fetch(
    'https://site.api.espn.com/apis/site/v2/sports/racing/f1/scoreboard',
    { next: { revalidate: 300 } }
  );
  if (!res.ok) throw new Error(`ESPN returned ${res.status}`);
  const data = await res.json();

  const event = data.events?.[0];
  if (!event)
    return { raceName: '', results: [], status: 'No qualifying data' };

  const raceName = event.name || 'Grand Prix';

  // Check if there's qualifying data in sub-competitions
  const competitions = event.competitions || [];
  // Try to find a qualifying competition (type text might include "Qualifying")
  const qualiComp = competitions.find(
    (c: { type?: { text?: string } }) =>
      c.type?.text?.toLowerCase().includes('qualifying')
  );

  if (qualiComp) {
    const competitors = qualiComp.competitors || [];
    const results: F1Result[] = competitors.map(
      (c: { order: number; athlete?: { displayName?: string }; team?: { displayName?: string }; winner?: boolean }) => ({
        position: c.order,
        driver: c.athlete?.displayName || 'Unknown',
        team: c.team?.displayName || '',
        winner: false,
      })
    );
    return { raceName, results, status: 'Qualifying' };
  }

  // Fallback: use race results as grid order indicator
  return {
    raceName,
    results: [],
    status: 'Qualifying data not available for this event',
  };
}

async function fetchStandings(): Promise<{
  drivers: StandingEntry[];
  constructors: StandingEntry[];
}> {
  const res = await fetch(
    'https://site.api.espn.com/apis/v2/sports/racing/f1/standings',
    { next: { revalidate: 300 } }
  );
  if (!res.ok) throw new Error(`ESPN returned ${res.status}`);
  const data = await res.json();

  const children = data.children || [];

  const driverChild = children.find(
    (c: { name?: string }) => c.name?.toLowerCase().includes('driver')
  );
  const constructorChild = children.find(
    (c: { name?: string }) => c.name?.toLowerCase().includes('constructor')
  );

  const drivers: StandingEntry[] = (
    driverChild?.standings?.entries || []
  ).map(
    (e: {
      athlete?: { displayName?: string };
      stats?: { name: string; displayValue?: string }[];
    }) => ({
      rank:
        Number(e.stats?.find((s) => s.name === 'rank')?.displayValue) || 0,
      name: e.athlete?.displayName || 'Unknown',
      points:
        Number(
          e.stats?.find((s) => s.name === 'championshipPts')?.displayValue
        ) || 0,
    })
  );

  const constructors: StandingEntry[] = (
    constructorChild?.standings?.entries || []
  ).map(
    (e: {
      team?: { displayName?: string };
      stats?: { name: string; displayValue?: string }[];
    }) => ({
      rank:
        Number(e.stats?.find((s) => s.name === 'rank')?.displayValue) || 0,
      name: e.team?.displayName || 'Unknown',
      points:
        Number(
          e.stats?.find((s) => s.name === 'championshipPts')?.displayValue
        ) || 0,
    })
  );

  return { drivers, constructors };
}

// ─── Route Handler ───────────────────────────────────────────
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view') || 'race';

    const cacheKey = `f1:${view}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached as Record<string, unknown>, cached: true });
    }

    let result: Record<string, unknown>;

    switch (view) {
      case 'qualifying':
        result = await fetchQualifying();
        break;
      case 'standings':
        result = await fetchStandings();
        break;
      case 'race':
      default:
        result = await fetchRaceResults();
        break;
    }

    setCache(cacheKey, result);
    return NextResponse.json({ ...result, cached: false });
  } catch (error) {
    console.error('[f1] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch F1 data' },
      { status: 500 }
    );
  }
}
