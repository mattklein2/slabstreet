'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';

const BG      = '#090b0f';
const GREEN   = '#00ff87';
const SURFACE = '#0d1117';
const BORDER  = '#1e2530';
const MUTED   = '#8899aa';
const TEXT    = '#e2e8f0';

const SIGNAL_OPTIONS   = ['BUY', 'HOLD', 'SELL'];
const POSITION_OPTIONS = ['GUARD', 'POINT GUARD', 'SHOOTING GUARD', 'SMALL FORWARD', 'POWER FORWARD', 'FORWARD', 'CENTER'];
const SPORT_OPTIONS    = ['NBA', 'NFL', 'F1', 'MLB', 'NHL'];

const BLANK_STAT = { label: '', val: '' };
const BLANK_CARD = { name: '', grade: 'PSA 10', pop: '', tier: 'COMMON', price: '', change: '', up: true };
const BLANK_SALE = { card: '', grade: 'PSA 10', price: '', date: '' };
const BLANK_ODD  = { market: '', book: '', odds: '' };
const BLANK_NEWS = { headline: '', source: '', time: '' };

const DEFAULT_PILLARS = [
  { label: 'Market',      score: 50, color: '#00ff87', key: 'market'      },
  { label: 'Scarcity',    score: 50, color: '#38bdf8', key: 'scarcity'    },
  { label: 'Momentum',    score: 50, color: '#a78bfa', key: 'momentum'    },
  { label: 'Performance', score: 50, color: '#fb923c', key: 'performance' },
  { label: 'Risk',        score: 50, color: '#4ade80', key: 'risk'        },
];

const DEFAULT_SCORE_HISTORY = {
  daily:   { labels: [], scores: [] },
  weekly:  { labels: [], scores: [] },
  monthly: { labels: [], scores: [] },
  yearly:  { labels: [], scores: [] },
};

function Input({ label, value, onChange, placeholder = '', type = 'text' }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: MUTED, letterSpacing: 2 }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 3, padding: '8px 12px', color: TEXT, fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, outline: 'none' }}
        onFocus={e => (e.target.style.borderColor = GREEN)}
        onBlur={e => (e.target.style.borderColor = BORDER)}
      />
    </div>
  );
}

function Select({ label, value, onChange, options }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: MUTED, letterSpacing: 2 }}>{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 3, padding: '8px 12px', color: TEXT, fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, outline: 'none' }}
      >
        {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: GREEN, letterSpacing: 3, borderBottom: `1px solid ${GREEN}`, paddingBottom: 6, marginTop: 8 }}>
      {title}
    </div>
  );
}

function AddRowBtn({ label, onClick }: any) {
  return (
    <button
      onClick={onClick}
      style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, letterSpacing: 1, padding: '6px 14px', background: 'transparent', color: GREEN, border: `1px solid ${GREEN}`, borderRadius: 2, cursor: 'pointer', marginTop: 4 }}
    >
      + {label}
    </button>
  );
}

function RemoveBtn({ onClick }: any) {
  return (
    <button
      onClick={onClick}
      style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: '#ff3b5c', border: '1px solid #ff3b5c33', background: 'transparent', borderRadius: 2, padding: '4px 8px', cursor: 'pointer', flexShrink: 0 }}
    >✕</button>
  );
}

