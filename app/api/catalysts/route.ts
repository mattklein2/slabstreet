import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getLeagueConfig, getAllLeagueIds } from '../../../lib/leagues';
import { searchEspnPlayer } from '../../../lib/espn';

/*
  GET /api/catalysts

  Identifies players whose card market SHOULD be moving but isn't.
  Combines real-world catalysts (performance breakout, team trajectory,
  opportunity change, youth) with market lag detection (flat prices,
  low volume despite catalysts).

  Returns { buys: CatalystPlayer[], sells: CatalystPlayer[] }
  Cached 2 hours via ISR.
*/

// ── Types ──────────────────────────────────────────────────────
type CatalystPlayer = {
  name: string;
  slug: string;
  team: string;
  league: string;
  score: number;           // existing slab score
  catalystScore: number;   // our catalyst score 0-100
  signal: 'BUY' | 'SELL';
  blurb: string;           // one-line catalyst explanation
  factors: {
    performanceBreakout: number;  // 0-25
    teamTrajectory: number;       // 0-25
    marketLag: number;            // 0-25
    youthPremium: number;         // 0-15
    opportunityChange: number;    // 0-10
  };
  marketData: {
    weeklyChange: number | null;
    monthlyChange: number | null;
    sales24h: number | null;
    marketCap: string | null;
  };
};

// ── ESPN stat key for "primary scoring stat" per league ────────
const PRIMARY_STAT_KEY: Record<string, string> = {
  NBA: 'PTS',
  NFL: 'YDS',
  MLB: 'H',
  NHL: 'PTS',
  WNBA: 'PTS',
};

const MINUTES_KEY: Record<string, string> = {
  NBA: 'MIN',
  WNBA: 'MIN',
  NHL: 'TOI',
};

// ── Supabase (server-side with service role for full access) ──
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// ── Fetch ESPN standings for a league ─────────────────────────
async function fetchStandings(league: string): Promise<Map<string, { seed: number; wins: number; losses: number; inPlayoffs: boolean }>> {
  const config = getLeagueConfig(league);
  if (!config.espnSport || !config.espnLeague || league === 'F1') return new Map();

  try {
    const url = `https://site.api.espn.com/apis/v2/sports/${config.espnSport}/${config.espnLeague}/standings?season=${config.espnStandingsSeason}`;
    const res = await fetch(url, { next: { revalidate: 7200 } });
    if (!res.ok) return new Map();
    const data = await res.json();

    const teamMap = new Map<string, { seed: number; wins: number; losses: number; inPlayoffs: boolean }>();
    const playoffSeeds = config.teamSuccess.playoffSeeds;

    for (const child of (data.children || [])) {
      const entries = child.standings?.entries || [];
      for (const entry of entries) {
        const abbr = entry.team?.abbreviation;
        if (!abbr) continue;

        const stats = entry.stats || [];
        const winsObj = stats.find((s: any) => s.name === 'wins');
        const lossObj = stats.find((s: any) => s.name === 'losses');
        const seedObj = stats.find((s: any) => s.name === 'playoffSeed');

        const wins = winsObj?.value ?? 0;
        const losses = lossObj?.value ?? 0;
        const seed = seedObj?.value ?? 99;

        teamMap.set(abbr, {
          seed,
          wins,
          losses,
          inPlayoffs: seed <= playoffSeeds,
        });
      }
    }
    return teamMap;
  } catch {
    return new Map();
  }
}

