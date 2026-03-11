# SlabStreet Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework SlabStreet's visual layer from blocky/tight Bloomberg terminal to a spacious, dark premium aesthetic — all features preserved.

**Architecture:** Pure CSS/styling changes across ~18 files. Core theme colors update in ThemeProvider + globals.css, then cascade outward to WidgetShell, Nav (absorbing LeagueTabs), sub-components, and pages. No data fetching or business logic changes.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS v4, inline styles via ThemeProvider context

**Spec:** `docs/superpowers/specs/2026-03-11-visual-redesign-design.md`
**Mockup:** `.superpowers/brainstorm/1623-1773238362/full-mockup.html`

---

## File Map

### Core Theme (change first — everything depends on these)
- Modify: `app/globals.css` (54 lines) — CSS custom properties, light mode defaults
- Modify: `app/components/ThemeProvider.tsx` (88 lines) — dark/light color objects, new `secondary` and `dimmed` colors

### Navigation (merge LeagueTabs into Nav)
- Modify: `app/components/layout/Nav.tsx` (59 lines) — absorb league tabs, new layout
- Modify: `app/components/layout/NavShell.tsx` (13 lines) — remove LeagueTabs render
- Modify: `app/components/NavSearch.tsx` (322 lines) — update border-radius, colors
- Keep (don't delete): `app/components/layout/LeagueTabs.tsx` (72 lines) — still imported by Nav for tab logic

### Widget System
- Modify: `app/components/widgets/WidgetShell.tsx` (101 lines) — remove accent top-border, 16px radius, surface bg, 22px padding

### Sub-Components (each gets updated border-radius, colors, spacing)
- Modify: `app/components/widgets/MoverCard.tsx` (65 lines)
- Modify: `app/components/widgets/SaleCard.tsx` (77 lines)
- Modify: `app/components/widgets/SignalRow.tsx` (48 lines)
- Modify: `app/components/widgets/SportsNewsRow.tsx` (140 lines)
- Modify: `app/components/widgets/NewsCard.tsx` (53 lines)
- Modify: `app/components/widgets/ScoreBugRow.tsx` (173 lines)
- Modify: `app/components/widgets/FullSchedule.tsx` (414 lines)
- Modify: `app/components/widgets/F1Results.tsx` (389 lines)

### Pages
- Modify: `app/page.tsx` (60 lines) — new max-width, gaps, 3-col layout
- Modify: `app/cards/[slug]/page.tsx` (507 lines) — updated radius, colors, spacing

---

## Chunk 1: Core Theme & Widget Shell

### Task 1: Update ThemeProvider colors

**Files:**
- Modify: `app/components/ThemeProvider.tsx`

- [ ] **Step 1: Update dark mode colors**

In `ThemeProvider.tsx`, update the dark color object. Key changes:
- `bg`: `#090b0f` → `#0a0f1a`
- `surface`: `#0f1318` → `#111827`
- `border`: `#1e2530` → `#1e2a3a`
- Add `secondary: '#c8d3e0'`
- Add `dimmed: '#445566'`
- `muted`: `#8899aa` → `#556677`
- `navBg`: `#090b0f` → `#0a0f1a`
- Keep `green`, `red`, `cyan`, `amber`, `orange`, `purple`, `text` as-is (already correct)

```typescript
const dark = {
  bg: '#0a0f1a',
  surface: '#111827',
  border: '#1e2a3a',
  text: '#e8edf5',
  secondary: '#c8d3e0',
  muted: '#556677',
  dimmed: '#445566',
  green: '#00ff87',
  red: '#ff3b5c',
  cyan: '#38bdf8',
  amber: '#f59e0b',
  orange: '#fb923c',
  purple: '#a78bfa',
  navBg: '#0a0f1a',
}
```

- [ ] **Step 2: Update light mode colors**

Update the light color object with equivalent airy light-mode values:

```typescript
const light = {
  bg: '#f8f9fb',
  surface: '#ffffff',
  border: '#e5e7eb',
  text: '#111827',
  secondary: '#374151',
  muted: '#9ca3af',
  dimmed: '#d1d5db',
  green: '#16a34a',
  red: '#e11d48',
  cyan: '#0284c7',
  amber: '#d97706',
  orange: '#ea580c',
  purple: '#7c3aed',
  navBg: '#ffffff',
}
```

- [ ] **Step 3: Update the TypeScript type**

Add `secondary` and `dimmed` to the theme colors type/interface so they're available everywhere.

- [ ] **Step 4: Commit**

```bash
git add app/components/ThemeProvider.tsx
git commit -m "feat: update theme colors for dark premium redesign"
```

### Task 2: Update globals.css

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Update CSS custom properties**

Update the `@theme` block light-mode defaults to match the new light palette. The key vars:
- `--bg: #f8f9fb`
- `--surface: #ffffff`
- `--border: #e5e7eb`
- `--text: #111827`
- `--muted: #9ca3af`
- `--green: #16a34a`

Keep all animations (`ticker`, `pulse`, `shimmer`) and font imports unchanged.

- [ ] **Step 2: Commit**

```bash
git add app/globals.css
git commit -m "feat: update CSS custom properties for redesign"
```

### Task 3: Update WidgetShell

**Files:**
- Modify: `app/components/widgets/WidgetShell.tsx`

- [ ] **Step 1: Remove accent top-border**

Find the `borderTop: \`2px solid ${accentColor}\`` line in the container's inline styles and remove it.

- [ ] **Step 2: Update container styling**

Change the container's inline styles:
- `borderRadius` from implicit `rounded-md` to explicit `borderRadius: 16`
- Keep `background: c.surface`, `border: 1px solid ${c.border}`
- Replace Tailwind class `rounded-md` with inline `borderRadius: 16`

- [ ] **Step 3: Update padding**

Change header padding from `px-6 py-4` to `px-[22px] py-[18px]` (or inline `padding: '18px 22px'`).
Change content padding from `px-6 pb-5` to `px-[22px] pb-[22px]`.

- [ ] **Step 4: Update skeleton loader radius**

In `WidgetSkeleton`, change `rounded` class on skeleton bars to `rounded-xl` (matching 16px radius).

- [ ] **Step 5: Commit**

```bash
git add app/components/widgets/WidgetShell.tsx
git commit -m "feat: update WidgetShell — remove accent border, 16px radius, spacious padding"
```

---

## Chunk 2: Navigation Merge

### Task 4: Merge league tabs into Nav

**Files:**
- Modify: `app/components/layout/Nav.tsx`
- Modify: `app/components/layout/NavShell.tsx`

- [ ] **Step 1: Update NavShell to remove LeagueTabs**

In `NavShell.tsx`, remove the `<LeagueTabs />` component render. It should only render `<Nav />`.
Remove the import of `LeagueTabs`.

- [ ] **Step 2: Rewrite Nav.tsx layout**

Restructure Nav into 3 sections: logo (left) | league tabs (center) | search + controls (right).

Nav container: 56px height, sticky top-0 z-50, `background: c.bg`, `borderBottom: 1px solid ${c.border}`, padding `0 32px`.

Left section: Logo — keep existing Bebas Neue `SLABSTREET` with green accent.

Center section: Import league tab data from `LeagueTabs.tsx` (the `useLeague` hook and league config). Render tabs as:
- Container: `display: flex, gap: 6px, alignItems: center`
- Each tab: `fontSize: 11, textTransform: uppercase, letterSpacing: 1.5, padding: '6px 14px', borderRadius: 8, cursor: pointer, transition: all 0.15s, fontWeight: 500`
- Active tab: `color: c.green, background: ${c.green}12`
- Inactive tab: `color: c.muted`
- Hover: `color: ${c.muted lightened}, background: c.surface`

Right section: NavSearch + live indicator + theme toggle (keep existing toggle logic).

- [ ] **Step 3: Update search box styling in Nav**

The search input wrapper: `background: c.surface`, `border: 1px solid ${c.border}`, `borderRadius: 12`, `padding: '8px 16px'`, `fontSize: 12`, `width: 240`.

- [ ] **Step 4: Commit**

```bash
git add app/components/layout/Nav.tsx app/components/layout/NavShell.tsx
git commit -m "feat: merge league tabs into nav bar — single integrated header"
```

### Task 5: Update NavSearch styling

**Files:**
- Modify: `app/components/NavSearch.tsx`

- [ ] **Step 1: Update input border-radius**

Change all `borderRadius: 4` and `borderRadius: '0 0 4px 4px'` references to `borderRadius: 12` (and `'0 0 12px 12px'` for the connected dropdown state).

- [ ] **Step 2: Update dropdown styling**

Change dropdown container:
- `borderRadius: 12` (or `'0 0 12px 12px'` when connected to input)
- `background: c.surface` (already correct)
- `border: 1px solid ${c.border}` (remove green border on focus — use theme border)
- Remove `boxShadow` green glow; replace with subtle `boxShadow: '0 8px 32px rgba(0,0,0,0.3)'`

- [ ] **Step 3: Update result row hover states**

Change hover background from `${c.green}12` to `${c.surface}` with `borderLeft: 3px solid ${c.green}` kept. Or simplify to just a lighter background on hover: `background: '#141c28'` (a shade between bg and surface).

- [ ] **Step 4: Commit**

```bash
git add app/components/NavSearch.tsx
git commit -m "feat: update NavSearch — rounded dropdown, subtle borders"
```

---

## Chunk 3: Sub-Components

### Task 6: Update MoverCard

**Files:**
- Modify: `app/components/widgets/MoverCard.tsx`

- [ ] **Step 1: Update card styling**

Change container inline styles:
- `borderRadius: 16` (was `rounded` / 4px)
- `padding: 22` (was `p-5` / 20px)
- `background: c.surface` (was `c.bg`)
- `border: 1px solid ${c.border}` (keep)
- Remove `borderLeft: 3px solid ${accentColor}` — no more left accent

Change Tailwind class from `rounded` to remove it (using inline borderRadius).

- [ ] **Step 2: Update sparkline bars**

Change sparkline container from `h-6` to `h-7` (28px) and bars from `rounded-[1px]` to `rounded-[3px]`.
Set explicit bar width: `width: 7` instead of `flex-1`.

- [ ] **Step 3: Commit**

```bash
git add app/components/widgets/MoverCard.tsx
git commit -m "feat: update MoverCard — 16px radius, no left accent, wider sparklines"
```

### Task 7: Update SaleCard

**Files:**
- Modify: `app/components/widgets/SaleCard.tsx`

- [ ] **Step 1: Update card styling**

Change container:
- `borderRadius: 16` (was `rounded`)
- `padding: 16` (was implicit from layout)
- `background: c.surface`
- Remove `borderLeft: 3px solid ${c.green}` — no left accent
- `minWidth: 220` (was 160)

- [ ] **Step 2: Commit**

```bash
git add app/components/widgets/SaleCard.tsx
git commit -m "feat: update SaleCard — 16px radius, wider cards, no left accent"
```

### Task 8: Update SignalRow

**Files:**
- Modify: `app/components/widgets/SignalRow.tsx`

- [ ] **Step 1: Update row styling**

Change container:
- `borderRadius: 12` (slightly less than cards since it's a row)
- `padding: '12px 18px'` (was `px-5 py-3.5`)
- `background: c.surface`

Change signal badge:
- BUY: `background: '#00ff8718'`, `color: '#00ff87'` (was solid bg with dark text)
- SELL: `background: '#ff3b5c18'`, `color: '#ff3b5c'`
- HOLD: `background: '#f0b42918'`, `color: '#f0b429'`
- `borderRadius: 6` (was `rounded-sm`)

Change score display: `fontSize: 15, fontWeight: 600`

- [ ] **Step 2: Commit**

```bash
git add app/components/widgets/SignalRow.tsx
git commit -m "feat: update SignalRow — pill badges, spacious padding"
```

### Task 9: Update SportsNewsRow

**Files:**
- Modify: `app/components/widgets/SportsNewsRow.tsx`

- [ ] **Step 1: Update featured variant**

Change container:
- `borderRadius: 16` (was `rounded-md`)
- Remove the `height: 3` green top bar (no more colored top accents)
- Content padding: `padding: '18px 22px'`

- [ ] **Step 2: Update regular variant**

Change row padding to `padding: '10px 0'`.
Change divider border from `c.border` to `#141c28`.
League tag: `background: '#1e2a3a'`, `borderRadius: 4`, `padding: '2px 6px'`.

- [ ] **Step 3: Commit**

```bash
git add app/components/widgets/SportsNewsRow.tsx
git commit -m "feat: update SportsNewsRow — remove top accent, spacious padding"
```

### Task 10: Update NewsCard

**Files:**
- Modify: `app/components/widgets/NewsCard.tsx`

- [ ] **Step 1: Update card styling**

Change container:
- `borderRadius: 16` (was `rounded`)
- `padding: 18` (was `p-5`)
- `background: c.surface`

- [ ] **Step 2: Commit**

```bash
git add app/components/widgets/NewsCard.tsx
git commit -m "feat: update NewsCard — 16px radius, updated padding"
```

### Task 11: Update ScoreBugRow

**Files:**
- Modify: `app/components/widgets/ScoreBugRow.tsx`

- [ ] **Step 1: Update row styling**

Change container:
- `borderRadius: 12` (was `rounded-md`)
- `padding: '10px 14px'` (was `px-3 py-2`)
- Keep live green border behavior

- [ ] **Step 2: Commit**

```bash
git add app/components/widgets/ScoreBugRow.tsx
git commit -m "feat: update ScoreBugRow — 12px radius, spacious padding"
```

---

## Chunk 4: Complex Widgets

### Task 12: Update FullSchedule

**Files:**
- Modify: `app/components/widgets/FullSchedule.tsx`

- [ ] **Step 1: Update the self-contained header**

FullSchedule renders its own header (not WidgetShell's). Update:
- Container: `borderRadius: 16`, remove `borderTop: 2px solid` accent
- Header padding: `padding: '18px 22px 8px'`

- [ ] **Step 2: Update league sub-tabs**

Change tab styling to pill-style:
- `borderRadius: 6`, `padding: '4px 10px'`
- Active: `color: c.green`, `background: ${c.green}12`
- Inactive: `color: c.muted`
- Remove `borderBottom` active indicator on these tabs

- [ ] **Step 3: Update score row dividers**

Change `borderBottom` color in score rows from `c.border` to `#141c28`.
Content padding: `padding: '0 22px 22px'`.

- [ ] **Step 4: Update mini calendar dropdown**

Change dropdown: `borderRadius: 12` (was `0 0 4px 4px`).

- [ ] **Step 5: Commit**

```bash
git add app/components/widgets/FullSchedule.tsx
git commit -m "feat: update FullSchedule — pill tabs, spacious layout, rounded calendar"
```

### Task 13: Update F1Results

**Files:**
- Modify: `app/components/widgets/F1Results.tsx`

- [ ] **Step 1: Update tab styling**

Change F1 tabs to pill-style (matching FullSchedule):
- `borderRadius: 6`, `padding: '4px 10px'`
- Active: `color: '#E8002D'`, `background: '#E8002D12'`
- Remove `borderBottom` indicator

- [ ] **Step 2: Update result row styling**

Change result rows:
- `borderRadius: 8` (was `rounded`)
- `padding: '8px 12px'` (was `px-2 py-1`)

- [ ] **Step 3: Update standings sub-tabs**

Same pill-style treatment as other tabs.

- [ ] **Step 4: Update content padding**

Change `px-5 pb-4` to `padding: '0 22px 22px'`.

- [ ] **Step 5: Commit**

```bash
git add app/components/widgets/F1Results.tsx
git commit -m "feat: update F1Results — pill tabs, spacious rows"
```

### Task 14: Update MarketMovers widget wrapper

**Files:**
- Modify: `app/components/widgets/MarketMovers.tsx`

- [ ] **Step 1: Update toggle buttons**

Change RISERS/FALLERS toggle buttons:
- Active: `border: 1px solid ${c.green}`, `color: c.green`, `background: ${c.green}12`, `borderRadius: 6`, `padding: '3px 8px'`
- Inactive: `border: 1px solid ${c.border}`, `color: c.muted`, `borderRadius: 6`

- [ ] **Step 2: Update grid gaps**

Change the card grid gap from `gap-3`/`gap-4` to `gap-5` (20px).

- [ ] **Step 3: Commit**

```bash
git add app/components/widgets/MarketMovers.tsx
git commit -m "feat: update MarketMovers — pill toggles, wider gaps"
```

---

## Chunk 5: Pages

### Task 15: Update homepage layout

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Update container**

Change max-width from `max-w-[1800px]` to `max-w-[1600px]`.
Change padding from `px-8 md:px-12 lg:px-16 py-6` to `px-7 md:px-8 lg:px-8 py-7` (28px/32px).
Change `gap-5` to `gap-7` (28px between sections).

- [ ] **Step 2: Update layout structure**

Change the 2-column sidebar layout to a 3-column widget row:
- Remove `lg:w-[300px] lg:shrink-0` sidebar pattern
- Main widgets row: `display: flex, gap: 24px`
  - Scores: `flex: '0 0 340px'`
  - News: `flex: 1`
  - Signals: `flex: '0 0 380px'`
- Market Movers stays full-width above
- Recent Sales stays full-width below
- Card News stays full-width below that

- [ ] **Step 3: Update footer**

Change footer:
- `marginTop: 40` (was `mt-10`)
- `padding: '24px 0'`
- `borderTop: 1px solid ${c.border}`
- Remove `background: c.surface` — use transparent
- Logo color: `c.muted`

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat: update homepage — 3-col layout, spacious gaps, 1600px max"
```

### Task 16: Update card detail page

**Files:**
- Modify: `app/cards/[slug]/page.tsx`

- [ ] **Step 1: Update container spacing**

Change max-width from `max-w-[1400px]` to `max-w-[1400px]` (keep).
Change padding to match homepage: `px-7 md:px-8 lg:px-8 py-8`.

- [ ] **Step 2: Update card containers**

All `rounded-lg` and `rounded` → inline `borderRadius: 16`.
All stat boxes, chart containers, listing cards: `borderRadius: 16`, `background: c.surface`, `border: 1px solid ${c.border}`.
Remove any `borderLeft: 3px solid` accents on stat boxes.

- [ ] **Step 3: Update chart container**

Chart wrapper: `borderRadius: 16`, `padding: 22`.

- [ ] **Step 4: Update eBay listings grid**

Listing cards: `borderRadius: 16`, increased padding, hover border `#2a3a4a`.
Grid gap from `gap-3` to `gap-4`.

- [ ] **Step 5: Commit**

```bash
git add "app/cards/[slug]/page.tsx"
git commit -m "feat: update card detail page — 16px radius, spacious layout"
```

---

## Chunk 6: Final Verification

### Task 17: Visual verification and fixes

- [ ] **Step 1: Start dev server and verify homepage**

```bash
npm run dev
```

Open http://localhost:3000. Verify:
- Nav shows logo | league tabs | search in one row
- Market Movers cards have 16px radius, no left accent
- Widgets row is 3-column (Scores | News | Signals)
- All cards have `#111827` background on `#0a0f1a` page bg
- No colored top-borders on any widget

- [ ] **Step 2: Verify card detail page**

Navigate to any card detail page. Verify:
- 16px radius on all containers
- Chart renders properly in rounded container
- Stats boxes have no left accent borders
- eBay listings grid has proper spacing

- [ ] **Step 3: Verify light mode**

Toggle to light mode. Verify:
- White/light gray backgrounds render correctly
- Green accent is `#16a34a` (not neon)
- All text is readable
- No dark-mode colors leaking through

- [ ] **Step 4: Verify mobile responsive**

Resize to mobile width. Verify:
- Nav collapses gracefully (tabs may scroll or hide)
- Widgets stack vertically
- Cards still have proper radius and padding

- [ ] **Step 5: Fix any visual issues found**

Address any rendering problems, overflow issues, or color mismatches.

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "fix: visual polish — address any issues from redesign verification"
```
