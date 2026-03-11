'use client';

import { useState, useEffect, use } from 'react';
import { useTheme } from '../../components/ThemeProvider';
import NavSearch from '../../components/NavSearch';
import { supabase } from '../../../lib/supabase';
import { getLeagueConfig } from '../../../lib/leagues';

// ─── CHART ────────────────────────────────────────────────────
function ScoreChart({ data, lineColor }: { data: { labels: string[]; scores: number[] }; lineColor: string }) {
  if (!data || !data.scores || data.scores.length < 2) {
    return <div style={{ padding: '20px 0', textAlign: 'center', fontSize: 11, color: '#8899aa', fontFamily: 'IBM Plex Mono, monospace' }}>No score history available</div>;
  }
  const w = 600, h = 160;
  const pad = { top: 16, right: 16, bottom: 32, left: 36 };
  const innerW = w - pad.left - pad.right;
  const innerH = h - pad.top - pad.bottom;
  const min = Math.min(...data.scores) - 8;
  const max = Math.max(...data.scores) + 8;
  const xStep = innerW / (data.scores.length - 1);
  const yScale = (v: number) => innerH - ((v - min) / (max - min)) * innerH;
  const points = data.scores.map((s, i) => `${pad.left + i * xStep},${pad.top + yScale(s)}`).join(' ');
  const areaPoints = `${pad.left},${pad.top + innerH} ${points} ${pad.left + (data.scores.length - 1) * xStep},${pad.top + innerH}`;
  const labelStep = Math.ceil(data.labels.length / 5);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lineColor} stopOpacity="0.18" />
          <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, .25, .5, .75, 1].map(t => {
        const y = pad.top + t * innerH;
        return (
          <g key={t}>
            <line x1={pad.left} y1={y} x2={w - pad.right} y2={y} stroke="#1e2530" strokeWidth="1" />
            <text x={pad.left - 6} y={y + 4} fill="#8899aa" fontSize="9" textAnchor="end" fontFamily="IBM Plex Mono">{Math.round(max - t * (max - min))}</text>
          </g>
        );
      })}
      <polygon points={areaPoints} fill="url(#cg)" />
      <polyline points={points} fill="none" stroke={lineColor} strokeWidth="2" strokeLinejoin="round" />
      {data.scores.map((s, i) => <circle key={i} cx={pad.left + i * xStep} cy={pad.top + yScale(s)} r="3" fill={lineColor} />)}
      {data.labels.map((l, i) => {
        if (i % labelStep !== 0 && i !== data.labels.length - 1) return null;
        return <text key={i} x={pad.left + i * xStep} y={h - 6} fill="#8899aa" fontSize="9" textAnchor="middle" fontFamily="IBM Plex Mono">{l}</text>;
      })}
    </svg>
  );
}

const tierBorder: Record<string, string> = { COMMON: '#8899aa', MID: '#38bdf8', RARE: '#f59e0b' };

