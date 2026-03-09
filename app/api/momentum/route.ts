import { NextResponse } from 'next/server';
import { getSocialAccountsForLeague } from '../../../lib/leagues';

/*
  GET /api/momentum?player=Victor+Wembanyama&slug=wemby&league=NBA

  Pulls recent tweets mentioning a player from a curated list of high-signal
  sports card and league-specific accounts. Returns:
  - mention count (last 7 days)
  - sentiment score (positive/negative/neutral)
  - momentum signal (rising/falling/stable)
  - top tweets
  - team_success_multiplier applied to final score

  League-aware: uses lib/leagues.ts config for social accounts.
  Cached 1 hour to preserve free tier limits.
*/

function buildFromQuery(accounts: string[]): string {
  return accounts.slice(0, 25).map(a => `from:${a}`).join(' OR ');
}

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

function calcRawMomentumScore(
  mentionCount: number,
  positive: number,
  negative: number,
): number {
  if (mentionCount === 0) return 50;
  const sentimentRatio = (positive - negative) / mentionCount;
  const volumeBonus = Math.min(mentionCount * 2, 20);
  const raw = 50 + (sentimentRatio * 30) + volumeBonus;
  return Math.round(Math.max(0, Math.min(100, raw)));
}

// ─────────────────────────────────────────────────────────────
// TEAM SUCCESS FETCH
// Calls /api/odds internally to get the team multiplier
// Falls back to 1.0 (neutral) if unavailable
// ─────────────────────────────────────────────────────────────
async function fetchTeamMultiplier(
  slug: string,
  baseUrl: string,
  league: string = 'NBA',
): Promise<{ multiplier: number; team_success: any }> {
  try {
    const res = await fetch(`${baseUrl}/api/odds?player=${encodeURIComponent(slug)}&league=${league}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return { multiplier: 1.0, team_success: null };
    const data = await res.json();
    return {
      multiplier: data.team_success?.multiplier ?? 1.0,
      team_success: data.team_success ?? null,
    };
  } catch {
    return { multiplier: 1.0, team_success: null };
  }
}

// ─────────────────────────────────────────────────────────────
// ROUTE HANDLER
// ─────────────────────────────────────────────────────────────
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const player   = searchParams.get('player') || '';
  const slug     = searchParams.get('slug') || player.toLowerCase().split(' ').pop() || '';
  const leagueId = searchParams.get('league') || 'NBA';

  if (!player) {
    return NextResponse.json({ error: 'player= parameter required' }, { status: 400 });
  }

  const bearerToken = process.env.X_BEARER_TOKEN;
  if (!bearerToken) {
    return NextResponse.json({ error: 'X_BEARER_TOKEN not configured' }, { status: 500 });
  }

  // Derive base URL for internal API calls
  const requestUrl = new URL(request.url);
  const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;

  // Fetch team success multiplier in parallel with X API call
  const teamMultiplierPromise = fetchTeamMultiplier(slug, baseUrl, leagueId);

  try {
    // Get league-specific social accounts
    const accounts = getSocialAccountsForLeague(leagueId);
    const fromQuery = buildFromQuery(accounts);
    const playerQuery = `"${player}" (${fromQuery}) -is:retweet lang:en`;
    const encodedQuery = encodeURIComponent(playerQuery);
    const url = `https://api.twitter.com/2/tweets/search/recent?query=${encodedQuery}&max_results=20&tweet.fields=created_at,public_metrics,text&expansions=author_id&user.fields=name,username,public_metrics`;

    const [xRes, { multiplier, team_success }] = await Promise.all([
      fetch(url, {
        headers: { 'Authorization': `Bearer ${bearerToken}` },
        next: { revalidate: 3600 },
      }),
      teamMultiplierPromise,
    ]);

    if (!xRes.ok) {
      const err = await xRes.text();
      console.error('X API error:', xRes.status, err);

      // Free tier fallback — still apply team success context
      // Base score 50 × multiplier gives a team-adjusted neutral baseline
      const adjustedScore = Math.round(Math.min(100, 50 * multiplier));

      return NextResponse.json({
        momentum_score: adjustedScore,
        raw_social_score: 50,
        team_multiplier: multiplier,
        team_success,
        mention_count: 0,
        sentiment: { positive: 0, negative: 0, neutral: 0 },
        signal: adjustedScore >= 65 ? 'rising' : adjustedScore <= 35 ? 'falling' : 'stable',
        tweets: [],
        note: 'Live social data requires X Basic tier ($200/mo). Team success context applied to baseline.',
        tier_required: true,
      });
    }

    const data = await xRes.json();
    const tweets = data.data || [];

    let positive = 0, negative = 0, neutral = 0;
    const scoredTweets = tweets.map((t: any) => {
      const sentiment = scoreSentiment(t.text);
      if (sentiment === 'positive') positive++;
      else if (sentiment === 'negative') negative++;
      else neutral++;
      return { ...t, sentiment };
    });

    const mentionCount = tweets.length;
    const rawSocialScore = calcRawMomentumScore(mentionCount, positive, negative);

    // Apply team success multiplier
    // Clamp to 0-100 — team situation can push the score up or pull it down
    const adjustedScore = Math.round(Math.max(0, Math.min(100, rawSocialScore * multiplier)));
    const signal = adjustedScore >= 65 ? 'rising' : adjustedScore <= 35 ? 'falling' : 'stable';

    return NextResponse.json({
      momentum_score: adjustedScore,       // final score after team multiplier
      raw_social_score: rawSocialScore,    // what pure social sentiment produced
      team_multiplier: multiplier,         // e.g. 1.15 for playoff contender
      team_success,                        // full team success object for display
      mention_count: mentionCount,
      sentiment: { positive, negative, neutral },
      signal,
      tweets: scoredTweets.slice(0, 5),
      cached_at: new Date().toISOString(),
    });

  } catch (err) {
    console.error('Momentum route error:', err);

    const { multiplier, team_success } = await teamMultiplierPromise.catch(() => ({
      multiplier: 1.0,
      team_success: null,
    }));

    return NextResponse.json({
      momentum_score: Math.round(50 * multiplier),
      raw_social_score: 50,
      team_multiplier: multiplier,
      team_success,
      mention_count: 0,
      sentiment: { positive: 0, negative: 0, neutral: 0 },
      signal: 'stable',
      tweets: [],
      error: 'Failed to fetch momentum data',
    });
  }
}
