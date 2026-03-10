'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '../ThemeProvider';
import { useLeague } from '../LeagueProvider';
import WidgetShell, { WidgetSkeleton, WidgetError, WidgetEmpty } from './WidgetShell';
import NewsCard from './NewsCard';

type NewsItem = {
  headline: string;
  source: string;
  url: string;
  category: string;
  time: string;
};

export default function CardNews() {
  const { colors: c } = useTheme();
  const { activeLeague } = useLeague();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch('/api/news/cards');
        const data = await res.json();
        setNews(data.news || []);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // News API doesn't support league filtering yet — show all news for now
  // Future: add league param to /api/news/cards
  const displayed = news.slice(0, 4);
  const leagueLabel = activeLeague === 'ALL' ? '' : `${activeLeague} `;

  return (
    <WidgetShell
      title="CARD MARKET NEWS"
      icon="📰"
      accentColor={c.purple}
      viewAllLabel="All News →"
    >
      {loading && <WidgetSkeleton rows={2} />}
      {error && <WidgetError message="Unable to load news" />}
      {!loading && !error && displayed.length === 0 && (
        <WidgetEmpty message={`No recent ${leagueLabel}news`} />
      )}
      {!loading && !error && displayed.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayed.map((n, i) => (
            <NewsCard key={i} {...n} />
          ))}
        </div>
      )}
    </WidgetShell>
  );
}
