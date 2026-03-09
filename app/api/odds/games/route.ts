import { NextResponse } from 'next/server';
import { getLeagueConfig } from '../../../../lib/leagues';

/*
  GET /api/odds/games?league=NBA

  Returns upcoming games with moneyline (h2h), spread, and totals odds
  from The Odds API. Cached 15 minutes (odds change more frequently).
*/

type BookmakerOdds = {
  title: string;
  h2h: { home: string; away: string; draw?: string } | null;
  spreads: { home: string; home_point: string; away: string; away_point: string } | null;
  totals: { over: string; over_point: string; under: string; under_point: string } | null;
};

type GameOdds = {
  id: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: BookmakerOdds[];
};

function formatOdds(price: number): string {
  return price > 0 ? `+${price}` : `${price}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const leagueId = searchParams.get('league') || 'NBA';

  const config = getLeagueConfig(leagueId);
  const apiKey = process.env.ODDS_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ games: [], league: leagueId, source: 'none', error: 'ODDS_API_KEY not configured' });
  }

  if (!config.oddsApiGameKey) {
    return NextResponse.json({ games: [], league: leagueId, source: 'none' });
  }

  try {
    const url = `https://api.the-odds-api.com/v4/sports/${config.oddsApiGameKey}/odds?apiKey=${apiKey}&regions=us&markets=h2h,spreads,totals&oddsFormat=american`;
    const res = await fetch(url, { next: { revalidate: 900 } }); // 15 min cache
    if (!res.ok) {
      return NextResponse.json({ games: [], league: leagueId, source: 'none', error: `API returned ${res.status}` });
    }

    const events = await res.json();

    const games: GameOdds[] = (events || []).map((event: any) => {
      const bookmakers: BookmakerOdds[] = (event.bookmakers || []).map((bk: any) => {
        let h2h: BookmakerOdds['h2h'] = null;
        let spreads: BookmakerOdds['spreads'] = null;
        let totals: BookmakerOdds['totals'] = null;

        for (const market of (bk.markets || [])) {
          if (market.key === 'h2h') {
            const outcomes = market.outcomes || [];
            const homeOut = outcomes.find((o: any) => o.name === event.home_team);
            const awayOut = outcomes.find((o: any) => o.name === event.away_team);
            const drawOut = outcomes.find((o: any) => o.name === 'Draw');
            h2h = {
              home: homeOut ? formatOdds(homeOut.price) : '-',
              away: awayOut ? formatOdds(awayOut.price) : '-',
              ...(drawOut ? { draw: formatOdds(drawOut.price) } : {}),
            };
          }

          if (market.key === 'spreads') {
            const outcomes = market.outcomes || [];
            const homeOut = outcomes.find((o: any) => o.name === event.home_team);
            const awayOut = outcomes.find((o: any) => o.name === event.away_team);
            spreads = {
              home: homeOut ? formatOdds(homeOut.price) : '-',
              home_point: homeOut?.point != null ? (homeOut.point > 0 ? `+${homeOut.point}` : `${homeOut.point}`) : '-',
              away: awayOut ? formatOdds(awayOut.price) : '-',
              away_point: awayOut?.point != null ? (awayOut.point > 0 ? `+${awayOut.point}` : `${awayOut.point}`) : '-',
            };
          }

          if (market.key === 'totals') {
            const outcomes = market.outcomes || [];
            const overOut = outcomes.find((o: any) => o.name === 'Over');
            const underOut = outcomes.find((o: any) => o.name === 'Under');
            totals = {
              over: overOut ? formatOdds(overOut.price) : '-',
              over_point: overOut?.point != null ? `${overOut.point}` : '-',
              under: underOut ? formatOdds(underOut.price) : '-',
              under_point: underOut?.point != null ? `${underOut.point}` : '-',
            };
          }
        }

        return { title: bk.title, h2h, spreads, totals };
      });

      return {
        id: event.id,
        commence_time: event.commence_time,
        home_team: event.home_team,
        away_team: event.away_team,
        bookmakers,
      };
    });

    // Sort by commence time
    games.sort((a, b) => new Date(a.commence_time).getTime() - new Date(b.commence_time).getTime());

    return NextResponse.json({
      games,
      league: leagueId,
      source: games.length > 0 ? 'odds_api' : 'none',
    });
  } catch {
    return NextResponse.json({ games: [], league: leagueId, source: 'none' });
  }
}
