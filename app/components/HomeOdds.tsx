'use client';

import { useState, useEffect } from 'react';
import { useTheme } from './ThemeProvider';

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

const LEAGUES_TO_TRY = ['NBA', 'WNBA', 'NFL', 'MLB', 'NHL'];

export default function HomeOdds() {
  const { colors: c } = useTheme();
  const [games, setGames] = useState<GameOdds[]>([]);
  const [activeLeague, setActiveLeague] = useState('');
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    setIsMobile(mq.matches);
    function onChange(e: MediaQueryListEvent) { setIsMobile(e.matches); }
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    async function load() {
      // Try each league until we find one with upcoming games
      for (const league of LEAGUES_TO_TRY) {
        try {
          const res = await fetch(`/api/odds/games?league=${league}`);
          const data = await res.json();
          if (data.games && data.games.length > 0) {
            // Only show future games
            const now = new Date();
            const upcoming = data.games.filter(
              (g: GameOdds) => new Date(g.commence_time) > now
            );
            if (upcoming.length > 0) {
              setGames(upcoming.slice(0, 4));
              setActiveLeague(league);
              setLoading(false);
              return;
            }
          }
        } catch { /* try next league */ }
      }
      setLoading(false);
    }
    load();
  }, []);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    if (d.toDateString() === now.toDateString()) return `Today ${timeStr}`;
    if (d.toDateString() === tomorrow.toDateString()) return `Tomorrow ${timeStr}`;
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + ' ' + timeStr;
  };

  if (loading) {
    return (
      <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: c.muted, textAlign: 'center', padding: 40 }}>
        Loading odds...
      </div>
    );
  }

  if (games.length === 0) return null;

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 14, flexWrap: 'wrap', gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: c.green,
            letterSpacing: 2, fontWeight: 600,
          }}>LIVE ODDS</span>
          <span style={{
            fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, color: c.bg,
            background: c.green, padding: '2px 8px', borderRadius: 2, letterSpacing: 1,
          }}>{activeLeague}</span>
        </div>
        <a href={`/odds/${activeLeague.toLowerCase()}`} style={{
          fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: c.amber,
          textDecoration: 'none', letterSpacing: 1,
        }}>
          VIEW ALL {activeLeague} ODDS →
        </a>
      </div>

      {/* Game cards grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
        gap: 12,
      }}>
        {games.map(game => {
          const bk = game.bookmakers[0]; // Use first bookmaker (consensus)
          if (!bk) return null;

          const homeNum = bk.h2h ? parseInt(bk.h2h.home) : 0;
          const awayNum = bk.h2h ? parseInt(bk.h2h.away) : 0;
          const homeFav = homeNum < awayNum;

          return (
            <a
              key={game.id}
              href={`/odds/${activeLeague.toLowerCase()}`}
              style={{
                background: c.surface, border: `1px solid ${c.border}`,
                borderLeft: `3px solid ${c.green}`, borderRadius: 4,
                padding: isMobile ? '12px 14px' : '14px 16px',
                textDecoration: 'none', transition: 'border-color 0.15s',
                display: 'block',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = c.green)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = c.border)}
            >
              {/* Time */}
              <div style={{
                fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, color: c.green,
                letterSpacing: 1, marginBottom: 8,
              }}>
                {formatTime(game.commence_time)} · {bk.title}
              </div>

              {/* Teams + moneyline */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {/* Away team */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    fontFamily: 'IBM Plex Mono, monospace', fontSize: isMobile ? 11 : 12,
                    color: c.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    flex: 1, minWidth: 0,
                  }}>{game.away_team}</span>
                  <span style={{
                    fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, fontWeight: 600,
                    color: bk.h2h && !homeFav ? c.green : c.text, flexShrink: 0, marginLeft: 8,
                  }}>{bk.h2h?.away || '-'}</span>
                </div>

                {/* Home team */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    fontFamily: 'IBM Plex Mono, monospace', fontSize: isMobile ? 11 : 12,
                    color: c.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    flex: 1, minWidth: 0,
                  }}>{game.home_team}</span>
                  <span style={{
                    fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, fontWeight: 600,
                    color: bk.h2h && homeFav ? c.green : c.text, flexShrink: 0, marginLeft: 8,
                  }}>{bk.h2h?.home || '-'}</span>
                </div>
              </div>

              {/* Spread + O/U row */}
              {(bk.spreads || bk.totals) && (
                <div style={{
                  display: 'flex', gap: 12, marginTop: 8, paddingTop: 8,
                  borderTop: `1px solid ${c.border}33`,
                }}>
                  {bk.spreads && (
                    <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: c.muted }}>
                      SPR <span style={{ color: c.amber }}>{bk.spreads.home_point}</span>
                    </span>
                  )}
                  {bk.totals && (
                    <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: c.muted }}>
                      O/U <span style={{ color: c.amber }}>{bk.totals.over_point}</span>
                    </span>
                  )}
                </div>
              )}
            </a>
          );
        })}
      </div>
    </div>
  );
}
