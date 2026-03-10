'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useTheme } from '../ThemeProvider';
import { useLeague } from '../LeagueProvider';
import WidgetShell, { WidgetSkeleton, WidgetError, WidgetEmpty } from './WidgetShell';
import SignalRow from './SignalRow';

type Signal = {
  name: string;
  slug: string;
  team: string;
  score: number;
  signal: string;
  league: string;
};

export default function TradeSignals() {
  const { colors: c } = useTheme();
  const { activeLeague } = useLeague();
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(false);
      try {
        let query = supabase
          .from('players')
          .select('name, slug, team, score, signal, league')
          .eq('active', true)
          .in('signal', ['BUY', 'SELL', 'HOLD'])
          .order('score', { ascending: false })
          .limit(6);

        if (activeLeague !== 'ALL') {
          query = query.eq('league', activeLeague);
        }

        const { data } = await query;
        setSignals(data || []);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [activeLeague]);

  const leagueLabel = activeLeague === 'ALL' ? '' : `${activeLeague} `;

  return (
    <WidgetShell
      title="TRADE SIGNALS"
      icon="⚡"
      accentColor={c.orange}
      viewAllLabel="All Signals →"
    >
      {loading && <WidgetSkeleton rows={3} />}
      {error && <WidgetError message="Unable to load signals" />}
      {!loading && !error && signals.length === 0 && (
        <WidgetEmpty message={`No ${leagueLabel}signals right now`} />
      )}
      {!loading && !error && signals.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {signals.map((s) => (
            <SignalRow key={s.slug} {...s} />
          ))}
        </div>
      )}
    </WidgetShell>
  );
}
