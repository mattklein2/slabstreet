'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '../ThemeProvider';
import { getAllLeagueIds, getLeagueConfig, ALL_ACCENT_COLOR } from '@/lib/leagues';
import type { LeagueId } from '@/lib/leagues';

type LeagueFilter = 'ALL' | LeagueId;

const TABS: LeagueFilter[] = ['ALL', ...getAllLeagueIds()];

function getTabHref(tab: LeagueFilter): string {
  return tab === 'ALL' ? '/' : `/${tab.toLowerCase()}`;
}

function getAccentColor(tab: LeagueFilter): string {
  return tab === 'ALL' ? ALL_ACCENT_COLOR : getLeagueConfig(tab).accentColor;
}

export default function LeagueTabs() {
  const { colors: c } = useTheme();
  const pathname = usePathname();

  function isActive(tab: LeagueFilter): boolean {
    if (tab === 'ALL') return pathname === '/';
    return pathname === `/${tab.toLowerCase()}`;
  }

  return (
    <div
      className="flex items-center overflow-x-auto px-6"
      style={{ background: c.bg, borderBottom: `2px solid ${c.border}` }}
    >
      {TABS.map((tab) => {
        const active = isActive(tab);
        const accentColor = getAccentColor(tab);
        return (
          <Link
            key={tab}
            href={getTabHref(tab)}
            className="shrink-0 font-body tracking-widest uppercase cursor-pointer whitespace-nowrap no-underline transition-colors duration-150"
            style={{
              fontSize: '13px',
              fontWeight: active ? 700 : 500,
              padding: '12px 20px',
              color: active ? accentColor : c.muted,
              borderBottom: active ? `3px solid ${accentColor}` : '3px solid transparent',
              marginBottom: '-2px',
              display: 'inline-block',
            }}
          >
            {tab}
          </Link>
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
