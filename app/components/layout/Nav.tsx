'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '../ThemeProvider';
import NavSearch from '../NavSearch';
import { getAllLeagueIds, getLeagueConfig, ALL_ACCENT_COLOR } from '@/lib/leagues';
import type { LeagueId } from '@/lib/leagues';

type LeagueFilter = 'ALL' | LeagueId;
const TABS: LeagueFilter[] = ['ALL', ...getAllLeagueIds()];

function getTabHref(tab: LeagueFilter): string {
  return tab === 'ALL' ? '/' : `/${tab.toLowerCase()}`;
}

export default function Nav() {
  const { theme, toggle, colors: c } = useTheme();
  const pathname = usePathname();

  function isActive(tab: LeagueFilter): boolean {
    if (tab === 'ALL') return pathname === '/';
    return pathname === `/${tab.toLowerCase()}`;
  }

  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-between"
      style={{
        background: c.bg,
        borderBottom: `1px solid ${c.border}`,
        height: 56,
        padding: '0 32px',
      }}
    >
      {/* Left: Logo */}
      <div className="flex items-center shrink-0">
        <a href="/" className="no-underline">
          <span
            className="font-display text-[20px] tracking-[3px]"
            style={{ color: c.text }}
          >
            SLAB<span style={{ color: c.green }}>STREET</span>
          </span>
        </a>
      </div>

      {/* Center: League Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto">
        {TABS.map((tab) => {
          const active = isActive(tab);
          return (
            <Link
              key={tab}
              href={getTabHref(tab)}
              className="shrink-0 font-body no-underline whitespace-nowrap transition-all duration-150"
              style={{
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: 1.5,
                fontWeight: 500,
                padding: '6px 14px',
                borderRadius: 8,
                cursor: 'pointer',
                color: active ? c.green : c.muted,
                background: active ? `${c.green}12` : 'transparent',
              }}
            >
              {tab}
            </Link>
          );
        })}
      </div>

      {/* Right: Search + Live + Toggle */}
      <div className="flex items-center gap-4 shrink-0">
        <NavSearch />
        <div
          className="flex items-center gap-1.5 font-body text-[9px] font-medium tracking-wider"
          style={{ color: c.green }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full inline-block"
            style={{ background: c.green, animation: 'pulse 1.5s ease-in-out infinite' }}
          />
          LIVE
        </div>
        <button
          onClick={toggle}
          title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          className="flex items-center h-6 w-11 rounded-full px-0.5 cursor-pointer shrink-0 transition-all duration-200"
          style={{ background: c.surface, border: `1px solid ${c.border}` }}
        >
          <div
            className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] transition-transform duration-200"
            style={{
              background: c.green,
              transform: theme === 'dark' ? 'translateX(0)' : 'translateX(20px)',
            }}
          >
            {theme === 'dark' ? '🌙' : '☀️'}
          </div>
        </button>
      </div>
    </nav>
  );
}
