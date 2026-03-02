'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '../../components/ThemeProvider';

const playerData: Record<string, any> = {
  wemby: {
    name: 'Victor Wembanyama', firstName: 'VICTOR', lastName: 'WEMBANYAMA', lastNameSearch: 'wembanyama',
    team: 'SAS', position: 'CENTER', number: '1', score: 74, signal: 'BUY',
    pillars: [
      { label: 'Market',      score: 72, color: '#00ff87' },
      { label: 'Scarcity',    score: 65, color: '#38bdf8' },
      { label: 'Momentum',    score: 81, color: '#a78bfa' },
      { label: 'Performance', score: 78, color: '#fb923c' },
      { label: 'Risk',        score: 88, color: '#4ade80' },
    ],
    stats: [
      { label: 'PPG', val: '24.8' }, { label: 'RPG', val: '10.6' }, { label: 'APG', val: '3.9' },
      { label: 'BPG', val: '3.7'  }, { label: 'FG%', val: '49.2' }, { label: 'GP',  val: '54'  },
    ],
    scoreHistory: {
      daily:   { labels: ['Feb 22','Feb 23','Feb 24','Feb 25','Feb 26','Feb 27','Feb 28'], scores: [71,72,70,73,72,74,74] },
      weekly:  { labels: ['Dec 30','Jan 6','Jan 13','Jan 20','Jan 27','Feb 3','Feb 10','Feb 17','Feb 24'], scores: [63,65,66,68,67,70,71,73,74] },
      monthly: { labels: ['Jun 23','Sep 23','Dec 23','Mar 24','Jun 24','Sep 24','Dec 24','Mar 25'], scores: [48,52,55,58,61,65,70,74] },
      yearly:  { labels: ['2022','2023','2024','2025','2026'], scores: [40,51,62,72,74] },
    },
    cards: [
      { name: '2023-24 Prizm Base',            grade: 'PSA 10', pop: '26,000', tier: 'COMMON', price: '$480',    change: '▼ -2.1%',     up: false },
      { name: '2023-24 Prizm Silver',          grade: 'PSA 10', pop: '2,000',  tier: 'MID',    price: '$1,240',  change: '▲ +5.3%',     up: true  },
      { name: '2023-24 Prizm Silver Auto /25', grade: 'PSA 10', pop: '142',    tier: 'MID',    price: '$2,840',  change: '▲ +8.4%',     up: true  },
      { name: '2023-24 NT RPA /99',            grade: 'PSA 10', pop: '28',     tier: 'RARE',   price: '$18,500', change: '▲ +3.2%',     up: true  },
      { name: 'NT Logoman Auto 1/1',           grade: 'PSA 10', pop: '1',      tier: 'RARE',   price: '~$150K',  change: '▲ UNCOUNTED', up: true  },
      { name: '2024-25 Hoops Prizm Gold /10',  grade: 'BGS 9.5',pop: '34',     tier: 'MID',    price: '$1,200',  change: '▲ +12.7%',    up: true  },
    ],
    sales: [
      { card: '2023-24 Prizm Silver Auto /25', grade: 'PSA 10',  price: '$2,840',  date: 'Feb 27' },
      { card: '2023-24 Prizm Base',            grade: 'PSA 10',  price: '$472',    date: 'Feb 27' },
      { card: 'NT RPA /99',                    grade: 'PSA 10',  price: '$18,200', date: 'Feb 26' },
      { card: '2023-24 Prizm Silver',          grade: 'PSA 10',  price: '$1,190',  date: 'Feb 26' },
      { card: '2024-25 Hoops Prizm Gold /10',  grade: 'BGS 9.5', price: '$1,155',  date: 'Feb 25' },
      { card: '2023-24 Prizm Base',            grade: 'PSA 9',   price: '$210',    date: 'Feb 25' },
    ],
    fallbackOdds: [
      { market: 'NBA MVP',                  book: 'DraftKings', odds: '-320'  },
      { market: 'Defensive Player of Year', book: 'FanDuel',    odds: '-450'  },
      { market: 'NBA Champion',             book: 'BetMGM',     odds: '+2800' },
      { market: 'All-NBA First Team',       book: 'DraftKings', odds: '-900'  },
    ],
    news: [
      { headline: 'Wembanyama drops 40-point triple-double in Spurs win over Lakers', source: 'ESPN',            time: '2h ago' },
      { headline: 'Wemby MVP odds tighten as Spurs surge to .500 record',             source: 'Bleacher Report', time: '5h ago' },
      { headline: 'Victor Wembanyama named Western Conference Player of the Week',    source: 'NBA.com',         time: '1d ago' },
      { headline: 'Spurs front office signals long-term commitment around Wembanyama',source: 'The Athletic',    time: '2d ago' },
      { headline: 'Wemby card market surges following historic 5-block performance',  source: 'CBS Sports',      time: '3d ago' },
    ],
  },
  luka: {
    name: 'Luka Doncic', firstName: 'LUKA', lastName: 'DONCIC', lastNameSearch: 'doncic',
    team: 'LAL', position: 'GUARD', number: '77', score: 61, signal: 'HOLD',
    pillars: [
      { label: 'Market',      score: 58, color: '#00ff87' },
      { label: 'Scarcity',    score: 52, color: '#38bdf8' },
      { label: 'Momentum',    score: 64, color: '#a78bfa' },
      { label: 'Performance', score: 71, color: '#fb923c' },
      { label: 'Risk',        score: 60, color: '#4ade80' },
    ],
    stats: [
      { label: 'PPG', val: '27.1' }, { label: 'RPG', val: '8.4'  }, { label: 'APG', val: '7.8' },
      { label: 'SPG', val: '1.4'  }, { label: 'FG%', val: '47.3' }, { label: 'GP',  val: '49'  },
    ],
    scoreHistory: {
      daily:   { labels: ['Feb 22','Feb 23','Feb 24','Feb 25','Feb 26','Feb 27','Feb 28'], scores: [62,60,61,63,61,60,61] },
      weekly:  { labels: ['Dec 30','Jan 6','Jan 13','Jan 20','Jan 27','Feb 3','Feb 10','Feb 17','Feb 24'], scores: [65,64,63,62,60,61,62,61,61] },
      monthly: { labels: ['Jun 23','Sep 23','Dec 23','Mar 24','Jun 24','Sep 24','Dec 24','Mar 25'], scores: [70,72,74,71,68,65,63,61] },
      yearly:  { labels: ['2021','2022','2023','2024','2025','2026'], scores: [78,76,74,70,65,61] },
    },
    cards: [
      { name: '2018-19 Prizm Base RC',     grade: 'PSA 10', pop: '8,400', tier: 'COMMON', price: '$620',    change: '▼ -1.8%', up: false },
      { name: '2018-19 Prizm Silver RC',   grade: 'PSA 10', pop: '1,100', tier: 'MID',    price: '$2,100',  change: '▼ -3.2%', up: false },
      { name: '2018-19 Prizm RC Auto /125',grade: 'PSA 10', pop: '210',   tier: 'MID',    price: '$4,800',  change: '▲ +1.4%', up: true  },
      { name: '2018-19 NT RPA /99',        grade: 'PSA 10', pop: '44',    tier: 'RARE',   price: '$22,000', change: '▼ -2.1%', up: false },
    ],
    sales: [
      { card: '2018-19 Prizm Silver RC',    grade: 'PSA 10', price: '$2,050',  date: 'Feb 27' },
      { card: '2018-19 Prizm Base RC',      grade: 'PSA 10', price: '$610',    date: 'Feb 26' },
      { card: 'NT RPA /99',                 grade: 'PSA 10', price: '$21,800', date: 'Feb 26' },
      { card: '2018-19 Prizm RC Auto /125', grade: 'PSA 10', price: '$4,750',  date: 'Feb 25' },
    ],
    fallbackOdds: [
      { market: 'NBA MVP',            book: 'DraftKings', odds: '+550'  },
      { market: 'NBA Champion',       book: 'FanDuel',    odds: '+420'  },
      { market: 'All-NBA First Team', book: 'BetMGM',     odds: '-280'  },
      { market: 'Scoring Title',      book: 'DraftKings', odds: '+180'  },
    ],
    news: [
      { headline: 'Luka Doncic posts 38-point, 12-assist double-double in Lakers win',  source: 'ESPN',            time: '4h ago' },
      { headline: 'Card market cools on Luka as trade rumors fade post-deadline',        source: 'Bleacher Report', time: '1d ago' },
      { headline: 'Doncic named All-Star starter for third consecutive season',          source: 'NBA.com',         time: '2d ago' },
    ],
  },
  ja: {
    name: 'Ja Morant', firstName: 'JA', lastName: 'MORANT', lastNameSearch: 'morant',
    team: 'MEM', position: 'GUARD', number: '12', score: 55, signal: 'HOLD',
    pillars: [
      { label: 'Market',      score: 50, color: '#00ff87' },
      { label: 'Scarcity',    score: 58, color: '#38bdf8' },
      { label: 'Momentum',    score: 52, color: '#a78bfa' },
      { label: 'Performance', score: 66, color: '#fb923c' },
      { label: 'Risk',        score: 42, color: '#4ade80' },
    ],
    stats: [
      { label: 'PPG', val: '22.4' }, { label: 'RPG', val: '5.8'  }, { label: 'APG', val: '8.1' },
      { label: 'SPG', val: '1.1'  }, { label: 'FG%', val: '46.8' }, { label: 'GP',  val: '41'  },
    ],
    scoreHistory: {
      daily:   { labels: ['Feb 22','Feb 23','Feb 24','Feb 25','Feb 26','Feb 27','Feb 28'], scores: [54,56,55,53,55,56,55] },
      weekly:  { labels: ['Dec 30','Jan 6','Jan 13','Jan 20','Jan 27','Feb 3','Feb 10','Feb 17','Feb 24'], scores: [60,58,56,54,52,53,54,55,55] },
      monthly: { labels: ['Jun 23','Sep 23','Dec 23','Mar 24','Jun 24','Sep 24','Dec 24','Mar 25'], scores: [72,68,58,50,48,51,53,55] },
      yearly:  { labels: ['2021','2022','2023','2024','2025','2026'], scores: [74,80,62,48,51,55] },
    },
    cards: [
      { name: '2019-20 Prizm Base RC',     grade: 'PSA 10', pop: '12,000', tier: 'COMMON', price: '$320',   change: '▲ +2.1%', up: true  },
      { name: '2019-20 Prizm Silver RC',   grade: 'PSA 10', pop: '2,400',  tier: 'MID',    price: '$980',   change: '▲ +3.4%', up: true  },
      { name: '2019-20 Prizm RC Auto /149',grade: 'PSA 10', pop: '180',    tier: 'MID',    price: '$2,200', change: '▲ +1.9%', up: true  },
      { name: '2019-20 NT RPA /99',        grade: 'PSA 10', pop: '36',     tier: 'RARE',   price: '$8,400', change: '▼ -4.2%', up: false },
    ],
    sales: [
      { card: '2019-20 Prizm Silver RC',    grade: 'PSA 10', price: '$960',   date: 'Feb 27' },
      { card: '2019-20 Prizm Base RC',      grade: 'PSA 10', price: '$315',   date: 'Feb 27' },
      { card: 'NT RPA /99',                 grade: 'PSA 10', price: '$8,200', date: 'Feb 25' },
    ],
    fallbackOdds: [
      { market: 'NBA MVP',       book: 'DraftKings', odds: '+3500' },
      { market: 'Most Improved', book: 'FanDuel',    odds: '+800'  },
      { market: 'All-NBA Team',  book: 'BetMGM',     odds: '+220'  },
      { market: 'NBA Champion',  book: 'DraftKings', odds: '+6000' },
    ],
    news: [
      { headline: 'Ja Morant returns from injury, drops 28 points in Grizzlies comeback', source: 'ESPN',            time: '6h ago' },
      { headline: 'Morant card prices tick up on return but risk score remains elevated',   source: 'CBS Sports',      time: '1d ago' },
      { headline: 'Grizzlies cautious with Ja as playoffs approach — minutes restriction',  source: 'The Athletic',    time: '2d ago' },
    ],
  },
  ant: {
    name: 'Anthony Edwards', firstName: 'ANTHONY', lastName: 'EDWARDS', lastNameSearch: 'edwards',
    team: 'MIN', position: 'GUARD', number: '5', score: 67, signal: 'HOLD',
    pillars: [
      { label: 'Market',      score: 64, color: '#00ff87' },
      { label: 'Scarcity',    score: 70, color: '#38bdf8' },
      { label: 'Momentum',    score: 72, color: '#a78bfa' },
      { label: 'Performance', score: 74, color: '#fb923c' },
      { label: 'Risk',        score: 80, color: '#4ade80' },
    ],
    stats: [
      { label: 'PPG', val: '26.3' }, { label: 'RPG', val: '5.4'  }, { label: 'APG', val: '5.1' },
      { label: 'SPG', val: '1.3'  }, { label: 'FG%', val: '46.1' }, { label: 'GP',  val: '52'  },
    ],
    scoreHistory: {
      daily:   { labels: ['Feb 22','Feb 23','Feb 24','Feb 25','Feb 26','Feb 27','Feb 28'], scores: [65,66,67,66,68,67,67] },
      weekly:  { labels: ['Dec 30','Jan 6','Jan 13','Jan 20','Jan 27','Feb 3','Feb 10','Feb 17','Feb 24'], scores: [58,60,61,62,63,64,65,66,67] },
      monthly: { labels: ['Jun 23','Sep 23','Dec 23','Mar 24','Jun 24','Sep 24','Dec 24','Mar 25'], scores: [44,48,52,55,58,61,64,67] },
      yearly:  { labels: ['2021','2022','2023','2024','2025','2026'], scores: [38,44,52,58,63,67] },
    },
    cards: [
      { name: '2020-21 Prizm Base RC',     grade: 'PSA 10', pop: '18,000', tier: 'COMMON', price: '$280',   change: '▲ +4.2%', up: true },
      { name: '2020-21 Prizm Silver RC',   grade: 'PSA 10', pop: '3,200',  tier: 'MID',    price: '$860',   change: '▲ +6.8%', up: true },
      { name: '2020-21 Prizm RC Auto /149',grade: 'PSA 10', pop: '220',    tier: 'MID',    price: '$1,900', change: '▲ +5.1%', up: true },
      { name: '2020-21 NT RPA /99',        grade: 'PSA 10', pop: '40',     tier: 'RARE',   price: '$7,200', change: '▲ +2.8%', up: true },
    ],
    sales: [
      { card: '2020-21 Prizm Silver RC',    grade: 'PSA 10', price: '$840',   date: 'Feb 27' },
      { card: '2020-21 Prizm Base RC',      grade: 'PSA 10', price: '$275',   date: 'Feb 27' },
      { card: 'NT RPA /99',                 grade: 'PSA 10', price: '$7,100', date: 'Feb 26' },
    ],
    fallbackOdds: [
      { market: 'NBA MVP',            book: 'DraftKings', odds: '+380'  },
      { market: 'NBA Champion',       book: 'FanDuel',    odds: '+1400' },
      { market: 'All-NBA First Team', book: 'BetMGM',     odds: '-180'  },
      { market: 'Scoring Title',      book: 'DraftKings', odds: '+320'  },
    ],
    news: [
      { headline: 'Anthony Edwards erupts for 41 points as Timberwolves close in on top seed', source: 'ESPN',            time: '3h ago' },
      { headline: 'Ant card market heating up — Prizm RC Silver up 12% in 30 days',            source: 'CBS Sports',      time: '8h ago' },
      { headline: 'Edwards named All-Star starter, first in Timberwolves history since KG',    source: 'NBA.com',         time: '1d ago' },
    ],
  },
};

