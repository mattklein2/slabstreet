import { NextResponse } from 'next/server';

/*
  GET /api/momentum?player=Victor+Wembanyama&slug=wemby
  
  Pulls recent tweets mentioning a player from a curated list of high-signal
  sports card and NBA accounts. Returns:
  - mention count (last 7 days)
  - sentiment score (positive/negative/neutral)
  - momentum signal (rising/falling/stable)
  - top tweets
  
  Cached 1 hour to preserve free tier limits.
  On Basic tier ($200/mo) this covers full NBA comfortably.
*/

// ─────────────────────────────────────────────────────────────
// CURATED ACCOUNT LIST
// High-signal accounts only — 10k+ followers, card/NBA relevant
// Add/remove accounts here as you tune the signal
// ─────────────────────────────────────────────────────────────
const CURATED_ACCOUNTS = {
  // NBA Insiders & Beat Reporters
  nba_insiders: [
    'wojespn',        // Adrian Wojnarowski
    'ShamsCharania',  // Shams Charania
    'ChrisBHaynes',   // Chris Haynes
    'TheAthletic',    // The Athletic
    'ESPNStatsInfo',  // ESPN Stats
    'NBAonTNT',       // NBA on TNT
    'NBATV',          // NBA TV
    'NBA',            // Official NBA
  ],

  // Sports Card Market Accounts
  card_market: [
    'BleekerTrading',     // Bleeker Trading
    'GoldinAuctions',     // Goldin Auctions
    'PWCCAuctions',       // PWCC Auctions
    'houseofcards_',      // House of Cards
    'CardboardConnection',// Cardboard Connection
    'BeckettMedia',       // Beckett
    'psacard',            // PSA Official
    'PaniniAmerica',      // Panini America
    'ToppsCards',         // Topps
    'UpperDeckSports',    // Upper Deck
  ],

  // Card Investor / Collector Influencers
  card_influencers: [
    'GaryVee',            // Gary Vaynerchuk (huge card market mover)
    'AltXYZ',             // Alt Platform
    'CardLadder',         // Card Ladder
    'geographicsports',   // Geographic Sports
    'icebergcollect',     // Iceberg Collectibles
  ],

  // Team & Player Official Accounts
  nba_teams: [
    'spurs',              // San Antonio Spurs
    'Lakers',             // LA Lakers
    'memgrizz',           // Memphis Grizzlies
    'Timberwolves',       // Minnesota Timberwolves
  ],
};

// Flatten all accounts into one list
const ALL_ACCOUNTS = [
  ...CURATED_ACCOUNTS.nba_insiders,
  ...CURATED_ACCOUNTS.card_market,
  ...CURATED_ACCOUNTS.card_influencers,
  ...CURATED_ACCOUNTS.nba_teams,
];

// Build the from: query string for X API
// X API supports up to 25 from: operators per query
function buildFromQuery(accounts: string[]): string {
  return accounts.slice(0, 25).map(a => `from:${a}`).join(' OR ');
}

// Simple sentiment scoring based on keywords
function scoreSentiment(text: string): 'positive' | 'negative' | 'neutral' {
  const lower = text.toLowerCase();
  
  const positiveWords = [
    'buy', 'buying', 'loaded', 'loading', 'undervalued', 'steal', 'pop', 'explode',
    'surge', 'surging', 'rising', 'up', 'gain', 'winner', 'mvp', 'hot', 'fire',
    'historic', 'record', 'breakout', 'all-star', 'dominant', 'elite', 'grail',
    '🔥', '📈', '💰', '👑', '⚡', '🚀',
  ];
  
  const negativeWords = [
    'sell', 'selling', 'overvalued', 'drop', 'dropping', 'falling', 'down', 'avoid',
    'injury', 'injured', 'hurt', 'suspension', 'suspended', 'bust', 'concern',
    'worried', 'risky', 'risk', 'slump', 'struggling', 'trade', 'traded',
    '📉', '🚨', '⚠️',
  ];

  let score = 0;
  positiveWords.forEach(w => { if (lower.includes(w)) score++; });
  negativeWords.forEach(w => { if (lower.includes(w)) score--; });

  if (score > 0) return 'positive';
  if (score < 0) return 'negative';
  return 'neutral';
}

// Convert sentiment counts to a 0-100 momentum score
function calcMomentumScore(
  mentionCount: number,
  positive: number,
  negative: number,
  neutral: number
): number {
  if (mentionCount === 0) return 50; // neutral baseline

  const sentimentRatio = (positive - negative) / mentionCount;
  const volumeBonus = Math.min(mentionCount * 2, 20); // up to +20 for high volume

  // Base score 50, adjust for sentiment direction and volume
  const raw = 50 + (sentimentRatio * 30) + volumeBonus;
  return Math.round(Math.max(0, Math.min(100, raw)));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const player = searchParams.get('player') || '';

  if (!player) {
    return NextResponse.json({ error: 'player= parameter required' }, { status: 400 });
  }

  const bearerToken = process.env.X_BEARER_TOKEN;
  if (!bearerToken) {
    return NextResponse.json({ error: 'X_BEARER_TOKEN not configured' }, { status: 500 });
  }

  try {
    // Build query: player name mentioned by any curated account, last 7 days
    // Using recent search endpoint (Basic tier required for full access)
    const fromQuery = buildFromQuery(ALL_ACCOUNTS);
    const playerQuery = `"${player}" (${fromQuery}) -is:retweet lang:en`;
    const encodedQuery = encodeURIComponent(playerQuery);

    const url = `https://api.twitter.com/2/tweets/search/recent?query=${encodedQuery}&max_results=20&tweet.fields=created_at,public_metrics,text&expansions=author_id&user.fields=name,username,public_metrics`;

    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${bearerToken}` },
      next: { revalidate: 3600 }, // cache 1 hour
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('X API error:', res.status, err);
      
      // Return mock data on free tier (search requires Basic)
      // So the UI still works while on free tier
      return NextResponse.json({
        momentum_score: 50,
        mention_count: 0,
        sentiment: { positive: 0, negative: 0, neutral: 0 },
        signal: 'stable',
        tweets: [],
        note: 'Live data requires Basic tier ($200/mo). Showing neutral baseline.',
        tier_required: true,
      });
    }

    const data = await res.json();
    const tweets = data.data || [];

    // Score each tweet sentiment
    let positive = 0, negative = 0, neutral = 0;
    const scoredTweets = tweets.map((t: any) => {
      const sentiment = scoreSentiment(t.text);
      if (sentiment === 'positive') positive++;
      else if (sentiment === 'negative') negative++;
      else neutral++;
      return { ...t, sentiment };
    });

    const mentionCount = tweets.length;
    const momentumScore = calcMomentumScore(mentionCount, positive, negative, neutral);
    const signal = momentumScore >= 65 ? 'rising' : momentumScore <= 35 ? 'falling' : 'stable';

    return NextResponse.json({
      momentum_score: momentumScore,
      mention_count: mentionCount,
      sentiment: { positive, negative, neutral },
      signal,
      tweets: scoredTweets.slice(0, 5), // top 5 tweets for display
      cached_at: new Date().toISOString(),
    });

  } catch (err) {
    console.error('Momentum route error:', err);
    return NextResponse.json({
      momentum_score: 50,
      mention_count: 0,
      sentiment: { positive: 0, negative: 0, neutral: 0 },
      signal: 'stable',
      tweets: [],
      error: 'Failed to fetch momentum data',
    });
  }
}
