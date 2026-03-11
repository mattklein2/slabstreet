'use client';

import { useTheme } from './components/ThemeProvider';
import { LeagueProvider } from './components/LeagueProvider';
import Ticker from './components/layout/Ticker';
import Nav from './components/layout/Nav';
import LeagueTabs from './components/layout/LeagueTabs';
import MarketMovers from './components/widgets/MarketMovers';
import FullSchedule from './components/widgets/FullSchedule';
import TradeSignals from './components/widgets/TradeSignals';
import ChampionshipOdds from './components/widgets/ChampionshipOdds';
import RecentSales from './components/widgets/RecentSales';
import SportsNews from './components/widgets/SportsNews';
import CardNews from './components/widgets/CardNews';

export default function HomePage() {
  const { colors: c } = useTheme();

  return (
    <LeagueProvider>
    <div className="min-h-screen" style={{ color: c.text }}>
      <Ticker />
      <Nav />
      <LeagueTabs />

      {/* Widget Grid — 5 rows, scrollable */}
      <main className="max-w-[1800px] mx-auto px-8 md:px-12 lg:px-16 py-6 flex flex-col gap-5">
        {/* Row 1: Market Movers — full width horizontal scroll */}
        <MarketMovers />

        {/* Row 2: Full Schedule — full width with date nav + league tabs */}
        <FullSchedule />

        {/* Row 3: Trade Signals + Championship Odds — side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <TradeSignals />
          <ChampionshipOdds />
        </div>

        {/* Row 4: Recent eBay Sales — full width horizontal scroll */}
        <RecentSales />

        {/* Row 5: Sports News + Card Market News — side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <SportsNews />
          <CardNews />
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
