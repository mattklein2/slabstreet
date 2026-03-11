'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '../ThemeProvider';
import { useLeague } from '../LeagueProvider';
import WidgetShell, { WidgetSkeleton, WidgetError, WidgetEmpty } from './WidgetShell';
import SaleCard from './SaleCard';

type Sale = {
  playerName: string;
  playerSlug: string;
  title: string;
  price: number;
  date: string;
  imageUrl: string;
  league: string;
};

type SalesStats = {
  totalSales: number;
  avgPrice: number;
  topSale: { price: number };
};

type SalesResponse = {
  sales: Sale[];
  stats: SalesStats;
  cached: boolean;
};

export default function RecentSales() {
  const { colors: c } = useTheme();
  const { activeLeague } = useLeague();
  const [sales, setSales] = useState<Sale[]>([]);
  const [stats, setStats] = useState<SalesStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(
          `/api/ebay/recent-sales?league=${activeLeague}&limit=20`
        );
        if (!res.ok) throw new Error('Failed to fetch');
        const data: SalesResponse = await res.json();
        setSales(data.sales || []);
        setStats(data.stats || null);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [activeLeague]);

  const statsBadge = stats ? (
    <span className="font-body text-[11px]" style={{ color: c.muted }}>
      {stats.totalSales} sales{' · '}Avg ${stats.avgPrice.toFixed(2)}{' · '}
      Top{' '}
      <span style={{ color: c.green }}>${stats.topSale.price.toFixed(2)}</span>
    </span>
  ) : null;

  return (
    <WidgetShell
      title="RECENT EBAY SALES"
      icon="🏷️"
      accentColor={c.orange}
      badge={statsBadge}
    >
      {loading && <WidgetSkeleton rows={1} />}
      {error && <WidgetError message="Unable to load recent sales" />}
      {!loading && !error && sales.length === 0 && (
        <WidgetEmpty message="No recent card sales found" />
      )}
      {!loading && !error && sales.length > 0 && (
        <div
          className="flex gap-3 overflow-x-auto pb-2"
          style={{ scrollbarWidth: 'thin' }}
        >
          {sales.map((s, i) => (
            <div key={`${s.playerSlug}-${s.date}-${i}`} className="shrink-0">
              <SaleCard {...s} />
            </div>
          ))}
        </div>
      )}
    </WidgetShell>
  );
}
