# Wave 1 — Beginner Collector Tools Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build three collector education tools (Parallel Decoder, Box Guide, Product Explainer) with a shared landing page, all reading from an existing Supabase database.

**Architecture:** Next.js App Router pages with API routes querying Supabase. Client components manage step-wizard state synced to URL search params. Shared components (SportPicker, ExpandableSection, RarityBadge) used across tools. ThemeProvider from existing codebase provides colors. No new dependencies needed beyond what's installed.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, Supabase (existing client), existing ThemeProvider

**Spec:** `docs/superpowers/specs/2026-03-12-wave1-beginner-tools-design.md`

---

## File Structure

```
app/
  layout.tsx                              # MODIFY — wrap children in ThemeProvider
  page.tsx                                # REPLACE — landing page with 3 tool cards
  decoder/
    page.tsx                              # CREATE — Parallel Decoder wizard
  guide/
    page.tsx                              # CREATE — Box Guide wizard
  learn/
    page.tsx                              # CREATE — Topic index grid
    [slug]/
      page.tsx                            # CREATE — Individual topic page
  api/
    decoder/
      products/route.ts                   # CREATE — GET products by sport
      parallels/route.ts                  # CREATE — GET parallels by productId
    guide/
      recommend/route.ts                  # CREATE — GET boxes by sport+budget+store
    learn/
      topics/route.ts                     # CREATE — GET all topics
      topics/[slug]/route.ts              # CREATE — GET single topic by slug
  components/
    shared/
      Header.tsx                          # CREATE — minimal logo + back nav
      SportPicker.tsx                     # CREATE — 4-sport button grid
      ExpandableSection.tsx               # CREATE — collapsible content block
      RarityBadge.tsx                     # CREATE — rarity pill badge
      StepIndicator.tsx                   # CREATE — dot progress + breadcrumbs
      Skeleton.tsx                        # CREATE — loading skeleton primitives
      EmptyState.tsx                      # CREATE — contextual empty/error messages
    decoder/
      ProductGrid.tsx                     # CREATE — 2-col product picker
      ParallelList.tsx                    # CREATE — color swatch parallel picker
      DecoderResult.tsx                   # CREATE — result card with expandables
    guide/
      BudgetPicker.tsx                    # CREATE — budget range buttons
      StorePicker.tsx                     # CREATE — retailer selection buttons
      BoxCard.tsx                         # CREATE — box recommendation card
    learn/
      TopicCard.tsx                       # CREATE — topic index card
      TopicContent.tsx                    # CREATE — markdown topic renderer
lib/
  supabase.ts                             # EXISTS — no changes
  types.ts                                # CREATE — shared TypeScript types
  rarity.ts                               # CREATE — rarity badge algorithm
  format.ts                               # CREATE — config_type display names, price labels
scripts/
  migrations/
    003-add-pros-cons-columns.sql         # CREATE — ALTER TABLE for pros_cons
    004-create-topics-table.sql           # CREATE — CREATE TABLE topics
    005-seed-topics.sql                   # CREATE — INSERT initial topic content
```

---

## Chunk 1: Foundation — Types, Utilities, Schema, Layout

### Task 1: TypeScript Types

**Files:**
- Create: `lib/types.ts`

- [ ] **Step 1: Create shared type definitions**

```typescript
// lib/types.ts

// Database row types (snake_case, matching Supabase)
export interface DbProduct {
  id: string;
  brand_id: string;
  name: string;
  sport: string;
  year: string;
  description: string;
  release_date: string | null;
  is_flagship: boolean;
  pros_cons: { pros: string[]; cons: string[] } | null;
}

export interface DbParallel {
  id: string;
  product_id: string;
  name: string;
  color_hex: string;
  print_run: number | null;
  serial_numbered: boolean;
  rarity_rank: number;
  is_one_of_one: boolean;
  description: string;
  special_attributes: string[] | null;
}

export interface DbBoxConfig {
  id: string;
  product_id: string;
  config_type: string;
  retail_price_usd: number | null;
  packs_per_box: number;
  cards_per_pack: number;
  guaranteed_hits: string | null;
  odds_auto: string | null;
  odds_relic: string | null;
  odds_numbered: string | null;
  description: string;
  pros_cons: { pros: string[]; cons: string[] } | null;
}

export interface DbRetailer {
  id: string;
  name: string;
}

export interface DbProductRetailer {
  id: string;
  product_id: string;
  retailer_id: string;
  config_types: string[];
  notes: string | null;
}

export interface DbTopic {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  body: string;
  related_product_ids: string[] | null;
  related_topic_slugs: string[] | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// API response types (camelCase)
export interface ProductItem {
  id: string;
  name: string;
  year: string;
  isFlagship: boolean;
  description: string;
}

export interface ParallelItem {
  id: string;
  name: string;
  colorHex: string;
  printRun: number | null;
  serialNumbered: boolean;
  rarityRank: number;
  isOneOfOne: boolean;
  description: string;
  specialAttributes: string[] | null;
  totalParallels: number;
}

export interface BoxResult {
  product: {
    id: string;
    name: string;
    year: string;
    isFlagship: boolean;
    prosCons: { pros: string[]; cons: string[] } | null;
  };
  boxConfig: {
    id: string;
    configType: string;
    retailPriceUsd: number | null;
    packsPerBox: number;
    cardsPerPack: number;
    guaranteedHits: string | null;
    oddsAuto: string | null;
    oddsRelic: string | null;
    oddsNumbered: string | null;
    description: string;
    prosCons: { pros: string[]; cons: string[] } | null;
  };
  retailer: {
    name: string;
    notes: string | null;
  };
}

export interface TopicItem {
  slug: string;
  title: string;
  category: string;
  summary: string;
  sortOrder: number;
}

export interface TopicDetail extends TopicItem {
  body: string;
  relatedProductNames: string[];
  relatedTopicSlugs: string[];
}

// Sport config
export const SPORTS = [
  { label: 'Basketball', value: 'NBA', icon: '🏀' },
  { label: 'Football', value: 'NFL', icon: '🏈' },
  { label: 'Baseball', value: 'MLB', icon: '⚾' },
  { label: 'Hockey', value: 'NHL', icon: '🏒' },
] as const;

export type SportValue = typeof SPORTS[number]['value'];
```

- [ ] **Step 2: Commit**

```bash
git add lib/types.ts
git commit -m "feat: add shared TypeScript types for Wave 1 tools"
```

---

### Task 2: Rarity & Format Utilities

**Files:**
- Create: `lib/rarity.ts`
- Create: `lib/format.ts`

- [ ] **Step 1: Create rarity badge utility**

```typescript
// lib/rarity.ts

export type RarityLevel = 'COMMON' | 'UNCOMMON' | 'RARE' | 'ULTRA RARE' | '1/1';

export function getRarityLevel(rarityRank: number, totalParallels: number, isOneOfOne: boolean): RarityLevel {
  if (isOneOfOne) return '1/1';
  const ratio = rarityRank / totalParallels;
  if (ratio < 0.25) return 'COMMON';
  if (ratio < 0.55) return 'UNCOMMON';
  if (ratio < 0.85) return 'RARE';
  return 'ULTRA RARE';
}

// Returns the ThemeProvider color key for each rarity level
export function getRarityColorKey(level: RarityLevel): string {
  switch (level) {
    case 'COMMON': return 'muted';
    case 'UNCOMMON': return 'green';
    case 'RARE': return 'amber';
    case 'ULTRA RARE': return 'red';
    case '1/1': return 'purple';
  }
}
```

- [ ] **Step 2: Create format utility**

```typescript
// lib/format.ts

const CONFIG_TYPE_LABELS: Record<string, string> = {
  hobby_box: 'Hobby Box',
  blaster: 'Blaster Box',
  mega_box: 'Mega Box',
  hanger: 'Hanger Pack',
  fat_pack: 'Fat Pack',
  cello: 'Cello Pack',
  retail_box: 'Retail Box',
  value_pack: 'Value Pack',
  gravity_feed: 'Gravity Feed',
};

export function formatConfigType(configType: string): string {
  return CONFIG_TYPE_LABELS[configType] || configType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function formatPrintRun(printRun: number | null): string {
  if (printRun === null) return 'Unlimited';
  if (printRun === 1) return '1/1';
  return `/${printRun}`;
}

export function formatPrice(price: number | null): string {
  if (price === null) return 'Price unavailable';
  return `$${price.toFixed(2)}`;
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/rarity.ts lib/format.ts
git commit -m "feat: add rarity badge algorithm and format utilities"
```

---

### Task 3: Database Migrations

**Files:**
- Create: `scripts/migrations/003-add-pros-cons-columns.sql`
- Create: `scripts/migrations/004-create-topics-table.sql`

- [ ] **Step 1: Create pros_cons migration**

