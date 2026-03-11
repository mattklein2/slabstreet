'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../ThemeProvider';
import { useLeague } from '../LeagueProvider';
import { WidgetSkeleton, WidgetError, WidgetEmpty } from './WidgetShell';
import ScoreBugCard from './ScoreBugCard';

// ESPN league slug mapping for logo URLs
const LEAGUE_TO_ESPN: Record<string, string> = {
  NBA: 'nba',
  NFL: 'nfl',
  MLB: 'mlb',
  NHL: 'nhl',
  WNBA: 'wnba',
  F1: 'f1',
};

interface ScheduleGame {
  id: string;
  home_team: string;
  away_team: string;
  home_abbrev: string;
  away_abbrev: string;
  home_score: string | null;
  away_score: string | null;
  status: string;
  period: number | null;
  clock: string | null;
  commence_time: string;
  spread: string | null;
  total: string | null;
  boxscoreUrl: string | null;
}

function formatDateDisplay(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function formatDateApi(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function daysDiff(a: Date, b: Date): number {
  const msPerDay = 86400000;
  const aStart = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const bStart = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((aStart.getTime() - bStart.getTime()) / msPerDay);
}

function formatGameTime(commenceTime: string): string {
  try {
    const d = new Date(commenceTime);
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '';
  }
}

export default function FullSchedule() {
  const { colors: c } = useTheme();
  const { activeLeague } = useLeague();
  const [today] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [games, setGames] = useState<ScheduleGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Schedule needs a specific league — default to NBA when global filter is ALL
  const scheduleLeague = activeLeague === 'ALL' ? 'NBA' : activeLeague;
  const espnLeague = LEAGUE_TO_ESPN[scheduleLeague] || 'nba';

  const canGoPrev = daysDiff(selectedDate, today) > -7;
  const canGoNext = daysDiff(selectedDate, today) < 7;
  const isToday = isSameDay(selectedDate, today);

  const goToPrev = useCallback(() => {
    if (canGoPrev) setSelectedDate((d) => addDays(d, -1));
  }, [canGoPrev]);

  const goToNext = useCallback(() => {
    if (canGoNext) setSelectedDate((d) => addDays(d, 1));
  }, [canGoNext]);

  const goToToday = useCallback(() => {
    setSelectedDate(new Date());
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadSchedule() {
      setLoading(true);
      setError(false);
      try {
        const dateStr = formatDateApi(selectedDate);
        const res = await fetch(
          `/api/schedule?league=${scheduleLeague}&date=${dateStr}`
        );
        if (!res.ok) throw new Error('Failed to fetch schedule');
        const data = await res.json();
        if (!cancelled) {
          setGames(data.games || []);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSchedule();
    return () => {
      cancelled = true;
    };
  }, [selectedDate, scheduleLeague]);

  return (
    <div
      className="rounded-md"
      style={{
        background: c.surface,
        border: `1px solid ${c.border}`,
        borderTop: `2px solid ${c.cyan}`,
      }}
    >
      {/* Compact header with icon, title, date nav */}
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-2.5">
          <span className="text-base leading-none">📅</span>
          <span
            className="font-body text-[13px] font-medium tracking-widest uppercase"
            style={{ color: c.cyan }}
          >
            SCORES
          </span>
        </div>

        {/* Date navigation — inline in header */}
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrev}
            disabled={!canGoPrev}
            className="font-body text-sm px-1.5 py-0.5 rounded"
            style={{
              color: canGoPrev ? c.text : c.muted,
              opacity: canGoPrev ? 1 : 0.4,
              background: 'transparent',
              border: 'none',
              cursor: canGoPrev ? 'pointer' : 'default',
            }}
            aria-label="Previous day"
          >
            ←
          </button>
          <span
            className="font-body text-[12px] font-medium"
            style={{ color: c.text }}
          >
            {formatDateDisplay(selectedDate)}
          </span>
          {!isToday && (
            <button
              onClick={goToToday}
              className="font-body text-[9px] font-medium px-1.5 py-0.5 rounded"
              style={{
                color: c.cyan,
                background: 'transparent',
                border: `1px solid ${c.cyan}`,
                cursor: 'pointer',
              }}
            >
              Today
            </button>
          )}
          <button
            onClick={goToNext}
            disabled={!canGoNext}
            className="font-body text-sm px-1.5 py-0.5 rounded"
            style={{
              color: canGoNext ? c.text : c.muted,
              opacity: canGoNext ? 1 : 0.4,
              background: 'transparent',
              border: 'none',
              cursor: canGoNext ? 'pointer' : 'default',
            }}
            aria-label="Next day"
          >
            →
          </button>
        </div>
      </div>

      {/* Score bug cards — horizontal scroll */}
      <div className="px-6 pb-5">
        {loading && <WidgetSkeleton rows={1} />}
        {error && <WidgetError message="Unable to load scores" />}
        {!loading && !error && games.length === 0 && (
          <WidgetEmpty
            message={`No ${scheduleLeague} games on ${formatDateDisplay(selectedDate)}`}
          />
        )}
        {!loading && !error && games.length > 0 && (
          <div
            className="flex gap-3 overflow-x-auto pb-1"
            style={{ scrollbarWidth: 'thin' }}
          >
            {games.map((g) => (
              <ScoreBugCard
                key={g.id}
                homeTeam={g.home_team}
                awayTeam={g.away_team}
                homeAbbrev={g.home_abbrev || ''}
                awayAbbrev={g.away_abbrev || ''}
                homeScore={g.home_score}
                awayScore={g.away_score}
                status={g.status}
                period={g.period}
                clock={g.clock}
                time={formatGameTime(g.commence_time)}
                boxscoreUrl={g.boxscoreUrl}
                espnLeague={espnLeague}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
