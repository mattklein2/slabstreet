# SlabStreet Visual Redesign — Design Spec

## Summary

Complete visual rework of SlabStreet from a blocky, tight Bloomberg-terminal aesthetic to a spacious, dark premium look inspired by CardLadder.com. All features are preserved — only the visual layer changes.

## Design Decisions

### Theme: Dark & Premium
- **Background**: `#0a0f1a` (deep navy)
- **Card/widget surfaces**: `#111827`
- **Borders**: `1px solid #1e2a3a` (subtle, no colored top-borders)
- **Primary text**: `#e8edf5`
- **Secondary text**: `#c8d3e0`
- **Muted text**: `#556677`
- **Dimmed text**: `#445566`
- **Accent green**: `#00ff87`
- **Accent red**: `#ff3b5c`
- **Hover border**: `#2a3a4a`
- **Active tab bg**: `#00ff8712` (green at 7% opacity)
- **Light mode**: Retained via ThemeProvider toggle — light mode colors will need equivalent updates (white bg, soft gray cards, green accent stays)

### Spacing: Spacious & Bold
- **Border radius**: 16px on all cards/widgets
- **Gaps between cards**: 20px
- **Gaps between widget sections**: 24-28px
- **Card padding**: 22px
- **Page padding**: 28px horizontal, 32px vertical
- **Max width**: 1600px centered

### Navigation: Integrated League Tabs
- **Single nav bar** (56px height, sticky top)
- **Layout**: Logo left | League tabs center | Search + live + theme toggle right
- **League tabs**: 11px uppercase, pill-style with rounded 8px background on active state
- **Active tab**: green text + `#00ff8712` background
- **Search**: 12px, rounded 12px, `#111827` bg with `#1e2a3a` border
- **Removes** the separate LeagueTabs row below nav

### Widget Headers: Icon + Label
- Keep emoji icons next to section titles
- 11px uppercase, `letter-spacing: 2px`, `#556677` color
- No colored top-border on widgets (current style removed)

## Component Changes

### WidgetShell.tsx
- Remove `borderTop: 2px solid {accentColor}` pattern
- Apply `border-radius: 16px`, `border: 1px solid #1e2a3a`, `background: #111827`
- Increase padding to 22px
- Keep icon + title header pattern

### Nav.tsx
- Absorb LeagueTabs into the nav bar (flex: logo | tabs | search)
- Nav height 56px, sticky, `border-bottom: 1px solid #1e2a3a`
- League tabs as pill-style items with rounded background on active
- Search box with 12px border-radius

### LeagueTabs.tsx
- Remove as standalone component (absorbed into Nav)
- Tab logic/state preserved, just rendered inside Nav

### MarketMovers.tsx
- Mover cards: 16px radius, 22px padding, `#111827` bg, `1px solid #1e2a3a` border
- Remove colored left-border accent
- Score font: 34px bold
- Sparkline bars: 7px wide, 3px radius, 28px container height

### FullSchedule.tsx
- Score tabs: small pill style (6px radius, 10px uppercase)
- Score rows: 10px vertical padding, `#141c28` dividers
- Date nav inline above scores

### TradeSignals.tsx
- Signal rows with BUY badge pill (`#00ff8718` bg, `#00ff87` text)
- Score right-aligned, 15px bold green

### SportsNews.tsx
- News rows with 10px padding, `#141c28` dividers
- Headline 13px, meta 10px with small tag pills (`#1e2a3a` bg)

### RecentSales.tsx
- Horizontal scroll strip of 220px-wide sale cards
- 16px radius, 16px padding
- Price in 20px bold green

### CardNews.tsx
- 3-column grid of news cards
- 16px radius, 18px padding
- Type label in green uppercase

### globals.css / ThemeProvider
- Update CSS custom properties for dark mode to match new palette
- Update light mode equivalents
- Remove old `borderTop` accent patterns from theme context
- Update default border-radius from 4px to 16px

### page.tsx (Homepage Layout)
- Max width 1600px
- 28px page padding
- Market Movers full-width row
- Below: 3-column layout (Scores 340px | News flex-1 | Signals 380px)
- Below: Recent Sales horizontal strip
- Below: Card News 3-column grid

## What Does NOT Change
- All data fetching / API routes
- All business logic (scores, signals, movers, news)
- ThemeProvider architecture (just color values update)
- Font families (Bebas Neue display, IBM Plex Sans body, IBM Plex Mono data)
- Dark/light mode toggle (both modes get updated colors)
- Mobile responsive breakpoints (flex-col on mobile stays)
- Search functionality (NavSearch.tsx logic)
- All widget features and interactions

## Reference Mockup
Full HTML mockup: `.superpowers/brainstorm/1623-1773238362/full-mockup.html`
