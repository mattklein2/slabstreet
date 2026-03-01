import { NextResponse } from 'next/server';

/*
  GET /api/odds?player=Wembanyama
  Returns an array of { market, book, odds } for a given player last name.
  Results are cached for 1 hour — futures odds don't change minute to minute.
  Falls back to empty array so the player page shows mock data gracefully.
*/

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const playerLastName = (searchParams.get('player') || '').toLowerCase();

  const apiKey = process.env.ODDS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'ODDS_API_KEY not configured', odds: [] },
      { status: 500 }
    );
  }

  const results: { market: string; book: string; odds: string }[] = [];

  // The Odds API futures sport keys we care about
  const futuresSports = [
    { key: 'basketball_nba_championship_winner', label: 'NBA Champion' },
  ];

  for (const sport of futuresSports) {
    try {
      const url = `https://api.the-odds-api.com/v4/sports/${sport.key}/odds?apiKey=${apiKey}&regions=us&markets=outrights&oddsFormat=american`;
      const res = await fetch(url, { next: { revalidate: 3600 } });

      if (!res.ok) continue;

      const events = await res.json();

      // Each event has bookmakers → markets → outcomes
      // outcomes are individual players/teams with their odds
      for (const event of events) {
        for (const bookmaker of (event.bookmakers || [])) {
          for (const market of (bookmaker.markets || [])) {
            for (const outcome of (market.outcomes || [])) {
              const outcomeName: string = outcome.name?.toLowerCase() || '';
              if (playerLastName && outcomeName.includes(playerLastName)) {
                // Only take the first bookmaker result per market to avoid dupes
                const alreadyHave = results.find(r => r.market === sport.label);
                if (!alreadyHave) {
                  const price: number = outcome.price;
                  results.push({
                    market: sport.label,
                    book: bookmaker.title,
                    odds: price > 0 ? `+${price}` : `${price}`,
                  });
                }
              }
            }
          }
        }
      }
    } catch (err) {
      console.error(`Failed to fetch ${sport.key}:`, err);
      // Continue — don't let one failed market break everything
    }
  }

  return NextResponse.json({ odds: results });
}
