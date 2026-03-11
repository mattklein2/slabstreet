import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/ebay/listings?cardSlug=luka-doncic-2018-prizm-silver-280&limit=12
 *
 * Fetches active eBay listings for a specific card.
 * Uses the eBay Browse API with OAuth2 client credentials.
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

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const cardSlug = searchParams.get('cardSlug');
  const limit = Math.min(20, parseInt(searchParams.get('limit') || '12'));

  if (!cardSlug) {
    return NextResponse.json({ error: 'cardSlug required' }, { status: 400 });
  }

  // Look up card to build search query
  const { data: card } = await supabase
    .from('cards')
    .select('player_slug, year, set_name, parallel, card_number')
    .eq('slug', cardSlug)
    .single();

  if (!card) {
    return NextResponse.json({ error: 'Card not found' }, { status: 404 });
  }

  // Build eBay search query from card metadata
  const playerName = card.player_slug.replace(/-/g, ' ');
  const queryParts = [playerName, String(card.year), card.set_name];
  if (card.parallel && card.parallel !== 'Base') queryParts.push(card.parallel);
  const query = queryParts.join(' ') + ' card';

  const token = await getEbayToken();
  if (!token) {
    return NextResponse.json({ listings: [], total: 0, query });
  }

  try {
    const params = new URLSearchParams({
      q: query,
      category_ids: '261328', // Sports Trading Cards
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
        next: { revalidate: 1800 },
      },
    );

    if (!res.ok) {
      return NextResponse.json({ listings: [], total: 0, query });
    }

    const data = await res.json();
    const items = data.itemSummaries || [];

    const listings = items.map((item: Record<string, unknown>) => ({
      title: (item.title as string) || '',
      price: (item.price as Record<string, string>)?.value || '0.00',
      currency: (item.price as Record<string, string>)?.currency || 'USD',
      image: (item.thumbnailImages as Record<string, string>[])?.[0]?.imageUrl ||
             (item.image as Record<string, string>)?.imageUrl || '',
      url: (item.itemWebUrl as string) || '',
      condition: (item.condition as string) || '',
    }));

    return NextResponse.json({
      listings,
      total: data.total || items.length,
      query,
    });
  } catch {
    return NextResponse.json({ listings: [], total: 0, query });
  }
}
