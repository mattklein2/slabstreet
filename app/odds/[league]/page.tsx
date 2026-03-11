'use client';

import { useState, useEffect, use } from 'react';
import { useTheme } from '../../components/ThemeProvider';

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

const LEAGUES = ['NBA', 'WNBA', 'NFL', 'MLB', 'NHL'] as const;

export default function OddsDashboard({
  params,
}: {
  params: Promise<{ league: string }>;
}) {
  const { league: rawLeague } = use(params);
  const league = rawLeague.toUpperCase();
  const { colors: c } = useTheme();
  const [games, setGames] = useState<GameOdds[]>([]);
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
    setLoading(true);
    fetch(`/api/odds/games?league=${league}`)
      .then(r => r.json())
      .then(d => { setGames(d.games || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [league]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  // Group games by date
  const grouped: Record<string, GameOdds[]> = {};
  for (const g of games) {
    const key = formatDate(g.commence_time);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(g);
  }

  const thStyle: React.CSSProperties = {
    padding: isMobile ? '4px 6px' : '6px 10px',
    fontFamily: 'IBM Plex Mono, monospace',
    fontSize: isMobile ? 8 : 9,
    color: c.muted,
    letterSpacing: 1,
    textAlign: 'center',
    whiteSpace: 'nowrap',
  };

  const tdStyle: React.CSSProperties = {
    padding: isMobile ? '4px 6px' : '5px 10px',
    fontFamily: 'IBM Plex Mono, monospace',
    fontSize: isMobile ? 11 : 12,
    color: c.text,
    textAlign: 'center',
    whiteSpace: 'nowrap',
  };

  function renderGameCard(game: GameOdds) {
    // Take first 4 bookmakers to keep it compact
    const books = game.bookmakers.slice(0, 4);
    const gameTime = formatTime(game.commence_time);
    const isPast = new Date(game.commence_time) < new Date();

    return (
      <div key={game.id} style={{
        background: c.surface,
        border: `1px solid ${c.border}`,
        borderLeft: `4px solid ${c.green}`,
        borderRadius: 4,
        padding: isMobile ? 14 : 20,
        marginBottom: 16,
      }}>
        {/* Matchup header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: isMobile ? 13 : 15, color: c.text, fontWeight: 600 }}>
              {game.away_team}
            </div>
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: c.muted, margin: '2px 0' }}>@</div>
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: isMobile ? 13 : 15, color: c.text, fontWeight: 600 }}>
              {game.home_team}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontFamily: 'IBM Plex Mono, monospace', fontSize: 10,
              color: isPast ? c.muted : c.green, letterSpacing: 1,
            }}>
              {isPast ? 'STARTED' : gameTime}
            </div>
          </div>
        </div>

        {/* Odds table */}
        {books.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: isMobile ? 360 : 500 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${c.border}` }}>
                  <th style={{ ...thStyle, textAlign: 'left', minWidth: isMobile ? 70 : 100 }}>BOOK</th>
                  <th style={thStyle}>ML HOME</th>
                  <th style={thStyle}>ML AWAY</th>
                  <th style={thStyle}>SPREAD</th>
                  <th style={thStyle}>O/U</th>
                </tr>
              </thead>
              <tbody>
                {books.map((bk, i) => {
                  // Determine favorite by h2h
                  const homeNum = bk.h2h ? parseInt(bk.h2h.home) : 0;
                  const awayNum = bk.h2h ? parseInt(bk.h2h.away) : 0;
                  const homeFav = homeNum < awayNum;

                  return (
                    <tr key={i} style={{ borderBottom: `1px solid ${c.border}22` }}>
                      <td style={{ ...tdStyle, textAlign: 'left', fontSize: isMobile ? 9 : 10, color: c.muted }}>
                        {bk.title}
                      </td>
                      <td style={{ ...tdStyle, color: bk.h2h && homeFav ? c.green : c.text }}>
                        {bk.h2h?.home || '-'}
                      </td>
                      <td style={{ ...tdStyle, color: bk.h2h && !homeFav ? c.green : c.text }}>
                        {bk.h2h?.away || '-'}
                      </td>
                      <td style={tdStyle}>
                        {bk.spreads ? (
                          <span>
                            <span style={{ color: c.amber }}>{bk.spreads.home_point}</span>
                            <span style={{ color: c.muted, fontSize: 9, marginLeft: 4 }}>({bk.spreads.home})</span>
                          </span>
                        ) : '-'}
                      </td>
                      <td style={tdStyle}>
                        {bk.totals ? (
                          <span>
                            <span style={{ color: c.amber }}>O {bk.totals.over_point}</span>
                            <span style={{ color: c.muted, fontSize: 9, marginLeft: 4 }}>({bk.totals.over})</span>
                          </span>
                        ) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: c.bg, color: c.text }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: isMobile ? '20px 12px' : '28px 20px' }}>
        {/* Page header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{
            fontFamily: 'Bebas Neue, sans-serif', fontSize: isMobile ? 28 : 36,
            color: c.green, letterSpacing: 4, margin: 0,
          }}>
            ODDS BOARD
          </h1>
          <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: c.muted, marginTop: 4 }}>
            Live game odds · Moneyline · Spreads · Totals
          </div>
        </div>

        {/* League tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {LEAGUES.map(l => (
            <a
              key={l}
              href={`/odds/${l.toLowerCase()}`}
              style={{
                fontFamily: 'IBM Plex Mono, monospace',
                fontSize: 12,
                padding: '6px 16px',
                borderRadius: 3,
                textDecoration: 'none',
                letterSpacing: 2,
                background: l === league ? c.green : 'transparent',
                color: l === league ? c.bg : c.muted,
                border: `1px solid ${l === league ? c.green : c.border}`,
                fontWeight: l === league ? 700 : 400,
                transition: 'all 0.15s',
              }}
            >
              {l}
            </a>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 13, color: c.muted, textAlign: 'center', padding: 60 }}>
            Loading odds...
          </div>
        ) : games.length === 0 ? (
          <div style={{
            background: c.surface, border: `1px solid ${c.border}`, borderRadius: 4,
            padding: 40, textAlign: 'center',
          }}>
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 13, color: c.muted }}>
              No upcoming games found for {league}.
            </div>
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: c.muted, marginTop: 8 }}>
              Check back closer to game time or try another league.
            </div>
          </div>
        ) : (
          Object.entries(grouped).map(([dateStr, dateGames]) => (
            <div key={dateStr}>
              <div style={{
                fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: c.green,
                letterSpacing: 2, marginBottom: 10, marginTop: 8, padding: '4px 0',
                borderBottom: `1px solid ${c.border}`,
              }}>
                {dateStr.toUpperCase()}
              </div>
              {dateGames.map(g => renderGameCard(g))}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <footer style={{
        textAlign: 'center', padding: '40px 20px 24px',
        borderTop: `1px solid ${c.border}`, marginTop: 40,
      }}>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 20, color: c.green, letterSpacing: 4, marginBottom: 6 }}>
          SLABSTREET
        </div>
        <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: c.muted }}>
          &copy; {new Date().getFullYear()} Slab Street &middot; slabstreet.io &middot; All rights reserved
        </div>
      </footer>
    </div>
  );
}
