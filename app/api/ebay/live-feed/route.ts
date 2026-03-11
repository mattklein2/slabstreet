import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/*
  GET /api/ebay/live-feed?league=NBA&limit=30

  Unified market activity feed that blends:
  1. Recent sold listings from database (scraped eBay sales)
  2. Live active listings from eBay Browse API (real-time)

  Returns a merged, time-sorted feed of market activity.
  Each item is tagged as "sold" or "active" so the UI can style differently.

  5-minute cache.
*/

// ── eBay OAuth2 ──────────────────────────────────────────────
let tokenCache: { token: string; expires: number } | null = null;

async function getEbayToken(): Promise<string | null> {
  if (tokenCache && Date.now() < tokenCache.expires) return tokenCache.token;

  const clientId = process.env.EBAY_CLIENT_ID;
  const clientSecret = process.env.EBAY_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  try {
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const res = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${credentials}`,
      },
      body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope',
    });

    if (!res.ok) return null;
    const data = await res.json();
    tokenCache = {
      token: data.access_token,
      expires: Date.now() + (data.expires_in - 60) * 1000,
    };
    return data.access_token;
  } catch {
    return null;
  }
}

// ── Types ────────────────────────────────────────────────────

interface FeedItem {
  id: string;
  type: 'sold' | 'active';
  title: string;
  price: number;
  currency: string;
  playerName: string;
  playerSlug: string;
  league: string;
  date: string;
  imageUrl: string;
  url: string;
  condition: string;
}

// ── Cache ────────────────────────────────────────────────────

const CACHE_TTL_MS = 5 * 60 * 1000;
interface CacheEntry { data: unknown; expiresAt: number }
const cache = new Map<string, CacheEntry>();

// ── Helpers ──────────────────────────────────────────────────

function parsePrice(raw: string | number | undefined): number {
  if (typeof raw === 'number') return raw;
  if (typeof raw !== 'string') return 0;
  const n = parseFloat(raw.replace(/[^0-9.]/g, ''));
  return isNaN(n) ? 0 : n;
}

function normaliseDate(raw: string): string {
  if (!raw) return '';
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw;
  const d = new Date(raw);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return raw;
}

// ── Fetch recent sold from DB ────────────────────────────────

async function fetchRecentSold(league: string): Promise<FeedItem[]> {
  let query = supabase
    .from('players')
    .select('name, slug, league, sales')
    .eq('active', true)
    .not('sales', 'is', null);

  if (league !== 'ALL') {
    query = query.eq('league', league);
  }

  const { data: players, error } = await query;
  if (error || !players) return [];

  const items: FeedItem[] = [];

  for (const player of players) {
    const salesArr = player.sales;
    if (!Array.isArray(salesArr)) continue;

    for (const raw of salesArr) {
      if (!raw || typeof raw !== 'object') continue;
      const price = parsePrice(raw.price);
      if (price <= 0) continue;

      items.push({
        id: `sold-${player.slug}-${raw.ebay_id || ''}-${raw.card || ''}-${raw.date}`,
        type: 'sold',
        title: raw.card || '',
        price,
        currency: 'USD',
        playerName: player.name,
        playerSlug: player.slug,
        league: player.league,
        date: normaliseDate(raw.date),
        imageUrl: '',
        url: raw.ebay_id ? `https://www.ebay.com/itm/${raw.ebay_id}` : '',
        condition: raw.grade || '',
      });
    }
  }

  items.sort((a, b) => b.date.localeCompare(a.date));
  return items;
}

// ── Fetch active listings from eBay Browse API ───────────────

async function fetchActiveListings(
  league: string,
  token: string,
): Promise<FeedItem[]> {
  // Get top players to search for
  let query = supabase
    .from('players')
    .select('name, slug, league')
    .eq('active', true)
    .order('name');

  if (league !== 'ALL') {
    query = query.eq('league', league);
  }

  const { data: players } = await query.limit(6);
  if (!players || players.length === 0) return [];

  const items: FeedItem[] = [];

  // Fetch 4 listings per player in parallel
  const fetches = players.slice(0, 4).map(async (player) => {
    try {
      const sportLabel = player.league === 'F1' ? 'F1 racing' : player.league || 'sports';
      const q = `${player.name} ${sportLabel} card PSA`;
      const params = new URLSearchParams({
        q,
        category_ids: '261328',
        limit: '4',
        sort: 'newlyListed',
      });

      const res = await fetch(
        `https://api.ebay.com/buy/browse/v1/item_summary/search?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
          },
        },
      );

      if (!res.ok) return;
      const data = await res.json();

      for (const item of data.itemSummaries || []) {
        items.push({
          id: `active-${item.itemId || item.legacyItemId || Math.random()}`,
          type: 'active',
          title: item.title || '',
          price: parseFloat(item.price?.value || '0'),
          currency: item.price?.currency || 'USD',
          playerName: player.name,
          playerSlug: player.slug,
          league: player.league,
          date: new Date().toISOString().slice(0, 10),
          imageUrl: item.thumbnailImages?.[0]?.imageUrl || item.image?.imageUrl || '',
          url: item.itemWebUrl || '',
          condition: item.condition || '',
        });
      }
    } catch {
      // Skip failed player searches
    }
  });

  await Promise.all(fetches);
  return items;
}

// ── Route handler ────────────────────────────────────────────

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const league = (searchParams.get('league') || 'ALL').toUpperCase();
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '30', 10) || 30, 1), 60);

    // Check cache
    const cacheKey = `live-feed:${league}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      const data = cached.data as { feed: FeedItem[]; stats: unknown };
      return NextResponse.json({
        ...data,
        feed: data.feed.slice(0, limit),
        cached: true,
      });
    }

    // Fetch sold from DB
    const soldItems = await fetchRecentSold(league);

    // Fetch active from eBay (non-blocking — if token fails, we still show sold)
    let activeItems: FeedItem[] = [];
    const token = await getEbayToken();
    if (token) {
      activeItems = await fetchActiveListings(league, token);
    }

    // Interleave: insert active listings every ~3 sold items for visibility
    const feed: FeedItem[] = [];
    const soldCopy = [...soldItems];
    const activeCopy = [...activeItems];
    let soldIdx = 0;

    while (soldIdx < soldCopy.length || activeCopy.length > 0) {
      // Add up to 3 sold items
      for (let i = 0; i < 3 && soldIdx < soldCopy.length; i++, soldIdx++) {
        feed.push(soldCopy[soldIdx]);
      }
      // Insert one active listing
      if (activeCopy.length > 0) {
        feed.push(activeCopy.shift()!);
      }
    }

    // Stats
    const soldPrices = soldItems.map((s) => s.price).filter((p) => p > 0);
    const stats = {
      totalSold: soldItems.length,
      totalActive: activeItems.length,
      avgSoldPrice: soldPrices.length > 0
        ? Math.round((soldPrices.reduce((a, b) => a + b, 0) / soldPrices.length) * 100) / 100
        : 0,
      topSale: soldPrices.length > 0 ? Math.max(...soldPrices) : 0,
      hasLiveData: activeItems.length > 0,
    };

    // Cache
    cache.set(cacheKey, {
      data: { feed, stats },
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    return NextResponse.json({
      feed: feed.slice(0, limit),
      stats,
      cached: false,
    });
  } catch (err) {
    console.error('[live-feed] Error:', err);
    return NextResponse.json(
      { feed: [], stats: { totalSold: 0, totalActive: 0, avgSoldPrice: 0, topSale: 0, hasLiveData: false }, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
