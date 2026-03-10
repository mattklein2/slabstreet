# Homepage Redesign Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single-column marketing homepage with a full-width content portal using league-tab-filtered widget grid.

**Architecture:** Dashboard grid layout with shared WidgetShell component, LeagueProvider context for tab filtering, and Tailwind CSS v4 replacing all inline styles. Header = ticker + nav + league tabs. Body = widget rows (movers, games+signals, news).

**Tech Stack:** Next.js 16 + React 19 + TypeScript, Tailwind CSS v4, Supabase, existing API routes

**Spec:** `docs/superpowers/specs/2026-03-10-homepage-redesign-design.md`

---

## Chunk 1: Foundation — Tailwind Activation + Shared Components

### Task 1: Activate Tailwind CSS v4 in globals.css

**Files:**
- Modify: `app/globals.css`

This is the foundational step. Tailwind v4 is installed but dormant. We activate it and strip out the dead CSS classes that will be replaced by component-level Tailwind utilities.

- [ ] **Step 1: Add Tailwind import and strip dead CSS**

Replace the entire `globals.css` with just the essentials: Tailwind import, font import, reset, CSS custom properties, keyframe animations, and base body styles. Everything else (nav, hero, features, waitlist, footer, stats, cards — lines 29-571) gets deleted because those classes are unused by the new component architecture.

```css
@import "tailwindcss";
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Bebas+Neue&family=IBM+Plex+Sans:wght@300;400;500&display=swap');

/* Register custom fonts with Tailwind v4 so we can use font-mono, font-display, font-body */
@theme {
  --font-mono: 'IBM Plex Mono', monospace;
  --font-display: 'Bebas Neue', sans-serif;
  --font-body: 'IBM Plex Sans', sans-serif;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg: #090b0f;
  --surface: #0f1318;
  --border: #1e2530;
  --green: #00ff87;
  --green-dim: #00c96a;
  --red: #ff3b5c;
  --gold: #f0b429;
  --text: #e8edf5;
  --muted: #8899aa;
  --cyan: #38bdf8;
  --purple: #a78bfa;
  --orange: #fb923c;
  --amber: #f59e0b;
}

html { scroll-behavior: smooth; }

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--body);
  overflow-x: hidden;
}

@keyframes ticker {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

- [ ] **Step 2: Verify Tailwind compiles**

Run: `cd /c/Projects/slabstreet/.claude/worktrees/lucid-brahmagupta && npx next build 2>&1 | head -30`

Expected: Build starts without PostCSS errors. May have component errors (expected — we haven't migrated components yet). The key is no "Cannot resolve tailwindcss" or PostCSS plugin errors.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "chore: activate Tailwind CSS v4 and strip dead CSS classes"
```

---

### Task 2: Create LeagueProvider Context

**Files:**
- Create: `app/components/LeagueProvider.tsx`

This context provides the active league filter to all widgets. It's needed before any widget can be built.

- [ ] **Step 1: Create LeagueProvider**

```typescript
'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { LeagueId } from '@/lib/leagues';

type LeagueFilter = 'ALL' | LeagueId;

interface LeagueContextType {
  activeLeague: LeagueFilter;
  setActiveLeague: (league: LeagueFilter) => void;
}

const LeagueContext = createContext<LeagueContextType | null>(null);

export function LeagueProvider({ children }: { children: ReactNode }) {
  const [activeLeague, setActiveLeague] = useState<LeagueFilter>('ALL');

  const handleSetLeague = useCallback((league: LeagueFilter) => {
    setActiveLeague(league);
  }, []);

  return (
    <LeagueContext.Provider value={{ activeLeague, setActiveLeague: handleSetLeague }}>
      {children}
    </LeagueContext.Provider>
  );
}

export function useLeague() {
  const ctx = useContext(LeagueContext);
  if (!ctx) throw new Error('useLeague must be used within LeagueProvider');
  return ctx;
}
```

- [ ] **Step 2: Commit**

```bash
git add app/components/LeagueProvider.tsx
git commit -m "feat: add LeagueProvider context for league tab filtering"
```

---

### Task 3: Create WidgetShell Component

**Files:**
- Create: `app/components/widgets/WidgetShell.tsx`

The shared chrome for all widgets. Every widget wraps its content in this shell.

