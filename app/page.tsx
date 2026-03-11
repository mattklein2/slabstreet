'use client';

import { useTheme } from './components/ThemeProvider';
import { LeagueProvider } from './components/LeagueProvider';
import MarketMovers from './components/widgets/MarketMovers';
import FullSchedule from './components/widgets/FullSchedule';
import TradeSignals from './components/widgets/TradeSignals';
import RecentSales from './components/widgets/RecentSales';
import SportsNews from './components/widgets/SportsNews';
import CardNews from './components/widgets/CardNews';

export default function HomePage() {
  const { colors: c } = useTheme();

  return (
    <LeagueProvider>
    <div className="min-h-screen" style={{ color: c.text }}>
      <main className="max-w-[1800px] mx-auto px-8 md:px-12 lg:px-16 py-6 flex flex-col gap-5">
        {/* Row 1: Market Movers — full width, always on top */}
        <MarketMovers />

        {/* Row 2+: Scores sidebar + main content */}
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Left sidebar — Scores */}
          <div className="lg:w-[300px] lg:shrink-0">
            <div className="lg:sticky lg:top-4">
              <FullSchedule />
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0 flex flex-col gap-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <SportsNews />
              <TradeSignals />
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
    </LeagueProvider>
  );
}
