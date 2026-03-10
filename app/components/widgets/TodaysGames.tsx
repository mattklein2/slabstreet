'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '../ThemeProvider';
import { useLeague } from '../LeagueProvider';
import { getLeagueConfig, getAllLeagueIds } from '@/lib/leagues';
import WidgetShell, { WidgetSkeleton, WidgetError, WidgetEmpty } from './WidgetShell';
import GameRow from './GameRow';

type GameOdds = {
  id: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: {
    title: string;
    h2h: { home: string; away: string; draw?: string };
    spreads: { home: string; away: string; home_point: string; away_point: string };
    totals: { over: string; under: string; over_point: string; under_point: string };
  }[];
};

export default function TodaysGames() {
  const { colors: c } = useTheme();
  const { activeLeague } = useLeague();
  const [games, setGames] = useState<GameOdds[]>([]);
  const [displayLeague, setDisplayLeague] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(false);
      try {
        if (activeLeague === 'ALL') {
          // Try leagues in order until one has games
          const leagueIds = getAllLeagueIds();
          for (const lid of leagueIds) {
            const config = getLeagueConfig(lid);
            if (!config.oddsApiGameKey) continue;
            const res = await fetch(`/api/odds/games?league=${lid}`);
            const data = await res.json();
            const now = Date.now();
            const upcoming = (data.games || []).filter(
              (g: GameOdds) => new Date(g.commence_time).getTime() >= now - 3600000
            );
            if (upcoming.length > 0) {
              setGames(upcoming.slice(0, 4));
              setDisplayLeague(lid);
              setLoading(false);
              return;
            }
          }
          setGames([]);
          setDisplayLeague('');
        } else {
          const config = getLeagueConfig(activeLeague);
          if (!config.oddsApiGameKey) {
            setGames([]);
            setDisplayLeague(activeLeague);
            setLoading(false);
            return;
          }
          const res = await fetch(`/api/odds/games?league=${activeLeague}`);
          const data = await res.json();
          const now = Date.now();
          const upcoming = (data.games || []).filter(
            (g: GameOdds) => new Date(g.commence_time).getTime() >= now - 3600000
          );
          setGames(upcoming.slice(0, 4));
          setDisplayLeague(activeLeague);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [activeLeague]);

  const leagueLabel = displayLeague || activeLeague;
  const scheduleHref = displayLeague ? `/odds/${displayLeague.toLowerCase()}` : undefined;

  function formatTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
  }

  function getSpread(g: GameOdds) {
    if (!g.bookmakers?.[0]?.spreads) return undefined;
    const s = g.bookmakers[0].spreads;
    const point = parseFloat(s.home_point);
    return `${g.home_team.split(' ').pop()} ${point > 0 ? '+' : ''}${point}`;
  }

  return (
    <WidgetShell
      title="TODAY'S GAMES"
      icon="🏀"
      accentColor={c.cyan}
      viewAllHref={scheduleHref}
      viewAllLabel="Full Schedule →"
    >
      {loading && <WidgetSkeleton rows={3} />}
      {error && <WidgetError message="Unable to load games" />}
      {!loading && !error && games.length === 0 && (
        <WidgetEmpty message={`No upcoming ${leagueLabel} games today`} />
      )}
      {!loading && !error && games.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {games.map((g) => (
            <GameRow
              key={g.id}
              homeTeam={g.home_team}
              awayTeam={g.away_team}
              time={formatTime(g.commence_time)}
              spread={getSpread(g)}
            />
          ))}
        </div>
      )}
    </WidgetShell>
  );
}
