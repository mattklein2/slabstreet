'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '../ThemeProvider';
import { useLeague } from '../LeagueProvider';
import WidgetShell, { WidgetSkeleton, WidgetError, WidgetEmpty } from './WidgetShell';

type FuturesEntry = {
  team: string;
  odds: number;
  impliedProb: number;
};

function formatOdds(odds: number): string {
  return odds > 0 ? `+${odds}` : `${odds}`;
}

function formatPercent(prob: number): string {
  return `${(prob * 100).toFixed(1)}%`;
}

export default function ChampionshipOdds() {
  const { colors: c } = useTheme();
  const { activeLeague } = useLeague();
  const [futures, setFutures] = useState<FuturesEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(false);
      try {
        const league = activeLeague === 'ALL' ? 'NBA' : activeLeague;
        const res = await fetch(`/api/odds/futures?league=${league}&limit=10`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setFutures(data.futures || []);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [activeLeague]);

  // Find the max implied probability for scaling bars
  const maxProb = futures.length > 0 ? futures[0].impliedProb : 1;

  return (
    <WidgetShell
      title="CHAMPIONSHIP ODDS"
      icon="🏆"
      accentColor={c.amber}
    >
      {loading && <WidgetSkeleton rows={5} />}
      {error && <WidgetError message="Unable to load championship odds" />}
      {!loading && !error && futures.length === 0 && (
        <WidgetEmpty message="No championship odds available" />
      )}
      {!loading && !error && futures.length > 0 && (
        <div className="flex flex-col gap-2">
          {futures.map((entry, i) => {
            const barColor = i < 3 ? c.green : c.cyan;
            // Scale bar width relative to the top favorite, minimum 4% for visibility
            const barWidthPct = Math.max(4, (entry.impliedProb / maxProb) * 100);

            return (
              <div
                key={entry.team}
                className="flex items-center gap-3 rounded"
                style={{
                  background: c.bg,
                  border: `1px solid ${c.border}`,
                  padding: '10px 20px',
                }}
              >
                {/* Team name */}
                <span
                  className="font-body text-[13px] font-medium shrink-0"
                  style={{ color: c.text, minWidth: '140px' }}
                >
                  {entry.team}
                </span>

                {/* Odds badge */}
                <span
                  className="font-mono text-[10px] shrink-0 px-1.5 py-0.5 rounded"
                  style={{
                    color: entry.odds > 0 ? c.green : c.red,
                    background: c.surface,
                    border: `1px solid ${c.border}`,
                  }}
                >
                  {formatOdds(entry.odds)}
                </span>

                {/* Probability bar */}
                <div
                  className="flex-1 h-2 rounded-full overflow-hidden"
                  style={{ background: c.border }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${barWidthPct}%`,
                      background: barColor,
                    }}
                  />
                </div>

                {/* Percentage text */}
                <span
                  className="font-mono text-[10px] shrink-0"
                  style={{ color: c.muted, minWidth: '36px', textAlign: 'right' }}
                >
                  {formatPercent(entry.impliedProb)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </WidgetShell>
  );
}