- [ ] **Step 1: Create WidgetShell**

```typescript
'use client';

import { useTheme } from '../ThemeProvider';
import type { ReactNode } from 'react';

interface WidgetShellProps {
  title: string;
  icon: string;
  accentColor: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  badge?: ReactNode;
  children: ReactNode;
}

export default function WidgetShell({
  title,
  icon,
  accentColor,
  viewAllHref,
  viewAllLabel = 'View All →',
  badge,
  children,
}: WidgetShellProps) {
  const { colors: c } = useTheme();

  return (
    <div
      className="rounded-md"
      style={{
        background: c.surface,
        border: `1px solid ${c.border}`,
        borderTop: `2px solid ${accentColor}`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-2.5">
          <span
            className="font-mono text-xs font-semibold tracking-wider"
            style={{ color: accentColor }}
          >
            {icon} {title}
          </span>
          {badge}
        </div>
        {viewAllHref && (
          <a
            href={viewAllHref}
            className="font-mono text-[10px] no-underline hover:underline"
            style={{ color: c.muted }}
          >
            {viewAllLabel}
          </a>
        )}
      </div>
      {/* Content */}
      <div className="px-5 pb-4">
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create WidgetSkeleton for loading state**

Add a skeleton component below the WidgetShell in the same file, or in a separate small helper. This is used by all widgets during loading.

Add to the bottom of `WidgetShell.tsx`:

```typescript
export function WidgetSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="rounded h-12"
          style={{
            background: 'linear-gradient(90deg, var(--border) 25%, var(--surface) 50%, var(--border) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s ease-in-out infinite',
          }}
        />
      ))}
    </div>
  );
}

export function WidgetError({ message }: { message: string }) {
  return (
    <div className="py-8 text-center font-mono text-xs" style={{ color: 'var(--muted)' }}>
      {message}
    </div>
  );
}

