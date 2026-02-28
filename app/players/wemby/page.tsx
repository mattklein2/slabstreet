'use client';

import { useState } from 'react';

const scoreHistory: Record<string, { labels: string[]; scores: number[] }> = {
  daily: {
    labels: ['Feb 22','Feb 23','Feb 24','Feb 25','Feb 26','Feb 27','Feb 28'],
    scores: [71, 72, 70, 73, 72, 74, 74],
  },
  weekly: {
    labels: ['Dec 30','Jan 6','Jan 13','Jan 20','Jan 27','Feb 3','Feb 10','Feb 17','Feb 24'],
    scores: [63, 65, 66, 68, 67, 70, 71, 73, 74],
  },
  monthly: {
    labels: ['Jun 23','Sep 23','Dec 23','Mar 24','Jun 24','Sep 24','Dec 24','Mar 25'],
    scores: [48, 52, 55, 58, 61, 65, 70, 74],
  },
  yearly: {
    labels: ['2022','2023','2024','2025','2026'],
    scores: [40, 51, 62, 72, 74],
  },
};

function ScoreChart({ period }: { period: string }) {
  const data = scoreHistory[period];
  const w = 600;
  const h = 160;
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
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00ff87" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#00ff87" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const y = pad.top + t * innerH;
        const val = Math.round(max - t * (max - min));
        return (
          <g key={t}>
            <line x1={pad.left} y1={y} x2={w - pad.right} y2={y} stroke="#1e2530" strokeWidth="1" />
            <text x={pad.left - 6} y={y + 4} fill="#8899aa" fontSize="9" textAnchor="end" fontFamily="IBM Plex Mono">{val}</text>
          </g>
        );
      })}
      <polygon points={areaPoints} fill="url(#chartGrad)" />
      <polyline points={points} fill="none" stroke="#00ff87" strokeWidth="2" strokeLinejoin="round" />
      {data.scores.map((s, i) => (
        <circle key={i} cx={pad.left + i * xStep} cy={pad.top + yScale(s)} r="3" fill="#00ff87" />
      ))}
      {data.labels.map((l, i) => {
        if (i % labelStep !== 0 && i !== data.labels.length - 1) return null;
        return (
          <text key={i} x={pad.left + i * xStep} y={h - 6} fill="#8899aa" fontSize="9" textAnchor="middle" fontFamily="IBM Plex Mono">{l}</text>
        );
      })}
    </svg>
  );
}

const pillars = [
  { label: 'Market',      score: 72, color: '#00ff87' },
  { label: 'Scarcity',    score: 65, color: '#38bdf8' },
  { label: 'Momentum',    score: 81, color: '#a78bfa' },
  { label: 'Performance', score: 78, color: '#fb923c' },
  { label: 'Risk',        score: 88, color: '#4ade80' },
];

const cardListings = [
  { name: '2023-24 Prizm Base',            grade: 'PSA 10', pop: '26,000', tier: 'COMMON', price: '$480',    change: '▼ -2.1%', up: false },
  { name: '2023-24 Prizm Silver',          grade: 'PSA 10', pop: '2,000',  tier: 'MID',    price: '$1,240',  change: '▲ +5.3%', up: true  },
  { name: '2023-24 Prizm Silver Auto /25', grade: 'PSA 10', pop: '142',    tier: 'MID',    price: '$2,840',  change: '▲ +8.4%', up: true  },
  { name: '2023-24 NT RPA /99',            grade: 'PSA 10', pop: '28',     tier: 'RARE',   price: '$18,500', change: '▲ +3.2%', up: true  },
  { name: 'NT Logoman Auto 1/1',           grade: 'PSA 10', pop: '1',      tier: 'RARE',   price: '~$150K',  change: '▲ UNACCOUNTED', up: true },
  { name: '2024-25 Hoops Prizm Gold /10',  grade: 'BGS 9.5',pop: '34',     tier: 'MID',    price: '$1,200',  change: '▲ +12.7%', up: true },
];

const tierBorder: Record<string, string> = {
  COMMON: '#8899aa',
  MID:    '#38bdf8',
  RARE:   '#f59e0b',
};