```sql
-- scripts/migrations/003-add-pros-cons-columns.sql
-- Adds pros/cons JSONB columns for opinionated guidance in Box Guide

ALTER TABLE products ADD COLUMN IF NOT EXISTS pros_cons JSONB;
ALTER TABLE box_configurations ADD COLUMN IF NOT EXISTS pros_cons JSONB;

COMMENT ON COLUMN products.pros_cons IS 'Product-level pros/cons for Box Guide, e.g. {"pros": ["Best resale value"], "cons": ["Expensive"]}';
COMMENT ON COLUMN box_configurations.pros_cons IS 'Box-config-level pros/cons for Box Guide, e.g. {"pros": ["Guaranteed auto"], "cons": ["Low retail odds"]}';
```

- [ ] **Step 2: Create topics table migration**

```sql
-- scripts/migrations/004-create-topics-table.sql
-- Creates topics table for Product Explainer / Learn the Hobby

CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  summary TEXT NOT NULL,
  body TEXT NOT NULL,
  related_product_ids UUID[],
  related_topic_slugs TEXT[],
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE topics IS 'Educational topic pages for Learn the Hobby tool';
COMMENT ON COLUMN topics.category IS 'product or concept';
COMMENT ON COLUMN topics.body IS 'Markdown content rendered on topic page';
```

- [ ] **Step 3: Run migrations against Supabase**

Run each SQL file in the Supabase SQL Editor (Dashboard → SQL Editor → paste and run).

- [ ] **Step 4: Commit**

```bash
git add scripts/migrations/003-add-pros-cons-columns.sql scripts/migrations/004-create-topics-table.sql
git commit -m "feat: add database migrations for pros_cons columns and topics table"
```

---

### Task 4: Update Layout with ThemeProvider

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Wrap layout with ThemeProvider**

The current layout.tsx is a bare HTML shell. Add ThemeProvider so all pages can use `useTheme()`.

```typescript
// app/layout.tsx
import type { Metadata } from 'next';
import { ThemeProvider } from './components/ThemeProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'SlabStreet — Smart Collecting Starts Here',
  description: 'Sports card intelligence tools for collectors. Identify your pulls, find the best boxes, and learn the hobby.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#0a0f1a' }}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Verify dev server starts**

Run: `npm run dev`
Expected: Server starts on localhost:3000 without errors.

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: wrap root layout with ThemeProvider for Wave 1 tools"
```

---

### Task 5: Shared UI Components

**Files:**
- Create: `app/components/shared/Header.tsx`
- Create: `app/components/shared/SportPicker.tsx`
- Create: `app/components/shared/ExpandableSection.tsx`
- Create: `app/components/shared/RarityBadge.tsx`
- Create: `app/components/shared/StepIndicator.tsx`
- Create: `app/components/shared/Skeleton.tsx`
- Create: `app/components/shared/EmptyState.tsx`

- [ ] **Step 1: Create Header**

```typescript
// app/components/shared/Header.tsx
'use client';

import Link from 'next/link';
import { useTheme } from '../ThemeProvider';

interface HeaderProps {
  showBack?: boolean;
}

export function Header({ showBack = false }: HeaderProps) {
  const { colors } = useTheme();

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      padding: '16px 20px',
      gap: 12,
    }}>
      {showBack && (
        <Link href="/" style={{ color: colors.muted, textDecoration: 'none', fontSize: 20 }}>
          ←
        </Link>
      )}
      <Link href="/" style={{ textDecoration: 'none' }}>
        <span style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 24,
          letterSpacing: 4,
          color: colors.green,
        }}>
          SLABSTREET
        </span>
      </Link>
    </header>
  );
}
```

- [ ] **Step 2: Create SportPicker**

```typescript
// app/components/shared/SportPicker.tsx
'use client';

import { useTheme } from '../ThemeProvider';
import { SPORTS, type SportValue } from '../../../lib/types';

interface SportPickerProps {
  onSelect: (sport: SportValue) => void;
}

export function SportPicker({ onSelect }: SportPickerProps) {
  const { colors } = useTheme();

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: 16,
      padding: '20px 0',
      maxWidth: 400,
      margin: '0 auto',
    }}>
      {SPORTS.map((sport) => (
        <button
          key={sport.value}
          onClick={() => onSelect(sport.value)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            padding: '24px 16px',
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: 16,
            cursor: 'pointer',
            transition: 'border-color 0.15s',
            color: colors.text,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = colors.green)}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = colors.border)}
        >
          <span style={{ fontSize: 32 }}>{sport.icon}</span>
          <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, fontWeight: 500 }}>
            {sport.label}
          </span>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: colors.muted }}>
            {sport.value}
          </span>
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Create ExpandableSection**

```typescript
// app/components/shared/ExpandableSection.tsx
'use client';

import { useState } from 'react';
import { useTheme } from '../ThemeProvider';

interface ExpandableSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function ExpandableSection({ title, children, defaultOpen = false }: ExpandableSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const { colors } = useTheme();

  return (
    <div style={{ borderTop: `1px solid ${colors.border}`, marginTop: 12 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: '100%',
          padding: '12px 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: colors.green,
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: 14,
          fontWeight: 500,
          textAlign: 'left',
        }}
      >
        <span style={{
          display: 'inline-block',
          transition: 'transform 0.15s',
          transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
          fontSize: 10,
        }}>
          ▶
        </span>
        {title}
      </button>
      {open && (
        <div style={{ padding: '0 0 12px 18px', color: colors.secondary, fontSize: 14, lineHeight: 1.7 }}>
          {children}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Create RarityBadge**

```typescript
// app/components/shared/RarityBadge.tsx
'use client';

import { useTheme } from '../ThemeProvider';
import { getRarityLevel, getRarityColorKey, type RarityLevel } from '../../../lib/rarity';

interface RarityBadgeProps {
  rarityRank: number;
  totalParallels: number;
  isOneOfOne: boolean;
}

export function RarityBadge({ rarityRank, totalParallels, isOneOfOne }: RarityBadgeProps) {
  const { colors } = useTheme();
  const level = getRarityLevel(rarityRank, totalParallels, isOneOfOne);
  const colorKey = getRarityColorKey(level) as keyof typeof colors;
  const color = colors[colorKey];

  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 999,
      fontSize: 10,
      fontFamily: "'IBM Plex Mono', monospace",
      fontWeight: 600,
      letterSpacing: 0.5,
      color: color,
      border: `1px solid ${color}`,
      background: `${color}15`,
      whiteSpace: 'nowrap',
    }}>
      {level}
    </span>
  );
}
```

- [ ] **Step 5: Create StepIndicator**

```typescript
// app/components/shared/StepIndicator.tsx
'use client';

import { useTheme } from '../ThemeProvider';

interface StepIndicatorProps {
  totalSteps: number;
  currentStep: number;
  breadcrumbs: string[];
  onBreadcrumbClick: (stepIndex: number) => void;
}

export function StepIndicator({ totalSteps, currentStep, breadcrumbs, onBreadcrumbClick }: StepIndicatorProps) {
  const { colors } = useTheme();

  return (
    <div style={{ padding: '8px 0' }}>
      {/* Dots */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 8 }}>
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: i <= currentStep ? colors.green : colors.border,
              transition: 'background 0.2s',
            }}
          />
        ))}
      </div>
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <div style={{
          display: 'flex',
          gap: 4,
          justifyContent: 'center',
          flexWrap: 'wrap',
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 12,
          color: colors.muted,
        }}>
          {breadcrumbs.map((crumb, i) => (
            <span key={i}>
              {i > 0 && <span style={{ margin: '0 4px' }}>›</span>}
              <button
                onClick={() => onBreadcrumbClick(i)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: i < currentStep ? colors.green : colors.text,
                  cursor: i < currentStep ? 'pointer' : 'default',
                  fontFamily: 'inherit',
                  fontSize: 'inherit',
                  padding: 0,
                  textDecoration: i < currentStep ? 'underline' : 'none',
                }}
              >
                {crumb}
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Create Skeleton and EmptyState**

```typescript
// app/components/shared/Skeleton.tsx
'use client';

import { useTheme } from '../ThemeProvider';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: number;
}

export function Skeleton({ width = '100%', height = 20, borderRadius = 8 }: SkeletonProps) {
  const { colors } = useTheme();

  return (
    <div style={{
      width,
      height,
      borderRadius,
      background: `linear-gradient(90deg, ${colors.surface} 25%, ${colors.border} 50%, ${colors.surface} 75%)`,
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
    }} />
  );
}

export function SkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} height={80} borderRadius={16} />
      ))}
    </div>
  );
}
```

```typescript
// app/components/shared/EmptyState.tsx
'use client';

import { useTheme } from '../ThemeProvider';

interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ message, actionLabel, onAction }: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 16,
      padding: '48px 20px',
      color: colors.muted,
      fontSize: 15,
      textAlign: 'center',
      fontFamily: "'IBM Plex Sans', sans-serif",
    }}>
      <p>{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          style={{
            padding: '8px 20px',
            background: 'none',
            border: `1px solid ${colors.green}`,
            borderRadius: 8,
            color: colors.green,
            cursor: 'pointer',
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: 14,
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 7: Verify dev server still works**

Run: `npm run dev`
Expected: No compile errors.

- [ ] **Step 8: Commit**

```bash
git add app/components/shared/
git commit -m "feat: add shared UI components — Header, SportPicker, ExpandableSection, RarityBadge, StepIndicator, Skeleton, EmptyState"
```

---

## Chunk 2: Landing Page + API Routes

### Task 6: Landing Page

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Replace coming-soon page with tool cards**

```typescript
// app/page.tsx
'use client';

import Link from 'next/link';
import { useTheme } from './components/ThemeProvider';

const tools = [
  {
    href: '/decoder',
    title: 'What Did I Pull?',
    description: 'Identify any card by matching its color and pattern',
    icon: '🔍',
  },
  {
    href: '/guide',
    title: 'What Should I Buy?',
    description: 'Find the best box for your budget and store',
    icon: '🛒',
  },
  {
    href: '/learn',
    title: 'Learn the Hobby',
    description: 'Understand products, parallels, grading, and more',
    icon: '📚',
  },
];

export default function HomePage() {
  const { colors } = useTheme();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.25rem',
      fontFamily: "'IBM Plex Sans', sans-serif",
    }}>
      {/* Logo */}
      <h1 style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 'clamp(3rem, 8vw, 6rem)',
        letterSpacing: 8,
        color: colors.green,
        marginBottom: 4,
        lineHeight: 1,
      }}>
        SLABSTREET
      </h1>

      {/* Tagline */}
      <p style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 'clamp(0.65rem, 2vw, 0.85rem)',
        letterSpacing: 4,
        color: colors.muted,
        textTransform: 'uppercase',
        marginBottom: 48,
      }}>
        Smart collecting starts here
      </p>

      {/* Tool Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 20,
        width: '100%',
        maxWidth: 960,
      }}>
        {tools.map((tool) => (
          <Link key={tool.href} href={tool.href} style={{ textDecoration: 'none' }}>
            <div style={{
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: 16,
              padding: '32px 24px',
              cursor: 'pointer',
              transition: 'border-color 0.15s, transform 0.15s',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colors.green;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.border;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span style={{ fontSize: 36 }}>{tool.icon}</span>
              <h2 style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 28,
                letterSpacing: 2,
                color: colors.text,
                margin: 0,
              }}>
                {tool.title}
              </h2>
              <p style={{
                color: colors.muted,
                fontSize: 14,
                lineHeight: 1.5,
                margin: 0,
              }}>
                {tool.description}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        marginTop: 'auto',
        paddingTop: 48,
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '0.65rem',
        color: colors.muted,
        letterSpacing: 2,
        opacity: 0.5,
      }}>
        slabstreet.io
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify in browser**

Run: `npm run dev`, open http://localhost:3000
Expected: Three tool cards visible, hover states work, links navigate (to 404 pages for now).

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: replace coming-soon page with Wave 1 landing page — 3 tool cards"
```

---

### Task 7: Decoder API Routes

**Files:**
- Create: `app/api/decoder/products/route.ts`
- Create: `app/api/decoder/parallels/route.ts`

- [ ] **Step 1: Create products API**

```typescript
// app/api/decoder/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export async function GET(request: NextRequest) {
  const sport = request.nextUrl.searchParams.get('sport');

  if (!sport) {
    return NextResponse.json({ error: 'sport parameter required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('products')
    .select('id, name, year, is_flagship, description')
    .eq('sport', sport)
    .order('year', { ascending: false })
    .order('is_flagship', { ascending: false })
    .order('name', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const products = (data || []).map(row => ({
    id: row.id,
    name: row.name,
    year: row.year,
    isFlagship: row.is_flagship,
    description: row.description,
  }));

  return NextResponse.json({ products }, {
    headers: { 'Cache-Control': 'public, max-age=3600' },
  });
}
```

- [ ] **Step 2: Create parallels API**

```typescript
// app/api/decoder/parallels/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export async function GET(request: NextRequest) {
  const productId = request.nextUrl.searchParams.get('productId');

  if (!productId) {
    return NextResponse.json({ error: 'productId parameter required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('parallels')
    .select('id, name, color_hex, print_run, serial_numbered, rarity_rank, is_one_of_one, description, special_attributes')
    .eq('product_id', productId)
    .order('rarity_rank', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const totalParallels = (data || []).length;
  const parallels = (data || []).map(row => ({
    id: row.id,
    name: row.name,
    colorHex: row.color_hex,
    printRun: row.print_run,
    serialNumbered: row.serial_numbered,
    rarityRank: row.rarity_rank,
    isOneOfOne: row.is_one_of_one,
    description: row.description,
    specialAttributes: row.special_attributes,
    totalParallels,
  }));

  return NextResponse.json({ parallels, totalParallels }, {
    headers: { 'Cache-Control': 'public, max-age=3600' },
  });
}
```

- [ ] **Step 3: Test APIs**

Run: `npm run dev`
Test: `curl "http://localhost:3000/api/decoder/products?sport=NBA"` — should return NBA products
Test: Pick a product ID from the response and test: `curl "http://localhost:3000/api/decoder/parallels?productId=<id>"` — should return parallels with color_hex values

- [ ] **Step 4: Commit**

```bash
git add app/api/decoder/
git commit -m "feat: add Decoder API routes — products by sport, parallels by product"
```

---

### Task 8: Guide API Route

**Files:**
- Create: `app/api/guide/recommend/route.ts`

- [ ] **Step 1: Create recommend API**

```typescript
// app/api/guide/recommend/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const sport = params.get('sport');
  const budgetMin = params.get('budgetMin');
  const budgetMax = params.get('budgetMax');
  const store = params.get('store');

  if (!sport) {
    return NextResponse.json({ error: 'sport parameter required' }, { status: 400 });
  }

  // Build query: products joined with box_configurations
  let query = supabase
    .from('box_configurations')
    .select(`
      id,
      config_type,
      retail_price_usd,
      packs_per_box,
      cards_per_pack,
      guaranteed_hits,
      odds_auto,
      odds_relic,
      odds_numbered,
      description,
      pros_cons,
      products!inner (
        id,
        name,
        year,
        is_flagship,
        pros_cons
      )
    `)
    .eq('products.sport', sport);

  // Budget filter
  if (budgetMin) {
    query = query.gte('retail_price_usd', parseFloat(budgetMin));
  }
  if (budgetMax) {
    query = query.lte('retail_price_usd', parseFloat(budgetMax));
  }

  query = query.order('retail_price_usd', { ascending: true });

  const { data: boxData, error: boxError } = await query;

  if (boxError) {
    return NextResponse.json({ error: boxError.message }, { status: 500 });
  }

  // If store filter, get matching retailer mappings
  let retailerMap: Record<string, { name: string; notes: string | null; configTypes: string[] }> = {};

  if (store && store !== 'all') {
    const storeNames = store === 'amazon_fanatics' ? ['Amazon', 'Fanatics'] : [store];

    const { data: prData } = await supabase
      .from('product_retailers')
      .select(`
        product_id,
        config_types,
        notes,
        retailers!inner (
          name
        )
      `)
      .in('retailers.name', storeNames);

    if (prData) {
      for (const row of prData) {
        const key = `${row.product_id}`;
        const retailer = row.retailers as any;
        if (!retailerMap[key]) {
          retailerMap[key] = { name: retailer.name, notes: row.notes, configTypes: row.config_types || [] };
        } else {
          retailerMap[key].configTypes.push(...(row.config_types || []));
        }
      }
    }
  }

  // Shape results
  const results = (boxData || [])
    .filter(row => {
      if (!store || store === 'all') return true;
      const product = row.products as any;
      const mapping = retailerMap[product.id];
      if (!mapping) return false;
      return mapping.configTypes.includes(row.config_type);
    })
    .map(row => {
      const product = row.products as any;
      const mapping = retailerMap[product.id];
      return {
        product: {
          id: product.id,
          name: product.name,
          year: product.year,
          isFlagship: product.is_flagship,
          prosCons: product.pros_cons,
        },
        boxConfig: {
          id: row.id,
          configType: row.config_type,
          retailPriceUsd: row.retail_price_usd,
          packsPerBox: row.packs_per_box,
          cardsPerPack: row.cards_per_pack,
          guaranteedHits: row.guaranteed_hits,
          oddsAuto: row.odds_auto,
          oddsRelic: row.odds_relic,
          oddsNumbered: row.odds_numbered,
          description: row.description,
          prosCons: row.pros_cons,
        },
        retailer: mapping ? { name: mapping.name, notes: mapping.notes } : null,
      };
    })
    // Sort: flagship first, then price
    .sort((a, b) => {
      if (a.product.isFlagship !== b.product.isFlagship) return a.product.isFlagship ? -1 : 1;
      return (a.boxConfig.retailPriceUsd || 0) - (b.boxConfig.retailPriceUsd || 0);
    });

  return NextResponse.json({ results }, {
    headers: { 'Cache-Control': 'public, max-age=3600' },
  });
}
```

- [ ] **Step 2: Test API**

Run: `curl "http://localhost:3000/api/guide/recommend?sport=NBA&budgetMin=25&budgetMax=50"`
Expected: Array of box configs with product info.

- [ ] **Step 3: Commit**

```bash
git add app/api/guide/
git commit -m "feat: add Box Guide recommend API route with sport, budget, and store filtering"
```

---

### Task 9: Learn API Routes

**Files:**
- Create: `app/api/learn/topics/route.ts`
- Create: `app/api/learn/topics/[slug]/route.ts`

- [ ] **Step 1: Create topics list API**

```typescript
// app/api/learn/topics/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export async function GET() {
  const { data, error } = await supabase
    .from('topics')
    .select('slug, title, category, summary, sort_order')
    .order('category', { ascending: true })
    .order('sort_order', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const topics = (data || []).map(row => ({
    slug: row.slug,
    title: row.title,
    category: row.category,
    summary: row.summary,
    sortOrder: row.sort_order,
  }));

  return NextResponse.json({ topics }, {
    headers: { 'Cache-Control': 'public, max-age=86400' },
  });
}
```

- [ ] **Step 2: Create single topic API**

```typescript
// app/api/learn/topics/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../../lib/supabase';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const { data: topic, error } = await supabase
    .from('topics')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !topic) {
    return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
  }

  // Resolve related product names
  let relatedProductNames: string[] = [];
  if (topic.related_product_ids && topic.related_product_ids.length > 0) {
    const { data: products } = await supabase
      .from('products')
      .select('name')
      .in('id', topic.related_product_ids);
    relatedProductNames = (products || []).map(p => p.name);
  }

  return NextResponse.json({
    slug: topic.slug,
    title: topic.title,
    category: topic.category,
    summary: topic.summary,
    sortOrder: topic.sort_order,
    body: topic.body,
    relatedProductNames,
    relatedTopicSlugs: topic.related_topic_slugs || [],
  }, {
    headers: { 'Cache-Control': 'public, max-age=86400' },
  });
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/learn/
git commit -m "feat: add Learn API routes — topics list and single topic by slug"
```

---

## Chunk 3: Parallel Decoder Page

### Task 10: Decoder Components

**Files:**
- Create: `app/components/decoder/ProductGrid.tsx`
- Create: `app/components/decoder/ParallelList.tsx`
- Create: `app/components/decoder/DecoderResult.tsx`

- [ ] **Step 1: Create ProductGrid**

```typescript
// app/components/decoder/ProductGrid.tsx
'use client';

import { useTheme } from '../ThemeProvider';
import { Skeleton } from '../shared/Skeleton';
import type { ProductItem } from '../../../lib/types';

interface ProductGridProps {
  products: ProductItem[];
  loading: boolean;
  onSelect: (product: ProductItem) => void;
}

export function ProductGrid({ products, loading, onSelect }: ProductGridProps) {
  const { colors } = useTheme();

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, padding: '12px 0' }}>
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} height={72} borderRadius={12} />
        ))}
      </div>
    );
  }

  // Group by year
  const byYear: Record<string, ProductItem[]> = {};
  for (const p of products) {
    if (!byYear[p.year]) byYear[p.year] = [];
    byYear[p.year].push(p);
  }
  const years = Object.keys(byYear).sort((a, b) => b.localeCompare(a));

  return (
    <div style={{ padding: '12px 0' }}>
      {years.map((year, yi) => (
        <div key={year}>
          <h3 style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 12,
            color: colors.muted,
            margin: yi === 0 ? '0 0 8px' : '20px 0 8px',
            letterSpacing: 1,
          }}>
            {year}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {byYear[year].map((product) => (
              <button
                key={product.id}
                onClick={() => onSelect(product)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: 4,
                  padding: '14px 12px',
                  background: colors.surface,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 12,
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: colors.text,
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = colors.green)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = colors.border)}
              >
                <span style={{ fontSize: 14, fontWeight: 500 }}>
                  {product.isFlagship && <span style={{ color: colors.amber, marginRight: 4 }}>★</span>}
                  {product.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create ParallelList**

```typescript
// app/components/decoder/ParallelList.tsx
'use client';

import { useState } from 'react';
import { useTheme } from '../ThemeProvider';
import { RarityBadge } from '../shared/RarityBadge';
import { Skeleton } from '../shared/Skeleton';
import type { ParallelItem } from '../../../lib/types';

interface ParallelListProps {
  parallels: ParallelItem[];
  loading: boolean;
  onSelect: (parallel: ParallelItem) => void;
}

export function ParallelList({ parallels, loading, onSelect }: ParallelListProps) {
  const { colors } = useTheme();
  const [showHelp, setShowHelp] = useState(false);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 0' }}>
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} height={52} borderRadius={10} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '12px 0' }}>
      {parallels.map((p) => (
        <button
          key={p.id}
          onClick={() => onSelect(p)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 12px',
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: 10,
            cursor: 'pointer',
            textAlign: 'left',
            color: colors.text,
            transition: 'border-color 0.15s',
            width: '100%',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = colors.green)}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = colors.border)}
        >
          {/* Color swatch */}
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            background: p.colorHex || colors.muted,
            border: `1px solid ${colors.border}`,
            flexShrink: 0,
          }} />
          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{p.name}</div>
            {p.description && (
              <div style={{ fontSize: 12, color: colors.muted, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {p.description}
              </div>
            )}
          </div>
          {/* Badge */}
          <RarityBadge rarityRank={p.rarityRank} totalParallels={p.totalParallels} isOneOfOne={p.isOneOfOne} />
        </button>
      ))}

      {/* I don't see my card */}
      <button
        onClick={() => setShowHelp(!showHelp)}
        style={{
          background: 'none',
          border: 'none',
          color: colors.muted,
          fontSize: 13,
          cursor: 'pointer',
          padding: '12px 0',
          textDecoration: 'underline',
          fontFamily: "'IBM Plex Sans', sans-serif",
        }}
      >
        I don&apos;t see my card
      </button>
      {showHelp && (
        <div style={{
          padding: '12px 16px',
          background: colors.surface,
          borderRadius: 10,
          fontSize: 13,
          color: colors.secondary,
          lineHeight: 1.7,
        }}>
          Flip your card over and look for the set name printed on the back. If you still can&apos;t find a match, this card may be from a product we haven&apos;t added yet.
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create DecoderResult**

```typescript
// app/components/decoder/DecoderResult.tsx
'use client';

import { useTheme } from '../ThemeProvider';
import { RarityBadge } from '../shared/RarityBadge';
import { ExpandableSection } from '../shared/ExpandableSection';
import { formatPrintRun } from '../../../lib/format';
import { getRarityLevel } from '../../../lib/rarity';
import type { ParallelItem } from '../../../lib/types';

interface DecoderResultProps {
  parallel: ParallelItem;
  allParallels: ParallelItem[];
  productName: string;
  productYear: string;
}

export function DecoderResult({ parallel, allParallels, productName, productYear }: DecoderResultProps) {
  const { colors } = useTheme();
  const level = getRarityLevel(parallel.rarityRank, parallel.totalParallels, parallel.isOneOfOne);

  return (
    <div style={{ padding: '12px 0' }}>
      {/* Hero */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        marginBottom: 16,
      }}>
        <div style={{
          width: 56,
          height: 56,
          borderRadius: 12,
          background: parallel.colorHex || colors.muted,
          border: `1px solid ${colors.border}`,
          flexShrink: 0,
        }} />
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 600, margin: 0, color: colors.text }}>
            {parallel.name}
          </h2>
          <p style={{ fontSize: 13, color: colors.muted, margin: '2px 0 0' }}>
            {productName} {productYear}
          </p>
        </div>
      </div>

      {/* Rarity badge */}
      <div style={{ marginBottom: 16 }}>
        <RarityBadge rarityRank={parallel.rarityRank} totalParallels={parallel.totalParallels} isOneOfOne={parallel.isOneOfOne} />
      </div>

      {/* Stats grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 8,
        marginBottom: 16,
      }}>
        {[
          { label: 'Print Run', value: formatPrintRun(parallel.printRun) },
          { label: 'Rarity', value: `${parallel.rarityRank} of ${parallel.totalParallels}` },
          { label: 'Serial Numbered', value: parallel.serialNumbered ? 'Yes' : 'No' },
          { label: 'Type', value: level },
        ].map((stat) => (
          <div key={stat.label} style={{
            padding: '10px 12px',
            background: colors.surface,
            borderRadius: 10,
            border: `1px solid ${colors.border}`,
          }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: colors.muted, marginBottom: 2 }}>
              {stat.label}
            </div>
            <div style={{ fontSize: 15, fontWeight: 500, color: colors.text }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Rarity bar */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: colors.muted, marginBottom: 6 }}>
          RARITY POSITION
        </div>
        <div style={{
          height: 8,
          background: colors.surface,
          borderRadius: 4,
          border: `1px solid ${colors.border}`,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            left: `${(parallel.rarityRank / parallel.totalParallels) * 100}%`,
            top: -2,
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: colors.green,
            transform: 'translateX(-50%)',
          }} />
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 10,
          color: colors.muted,
          marginTop: 4,
          fontFamily: "'IBM Plex Mono', monospace",
        }}>
          <span>Common</span>
          <span>1/1</span>
        </div>
      </div>

      {/* Expandable: What does this mean? */}
      <ExpandableSection title="What does this mean?">
        <p>
          {parallel.isOneOfOne
            ? `This is a 1-of-1 card — only one exists in the entire world. It's the rarest type of card you can pull.`
            : parallel.printRun
              ? `Only ${parallel.printRun} of these cards were printed. ${parallel.serialNumbered ? 'Each one is stamped with a unique number.' : ''} Out of ${parallel.totalParallels} different parallel versions of this card, yours is #${parallel.rarityRank} in rarity.`
              : `This parallel has an unlimited print run — there's no set number that were made. It ranks ${parallel.rarityRank} out of ${parallel.totalParallels} parallels in terms of rarity for this product.`
          }
        </p>
        {parallel.description && <p style={{ marginTop: 8 }}>{parallel.description}</p>}
      </ExpandableSection>

      {/* Expandable: Full hierarchy */}
      <ExpandableSection title="Full rarity hierarchy">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {allParallels.map((p) => (
            <div
              key={p.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 8px',
                borderRadius: 6,
                background: p.id === parallel.id ? `${colors.green}15` : 'transparent',
                border: p.id === parallel.id ? `1px solid ${colors.green}40` : '1px solid transparent',
              }}
            >
              <div style={{
                width: 16,
                height: 16,
                borderRadius: 3,
                background: p.colorHex || colors.muted,
                flexShrink: 0,
              }} />
              <span style={{ fontSize: 13, flex: 1, color: p.id === parallel.id ? colors.green : colors.text }}>
                {p.name}
              </span>
              <span style={{ fontSize: 11, color: colors.muted, fontFamily: "'IBM Plex Mono', monospace" }}>
                {formatPrintRun(p.printRun)}
              </span>
              {p.id === parallel.id && (
                <span style={{ fontSize: 10, color: colors.green, fontWeight: 600 }}>YOU</span>
              )}
            </div>
          ))}
        </div>
      </ExpandableSection>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add app/components/decoder/