export function WidgetEmpty({ message }: { message: string }) {
  return (
    <div className="py-8 text-center font-mono text-xs" style={{ color: 'var(--muted)' }}>
      {message}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/components/widgets/WidgetShell.tsx
git commit -m "feat: add WidgetShell with skeleton, error, and empty states"
```

---

## Chunk 2: Layout Components — Ticker, Nav, League Tabs

### Task 4: Create Ticker Component

**Files:**
- Create: `app/components/layout/Ticker.tsx`

Extracts the ticker from the current page.tsx into its own component. Same hardcoded data, new Tailwind styling.

- [ ] **Step 1: Create Ticker**

```typescript
'use client';

import { useTheme } from '../ThemeProvider';

const tickerItems = [
  { label: 'WEMBY AUTO /25',      value: '$2,840',       change: '+8.4%',    up: true  },
  { label: 'WEMBY LOGOMAN 1/1',   value: 'UNACCOUNTED',  change: '⚡ SIGNAL', up: true  },
  { label: 'WEMBY RC PSA 10',     value: '$480',         change: '-2.1%',    up: false },
  { label: 'MVP ODDS',            value: '-320',         change: '+DK',      up: true  },
  { label: 'WEMBY PRIZM SILVER',  value: '$220',         change: '+12.7%',   up: true  },
  { label: 'POP REPORT PSA 10',   value: '847',          change: '+23 NEW',  up: true  },
];

export default function Ticker() {
  const { colors: c } = useTheme();
  const doubled = [...tickerItems, ...tickerItems];

  return (
    <div
      className="overflow-hidden whitespace-nowrap py-1.5"
      style={{ background: c.surface, borderBottom: `1px solid ${c.border}` }}
    >
      <div className="inline-flex" style={{ animation: 'ticker 28s linear infinite' }}>
        {doubled.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2.5 px-7 font-mono text-[11px]"
            style={{ borderRight: `1px solid ${c.border}` }}
          >
            <span className="tracking-wider" style={{ color: c.muted }}>{item.label}</span>
            <span className="font-bold" style={{ color: c.text }}>{item.value}</span>
            <span style={{ color: item.up ? c.green : c.red }}>{item.change}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/components/layout/Ticker.tsx
git commit -m "feat: add Ticker layout component"
```

---

### Task 5: Create Nav Component

**Files:**
- Create: `app/components/layout/Nav.tsx`
- Existing (keep): `app/components/NavSearch.tsx` — reused as-is inside Nav

The nav component wraps the logo, tagline, search, and theme toggle. NavSearch stays as-is — it already works well including mobile.

- [ ] **Step 1: Create Nav**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add app/components/layout/Nav.tsx
git commit -m "feat: add Nav layout component with search and theme toggle"
```

---

### Task 6: Create LeagueTabs Component

**Files:**
- Create: `app/components/layout/LeagueTabs.tsx`

The horizontal tab bar that drives all widget filtering.

- [ ] **Step 1: Create LeagueTabs**

```typescript
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
            className="shrink-0 font-mono text-[11px] tracking-wider px-4 py-2.5 cursor-pointer bg-transparent border-none transition-colors duration-150 whitespace-nowrap"
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
        className="flex items-center gap-1.5 font-mono text-[10px] shrink-0 py-2.5"
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
```

- [ ] **Step 2: Commit**

```bash
git add app/components/layout/LeagueTabs.tsx
git commit -m "feat: add LeagueTabs with league filter integration"
```

---

## Chunk 3: Widget Components

### Task 7: Create MoverCard + MarketMovers Widget

**Files:**
- Create: `app/components/widgets/MoverCard.tsx`
- Create: `app/components/widgets/MarketMovers.tsx`

Replaces `HomeMovers.tsx`. Uses same Supabase queries but adds league filtering and new card design with sparkline placeholder.

**Data mapping note:** The spec says "player name, card name, price, % change" but the `players` table has `name`, `team`, `score`, `signal` — not per-card price/change data. For this phase: `score` stands in for price (displayed as the big number), `signal` (BUY/SELL) stands in for % change direction. Card-level price data is a future enhancement.

- [ ] **Step 1: Create MoverCard**

```typescript
'use client';

import { useTheme } from '../ThemeProvider';

interface MoverCardProps {
  name: string;
  slug: string;
  team: string;
  score: number;
  signal: 'BUY' | 'SELL' | string;
  league: string;
}

export default function MoverCard({ name, slug, team, score, signal }: MoverCardProps) {
  const { colors: c } = useTheme();
  const isRiser = signal === 'BUY';
  const accentColor = isRiser ? c.green : c.red;

  // Placeholder sparkline bars — static heights seeded from score
  const bars = Array.from({ length: 6 }, (_, i) => {
    const base = ((score * (i + 1) * 7) % 60) + 20;
    return Math.min(base + (i * 5), 100);
  });

  return (
    <a
      href={`/players/${slug}`}
      className="block no-underline rounded transition-colors duration-150"
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderLeft: `3px solid ${accentColor}`,
      }}
    >
      <div className="p-3">
        <div className="font-mono text-[10px] tracking-wider mb-1" style={{ color: c.muted }}>
          {name.split(' ').pop()?.toUpperCase()}
        </div>
        <div className="font-mono text-[11px] mb-0.5" style={{ color: c.text }}>
          {team}
        </div>
        <div className="font-display text-[28px] leading-none" style={{ color: c.text }}>
          {score}
        </div>
        <div className="font-mono text-[11px] font-semibold mt-1" style={{ color: accentColor }}>
          {isRiser ? '▲' : '▼'} {signal}
        </div>
        {/* Sparkline placeholder */}
        <div className="flex gap-0.5 items-end h-5 mt-1.5">
          {bars.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-[1px]"
              style={{
                height: `${h}%`,
                background: i >= 4 ? accentColor : c.border,
                opacity: i >= 4 ? (i === 5 ? 1 : 0.6) : 0.4,
              }}
            />
          ))}
        </div>
      </div>
    </a>
  );
}
```

- [ ] **Step 2: Create MarketMovers widget**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useTheme } from '../ThemeProvider';
import { useLeague } from '../LeagueProvider';
import WidgetShell, { WidgetSkeleton, WidgetError, WidgetEmpty } from './WidgetShell';
import MoverCard from './MoverCard';

type Mover = {
  name: string;
  slug: string;
  team: string;
  score: number;
  signal: string;
  league: string;
};

export default function MarketMovers() {
  const { colors: c } = useTheme();
  const { activeLeague } = useLeague();
  const [risers, setRisers] = useState<Mover[]>([]);
  const [fallers, setFallers] = useState<Mover[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showRisers, setShowRisers] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(false);
      try {
        let riserQuery = supabase
          .from('players')
          .select('name, slug, team, score, signal, league')
          .eq('active', true)
          .eq('signal', 'BUY')
          .order('score', { ascending: false })
          .limit(5);

        let fallerQuery = supabase
          .from('players')
          .select('name, slug, team, score, signal, league')
          .eq('active', true)
          .eq('signal', 'SELL')
          .order('score', { ascending: true })
          .limit(5);

        if (activeLeague !== 'ALL') {
          riserQuery = riserQuery.eq('league', activeLeague);
          fallerQuery = fallerQuery.eq('league', activeLeague);
        }

        const [r, f] = await Promise.all([riserQuery, fallerQuery]);
        setRisers(r.data || []);
        setFallers(f.data || []);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [activeLeague]);

  const movers = showRisers ? risers : fallers;
  const leagueLabel = activeLeague === 'ALL' ? '' : `${activeLeague} `;

  const toggleBadge = (
    <div className="flex gap-2">
      <button
        onClick={() => setShowRisers(true)}
        className="font-mono text-[10px] px-2 py-0.5 rounded cursor-pointer bg-transparent"
        style={{
          color: showRisers ? c.green : c.muted,
          border: `1px solid ${showRisers ? c.green : c.border}`,
        }}
      >
        RISERS
      </button>
      <button
        onClick={() => setShowRisers(false)}
        className="font-mono text-[10px] px-2 py-0.5 rounded cursor-pointer bg-transparent"
        style={{
          color: !showRisers ? c.red : c.muted,
          border: `1px solid ${!showRisers ? c.red : c.border}`,
        }}
      >
        FALLERS
      </button>
    </div>
  );

  return (
    <WidgetShell
      title="MARKET MOVERS"
      icon="📈"
      accentColor={c.green}
      badge={toggleBadge}
    >
      {loading && <WidgetSkeleton rows={1} />}
      {error && <WidgetError message="Unable to load market movers" />}
      {!loading && !error && movers.length === 0 && (
        <WidgetEmpty message={`No ${leagueLabel}movers data available`} />
      )}
      {!loading && !error && movers.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:overflow-x-visible">
          {movers.map((m) => (
            <div key={m.slug} className="min-w-[140px] md:min-w-0 shrink-0 md:shrink">
              <MoverCard {...m} />
            </div>
          ))}
        </div>
      )}
    </WidgetShell>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/components/widgets/MoverCard.tsx app/components/widgets/MarketMovers.tsx
git commit -m "feat: add MarketMovers widget with MoverCard and league filtering"
```

---

### Task 8: Create GameRow + TodaysGames Widget

**Files:**
- Create: `app/components/widgets/GameRow.tsx`
- Create: `app/components/widgets/TodaysGames.tsx`

Replaces `HomeOdds.tsx`. Uses same `/api/odds/games` endpoint but filters by active league tab.

- [ ] **Step 1: Create GameRow**

```typescript
'use client';

import { useTheme } from '../ThemeProvider';

interface GameRowProps {
  homeTeam: string;
  awayTeam: string;
  time: string;
  spread?: string;
}

export default function GameRow({ homeTeam, awayTeam, time, spread }: GameRowProps) {
  const { colors: c } = useTheme();

  return (
    <div
      className="flex items-center justify-between rounded px-3 py-2.5"
      style={{ background: c.bg, border: `1px solid ${c.border}` }}
    >
      <div>
        <div className="font-mono text-xs font-semibold" style={{ color: c.text }}>
          {awayTeam} vs {homeTeam}
        </div>
        <div className="font-mono text-[9px] mt-0.5" style={{ color: c.muted }}>
          {time}
        </div>
      </div>
      {spread && (
        <div className="text-right">
          <div className="font-mono text-[10px]" style={{ color: c.muted }}>SPREAD</div>
          <div className="font-mono text-xs" style={{ color: c.text }}>{spread}</div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create TodaysGames widget**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '../ThemeProvider';
import { useLeague } from '../LeagueProvider';
import { getLeagueConfig, getAllLeagueIds } from '@/lib/leagues';
import WidgetShell, { WidgetSkeleton, WidgetError, WidgetEmpty } from './WidgetShell';
import GameRow from './GameRow';

type GameOdds = {
  id: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: { title: string; h2h: { home: string; away: string; draw?: string }; spreads: { home: string; away: string; home_point: string; away_point: string }; totals: { over: string; under: string; over_point: string; under_point: string } }[];
};

export default function TodaysGames() {
  const { colors: c } = useTheme();
  const { activeLeague } = useLeague();
  const [games, setGames] = useState<GameOdds[]>([]);
  const [displayLeague, setDisplayLeague] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(false);
      try {
        if (activeLeague === 'ALL') {
          // Try leagues in order until one has games
          const leagueIds = getAllLeagueIds();
          for (const lid of leagueIds) {
            const config = getLeagueConfig(lid);
            if (!config.oddsApiGameKey) continue;
            const res = await fetch(`/api/odds/games?league=${lid}`);
            const data = await res.json();
            const now = Date.now();
            const upcoming = (data.games || []).filter(
              (g: GameOdds) => new Date(g.commence_time).getTime() >= now - 3600000
            );
            if (upcoming.length > 0) {
              setGames(upcoming.slice(0, 4));
              setDisplayLeague(lid);
              setLoading(false);
              return;
            }
          }
          setGames([]);
          setDisplayLeague('');
        } else {
          const config = getLeagueConfig(activeLeague);
          if (!config.oddsApiGameKey) {
            setGames([]);
            setDisplayLeague(activeLeague);
            setLoading(false);
            return;
          }
          const res = await fetch(`/api/odds/games?league=${activeLeague}`);
          const data = await res.json();
          const now = Date.now();
          const upcoming = (data.games || []).filter(
            (g: GameOdds) => new Date(g.commence_time).getTime() >= now - 3600000
          );
          setGames(upcoming.slice(0, 4));
          setDisplayLeague(activeLeague);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [activeLeague]);

  const leagueLabel = displayLeague || activeLeague;
  const scheduleHref = displayLeague ? `/odds/${displayLeague.toLowerCase()}` : undefined;

  function formatTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
  }

  function getSpread(g: GameOdds) {
    if (!g.bookmakers?.[0]?.spreads) return undefined;
    const s = g.bookmakers[0].spreads;
    const point = parseFloat(s.home_point);
    return `${g.home_team.split(' ').pop()} ${point > 0 ? '+' : ''}${point}`;
  }

  return (
    <WidgetShell
      title="TODAY'S GAMES"
      icon="🏀"
      accentColor={c.cyan}
      viewAllHref={scheduleHref}
      viewAllLabel="Full Schedule →"
    >
      {loading && <WidgetSkeleton rows={3} />}
      {error && <WidgetError message="Unable to load games" />}
      {!loading && !error && games.length === 0 && (
        <WidgetEmpty message={`No upcoming ${leagueLabel} games today`} />
      )}
      {!loading && !error && games.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {games.map((g) => (
            <GameRow
              key={g.id}
              homeTeam={g.home_team}
              awayTeam={g.away_team}
              time={formatTime(g.commence_time)}
              spread={getSpread(g)}
            />
          ))}
        </div>
      )}
    </WidgetShell>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/components/widgets/GameRow.tsx app/components/widgets/TodaysGames.tsx
git commit -m "feat: add TodaysGames widget with league filtering"
```

---

### Task 9: Create SignalRow + TradeSignals Widget

**Files:**
- Create: `app/components/widgets/SignalRow.tsx`
- Create: `app/components/widgets/TradeSignals.tsx`

New widget. Reads from existing `players` table signal/score columns.

- [ ] **Step 1: Create SignalRow**

```typescript
'use client';

import { useTheme } from '../ThemeProvider';

interface SignalRowProps {
  signal: string;
  name: string;
  slug: string;
  team: string;
  score: number;
}

const SIGNAL_COLORS: Record<string, { bg: string; text: string }> = {
  BUY:  { bg: '#00ff87', text: '#090b0f' },
  SELL: { bg: '#ff3b5c', text: '#090b0f' },
  HOLD: { bg: '#f0b429', text: '#090b0f' },
};

export default function SignalRow({ signal, name, slug, team, score }: SignalRowProps) {
  const { colors: c } = useTheme();
  const sc = SIGNAL_COLORS[signal] || SIGNAL_COLORS.HOLD;

  return (
    <a
      href={`/players/${slug}`}
      className="flex items-center justify-between rounded px-3 py-2.5 no-underline"
      style={{ background: c.bg, border: `1px solid ${c.border}` }}
    >
      <div className="flex items-center gap-2.5">
        <span
          className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-sm"
          style={{ background: sc.bg, color: sc.text }}
        >
          {signal}
        </span>
        <div>
          <div className="font-mono text-xs" style={{ color: c.text }}>{name}</div>
          <div className="font-mono text-[9px] mt-0.5" style={{ color: c.muted }}>
            {team} · Score: {score}
          </div>
        </div>
      </div>
      <div className="font-mono text-[11px]" style={{ color: sc.bg }}>
        {score}
      </div>
    </a>
  );
}
```

- [ ] **Step 2: Create TradeSignals widget**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useTheme } from '../ThemeProvider';
import { useLeague } from '../LeagueProvider';
import WidgetShell, { WidgetSkeleton, WidgetError, WidgetEmpty } from './WidgetShell';
import SignalRow from './SignalRow';

type Signal = {
  name: string;
  slug: string;
  team: string;
  score: number;
  signal: string;
  league: string;
};

export default function TradeSignals() {
  const { colors: c } = useTheme();
  const { activeLeague } = useLeague();
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(false);
      try {
        let query = supabase
          .from('players')
          .select('name, slug, team, score, signal, league')
          .eq('active', true)
          .in('signal', ['BUY', 'SELL', 'HOLD'])
          .order('score', { ascending: false })
          .limit(6);

        if (activeLeague !== 'ALL') {
          query = query.eq('league', activeLeague);
        }

        const { data } = await query;
        setSignals(data || []);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [activeLeague]);

  const leagueLabel = activeLeague === 'ALL' ? '' : `${activeLeague} `;

  return (
    <WidgetShell
      title="TRADE SIGNALS"
      icon="⚡"
      accentColor={c.orange}
      viewAllLabel="All Signals →"
    >
      {loading && <WidgetSkeleton rows={3} />}
      {error && <WidgetError message="Unable to load signals" />}
      {!loading && !error && signals.length === 0 && (
        <WidgetEmpty message={`No ${leagueLabel}signals right now`} />
      )}
      {!loading && !error && signals.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {signals.map((s) => (
            <SignalRow key={s.slug} {...s} />
          ))}
        </div>
      )}
    </WidgetShell>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/components/widgets/SignalRow.tsx app/components/widgets/TradeSignals.tsx
git commit -m "feat: add TradeSignals widget with BUY/SELL/HOLD badges"
```

---

### Task 10: Create NewsCard + CardNews Widget

**Files:**
- Create: `app/components/widgets/NewsCard.tsx`
- Create: `app/components/widgets/CardNews.tsx`

Replaces `HomeNews.tsx`. Same `/api/news/cards` endpoint, new grid layout with colored category tags.

- [ ] **Step 1: Create NewsCard**

```typescript
'use client';

import { useTheme } from '../ThemeProvider';

interface NewsCardProps {
  headline: string;
  source: string;
  url: string;
  category: string;
  time: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  RELEASE: '#00ff87',
  SALE: '#fb923c',
  GRADING: '#38bdf8',
  MARKET: '#f0b429',
  BREAKS: '#a78bfa',
  NEWS: '#8899aa',
};

export default function NewsCard({ headline, source, url, category, time }: NewsCardProps) {
  const { colors: c } = useTheme();
  const catColor = CATEGORY_COLORS[category] || CATEGORY_COLORS.NEWS;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block no-underline rounded transition-colors duration-150"
      style={{ background: c.bg, border: `1px solid ${c.border}` }}
    >
      <div className="p-3">
        <div
          className="font-mono text-[9px] tracking-wider mb-1.5"
          style={{ color: catColor }}
        >
          {category}
        </div>
        <div
          className="font-mono text-xs leading-snug mb-1.5 line-clamp-2"
          style={{ color: c.text }}
        >
          {headline}
        </div>
        <div className="font-mono text-[9px]" style={{ color: c.muted }}>
          {time} · {source}
        </div>
      </div>
    </a>
  );
}
```

- [ ] **Step 2: Create CardNews widget**

```typescript
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
  const displayed = news.slice(0, 6);
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
          {displayed.map((n, i) => (
            <NewsCard key={i} {...n} />
          ))}
        </div>
      )}
    </WidgetShell>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/components/widgets/NewsCard.tsx app/components/widgets/CardNews.tsx
git commit -m "feat: add CardNews widget with category-colored news cards"
```

---

## Chunk 4: Homepage Assembly + Cleanup

### Task 11: Rewrite Homepage (page.tsx)

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/layout.tsx`

Replace the entire current homepage with the new component composition. Wire up LeagueProvider in layout.

- [ ] **Step 1: Update layout.tsx to include LeagueProvider**

In `app/layout.tsx`, remove the old Google Fonts `<link>` tag (fonts now load via `@import` in globals.css). Do NOT add LeagueProvider here — it belongs scoped to the homepage only (in page.tsx, Task 11 Step 2).

```typescript
import type { Metadata } from 'next';
import { ThemeProvider } from './components/ThemeProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'SlabStreet — Card Market Intelligence',
  description: 'Bloomberg Terminal for sports card collectors. Real-time Slab Scores, market data, and investment signals.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('slabstreet-theme') || 'dark';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch(e) {}
              })();
            `,
          }}
        />
        {/* Fonts loaded via @import in globals.css — preconnect only here */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Rewrite page.tsx**

Replace the entire file with the new dashboard composition:

```typescript
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
```

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx app/layout.tsx
git commit -m "feat: rewrite homepage as dashboard grid with widget composition"
```

---

### Task 12: Verify Build + Visual Check

**Files:** None (verification only)

- [ ] **Step 1: Run build**

Run: `cd /c/Projects/slabstreet/.claude/worktrees/lucid-brahmagupta && npx next build 2>&1 | tail -20`

Expected: Build succeeds with no TypeScript or compilation errors. Warnings about unused imports from old components are acceptable at this stage.

- [ ] **Step 2: Run dev server and visual check**

Run: `npx next dev` and open `http://localhost:3000`.

Verify:
- Ticker animates at top
- Nav shows logo + tagline + search + toggle
- League tabs appear with ALL selected (green underline)
- Clicking a league tab filters movers and signals
- Movers show cards with sparkline bars
- Games + Signals side by side on desktop
- News shows 3-column grid on desktop
- Theme toggle works (dark/light)
- Resize to mobile — everything stacks

- [ ] **Step 3: Remove old unused components**

After verifying the new homepage works, remove the old components that are no longer imported:

```bash
# Only if no other pages import them — check first:
grep -r "HomeMovers" app/ --include="*.tsx" --include="*.ts"
grep -r "HomeOdds" app/ --include="*.tsx" --include="*.ts"
grep -r "HomeNews" app/ --include="*.tsx" --include="*.ts"
```

If only the old `page.tsx` imported them (which it should, since we've rewritten it), delete:
- `app/components/HomeMovers.tsx`
- `app/components/HomeOdds.tsx`
- `app/components/HomeNews.tsx`

- [ ] **Step 4: Commit cleanup**

```bash
git add -A
git commit -m "chore: remove old homepage components replaced by widget architecture"
```

---

### Task 13: Final Polish Pass

**Files:**
- Various widget files for minor tweaks

- [ ] **Step 1: Visual polish check with Preview tools**

Use Claude Preview to screenshot the page and verify:
- No floating/expanding elements when scrolling
- Color-coded top borders are visible on all widgets
- Sparkline bars render in mover cards
- BUY/SELL/HOLD badges have correct fill colors
- News category tags have correct colors
- Footer sits below content, not floating

- [ ] **Step 2: Mobile responsiveness check**

Use Claude Preview to resize to mobile (375px) and verify:
- League tabs scroll horizontally
- Movers cards scroll horizontally
- Games and signals stack vertically
- News goes single column
- Search collapses to icon
- Nothing overflows

- [ ] **Step 3: Fix any issues found**

Address any layout or styling issues discovered in steps 1-2.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "fix: polish homepage layout and responsive behavior"
```
