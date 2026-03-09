import { NextResponse } from 'next/server';
import { getLeagueConfig } from '../../../lib/leagues';
import { searchEspnPlayer } from '../../../lib/espn';

/*
  GET /api/gamelog?espnId=5104157&league=NBA
  GET /api/gamelog?player=Victor+Wembanyama&league=NBA

  Returns last 10 games with per-game stats from ESPN.
  Accepts either espnId (preferred, skips search) or player name.
*/

// Which stat labels to display in the compact game log table, per league
const DISPLAY_COLUMNS: Record<string, string[]> = {
  NBA: ['PTS', 'REB', 'AST', 'FG%', 'MIN'],
  NFL: ['CMP', 'YDS', 'TD', 'INT', 'QBR'],
  MLB: ['AB', 'H', 'HR', 'RBI', 'AVG'],
  NHL: ['G', 'A', 'PTS', '+/-', 'TOI'],
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let espnId = searchParams.get('espnId') || '';
  const leagueId = searchParams.get('league') || 'NBA';
  const playerName = searchParams.get('player') || '';

  const config = getLeagueConfig(leagueId);
  if (!config.espnSport || !config.espnLeague || leagueId === 'F1') {
    return NextResponse.json({ games: [], labels: [], sport: '', league: '', source: 'none' });
  }

  // Resolve ESPN ID if not provided
  if (!espnId && playerName) {
    const player = await searchEspnPlayer(playerName, config.espnSport, config.espnLeague);
    if (player?.id) espnId = player.id;
  }

  if (!espnId) {
    return NextResponse.json({ games: [], labels: [], source: 'none', error: 'espnId or player required' });
  }

  try {
    const url = `https://site.api.espn.com/apis/common/v3/sports/${config.espnSport}/${config.espnLeague}/athletes/${espnId}/gamelog`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) {
      return NextResponse.json({ games: [], labels: [], source: 'none' });
    }
    const data = await res.json();

    // Top-level labels and events map
    const allLabels: string[] = data.labels || [];
    const eventsMap: Record<string, any> = data.events || {};

    // Collect all game events from the most recent season type
    const seasonTypes = data.seasonTypes || [];
    const allEvents: { eventId: string; stats: string[] }[] = [];

    for (const st of seasonTypes) {
      for (const cat of (st.categories || [])) {
        for (const ev of (cat.events || [])) {
          if (ev.eventId && ev.stats) {
            allEvents.push({ eventId: ev.eventId, stats: ev.stats });
          }
        }
      }
    }

    // Take last 10 games (events are chronological, most recent categories first)
    const recentEvents = allEvents.slice(0, 10);

    // Determine which column indices to show
    const displayCols = DISPLAY_COLUMNS[leagueId] || allLabels.slice(0, 5);
    const colIndices: number[] = [];
    const displayLabels: string[] = [];
    for (const col of displayCols) {
      const idx = allLabels.indexOf(col);
      if (idx !== -1) {
        colIndices.push(idx);
        displayLabels.push(col);
      }
    }
    // Fallback: if no matching columns, use first 5
    if (colIndices.length === 0) {
      for (let i = 0; i < Math.min(5, allLabels.length); i++) {
        colIndices.push(i);
        displayLabels.push(allLabels[i]);
      }
    }

    // Build game objects
    const games = recentEvents.map(ev => {
      const detail = eventsMap[ev.eventId] || {};

      // Format date
      let date = '';
      if (detail.gameDate) {
        const d = new Date(detail.gameDate);
        date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }

      // Opponent
      const atVs = detail.atVs || 'vs';
      const oppAbbr = detail.opponent?.abbreviation || '???';
      const opponent = `${atVs} ${oppAbbr}`;

      // Result
      const result = `${detail.gameResult || ''}  ${detail.score || ''}`.trim();

      // Pick display stats
      const stats = colIndices.map(i => ({
        label: allLabels[i],
        val: ev.stats[i] || '-',
      }));

      return {
        eventId: ev.eventId,
        date,
        opponent,
        result,
        won: (detail.gameResult || '').startsWith('W'),
        stats,
      };
    });

    return NextResponse.json({
      games,
      labels: displayLabels,
      sport: config.espnSport,
      league: config.espnLeague,
      source: games.length > 0 ? 'espn' : 'none',
    });
  } catch {
    return NextResponse.json({ games: [], labels: [], source: 'none' });
  }
}
