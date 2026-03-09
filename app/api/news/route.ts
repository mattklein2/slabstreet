import { NextResponse } from 'next/server';
import { getRssFeedsForLeague } from '../../../lib/leagues';

/*
  GET /api/news?player=Victor+Wembanyama&league=NBA

  Pulls from league-specific RSS feeds (+ card market feeds), applies two-layer filter:
  1. Player name mention
  2. Value-relevant keyword match (injuries, awards, trades, card news)

  Returns only headlines that would actually affect card value.
  Cached 30 minutes — news changes faster than odds.
*/

// ─────────────────────────────────────────────────────────────
// VALUE SIGNAL KEYWORDS
// Two categories: positive movers and negative movers
// ─────────────────────────────────────────────────────────────
const POSITIVE_KEYWORDS = [
  // Performance
  'career high', 'career-high', 'record', 'milestone', 'triple-double', 'triple double',
  'game winner', 'game-winner', 'buzzer', 'dominant', 'breakout',
  // Awards & Recognition
  'mvp', 'all-star', 'all star', 'player of the week', 'player of the month',
  'all-nba', 'all nba', 'rookie of', 'dpoy', 'defensive player',
  'award', 'selected', 'named',
  // Health & Availability
  'return', 'returns', 'cleared', 'activated', 'available',
  // Contract
  'extension', 'max contract', 'signed', 're-signed', 'contract',
  // Card Market
  'sells for', 'sold for', 'auction', 'record sale', 'new release', 'prizm', 'panini',
];

const NEGATIVE_KEYWORDS = [
  // Injury
  'injury', 'injured', 'out for', 'miss', 'missed', 'missing', 'doubtful',
  'questionable', 'day-to-day', 'day to day', 'surgery', 'sprain', 'strain',
  'fracture', 'torn', 'concussion', 'bone', 'ankle', 'knee', 'hamstring',
  'ruled out', 'ruled-out', 'will not play', 'wont play',
  // Rest / Load Management  
  'rest', 'load management', 'load-management', 'maintenance',
  // Discipline
  'suspended', 'suspension', 'ejected', 'ejection', 'fined', 'arrested',
  'investigation', 'incident',
  // Team Situation
  'trade request', 'wants out', 'unhappy', 'benched', 'demoted',
  'trade rumors', 'on the block',
];

const ALL_VALUE_KEYWORDS = [...POSITIVE_KEYWORDS, ...NEGATIVE_KEYWORDS];

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
function getSentiment(text: string): 'positive' | 'negative' | 'neutral' {
  const lower = text.toLowerCase();
  const pos = POSITIVE_KEYWORDS.filter(k => lower.includes(k)).length;
  const neg = NEGATIVE_KEYWORDS.filter(k => lower.includes(k)).length;
  if (neg > pos) return 'negative';
  if (pos > neg) return 'positive';
  return 'neutral';
}

function getMatchedKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  return ALL_VALUE_KEYWORDS.filter(k => lower.includes(k)).slice(0, 3);
}

// Parse RSS XML — works for all standard RSS 2.0 feeds
function parseRSS(xml: string, source: string): any[] {
  const items: any[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];

    const titleMatch = block.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/i);
    const linkMatch  = block.match(/<link>(.*?)<\/link>/i);
    const dateMatch  = block.match(/<pubDate>(.*?)<\/pubDate>/i);
    const descMatch  = block.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i);

    const title = titleMatch?.[1]?.trim() ?? '';
    const link  = linkMatch?.[1]?.trim() ?? '';
    const date  = dateMatch?.[1]?.trim() ?? '';
    const desc  = descMatch?.[1]?.replace(/<[^>]+>/g, '').trim() ?? '';

    if (title) {
      items.push({ title, link, date, description: desc, source });
    }
  }

  return items;
}

// ─────────────────────────────────────────────────────────────
// ROUTE
// ─────────────────────────────────────────────────────────────
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const player = searchParams.get('player') || '';
  const leagueId = searchParams.get('league') || 'NBA';

  if (!player) {
    return NextResponse.json({ error: 'player= parameter required' }, { status: 400 });
  }

  // Get league-specific feeds (+ shared card market feeds)
  const feeds = getRssFeedsForLeague(leagueId);

  // Build name variants for matching
  const nameParts = player.toLowerCase().split(' ');
  const lastName  = nameParts[nameParts.length - 1];
  const fullLower = player.toLowerCase();

  // Fetch all feeds in parallel, don't let one failure kill the rest
  const feedResults = await Promise.allSettled(
    feeds.map(async feed => {
      const res = await fetch(feed.url, {
        headers: { 'User-Agent': 'SlabStreet/1.0 RSS Reader' },
        next: { revalidate: 1800 }, // cache 30 min
      });
      if (!res.ok) throw new Error(`${feed.source} returned ${res.status}`);
      const xml = await res.text();
      return parseRSS(xml, feed.source);
    })
  );

  // Flatten all articles from successful feeds
  const allArticles: any[] = [];
  feedResults.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      allArticles.push(...result.value);
    } else {
      console.warn(`Feed failed: ${feeds[i].source}`, result.reason);
    }
  });

  // LAYER 1: Filter by player name (last name minimum match)
  const playerArticles = allArticles.filter(a => {
    const text = `${a.title} ${a.description}`.toLowerCase();
    return text.includes(lastName) || text.includes(fullLower);
  });

  // LAYER 2: Filter by value-relevant keywords
  const valueArticles = playerArticles.filter(a => {
    const text = `${a.title} ${a.description}`.toLowerCase();
    return ALL_VALUE_KEYWORDS.some(k => text.includes(k));
  });

  // Score and sort by relevance (more keyword matches = higher priority)
  const scored = valueArticles.map(a => {
    const text = `${a.title} ${a.description}`.toLowerCase();
    const matchCount = ALL_VALUE_KEYWORDS.filter(k => text.includes(k)).length;
    const sentiment  = getSentiment(`${a.title} ${a.description}`);
    const keywords   = getMatchedKeywords(`${a.title} ${a.description}`);
    const pubDate    = a.date ? new Date(a.date).getTime() : 0;
    return { ...a, matchCount, sentiment, keywords, pubDate };
  });

  // Sort: recency first, then relevance
  scored.sort((a, b) => {
    if (b.pubDate !== a.pubDate) return b.pubDate - a.pubDate;
    return b.matchCount - a.matchCount;
  });

  // Deduplicate by similar title (RSS feeds often cross-post)
  const seen = new Set<string>();
  const deduped = scored.filter(a => {
    const key = a.title.toLowerCase().slice(0, 40);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Return top 6 value-relevant articles
  const results = deduped.slice(0, 6).map(a => ({
    headline:  a.title,
    source:    a.source,
    url:       a.link,
    sentiment: a.sentiment,
    keywords:  a.keywords,
    time:      a.date ? formatRelativeTime(a.date) : 'Recent',
  }));

  return NextResponse.json({
    player,
    article_count: results.length,
    total_scanned: allArticles.length,
    news: results,
    cached_at: new Date().toISOString(),
  });
}

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
