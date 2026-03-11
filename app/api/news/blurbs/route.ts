import { NextResponse } from 'next/server';

/*
  GET /api/news/blurbs?league=NBA&limit=8

  Fetches sports news headlines from /api/news/sports, then uses Claude to
  generate short card-market-aware blurbs for each headline.

  Falls back to plain headlines (no blurbs) if ANTHROPIC_API_KEY is not set.

  Response: { news: BlurbItem[], cached: boolean, ai: boolean }
*/

interface SportsNewsItem {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  league: string;
  time: string;
}

interface BlurbItem extends SportsNewsItem {
  blurb: string | null;
}

// ─── Cache (30-minute TTL) ──────────────────────────────────
interface CacheEntry {
  data: BlurbItem[];
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 30 * 60 * 1000;

function getCached(key: string): BlurbItem[] | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: BlurbItem[]): void {
  cache.set(key, { data, timestamp: Date.now() });
}

// ─── Claude API call ────────────────────────────────────────
async function generateBlurbs(headlines: { title: string; league: string }[]): Promise<Map<string, string>> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return new Map();

  const headlineList = headlines
    .map((h, i) => `${i + 1}. [${h.league}] ${h.title}`)
    .join('\n');

  const prompt = `You are a sports card market observer for SlabStreet. Given these sports headlines, write a brief 1-2 sentence blurb for each that adds context and hints at potential card market implications without making definitive predictions.

Use language like "worth watching," "one to monitor," "collectors are taking notice," "could get interesting for," etc. Never say prices WILL go up or down — keep it suggestive and intriguing, not predictive. Mention specific card sets (Prizm, Topps Chrome, National Treasures, Optic, etc.) when relevant. Keep each blurb under 40 words.

Headlines:
${headlineList}

Respond with ONLY a JSON array of objects with "index" (1-based) and "blurb" fields. No markdown, no explanation.`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      console.warn(`[blurbs] Claude API returned ${res.status}`);
      return new Map();
    }

    const data = await res.json();
    const text = data?.content?.[0]?.text ?? '';

    // Parse JSON response
    const parsed = JSON.parse(text) as { index: number; blurb: string }[];
    const blurbMap = new Map<string, string>();
    for (const item of parsed) {
      if (item.index >= 1 && item.index <= headlines.length) {
        blurbMap.set(headlines[item.index - 1].title, item.blurb);
      }
    }
    return blurbMap;
  } catch (err) {
    console.warn('[blurbs] Failed to generate blurbs:', err);
    return new Map();
  }
}

// ─── Route handler ──────────────────────────────────────────
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const league = searchParams.get('league') || 'ALL';
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '8', 10) || 8, 1), 20);

    // Check cache
    const cacheKey = `blurbs:${league}:${limit}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return NextResponse.json({ news: cached, cached: true, ai: true });
    }

    // Fetch headlines from existing sports news API
    const origin = new URL(request.url).origin;
    const newsRes = await fetch(`${origin}/api/news/sports?league=${league}&limit=${limit}`);
    if (!newsRes.ok) {
      return NextResponse.json({ news: [], cached: false, ai: false, error: 'Failed to fetch news' });
    }
    const newsData = await newsRes.json();
    const headlines: SportsNewsItem[] = newsData.news || [];

    if (headlines.length === 0) {
      return NextResponse.json({ news: [], cached: false, ai: false });
    }

    // Generate AI blurbs
    const hasApiKey = !!process.env.ANTHROPIC_API_KEY;
    const blurbMap = hasApiKey
      ? await generateBlurbs(headlines.map((h) => ({ title: h.title, league: h.league })))
      : new Map<string, string>();

    const blurbItems: BlurbItem[] = headlines.map((h) => ({
      ...h,
      blurb: blurbMap.get(h.title) ?? null,
    }));

    // Only cache if we got blurbs
    if (blurbMap.size > 0) {
      setCache(cacheKey, blurbItems);
    }

    return NextResponse.json({
      news: blurbItems,
      cached: false,
      ai: blurbMap.size > 0,
    });
  } catch (error) {
    console.error('[blurbs] Unexpected error:', error);
    return NextResponse.json({ news: [], cached: false, ai: false, error: 'Internal error' }, { status: 500 });
  }
}
