'use client';

import { useTheme } from '../ThemeProvider';
import NavSearch from '../NavSearch';

export default function Nav() {
  const { theme, toggle, colors: c } = useTheme();

  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-between px-6 h-14"
      style={{
        background: c.bg,
        borderBottom: `1px solid ${c.border}`,
      }}
    >
      {/* Left: Logo + tagline */}
      <div className="flex items-center gap-4">
        <a href="/" className="no-underline">
          <span
            className="font-display text-[22px] tracking-[3px]"
            style={{ color: c.green }}
          >
            SLABSTREET
          </span>
        </a>
        <span
          className="hidden md:block font-mono text-[9px] tracking-wider pl-4"
          style={{ color: c.muted, borderLeft: `1px solid ${c.border}` }}
        >
          CARD MARKET INTELLIGENCE
        </span>
      </div>

      {/* Right: Search + Toggle */}
      <div className="flex items-center gap-3">
        <NavSearch />
        <div className="w-px h-5" style={{ background: c.border }} />
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