// ── Fetch game log for a player ────────────────────────────────
async function fetchGameLog(espnId: string, league: string): Promise<{
  recentAvg: number | null;
  seasonAvg: number | null;
  recentMinutes: number | null;
  seasonMinutes: number | null;
  gamesPlayed: number;
  statLabel: string;
}> {
  const config = getLeagueConfig(league);
  if (!config.espnSport || !config.espnLeague) {
    return { recentAvg: null, seasonAvg: null, recentMinutes: null, seasonMinutes: null, gamesPlayed: 0, statLabel: '' };
  }

  try {
    const url = `https://site.api.espn.com/apis/common/v3/sports/${config.espnSport}/${config.espnLeague}/athletes/${espnId}/gamelog`;
    const res = await fetch(url, { next: { revalidate: 7200 } });
    if (!res.ok) return { recentAvg: null, seasonAvg: null, recentMinutes: null, seasonMinutes: null, gamesPlayed: 0, statLabel: '' };
    const data = await res.json();

    const allLabels: string[] = data.labels || [];
    const primaryKey = PRIMARY_STAT_KEY[league] || 'PTS';
    const minutesKey = MINUTES_KEY[league];
    const primaryIdx = allLabels.indexOf(primaryKey);
    const minutesIdx = minutesKey ? allLabels.indexOf(minutesKey) : -1;

    if (primaryIdx === -1) return { recentAvg: null, seasonAvg: null, recentMinutes: null, seasonMinutes: null, gamesPlayed: 0, statLabel: primaryKey };

    // Collect all game stats
    const allStats: { primary: number; minutes: number | null }[] = [];
    for (const st of (data.seasonTypes || [])) {
      for (const cat of (st.categories || [])) {
        for (const ev of (cat.events || [])) {
          if (ev.stats) {
            const val = parseFloat(ev.stats[primaryIdx]);
            const min = minutesIdx >= 0 ? parseFloat(ev.stats[minutesIdx]) : null;
            if (!isNaN(val)) {
              allStats.push({ primary: val, minutes: min && !isNaN(min) ? min : null });
            }
          }
        }
      }
    }

    if (allStats.length === 0) return { recentAvg: null, seasonAvg: null, recentMinutes: null, seasonMinutes: null, gamesPlayed: 0, statLabel: primaryKey };

    // Recent 5 games vs season avg
    const recent5 = allStats.slice(0, Math.min(5, allStats.length));
    const recentAvg = recent5.reduce((s, g) => s + g.primary, 0) / recent5.length;
    const seasonAvg = allStats.reduce((s, g) => s + g.primary, 0) / allStats.length;

    // Minutes/TOI trend
    const recentMin = recent5.filter(g => g.minutes !== null);
    const allMin = allStats.filter(g => g.minutes !== null);
    const recentMinutes = recentMin.length > 0 ? recentMin.reduce((s, g) => s + g.minutes!, 0) / recentMin.length : null;
    const seasonMinutes = allMin.length > 0 ? allMin.reduce((s, g) => s + g.minutes!, 0) / allMin.length : null;

    return { recentAvg, seasonAvg, recentMinutes, seasonMinutes, gamesPlayed: allStats.length, statLabel: primaryKey };
  } catch {
    return { recentAvg: null, seasonAvg: null, recentMinutes: null, seasonMinutes: null, gamesPlayed: 0, statLabel: '' };
  }
}

