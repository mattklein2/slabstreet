import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/*
  GET /api/cardladder?league=NBA&limit=20&sort=marketCap

  Returns CardLadder data for players from Supabase.
  - Filters by league (or ALL for all leagues)
  - Sorts by marketCap, indexValue, sales24h, or totalCards
  - 5-minute in-memory cache keyed by league+sort
*/

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

interface CardLadderData {
  updatedAt: string;
  indexValue?: number | null;
  indexStartingValue?: number | null;
  rateOfGrowth?: string | null;
  realValueChange?: string | null;
  lowValue?: number | null;
  highValue?: number | null;
  averageValue?: number | null;
  totalCards?: number | null;
  marketCap?: string | null;
  marketCapNum?: number | null;
  sales24h?: number | null;
  avgDailyVolume?: string | null;
  avgDailyVolumeNum?: number | null;
  lowDailyVolume?: string | null;
  highDailyVolume?: string | null;
  cards?: CardLadderCard[];
}

interface CardLadderCard {
  cardId?: string | null;
  year: string;
  set: string;
  cardNumber: string;
  parallel: string;
  grade: string;
  lastSold: string;
  clValue: string;
  score?: number | null;
  pop?: string | null;
  marketCap?: string | null;
}

interface PlayerWithCardLadder {
  slug: string;
  name: string;
  team: string;
  league: string;
  score: number;
  cardladder: CardLadderData | null;
}

// ─────────────────────────────────────────────────────────────
// IN-MEMORY CACHE (5 minutes)
// ─────────────────────────────────────────────────────────────

const CACHE_TTL_MS = 5 * 60 * 1000;

interface CacheEntry {
  data: PlayerWithCardLadder[];
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

function getCached(key: string): PlayerWithCardLadder[] | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: PlayerWithCardLadder[]): void {
  cache.set(key, { data, timestamp: Date.now() });
}

// ─────────────────────────────────────────────────────────────
// ROUTE HANDLER
// ─────────────────────────────────────────────────────────────

type SortField = 'marketCap' | 'indexValue' | 'sales24h' | 'totalCards' | 'score';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const league = searchParams.get('league') || 'ALL';
  const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20', 10) || 20));
  const sort = (searchParams.get('sort') || 'marketCap') as SortField;

  const cacheKey = `${league}:${sort}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return NextResponse.json({
      players: cached.slice(0, limit),
      league,
      cached: true,
    });
  }

  try {
    // Build query
    let query = supabase
      .from('players')
      .select('slug, name, team, league, score, cardladder')
      .eq('active', true)
      .not('cardladder', 'is', null);

    if (league !== 'ALL') {
      query = query.eq('league', league);
    }

    const { data, error } = await query.limit(200);

    if (error) {
      // If cardladder column doesn't exist, return empty gracefully
      if (error.message.includes('cardladder')) {
        return NextResponse.json({
          players: [],
          league,
          error: 'CardLadder data not yet available. Run the scraper first.',
        });
      }
      return NextResponse.json(
        { error: error.message, players: [], league },
        { status: 500 },
      );
    }

    // Filter out players with no cardladder data
    const players: PlayerWithCardLadder[] = (data || [])
      .filter((p: PlayerWithCardLadder) => p.cardladder && p.cardladder.updatedAt);

    // Sort by requested field
    players.sort((a, b) => {
      const aData = a.cardladder;
      const bData = b.cardladder;
      if (!aData || !bData) return 0;

      switch (sort) {
        case 'marketCap':
          return (bData.marketCapNum || 0) - (aData.marketCapNum || 0);
        case 'indexValue':
          return (bData.indexValue || 0) - (aData.indexValue || 0);
        case 'sales24h':
          return (bData.sales24h || 0) - (aData.sales24h || 0);
        case 'totalCards':
          return (bData.totalCards || 0) - (aData.totalCards || 0);
        case 'score':
          return (b.score || 0) - (a.score || 0);
        default:
          return (bData.marketCapNum || 0) - (aData.marketCapNum || 0);
      }
    });

    // Cache the full sorted result
    setCache(cacheKey, players);

    return NextResponse.json({
      players: players.slice(0, limit),
      league,
    });
  } catch (err) {
    console.error('CardLadder API error:', err);
    return NextResponse.json(
      { error: 'Internal error fetching CardLadder data', players: [], league },
      { status: 500 },
    );
  }
}
