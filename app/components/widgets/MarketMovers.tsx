'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useTheme } from '../ThemeProvider';
import { useLeague } from '../LeagueProvider';
import WidgetShell, { WidgetSkeleton, WidgetError, WidgetEmpty } from './WidgetShell';
import MoverCard from './MoverCard';

type Mover = {
  name: string;
  slug: string;
  team: string;
  score: number;
  signal: string;
  league: string;
};

export default function MarketMovers() {
  const { colors: c } = useTheme();
  const { activeLeague } = useLeague();
  const [risers, setRisers] = useState<Mover[]>([]);
  const [fallers, setFallers] = useState<Mover[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showRisers, setShowRisers] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(false);
      try {
        let riserQuery = supabase
          .from('players')
          .select('name, slug, team, score, signal, league')
          .eq('active', true)
          .eq('signal', 'BUY')
          .order('score', { ascending: false })
          .limit(5);

        let fallerQuery = supabase
          .from('players')
          .select('name, slug, team, score, signal, league')
          .eq('active', true)
          .eq('signal', 'SELL')
          .order('score', { ascending: true })
          .limit(5);

        if (activeLeague !== 'ALL') {
          riserQuery = riserQuery.eq('league', activeLeague);
          fallerQuery = fallerQuery.eq('league', activeLeague);
        }

        const [r, f] = await Promise.all([riserQuery, fallerQuery]);
        setRisers(r.data || []);
        setFallers(f.data || []);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [activeLeague]);

  const movers = showRisers ? risers : fallers;
  const leagueLabel = activeLeague === 'ALL' ? '' : `${activeLeague} `;

  const toggleBadge = (
    <div className="flex gap-2">
      <button
        onClick={() => setShowRisers(true)}
        className="font-mono text-[10px] px-2 py-0.5 rounded cursor-pointer bg-transparent"
        style={{
          color: showRisers ? c.green : c.muted,
          border: `1px solid ${showRisers ? c.green : c.border}`,
        }}
      >
        RISERS
      </button>
      <button
        onClick={() => setShowRisers(false)}
        className="font-mono text-[10px] px-2 py-0.5 rounded cursor-pointer bg-transparent"
        style={{
          color: !showRisers ? c.red : c.muted,
          border: `1px solid ${!showRisers ? c.red : c.border}`,
        }}
      >
        FALLERS
      </button>
    </div>
  );

  return (
    <WidgetShell
      title="MARKET MOVERS"
      icon="📈"
      accentColor={c.green}
      badge={toggleBadge}
    >
      {loading && <WidgetSkeleton rows={1} />}
      {error && <WidgetError message="Unable to load market movers" />}
      {!loading && !error && movers.length === 0 && (
        <WidgetEmpty message={`No ${leagueLabel}movers data available`} />
      )}
      {!loading && !error && movers.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:overflow-x-visible md:gap-4">
          {movers.map((m) => (
            <div key={m.slug} className="min-w-[160px] md:min-w-0 shrink-0 md:shrink">
              <MoverCard {...m} />
            </div>
          ))}
        </div>
      )}
    </WidgetShell>
  );
}