git commit -m "feat: add Decoder components — ProductGrid, ParallelList, DecoderResult"
```

---

### Task 11: Decoder Page (Wizard)

**Files:**
- Create: `app/decoder/page.tsx`

- [ ] **Step 1: Create Decoder wizard page**

```typescript
// app/decoder/page.tsx
'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '../components/shared/Header';
import { SportPicker } from '../components/shared/SportPicker';
import { StepIndicator } from '../components/shared/StepIndicator';
import { EmptyState } from '../components/shared/EmptyState';
import { ProductGrid } from '../components/decoder/ProductGrid';
import { ParallelList } from '../components/decoder/ParallelList';
import { DecoderResult } from '../components/decoder/DecoderResult';
import { useTheme } from '../components/ThemeProvider';
import type { SportValue, ProductItem, ParallelItem } from '../../lib/types';

function DecoderContent() {
  const { colors } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();

  // State from URL
  const sportParam = searchParams.get('sport') as SportValue | null;
  const productParam = searchParams.get('product');
  const parallelParam = searchParams.get('parallel');

  // Data state
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [parallels, setParallels] = useState<ParallelItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [selectedParallel, setSelectedParallel] = useState<ParallelItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine current step
  const currentStep = parallelParam ? 3 : productParam ? 2 : sportParam ? 1 : 0;

  // Build breadcrumbs
  const breadcrumbs: string[] = [];
  if (sportParam) breadcrumbs.push(sportParam);
  if (selectedProduct) breadcrumbs.push(`${selectedProduct.name} ${selectedProduct.year}`);
  if (selectedParallel) breadcrumbs.push(selectedParallel.name);

  // URL updater
  const updateUrl = useCallback((params: Record<string, string | null>) => {
    const sp = new URLSearchParams(searchParams.toString());
    for (const [key, val] of Object.entries(params)) {
      if (val === null) sp.delete(key);
      else sp.set(key, val);
    }
    router.push(`/decoder?${sp.toString()}`, { scroll: false });
  }, [router, searchParams]);

  // Fetch products when sport changes
  useEffect(() => {
    if (!sportParam) return;
    setLoading(true);
    setError(null);
    fetch(`/api/decoder/products?sport=${sportParam}`)
      .then(r => r.json())
      .then(data => {
        setProducts(data.products || []);
        // Restore product selection from URL
        if (productParam) {
          const found = (data.products || []).find((p: ProductItem) => p.id === productParam);
          if (found) setSelectedProduct(found);
        }
      })
      .catch(() => setError('Failed to load products'))
      .finally(() => setLoading(false));
  }, [sportParam, productParam]);

  // Fetch parallels when product changes
  useEffect(() => {
    if (!productParam) return;
    setLoading(true);
    setError(null);
    fetch(`/api/decoder/parallels?productId=${productParam}`)
      .then(r => r.json())
      .then(data => {
        setParallels(data.parallels || []);
        // Restore parallel selection from URL
        if (parallelParam) {
          const found = (data.parallels || []).find((p: ParallelItem) => p.id === parallelParam);
          if (found) setSelectedParallel(found);
        }
      })
      .catch(() => setError('Failed to load parallels'))
      .finally(() => setLoading(false));
  }, [productParam, parallelParam]);

  // Step titles
  const stepTitles = ['Pick a Sport', 'Pick a Product', 'Match Your Card', 'Your Card'];

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <Header showBack />
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '0 20px 40px' }}>
        <StepIndicator
          totalSteps={4}
          currentStep={currentStep}
          breadcrumbs={breadcrumbs}
          onBreadcrumbClick={(i) => {
            if (i === 0) updateUrl({ sport: sportParam, product: null, parallel: null });
            else if (i === 1) updateUrl({ product: productParam, parallel: null });
          }}
        />

        <h2 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 28,
          letterSpacing: 2,
          color: colors.text,
          margin: '16px 0 8px',
        }}>
          {stepTitles[currentStep]}
        </h2>

        {error && <EmptyState message={error} actionLabel="Try again" onAction={() => setError(null)} />}

        {/* Step 0: Sport */}
        {currentStep === 0 && (
          <SportPicker onSelect={(sport) => updateUrl({ sport, product: null, parallel: null })} />
        )}

        {/* Step 1: Product */}
        {currentStep === 1 && (
          <ProductGrid
            products={products}
            loading={loading}
            onSelect={(product) => {
              setSelectedProduct(product);
              updateUrl({ product: product.id, parallel: null });
            }}
          />
        )}

        {/* Step 2: Parallel */}
        {currentStep === 2 && !parallelParam && (
          <>
            {parallels.length === 0 && !loading ? (
              <EmptyState message="No parallel data for this product yet." />
            ) : (
              <ParallelList
                parallels={parallels}
                loading={loading}
                onSelect={(parallel) => {
                  setSelectedParallel(parallel);
                  updateUrl({ parallel: parallel.id });
                }}
              />
            )}
          </>
        )}

        {/* Step 3: Result */}
        {currentStep === 3 && selectedParallel && selectedProduct && (
          <DecoderResult
            parallel={selectedParallel}
            allParallels={parallels}
            productName={selectedProduct.name}
            productYear={selectedProduct.year}
          />
        )}
      </div>
    </div>
  );
}

