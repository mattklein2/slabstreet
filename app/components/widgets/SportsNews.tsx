'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '../ThemeProvider';
import { useLeague } from '../LeagueProvider';
import WidgetShell, { WidgetSkeleton, WidgetError, WidgetEmpty } from './WidgetShell';
import SportsNewsRow from './SportsNewsRow';

type SportsNewsItem = {
  title: string;
  link: string;
  source: string;
  time: string;
  league: string;
  blurb?: string | null;
};

export default function SportsNews() {
  const { colors: c } = useTheme();
  const { activeLeague } = useLeague();
  const [news, setNews] = useState<SportsNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(false);
      try {
        // Try blurbs endpoint first (includes AI summaries when available)
        const res = await fetch(`/api/news/blurbs?league=${activeLeague}&limit=10`);
        const data = await res.json();
        setNews(data.news || []);
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
      title="SPORTS NEWS"
      icon="📰"
      accentColor={c.green}
    >
      {loading && <WidgetSkeleton rows={4} />}
      {error && <WidgetError message="Unable to load sports news" />}
      {!loading && !error && news.length === 0 && (
        <WidgetEmpty message={`No recent ${leagueLabel}sports news`} />
      )}
      {!loading && !error && news.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {news.map((item, i) => (
            <SportsNewsRow key={i} {...item} featured={i === 0} />
          ))}
        </div>
      )}
    </WidgetShell>
  );
}
