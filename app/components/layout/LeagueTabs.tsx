'use client';

import { useTheme } from '../ThemeProvider';
import { useLeague } from '../LeagueProvider';
import { getAllLeagueIds } from '@/lib/leagues';
import type { LeagueId } from '@/lib/leagues';

type LeagueFilter = 'ALL' | LeagueId;

const TABS: LeagueFilter[] = ['ALL', ...getAllLeagueIds()];

export default function LeagueTabs() {
  const { colors: c } = useTheme();
  const { activeLeague, setActiveLeague } = useLeague();

  return (
    <div
      className="flex items-center overflow-x-auto px-6"
      style={{ background: c.bg, borderBottom: `2px solid ${c.border}` }}
    >
      {TABS.map((tab) => {
        const isActive = tab === activeLeague;
        return (
          <button
            key={tab}
            onClick={() => setActiveLeague(tab)}
            className="shrink-0 font-body text-[11px] font-medium tracking-widest uppercase px-4 py-2.5 cursor-pointer bg-transparent border-none transition-colors duration-150 whitespace-nowrap"
            style={{
              color: isActive ? c.green : c.muted,
              borderBottom: isActive ? `2px solid ${c.green}` : '2px solid transparent',
              marginBottom: '-2px',
            }}
          >
            {tab}
          </button>
        );
      })}
      {/* Spacer + LIVE indicator */}
      <div className="flex-1" />
      <div
        className="flex items-center gap-1.5 font-body text-[10px] font-medium tracking-wider shrink-0 py-2.5"
        style={{ color: c.green }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full inline-block"
          style={{ background: c.green, animation: 'pulse 1.5s ease-in-out infinite' }}
        />
        LIVE DATA
      </div>
    </div>
  );
}
