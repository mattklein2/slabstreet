'use client';

import { useTheme } from './components/ThemeProvider';
import { LeagueProvider } from './components/LeagueProvider';
import Ticker from './components/layout/Ticker';
import Nav from './components/layout/Nav';
import LeagueTabs from './components/layout/LeagueTabs';
import MarketMovers from './components/widgets/MarketMovers';
import TodaysGames from './components/widgets/TodaysGames';
import TradeSignals from './components/widgets/TradeSignals';
import CardNews from './components/widgets/CardNews';

export default function HomePage() {
  const { colors: c } = useTheme();

  return (
    <LeagueProvider>
    <div className="min-h-screen" style={{ color: c.text, fontFamily: 'var(--body)' }}>
      <Ticker />
      <Nav />
      <LeagueTabs />

      {/* Widget Grid */}
      <main className="max-w-[1400px] mx-auto px-6 py-4 flex flex-col gap-3">
        {/* Row 1: Market Movers — full width */}
        <MarketMovers />

        {/* Row 2: Games + Signals — side by side on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <TodaysGames />
          <TradeSignals />
        </div>

        {/* Row 3: News — full width */}
        <CardNews />
      </main>

      {/* Footer */}
      <footer
        className="mt-8 py-6 px-6 text-center"
        style={{ borderTop: `1px solid ${c.border}`, background: c.surface }}
      >
        <div className="font-display text-xl tracking-[3px] mb-1.5" style={{ color: c.green }}>
          SLABSTREET
        </div>
        <div className="font-mono text-[10px]" style={{ color: c.muted }}>
          © 2026 Slab Street · slabstreet.io · All rights reserved
        </div>
      </footer>
    </div>
    </LeagueProvider>
  );
}
