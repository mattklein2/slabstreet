import { NextResponse } from 'next/server';

/*
  GET /api/ebay?player=Victor+Wembanyama&league=NBA

  Searches eBay for active sports card listings using the Browse API.
  Returns top listings with title, price, image, and link.

  Requires EBAY_CLIENT_ID and EBAY_CLIENT_SECRET env vars.
  Uses OAuth2 client credentials flow for app-level access token.
  Cached 30 minutes.
*/

// ── eBay OAuth2 token cache ──────────────────────────────────
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
        'Authorization': `Basic ${credentials}`,
      },
      body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope',
    });

    if (!res.ok) {
      console.error('eBay token error:', res.status, await res.text());
      return null;
    }

    const data = await res.json();
    tokenCache = {
      token: data.access_token,
      expires: Date.now() + (data.expires_in - 60) * 1000, // refresh 1 min early
    };
    return data.access_token;
  } catch (err) {
    console.error('eBay token fetch error:', err);
    return null;
  }
}

// ── eBay category IDs for sports cards ───────────────────────
// 261328 = Sports Trading Cards & Accessories
const SPORTS_CARD_CATEGORY = '261328';

interface EbayListing {
  title: string;
  price: string;
  currency: string;
  image: string;
  url: string;
  condition: string;
}

// ── Search eBay Browse API ───────────────────────────────────
async function searchEbay(
  query: string,
  token: string,
  limit: number = 12,
): Promise<{ listings: EbayListing[]; total: number }> {
  try {
    const params = new URLSearchParams({
      q: query,
      category_ids: SPORTS_CARD_CATEGORY,
      limit: String(limit),
      sort: 'price',
    });

    const res = await fetch(
      `https://api.ebay.com/buy/browse/v1/item_summary/search?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
          'Content-Type': 'application/json',
        },
        next: { revalidate: 1800 }, // 30 min cache
      },
    );

    if (!res.ok) {
      console.error('eBay search error:', res.status, await res.text());
      return { listings: [], total: 0 };
    }

    const data = await res.json();
    const items = data.itemSummaries || [];

    const listings: EbayListing[] = items.map((item: any) => ({
      title: item.title || '',
      price: item.price?.value || '0.00',
      currency: item.price?.currency || 'USD',
      image: item.thumbnailImages?.[0]?.imageUrl || item.image?.imageUrl || '',
      url: item.itemWebUrl || '',
      condition: item.condition || '',
    }));

    return {
      listings,
      total: data.total || items.length,
    };
  } catch (err) {
    console.error('eBay search error:', err);
    return { listings: [], total: 0 };
  }
}

// ── ROUTE HANDLER ────────────────────────────────────────────
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const player  = searchParams.get('player') || '';
  const league  = searchParams.get('league') || '';

  if (!player) {
    return NextResponse.json({ error: 'player= required', listings: [] }, { status: 400 });
  }

  const token = await getEbayToken();
  if (!token) {
    return NextResponse.json({
      listings: [],
      total: 0,
      error: 'eBay API not configured. Add EBAY_CLIENT_ID and EBAY_CLIENT_SECRET to .env.local',
      configured: false,
    });
  }

  // Build search query — focus on graded cards (PSA, BGS, SGC)
  const sportLabel = league === 'F1' ? 'F1 racing' : league || 'sports';
  const query = `${player} ${sportLabel} card PSA`;

  const { listings, total } = await searchEbay(query, token);

  // Calculate price stats
  const prices = listings
    .map(l => parseFloat(l.price))
    .filter(p => p > 0)
    .sort((a, b) => a - b);

  const priceStats = prices.length > 0 ? {
    low: prices[0],
    high: prices[prices.length - 1],
    median: prices[Math.floor(prices.length / 2)],
    count: prices.length,
  } : null;

  return NextResponse.json({
    listings,
    total,
    price_stats: priceStats,
    query,
    configured: true,
    cached_at: new Date().toISOString(),
  });
}
