'use client';

import { useTheme } from './components/ThemeProvider';
import { LeagueProvider } from './components/LeagueProvider';
import FullSchedule from './components/widgets/FullSchedule';
import TradeSignals from './components/widgets/TradeSignals';
import RecentSales from './components/widgets/RecentSales';
import SportsNews from './components/widgets/SportsNews';
import CardNews from './components/widgets/CardNews';
import CatalystAlerts from './components/widgets/CatalystAlerts';

export default function HomePage() {
  const { colors: c } = useTheme();

  return (
    <LeagueProvider>
    <div className="min-h-screen" style={{ color: c.text }}>
      <main className="max-w-[1600px] mx-auto px-7 py-8 flex flex-col gap-6">
        {/* Row 1: Catalyst Alerts — 2-column undervalued/overvalued */}
        <CatalystAlerts />

        {/* Row 3: 3-column layout — Scores | News | Signals */}
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Left — Scores */}
          <div className="lg:w-[340px] lg:shrink-0">
            <div className="lg:sticky lg:top-[72px]">
              <FullSchedule />
            </div>
          </div>

          {/* Center — News */}
          <div className="flex-1 min-w-0">
            <SportsNews />
          </div>

          {/* Right — Signals */}
          <div className="lg:w-[380px] lg:shrink-0">
            <TradeSignals />
          </div>
        </div>

        {/* Row 3: Recent Sales — horizontal strip */}
        <RecentSales />

        {/* Row 4: Card News — grid */}
        <CardNews />
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