// ─── PAGE ─────────────────────────────────────────────────────
export default function PlayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { theme, toggle, colors: c } = useTheme();

  const [p, setP]                   = useState<any>(null);
  const [loading, setLoading]       = useState(true);
  const [period, setPeriod]         = useState('weekly');
  const [odds, setOdds]             = useState<any[] | null>(null);
  const [oddsLive, setOddsLive]     = useState(false);
  const [momentum, setMomentum]     = useState<any>(null);
  const [momentumLive, setMomentumLive] = useState(false);
  const [news, setNews]             = useState<any[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [liveStats, setLiveStats]   = useState<any[] | null>(null);
  const [statsLive, setStatsLive]   = useState(false);
  const [psaData, setPsaData]       = useState<any>(null);
  const [ebayListings, setEbayListings] = useState<any>(null);
  const [ebayLoading, setEbayLoading] = useState(true);
  const [ebaySort, setEbaySort] = useState('newlyListed');
  const [ebayExpanded, setEbayExpanded] = useState(false);
  const [espnId, setEspnId]           = useState<string | null>(null);
  const [gameLog, setGameLog]         = useState<any[]>([]);
  const [gameLogLabels, setGameLogLabels] = useState<string[]>([]);
  const [gameLogSport, setGameLogSport] = useState('');
  const [gameLogLeague, setGameLogLeague] = useState('');
  const [isWide, setIsWide]           = useState(false);

  const signalColor: Record<string, string>  = { BUY: c.green, HOLD: c.amber, SELL: c.red };
  const xSignalColor: Record<string, string> = { rising: c.green, falling: c.red, stable: c.amber };

  // Fetch player from Supabase
  useEffect(() => {
    setLoading(true);
    supabase
      .from('players')
      .select('*')
      .eq('slug', slug)
      .single()
      .then(({ data, error }) => {
        if (data && !error) {
          // Map snake_case DB columns → camelCase used in render
          setP({
            ...data,
            firstName:      data.first_name,
            lastName:       data.last_name,
            lastNameSearch: data.last_name_search,
            fullName:       data.full_name,
            scoreHistory:   data.score_history,
            fallbackOdds:   data.fallback_odds,
          });
        }
        setLoading(false);
      });
  }, [slug]);

  const playerLeague = p?.league ?? p?.sport ?? 'NBA';
  const leagueConfig = p ? getLeagueConfig(playerLeague) : null;

  // Fetch live odds
  useEffect(() => {
    if (!p) return;
    fetch(`/api/odds?player=${p.lastNameSearch}&league=${playerLeague}&team=${p.team}`)
      .then(r => r.json())
      .then(data => {
        if (data.odds?.length > 0) { setOdds(data.odds); setOddsLive(true); }
        else setOdds(p.fallbackOdds);
      })
      .catch(() => setOdds(p.fallbackOdds));
  }, [p]);

  // Fetch live momentum
  useEffect(() => {
    if (!p) return;
    fetch(`/api/momentum?player=${encodeURIComponent(p.fullName)}&slug=${slug}&league=${playerLeague}`)
      .then(r => r.json())
      .then(data => {
        setMomentum(data);
        setMomentumLive(!data.tier_required);
      })
      .catch(() => setMomentum(null));
  }, [p]);

  // Fetch live news
  useEffect(() => {
    if (!p) return;
    fetch(`/api/news?player=${encodeURIComponent(p.fullName)}&league=${playerLeague}`)
      .then(r => r.json())
      .then(data => {
        setNews(data.news ?? []);
        setNewsLoading(false);
      })
      .catch(() => {
        setNews((p.news ?? []).map((n: any) => ({ headline: n.headline, source: n.source, time: n.time, sentiment: 'neutral', url: '#' })));
        setNewsLoading(false);
      });
  }, [p]);

  // Fetch live stats + capture ESPN ID
  useEffect(() => {
    if (!p) return;
    fetch(`/api/stats?player=${encodeURIComponent(p.fullName)}&league=${playerLeague}&team=${p.team}`)
      .then(r => r.json())
      .then(data => {
        if (data.stats?.length > 0) { setLiveStats(data.stats); setStatsLive(true); }
        if (data.espn_id) setEspnId(data.espn_id);
      })
      .catch(() => {});
  }, [p]);

  // Fetch game log once we have ESPN ID
  useEffect(() => {
    if (!espnId || !p || playerLeague === 'F1') return;
    fetch(`/api/gamelog?espnId=${espnId}&league=${playerLeague}`)
      .then(r => r.json())
      .then(data => {
        setGameLog(data.games ?? []);
        setGameLogLabels(data.labels ?? []);
        setGameLogSport(data.sport ?? '');
        setGameLogLeague(data.league ?? '');
      })
      .catch(() => {});
  }, [espnId, p, playerLeague]);

  // Responsive breakpoint for two-column layout
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 960px)');
    setIsWide(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsWide(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Fetch PSA population data
  useEffect(() => {
    if (!p) return;
    fetch(`/api/psa?subject=${encodeURIComponent(p.fullName)}`)
      .then(r => r.json())
      .then(data => { if (data.population) setPsaData(data.population); })
      .catch(() => {});
  }, [p]);

  // Fetch eBay listings
  useEffect(() => {
    if (!p) return;
    setEbayLoading(true);
    fetch(`/api/ebay?player=${encodeURIComponent(p.fullName)}&league=${playerLeague}&sort=${ebaySort}&limit=30`)
      .then(r => r.json())
      .then(data => { setEbayListings(data); setEbayLoading(false); })
      .catch(() => setEbayLoading(false));
  }, [p, ebaySort, playerLeague]);

  // Merge live momentum score into pillars
  const pillars = p?.pillars?.map((pl: any) => {
    if (pl.key === 'momentum' && momentum && !momentum.tier_required) {
      return { ...pl, score: momentum.momentum_score, live: true };
    }
    return pl;
  });

  const displayOdds = odds ?? p?.fallbackOdds ?? [];

  // ── Loading state
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'IBM Plex Mono, monospace', color: c.muted, background: c.bg }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 48, color: c.green, letterSpacing: 4 }}>SLABSTREET</div>
          <div style={{ fontSize: 12, marginTop: 12, letterSpacing: 2 }}>LOADING PLAYER DATA...</div>
        </div>
      </div>
    );
  }

  // ── 404
  if (!p) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'IBM Plex Mono, monospace', color: c.muted }}>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 64, color: c.border }}>404</div>
        <div style={{ marginBottom: 24 }}>Player not found.</div>
        <a href="/" style={{ color: c.green, textDecoration: 'none', fontSize: 12 }}>← Back to SlabStreet</a>
      </div>
    );
  }

  return (
    <div style={{ color: c.text, fontFamily: 'IBM Plex Sans, sans-serif' }}>

      {/* NAV */}
      <nav style={{ borderBottom: `1px solid ${c.border}`, padding: '0 24px', height: 58, display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', position: 'sticky', top: 0, background: c.navBg, zIndex: 100, boxShadow: theme === 'light' ? '0 1px 8px rgba(0,0,0,0.06)' : 'none', gap: 16 }}>
        <a href="/" style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, letterSpacing: 3, color: c.green, textDecoration: 'none' }}>SLABSTREET</a>
        <NavSearch />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'flex-end' }}>
          <button onClick={toggle} style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 20, width: 44, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0 3px', transition: 'all 0.2s', flexShrink: 0 }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: c.green, transform: theme === 'dark' ? 'translateX(0)' : 'translateX(20px)', transition: 'transform 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>
              {theme === 'dark' ? '🌙' : '☀️'}
            </div>
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: gameLog.length > 0 && isWide ? 1200 : 900, margin: '0 auto', padding: '32px 20px', transition: 'max-width 0.3s' }}>

        {/* PLAYER HEADER */}
        <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderTop: `3px solid ${c.green}`, borderRadius: 4, padding: '24px 28px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: c.muted, letterSpacing: 2, marginBottom: 8 }}>{p.team} · {p.position} · #{p.number}</div>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 56, lineHeight: 1, letterSpacing: 2, color: c.text }}>{p.firstName}</div>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 56, lineHeight: 1, letterSpacing: 2, color: c.green }}>{p.lastName}</div>
          </div>
          <div style={{ fontFamily: 'IBM Plex Mono, monospace', border: `1px solid ${c.border}`, borderRadius: 3, overflow: 'hidden', alignSelf: 'center', minWidth: 220 }}>
            <div style={{ background: c.border, padding: '5px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 9, letterSpacing: 2, color: c.muted, textTransform: 'uppercase' }}>{leagueConfig?.seasonLabel ?? '2024\u201325 Season Stats'}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {statsLive && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: c.green }}><span style={{ width: 5, height: 5, borderRadius: '50%', background: c.green, display: 'inline-block' }}></span>LIVE</span>}
                <span style={{ fontSize: 9, color: c.green, letterSpacing: 1 }}>{playerLeague}</span>
              </span>
            </div>
            {(() => {
              const displayStats = (statsLive && liveStats?.length) ? liveStats : p.stats;
              const cols = Math.min(3, displayStats?.length || 3);
              const rows: any[][] = [];
              for (let i = 0; i < (displayStats?.length || 0); i += cols) rows.push(displayStats.slice(i, i + cols));
              return rows.map((row: any[], ri: number) => (
                <div key={ri} style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, borderBottom: ri < rows.length - 1 ? `1px solid ${c.border}` : 'none', background: c.surface }}>
                  {row.map((s: any, i: number) => (
                    <div key={i} style={{ padding: '8px 12px', borderRight: i < row.length - 1 ? `1px solid ${c.border}` : 'none', textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: c.text, lineHeight: 1 }}>{s.val}</div>
                      <div style={{ fontSize: 8, color: c.muted, letterSpacing: 1, marginTop: 3 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              ));
            })()}
          </div>
        </div>

        {/* SLAB SCORE */}
        <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderLeft: `4px solid ${c.green}`, borderRadius: 4, padding: '20px 28px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: c.muted, letterSpacing: 3, marginBottom: 6 }}>SLAB SCORE™</div>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 96, lineHeight: 1, color: c.green, textShadow: `0 0 40px ${c.green}40` }}>{p.score}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: signalColor[p.signal], boxShadow: `0 0 8px ${signalColor[p.signal]}`, display: 'inline-block' }}></span>
              <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, color: signalColor[p.signal], letterSpacing: 3 }}>{p.signal}</span>
            </div>
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: c.muted }}>SIGNAL THRESHOLD: 70+ BUY</div>
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: c.muted }}>UPDATED: {new Date(p.updated_at ?? Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}</div>
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={{ height: 6, borderRadius: 3, background: 'linear-gradient(to right, #ff3b5c 0%, #f59e0b 40%, #00ff87 70%)', marginBottom: 4, position: 'relative' }}>
              <div style={{ position: 'absolute', left: `${p.score}%`, top: -4, width: 2, height: 14, background: c.text, borderRadius: 1 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, color: c.muted }}>
              <span>SELL 0</span><span>HOLD 40</span><span>BUY 70</span><span>100</span>
            </div>
          </div>
        </div>

        {/* SCORE HISTORY */}
        <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 4, padding: '20px 28px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: c.green, letterSpacing: 3, borderBottom: `1px solid ${c.green}`, paddingBottom: 4 }}>SLAB SCORE HISTORY</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {['daily', 'weekly', 'monthly', 'yearly'].map(per => (
                <button key={per} onClick={() => setPeriod(per)} style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, letterSpacing: 1, padding: '4px 10px', background: period === per ? c.green : 'transparent', color: period === per ? '#090b0f' : c.muted, border: `1px solid ${period === per ? c.green : c.border}`, borderRadius: 2, cursor: 'pointer', textTransform: 'uppercase' }}>{per}</button>
              ))}
            </div>
          </div>
          <ScoreChart data={p.scoreHistory[period]} lineColor={c.green} />
        </div>

        {/* TWO-COLUMN ZONE: Game Log (left) + Score Breakdown & Momentum (right) */}
        <div style={{
          display: gameLog.length > 0 && isWide ? 'grid' : 'block',
          gridTemplateColumns: '340px 1fr',
          gap: 20,
          marginBottom: gameLog.length > 0 && isWide ? 0 : undefined,
        }}>

          {/* RECENT GAMES (left column) */}
          {gameLog.length > 0 && (
            <div style={{
              background: c.surface,
              border: `1px solid ${c.border}`,
              borderLeft: `4px solid ${c.cyan}`,
              borderRadius: 4,
              padding: '20px 16px',
              marginBottom: isWide ? 0 : 20,
              alignSelf: 'start',
              position: isWide ? 'sticky' : undefined,
              top: isWide ? 78 : undefined,
            }}>
              <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: c.cyan, letterSpacing: 3, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                RECENT GAMES
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: c.green }}><span style={{ width: 5, height: 5, borderRadius: '50%', background: c.green, display: 'inline-block' }}></span>LIVE</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'IBM Plex Mono, monospace', fontSize: 10 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${c.border}` }}>
                      <th style={{ padding: '6px 6px', textAlign: 'left', color: c.muted, fontSize: 8, letterSpacing: 1 }}>DATE</th>
                      <th style={{ padding: '6px 6px', textAlign: 'left', color: c.muted, fontSize: 8, letterSpacing: 1 }}>OPP</th>
                      <th style={{ padding: '6px 6px', textAlign: 'left', color: c.muted, fontSize: 8, letterSpacing: 1 }}>RES</th>
                      {gameLogLabels.map(l => (
                        <th key={l} style={{ padding: '6px 4px', textAlign: 'right', color: c.muted, fontSize: 8, letterSpacing: 1 }}>{l}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {gameLog.map((g, i) => (
                      <tr
                        key={i}
                        onClick={() => { window.location.href = `/games/${gameLogSport}/${gameLogLeague}/${g.eventId}`; }}
                        style={{ borderBottom: `1px solid ${c.border}22`, cursor: 'pointer', transition: 'background 0.1s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = `${c.green}10`; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <td style={{ padding: '6px 6px', color: c.muted, whiteSpace: 'nowrap' }}>{g.date}</td>
                        <td style={{ padding: '6px 6px', color: c.text, whiteSpace: 'nowrap' }}>{g.opponent}</td>
                        <td style={{ padding: '6px 6px', color: g.won ? c.green : c.red, fontWeight: 600, whiteSpace: 'nowrap' }}>{g.result}</td>
                        {g.stats.map((s: any, si: number) => (
                          <td key={si} style={{ padding: '6px 4px', textAlign: 'right', color: c.text }}>{s.val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Right column: Score Breakdown + Momentum */}
          <div>

        {/* SCORE BREAKDOWN */}
        <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 4, padding: '20px 28px', marginBottom: 20 }}>
          <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: c.muted, letterSpacing: 3, marginBottom: 16 }}>[ SCORE BREAKDOWN ]</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {pillars?.map((pl: any) => (
              <div key={pl.label} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: c.text, letterSpacing: 1, width: 110, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {pl.label.toUpperCase()}
                  {pl.live && <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.green, display: 'inline-block', boxShadow: `0 0 6px ${c.green}` }} title="Live data" />}
                </div>
                <div style={{ flex: 1, height: 6, background: c.border, borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${pl.score}%`, height: '100%', background: pl.color, borderRadius: 3, transition: 'width 0.6s ease' }} />
                </div>
                <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, color: pl.color, width: 36, textAlign: 'right', flexShrink: 0 }}>{pl.score}</div>
              </div>
            ))}
          </div>
        </div>

        {/* X MOMENTUM SIGNAL */}
        <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderLeft: `4px solid #a78bfa`, borderRadius: 4, padding: '20px 28px', marginBottom: 20 }}>
          <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: '#a78bfa', letterSpacing: 3, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
            X · SOCIAL MOMENTUM
            {momentumLive
              ? <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, color: c.green }}><span style={{ width: 5, height: 5, borderRadius: '50%', background: c.green, display: 'inline-block' }}></span>LIVE</span>
              : <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, color: c.muted }}>BASIC TIER REQUIRED</span>
            }
          </div>
          {momentum ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
              {[
                { label: 'MOMENTUM SCORE', val: momentum.momentum_score, color: '#a78bfa', size: 36 },
                { label: 'SIGNAL', val: momentum.signal?.toUpperCase(), color: xSignalColor[momentum.signal] || c.amber, size: 28 },
                { label: 'MENTIONS 7D', val: momentum.mention_count, color: c.text, size: 36 },
              ].map((item, i) => (
                <div key={i} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 3, padding: '12px 14px' }}>
                  <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: c.muted, marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: item.size, color: item.color, lineHeight: 1 }}>{item.val}</div>
                </div>
              ))}
              <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 3, padding: '12px 14px' }}>
                <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: c.muted, marginBottom: 6 }}>SENTIMENT MIX</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {[['POS', c.green, momentum.sentiment?.positive ?? 0], ['NEU', c.muted, momentum.sentiment?.neutral ?? 0], ['NEG', c.red, momentum.sentiment?.negative ?? 0]].map(([label, color, val]) => (
                    <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'IBM Plex Mono, monospace', fontSize: 10 }}>
                      <span style={{ color: color as string }}>{label as string}</span>
                      <span style={{ color: color as string }}>{val as number}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: c.muted }}>Loading momentum data...</div>
          )}
          {momentum?.note && (
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, color: c.muted, marginTop: 12, padding: '8px 12px', background: c.bg, border: `1px solid ${c.border}`, borderRadius: 2 }}>ℹ️ {momentum.note}</div>
          )}
        </div>

          </div>{/* end right column */}
        </div>{/* end two-column zone */}

        {/* CARD LISTINGS */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: c.text, letterSpacing: 3, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            CARD LISTINGS
            <span style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
              {(['COMMON', 'MID', 'RARE'] as const).map(tier => (
                <span key={tier} style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, color: tierBorder[tier] }}>
                  <span style={{ width: 8, height: 2, background: tierBorder[tier], display: 'inline-block', borderRadius: 1 }}></span>{tier}
                </span>
              ))}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {p.cards?.map((card: any, i: number) => (
              <div key={i} style={{ background: c.surface, border: `1px solid ${c.border}`, borderTop: `3px solid ${tierBorder[card.tier]}`, borderRadius: 4, padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 13, color: c.text }}>{card.name}</div>
                  <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: c.muted }}>{card.grade} · Pop: {card.pop} · <span style={{ color: tierBorder[card.tier] }}>{card.tier}</span></div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 26, color: c.text, lineHeight: 1 }}>{card.price}</div>
                  <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: card.up ? c.green : c.red, marginTop: 2 }}>{card.change} 7D</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RECENT SALES */}
        <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderLeft: `4px solid ${c.cyan}`, borderRadius: 4, padding: '20px 28px', marginBottom: 20 }}>
          <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: c.cyan, letterSpacing: 3, marginBottom: 14 }}>RECENT SALES</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'IBM Plex Mono, monospace', fontSize: 11 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${c.border}` }}>
                {['CARD', 'GRADE', 'PRICE', 'DATE'].map(h => (
                  <th key={h} style={{ textAlign: 'left', color: c.muted, fontSize: 9, letterSpacing: 2, paddingBottom: 8, paddingRight: 16 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {p.sales?.map((s: any, i: number) => (
                <tr key={i} style={{ borderBottom: `1px solid ${c.border}` }}>
                  <td style={{ padding: '9px 16px 9px 0', color: c.text }}>{s.card}</td>
                  <td style={{ padding: '9px 16px 9px 0', color: c.muted }}>{s.grade}</td>
                  <td style={{ padding: '9px 16px 9px 0', color: c.green, fontWeight: 700 }}>{s.price}</td>
                  <td style={{ padding: '9px 0', color: c.muted }}>{s.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PSA POPULATION */}
        {psaData && (
          <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderLeft: `4px solid #38bdf8`, borderRadius: 4, padding: '20px 28px', marginBottom: 20 }}>
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: '#38bdf8', letterSpacing: 3, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
              PSA · POPULATION DATA
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, color: c.green }}><span style={{ width: 5, height: 5, borderRadius: '50%', background: c.green, display: 'inline-block' }}></span>LIVE</span>
            </div>
            {(() => {
              // PSA API returns items with grade counts
              const items = Array.isArray(psaData) ? psaData : psaData?.PSACert ? [psaData] : [];
              if (items.length === 0) return <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: c.muted }}>No PSA population data available.</div>;
              // Show grade distribution from first few items
              const topItems = items.slice(0, 8);
              return (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                  {topItems.map((item: any, i: number) => (
                    <div key={i} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 3, padding: '10px 14px' }}>
                      <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: c.text, marginBottom: 6, lineHeight: 1.3 }}>{item.SetName || item.Subject || 'Card'}</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {[10, 9, 8, 7].map(grade => {
                          const count = item[`PSA${grade}`] || item[`Gem${grade}`] || 0;
                          if (!count) return null;
                          return (
                            <div key={grade} style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, color: grade === 10 ? '#38bdf8' : c.muted, background: c.surface, border: `1px solid ${c.border}`, padding: '2px 6px', borderRadius: 2 }}>
                              PSA {grade}: <span style={{ color: c.text }}>{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* EBAY MARKET — FOR SALE NOW */}
        <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderLeft: `4px solid #f59e0b`, borderRadius: 4, padding: '20px 28px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: '#f59e0b', letterSpacing: 3, display: 'flex', alignItems: 'center', gap: 12 }}>
              FOR SALE NOW · EBAY
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, color: c.green }}><span style={{ width: 5, height: 5, borderRadius: '50%', background: c.green, display: 'inline-block', animation: 'pulse 2s ease-in-out infinite' }}></span>LIVE</span>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {[
                { key: 'newlyListed', label: 'NEWEST' },
                { key: 'price', label: 'CHEAPEST' },
                { key: '-price', label: 'PRICIEST' },
                { key: 'endingSoonest', label: 'ENDING SOON' },
              ].map(s => (
                <button key={s.key} onClick={() => setEbaySort(s.key)} style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, letterSpacing: 1, padding: '3px 8px', background: ebaySort === s.key ? '#f59e0b' : 'transparent', color: ebaySort === s.key ? '#090b0f' : c.muted, border: `1px solid ${ebaySort === s.key ? '#f59e0b' : c.border}`, borderRadius: 2, cursor: 'pointer' }}>{s.label}</button>
              ))}
            </div>
          </div>
          {ebayListings?.price_stats && (
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: c.muted, marginBottom: 14, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <span>LOW: <span style={{ color: c.text }}>${ebayListings.price_stats.low?.toFixed(2)}</span></span>
              <span>MEDIAN: <span style={{ color: '#f59e0b' }}>${ebayListings.price_stats.median?.toFixed(2)}</span></span>
              <span>HIGH: <span style={{ color: c.text }}>${ebayListings.price_stats.high?.toFixed(2)}</span></span>
              <span style={{ marginLeft: 'auto' }}>{ebayListings.total?.toLocaleString()} results</span>
            </div>
          )}
          {ebayLoading && (
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: c.muted, padding: '20px 0', textAlign: 'center' }}>Searching eBay...</div>
          )}
          {!ebayLoading && (!ebayListings?.listings?.length) && (
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: c.muted, padding: '20px 0', textAlign: 'center' }}>
              {ebayListings?.configured === false ? 'eBay API not configured' : 'No active listings found'}
            </div>
          )}
          {!ebayLoading && ebayListings?.listings?.length > 0 && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {ebayListings.listings.slice(0, ebayExpanded ? 30 : 8).map((item: any, i: number) => (
                  <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '8px 10px', borderRadius: 6, textDecoration: 'none', transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = `${c.border}44`)}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    {item.image ? (
                      <img src={item.image} alt="" style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 44, height: 44, borderRadius: 6, background: `${c.border}60`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, opacity: 0.4 }}>🃏</div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: c.text, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                      <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, color: c.muted, marginTop: 2 }}>{item.condition}</div>
                    </div>
                    <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, color: '#f59e0b', flexShrink: 0 }}>${item.price}</div>
                  </a>
                ))}
              </div>
              {ebayListings.listings.length > 8 && (
                <button
                  onClick={() => setEbayExpanded(!ebayExpanded)}
                  style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: '#f59e0b', background: 'transparent', border: `1px solid ${c.border}`, borderRadius: 4, padding: '8px 16px', cursor: 'pointer', width: '100%', marginTop: 10, letterSpacing: 1 }}
                >
                  {ebayExpanded ? '▲ SHOW LESS' : `▼ SHOW ALL ${ebayListings.listings.length} LISTINGS`}
                </button>
              )}
            </>
          )}
        </div>

        {/* BETTING ODDS */}
        <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderLeft: `4px solid ${c.amber}`, borderRadius: 4, padding: '20px 28px', marginBottom: 20 }}>
          <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: c.amber, letterSpacing: 3, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
            BETTING ODDS · MOMENTUM SIGNALS
            {oddsLive && <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, color: c.green }}><span style={{ width: 5, height: 5, borderRadius: '50%', background: c.green, display: 'inline-block' }}></span>LIVE</span>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
            {displayOdds.map((b: any, i: number) => (
              <div key={i} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 3, padding: '12px 14px' }}>
                <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: c.muted, marginBottom: 4 }}>{b.market}</div>
                <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 30, color: c.amber, lineHeight: 1 }}>{b.odds}</div>
                <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, color: c.muted, marginTop: 4 }}>{b.book}</div>
              </div>
            ))}
          </div>
          <a
            href={`/odds/${playerLeague.toLowerCase()}`}
            style={{
              display: 'inline-block', marginTop: 14,
              fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: c.amber,
              letterSpacing: 2, textDecoration: 'none', borderBottom: `1px solid ${c.amber}33`,
            }}
          >
            VIEW ALL {playerLeague} ODDS →
          </a>
        </div>

        {/* NEWS */}
        <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderLeft: `4px solid ${c.red}`, borderRadius: 4, padding: '20px 28px', marginBottom: 32 }}>
          <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: c.red, letterSpacing: 3, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
            VALUE SIGNALS · NEWS
            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, color: c.muted }}>INJURY · AWARDS · TRADES · CARDS</span>
            {!newsLoading && news.length > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, color: c.green, marginLeft: 'auto' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.green, display: 'inline-block' }}></span>LIVE
              </span>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {newsLoading ? (
              <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: c.muted, padding: '12px 0' }}>Scanning feeds...</div>
            ) : news.length === 0 ? (
              <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: c.muted, padding: '12px 0' }}>No value-relevant news in the last 48 hours.</div>
            ) : news.map((n: any, i: number) => {
              const sentColor = n.sentiment === 'positive' ? c.green : n.sentiment === 'negative' ? c.red : c.muted;
              return (
                <div key={i} style={{ padding: '12px 0', borderBottom: i < news.length - 1 ? `1px solid ${c.border}` : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: sentColor, display: 'inline-block', flexShrink: 0 }}></span>
                      <a href={n.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: c.text, lineHeight: 1.5, textDecoration: 'none' }}>{n.headline}</a>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 14 }}>
                      <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: sentColor }}>{n.source}</span>
                      {n.keywords?.map((k: string, ki: number) => (
                        <span key={ki} style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, color: c.muted, background: c.bg, border: `1px solid ${c.border}`, padding: '1px 5px', borderRadius: 2 }}>{k}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: c.muted, whiteSpace: 'nowrap', flexShrink: 0 }}>{n.time}</div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${c.border}`, padding: '20px 24px', textAlign: 'center', background: c.surface }}>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 18, letterSpacing: 3, color: c.green, marginBottom: 6 }}>SLABSTREET</div>
        <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: c.muted }}>© 2026 Slab Street · slabstreet.io · All rights reserved</div>
      </footer>
    </div>
  );
}
