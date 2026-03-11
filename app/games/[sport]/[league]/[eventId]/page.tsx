'use client';

import { useState, useEffect, use } from 'react';
import { useTheme } from '../../../../components/ThemeProvider';

type Player = {
  name: string;
  shortName: string;
  position: string;
  starter: boolean;
  stats: string[];
  didNotPlay: boolean;
  reason: string;
};

type Team = {
  name: string;
  abbreviation: string;
  logo: string;
  score: string;
  homeAway: string;
  winner: boolean;
  linescores: string[];
  statLabels: string[];
  players: Player[];
  totals: string[];
};

type BoxScore = {
  gameInfo: {
    date: string;
    status: string;
    statusDetail: string;
    venue: string;
    attendance: number | null;
  };
  teams: Team[];
  source: string;
};

export default function BoxScorePage({
  params,
}: {
  params: Promise<{ sport: string; league: string; eventId: string }>;
}) {
  const { sport, league, eventId } = use(params);
  const { colors: c } = useTheme();
  const [data, setData] = useState<BoxScore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/boxscore?eventId=${eventId}&sport=${sport}&league=${league}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [eventId, sport, league]);

  const home = data?.teams?.find(t => t.homeAway === 'home');
  const away = data?.teams?.find(t => t.homeAway === 'away');
  const gameDate = data?.gameInfo?.date
    ? new Date(data.gameInfo.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    : '';

  // Period labels based on sport
  const periodLabel = sport === 'hockey' ? 'P' : sport === 'baseball' ? '' : 'Q';

  const thStyle: React.CSSProperties = {
    padding: '6px 8px',
    fontFamily: 'IBM Plex Mono, monospace',
    fontSize: 9,
    color: c.muted,
    letterSpacing: 1,
    textAlign: 'right' as const,
    whiteSpace: 'nowrap' as const,
  };

  const tdStyle: React.CSSProperties = {
    padding: '5px 8px',
    fontFamily: 'IBM Plex Mono, monospace',
    fontSize: 11,
    color: c.text,
    textAlign: 'right' as const,
    whiteSpace: 'nowrap' as const,
  };

  function renderTeamTable(team: Team, accent: string) {
    const starters = team.players.filter(p => p.starter && !p.didNotPlay);
    const bench = team.players.filter(p => !p.starter && !p.didNotPlay);
    const dnp = team.players.filter(p => p.didNotPlay);

    return (
      <div style={{
        background: c.surface,
        border: `1px solid ${c.border}`,
        borderLeft: `4px solid ${accent}`,
        borderRadius: 4,
        padding: 20,
        marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          {team.logo && (
            <img
              src={team.logo}
              alt={team.abbreviation}
              style={{ width: 32, height: 32 }}
            />
          )}
          <div>
            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 14, color: c.text, fontWeight: 600 }}>
              {team.name}
            </span>
            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 20, color: team.winner ? c.green : c.text, marginLeft: 12 }}>
              {team.score}
            </span>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${c.border}` }}>
                <th style={{ ...thStyle, textAlign: 'left', minWidth: 140 }}>PLAYER</th>
                {team.statLabels.map((l, i) => (
                  <th key={i} style={thStyle}>{l}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Starters */}
              {starters.length > 0 && (
                <tr>
                  <td colSpan={team.statLabels.length + 1} style={{
                    padding: '6px 8px 2px',
                    fontFamily: 'IBM Plex Mono, monospace',
                    fontSize: 9,
                    color: c.muted,
                    letterSpacing: 2,
                  }}>STARTERS</td>
                </tr>
              )}
              {starters.map((p, i) => (
                <tr key={`s-${i}`} style={{ borderBottom: `1px solid ${c.border}22` }}>
                  <td style={{ ...tdStyle, textAlign: 'left' }}>
                    <span style={{ color: c.text }}>{p.shortName || p.name}</span>
                    <span style={{ color: c.muted, fontSize: 9, marginLeft: 6 }}>{p.position}</span>
                  </td>
                  {p.stats.map((s, si) => (
                    <td key={si} style={tdStyle}>{s}</td>
                  ))}
                </tr>
              ))}

              {/* Bench */}
              {bench.length > 0 && (
                <tr>
                  <td colSpan={team.statLabels.length + 1} style={{
                    padding: '10px 8px 2px',
                    fontFamily: 'IBM Plex Mono, monospace',
                    fontSize: 9,
                    color: c.muted,
                    letterSpacing: 2,
                  }}>BENCH</td>
                </tr>
              )}
              {bench.map((p, i) => (
                <tr key={`b-${i}`} style={{ borderBottom: `1px solid ${c.border}22` }}>
                  <td style={{ ...tdStyle, textAlign: 'left' }}>
                    <span style={{ color: c.text }}>{p.shortName || p.name}</span>
                    <span style={{ color: c.muted, fontSize: 9, marginLeft: 6 }}>{p.position}</span>
                  </td>
                  {p.stats.map((s, si) => (
                    <td key={si} style={tdStyle}>{s}</td>
                  ))}
                </tr>
              ))}

              {/* Totals */}
              {team.totals.length > 0 && (
                <tr style={{ borderTop: `2px solid ${c.border}` }}>
                  <td style={{ ...tdStyle, textAlign: 'left', fontWeight: 700, color: c.green }}>TEAM</td>
                  {team.totals.map((t, i) => (
                    <td key={i} style={{ ...tdStyle, fontWeight: 600 }}>{t}</td>
                  ))}
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* DNP */}
        {dnp.length > 0 && (
          <div style={{ marginTop: 10, fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: c.muted }}>
            <span style={{ letterSpacing: 2 }}>DNP: </span>
            {dnp.map(p => `${p.shortName || p.name}${p.reason ? ` (${p.reason})` : ''}`).join(', ')}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: c.bg, color: c.text }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '28px 20px' }}>
        {loading ? (
          <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 13, color: c.muted, textAlign: 'center', padding: 60 }}>
            Loading box score...
          </div>
        ) : !data || !home || !away ? (
          <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 13, color: c.muted, textAlign: 'center', padding: 60 }}>
            Box score not available.
          </div>
        ) : (
          <>
            {/* ── Game Header ──────────────────────────────── */}
            <div style={{
              background: c.surface,
              border: `1px solid ${c.border}`,
              borderRadius: 4,
              padding: '24px 28px',
              marginBottom: 20,
              textAlign: 'center',
            }}>
              {/* Teams + Score */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, marginBottom: 16 }}>
                {/* Away */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {away.logo && <img src={away.logo} alt={away.abbreviation} style={{ width: 48, height: 48 }} />}
                  <div>
                    <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: c.muted }}>{away.abbreviation}</div>
                    <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 40, color: away.winner ? c.green : c.text, lineHeight: 1 }}>
                      {away.score}
                    </div>
                  </div>
                </div>

                <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: c.muted }}>
                  {data.gameInfo.status === 'STATUS_FINAL' ? 'FINAL' : data.gameInfo.statusDetail || 'LIVE'}
                </div>

                {/* Home */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div>
                    <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: c.muted }}>{home.abbreviation}</div>
                    <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 40, color: home.winner ? c.green : c.text, lineHeight: 1 }}>
                      {home.score}
                    </div>
                  </div>
                  {home.logo && <img src={home.logo} alt={home.abbreviation} style={{ width: 48, height: 48 }} />}
                </div>
              </div>

              {/* Line Score */}
              {(home.linescores.length > 0 || away.linescores.length > 0) && (
                <table style={{ margin: '0 auto', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ ...thStyle, textAlign: 'left', minWidth: 60 }}>TEAM</th>
                      {home.linescores.map((_, i) => (
                        <th key={i} style={{ ...thStyle, minWidth: 36 }}>{periodLabel}{i + 1}</th>
                      ))}
                      <th style={{ ...thStyle, minWidth: 36, color: c.green }}>T</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: `1px solid ${c.border}` }}>
                      <td style={{ ...tdStyle, textAlign: 'left', fontWeight: 600 }}>{away.abbreviation}</td>
                      {away.linescores.map((s, i) => <td key={i} style={tdStyle}>{s}</td>)}
                      <td style={{ ...tdStyle, fontWeight: 700, color: away.winner ? c.green : c.text }}>{away.score}</td>
                    </tr>
                    <tr>
                      <td style={{ ...tdStyle, textAlign: 'left', fontWeight: 600 }}>{home.abbreviation}</td>
                      {home.linescores.map((s, i) => <td key={i} style={tdStyle}>{s}</td>)}
                      <td style={{ ...tdStyle, fontWeight: 700, color: home.winner ? c.green : c.text }}>{home.score}</td>
                    </tr>
                  </tbody>
                </table>
              )}

              {/* Venue + Date */}
              <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: c.muted, marginTop: 12 }}>
                {gameDate}{data.gameInfo.venue ? ` · ${data.gameInfo.venue}` : ''}
                {data.gameInfo.attendance ? ` · ${data.gameInfo.attendance.toLocaleString()} fans` : ''}
              </div>
            </div>

            {/* ── Team Box Scores ────────────────────────── */}
            {renderTeamTable(away, away.winner ? c.green : c.muted)}
            {renderTeamTable(home, home.winner ? c.green : c.muted)}
          </>
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
