'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../ThemeProvider';
import WidgetShell, { WidgetSkeleton, WidgetError, WidgetEmpty } from './WidgetShell';
import ScheduleGameRow from './ScheduleGameRow';

const LEAGUES = ['NBA', 'NFL', 'MLB', 'NHL', 'WNBA'] as const;

interface ScheduleGame {
  id: string;
  home_team: string;
  away_team: string;
  time: string;
  home_score?: string;
  away_score?: string;
  status: string;
  spread?: string;
  total?: string;
  boxscore_url?: string;
  league: string;
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

export default function FullSchedule() {
  const { colors: c } = useTheme();
  const [today] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [selectedLeague, setSelectedLeague] = useState<string>('NBA');
  const [games, setGames] = useState<ScheduleGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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
          `/api/schedule?league=${selectedLeague}&date=${dateStr}`
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
  }, [selectedDate, selectedLeague]);

  return (
    <WidgetShell title="SCHEDULE" icon="📅" accentColor={c.cyan}>
      {/* Date navigation bar */}
      <div
        className="flex items-center justify-between rounded px-4 py-2.5 mb-3"
        style={{ background: c.bg, border: `1px solid ${c.border}` }}
      >
        <button
          onClick={goToPrev}
          disabled={!canGoPrev}
          className="font-body text-sm px-2 py-1 rounded transition-opacity"
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

        <div className="flex items-center gap-3">
          <span className="font-body text-[13px] font-medium" style={{ color: c.text }}>
            {formatDateDisplay(selectedDate)}
          </span>
          {!isToday && (
            <button
              onClick={goToToday}
              className="font-body text-[10px] font-medium px-2 py-0.5 rounded"
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
        </div>

        <button
          onClick={goToNext}
          disabled={!canGoNext}
          className="font-body text-sm px-2 py-1 rounded transition-opacity"
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

      {/* League filter mini-tabs */}
      <div className="flex items-center gap-1.5 mb-4 flex-wrap">
        {LEAGUES.map((league) => {
          const isActive = selectedLeague === league;
          return (
            <button
              key={league}
              onClick={() => setSelectedLeague(league)}
              className="font-body text-[10px] font-semibold px-3 py-1 rounded-full transition-colors"
              style={{
                background: isActive ? c.cyan : 'transparent',
                color: isActive ? c.bg : c.muted,
                border: isActive ? 'none' : `1px solid ${c.border}`,
                cursor: 'pointer',
              }}
            >
              {league}
            </button>
          );
        })}
      </div>

      {/* Content area */}
      {loading && <WidgetSkeleton rows={4} />}
      {error && <WidgetError message="Unable to load schedule" />}
      {!loading && !error && games.length === 0 && (
        <WidgetEmpty
          message={`No ${selectedLeague} games on ${formatDateDisplay(selectedDate)}`}
        />
      )}
      {!loading && !error && games.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {games.map((g) => (
            <ScheduleGameRow
              key={g.id}
              homeTeam={g.home_team}
              awayTeam={g.away_team}
              time={g.time}
              homeScore={g.home_score}
              awayScore={g.away_score}
              status={g.status}
              spread={g.spread}
              total={g.total}
              boxscoreUrl={g.boxscore_url}
              league={g.league}
            />
          ))}
        </div>
      )}
    </WidgetShell>
  );
}
