# SlabStreet Homepage Redesign — Design Spec

**Date:** 2026-03-10
**Status:** Approved
**Branch:** TBD (feature branch from master)

## Problem

The current homepage has a bland, generic look that feels AI-generated. Specific issues:
- All cards/boxes look identical — no visual hierarchy
- Elements float and expand unpredictably when scrolling on desktop
- No personality — could be any dark-mode dashboard template
- Typography is flat — headlines don't punch, data doesn't pop
- Narrow 900px single-column layout wastes desktop screen space
- Heavy inline React styles with no design system create inconsistency

Mobile works acceptably and should be preserved, not rebuilt.

## Design Direction

**Content portal (ESPN/Yahoo Sports-style)** with a dashboard grid layout (Tradingview-style). The homepage is the product — not a marketing page. Users land directly into live data, filtered by league.

### What We Keep
- Color palette: dark (#090b0f) + neon green (#00ff87) + red (#ff3b5c) + gold (#f0b429)
- Typography: Bebas Neue (display), IBM Plex Mono (data), IBM Plex Sans (body)
- Dark/light theme toggle with localStorage persistence
- Existing mobile behavior that works well

### What We Kill
- Hero section with tagline + CTA buttons
- Single-column 900px max-width constraint
- Inline React styles (migrate to Tailwind CSS v4, already installed)
- Identical card styling across all sections
- Features section on homepage (move to dedicated page or footer link)

## Architecture

### Header (Top → Bottom)

1. **Ticker Bar** — Full-width, pipe-separated market data. Animated horizontal scroll. Flush to top edge. **Data source:** remains hardcoded static data for this phase. Live ticker data (from Supabase players table or eBay API) is a future enhancement.

2. **Navigation Bar** — Sticky below ticker.
   - Left: SLABSTREET logo + "CARD MARKET INTELLIGENCE" tagline (separated by vertical rule)
   - Right: Search input (280px, collapses to icon on mobile) + theme toggle
   - Background: solid dark with subtle border-bottom, no backdrop blur

3. **League Tabs** — Horizontal tab bar below nav.
   - Tabs: ALL | NBA | NFL | MLB | NHL | F1 | WNBA
   - Active tab: green text + green bottom border (2px)
   - Inactive: muted gray text
   - Far right: "LIVE DATA" indicator with pulsing green dot
   - Mobile: horizontally scrollable with overflow-x

### Widget Grid (Main Content)

All widgets sit inside a 1400px max-width container with 24px horizontal padding. 16px gap between widget rows, 12px gap within rows.

Every widget follows a consistent chrome pattern:
- Colored top border (2px) unique to widget type
- Dark surface background (#0f1318) with 1px border
- 6px border-radius
- Header: icon + title (colored) + "View All →" link (muted)
- Inner cards: darker background (#090b0f) with 1px border + 4px radius

**Row 1 — Market Movers (full-width)**
- Top border: green (#00ff87)
- Header: "📈 MARKET MOVERS" + timestamp badge + Risers/Fallers toggle
- Content: 5-column grid of player mover cards
- Each card: player name, card name, price (Bebas Neue 28px), % change
- Mini sparkline: placeholder 6-bar chart using static/random heights for this phase. Real time-series data (daily score snapshots) is a future data enhancement — the UI should render the bars now so the layout is ready
- Left border accent: green for risers, red for fallers
- Mobile: horizontal scroll strip, cards have min-width 120px

**Row 2 — Two equal widgets side-by-side**

Left — Today's Games (replaces HomeOdds.tsx):
- Top border: blue (#38bdf8)
- Header: "🏀 TODAY'S GAMES" + "Full Schedule →" (links to /odds/[league])
- Content: stacked game rows (matchup, time, spread). Network/TV channel omitted — not available in current Odds API data
- Data source: existing `/api/odds/games` endpoint, filtered by active league tab instead of current auto-detection
- For leagues without game odds (e.g., F1): show "No upcoming events" message, widget still renders with header
- Mobile: full-width stacked

Right — Trade Signals:
- Top border: orange (#fb923c)
- Header: "⚡ TRADE SIGNALS" + "All Signals →"
- Content: stacked signal rows with filled BUY/SELL/HOLD badges
- Badge colors: BUY = green bg, SELL = red bg, HOLD = gold bg (all dark text)
- Each row: badge + player name + card context + score
- **Data source:** existing `players` table — uses the `signal` column (BUY/SELL/HOLD) and `score` field already populated by the scoring engine. Filter by league. No new API endpoint needed. "Reasoning" text is derived from signal+score (e.g., "Score: 82 · Rising trend")
- Mobile: full-width stacked below games

**Row 3 — Card Market News (full-width)**
- Top border: purple (#a78bfa)
- Header: "📰 CARD MARKET NEWS" + "All News →"
- Content: 3-column grid of news cards
- Each card: category tag (colored), headline, timestamp + source
- Category colors match existing `/api/news/cards` categories: RELEASE = green, SALE = orange, GRADING = blue, MARKET = gold, BREAKS = purple, NEWS = muted gray
- Mobile: single-column stack

### League Tab Filtering

When a league tab is active (e.g., "NBA"):
- All widgets filter to that league's data
- Games show only that league's games
- Movers show only that league's players
- Signals filter to that league
- News filters to that league
- "ALL" tab shows cross-league data (default)

This is the primary navigation mechanism — no page changes, just data filtering.

## Responsive Breakpoints

| Breakpoint | Layout |
|-----------|--------|
| 1400px+ | Full portal — 5-col movers, 2-col row 2, 3-col news |
| 1024px | 4-col movers, 2-col row 2, 2-col news |
| 768px | 2-col movers (scroll), stacked row 2, 1-col news |
| 480px | Scroll movers, stacked everything, compact nav |

### Mobile-Specific Behavior
- Search: collapses to icon, tapping opens full-width overlay (keep existing behavior)
- League tabs: horizontal scroll with overflow-x, no wrapping
- Movers: horizontal scroll strip with partially visible last card (affordance hint)
- All side-by-side layouts collapse to vertical stacks
- Ticker: continues animating, just narrower

## Technical Approach

### Styling Migration
- Migrate from inline React styles to Tailwind CSS v4 (already installed, not active)
- Add `@import "tailwindcss"` to top of `globals.css`
- Keep existing CSS custom properties in `:root` (--bg, --surface, --border, --green, etc.) — Tailwind v4 reads these natively via `@theme`
- Delete all CSS class definitions from globals.css that are replaced by component Tailwind classes (hero, nav, features, waitlist, etc. — roughly lines 58-560). Keep only: reset, :root vars, keyframe animations (ticker, pulse, fadeIn), and html/body base styles
- Use Tailwind utility classes directly in JSX — Tailwind v4 deprecates `@apply`, use utility strings instead
- Remove all inline `style={{}}` from components
- For theme-aware colors, use CSS vars in Tailwind: `bg-[var(--surface)]`, `text-[var(--green)]`, etc.

### Light Theme
- Keep existing `ThemeProvider` light/dark color objects as-is
- New widget surfaces use the same `colors.surface` / `colors.bg` from ThemeProvider — no new light-mode colors needed
- Colored top borders (green, blue, orange, purple) stay the same in both themes
- The ThemeProvider already handles the mapping — components just reference `c.surface`, `c.bg`, `c.text`, etc.

### Component Structure
```
app/
  components/
    layout/
      Ticker.tsx          — Market ticker bar
      Nav.tsx             — Logo + search + toggle
      LeagueTabs.tsx      — Tab bar with filtering state
    widgets/
      WidgetShell.tsx     — Shared widget chrome (border, header, link)
      MarketMovers.tsx    — Row 1 movers grid
      TodaysGames.tsx     — Row 2 left
      TradeSignals.tsx    — Row 2 right
      CardNews.tsx        — Row 3 news grid
      MoverCard.tsx       — Individual mover card with sparkline
      GameRow.tsx         — Individual game row
      SignalRow.tsx       — Individual signal with badge
      NewsCard.tsx        — Individual news card
  page.tsx               — Homepage (composes widgets)
```

### State Management
- League filter: React context (LeagueProvider) wrapping homepage
- Active league passed to all widget components
- Each widget fetches/filters based on active league
- Theme: keep existing ThemeProvider

### Data Flow
- Widgets fetch from existing API routes (/api/odds, /api/stats, /api/news, etc.)
- League filter param added to API calls where needed
- Existing Supabase queries for movers/signals stay the same, add league filter

## Widget States

Every widget must handle three states consistently:

**Loading:** Render the WidgetShell (header, border, background) with a shimmer/skeleton inside matching the expected content height. This prevents layout shift — the widget's outer dimensions are stable from first paint.

**Error:** Render the WidgetShell with a single-line muted message: "Unable to load [widget name]". No retry button for this phase. Widget stays visible at its normal height.

**Empty (no data for selected league):** Render the WidgetShell with a contextual message:
- Games: "No upcoming [league] games today"
- Movers: "No [league] movers data available"
- Signals: "No [league] signals right now"
- News: "No recent [league] news"
Widget stays visible — never hide an empty widget, as this causes layout shift.

### WidgetShell Props Interface
```typescript
interface WidgetShellProps {
  title: string;          // e.g., "MARKET MOVERS"
  icon: string;           // Emoji string, e.g., "📈"
  accentColor: string;    // CSS color for top border + title, e.g., "#00ff87"
  viewAllHref?: string;   // Optional "View All →" link target
  viewAllLabel?: string;  // Optional custom label (default: "View All →")
  badge?: React.ReactNode; // Optional right-side header element (timestamp, toggle)
  children: React.ReactNode;
}
```

## What's NOT in Scope
- Player detail page redesign (separate spec)
- Odds detail page redesign (separate spec)
- New data sources or scrapers
- Authentication / user accounts
- Portfolio tracker or other "Coming Soon" features
- Features section (removed from homepage, can be a separate /features page later)

## Success Criteria
- Desktop: full-width portal layout at 1400px+ with no floating/expanding elements
- Mobile: existing functionality preserved, widgets stack cleanly
- Visual hierarchy: each widget type is instantly distinguishable by color and structure
- Performance: no layout shifts, no FOUC, theme flash prevention maintained
- Code quality: zero inline styles, all Tailwind, component-based architecture
