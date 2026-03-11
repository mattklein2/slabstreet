'use client';

import { LeagueProvider } from './LeagueProvider';
import { useTheme } from './ThemeProvider';
import MarketMovers from './widgets/MarketMovers';
import FullSchedule from './widgets/FullSchedule';
import ChampionshipOdds from './widgets/ChampionshipOdds';
import SportsNews from './widgets/SportsNews';
import TradeSignals from './widgets/TradeSignals';
import RecentSales from './widgets/RecentSales';
import CardNews from './widgets/CardNews';
import F1Results from './widgets/F1Results';
import { getLeagueConfig, ALL_ACCENT_COLOR } from '@/lib/leagues';
import type { LeagueId } from '@/lib/leagues';

function LeaguePageInner({ leagueId }: { leagueId: string }) {
  const { colors: c } = useTheme();
  const isF1 = leagueId === 'F1';
  const accentColor = leagueId === 'ALL'
    ? ALL_ACCENT_COLOR
    : getLeagueConfig(leagueId).accentColor;

  return (
    <div className="min-h-screen" style={{ color: c.text }}>
      {/* League accent bar */}
      <div style={{ height: 3, background: accentColor }} />

      <main className="max-w-[1800px] mx-auto px-8 md:px-12 lg:px-16 py-6 flex flex-col gap-5">
        {/* Row 1: Market Movers or F1Results — full width, always on top */}
        {isF1 ? <F1Results /> : <MarketMovers />}

        {/* Row 2+: Sidebar + main content */}
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Left sidebar — hidden on mobile, visible on lg+ */}
          <div className="hidden lg:block lg:w-[300px] lg:shrink-0">
            <div className="lg:sticky lg:top-4 flex flex-col gap-5">
              <FullSchedule />
              <ChampionshipOdds />
            </div>
          </div>

          {/* Main content stream */}
          <div className="flex-1 min-w-0 flex flex-col gap-5">
            <div className={`grid grid-cols-1 ${!isF1 ? 'lg:grid-cols-2' : ''} gap-5`}>
              <SportsNews />
              {!isF1 && <TradeSignals />}
            </div>

            <RecentSales />
            <CardNews />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="mt-10 py-8 px-6 text-center"
        style={{ borderTop: `1px solid ${c.border}`, background: c.surface }}
      >
        <div className="font-display text-xl tracking-[3px] mb-1.5" style={{ color: c.green }}>
          SLABSTREET
        </div>
        <div className="font-body text-[10px]" style={{ color: c.muted }}>
          © 2026 Slab Street · slabstreet.io · All rights reserved
        </div>
      </footer>
    </div>
  );
}

export default function LeaguePage({ leagueId }: { leagueId: string }) {
  return (
    <LeagueProvider initialLeague={leagueId as LeagueId}>
      <LeaguePageInner leagueId={leagueId} />
    </LeagueProvider>
  );
}
