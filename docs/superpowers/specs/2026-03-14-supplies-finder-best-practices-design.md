# Supplies Finder & Card Care Best Practices

**Date:** 2026-03-14
**Status:** Approved

## Overview

Add a Supplies Finder interactive tool and 4 educational articles to the existing Learn section. Also restore Learn section visibility on the site (nav/landing page links).

## 1. Supplies Finder Tool

**Route:** `/learn/supplies-finder`

Interactive page where users pick their card type and see the right sleeve, top loader, and one-touch size.

### Card Types & Supply Mapping

Static TypeScript data — no database needed.

| Card Type | Thickness | Penny Sleeve | Top Loader | One-Touch |
|-----------|-----------|-------------|------------|-----------|
| Standard Base | 20pt | Standard (2-5/8" x 3-13/16") | 3x4 35pt | 35pt magnetic |
| Chrome/Refractor | 20pt | Standard | 3x4 35pt | 35pt magnetic |
| Thick Base / Numbered | 55pt | Thick (2-3/4" x 3-13/16") | 3x4 55pt | 55pt magnetic |
| Jersey Relic | 75pt | Thick | 3x4 75pt | 75pt magnetic |
| Patch / Multi-Relic | 100pt-130pt | Thick | 3x4 130pt | 130pt magnetic |
| Extra Thick Memorabilia | 180pt+ | Thick or Team Bag | 3x4 180pt+ | 180pt magnetic |
| Booklet | Varies | Team Bag | Booklet top loader (5x7) | Booklet one-touch |
| Mini | 20pt | Mini sleeve | Mini top loader | N/A |

### UI Flow

1. Grid of card type buttons with icons/descriptions
2. Clicking a type reveals a results panel showing:
   - Penny sleeve recommendation
   - Top loader recommendation
   - One-Touch recommendation
   - Pro tip specific to that card type
3. Single-page, no navigation — click different types to switch

### Data Structure

```typescript
interface SupplyMatch {
  cardType: string;
  description: string;       // e.g., "Most standard trading cards"
  thickness: string;         // e.g., "20pt"
  pennySleeve: string;
  topLoader: string;
  oneTouch: string;
  tip: string;
}
```

## 2. Educational Articles

4 new topics seeded into the existing `topics` table with category "supplies".

### Article List

1. **How to Sleeve & Topload a Card** (`how-to-sleeve-and-topload`)
   - Why protection matters
   - Step-by-step: penny sleeve first, then top loader
   - Common mistakes (sliding in too fast, backwards sleeve, wrong size)
   - Links to Supplies Finder for sizing

2. **How to Store Your Collection** (`how-to-store-cards`)
   - Short-term: top loaders in card boxes (BCW 800-count, etc.)
   - Long-term: climate considerations (humidity, sunlight, temperature)
   - Binders: when they're OK vs. when to avoid (9-pocket pages for commons, never for high-value)
   - Graded slab storage

3. **How to Pack & Ship Cards** (`how-to-ship-cards`)
   - PWE (plain white envelope) for low-value
   - Bubble mailer with top loader + team bag for mid-value
   - Small box with padding for high-value / graded
   - Step-by-step packing instructions
   - Common eBay shipping mistakes

4. **How to Handle Cards When Pulling from Packs** (`how-to-handle-cards`)
   - Clean, dry hands
   - Hold by edges only
   - Have sleeves ready before opening
   - Don't stack unprotected cards
   - Surface awareness (don't set cards on rough surfaces)

### Database Seeding

Uses same migration pattern as `005-seed-topics.sql`. New migration script inserts 4 rows into `topics` table with:
- slug, title, category: "supplies"
- summary (1-2 sentences)
- body (markdown content)
- related_topic_slugs linking between the 4 articles
- sort_order: after existing topics

## 3. Restore Learn Section on Site

- Verify `/learn` link exists in Nav component
- Verify `/learn` link exists on landing page tool cards
- Add Supplies Finder as a featured card on the Learn page (alongside topic cards)

## Technical Notes

- Supplies Finder is a client-side only page — static data in `lib/supplies-data.ts`
- Articles are server-rendered via existing topic API routes
- No new database tables needed
- No new API routes needed (existing `/api/learn/topics` handles it)
- Follows existing visual design: dark premium theme, Bebas Neue headings, IBM Plex Sans body