const recentSales = [
  { card: '2023-24 Prizm Silver Auto /25', grade: 'PSA 10', price: '$2,840', date: 'Feb 27' },
  { card: '2023-24 Prizm Base',            grade: 'PSA 10', price: '$472',   date: 'Feb 27' },
  { card: 'NT RPA /99',                    grade: 'PSA 10', price: '$18,200',date: 'Feb 26' },
  { card: '2023-24 Prizm Silver',          grade: 'PSA 10', price: '$1,190', date: 'Feb 26' },
  { card: '2024-25 Hoops Prizm Gold /10',  grade: 'BGS 9.5',price: '$1,155', date: 'Feb 25' },
  { card: '2023-24 Prizm Base',            grade: 'PSA 9',  price: '$210',   date: 'Feb 25' },
];

const bettingOdds = [
  { market: 'NBA MVP',             book: 'DraftKings', odds: '-320' },
  { market: 'Defensive Player of Year', book: 'FanDuel', odds: '-450' },
  { market: 'NBA Champion',        book: 'BetMGM',    odds: '+2800' },
  { market: 'All-NBA First Team',  book: 'DraftKings', odds: '-900' },
];

const news = [
  { headline: 'Wembanyama drops 40-point triple-double in Spurs win over Lakers', source: 'ESPN',           time: '2h ago' },
  { headline: 'Wemby MVP odds tighten as Spurs surge to .500 record',             source: 'Bleacher Report', time: '5h ago' },
  { headline: 'Victor Wembanyama named Western Conference Player of the Week',    source: 'NBA.com',        time: '1d ago' },
  { headline: 'Spurs front office signals long-term commitment around Wembanyama',source: 'The Athletic',   time: '2d ago' },
  { headline: 'Wemby card market surges following historic 5-block performance',  source: 'CBS Sports',     time: '3d ago' },
];

