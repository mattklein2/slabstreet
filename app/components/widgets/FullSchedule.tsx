'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTheme } from '../ThemeProvider';
import { useLeague } from '../LeagueProvider';
import { WidgetSkeleton, WidgetError, WidgetEmpty } from './WidgetShell';
import ScoreBugRow from './ScoreBugRow';
import F1Results from './F1Results';

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

const SCORE_LEAGUES = ['NBA', 'NFL', 'MLB', 'NHL', 'WNBA', 'F1'] as const;

// ─── Mini Calendar Dropdown ─────────────────────────────────
function MiniCalendar({
  selected,
  today,
  onSelect,
  onClose,
  colors: c,
}: {
  selected: Date;
  today: Date;
  onSelect: (d: Date) => void;
  onClose: () => void;
  colors: Record<string, string>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [viewMonth, setViewMonth] = useState(selected.getMonth());
  const [viewYear, setViewYear] = useState(selected.getFullYear());

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDow = new Date(viewYear, viewMonth, 1).getDay();
  const monthLabel = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(
    new Date(viewYear, viewMonth, 1)
  );

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDow; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  return (
    <div
      ref={ref}
      className="absolute top-full left-0 mt-1 z-50 rounded-xl shadow-lg p-2"
      style={{ background: c.surface, border: `1px solid ${c.border}`, width: 220 }}
    >
      {/* Month nav */}
      <div className="flex items-center justify-between mb-1.5">
        <button
          onClick={prevMonth}
          className="font-body text-xs px-1.5 py-0.5 rounded"
          style={{ color: c.text, background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          ‹
        </button>
        <span className="font-body text-[11px] font-semibold" style={{ color: c.text }}>
          {monthLabel}
        </span>
        <button
          onClick={nextMonth}
          className="font-body text-xs px-1.5 py-0.5 rounded"
          style={{ color: c.text, background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          ›
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 gap-0.5 mb-0.5">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="font-body text-[9px] text-center font-semibold" style={{ color: c.muted }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} />;
          const date = new Date(viewYear, viewMonth, day);
          const isSelected = isSameDay(date, selected);
          const isToday = isSameDay(date, today);
          return (
            <button
              key={day}
              onClick={() => { onSelect(date); onClose(); }}
              className="font-body text-[11px] rounded py-0.5 cursor-pointer"
              style={{
                color: isSelected ? '#fff' : isToday ? c.cyan : c.text,
                background: isSelected ? c.cyan : 'transparent',
                border: isToday && !isSelected ? `1px solid ${c.cyan}` : '1px solid transparent',
                fontWeight: isToday || isSelected ? 600 : 400,
              }}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Today shortcut */}
      <button
        onClick={() => { onSelect(new Date()); onClose(); }}
        className="font-body text-[10px] font-medium w-full mt-1.5 py-1 rounded cursor-pointer"
        style={{ color: c.cyan, background: 'transparent', border: `1px solid ${c.border}` }}
      >
        Today
      </button>
    </div>
  );
}

export default function FullSchedule() {
  const { colors: c } = useTheme();
  const { activeLeague } = useLeague();
  const [today] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [scoreLeague, setScoreLeague] = useState('NBA');
  const [games, setGames] = useState<ScheduleGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Sync with global league filter when it changes (but not when ALL)
  useEffect(() => {
    if (activeLeague !== 'ALL') {
      setScoreLeague(activeLeague);
    }
  }, [activeLeague]);

  const espnLeague = LEAGUE_TO_ESPN[scoreLeague] || 'nba';

  const canGoPrev = daysDiff(selectedDate, today) > -7;
  const canGoNext = daysDiff(selectedDate, today) < 7;

  const goToPrev = useCallback(() => {
    if (canGoPrev) setSelectedDate((d) => addDays(d, -1));
  }, [canGoPrev]);

  const goToNext = useCallback(() => {
    if (canGoNext) setSelectedDate((d) => addDays(d, 1));
  }, [canGoNext]);

  useEffect(() => {
    let cancelled = false;

    async function loadSchedule() {
      setLoading(true);
      setError(false);
      try {
        const dateStr = formatDateApi(selectedDate);
        const res = await fetch(
          `/api/schedule?league=${scoreLeague}&date=${dateStr}`
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
  }, [selectedDate, scoreLeague]);

  return (
    <div
      style={{
        background: c.surface,
        border: `1px solid ${c.border}`,
        borderRadius: 16,
      }}
    >
      {/* Header: title + calendar toggle (hidden for F1) */}
      <div className="flex items-center justify-between" style={{ padding: '18px 22px 8px' }}>
        <div className="flex items-center gap-2">
          <span className="text-sm leading-none">{scoreLeague === 'F1' ? '🏎️' : '📅'}</span>
          <span
            className="font-body text-[11px] font-medium tracking-widest uppercase"
            style={{ color: c.muted }}
          >
            {scoreLeague === 'F1' ? 'F1' : 'SCORES'}
          </span>
        </div>

        {scoreLeague !== 'F1' && (
          <div className="relative flex items-center gap-1.5">
            <button
              onClick={goToPrev}
              disabled={!canGoPrev}
              className="font-body text-xs px-0.5 rounded"
              style={{
                color: canGoPrev ? c.text : c.muted,
                opacity: canGoPrev ? 1 : 0.4,
                background: 'transparent',
                border: 'none',
                cursor: canGoPrev ? 'pointer' : 'default',
              }}
              aria-label="Previous day"
            >
              ‹
            </button>
            <button
              onClick={() => setCalendarOpen((o) => !o)}
              className="font-body text-[11px] font-medium px-1.5 py-0.5 rounded cursor-pointer"
              style={{
                color: c.text,
                background: calendarOpen ? `${c.cyan}18` : 'transparent',
                border: `1px solid ${calendarOpen ? c.cyan : c.border}`,
              }}
            >
              {formatDateDisplay(selectedDate)}
            </button>
            <button
              onClick={goToNext}
              disabled={!canGoNext}
              className="font-body text-xs px-0.5 rounded"
              style={{
                color: canGoNext ? c.text : c.muted,
                opacity: canGoNext ? 1 : 0.4,
                background: 'transparent',
                border: 'none',
                cursor: canGoNext ? 'pointer' : 'default',
              }}
              aria-label="Next day"
            >
              ›
            </button>
            {calendarOpen && (
              <MiniCalendar
                selected={selectedDate}
                today={today}
                onSelect={setSelectedDate}
                onClose={() => setCalendarOpen(false)}
                colors={c}
              />
            )}
          </div>
        )}
      </div>

      {/* League toggle tabs */}
      <div
        className="flex items-center gap-1 px-5 overflow-x-auto pb-2"
      >
        {SCORE_LEAGUES.map((lg) => {
          const active = scoreLeague === lg;
          const accentColor = lg === 'F1' ? '#E8002D' : c.cyan;
          return (
            <button
              key={lg}
              onClick={() => setScoreLeague(lg)}
              className="font-body text-[10px] tracking-wider uppercase cursor-pointer whitespace-nowrap shrink-0"
              style={{
                fontWeight: active ? 600 : 500,
                padding: '4px 10px',
                borderRadius: 6,
                color: active ? accentColor : c.muted,
                background: active ? `${accentColor}12` : 'transparent',
                border: 'none',
              }}
            >
              {lg}
            </button>
          );
        })}
      </div>

      {/* F1 view — race results, qualifying, standings */}
      {scoreLeague === 'F1' && <F1Results />}

      {/* Standard scores — vertical list */}
      {scoreLeague !== 'F1' && (
        <div style={{ padding: '0 22px 22px' }}>
          {loading && <WidgetSkeleton rows={3} />}
          {error && <WidgetError message="Unable to load scores" />}
          {!loading && !error && games.length === 0 && (
            <WidgetEmpty
              message={`No ${scoreLeague} games on ${formatDateDisplay(selectedDate)}`}
            />
          )}
          {!loading && !error && games.length > 0 && (
            <div className="flex flex-col gap-1.5">
              {games.map((g) => (
                <ScoreBugRow
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
      )}
    </div>
  );
}