// ── Estimate age from ESPN athlete data ────────────────────────
async function fetchPlayerAge(name: string, sport: string, league: string): Promise<number | null> {
  try {
    const player = await searchEspnPlayer(name, sport, league);
    if (!player?.id) return null;

    const url = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/athletes/${player.id}`;
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.age || null;
  } catch {
    return null;
  }
}

// ── Generate blurb from catalyst factors ──────────────────────
function generateBlurb(
  p: { name: string; team: string; league: string },
  factors: CatalystPlayer['factors'],
  details: {
    recentAvg: number | null;
    seasonAvg: number | null;
    statLabel: string;
    age: number | null;
    teamSeed: number | null;
    inPlayoffs: boolean;
    weeklyChange: number | null;
    monthlyChange: number | null;
    sales24h: number | null;
    marketCap: string | null;
    minutesTrend: string | null;
    gamesPlayed: number;
  },
  signal: 'BUY' | 'SELL',
): string {
  const sentences: string[] = [];
  // Use name hash for deterministic but varied phrasing per player
  const nameHash = p.name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const pick = (opts: string[]) => opts[nameHash % opts.length];

  if (signal === 'BUY') {
    // Lead with performance data when available
    if (details.recentAvg && details.seasonAvg && details.seasonAvg > 0) {
      const pctDiff = Math.round(((details.recentAvg - details.seasonAvg) / details.seasonAvg) * 100);
      if (pctDiff > 5) {
        sentences.push(pick([
          `Averaging ${details.recentAvg.toFixed(1)} ${details.statLabel} over his last 5 games, up ${pctDiff}% from his ${details.seasonAvg.toFixed(1)} season average.`,
          `His recent stretch of ${details.recentAvg.toFixed(1)} ${details.statLabel} per game marks a ${pctDiff}% jump over his ${details.seasonAvg.toFixed(1)} season baseline.`,
          `Putting up ${details.recentAvg.toFixed(1)} ${details.statLabel} lately — a ${pctDiff}% spike compared to his ${details.seasonAvg.toFixed(1)} average across the full season.`,
        ]));
      } else if (details.gamesPlayed > 0) {
        sentences.push(pick([
          `Producing ${details.recentAvg.toFixed(1)} ${details.statLabel} per game over his last 5, steady with his ${details.seasonAvg.toFixed(1)} season average across ${details.gamesPlayed} games.`,
          `Consistent at ${details.recentAvg.toFixed(1)} ${details.statLabel} recently, in line with his ${details.seasonAvg.toFixed(1)} average over ${details.gamesPlayed} games this year.`,
          `Holding steady at ${details.recentAvg.toFixed(1)} ${details.statLabel} per game — reliable production across ${details.gamesPlayed} games this season.`,
        ]));
      }
    }

    // Minutes/opportunity context
    if (details.minutesTrend) {
      sentences.push(pick([
        `His role is expanding — ${details.minutesTrend}, suggesting the coaching staff is leaning on him more.`,
        `Worth noting: ${details.minutesTrend}. An increased workload usually precedes a bump in card interest.`,
        `The opportunity is growing — ${details.minutesTrend}, a sign his team sees him as a bigger piece going forward.`,
      ]));
    }

    // Team context
    if (details.inPlayoffs && details.teamSeed) {
      if (details.teamSeed <= 2) {
        sentences.push(pick([
          `${p.team} holds the #${details.teamSeed} seed, which means primetime games and deep playoff exposure that drives card demand.`,
          `With ${p.team} locked into the #${details.teamSeed} seed, he's about to get the kind of national spotlight that moves markets.`,
        ]));
      } else if (details.teamSeed <= 4) {
        sentences.push(pick([
          `${p.team} sits at the #${details.teamSeed} seed with home court advantage in the playoffs — that kind of visibility moves cards.`,
          `${p.team} as the #${details.teamSeed} seed means guaranteed playoff home games and the media attention that follows.`,
        ]));
      } else if (details.teamSeed <= 8) {
        sentences.push(pick([
          `${p.team} is in the playoff mix as the #${details.teamSeed} seed, and a postseason run would boost his card market.`,
          `With ${p.team} holding the #${details.teamSeed} seed, a strong playoff showing could be the spark his card prices need.`,
        ]));
      }
    } else if (details.inPlayoffs === false && details.teamSeed) {
      sentences.push(pick([
        `${p.team} is outside the playoff picture, which is dragging his card prices down — but his individual numbers say the market is overcorrecting.`,
        `${p.team}'s struggles are weighing on his card value, but team record aside, his personal output doesn't deserve this discount.`,
        `The ${p.team} rebuild is suppressing his market, creating a disconnect between his on-field production and what collectors are willing to pay.`,
      ]));
    }

    // Age/youth context
    if (details.age) {
      if (details.age <= 22) {
        sentences.push(pick([
          `At just ${details.age}, he's still developing and hasn't hit his ceiling yet — early entry point before a potential breakout.`,
          `Only ${details.age} years old. The upside hasn't been fully realized yet, and early investors stand to benefit the most.`,
          `He's ${details.age} with years of growth ahead — the kind of age profile where card values compound with each leap forward.`,
        ]));
      } else if (details.age <= 24) {
        sentences.push(pick([
          `At ${details.age}, his prime years are still ahead, meaning there's room for card values to grow alongside his career.`,
          `Still just ${details.age} — right in the window where breakout seasons happen and card prices follow.`,
        ]));
      } else if (details.age >= 27 && details.age <= 30) {
        sentences.push(pick([
          `He's ${details.age} and in his prime window — not a long-term hold, but the current price doesn't reflect his output.`,
          `At ${details.age}, this is a peak-production play. The value is in the short-term upside relative to where the market has him priced.`,
        ]));
      }
    }

    // Market data — what makes this an opportunity (varied endings)
    if (details.sales24h !== null && details.sales24h < 3 && details.marketCap) {
      sentences.push(pick([
        `Only ${details.sales24h} card sales in the last 24 hours despite a ${details.marketCap} market cap — thin volume means there's room to get in before demand picks up.`,
        `Just ${details.sales24h} sales in the past day on a ${details.marketCap} market cap. Low activity at this valuation suggests the market is sleeping on him.`,
        `With only ${details.sales24h} transactions in 24 hours and a ${details.marketCap} market cap, there's a window here before broader attention arrives.`,
      ]));
    } else if (details.weeklyChange !== null && details.monthlyChange !== null) {
      if (Math.abs(details.weeklyChange) < 3 && Math.abs(details.monthlyChange) < 5) {
        sentences.push(pick([
          `Card prices have barely moved — ${details.weeklyChange > 0 ? '+' : ''}${details.weeklyChange.toFixed(1)}% this week, ${details.monthlyChange > 0 ? '+' : ''}${details.monthlyChange.toFixed(1)}% this month — while his on-field numbers tell a different story.`,
          `Flat market action (${details.weeklyChange > 0 ? '+' : ''}${details.weeklyChange.toFixed(1)}% weekly, ${details.monthlyChange > 0 ? '+' : ''}${details.monthlyChange.toFixed(1)}% monthly) despite what the stat sheet shows. The disconnect won't last forever.`,
        ]));
      }
    }

  } else {
    // SELL signal

    // Lead with declining production
    if (details.recentAvg && details.seasonAvg && details.seasonAvg > 0) {
      const pctDown = Math.round(((details.seasonAvg - details.recentAvg) / details.seasonAvg) * 100);
      if (pctDown > 5) {
        sentences.push(pick([
          `Production has dropped to ${details.recentAvg.toFixed(1)} ${details.statLabel} over his last 5 games, down ${pctDown}% from his ${details.seasonAvg.toFixed(1)} season average.`,
          `He's fallen off to ${details.recentAvg.toFixed(1)} ${details.statLabel} recently — a ${pctDown}% dip from his ${details.seasonAvg.toFixed(1)} season average that's hard to ignore.`,
          `Down to ${details.recentAvg.toFixed(1)} ${details.statLabel} per game over his last 5, a ${pctDown}% slide from the ${details.seasonAvg.toFixed(1)} he was averaging on the season.`,
        ]));
      } else {
        sentences.push(pick([
          `Averaging ${details.recentAvg.toFixed(1)} ${details.statLabel} recently, roughly flat with his ${details.seasonAvg.toFixed(1)} season line — nothing to justify the current market premium.`,
          `Holding at ${details.recentAvg.toFixed(1)} ${details.statLabel} per game, right around his ${details.seasonAvg.toFixed(1)} season average. Steady, but the market is pricing in upside that isn't materializing.`,
        ]));
      }
    }

    // Minutes declining
    if (details.minutesTrend) {
      sentences.push(pick([
        `His usage is trending down — ${details.minutesTrend}, which often signals a reduced role going forward.`,
        `Red flag: ${details.minutesTrend}. Declining opportunity usually precedes declining card values.`,
        `The workload is shrinking — ${details.minutesTrend}. Less time on the field means fewer highlight moments to sustain prices.`,
      ]));
    }

    // Team context — varied phrasing for "outside playoff picture"
    if (details.inPlayoffs === false && details.teamSeed) {
      sentences.push(pick([
        `${p.team} is outside the playoff picture, which limits the kind of national exposure that sustains card values through the spring.`,
        `With ${p.team} out of contention, there's no postseason narrative to prop up his card prices heading into the offseason.`,
        `${p.team}'s season is winding down without a playoff berth — historically, that's when overvalued card markets start to correct.`,
        `No playoffs for ${p.team} means less spotlight, fewer highlights, and typically a pullback in card demand.`,
      ]));
    } else if (details.inPlayoffs && details.teamSeed && details.teamSeed >= 7) {
      sentences.push(pick([
        `${p.team} is barely clinging to the #${details.teamSeed} seed — an early exit could trigger a sell-off.`,
        `${p.team} as the #${details.teamSeed} seed is one bad week from falling out, and a missed postseason would hit his card market hard.`,
      ]));
    }

    // Market running hot
    if (details.weeklyChange !== null && details.weeklyChange > 5) {
      sentences.push(pick([
        `Cards are up ${details.weeklyChange.toFixed(1)}% this week despite the numbers — this looks like a sell-the-news window.`,
        `His market is up ${details.weeklyChange.toFixed(1)}% weekly, but the stat line doesn't back it. Prices and performance are diverging.`,
      ]));
    } else if (details.monthlyChange !== null && details.monthlyChange > 10) {
      sentences.push(pick([
        `Up ${details.monthlyChange.toFixed(1)}% over the past month without a performance catalyst to back it — prices may have gotten ahead of reality.`,
        `A ${details.monthlyChange.toFixed(1)}% monthly gain without matching production is the kind of run that tends to give back.`,
      ]));
    }

    // Age factor
    if (details.age) {
      if (details.age >= 34) {
        sentences.push(pick([
          `At ${details.age}, the window is closing. Card values for players this age rarely bounce back after a sustained dip.`,
          `He's ${details.age} — at this stage, any production decline tends to be permanent, and the card market usually follows.`,
        ]));
      } else if (details.age >= 31) {
        sentences.push(pick([
          `At ${details.age}, he's entering the age range where collectors start pricing in decline, especially without a championship push.`,
          `He's ${details.age} — not old, but the market tends to get nervous about players on the wrong side of 30 without a title narrative.`,
        ]));
      }
    }

    // High sales volume on a declining player
    if (details.sales24h !== null && details.sales24h > 15) {
      sentences.push(pick([
        `${details.sales24h} sales in the last 24 hours suggests heavy activity — smart money may already be rotating out.`,
        `High turnover with ${details.sales24h} sales yesterday. When volume spikes on a declining player, it's often a sign of distribution.`,
      ]));
    }
  }

  // Fallback if we couldn't build a real blurb
  if (sentences.length === 0) {
    return signal === 'BUY'
      ? `Multiple catalyst factors are lining up here — the data suggests this market is underpriced relative to what's happening on the field.`
      : `The market appears to be overvaluing current trajectory. Several indicators suggest prices have room to correct downward.`;
  }

  return sentences.join(' ');
}