export default function WembyPage() {
  const [period, setPeriod] = useState<string>('weekly');

  return (
    <div style={{ background: '#090b0f', minHeight: '100vh', color: '#e8edf5', fontFamily: 'IBM Plex Sans, sans-serif' }}>

      {/* NAV */}
      <nav style={{ borderBottom: '1px solid #1e2530', padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#090b0f', zIndex: 100 }}>
        <a href="/" style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, letterSpacing: 3, color: '#00ff87', textDecoration: 'none' }}>SLABSTREET</a>
        <a href="/" style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: '#8899aa', textDecoration: 'none', letterSpacing: 1 }}>← BACK</a>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px' }}>

        {/* ═══════════════════════════════════════════════
            PLAYER HEADER — name + trading card back stats
        ════════════════════════════════════════════════ */}
        <div style={{
          background: '#0f1318',
          border: '1px solid #1e2530',
          borderTop: '3px solid #00ff87',
          borderRadius: 4,
          padding: '24px 28px',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 24,
          flexWrap: 'wrap',
          marginBottom: 20,
        }}>
          {/* Left: team tag + name */}
          <div>
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: '#8899aa', letterSpacing: 2, marginBottom: 8 }}>
              SAS · CENTER · #1
            </div>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 56, lineHeight: 1, letterSpacing: 2, color: '#e8edf5' }}>
              VICTOR
            </div>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 56, lineHeight: 1, letterSpacing: 2, color: '#00ff87' }}>
              WEMBANYAMA
            </div>
          </div>

          {/* Right: Trading card back stats */}
          <div style={{
            fontFamily: 'IBM Plex Mono, monospace',
            border: '1px solid #1e2530',
            borderRadius: 3,
            overflow: 'hidden',
            alignSelf: 'center',
            minWidth: 220,
          }}>
            {/* Header strip */}
            <div style={{ background: '#1e2530', padding: '5px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 9, letterSpacing: 2, color: '#8899aa', textTransform: 'uppercase' }}>2024–25 Season Stats</span>
              <span style={{ fontSize: 9, color: '#00ff87', letterSpacing: 1 }}>NBA</span>
            </div>
            {/* Stat rows — 3 per row */}
            {[
              [{ label: 'PPG', val: '24.8' }, { label: 'RPG', val: '10.6' }, { label: 'APG', val: '3.9' }],
              [{ label: 'BPG', val: '3.7'  }, { label: 'FG%', val: '49.2' }, { label: 'GP',  val: '54'  }],
            ].map((row, ri) => (
              <div key={ri} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: ri === 0 ? '1px solid #1e2530' : 'none' }}>
                {row.map((s, i) => (
                  <div key={i} style={{
                    padding: '8px 12px',
                    borderRight: i < 2 ? '1px solid #1e2530' : 'none',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#e8edf5', lineHeight: 1 }}>{s.val}</div>
                    <div style={{ fontSize: 8, color: '#8899aa', letterSpacing: 1, marginTop: 3 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            SLAB SCORE
        ════════════════════════════════════════════════ */}
        <div style={{
          background: '#0f1318',
          border: '1px solid #1e2530',
          borderLeft: '4px solid #00ff87',
          borderRadius: 4,
          padding: '20px 28px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 32,
          flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: '#8899aa', letterSpacing: 3, marginBottom: 6 }}>SLAB SCORE™</div>
            <div style={{
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: 96,
              lineHeight: 1,
              color: '#00ff87',
              textShadow: '0 0 40px rgba(0,255,135,0.5)',
            }}>74</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: 10, height: 10, borderRadius: '50%', background: '#00ff87',
                boxShadow: '0 0 8px #00ff87',
                animation: 'pulse 1.5s infinite',
                display: 'inline-block',
              }}></span>
              <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, color: '#00ff87', letterSpacing: 3 }}>BUY</span>
            </div>
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: '#8899aa' }}>SIGNAL THRESHOLD: 70+</div>
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: '#8899aa' }}>UPDATED: FEB 28, 2026</div>
          </div>

          {/* Score gauge strip */}
          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={{ height: 6, borderRadius: 3, background: 'linear-gradient(to right, #ff3b5c 0%, #f59e0b 40%, #00ff87 70%)', marginBottom: 4, position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: '74%',
                top: -4,
                width: 2,
                height: 14,
                background: '#fff',
                borderRadius: 1,
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, color: '#8899aa' }}>
              <span>SELL 0</span><span>HOLD 40</span><span>BUY 70</span><span>100</span>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            SLAB SCORE HISTORY
        ════════════════════════════════════════════════ */}
        <div style={{
          background: '#0f1318',
          border: '1px solid #1e2530',
          borderRadius: 4,
          padding: '20px 28px',
          marginBottom: 20,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: '#00ff87', letterSpacing: 3, borderBottom: '1px solid #00ff87', paddingBottom: 4 }}>
              SLAB SCORE HISTORY
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {['daily','weekly','monthly','yearly'].map(p => (
                <button key={p} onClick={() => setPeriod(p)} style={{
                  fontFamily: 'IBM Plex Mono, monospace',
                  fontSize: 10,
                  letterSpacing: 1,
                  padding: '4px 10px',
                  background: period === p ? '#00ff87' : 'transparent',
                  color: period === p ? '#090b0f' : '#8899aa',
                  border: `1px solid ${period === p ? '#00ff87' : '#1e2530'}`,
                  borderRadius: 2,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <ScoreChart period={period} />
        </div>

        {/* ═══════════════════════════════════════════════
            PILLARS — each gets its own accent color
        ════════════════════════════════════════════════ */}
        <div style={{
          background: '#0f1318',
          border: '1px solid #1e2530',
          borderRadius: 4,
          padding: '20px 28px',
          marginBottom: 20,
        }}>
          <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: '#8899aa', letterSpacing: 3, marginBottom: 16 }}>
            [ SCORE BREAKDOWN ]
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {pillars.map((p) => (
              <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: '#e8edf5', letterSpacing: 1, width: 110, flexShrink: 0 }}>
                  {p.label.toUpperCase()}
                </div>
                <div style={{ flex: 1, height: 6, background: '#1e2530', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${p.score}%`, height: '100%', background: p.color, borderRadius: 3 }} />
                </div>
                <div style={{
                  fontFamily: 'Bebas Neue, sans-serif',
                  fontSize: 22,
                  color: p.color,
                  width: 36,
                  textAlign: 'right',
                  flexShrink: 0,
                }}>
                  {p.score}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            CARD LISTINGS — top border by tier
        ════════════════════════════════════════════════ */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: '#e8edf5', letterSpacing: 3, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            CARD LISTINGS
            <span style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
              {[['COMMON','#8899aa'],['MID','#38bdf8'],['RARE','#f59e0b']].map(([label, color]) => (
                <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, color: color as string }}>
                  <span style={{ width: 8, height: 2, background: color as string, display: 'inline-block', borderRadius: 1 }}></span>
                  {label}
                </span>
              ))}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {cardListings.map((c, i) => (
              <div key={i} style={{
                background: '#0f1318',
                border: '1px solid #1e2530',
                borderTop: `3px solid ${tierBorder[c.tier]}`,
                borderRadius: 4,
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 8,
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 13, color: '#e8edf5' }}>{c.name}</div>
                  <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: '#8899aa' }}>
                    {c.grade} · Pop: {c.pop} · <span style={{ color: tierBorder[c.tier] }}>{c.tier}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 26, color: '#e8edf5', lineHeight: 1 }}>{c.price}</div>
                  <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: c.up ? '#00ff87' : '#ff3b5c', marginTop: 2 }}>{c.change} 7D</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            RECENT SALES — cyan accent
        ════════════════════════════════════════════════ */}
        <div style={{
          background: '#0f1318',
          border: '1px solid #1e2530',
          borderLeft: '4px solid #38bdf8',
          borderRadius: 4,
          padding: '20px 28px',
          marginBottom: 20,
        }}>
          <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: '#38bdf8', letterSpacing: 3, marginBottom: 14 }}>
            RECENT SALES
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'IBM Plex Mono, monospace', fontSize: 11 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1e2530' }}>
                {['CARD','GRADE','PRICE','DATE'].map(h => (
                  <th key={h} style={{ textAlign: 'left', color: '#8899aa', fontSize: 9, letterSpacing: 2, paddingBottom: 8, paddingRight: 16 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentSales.map((s, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #1a2030' }}>
                  <td style={{ padding: '9px 16px 9px 0', color: '#e8edf5' }}>{s.card}</td>
                  <td style={{ padding: '9px 16px 9px 0', color: '#8899aa' }}>{s.grade}</td>
                  <td style={{ padding: '9px 16px 9px 0', color: '#00ff87', fontWeight: 700 }}>{s.price}</td>
                  <td style={{ padding: '9px 0', color: '#8899aa' }}>{s.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ═══════════════════════════════════════════════
            BETTING ODDS — amber accent
        ════════════════════════════════════════════════ */}
        <div style={{
          background: '#0f1318',
          border: '1px solid #1e2530',
          borderLeft: '4px solid #f59e0b',
          borderRadius: 4,
          padding: '20px 28px',
          marginBottom: 20,
        }}>
          <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: '#f59e0b', letterSpacing: 3, marginBottom: 14 }}>
            BETTING ODDS · MOMENTUM SIGNALS
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
            {bettingOdds.map((b, i) => (
              <div key={i} style={{
                background: '#090b0f',
                border: '1px solid #1e2530',
                borderRadius: 3,
                padding: '12px 14px',
              }}>
                <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: '#8899aa', marginBottom: 4 }}>{b.market}</div>
                <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 30, color: '#f59e0b', lineHeight: 1 }}>{b.odds}</div>
                <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, color: '#8899aa', marginTop: 4 }}>{b.book}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            RECENT NEWS — red left border
        ════════════════════════════════════════════════ */}
        <div style={{
          background: '#0f1318',
          border: '1px solid #1e2530',
          borderLeft: '4px solid #ff3b5c',
          borderRadius: 4,
          padding: '20px 28px',
          marginBottom: 32,
        }}>
          <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: '#ff3b5c', letterSpacing: 3, marginBottom: 14 }}>
            RECENT NEWS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {news.map((n, i) => (
              <div key={i} style={{
                padding: '12px 0',
                borderBottom: i < news.length - 1 ? '1px solid #1e2530' : 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 16,
              }}>
                <div>
                  <div style={{ fontSize: 13, color: '#e8edf5', lineHeight: 1.5, marginBottom: 4 }}>{n.headline}</div>
                  <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: '#ff3b5c' }}>{n.source}</div>
                </div>
                <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: '#8899aa', whiteSpace: 'nowrap', flexShrink: 0 }}>{n.time}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid #1e2530', padding: '20px 24px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 18, letterSpacing: 3, color: '#00ff87', marginBottom: 6 }}>SLABSTREET</div>
        <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: '#8899aa' }}>© 2026 Slab Street · slabstreet.io · All rights reserved</div>
      </footer>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        @media (max-width: 640px) {
          .player-header { flex-direction: column !important; }
        }
      `}</style>
    </div>
  );
}