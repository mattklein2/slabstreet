import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/*
  GET /api/ebay/recent-sales?league=NBA&limit=20

  Aggregates recent eBay sold-listing data from the Supabase `players` table.
  Returns flattened sales across all active players, sorted by date descending,
  along with aggregate stats (totalSales, avgPrice, topSale).

  Query params:
    league  — filter by league (e.g. "NBA", "NFL"). Omit or "ALL" for all leagues.
    limit   — max results to return (default 20, max 50).
*/

// ── Types ────────────────────────────────────────────────────

/** Shape of a sale entry in the players.sales JSONB column (from scraper) */
interface RawSale {
  card: string;
  grade: string;
  price: string; // "$245.00"
  date: string;  // "Mar 9, 2026" or similar
  bids: string;
  ebay_id: string;
}

/** Shape returned to the client */
interface FlatSale {
  playerName: string;
  playerSlug: string;
  title: string;
  price: number;
  date: string;
  imageUrl: string;
  league: string;
}

interface AggregateStats {
  totalSales: number;
  avgPrice: number;
  topSale: FlatSale | null;
}

// ── In-memory cache (10 min TTL) ────────────────────────────

const CACHE_TTL_MS = 10 * 60 * 1000;

interface CacheEntry {
  data: { sales: FlatSale[]; stats: AggregateStats };
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

// ── Helpers ─────────────────────────────────────────────────

/**
 * Parse a price string like "$245.00" or "245.00" into a number.
 * Returns 0 for unparseable values.
 */
function parsePrice(raw: string | number | undefined): number {
  if (typeof raw === 'number') return raw;
  if (typeof raw !== 'string') return 0;
  const n = parseFloat(raw.replace(/[^0-9.]/g, ''));
  return isNaN(n) ? 0 : n;
}

/**
 * Attempt to normalise a date string into ISO format (YYYY-MM-DD).
 * The scraper stores dates like "Mar 9, 2026". If parsing fails,
 * the original string is returned as-is.
 */
function normaliseDate(raw: string): string {
  if (!raw) return '';
  // Already ISO-ish?
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw;
  const d = new Date(raw);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return raw;
}

// ── Route handler ───────────────────────────────────────────

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const league = (searchParams.get('league') || 'ALL').toUpperCase();
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20', 10) || 20, 1), 50);

    // ── Check cache ────────────────────────────────────────
    const cacheKey = `recent-sales:${league}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      const sliced = cached.data.sales.slice(0, limit);
      return NextResponse.json({
        sales: sliced,
        stats: cached.data.stats,
        cached: true,
        cached_at: new Date(cached.expiresAt - CACHE_TTL_MS).toISOString(),
      });
    }

    // ── Query Supabase ─────────────────────────────────────
    let query = supabase
      .from('players')
      .select('name, slug, league, sales')
      .eq('active', true)
      .not('sales', 'is', null);

    if (league !== 'ALL') {
      query = query.eq('league', league);
    }

    const { data: players, error } = await query;

    if (error) {
      console.error('Supabase query error (recent-sales):', error);
      return NextResponse.json(
        {
          sales: [],
          stats: { totalSales: 0, avgPrice: 0, topSale: null },
          error: 'Database query failed',
        },
        { status: 500 },
      );
    }

    // ── Flatten sales across all players ───────────────────
    const allSales: FlatSale[] = [];

    for (const player of players || []) {
      const salesArr = player.sales;
      if (!Array.isArray(salesArr) || salesArr.length === 0) continue;

      for (const raw of salesArr as RawSale[]) {
        if (!raw || typeof raw !== 'object') continue;

        const price = parsePrice(raw.price);
        if (price <= 0) continue;

        allSales.push({
          playerName: player.name,
          playerSlug: player.slug,
          title: raw.card || '',
          price,
          date: normaliseDate(raw.date),
          imageUrl: '', // scraper does not store images in sales[]
          league: player.league,
        });
      }
    }

    // ── Sort by date descending ────────────────────────────
    allSales.sort((a, b) => {
      // ISO dates sort lexicographically; non-ISO fall to the end
      if (!a.date) return 1;
      if (!b.date) return -1;
      return b.date.localeCompare(a.date);
    });

    // ── Aggregate stats ────────────────────────────────────
    const totalSales = allSales.length;
    const avgPrice = totalSales > 0
      ? Math.round((allSales.reduce((sum, s) => sum + s.price, 0) / totalSales) * 100) / 100
      : 0;

    const topSale = totalSales > 0
      ? allSales.reduce((top, s) => (s.price > top.price ? s : top), allSales[0])
      : null;

    const stats: AggregateStats = { totalSales, avgPrice, topSale };

    // ── Store in cache ─────────────────────────────────────
    cache.set(cacheKey, {
      data: { sales: allSales, stats },
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    // ── Respond ────────────────────────────────────────────
    return NextResponse.json({
      sales: allSales.slice(0, limit),
      stats,
      cached: false,
      cached_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Unexpected error in /api/ebay/recent-sales:', err);
    return NextResponse.json(
      {
        sales: [],
        stats: { totalSales: 0, avgPrice: 0, topSale: null },
        error: 'Internal server error',
      },
      { status: 500 },
    );
  }
}