export default function AdminPage() {
  const [name, setName]         = useState('');
  const [slug, setSlug]         = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [team, setTeam]         = useState('');
  const [position, setPosition] = useState('GUARD');
  const [number, setNumber]     = useState('');
  const [score, setScore]       = useState('50');
  const [signal, setSignal]     = useState('HOLD');
  const [sport, setSport]       = useState('NBA');

  const [pillars, setPillars]   = useState(DEFAULT_PILLARS.map(p => ({ ...p })));
  const [stats, setStats]       = useState([
    { label: 'PPG', val: '' }, { label: 'RPG', val: '' }, { label: 'APG', val: '' },
    { label: 'FG%', val: '' }, { label: 'GP',  val: '' },
  ]);
  const [cards, setCards]       = useState([{ ...BLANK_CARD }]);
  const [sales, setSales]       = useState([{ ...BLANK_SALE }]);
  const [odds, setOdds]         = useState([{ ...BLANK_ODD }]);
  const [news, setNews]         = useState([{ ...BLANK_NEWS }]);

  const [saving, setSaving]     = useState(false);
  const [status, setStatus]     = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  function handleNameChange(val: string) {
    setName(val);
    const parts = val.trim().split(' ');
    if (parts.length >= 2) {
      setFirstName(parts[0].toUpperCase());
      setLastName(parts.slice(1).join(' ').toUpperCase());
      setSlug(parts[parts.length - 1].toLowerCase().replace(/[^a-z0-9]/g, ''));
    }
  }

  function updateArr(arr: any[], setArr: any, i: number, field: string, val: any) {
    const next = [...arr];
    next[i] = { ...next[i], [field]: val };
    setArr(next);
  }

  async function handleSave() {
    if (!slug || !name || !team) {
      setStatus({ type: 'error', msg: 'Name, team, and slug are required.' });
      return;
    }
    setSaving(true);
    setStatus(null);

    const payload = {
      slug:             slug.toLowerCase().replace(/\s/g, '-'),
      name,
      first_name:       firstName,
      last_name:        lastName,
      last_name_search: lastName.toLowerCase(),
      full_name:        name,
      team:             team.toUpperCase(),
      position,
      number,
      score:            parseInt(score) || 50,
      signal,
      sport,
      pillars,
      stats,
      score_history:    DEFAULT_SCORE_HISTORY,
      cards:            cards.filter(c => c.name),
      sales:            sales.filter(s => s.card),
      fallback_odds:    odds.filter(o => o.market),
      news:             news.filter(n => n.headline),
      active:           true,
    };

    const { error } = await supabase.from('players').insert(payload);

    if (error) {
      setStatus({ type: 'error', msg: error.message });
    } else {
      setStatus({ type: 'success', msg: `✓ ${name} added successfully! View at /players/${payload.slug}` });
      setName(''); setSlug(''); setFirstName(''); setLastName(''); setTeam('');
      setPosition('GUARD'); setNumber(''); setScore('50'); setSignal('HOLD'); setSport('NBA');
      setPillars(DEFAULT_PILLARS.map(p => ({ ...p })));
      setStats([{ label: 'PPG', val: '' }, { label: 'RPG', val: '' }, { label: 'APG', val: '' }, { label: 'FG%', val: '' }, { label: 'GP', val: '' }]);
      setCards([{ ...BLANK_CARD }]);
      setSales([{ ...BLANK_SALE }]);
      setOdds([{ ...BLANK_ODD }]);
      setNews([{ ...BLANK_NEWS }]);
    }
    setSaving(false);
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, color: TEXT, fontFamily: 'IBM Plex Sans, sans-serif' }}>

      {/* NAV */}
      <nav style={{ borderBottom: `1px solid ${BORDER}`, padding: '0 24px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: BG, zIndex: 100 }}>
        <a href="/" style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, letterSpacing: 3, color: GREEN, textDecoration: 'none' }}>SLABSTREET</a>
        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: MUTED, letterSpacing: 2 }}>ADMIN · ADD PLAYER</span>
        <a href="/" style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: MUTED, textDecoration: 'none', letterSpacing: 1 }}>← Back to Home</a>
      </nav>

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* TITLE */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: MUTED, letterSpacing: 3, marginBottom: 8 }}>Player Management</div>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 48, letterSpacing: 2, color: TEXT, lineHeight: 1 }}>ADD NEW PLAYER</div>
        </div>

        {/* STATUS */}
        {status && (
          <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, padding: '12px 16px', borderRadius: 3, marginBottom: 24, background: status.type === 'success' ? `${GREEN}15` : '#ff3b5c15', border: `1px solid ${status.type === 'success' ? GREEN : '#ff3b5c'}`, color: status.type === 'success' ? GREEN : '#ff3b5c' }}>
            {status.msg}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* CORE INFO */}
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderTop: `3px solid ${GREEN}`, borderRadius: 4, padding: '24px' }}>
            <SectionHeader title="CORE INFO" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <Input label="FULL NAME" value={name} onChange={handleNameChange} placeholder="e.g. LeBron James" />
                <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, color: MUTED, marginTop: 4 }}>
                  Slug: <span style={{ color: GREEN }}>{slug || '—'}</span> · First: <span style={{ color: GREEN }}>{firstName || '—'}</span> · Last: <span style={{ color: GREEN }}>{lastName || '—'}</span>
                </div>
              </div>
              <Input label="TEAM (abbrev)" value={team} onChange={setTeam} placeholder="e.g. LAL" />
              <Input label="JERSEY #" value={number} onChange={setNumber} placeholder="e.g. 23" />
              <Select label="POSITION" value={position} onChange={setPosition} options={POSITION_OPTIONS} />
              <Select label="SPORT" value={sport} onChange={setSport} options={SPORT_OPTIONS} />
              <Input label="SLAB SCORE (0–100)" value={score} onChange={setScore} type="number" />
              <Select label="SIGNAL" value={signal} onChange={setSignal} options={SIGNAL_OPTIONS} />
            </div>
          </div>

          {/* PILLARS */}
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 4, padding: '24px' }}>
            <SectionHeader title="PILLAR SCORES" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
              {pillars.map((pl, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '130px 1fr 60px', gap: 10, alignItems: 'center' }}>
                  <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: pl.color, letterSpacing: 1 }}>{pl.label.toUpperCase()}</div>
                  <input
                    type="range" min={0} max={100} value={pl.score}
                    onChange={e => updateArr(pillars, setPillars, i, 'score', parseInt(e.target.value))}
                    style={{ accentColor: pl.color, cursor: 'pointer' }}
                  />
                  <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 24, color: pl.color, textAlign: 'center' }}>{pl.score}</div>
                </div>
              ))}
            </div>
          </div>

          {/* STATS */}
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 4, padding: '24px' }}>
            <SectionHeader title="SEASON STATS" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 16 }}>
              {stats.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                  <div style={{ flex: 1 }}>
                    <Input label="LABEL" value={s.label} onChange={(v: string) => updateArr(stats, setStats, i, 'label', v)} placeholder="PPG" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <Input label="VALUE" value={s.val} onChange={(v: string) => updateArr(stats, setStats, i, 'val', v)} placeholder="26.3" />
                  </div>
                  <RemoveBtn onClick={() => setStats(stats.filter((_, j) => j !== i))} />
                </div>
              ))}
            </div>
            <AddRowBtn label="ADD STAT" onClick={() => setStats([...stats, { ...BLANK_STAT }])} />
          </div>

          {/* CARDS */}
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 4, padding: '24px' }}>
            <SectionHeader title="CARD LISTINGS" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
              {cards.map((card, i) => (
                <div key={i} style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 3, padding: '14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <Input label="CARD NAME" value={card.name} onChange={(v: string) => updateArr(cards, setCards, i, 'name', v)} placeholder="2023-24 Prizm Base" />
                    <Input label="PRICE" value={card.price} onChange={(v: string) => updateArr(cards, setCards, i, 'price', v)} placeholder="$480" />
                    <Input label="GRADE" value={card.grade} onChange={(v: string) => updateArr(cards, setCards, i, 'grade', v)} placeholder="PSA 10" />
                    <Input label="POP" value={card.pop} onChange={(v: string) => updateArr(cards, setCards, i, 'pop', v)} placeholder="26,000" />
                    <Select label="TIER" value={card.tier} onChange={(v: string) => updateArr(cards, setCards, i, 'tier', v)} options={['COMMON', 'MID', 'RARE']} />
                    <Input label="7D CHANGE" value={card.change} onChange={(v: string) => updateArr(cards, setCards, i, 'change', v)} placeholder="▲ +5.3%" />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <RemoveBtn onClick={() => setCards(cards.filter((_, j) => j !== i))} />
                  </div>
                </div>
              ))}
            </div>
            <AddRowBtn label="ADD CARD" onClick={() => setCards([...cards, { ...BLANK_CARD }])} />
          </div>

          {/* SALES */}
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 4, padding: '24px' }}>
            <SectionHeader title="RECENT SALES" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
              {sales.map((s, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 90px 32px', gap: 10, alignItems: 'flex-end' }}>
                  <Input label="CARD" value={s.card} onChange={(v: string) => updateArr(sales, setSales, i, 'card', v)} placeholder="2023-24 Prizm Base" />
                  <Input label="GRADE" value={s.grade} onChange={(v: string) => updateArr(sales, setSales, i, 'grade', v)} placeholder="PSA 10" />
                  <Input label="PRICE" value={s.price} onChange={(v: string) => updateArr(sales, setSales, i, 'price', v)} placeholder="$480" />
                  <Input label="DATE" value={s.date} onChange={(v: string) => updateArr(sales, setSales, i, 'date', v)} placeholder="Mar 9" />
                  <RemoveBtn onClick={() => setSales(sales.filter((_, j) => j !== i))} />
                </div>
              ))}
            </div>
            <AddRowBtn label="ADD SALE" onClick={() => setSales([...sales, { ...BLANK_SALE }])} />
          </div>

          {/* ODDS */}
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 4, padding: '24px' }}>
            <SectionHeader title="FALLBACK ODDS" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
              {odds.map((o, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 80px 32px', gap: 10, alignItems: 'flex-end' }}>
                  <Input label="MARKET" value={o.market} onChange={(v: string) => updateArr(odds, setOdds, i, 'market', v)} placeholder="NBA MVP" />
                  <Input label="BOOK" value={o.book} onChange={(v: string) => updateArr(odds, setOdds, i, 'book', v)} placeholder="DraftKings" />
                  <Input label="ODDS" value={o.odds} onChange={(v: string) => updateArr(odds, setOdds, i, 'odds', v)} placeholder="-320" />
                  <RemoveBtn onClick={() => setOdds(odds.filter((_, j) => j !== i))} />
                </div>
              ))}
            </div>
            <AddRowBtn label="ADD LINE" onClick={() => setOdds([...odds, { ...BLANK_ODD }])} />
          </div>

          {/* NEWS */}
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 4, padding: '24px' }}>
            <SectionHeader title="FALLBACK NEWS" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
              {news.map((n, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 80px 32px', gap: 10, alignItems: 'flex-end' }}>
                  <Input label="HEADLINE" value={n.headline} onChange={(v: string) => updateArr(news, setNews, i, 'headline', v)} placeholder="Player drops 40 points..." />
                  <Input label="SOURCE" value={n.source} onChange={(v: string) => updateArr(news, setNews, i, 'source', v)} placeholder="ESPN" />
                  <Input label="TIME" value={n.time} onChange={(v: string) => updateArr(news, setNews, i, 'time', v)} placeholder="2h ago" />
                  <RemoveBtn onClick={() => setNews(news.filter((_, j) => j !== i))} />
                </div>
              ))}
            </div>
            <AddRowBtn label="ADD NEWS" onClick={() => setNews([...news, { ...BLANK_NEWS }])} />
          </div>

          {/* SAVE BUTTON */}
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 13, letterSpacing: 2, padding: '16px 32px', background: saving ? BORDER : GREEN, color: saving ? MUTED : '#090b0f', border: 'none', borderRadius: 3, cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 700, transition: 'all 0.2s' }}
          >
            {saving ? 'SAVING...' : '+ ADD PLAYER TO SLABSTREET'}
          </button>

        </div>
      </div>
    </div>
  );
}