export default function DecoderPage() {
  return (
    <Suspense>
      <DecoderContent />
    </Suspense>
  );
}
```

- [ ] **Step 2: Test full Decoder flow in browser**

Run: `npm run dev`, navigate to http://localhost:3000/decoder
Test: Click a sport → pick a product → see parallels with color swatches → tap one → see result with stats, rarity bar, expandable sections.
Verify: URL updates at each step, browser back works.

- [ ] **Step 3: Commit**

```bash
git add app/decoder/
git commit -m "feat: add Parallel Decoder page — 4-step wizard with URL state"
```

---

## Chunk 4: Box Guide Page

### Task 12: Guide Components

**Files:**
- Create: `app/components/guide/BudgetPicker.tsx`
- Create: `app/components/guide/StorePicker.tsx`
- Create: `app/components/guide/BoxCard.tsx`

- [ ] **Step 1: Create BudgetPicker**

```typescript
// app/components/guide/BudgetPicker.tsx
'use client';

import { useTheme } from '../ThemeProvider';

const BUDGETS = [
  { label: 'Under $25', value: '0-25', sub: 'Packs, hangers' },
  { label: '$25–$50', value: '25-50', sub: 'Blasters' },
  { label: '$50–$100', value: '50-100', sub: 'Megas, hobby lite' },
  { label: '$100–$250', value: '100-250', sub: 'Hobby boxes' },
  { label: '$250+', value: '250-9999', sub: 'Premium hobby' },
  { label: 'Show Everything', value: 'all', sub: 'No budget filter' },
];

interface BudgetPickerProps {
  onSelect: (budget: string) => void;
}

