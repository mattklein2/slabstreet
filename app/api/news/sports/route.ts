import { NextResponse } from 'next/server';
import { getLeagueConfig, getAllLeagueIds } from '@/lib/leagues';

/*
  GET /api/news/sports?league=NBA&limit=12

  Fetches league-level sports news from RSS feeds.
  Unlike /api/news, this does NOT filter by player name — returns ALL articles
  for the requested league(s).

  Params:
    league — league ID (NBA, NFL, MLB, F1, NHL, WNBA) or ALL. Defaults to ALL.
    limit  — max items returned. Defaults to 12.

  Returns: { news: SportsNewsItem[] }
  Cached in-memory for 15 minutes.
*/

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────
interface SportsNewsItem {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  league: string;
  time: string;
}

// ─────────────────────────────────────────────────────────────
// IN-MEMORY CACHE (15-minute TTL)
// ─────────────────────────────────────────────────────────────
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

interface CacheEntry {
  data: SportsNewsItem[];
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

function getCached(key: string): SportsNewsItem[] | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: SportsNewsItem[]): void {
  cache.set(key, { data, timestamp: Date.now() });
}

// ─────────────────────────────────────────────────────────────
// RSS PARSER (same pattern as /api/news)
// ─────────────────────────────────────────────────────────────
function parseRSS(xml: string, source: string): { title: string; link: string; date: string; source: string }[] {
  const items: { title: string; link: string; date: string; source: string }[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];

    const titleMatch = block.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/i);
    const linkMatch  = block.match(/<link>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/link>/i);
    const dateMatch  = block.match(/<pubDate>(.*?)<\/pubDate>/i);

    const title = titleMatch?.[1]?.trim() ?? '';
    const link  = linkMatch?.[1]?.trim() ?? '';
    const date  = dateMatch?.[1]?.trim() ?? '';

    if (title) {
      items.push({ title, link, date, source });
    }
  }

  return items;
}

// ─────────────────────────────────────────────────────────────
// RELATIVE TIME FORMATTER
// ─────────────────────────────────────────────────────────────
function formatRelativeTime(dateStr: string): string {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins < 60)  return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  } catch {
    return 'Recent';
  }
}

// ─────────────────────────────────────────────────────────────
// ROUTE HANDLER
// ─────────────────────────────────────────────────────────────
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const leagueParam = searchParams.get('league')?.toUpperCase() || 'ALL';
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '12', 10) || 12, 1), 50);

    // Check cache first
    const cacheKey = `sports-news:${leagueParam}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return NextResponse.json({
        news: cached.slice(0, limit),
        cached: true,
      });
    }

    // Determine which leagues to fetch
    const leagueIds = leagueParam === 'ALL'
      ? getAllLeagueIds()
      : [leagueParam];

    // Build flat list of { feed, leagueId } for all feeds to fetch
    const feedsToFetch: { url: string; source: string; league: string }[] = [];
    for (const id of leagueIds) {
      const config = getLeagueConfig(id);
      for (const feed of config.rssFeeds) {
        feedsToFetch.push({ url: feed.url, source: feed.source, league: id });
      }
    }

    // Fetch all feeds in parallel — don't let one failure kill the rest
    const feedResults = await Promise.allSettled(
      feedsToFetch.map(async (feed) => {
        const res = await fetch(feed.url, {
          headers: { 'User-Agent': 'SlabStreet/1.0 RSS Reader' },
          next: { revalidate: 900 }, // 15 min Next.js fetch cache
        });
        if (!res.ok) throw new Error(`${feed.source} returned ${res.status}`);
        const xml = await res.text();
        const items = parseRSS(xml, feed.source);
        return items.map((item) => ({ ...item, league: feed.league }));
      })
    );

    // Flatten all articles from successful feeds
    const allArticles: { title: string; link: string; date: string; source: string; league: string }[] = [];
    feedResults.forEach((result, i) => {
      if (result.status === 'fulfilled') {
        allArticles.push(...result.value);
      } else {
        console.warn(`[sports-news] Feed failed: ${feedsToFetch[i].source} (${feedsToFetch[i].league})`, result.reason);
      }
    });

    // Sort by pubDate descending (most recent first)
    allArticles.sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });

    // Deduplicate by similar title (first 40 chars)
    const seen = new Set<string>();
    const deduped = allArticles.filter((a) => {
      const key = a.title.toLowerCase().slice(0, 40);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Map to response format
    const news: SportsNewsItem[] = deduped.map((a) => ({
      title:   a.title,
      link:    a.link,
      source:  a.source,
      pubDate: a.date,
      league:  a.league,
      time:    a.date ? formatRelativeTime(a.date) : 'Recent',
    }));

    // Cache the full result set (sliced to limit on response)
    setCache(cacheKey, news);

    return NextResponse.json({
      news: news.slice(0, limit),
      cached: false,
    });
  } catch (error) {
    console.error('[sports-news] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sports news' },
      { status: 500 }
    );
  }
}
