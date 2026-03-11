import { NextResponse } from 'next/server';

/*
  GET /api/f1?view=race|qualifying|standings|schedule
  GET /api/f1?view=race&eventId=X

  Returns F1 data from ESPN:
  - race: Latest race results (or specific race if eventId provided)
  - qualifying: Latest qualifying results
  - standings: Championship standings (drivers + constructors)
  - schedule: Full season calendar with status and winners

  Response varies by view:
  - race/qualifying: { raceName, results: F1Result[], status }
  - standings: { drivers: StandingEntry[], constructors: StandingEntry[] }
  - schedule: { races: ScheduleRace[] }

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

interface ScheduleRace {
  id: string;
  name: string;
  shortName: string;
  date: string;
  status: string;
  winner: string | null;
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

// ─── Helpers ─────────────────────────────────────────────────

function shortenRaceName(name: string): string {
  // ESPN names like "Qatar Airways Australian Grand Prix" or "STC Saudi Arabian Grand Prix"
  // Known location words that need the preceding word too
  const multiWord = ['arabian', 'states', 'city', 'paulo', 'dhabi', 'vegas'];
  const gpMatch = name.match(/(.+?)\s+Grand\s+Prix/i);
  if (!gpMatch) return name;
  const words = gpMatch[1].trim().split(/\s+/);
  const last = words[words.length - 1];
  if (words.length >= 2 && multiWord.includes(last.toLowerCase())) {
    return `${words[words.length - 2]} ${last} GP`;
  }
  return `${last} GP`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ESPNEvent = any;

function getSeasonYear(): number {
  return new Date().getFullYear();
}

// ─── ESPN Fetchers ───────────────────────────────────────────

async function fetchSeasonData(): Promise<ESPNEvent[]> {
  const cacheKey = 'f1:season_raw';
  const cached = getCached(cacheKey);
  if (cached) return cached as ESPNEvent[];

  const year = getSeasonYear();
  const res = await fetch(
    `https://site.api.espn.com/apis/site/v2/sports/racing/f1/scoreboard?dates=${year}`,
    { next: { revalidate: 300 } }
  );
  if (!res.ok) throw new Error(`ESPN returned ${res.status}`);
  const data = await res.json();

  const events = data.events || [];
  setCache(cacheKey, events);
  return events;
}

async function fetchSchedule(): Promise<{ races: ScheduleRace[] }> {
  const events = await fetchSeasonData();

  const races: ScheduleRace[] = events.map((event: ESPNEvent) => {
    const status = event.status?.type?.description || 'Unknown';
    const competitions = event.competitions || [];
    // Find race competition (last one, typically index 4) for winner
    const raceComp = competitions[competitions.length - 1];
    let winner: string | null = null;

    if (status === 'Final' && raceComp?.competitors) {
      const winnerEntry = raceComp.competitors.find(
        (c: { winner?: boolean }) => c.winner
      );
      if (winnerEntry) {
        winner = winnerEntry.athlete?.displayName || null;
      }
    }

    return {
      id: event.id,
      name: event.name || 'Grand Prix',
      shortName: shortenRaceName(event.name || 'Grand Prix'),
      date: event.date || '',
      status,
      winner,
    };
  });

  return { races };
}

function extractResults(competitors: ESPNEvent[]): F1Result[] {
  return (competitors || []).map(
    (c: { order: number; athlete?: { displayName?: string }; team?: { displayName?: string }; winner?: boolean }) => ({
      position: c.order,
      driver: c.athlete?.displayName || 'Unknown',
      team: c.team?.displayName || '',
      winner: c.winner || false,
    })
  );
}

async function fetchRaceByEventId(eventId: string): Promise<{
  raceName: string;
  results: F1Result[];
  status: string;
}> {
  const events = await fetchSeasonData();
  const event = events.find((e: ESPNEvent) => String(e.id) === eventId);

  if (!event) {
    return { raceName: '', results: [], status: 'Event not found' };
  }

  const raceName = event.name || 'Grand Prix';
  const status = event.status?.type?.description || 'Unknown';
  const competitions = event.competitions || [];
  // Race competition is typically the last one
  const raceComp = competitions[competitions.length - 1];

  return { raceName, results: extractResults(raceComp?.competitors), status };
}

async function fetchQualifyingByEventId(eventId: string): Promise<{
  raceName: string;
  results: F1Result[];
  status: string;
}> {
  const events = await fetchSeasonData();
  const event = events.find((e: ESPNEvent) => String(e.id) === eventId);

  if (!event) {
    return { raceName: '', results: [], status: 'Event not found' };
  }

  const raceName = event.name || 'Grand Prix';
  const competitions = event.competitions || [];

  // Find qualifying competition by abbreviation "Qual" or type text
  const qualiComp = competitions.find(
    (c: { type?: { abbreviation?: string; text?: string } }) =>
      c.type?.abbreviation?.toLowerCase() === 'qual' ||
      c.type?.text?.toLowerCase().includes('qualifying')
  );

  if (qualiComp?.competitors?.length) {
    return { raceName, results: extractResults(qualiComp.competitors), status: 'Qualifying' };
  }

  return { raceName, results: [], status: 'Qualifying data not available' };
}

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
    const eventId = searchParams.get('eventId');

    const cacheKey = eventId ? `f1:race:${eventId}` : `f1:${view}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached as Record<string, unknown>, cached: true });
    }

    let result: Record<string, unknown>;

    switch (view) {
      case 'schedule':
        result = await fetchSchedule();
        break;
      case 'standings':
        result = await fetchStandings();
        break;
      case 'qualifying':
        if (eventId) {
          result = await fetchQualifyingByEventId(eventId);
        } else {
          result = { raceName: '', results: [], status: 'Select a race to view qualifying' };
        }
        break;
      case 'race':
        if (eventId) {
          result = await fetchRaceByEventId(eventId);
        } else {
          result = await fetchRaceResults();
        }
        break;
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