export function BudgetPicker({ onSelect }: BudgetPickerProps) {
  const { colors } = useTheme();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '12px 0' }}>
      {BUDGETS.map((b) => (
        <button
          key={b.value}
          onClick={() => onSelect(b.value)}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px',
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: 12,
            cursor: 'pointer',
            color: colors.text,
            transition: 'border-color 0.15s',
            fontFamily: "'IBM Plex Sans', sans-serif",
            textAlign: 'left',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = colors.green)}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = colors.border)}
        >
          <span style={{ fontSize: 15, fontWeight: 500 }}>{b.label}</span>
          <span style={{ fontSize: 12, color: colors.muted }}>{b.sub}</span>
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create StorePicker**

```typescript
// app/components/guide/StorePicker.tsx
'use client';

import { useTheme } from '../ThemeProvider';

const STORES = [
  { label: 'Walmart', value: 'Walmart' },
  { label: 'Target', value: 'Target' },
  { label: 'Amazon / Fanatics', value: 'amazon_fanatics' },
  { label: 'Local Hobby Shop', value: 'Hobby Shop' },
  { label: 'Online (any)', value: 'all' },
  { label: "I don't know yet", value: 'all' },
];

interface StorePickerProps {
  onSelect: (store: string) => void;
}

export function StorePicker({ onSelect }: StorePickerProps) {
  const { colors } = useTheme();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '12px 0' }}>
      {STORES.map((s) => (
        <button
          key={s.label}
          onClick={() => onSelect(s.value)}
          style={{
            padding: '16px',
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: 12,
            cursor: 'pointer',
            color: colors.text,
            transition: 'border-color 0.15s',
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: 15,
            fontWeight: 500,
            textAlign: 'left',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = colors.green)}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = colors.border)}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Create BoxCard**

```typescript
// app/components/guide/BoxCard.tsx
'use client';

import { useTheme } from '../ThemeProvider';
import { ExpandableSection } from '../shared/ExpandableSection';
import { formatConfigType, formatPrice } from '../../../lib/format';
import type { BoxResult } from '../../../lib/types';

interface BoxCardProps {
  result: BoxResult;
}

