import { NextResponse } from 'next/server';

/*
  GET /api/boxscore?eventId=401810782&sport=basketball&league=nba

  Returns full box score from ESPN's game summary endpoint.
  Includes both teams' player stats, scores, quarter/period lines, venue.
*/

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get('eventId') || '';
  const sport = searchParams.get('sport') || '';
  const league = searchParams.get('league') || '';

  if (!eventId || !sport || !league) {
    return NextResponse.json({ error: 'eventId, sport, and league required' }, { status: 400 });
  }

  try {
    const url = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/summary?event=${eventId}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) {
      return NextResponse.json({ error: `ESPN returned ${res.status}` }, { status: res.status });
    }
    const data = await res.json();

    // ── Game info ────────────────────────────────────────────
    const comp = data.header?.competitions?.[0];
    const gameInfo = {
      date: comp?.date || '',
      status: comp?.status?.type?.name || '',
      statusDetail: comp?.status?.type?.shortDetail || '',
      venue: data.gameInfo?.venue?.fullName || '',
      attendance: data.gameInfo?.attendance || null,
    };

    // ── Teams (from header competitors) ─────────────────────
    const competitors = comp?.competitors || [];
    const boxPlayers = data.boxscore?.players || [];

    const teams = competitors.map((c: any, idx: number) => {
      const teamBox = boxPlayers.find((p: any) => p.team?.id === c.team?.id) || boxPlayers[idx];
      const statistics = teamBox?.statistics?.[0] || {};
      const statLabels: string[] = statistics.labels || [];
      const athletes = (statistics.athletes || []).map((a: any) => ({
        name: a.athlete?.displayName || '',
        shortName: a.athlete?.shortName || '',
        position: a.athlete?.position?.abbreviation || '',
        starter: a.starter || false,
        stats: a.stats || [],
        didNotPlay: a.didNotPlay || false,
        reason: a.reason || '',
      }));
      const totals: string[] = statistics.totals || [];

      return {
        name: c.team?.displayName || '',
        abbreviation: c.team?.abbreviation || '',
        logo: c.team?.logos?.[0]?.href || c.team?.logo || '',
        score: c.score || '0',
        homeAway: c.homeAway || '',
        winner: c.winner || false,
        linescores: (c.linescores || []).map((l: any) => l.displayValue || '0'),
        statLabels,
        players: athletes,
        totals,
      };
    });

    return NextResponse.json({
      gameInfo,
      teams,
      source: 'espn',
    });
  } catch {
    return NextResponse.json({ gameInfo: null, teams: [], source: 'none' });
  }
}
