import { NextResponse } from 'next/server';

/*
  GET /api/news/cards

  Card market–specific news feed. Pulls from hobby-focused RSS feeds,
  filters for card-relevant headlines (releases, auctions, grading,
  market trends), and returns the latest articles.

  No player filter — this is the broad hobby news feed.
  Cached 30 minutes.
*/

const CARD_FEEDS = [
  { url: 'https://www.beckett.com/feed', source: 'Beckett' },
  { url: 'https://www.sportscardsinvestor.com/feed/', source: 'Sports Card Investor' },
  { url: 'https://www.cardboardconnection.com/feed', source: 'Cardboard Connection' },
  { url: 'https://blog.psacard.com/feed/', source: 'PSA Blog' },
  { url: 'https://www.blowoutcards.com/blog/feed/', source: 'Blowout Cards' },
];

const CARD_KEYWORDS = [
  // Releases & Products
  'release', 'released', 'new set', 'checklist', 'hobby box', 'retail box',
  'blaster', 'mega box', 'pack', 'break', 'case break', 'group break',
  'panini', 'topps', 'upper deck', 'fanatics', 'bowman', 'prizm', 'select',
  'mosaic', 'optic', 'donruss', 'national treasures', 'immaculate', 'flawless',
  'contenders', 'chronicles', 'hoops', 'certified', 'spectra', 'noir',
  'product', 'drop', 'launch', 'preview', 'first look', 'exclusive',
  // Grading & Authentication
  'psa', 'bgs', 'sgc', 'cgc', 'grading', 'graded', 'pop report',
  'grade', 'gem mint', 'pristine', 'slab', 'submission', 'turnaround',
  // Market & Sales
  'auction', 'sold', 'sells for', 'record sale', 'ebay', 'pwcc', 'goldin',
  'heritage', 'market', 'prices', 'value', 'invest', 'roi', 'trend',
  'rally', 'surge', 'spike', 'dip', 'crash', 'bubble',
  // Hobby General
  'card', 'cards', 'collecting', 'collector', 'hobby', 'trading card',
  'sports card', 'rookie card', 'auto', 'autograph', 'patch', 'relic',
  'serial', 'numbered', '1/1', 'one of one', 'parallel', 'insert',
  'refractor', 'chrome', 'color', 'variation',
];

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

function categorize(text: string): string {
  const lower = text.toLowerCase();
  if (/release|new set|checklist|first look|preview|drop|launch|product/.test(lower)) return 'RELEASE';
  if (/auction|sold|sells for|record sale|pwcc|goldin|heritage/.test(lower)) return 'SALE';
  if (/psa|bgs|sgc|grading|graded|pop report|slab/.test(lower)) return 'GRADING';
  if (/market|prices|value|invest|trend|rally|surge|spike|dip/.test(lower)) return 'MARKET';
  if (/break|case break|group break|hobby box|blaster/.test(lower)) return 'BREAKS';
  return 'NEWS';
}

function formatRelativeTime(dateStr: string): string {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins < 60)  return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7)   return `${days}d ago`;
    return `${Math.floor(days / 7)}w ago`;
  } catch {
    return 'Recent';
  }
}

export async function GET() {
  const feedResults = await Promise.allSettled(
    CARD_FEEDS.map(async feed => {
      const res = await fetch(feed.url, {
        headers: { 'User-Agent': 'SlabStreet/1.0 RSS Reader' },
        next: { revalidate: 1800 },
      });
      if (!res.ok) throw new Error(`${feed.source} returned ${res.status}`);
      const xml = await res.text();
      return parseRSS(xml, feed.source);
    })
  );

  const allArticles: any[] = [];
  feedResults.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      allArticles.push(...result.value);
    } else {
      console.warn(`Card feed failed: ${CARD_FEEDS[i].source}`, result.reason);
    }
  });

  // Score by card keyword relevance
  const scored = allArticles.map(a => {
    const text = `${a.title} ${a.description}`.toLowerCase();
    const matchCount = CARD_KEYWORDS.filter(k => text.includes(k)).length;
    const category = categorize(`${a.title} ${a.description}`);
    const pubDate = a.date ? new Date(a.date).getTime() : 0;
    return { ...a, matchCount, category, pubDate };
  });

  // Filter: must match at least 1 card keyword
  const relevant = scored.filter(a => a.matchCount > 0);

  // Sort: recency first, then relevance
  relevant.sort((a, b) => {
    if (b.pubDate !== a.pubDate) return b.pubDate - a.pubDate;
    return b.matchCount - a.matchCount;
  });

  // Deduplicate
  const seen = new Set<string>();
  const deduped = relevant.filter(a => {
    const key = a.title.toLowerCase().slice(0, 40);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const results = deduped.slice(0, 12).map(a => ({
    headline: a.title,
    source: a.source,
    url: a.link,
    category: a.category,
    time: a.date ? formatRelativeTime(a.date) : 'Recent',
  }));

  return NextResponse.json({
    article_count: results.length,
    total_scanned: allArticles.length,
    news: results,
    cached_at: new Date().toISOString(),
  });
}