export function BoxCard({ result }: BoxCardProps) {
  const { colors } = useTheme();
  const { product, boxConfig, retailer } = result;

  // Merge pros/cons from product + box config
  const allPros = [
    ...(product.prosCons?.pros || []),
    ...(boxConfig.prosCons?.pros || []),
  ];
  const allCons = [
    ...(product.prosCons?.cons || []),
    ...(boxConfig.prosCons?.cons || []),
  ];

  return (
    <div style={{
      background: colors.surface,
      border: `1px solid ${product.isFlagship ? colors.green + '60' : colors.border}`,
      borderRadius: 14,
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: colors.text }}>
            {product.isFlagship && <span style={{ color: colors.amber, marginRight: 4 }}>★</span>}
            {product.name}
          </div>
          <div style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
            {product.year} · {formatConfigType(boxConfig.configType)}
          </div>
        </div>
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 18,
          fontWeight: 600,
          color: colors.green,
        }}>
          {formatPrice(boxConfig.retailPriceUsd)}
        </div>
      </div>

      {/* Contents */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 8,
      }}>
        {[
          { label: 'Packs', value: boxConfig.packsPerBox },
          { label: 'Cards/Pack', value: boxConfig.cardsPerPack },
          { label: 'Hits', value: boxConfig.guaranteedHits || 'None guaranteed' },
        ].map((item) => (
          <div key={item.label} style={{
            padding: '8px',
            background: `${colors.bg}`,
            borderRadius: 8,
            textAlign: 'center',
          }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: colors.muted }}>
              {item.label}
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, color: colors.text, marginTop: 2 }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Pros/Cons */}
      {(allPros.length > 0 || allCons.length > 0) && (
        <div style={{ fontSize: 13, lineHeight: 1.6 }}>
          {allPros.map((pro, i) => (
            <div key={`pro-${i}`} style={{ color: colors.green }}>+ {pro}</div>
          ))}
          {allCons.map((con, i) => (
            <div key={`con-${i}`} style={{ color: colors.red }}>- {con}</div>
          ))}
        </div>
      )}

      {/* Retailer */}
      {retailer && (
        <div style={{ fontSize: 12, color: colors.muted }}>
          Available at {retailer.name}{retailer.notes ? ` · ${retailer.notes}` : ''}
        </div>
      )}

      {/* Expandable: What does this mean? */}
      <ExpandableSection title="What does this mean?">
        <p>
          {boxConfig.configType === 'blaster'
            ? "A blaster box is the most common box type at big retailers like Walmart and Target. Usually $25-30, they contain several packs and are a great entry point for new collectors."
            : boxConfig.configType === 'hobby_box'
              ? "A hobby box is the premium option — sold at card shops and online retailers. More expensive, but you're guaranteed hits (autographs, relics, or numbered cards)."
              : boxConfig.configType === 'mega_box'
                ? "A mega box is a step up from a blaster — more packs and sometimes exclusive parallels. Usually found at big retail stores."
                : `This is a ${formatConfigType(boxConfig.configType).toLowerCase()}.`
          }
        </p>
      </ExpandableSection>

      {/* Expandable: Odds */}
      {(boxConfig.oddsAuto || boxConfig.oddsRelic || boxConfig.oddsNumbered) && (
        <ExpandableSection title="Odds & details">
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {boxConfig.oddsAuto && <div>Auto: {boxConfig.oddsAuto}</div>}
            {boxConfig.oddsRelic && <div>Relic: {boxConfig.oddsRelic}</div>}
            {boxConfig.oddsNumbered && <div>Numbered: {boxConfig.oddsNumbered}</div>}
          </div>
        </ExpandableSection>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add app/components/guide/
git commit -m "feat: add Guide components — BudgetPicker, StorePicker, BoxCard"
```

---

### Task 13: Guide Page (Wizard)

**Files:**
- Create: `app/guide/page.tsx`

- [ ] **Step 1: Create Guide wizard page**

```typescript
// app/guide/page.tsx
'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '../components/shared/Header';
import { SportPicker } from '../components/shared/SportPicker';
import { StepIndicator } from '../components/shared/StepIndicator';
import { EmptyState } from '../components/shared/EmptyState';
import { Skeleton } from '../components/shared/Skeleton';
import { BudgetPicker } from '../components/guide/BudgetPicker';
import { StorePicker } from '../components/guide/StorePicker';
import { BoxCard } from '../components/guide/BoxCard';
import { useTheme } from '../components/ThemeProvider';
import type { SportValue, BoxResult } from '../../lib/types';

function GuideContent() {
  const { colors } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();

  const sportParam = searchParams.get('sport') as SportValue | null;
  const budgetParam = searchParams.get('budget');
  const storeParam = searchParams.get('store');

  const [results, setResults] = useState<BoxResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentStep = storeParam ? 3 : budgetParam ? 2 : sportParam ? 1 : 0;

  const breadcrumbs: string[] = [];
  if (sportParam) breadcrumbs.push(sportParam);
  if (budgetParam) breadcrumbs.push(budgetParam === 'all' ? 'Any budget' : `$${budgetParam.replace('-', '–')}`);
  if (storeParam) breadcrumbs.push(storeParam === 'all' ? 'Any store' : storeParam);

  const updateUrl = useCallback((params: Record<string, string | null>) => {
    const sp = new URLSearchParams(searchParams.toString());
    for (const [key, val] of Object.entries(params)) {
      if (val === null) sp.delete(key);
      else sp.set(key, val);
    }
    router.push(`/guide?${sp.toString()}`, { scroll: false });
  }, [router, searchParams]);

  // Fetch results when all 3 params are set
  useEffect(() => {
    if (!sportParam || !budgetParam || !storeParam) return;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({ sport: sportParam, store: storeParam });
    if (budgetParam !== 'all') {
      const [min, max] = budgetParam.split('-');
      params.set('budgetMin', min);
      params.set('budgetMax', max);
    }

    fetch(`/api/guide/recommend?${params}`)
      .then(r => r.json())
      .then(data => setResults(data.results || []))
      .catch(() => setError('Failed to load recommendations'))
      .finally(() => setLoading(false));
  }, [sportParam, budgetParam, storeParam]);

  const stepTitles = ['Pick a Sport', "What's Your Budget?", 'Where Are You Shopping?', 'Your Best Options'];

  const resetFilters = () => updateUrl({ sport: sportParam, budget: null, store: null });

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <Header showBack />
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 20px 40px' }}>
        <StepIndicator
          totalSteps={4}
          currentStep={currentStep}
          breadcrumbs={breadcrumbs}
          onBreadcrumbClick={(i) => {
            if (i === 0) updateUrl({ sport: sportParam, budget: null, store: null });
            else if (i === 1) updateUrl({ budget: budgetParam, store: null });
          }}
        />

        <h2 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 28,
          letterSpacing: 2,
          color: colors.text,
          margin: '16px 0 8px',
        }}>
          {stepTitles[currentStep]}
        </h2>

        {error && <EmptyState message={error} actionLabel="Try again" onAction={() => setError(null)} />}

        {currentStep === 0 && (
          <SportPicker onSelect={(sport) => updateUrl({ sport, budget: null, store: null })} />
        )}

        {currentStep === 1 && (
          <BudgetPicker onSelect={(budget) => updateUrl({ budget, store: null })} />
        )}

        {currentStep === 2 && (
          <StorePicker onSelect={(store) => updateUrl({ store })} />
        )}

        {currentStep === 3 && (
          <>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {Array.from({ length: 3 }, (_, i) => (
                  <Skeleton key={i} height={200} borderRadius={14} />
                ))}
              </div>
            ) : results.length === 0 ? (
              <EmptyState
                message="No boxes match your filters. Try a different budget or store."
                actionLabel="Reset filters"
                onAction={resetFilters}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {results.map((r, i) => (
                  <BoxCard key={`${r.product.id}-${r.boxConfig.id}-${i}`} result={r} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function GuidePage() {
  return (
    <Suspense>
      <GuideContent />
    </Suspense>
  );
}
```

- [ ] **Step 2: Test full Guide flow in browser**

Run: `npm run dev`, navigate to http://localhost:3000/guide
Test: Sport → Budget → Store → see box recommendations with pros/cons, prices, expandable details.
Verify: URL updates, back button works, empty state shows for no-match filters.

- [ ] **Step 3: Commit**

```bash
git add app/guide/
git commit -m "feat: add Box Guide page — 4-step wizard with budget and store filtering"
```

---

## Chunk 5: Learn Pages + Seed Data + Final Verification

### Task 14: Learn Components

**Files:**
- Create: `app/components/learn/TopicCard.tsx`
- Create: `app/components/learn/TopicContent.tsx`

- [ ] **Step 1: Create TopicCard**

```typescript
// app/components/learn/TopicCard.tsx
'use client';

import Link from 'next/link';
import { useTheme } from '../ThemeProvider';
import type { TopicItem } from '../../../lib/types';

interface TopicCardProps {
  topic: TopicItem;
}

export function TopicCard({ topic }: TopicCardProps) {
  const { colors } = useTheme();

  return (
    <Link href={`/learn/${topic.slug}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: 12,
        padding: '20px 16px',
        cursor: 'pointer',
        transition: 'border-color 0.15s',
        height: '100%',
      }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = colors.green)}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = colors.border)}
      >
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 10,
          color: colors.muted,
          textTransform: 'uppercase',
          letterSpacing: 1,
          marginBottom: 6,
        }}>
          {topic.category}
        </div>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: colors.text, margin: '0 0 6px' }}>
          {topic.title}
        </h3>
        <p style={{ fontSize: 13, color: colors.secondary, lineHeight: 1.5, margin: 0 }}>
          {topic.summary}
        </p>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Create TopicContent**

```typescript
// app/components/learn/TopicContent.tsx
'use client';

import Link from 'next/link';
import { useTheme } from '../ThemeProvider';
import type { TopicDetail } from '../../../lib/types';

interface TopicContentProps {
  topic: TopicDetail;
}

export function TopicContent({ topic }: TopicContentProps) {
  const { colors } = useTheme();

  // Simple markdown-to-HTML: headings, bold, lists, paragraphs
  const renderMarkdown = (md: string) => {
    const lines = md.split('\n');
    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i].trim();

      if (line.startsWith('## ')) {
        elements.push(
          <h2 key={i} style={{ fontSize: 20, fontWeight: 600, color: colors.text, margin: '24px 0 8px' }}>
            {line.slice(3)}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={i} style={{ fontSize: 16, fontWeight: 600, color: colors.text, margin: '20px 0 6px' }}>
            {line.slice(4)}
          </h3>
        );
      } else if (line.startsWith('- ')) {
        // Collect list items
        const items: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('- ')) {
          items.push(lines[i].trim().slice(2));
          i++;
        }
        elements.push(
          <ul key={`ul-${i}`} style={{ paddingLeft: 20, margin: '8px 0', color: colors.secondary, fontSize: 14, lineHeight: 1.8 }}>
            {items.map((item, j) => <li key={j}>{renderInline(item)}</li>)}
          </ul>
        );
        continue; // i already advanced past the list
      } else if (line.length > 0) {
        elements.push(
          <p key={i} style={{ color: colors.secondary, fontSize: 14, lineHeight: 1.8, margin: '8px 0' }}>
            {renderInline(line)}
          </p>
        );
      }
      i++;
    }
    return elements;
  };

  // Inline formatting: **bold**
  const renderInline = (text: string): React.ReactNode => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ color: colors.text, fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div>
      {/* Category label */}
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 11,
        color: colors.muted,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
      }}>
        {topic.category}
      </div>

      {/* Title */}
      <h1 style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 32,
        letterSpacing: 2,
        color: colors.text,
        margin: '0 0 20px',
      }}>
        {topic.title}
      </h1>

      {/* Body */}
      <div>{renderMarkdown(topic.body)}</div>

      {/* Related products */}
      {topic.relatedProductNames.length > 0 && (
        <div style={{ marginTop: 32, padding: '16px', background: colors.surface, borderRadius: 12, border: `1px solid ${colors.border}` }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: colors.muted, marginBottom: 8 }}>
            RELATED PRODUCTS
          </div>
          <div style={{ fontSize: 14, color: colors.text }}>
            {topic.relatedProductNames.join(' · ')}
          </div>
        </div>
      )}

      {/* Related topics */}
      {topic.relatedTopicSlugs.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: colors.muted, marginBottom: 8 }}>
            KEEP READING
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {topic.relatedTopicSlugs.map((slug) => (
              <Link
                key={slug}
                href={`/learn/${slug}`}
                style={{
                  padding: '6px 12px',
                  background: colors.surface,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 8,
                  color: colors.green,
                  fontSize: 13,
                  textDecoration: 'none',
                }}
              >
                {slug.replace(/-/g, ' ')}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/components/learn/
git commit -m "feat: add Learn components — TopicCard and TopicContent with markdown rendering"
```

---

### Task 15: Learn Pages

**Files:**
- Create: `app/learn/page.tsx`
- Create: `app/learn/[slug]/page.tsx`

- [ ] **Step 1: Create topic index page**

```typescript
// app/learn/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Header } from '../components/shared/Header';
import { Skeleton } from '../components/shared/Skeleton';
import { EmptyState } from '../components/shared/EmptyState';
import { TopicCard } from '../components/learn/TopicCard';
import { useTheme } from '../components/ThemeProvider';
import type { TopicItem } from '../../lib/types';

export default function LearnPage() {
  const { colors } = useTheme();
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/learn/topics')
      .then(r => r.json())
      .then(data => setTopics(data.topics || []))
      .finally(() => setLoading(false));
  }, []);

  const concepts = topics.filter(t => t.category === 'concept');
  const products = topics.filter(t => t.category === 'product');

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <Header showBack />
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 20px 40px' }}>
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 36,
          letterSpacing: 2,
          color: colors.text,
          margin: '16px 0 24px',
        }}>
          Learn the Hobby
        </h1>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} height={120} borderRadius={12} />
            ))}
          </div>
        ) : topics.length === 0 ? (
          <EmptyState message="Topics coming soon." />
        ) : (
          <>
            {concepts.length > 0 && (
              <section>
                <h2 style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 12,
                  color: colors.muted,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  margin: '0 0 12px',
                }}>
                  Key Concepts
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12, marginBottom: 28 }}>
                  {concepts.map(t => <TopicCard key={t.slug} topic={t} />)}
                </div>
              </section>
            )}
            {products.length > 0 && (
              <section>
                <h2 style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 12,
                  color: colors.muted,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  margin: '0 0 12px',
                }}>
                  Products
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                  {products.map(t => <TopicCard key={t.slug} topic={t} />)}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create individual topic page**

