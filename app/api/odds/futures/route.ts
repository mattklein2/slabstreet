import { NextResponse } from 'next/server';
import { getLeagueConfig } from '@/lib/leagues';

/*
  GET /api/odds/futures?league=NBA&limit=10

  Returns top championship futures odds per league from The Odds API.
  - Aggregates odds across all bookmakers by averaging per team
  - Converts American odds to implied probability
  - Sorted by implied probability descending
  - 30-minute in-memory cache keyed by league
*/

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

interface FuturesOdd {
  team: string;
  odds: number;       // American odds (e.g. +350, -200)
  impliedProb: number; // 0-1 decimal probability
}

// ─────────────────────────────────────────────────────────────
// IN-MEMORY CACHE (30 minutes)
// ─────────────────────────────────────────────────────────────

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

interface CacheEntry {
  data: FuturesOdd[];
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

function getCached(league: string): FuturesOdd[] | null {
  const entry = cache.get(league);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(league);
    return null;
  }
  return entry.data;
}

function setCache(league: string, data: FuturesOdd[]): void {
  cache.set(league, { data, timestamp: Date.now() });
}

// ─────────────────────────────────────────────────────────────
// ODDS CONVERSION
// ─────────────────────────────────────────────────────────────

function americanToImpliedProb(odds: number): number {
  if (odds > 0) {
    return 100 / (odds + 100);
  }
  // odds < 0
  return Math.abs(odds) / (Math.abs(odds) + 100);
}

// ─────────────────────────────────────────────────────────────
// ROUTE HANDLER
// ─────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const leagueId = searchParams.get('league') || 'NBA';
  const limit = Math.max(1, Math.min(50, parseInt(searchParams.get('limit') || '10', 10) || 10));

  const config = getLeagueConfig(leagueId);
  const apiKey = process.env.ODDS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'ODDS_API_KEY not configured', futures: [], league: config.id },
      { status: 500 },
    );
  }

  // If league has no championship odds key, return empty gracefully
  if (!config.oddsApiSportKey) {
    return NextResponse.json({ futures: [], league: config.id });
  }

  // Check cache
  const cached = getCached(config.id);
  if (cached) {
    return NextResponse.json({
      futures: cached.slice(0, limit),
      league: config.id,
    });
  }

  // Fetch from The Odds API outrights market
  try {
    const url = `https://api.the-odds-api.com/v4/sports/${config.oddsApiSportKey}/odds?apiKey=${apiKey}&regions=us&markets=outrights&oddsFormat=american`;
    const res = await fetch(url, { next: { revalidate: 1800 } });

    if (!res.ok) {
      console.error(`Odds API error: ${res.status} ${res.statusText}`);
      return NextResponse.json(
        { error: 'Failed to fetch futures odds', futures: [], league: config.id },
        { status: 502 },
      );
    }

    const events = await res.json();

    // Aggregate odds across all bookmakers by averaging per team
    // Map: team name -> { totalOdds, count }
    const teamAgg = new Map<string, { totalOdds: number; count: number }>();

    for (const event of events) {
      for (const bookmaker of event.bookmakers || []) {
        for (const market of bookmaker.markets || []) {
          for (const outcome of market.outcomes || []) {
            const teamName: string = outcome.name || '';
            const price: number = outcome.price;

            if (!teamName || typeof price !== 'number') continue;

            const existing = teamAgg.get(teamName);
            if (existing) {
              existing.totalOdds += price;
              existing.count += 1;
            } else {
              teamAgg.set(teamName, { totalOdds: price, count: 1 });
            }
          }
        }
      }
    }

    // Build futures list with averaged odds and implied probability
    const futures: FuturesOdd[] = [];
    for (const [team, agg] of teamAgg) {
      const avgOdds = Math.round(agg.totalOdds / agg.count);
      // Skip odds of exactly 0 (shouldn't happen but guard against it)
      if (avgOdds === 0) continue;
      futures.push({
        team,
        odds: avgOdds,
        impliedProb: parseFloat(americanToImpliedProb(avgOdds).toFixed(4)),
      });
    }

    // Sort by implied probability descending (favorites first)
    futures.sort((a, b) => b.impliedProb - a.impliedProb);

    // Cache the full sorted list
    setCache(config.id, futures);

    return NextResponse.json({
      futures: futures.slice(0, limit),
      league: config.id,
    });
  } catch (err) {
    console.error('Futures odds fetch error:', err);
    return NextResponse.json(
      { error: 'Internal error fetching futures odds', futures: [], league: config.id },
      { status: 500 },
    );
  }
}
