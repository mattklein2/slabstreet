// lib/xray/ebay-client.ts

/**
 * eBay Browse API client for Card X-Ray.
 * Provides token management, getItem, and searchComps.
 * Runs server-side only (uses process.env for credentials).
 */

// ── Token cache (module-level singleton) ─────────────────────
let tokenCache: { token: string; expires: number } | null = null;

export async function getEbayToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expires) return tokenCache.token;

  const clientId = process.env.EBAY_CLIENT_ID;
  const clientSecret = process.env.EBAY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('EBAY_CLIENT_ID and EBAY_CLIENT_SECRET must be set in .env.local');
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const res = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope',
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`eBay token error ${res.status}: ${body}`);
  }

  const data = await res.json();
  tokenCache = {
    token: data.access_token,
    expires: Date.now() + (data.expires_in - 60) * 1000,
  };
  return data.access_token;
}

// ── getItem — fetch a single listing by item ID ─────────────
export interface EbayItemResponse {
  itemId: string;
  title: string;
  price: { value: string; currency: string };
  condition: string;
  image: { imageUrl: string };
  itemWebUrl: string;
  seller: { username: string };
  localizedAspects?: Array<{ name: string; value: string }>;
  buyingOptions: string[];   // ['FIXED_PRICE'] or ['AUCTION']
}

export async function getItem(itemId: string): Promise<EbayItemResponse> {
  const token = await getEbayToken();

  const res = await fetch(
    `https://api.ebay.com/buy/browse/v1/item/v1|${itemId}|0`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
        'Content-Type': 'application/json',
      },
    },
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`eBay getItem error ${res.status}: ${body}`);
  }

  return res.json();
}

// ── searchComps — find active listings for price comparison ──
export interface EbayCompItem {
  title: string;
  price: { value: string; currency: string };
  itemWebUrl: string;
}

export async function searchComps(
  query: string,
  limit: number = 20,
): Promise<EbayCompItem[]> {
  const token = await getEbayToken();

  const params = new URLSearchParams({
    q: query,
    category_ids: '261328', // Sports Trading Cards
    sort: 'newlyListed',
    limit: String(limit),
  });

  // Browse API returns active listings only.
  // Sold/completed data requires Finding API (Phase 2).
  // For Phase 1, active listing prices provide price context.
  const res = await fetch(
    `https://api.ebay.com/buy/browse/v1/item_summary/search?${params}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
        'Content-Type': 'application/json',
      },
    },
  );

  if (!res.ok) {
    console.error('eBay search error:', res.status, await res.text());
    return [];
  }

  const data = await res.json();
  return (data.itemSummaries || []).map((item: any) => ({
    title: item.title || '',
    price: item.price || { value: '0', currency: 'USD' },
    itemWebUrl: item.itemWebUrl || '',
  }));
}
