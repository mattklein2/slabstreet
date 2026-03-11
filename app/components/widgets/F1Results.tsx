'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '../ThemeProvider';

type F1View = 'race' | 'qualifying' | 'standings';

interface F1Result {
  position: number;
  driver: string;
  team: string;
  winner: boolean;
}

interface StandingEntry {
  rank: number;
  name: string;
  points: number;
}

// Podium position colors
const POSITION_COLORS: Record<number, string> = {
  1: '#FFD700', // gold
  2: '#C0C0C0', // silver
  3: '#CD7F32', // bronze
};

// Team colors (approximate F1 team colors)
const TEAM_COLORS: Record<string, string> = {
  'Red Bull Racing': '#3671C6',
  McLaren: '#FF8000',
  Ferrari: '#E8002D',
  Mercedes: '#27F4D2',
  'Aston Martin': '#229971',
  Alpine: '#0093CC',
  Williams: '#64C4FF',
  'RB F1 Team': '#6692FF',
  'Kick Sauber': '#52E252',
  Haas: '#B6BABD',
};

export default function F1Results() {
  const { colors: c } = useTheme();
  const [view, setView] = useState<F1View>('race');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Race/qualifying data
  const [raceName, setRaceName] = useState('');
  const [results, setResults] = useState<F1Result[]>([]);
  const [raceStatus, setRaceStatus] = useState('');

  // Standings data
  const [drivers, setDrivers] = useState<StandingEntry[]>([]);
  const [constructors, setConstructors] = useState<StandingEntry[]>([]);
  const [standingsTab, setStandingsTab] = useState<'drivers' | 'constructors'>(
    'drivers'
  );

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(`/api/f1?view=${view}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();

        if (cancelled) return;

        if (view === 'standings') {
          setDrivers(data.drivers || []);
          setConstructors(data.constructors || []);
        } else {
          setRaceName(data.raceName || '');
          setResults(data.results || []);
          setRaceStatus(data.status || '');
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, [view]);

  const views: { key: F1View; label: string }[] = [
    { key: 'race', label: 'RACE' },
    { key: 'qualifying', label: 'QUALI' },
    { key: 'standings', label: 'WDC' },
  ];

  return (
    <div>
      {/* F1 view tabs */}
      <div
        className="flex items-center gap-0 px-3 overflow-x-auto"
        style={{ borderBottom: `1px solid ${c.border}` }}
      >
        {views.map((v) => {
          const active = view === v.key;
          return (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              className="font-body text-[11px] tracking-wider uppercase cursor-pointer whitespace-nowrap shrink-0"
              style={{
                fontWeight: active ? 700 : 500,
                padding: '8px 12px',
                color: active ? '#E8002D' : c.muted,
                background: 'transparent',
                border: 'none',
                borderBottom: active ? '2px solid #E8002D' : '2px solid transparent',
                marginBottom: '-1px',
              }}
            >
              {v.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="px-5 pb-4">
        {loading && (
          <div className="flex flex-col gap-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="rounded h-6"
                style={{
                  background: `linear-gradient(90deg, ${c.border} 25%, ${c.surface} 50%, ${c.border} 75%)`,
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s ease-in-out infinite',
                }}
              />
            ))}
          </div>
        )}

        {error && (
          <div
            className="py-6 text-center font-body text-xs"
            style={{ color: c.muted }}
          >
            Unable to load F1 data
          </div>
        )}

        {!loading && !error && view !== 'standings' && (
          <>
            {/* Race name header */}
            {raceName && (
              <div
                className="font-body text-[11px] font-semibold mb-2 pb-1.5"
                style={{
                  color: c.text,
                  borderBottom: `1px solid ${c.border}`,
                }}
              >
                {raceName}
                {raceStatus && (
                  <span
                    className="font-body text-[9px] font-medium ml-2 px-1.5 py-0.5 rounded"
                    style={{
                      color:
                        raceStatus === 'Final'
                          ? c.muted
                          : raceStatus === 'In Progress'
                            ? c.green
                            : c.muted,
                      background:
                        raceStatus === 'In Progress'
                          ? `${c.green}20`
                          : `${c.muted}15`,
                    }}
                  >
                    {raceStatus === 'In Progress' ? 'LIVE' : raceStatus.toUpperCase()}
                  </span>
                )}
              </div>
            )}

            {results.length === 0 && (
              <div
                className="py-6 text-center font-body text-xs"
                style={{ color: c.muted }}
              >
                {raceStatus || 'No results available'}
              </div>
            )}

            {/* Driver results grid */}
            {results.length > 0 && (
              <div className="flex flex-col gap-0.5">
                {results.map((r) => {
                  const posColor = POSITION_COLORS[r.position];
                  const teamColor = TEAM_COLORS[r.team] || c.muted;
                  return (
                    <div
                      key={r.position}
                      className="flex items-center gap-2 rounded px-2 py-1"
                      style={{
                        background:
                          r.position <= 3 ? `${posColor}10` : 'transparent',
                      }}
                    >
                      {/* Position */}
                      <span
                        className="font-display text-[13px] w-5 text-right leading-none"
                        style={{
                          color: posColor || c.muted,
                          fontWeight: r.position <= 3 ? 700 : 500,
                        }}
                      >
                        {r.position}
                      </span>

                      {/* Team color bar */}
                      <div
                        className="w-0.5 h-4 rounded-full"
                        style={{ background: teamColor }}
                      />

                      {/* Driver name */}
                      <span
                        className="font-body text-[11px] flex-1 truncate"
                        style={{
                          color: r.position <= 3 ? c.text : c.muted,
                          fontWeight: r.position <= 3 ? 600 : 400,
                        }}
                      >
                        {r.driver}
                      </span>

                      {/* Points indicator for top 10 */}
                      {r.position <= 10 && (
                        <span
                          className="font-body text-[9px] font-medium"
                          style={{ color: c.muted }}
                        >
                          +
                          {r.position === 1
                            ? 25
                            : r.position === 2
                              ? 18
                              : r.position === 3
                                ? 15
                                : r.position === 4
                                  ? 12
                                  : r.position === 5
                                    ? 10
                                    : r.position === 6
                                      ? 8
                                      : r.position === 7
                                        ? 6
                                        : r.position === 8
                                          ? 4
                                          : r.position === 9
                                            ? 2
                                            : 1}
                          pts
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Standings view */}
        {!loading && !error && view === 'standings' && (
          <>
            {/* Driver/Constructor sub-tabs */}
            <div
              className="flex items-center gap-0 mb-3"
              style={{ borderBottom: `1px solid ${c.border}` }}
            >
              {(['drivers', 'constructors'] as const).map((tab) => {
                const active = standingsTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setStandingsTab(tab)}
                    className="font-body text-[11px] tracking-wider uppercase cursor-pointer whitespace-nowrap"
                    style={{
                      fontWeight: active ? 700 : 500,
                      padding: '6px 12px',
                      color: active ? '#E8002D' : c.muted,
                      background: 'transparent',
                      border: 'none',
                      borderBottom: active ? '2px solid #E8002D' : '2px solid transparent',
                      marginBottom: '-1px',
                    }}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* Standings list — grid so points column aligns vertically */}
            <div
              className="grid px-2"
              style={{
                gridTemplateColumns: standingsTab === 'constructors'
                  ? '16px 2px auto auto'
                  : '16px auto auto',
                rowGap: 0,
                columnGap: 6,
                width: 'fit-content',
              }}
            >
              {(standingsTab === 'drivers' ? drivers : constructors).map(
                (entry) => {
                  const posColor = POSITION_COLORS[entry.rank];
                  const teamColor =
                    standingsTab === 'constructors'
                      ? TEAM_COLORS[entry.name] || c.muted
                      : undefined;
                  const bg = entry.rank <= 3 ? `${posColor}10` : 'transparent';
                  return (
                    <div
                      key={entry.rank}
                      className="contents"
                    >
                      <span
                        className="font-display text-[12px] text-right leading-none py-[3px]"
                        style={{
                          color: posColor || c.muted,
                          fontWeight: entry.rank <= 3 ? 700 : 500,
                          background: bg,
                        }}
                      >
                        {entry.rank}
                      </span>

                      {standingsTab === 'constructors' && (
                        <div
                          className="py-[3px] flex items-center"
                          style={{ background: bg }}
                        >
                          <div
                            className="w-0.5 h-3 rounded-full"
                            style={{ background: teamColor }}
                          />
                        </div>
                      )}

                      <span
                        className="font-body text-[11px] py-[3px] whitespace-nowrap"
                        style={{
                          color: entry.rank <= 3 ? c.text : c.muted,
                          fontWeight: entry.rank <= 3 ? 600 : 400,
                          background: bg,
                        }}
                      >
                        {entry.name}
                      </span>

                      <span
                        className="font-body text-[10px] font-semibold tabular-nums text-right py-[3px]"
                        style={{
                          color: entry.rank <= 3 ? c.text : c.muted,
                          background: bg,
                        }}
                      >
                        {entry.points}
                      </span>
                    </div>
                  );
                }
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