```typescript
// app/learn/[slug]/page.tsx
'use client';

import { useState, useEffect, use } from 'react';
import { Header } from '../../components/shared/Header';
import { Skeleton } from '../../components/shared/Skeleton';
import { EmptyState } from '../../components/shared/EmptyState';
import { TopicContent } from '../../components/learn/TopicContent';
import type { TopicDetail } from '../../../lib/types';

export default function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [topic, setTopic] = useState<TopicDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/learn/topics/${slug}`)
      .then(r => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then(data => setTopic(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <Header showBack />
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 20px 40px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 20 }}>
            <Skeleton height={20} width={80} />
            <Skeleton height={36} width="60%" />
            <Skeleton height={200} />
          </div>
        ) : error || !topic ? (
          <EmptyState message="Topic not found." />
        ) : (
          <TopicContent topic={topic} />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/learn/
git commit -m "feat: add Learn pages — topic index and individual topic pages"
```

---

### Task 16: Seed Topics Data

**Files:**
- Create: `scripts/migrations/005-seed-topics.sql`

- [ ] **Step 1: Create seed script with 6 initial topics**

```sql
-- scripts/migrations/005-seed-topics.sql
-- Seed initial topic content for Learn the Hobby tool

INSERT INTO topics (slug, title, category, summary, body, related_topic_slugs, sort_order) VALUES

('what-is-a-parallel', 'What is a Parallel?', 'concept',
 'Parallels are alternate versions of base cards with different colors, patterns, or finishes — and they range from common to incredibly rare.',
 '## The Short Version

A **parallel** is a different version of the same card. Same player, same photo, same card number — but with a different color border, background pattern, or finish.

Think of it like a t-shirt that comes in ten different colors. The design is the same, but some colors are rarer than others.

## Why Parallels Matter

Parallels are the main way card companies create rarity. A base card might have millions of copies printed, but a Gold parallel might only have 10. The rarer the parallel, the more valuable it tends to be.

## How to Identify a Parallel

Look at the color of your card''s border or background. Then compare it to the base version. If it''s different, you have a parallel. The product''s checklist will tell you exactly which one.

## Serial Numbering

Many parallels are **serial numbered** — stamped with a number like 47/99. This means only 99 of that specific parallel exist, and yours is number 47. Lower print runs mean higher rarity.',
 ARRAY['what-is-serial-numbering', 'hobby-vs-retail'], 1),

('what-is-serial-numbering', 'What is Serial Numbering?', 'concept',
 'Serial numbered cards are stamped with a unique number showing exactly how many exist — like 47/99 means only 99 were made.',
 '## The Short Version

When a card has a number stamped on it like **47/99**, that means only 99 copies of that exact card were printed, and yours is number 47.

## Why It Matters

Serial numbering tells you exactly how rare your card is. A card numbered /10 is much rarer than one numbered /299. The lower the number after the slash, the fewer exist.

## The First and Last

Cards numbered **1/99** (the first one) and **99/99** (the last one) are sometimes called "bookends" and can be worth slightly more. Cards numbered **1/1** are truly one-of-a-kind.

## Not All Parallels Are Numbered

Many parallels have unlimited print runs — there''s no stamp telling you how many exist. Generally, numbered parallels are rarer and more valuable than unnumbered ones.',
 ARRAY['what-is-a-parallel'], 2),

('hobby-vs-retail', 'Hobby vs. Retail — What''s the Difference?', 'concept',
 'Hobby boxes come from card shops with better odds and exclusive cards. Retail boxes are found at Walmart and Target at lower prices.',
 '## The Short Version

**Retail** boxes are what you find at Walmart, Target, and similar stores. **Hobby** boxes are sold at dedicated card shops and online hobby retailers.

## Price Difference

Retail boxes (blasters, hangers, fat packs) typically range from $5 to $50. Hobby boxes usually start around $100 and can go well over $500 for premium products.

## What You Get

Hobby boxes almost always **guarantee hits** — autographs, relics (pieces of game-worn jerseys), or rare numbered cards. Retail boxes rarely guarantee anything.

## Exclusive Parallels

Some parallels are **hobby exclusive** — you can only pull them from hobby boxes. Others are **retail exclusive** — only found in blasters or hangers. This is important when you''re trying to identify what you pulled.

## Which Should You Buy?

- **New to collecting?** Start with retail. It''s cheap, accessible, and fun to rip.
- **Chasing specific cards?** Hobby gives you better odds and guaranteed hits.
- **On a budget?** Retail blasters offer the best value per dollar for casual collectors.',
 ARRAY['what-is-a-parallel', 'what-is-a-rookie-card'], 3),

('what-is-a-rookie-card', 'What is a Rookie Card?', 'concept',
 'A rookie card is a player''s first officially licensed trading card — and it''s almost always their most valuable.',
 '## The Short Version

A **rookie card** (or RC) is the first officially licensed trading card of a professional athlete. It''s typically the most collected and most valuable card of any player.

## Why Rookie Cards Matter

Rookie cards capture a moment in time — the beginning of a career. If that player becomes a star, their rookie card becomes the cornerstone card that everyone wants. Most of the highest-value sports cards ever sold are rookie cards.

## How to Identify One

Look for an **RC logo** on the card — a small shield or badge that says "RC" or "Rookie." Not all first-year cards have this logo, but the major products do.

## Multiple Rookie Cards

A player can have rookie cards across multiple products released in the same year. A player might have a Prizm rookie, an Optic rookie, a Donruss rookie — all from the same season. The **flagship product** rookie (usually Prizm for basketball, Topps Chrome for baseball) tends to be the most valuable.',
 ARRAY['what-is-a-parallel'], 4),

('understanding-prizm', 'Understanding Prizm', 'product',
 'Prizm is the most popular modern sports card product — known for its huge parallel rainbow and strong resale value.',
 '## What is Prizm?

**Prizm** is Panini''s flagship basketball and football card product. It''s arguably the most popular and most collected modern sports card brand.

## Why It''s Popular

Prizm has the largest and most recognizable parallel rainbow in the hobby. The **Silver Prizm** — a shiny, refractor-like base parallel — is iconic. Pulling a Silver Prizm of a star rookie is one of the most sought-after experiences in card collecting.

## The Parallel Rainbow

Prizm products typically have 20-30+ different parallels, ranging from the common base card all the way up to 1-of-1 cards. Colors include Silver, Green, Blue, Red, Gold, Black, and many more, each with different print runs.

## Hobby vs. Retail

Prizm is available in both hobby and retail formats. Hobby boxes are expensive ($300+) but guarantee autographs and numbered cards. Retail blasters ($30) are widely available at Walmart and Target but have no guaranteed hits.

## When It Releases

- **Prizm Basketball**: Typically December-January
- **Prizm Football**: Typically October-November
- **Prizm Draft Picks**: Released earlier in the year with college uniforms',
 ARRAY['hobby-vs-retail', 'what-is-a-parallel'], 1),

('understanding-grading', 'Understanding Card Grading', 'concept',
 'Card grading services like PSA and BGS authenticate and score your card''s condition on a 1-10 scale — and it can dramatically affect value.',
 '## What is Card Grading?

**Grading** is the process of sending your card to a professional service that evaluates its condition, authenticates it, and encases it in a tamper-proof slab with a grade from 1 to 10.

## The Major Grading Companies

- **PSA** (Professional Sports Authenticator): The most popular and widely recognized. Uses a 1-10 scale.
- **BGS** (Beckett Grading Services): Known for sub-grades in four categories (centering, corners, edges, surface). A BGS 9.5 "Gem Mint" is highly valued.
- **SGC** (Sportscard Guaranty): Growing in popularity. Known for their tuxedo-style holders.

## Why Grade a Card?

A higher grade means a higher price. A PSA 10 (Gem Mint) can be worth 2-10x more than the same card ungraded. But grading costs money ($20-150+ per card depending on speed) and takes time (weeks to months).

## When to Grade

Not every card is worth grading. Consider grading when:
- The card is a rookie of a star player
- It''s a rare parallel (low print run)
- The card appears to be in perfect condition
- The potential value increase exceeds the grading cost

## The Grades That Matter

- **PSA 10 / BGS 9.5+**: The gold standard. Maximum value.
- **PSA 9 / BGS 9**: Still valuable, but noticeably less than a 10.
- **PSA 8 and below**: Significant value drop for modern cards.',
 ARRAY['what-is-a-parallel', 'what-is-serial-numbering'], 5);
```

- [ ] **Step 2: Run seed script in Supabase SQL Editor**

Paste the SQL into Supabase Dashboard → SQL Editor and execute.

- [ ] **Step 3: Commit**

```bash
git add scripts/migrations/005-seed-topics.sql
git commit -m "feat: seed 6 initial topics for Learn the Hobby tool"
```

---

### Task 17: Final Verification

- [ ] **Step 1: Run dev server and test all flows**

Run: `npm run dev`

Test checklist:
1. Landing page: 3 cards visible, links work
2. Decoder: Sport → Product → Parallel → Result (all 4 steps)
3. Decoder: URL updates, browser back works, breadcrumbs navigate
4. Decoder: "I don't see my card" link shows help text
5. Decoder: Empty state shows for products with no parallels
6. Guide: Sport → Budget → Store → Results with box cards
7. Guide: Pros/cons display, expandable sections work
8. Guide: "No boxes match" empty state with reset button
9. Learn: Topic index loads with categories
10. Learn: Individual topic pages render markdown correctly
11. Learn: Related topics links work

- [ ] **Step 2: Run build**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 3: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: address build issues from Wave 1 implementation"
```

---

## Summary

| Chunk | Tasks | What it produces |
|-------|-------|-----------------|
| 1: Foundation | Tasks 1-5 | Types, utilities, migrations, layout update, shared components |
| 2: Landing + APIs | Tasks 6-9 | Landing page, all 5 API routes |
| 3: Decoder | Tasks 10-11 | Decoder components + wizard page |
| 4: Guide | Tasks 12-13 | Guide components + wizard page |
| 5: Learn + Verify | Tasks 14-17 | Learn components + pages, seed data, full verification |
