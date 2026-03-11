'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '../ThemeProvider';

type F1View = 'schedule' | 'standings';

interface F1Result {
  position: number;
  driver: string;
  team: string;
  winner: boolean;
}

interface ScheduleRace {
  id: string;
  name: string;
  shortName: string;
  date: string;
  status: string;
  winner: string | null;
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

// F1 points system
const POINTS: Record<number, number> = {
  1: 25, 2: 18, 3: 15, 4: 12, 5: 10, 6: 8, 7: 6, 8: 4, 9: 2, 10: 1,
};

function formatRaceDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

export default function F1Results() {
  const { colors: c } = useTheme();
  const [view, setView] = useState<F1View>('schedule');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Schedule data
  const [races, setRaces] = useState<ScheduleRace[]>([]);

  // Race detail data
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [raceDetail, setRaceDetail] = useState<{
    raceName: string;
    results: F1Result[];
    status: string;
  } | null>(null);
  const [raceLoading, setRaceLoading] = useState(false);

  // Standings data
  const [drivers, setDrivers] = useState<StandingEntry[]>([]);
  const [constructors, setConstructors] = useState<StandingEntry[]>([]);
  const [standingsTab, setStandingsTab] = useState<'drivers' | 'constructors'>(
    'drivers'
  );

  // Load schedule or standings
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError(false);
      try {
        const endpoint = view === 'standings' ? '/api/f1?view=standings' : '/api/f1?view=schedule';
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();

        if (cancelled) return;

        if (view === 'standings') {
          setDrivers(data.drivers || []);
          setConstructors(data.constructors || []);
        } else {
          setRaces(data.races || []);
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

  // Load race detail when an event is selected
  useEffect(() => {
    if (!selectedEventId) {
      setRaceDetail(null);
      return;
    }

    let cancelled = false;

    async function loadRace() {
      setRaceLoading(true);
      try {
        const res = await fetch(`/api/f1?view=race&eventId=${selectedEventId}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        if (!cancelled) {
          setRaceDetail({
            raceName: data.raceName || '',
            results: data.results || [],
            status: data.status || '',
          });
        }
      } catch {
        if (!cancelled) {
          setRaceDetail({ raceName: '', results: [], status: 'Failed to load' });
        }
      } finally {
        if (!cancelled) setRaceLoading(false);
      }
    }

    loadRace();
    return () => {
      cancelled = true;
    };
  }, [selectedEventId]);

  const views: { key: F1View; label: string }[] = [
    { key: 'schedule', label: 'SCHEDULE' },
    { key: 'standings', label: 'WDC' },
  ];

  // If viewing a race detail, show that instead
  if (selectedEventId) {
    return (
      <div>
        {/* Back button */}
        <div style={{ padding: '0 22px' }}>
          <button
            onClick={() => setSelectedEventId(null)}
            className="font-body text-[11px] cursor-pointer mb-2"
            style={{
              color: c.muted,
              background: 'transparent',
              border: 'none',
              padding: '2px 0',
            }}
          >
            ← Schedule
          </button>
        </div>

        <div style={{ padding: '0 22px 22px' }}>
          {raceLoading && (
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

          {!raceLoading && raceDetail && (
            <>
              {/* Race name header */}
              <div
                className="font-body text-[11px] font-semibold mb-2 pb-1.5"
                style={{
                  color: c.text,
                  borderBottom: `1px solid ${c.border}`,
                }}
              >
                {raceDetail.raceName}
                {raceDetail.status && raceDetail.status !== 'Scheduled' && (
                  <span
                    className="font-body text-[9px] font-medium ml-2 px-1.5 py-0.5 rounded"
                    style={{
                      color:
                        raceDetail.status === 'In Progress'
                          ? c.green
                          : c.muted,
                      background:
                        raceDetail.status === 'In Progress'
                          ? `${c.green}20`
                          : `${c.muted}15`,
                    }}
                  >
                    {raceDetail.status === 'In Progress' ? 'LIVE' : raceDetail.status.toUpperCase()}
                  </span>
                )}
              </div>

              {raceDetail.results.length === 0 && (
                <div
                  className="py-6 text-center font-body text-xs"
                  style={{ color: c.muted }}
                >
                  {raceDetail.status === 'Scheduled' ? 'Race has not started yet' : 'No results available'}
                </div>
              )}

              {/* Driver results grid */}
              {raceDetail.results.length > 0 && (
                <div className="flex flex-col gap-0.5">
                  {raceDetail.results.map((r) => {
                    const posColor = POSITION_COLORS[r.position];
                    const teamColor = TEAM_COLORS[r.team] || c.muted;
                    return (
                      <div
                        key={r.position}
                        className="flex items-center gap-2 px-3 py-1.5"
                        style={{
                          borderRadius: 8,
                          background:
                            r.position <= 3 ? `${posColor}10` : 'transparent',
                        }}
                      >
                        <span
                          className="font-display text-[13px] w-5 text-right leading-none"
                          style={{
                            color: posColor || c.muted,
                            fontWeight: r.position <= 3 ? 700 : 500,
                          }}
                        >
                          {r.position}
                        </span>
                        <div
                          className="w-0.5 h-4 rounded-full"
                          style={{ background: teamColor }}
                        />
                        <span
                          className="font-body text-[11px] flex-1 truncate"
                          style={{
                            color: r.position <= 3 ? c.text : c.muted,
                            fontWeight: r.position <= 3 ? 600 : 400,
                          }}
                        >
                          {r.driver}
                        </span>
                        {r.position <= 10 && (
                          <span
                            className="font-body text-[9px] font-medium"
                            style={{ color: c.muted }}
                          >
                            +{POINTS[r.position]}pts
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* F1 view tabs */}
      <div
        className="flex items-center gap-1 px-5 overflow-x-auto pb-2"
      >
        {views.map((v) => {
          const active = view === v.key;
          return (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              className="font-body text-[10px] tracking-wider uppercase cursor-pointer whitespace-nowrap shrink-0"
              style={{
                fontWeight: active ? 600 : 500,
                padding: '4px 10px',
                borderRadius: 6,
                color: active ? '#E8002D' : c.muted,
                background: active ? '#E8002D12' : 'transparent',
                border: 'none',
              }}
            >
              {v.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div style={{ padding: '0 22px 22px' }}>
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

        {/* Schedule view */}
        {!loading && !error && view === 'schedule' && (
          <div className="flex flex-col">
            {races.map((race, i) => {
              const isCompleted = race.status === 'Final';
              const isLive = race.status === 'In Progress';
              const isScheduled = !isCompleted && !isLive;

              // Find if this is the next upcoming race
              const isNext = isScheduled && (i === 0 || races[i - 1]?.status === 'Final' || races[i - 1]?.status === 'In Progress');

              return (
                <button
                  key={race.id}
                  onClick={() => {
                    if (isCompleted || isLive) {
                      setSelectedEventId(race.id);
                    }
                  }}
                  className="flex items-center gap-2 text-left w-full"
                  style={{
                    padding: '7px 8px',
                    borderRadius: 8,
                    background: isNext ? `${c.cyan}08` : 'transparent',
                    borderBottom: `1px solid ${c.border}`,
                    cursor: isCompleted || isLive ? 'pointer' : 'default',
                    border: 'none',
                    borderBottomWidth: 1,
                    borderBottomStyle: 'solid',
                    borderBottomColor: c.border,
                  }}
                >
                  {/* Round number */}
                  <span
                    className="font-display text-[11px] w-4 text-right shrink-0"
                    style={{
                      color: isCompleted ? c.muted : isNext ? c.cyan : c.muted,
                      fontWeight: isNext ? 700 : 500,
                      opacity: isScheduled && !isNext ? 0.5 : 1,
                    }}
                  >
                    {i + 1}
                  </span>

                  {/* Race name */}
                  <span
                    className="font-body text-[11px] flex-1 truncate"
                    style={{
                      color: isCompleted || isLive ? c.text : c.muted,
                      fontWeight: isNext ? 600 : 400,
                    }}
                  >
                    {race.shortName}
                  </span>

                  {/* Date */}
                  <span
                    className="font-body text-[9px] shrink-0"
                    style={{ color: c.muted }}
                  >
                    {formatRaceDate(race.date)}
                  </span>

                  {/* Status or winner */}
                  {isLive && (
                    <span
                      className="font-body text-[9px] font-semibold px-1.5 py-0.5 rounded shrink-0"
                      style={{
                        color: c.green,
                        background: `${c.green}18`,
                      }}
                    >
                      LIVE
                    </span>
                  )}
                  {isCompleted && race.winner && (
                    <span
                      className="font-body text-[9px] shrink-0 truncate"
                      style={{
                        color: c.muted,
                        maxWidth: 80,
                      }}
                    >
                      {race.winner.split(' ').pop()}
                    </span>
                  )}
                  {isScheduled && !isNext && (
                    <span
                      className="font-body text-[9px] shrink-0"
                      style={{ color: c.muted, opacity: 0.5 }}
                    >
                      —
                    </span>
                  )}
                  {isNext && (
                    <span
                      className="font-body text-[9px] font-semibold px-1.5 py-0.5 rounded shrink-0"
                      style={{
                        color: c.cyan,
                        background: `${c.cyan}18`,
                      }}
                    >
                      NEXT
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Standings view */}
        {!loading && !error && view === 'standings' && (
          <>
            {/* Driver/Constructor sub-tabs */}
            <div
              className="flex items-center gap-1 mb-3"
            >
              {(['drivers', 'constructors'] as const).map((tab) => {
                const active = standingsTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setStandingsTab(tab)}
                    className="font-body text-[10px] tracking-wider uppercase cursor-pointer whitespace-nowrap"
                    style={{
                      fontWeight: active ? 600 : 500,
                      padding: '4px 10px',
                      borderRadius: 6,
                      color: active ? '#E8002D' : c.muted,
                      background: active ? '#E8002D12' : 'transparent',
                      border: 'none',
                    }}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* Standings list */}
            <div
              className="grid px-2"
              style={{
                gridTemplateColumns: standingsTab === 'constructors'
                  ? '16px 2px max-content 32px'
                  : '16px max-content 32px',
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