function ScoreChart({ data, lineColor }: { data: { labels: string[]; scores: number[] }; lineColor: string }) {
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
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lineColor} stopOpacity="0.18" />
          <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
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
      <polyline points={points} fill="none" stroke={lineColor} strokeWidth="2" strokeLinejoin="round" />
      {data.scores.map((s, i) => (
        <circle key={i} cx={pad.left + i * xStep} cy={pad.top + yScale(s)} r="3" fill={lineColor} />
      ))}
      {data.labels.map((l, i) => {
        if (i % labelStep !== 0 && i !== data.labels.length - 1) return null;
        return <text key={i} x={pad.left + i * xStep} y={h - 6} fill="#8899aa" fontSize="9" textAnchor="middle" fontFamily="IBM Plex Mono">{l}</text>;
      })}
    </svg>
  );
}

const tierBorder: Record<string, string> = { COMMON: '#8899aa', MID: '#38bdf8', RARE: '#f59e0b' };

export default function PlayerPage({ params }: { params: { slug: string } }) {
  const { theme, toggle, colors: c } = useTheme();
  const [period, setPeriod] = useState('weekly');
  const [odds, setOdds]     = useState<any[] | null>(null);
  const [oddsLive, setOddsLive] = useState(false);

  const p = playerData[params.slug];

  const signalColor: Record<string, string> = { BUY: c.green, HOLD: c.amber, SELL: c.red };

  useEffect(() => {
    if (!p) return;
    fetch(`/api/odds?player=${p.lastNameSearch}`)
      .then(r => r.json())
      .then(data => {
        if (data.odds && data.odds.length > 0) { setOdds(data.odds); setOddsLive(true); }
        else { setOdds(p.fallbackOdds); setOddsLive(false); }
      })
      .catch(() => { setOdds(p.fallbackOdds); setOddsLive(false); });
  }, [params.slug]);

  const displayOdds = odds ?? p?.fallbackOdds ?? [];

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
      <nav style={{ borderBottom: `1px solid ${c.border}`, padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: c.navBg, zIndex: 100, boxShadow: theme === 'light' ? '0 1px 8px rgba(0,0,0,0.06)' : 'none' }}>
        <a href="/" style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, letterSpacing: 3, color: c.green, textDecoration: 'none' }}>SLABSTREET</a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <a href="/" style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: c.muted, textDecoration: 'none', letterSpacing: 1 }}>← BACK</a>
          <button onClick={toggle} title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'} style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 20, width: 44, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0 3px', transition: 'all 0.2s' }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: c.green, transform: theme === 'dark' ? 'translateX(0)' : 'translateX(20px)', transition: 'transform 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>
              {theme === 'dark' ? '🌙' : '☀️'}
            </div>
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px' }}>

        {/* PLAYER HEADER */}
        <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderTop: `3px solid ${c.green}`, borderRadius: 4, padding: '24px 28px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: c.muted, letterSpacing: 2, marginBottom: 8 }}>{p.team} · {p.position} · #{p.number}</div>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 56, lineHeight: 1, letterSpacing: 2, color: c.text }}>{p.firstName}</div>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 56, lineHeight: 1, letterSpacing: 2, color: c.green }}>{p.lastName}</div>
          </div>
          <div style={{ fontFamily: 'IBM Plex Mono, monospace', border: `1px solid ${c.border}`, borderRadius: 3, overflow: 'hidden', alignSelf: 'center', minWidth: 220 }}>
            <div style={{ background: c.border, padding: '5px 12px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 9, letterSpacing: 2, color: c.muted, textTransform: 'uppercase' }}>2024–25 Season Stats</span>
              <span style={{ fontSize: 9, color: c.green, letterSpacing: 1 }}>NBA</span>
            </div>
            {[p.stats.slice(0, 3), p.stats.slice(3)].map((row: any[], ri: number) => (
              <div key={ri} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: ri === 0 ? `1px solid ${c.border}` : 'none', background: c.surface }}>
                {row.map((s: any, i: number) => (
                  <div key={i} style={{ padding: '8px 12px', borderRight: i < 2 ? `1px solid ${c.border}` : 'none', textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: c.text, lineHeight: 1 }}>{s.val}</div>
                    <div style={{ fontSize: 8, color: c.muted, letterSpacing: 1, marginTop: 3 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            ))}
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
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: c.muted }}>UPDATED: FEB 28, 2026</div>
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
              {['daily','weekly','monthly','yearly'].map(per => (
                <button key={per} onClick={() => setPeriod(per)} style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, letterSpacing: 1, padding: '4px 10px', background: period === per ? c.green : 'transparent', color: period === per ? '#090b0f' : c.muted, border: `1px solid ${period === per ? c.green : c.border}`, borderRadius: 2, cursor: 'pointer', textTransform: 'uppercase' }}>{per}</button>
              ))}
            </div>
          </div>
          <ScoreChart data={p.scoreHistory[period]} lineColor={c.green} />
        </div>

        {/* SCORE BREAKDOWN */}
        <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 4, padding: '20px 28px', marginBottom: 20 }}>
          <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: c.muted, letterSpacing: 3, marginBottom: 16 }}>[ SCORE BREAKDOWN ]</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {p.pillars.map((pl: any) => (
              <div key={pl.label} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: c.text, letterSpacing: 1, width: 110, flexShrink: 0 }}>{pl.label.toUpperCase()}</div>
                <div style={{ flex: 1, height: 6, background: c.border, borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${pl.score}%`, height: '100%', background: pl.color, borderRadius: 3 }} />
                </div>
                <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, color: pl.color, width: 36, textAlign: 'right', flexShrink: 0 }}>{pl.score}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CARD LISTINGS */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: c.text, letterSpacing: 3, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            CARD LISTINGS
            <span style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
              {(['COMMON','MID','RARE'] as const).map(tier => (
                <span key={tier} style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, color: tierBorder[tier] }}>
                  <span style={{ width: 8, height: 2, background: tierBorder[tier], display: 'inline-block', borderRadius: 1 }}></span>{tier}
                </span>
              ))}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {p.cards.map((card: any, i: number) => (
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
                {['CARD','GRADE','PRICE','DATE'].map(h => (
                  <th key={h} style={{ textAlign: 'left', color: c.muted, fontSize: 9, letterSpacing: 2, paddingBottom: 8, paddingRight: 16 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {p.sales.map((s: any, i: number) => (
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
        </div>

        {/* NEWS */}
        <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderLeft: `4px solid ${c.red}`, borderRadius: 4, padding: '20px 28px', marginBottom: 32 }}>
          <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: c.red, letterSpacing: 3, marginBottom: 14 }}>RECENT NEWS</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {p.news.map((n: any, i: number) => (
              <div key={i} style={{ padding: '12px 0', borderBottom: i < p.news.length - 1 ? `1px solid ${c.border}` : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 13, color: c.text, lineHeight: 1.5, marginBottom: 4 }}>{n.headline}</div>
                  <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: c.red }}>{n.source}</div>
                </div>
                <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: c.muted, whiteSpace: 'nowrap', flexShrink: 0 }}>{n.time}</div>
              </div>
            ))}
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