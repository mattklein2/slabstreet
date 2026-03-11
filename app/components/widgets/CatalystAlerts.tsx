'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '../ThemeProvider';
import { useLeague } from '../LeagueProvider';
import WidgetShell, { WidgetSkeleton, WidgetError, WidgetEmpty } from './WidgetShell';

type CatalystPlayer = {
  name: string;
  slug: string;
  team: string;
  league: string;
  score: number;
  catalystScore: number;
  signal: 'BUY' | 'SELL';
  blurb: string;
  factors: {
    performanceBreakout: number;
    teamTrajectory: number;
    marketLag: number;
    youthPremium: number;
    opportunityChange: number;
  };
  marketData: {
    weeklyChange: number | null;
    monthlyChange: number | null;
    sales24h: number | null;
    marketCap: string | null;
  };
};

const FACTOR_LABELS: Record<string, string> = {
  performanceBreakout: 'Performance',
  teamTrajectory: 'Team',
  marketLag: 'Market Lag',
  youthPremium: 'Youth',
  opportunityChange: 'Opportunity',
};

const FACTOR_MAX: Record<string, number> = {
  performanceBreakout: 25,
  teamTrajectory: 25,
  marketLag: 25,
  youthPremium: 15,
  opportunityChange: 10,
};

function CatalystRow({ player }: { player: CatalystPlayer }) {
  const { colors: c } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const isBuy = player.signal === 'BUY';
  const accent = isBuy ? '#00ff87' : '#ff3b5c';

  // Top factor for compact display
  const topFactor = Object.entries(player.factors)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a)[0];

  return (
    <div
      style={{
        background: c.surface,
        border: `1px solid ${c.border}`,
        borderRadius: 14,
        overflow: 'hidden',
      }}
    >
      {/* Main row — clickable to player page */}
      <div className="flex items-start gap-3" style={{ padding: '14px 18px' }}>
        {/* Catalyst score badge */}
        <div
          className="flex flex-col items-center justify-center shrink-0"
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: `${accent}14`,
            border: `1px solid ${accent}30`,
          }}
        >
          <div className="font-mono text-[15px] font-bold leading-none" style={{ color: accent }}>
            {player.catalystScore}
          </div>
          <div className="font-body text-[7px] uppercase tracking-wider mt-0.5" style={{ color: `${accent}99` }}>
            CAT
          </div>
        </div>

        {/* Player info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <a
              href={`/players/${player.slug}`}
              className="font-body text-[13px] font-semibold no-underline hover:underline truncate"
              style={{ color: c.text }}
            >
              {player.name}
            </a>
            <span
              className="font-mono text-[9px] font-bold px-1.5 py-0.5 shrink-0"
              style={{
                borderRadius: 5,
                background: `${accent}18`,
                color: accent,
              }}
            >
              {player.signal}
            </span>
          </div>
          <div className="font-body text-[10px] mb-1.5" style={{ color: c.muted }}>
            {player.team} · {player.league}
            {player.marketData.marketCap && ` · ${player.marketData.marketCap}`}
          </div>
          {/* Blurb */}
          <div className="font-body text-[11px] leading-relaxed" style={{ color: c.text, opacity: 0.85 }}>
            {player.blurb}
          </div>
        </div>

        {/* Expand button */}
        <button
          onClick={(e) => { e.preventDefault(); setExpanded(!expanded); }}
          className="shrink-0 cursor-pointer"
          style={{
            background: 'none',
            border: 'none',
            color: c.muted,
            fontSize: 12,
            padding: '4px 2px',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s',
          }}
        >
          ▼
        </button>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ padding: '0 18px 14px', borderTop: `1px solid ${c.border}` }}>
          <div className="font-body text-[9px] font-medium tracking-widest uppercase mt-3 mb-2" style={{ color: c.muted }}>
            CATALYST BREAKDOWN
          </div>
          <div className="flex flex-col gap-1.5">
            {Object.entries(player.factors)
              .filter(([, v]) => v > 0)
              .sort(([, a], [, b]) => b - a)
              .map(([key, val]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className="font-body text-[10px] w-[72px] shrink-0" style={{ color: c.muted }}>
                    {FACTOR_LABELS[key]}
                  </div>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: c.border }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(val / FACTOR_MAX[key]) * 100}%`,
                        background: accent,
                        opacity: 0.7,
                      }}
                    />
                  </div>
                  <div className="font-mono text-[10px] w-[28px] text-right" style={{ color: accent }}>
                    {val}
                  </div>
                </div>
              ))}
          </div>
          {/* Market data row */}
          <div className="flex gap-4 mt-3 pt-2" style={{ borderTop: `1px solid ${c.border}` }}>
            {player.marketData.weeklyChange !== null && (
              <div className="font-body text-[10px]" style={{ color: c.muted }}>
                Week: <span style={{ color: player.marketData.weeklyChange >= 0 ? '#00ff87' : '#ff3b5c' }}>
                  {player.marketData.weeklyChange >= 0 ? '+' : ''}{player.marketData.weeklyChange.toFixed(1)}%
                </span>
              </div>
            )}
            {player.marketData.monthlyChange !== null && (
              <div className="font-body text-[10px]" style={{ color: c.muted }}>
                Month: <span style={{ color: player.marketData.monthlyChange >= 0 ? '#00ff87' : '#ff3b5c' }}>
                  {player.marketData.monthlyChange >= 0 ? '+' : ''}{player.marketData.monthlyChange.toFixed(1)}%
                </span>
              </div>
            )}
            {player.marketData.sales24h !== null && (
              <div className="font-body text-[10px]" style={{ color: c.muted }}>
                24h Sales: <span style={{ color: c.text }}>{player.marketData.sales24h}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CatalystAlerts() {
  const { colors: c } = useTheme();
  const { activeLeague } = useLeague();
  const [buys, setBuys] = useState<CatalystPlayer[]>([]);
  const [sells, setSells] = useState<CatalystPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState<'buy' | 'sell'>('buy');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch('/api/catalysts');
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        setBuys(data.buys || []);
        setSells(data.sells || []);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter by active league
  const filteredBuys = activeLeague === 'ALL' ? buys : buys.filter(p => p.league === activeLeague);
  const filteredSells = activeLeague === 'ALL' ? sells : sells.filter(p => p.league === activeLeague);
  const players = tab === 'buy' ? filteredBuys : filteredSells;

  const toggleBadge = (
    <div className="flex gap-2">
      <button
        onClick={() => setTab('buy')}
        className="font-body text-[10px] font-medium px-2.5 py-1 cursor-pointer"
        style={{
          borderRadius: 6,
          color: tab === 'buy' ? c.green : c.muted,
          background: tab === 'buy' ? `${c.green}12` : 'transparent',
          border: `1px solid ${tab === 'buy' ? c.green : c.border}`,
        }}
      >
        UNDERVALUED
      </button>
      <button
        onClick={() => setTab('sell')}
        className="font-body text-[10px] font-medium px-2.5 py-1 cursor-pointer"
        style={{
          borderRadius: 6,
          color: tab === 'sell' ? c.red : c.muted,
          background: tab === 'sell' ? `${c.red}12` : 'transparent',
          border: `1px solid ${tab === 'sell' ? c.red : c.border}`,
        }}
      >
        OVERVALUED
      </button>
    </div>
  );

  return (
    <WidgetShell
      title="CATALYST ALERTS"
      icon="🔬"
      accentColor={c.green}
      badge={toggleBadge}
      minContentHeight={200}
    >
      {loading && <WidgetSkeleton rows={4} />}
      {error && <WidgetError message="Unable to load catalyst data" />}
      {!loading && !error && players.length === 0 && (
        <WidgetEmpty message="No catalyst alerts right now" />
      )}
      {!loading && !error && players.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="font-body text-[10px] leading-relaxed" style={{ color: c.muted, marginBottom: 2 }}>
            {tab === 'buy'
              ? 'Players with real-world catalysts the card market hasn\'t priced in yet.'
              : 'Players whose market activity may not be justified by current performance.'}
          </div>
          {players.map((p) => (
            <CatalystRow key={p.slug} player={p} />
          ))}
        </div>
      )}
    </WidgetShell>
  );
}