// ── Main handler ──────────────────────────────────────────────
export async function GET() {
  try {
    // 1. Fetch all active players with cardladder data
    const { data: players, error } = await supabase
      .from('players')
      .select('name, slug, team, league, score, signal, cardladder')
      .eq('active', true)
      .not('cardladder', 'is', null);

    if (error) {
      console.error('Catalysts: Supabase query error:', error.message);
      return NextResponse.json({ buys: [], sells: [], error: error.message });
    }
    if (!players || players.length === 0) {
      console.log('Catalysts: No players with cardladder data found');
      return NextResponse.json({ buys: [], sells: [] });
    }
    console.log(`Catalysts: Found ${players.length} players with cardladder data`);

    // 2. Fetch standings for all leagues in parallel
    const leagueIds = getAllLeagueIds().filter(l => l !== 'F1');
    const standingsMap = new Map<string, Map<string, any>>();
    const standingsResults = await Promise.all(leagueIds.map(l => fetchStandings(l)));
    leagueIds.forEach((l, i) => standingsMap.set(l, standingsResults[i]));

    // 3. Score all players on available data (no ESPN calls yet)
    type ScoredPlayer = {
      player: typeof players[0];
      quickScore: number;
      teamData: { seed: number; wins: number; losses: number; inPlayoffs: boolean } | null;
    };

    const scored: ScoredPlayer[] = players
      .filter(p => p.cardladder?.marketCapNum > 0)
      .map(p => {
        const cl = p.cardladder;
        const teamStandings = standingsMap.get(p.league);
        const teamData = teamStandings?.get(p.team) || null;

        let quickScore = 0;

        // Market lag — low weekly change = market sleeping
        const weekly = cl.weeklyPercentChange ?? null;
        if (weekly !== null && Math.abs(weekly) < 3) quickScore += 15;
        else if (weekly !== null && Math.abs(weekly) < 5) quickScore += 8;

        // Low sales volume relative to market cap
        const sales24h = cl.sales24h ?? 0;
        const mcap = cl.marketCapNum ?? 0;
        if (mcap > 10000 && sales24h < 5) quickScore += 10;
        else if (mcap > 5000 && sales24h < 3) quickScore += 8;

        // Team in playoffs
        if (teamData?.inPlayoffs) {
          quickScore += 10;
          if (teamData.seed <= 4) quickScore += 5;
        }

        // Monthly trend flat but quarterly up (lagging indicator)
        const monthly = cl.monthlyPercentChange ?? null;
        const quarterly = cl.quarterlyPercentChange ?? null;
        if (monthly !== null && quarterly !== null && Math.abs(monthly) < 5 && quarterly > 10) {
          quickScore += 8;
        }

        return { player: p, quickScore, teamData };
      });

    // 4. Take top candidates for detailed ESPN analysis
    scored.sort((a, b) => b.quickScore - a.quickScore);
    const buyCandidates = scored.slice(0, 40);

    // Also find sell candidates — high market activity, potentially overvalued
    const sellScored = players
      .filter(p => p.cardladder?.marketCapNum > 0)
      .map(p => {
        const cl = p.cardladder;
        const teamStandings = standingsMap.get(p.league);
        const teamData = teamStandings?.get(p.team) || null;
        let sellScore = 0;

        // Market running hot
        const weekly = cl.weeklyPercentChange ?? null;
        if (weekly !== null && weekly > 10) sellScore += 15;
        else if (weekly !== null && weekly > 5) sellScore += 8;

        // High volume — lots of attention
        const sales24h = cl.sales24h ?? 0;
        if (sales24h > 20) sellScore += 10;

        // Team NOT in playoffs
        if (teamData && !teamData.inPlayoffs) sellScore += 10;

        // Monthly up but could be peaking
        const monthly = cl.monthlyPercentChange ?? null;
        if (monthly !== null && monthly > 15) sellScore += 8;

        return { player: p, quickScore: sellScore, teamData };
      })
      .sort((a, b) => b.quickScore - a.quickScore)
      .slice(0, 40);

    // 5. Fetch game logs for top candidates (batch, with concurrency limit)
    async function enrichPlayer(
      sp: ScoredPlayer,
      signal: 'BUY' | 'SELL',
    ): Promise<CatalystPlayer | null> {
      const p = sp.player;
      const cl = p.cardladder;
      const config = getLeagueConfig(p.league);

      // Resolve ESPN ID
      let espnId = '';
      if (!espnId && config.espnSport && config.espnLeague) {
        const found = await searchEspnPlayer(p.name, config.espnSport, config.espnLeague);
        if (found?.id) espnId = found.id;
      }

      let gameLogData = { recentAvg: null as number | null, seasonAvg: null as number | null, recentMinutes: null as number | null, seasonMinutes: null as number | null, gamesPlayed: 0, statLabel: '' };
      let age: number | null = null;

      if (espnId && p.league !== 'F1') {
        // Fetch game log and age in parallel
        const [gl, ageData] = await Promise.all([
          fetchGameLog(espnId, p.league),
          config.espnSport && config.espnLeague
            ? (async () => {
                try {
                  const url = `https://site.api.espn.com/apis/site/v2/sports/${config.espnSport}/${config.espnLeague}/athletes/${espnId}`;
                  const res = await fetch(url, { next: { revalidate: 86400 } });
                  if (!res.ok) return null;
                  const data = await res.json();
                  return data.age || null;
                } catch { return null; }
              })()
            : Promise.resolve(null),
        ]);
        gameLogData = gl;
        age = ageData;
      }

      // Compute factor scores
      const factors = {
        performanceBreakout: 0,
        teamTrajectory: 0,
        marketLag: 0,
        youthPremium: 0,
        opportunityChange: 0,
      };

      // Performance breakout (0-25)
      if (gameLogData.recentAvg !== null && gameLogData.seasonAvg !== null && gameLogData.seasonAvg > 0) {
        const ratio = gameLogData.recentAvg / gameLogData.seasonAvg;
        if (signal === 'BUY') {
          if (ratio > 1.3) factors.performanceBreakout = 25;
          else if (ratio > 1.2) factors.performanceBreakout = 20;
          else if (ratio > 1.1) factors.performanceBreakout = 15;
          else if (ratio > 1.05) factors.performanceBreakout = 8;
        } else {
          if (ratio < 0.7) factors.performanceBreakout = 25;
          else if (ratio < 0.8) factors.performanceBreakout = 20;
          else if (ratio < 0.9) factors.performanceBreakout = 15;
          else if (ratio < 0.95) factors.performanceBreakout = 8;
        }
      }

      // Team trajectory (0-25)
      if (sp.teamData) {
        if (signal === 'BUY') {
          if (sp.teamData.inPlayoffs) {
            factors.teamTrajectory = sp.teamData.seed <= 2 ? 25 : sp.teamData.seed <= 4 ? 20 : sp.teamData.seed <= 6 ? 12 : 8;
          }
        } else {
          if (!sp.teamData.inPlayoffs) {
            factors.teamTrajectory = sp.teamData.seed > 12 ? 25 : sp.teamData.seed > 10 ? 15 : 8;
          }
        }
      }

      // Market lag (0-25)
      const weekly = cl.weeklyPercentChange ?? null;
      const monthly = cl.monthlyPercentChange ?? null;
      const sales24h = cl.sales24h ?? 0;
      if (signal === 'BUY') {
        if (weekly !== null && Math.abs(weekly) < 2) factors.marketLag += 12;
        else if (weekly !== null && Math.abs(weekly) < 5) factors.marketLag += 6;
        if (sales24h < 3) factors.marketLag += 8;
        else if (sales24h < 10) factors.marketLag += 4;
        if (monthly !== null && Math.abs(monthly) < 5) factors.marketLag += 5;
      } else {
        if (weekly !== null && weekly > 10) factors.marketLag += 12;
        else if (weekly !== null && weekly > 5) factors.marketLag += 6;
        if (sales24h > 20) factors.marketLag += 8;
        if (monthly !== null && monthly > 15) factors.marketLag += 5;
      }

      // Youth/age factor (-10 to 15)
      // Young breakout players have real upside. Mid-career established guys
      // (27+) rarely see big card value jumps unless they're HOF-bound.
      // On SELL side, aging players lose value faster.
      if (age !== null) {
        if (signal === 'BUY') {
          if (age <= 22) factors.youthPremium = 15;
          else if (age <= 24) factors.youthPremium = 12;
          else if (age <= 25) factors.youthPremium = 6;
          else if (age <= 26) factors.youthPremium = 2;
          // 27+ established players — upside is largely priced in
          // Negative values drag down total catalyst score
          else if (age >= 30) factors.youthPremium = -10;
          else if (age >= 28) factors.youthPremium = -6;
          else if (age >= 27) factors.youthPremium = -3;
        } else {
          if (age >= 34) factors.youthPremium = 15;
          else if (age >= 32) factors.youthPremium = 12;
          else if (age >= 30) factors.youthPremium = 8;
          else if (age >= 28) factors.youthPremium = 4;
        }
      }

      // Opportunity change (0-10) — minutes trending
      if (gameLogData.recentMinutes !== null && gameLogData.seasonMinutes !== null && gameLogData.seasonMinutes > 0) {
        const minRatio = gameLogData.recentMinutes / gameLogData.seasonMinutes;
        if (signal === 'BUY') {
          if (minRatio > 1.15) factors.opportunityChange = 10;
          else if (minRatio > 1.05) factors.opportunityChange = 5;
        } else {
          if (minRatio < 0.85) factors.opportunityChange = 10;
          else if (minRatio < 0.95) factors.opportunityChange = 5;
        }
      }

      const catalystScore = factors.performanceBreakout + factors.teamTrajectory + factors.marketLag + factors.youthPremium + factors.opportunityChange;

      // Skip if catalyst score too low
      if (catalystScore < 15) return null;

      // Minutes trend description
      let minutesTrend: string | null = null;
      if (gameLogData.recentMinutes !== null && gameLogData.seasonMinutes !== null) {
        const diff = gameLogData.recentMinutes - gameLogData.seasonMinutes;
        if (Math.abs(diff) > 2) {
          minutesTrend = diff > 0
            ? `minutes up ${diff.toFixed(1)} MPG recently`
            : `minutes down ${Math.abs(diff).toFixed(1)} MPG recently`;
        }
      }

      const blurb = generateBlurb(
        p,
        factors,
        {
          recentAvg: gameLogData.recentAvg,
          seasonAvg: gameLogData.seasonAvg,
          statLabel: gameLogData.statLabel,
          age,
          teamSeed: sp.teamData?.seed ?? null,
          inPlayoffs: sp.teamData?.inPlayoffs ?? false,
          weeklyChange: weekly,
          monthlyChange: monthly,
          sales24h,
          marketCap: cl.marketCap || null,
          minutesTrend,
          gamesPlayed: gameLogData.gamesPlayed,
        },
        signal,
      );

      return {
        name: p.name,
        slug: p.slug,
        team: p.team,
        league: p.league,
        score: p.score ?? 0,
        catalystScore,
        signal,
        blurb,
        factors,
        marketData: {
          weeklyChange: weekly,
          monthlyChange: monthly,
          sales24h,
          marketCap: cl.marketCap || null,
        },
      };
    }

    // Process in batches of 8 to avoid hammering ESPN
    async function processBatch(candidates: ScoredPlayer[], signal: 'BUY' | 'SELL'): Promise<CatalystPlayer[]> {
      const results: CatalystPlayer[] = [];
      const batchSize = 8;

      for (let i = 0; i < candidates.length; i += batchSize) {
        const batch = candidates.slice(i, i + batchSize);
        const batchResults = await Promise.all(batch.map(c => enrichPlayer(c, signal)));
        for (const r of batchResults) {
          if (r) results.push(r);
        }
      }

      return results;
    }

    const [buyResults, sellResults] = await Promise.all([
      processBatch(buyCandidates, 'BUY'),
      processBatch(sellScored, 'SELL'),
    ]);

    // Sort by catalyst score and take top 20 + watchlist
    buyResults.sort((a, b) => b.catalystScore - a.catalystScore);
    sellResults.sort((a, b) => b.catalystScore - a.catalystScore);

    // Watchlist: next 10 after the top 20 — just names, no blurbs needed
    const buyWatch = buyResults.slice(20, 30).map(p => ({ name: p.name, slug: p.slug, team: p.team, league: p.league }));
    const sellWatch = sellResults.slice(20, 30).map(p => ({ name: p.name, slug: p.slug, team: p.team, league: p.league }));

    return NextResponse.json({
      buys: buyResults.slice(0, 20),
      sells: sellResults.slice(0, 20),
      watchBuys: buyWatch,
      watchSells: sellWatch,
      computed_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Catalysts API error:', err);
    return NextResponse.json({ buys: [], sells: [], error: 'Failed to compute catalysts' });
  }
}
