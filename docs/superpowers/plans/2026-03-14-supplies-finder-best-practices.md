# Supplies Finder & Card Care Best Practices Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an interactive Supplies Finder tool and 4 educational card care articles to the Learn section, and restore Learn section visibility on the site.

**Architecture:** Static client-side data for the supplies lookup tool (`lib/supplies-data.ts`), new topics seeded into the existing `topics` table via SQL migration for the 4 articles. The Supplies Finder gets its own page at `/learn/supplies-finder`. No new API routes needed.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Supabase (topics table), inline styles with ThemeProvider

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `lib/supplies-data.ts` | Create | Static supply matching data (card types → sleeve/toploader/one-touch sizes) |
| `app/learn/supplies-finder/page.tsx` | Create | Interactive Supplies Finder page |
| `scripts/migrations/010-seed-supplies-topics.sql` | Create | Seed 4 card care articles into topics table |
| `scripts/run-migration.mjs` | Exists | Run the migration against Supabase |
| `app/page.tsx` | Modify | Verify Learn link exists on landing page |
| `app/components/layout/Nav.tsx` | Verify | Confirm Learn is accessible from nav |

---

## Chunk 1: Supplies Finder Tool

### Task 1: Create supply matching data

**Files:**
- Create: `lib/supplies-data.ts`

- [ ] **Step 1: Create the data file**

```typescript
// lib/supplies-data.ts
export interface SupplyMatch {
  cardType: string;
  description: string;
  thickness: string;
  pennySleeve: string;
  topLoader: string;
  oneTouch: string;
  tip: string;
}

export const SUPPLY_MATCHES: SupplyMatch[] = [
  {
    cardType: 'Standard Base',
    description: 'Most standard trading cards (Topps, Panini base, inserts)',
    thickness: '20pt',
    pennySleeve: 'Standard Penny Sleeve (2-5/8" × 3-13/16")',
    topLoader: '3×4 Top Loader (35pt)',
    oneTouch: '35pt Magnetic One-Touch',
    tip: 'Always sleeve before toploading. The penny sleeve protects the card surface from the top loader\'s rigid edges.',
  },
  {
    cardType: 'Chrome / Refractor',
    description: 'Topps Chrome, Bowman Chrome, Prizm, Select, Optic',
    thickness: '20pt',
    pennySleeve: 'Standard Penny Sleeve (2-5/8" × 3-13/16")',
    topLoader: '3×4 Top Loader (35pt)',
    oneTouch: '35pt Magnetic One-Touch',
    tip: 'Chrome cards scratch easily. Sleeve immediately after pulling — don\'t set them face-down on any surface.',
  },
  {
    cardType: 'Thick Base / Numbered',
    description: 'Thicker parallels, numbered cards, some inserts',
    thickness: '55pt',
    pennySleeve: 'Thick Penny Sleeve (2-3/4" × 3-13/16")',
    topLoader: '3×4 Top Loader (55pt)',
    oneTouch: '55pt Magnetic One-Touch',
    tip: 'If the card doesn\'t slide easily into a standard top loader, it\'s probably 55pt or thicker. Don\'t force it — you\'ll damage the edges.',
  },
  {
    cardType: 'Jersey Relic',
    description: 'Cards with a single jersey or fabric swatch embedded',
    thickness: '75pt',
    pennySleeve: 'Thick Penny Sleeve (2-3/4" × 3-13/16")',
    topLoader: '3×4 Top Loader (75pt)',
    oneTouch: '75pt Magnetic One-Touch',
    tip: 'Relic cards are thicker because of the embedded fabric. Never bend or flex them — the jersey piece can shift or crack the card window.',
  },
  {
    cardType: 'Patch / Multi-Relic',
    description: 'Patch cards, multi-swatch relics, jumbo relics',
    thickness: '100–130pt',
    pennySleeve: 'Thick Penny Sleeve (2-3/4" × 3-13/16")',
    topLoader: '3×4 Top Loader (130pt)',
    oneTouch: '130pt Magnetic One-Touch',
    tip: 'Patch cards are some of the thickest standard-size cards. Use a 130pt holder to be safe — too tight and you risk cracking the card.',
  },
  {
    cardType: 'Extra Thick Memorabilia',
    description: 'Thick patch cards, manufactured patches, multi-layer relics',
    thickness: '180pt+',
    pennySleeve: 'Team Bag (resealable)',
    topLoader: '3×4 Top Loader (180pt) or Super Thick',
    oneTouch: '180pt+ Magnetic One-Touch',
    tip: 'At this thickness, standard penny sleeves won\'t fit. Use a resealable team bag as the first layer of protection instead.',
  },
  {
    cardType: 'Booklet',
    description: 'Fold-open cards with dual panels (auto booklets, relic booklets)',
    thickness: 'Varies',
    pennySleeve: 'Team Bag (resealable)',
    topLoader: 'Booklet Top Loader (5×7 or 8×10)',
    oneTouch: 'Booklet Magnetic One-Touch',
    tip: 'Never force a booklet closed or open. Store them in the orientation they came in. Booklet holders are specialty items — order online.',
  },
  {
    cardType: 'Mini Card',
    description: 'Smaller-than-standard cards (Allen & Ginter minis, Topps Mini)',
    thickness: '20pt',
    pennySleeve: 'Mini Penny Sleeve (1-15/16" × 2-15/16")',
    topLoader: 'Mini Top Loader',
    oneTouch: 'N/A — use top loader',
    tip: 'Mini cards are easy to lose in a stack. Sleeve them right away and store separately from standard-size cards.',
  },
];
```

- [ ] **Step 2: Commit**

```bash
git add lib/supplies-data.ts
git commit -m "feat: add supply matching data for card types"
```

---

### Task 2: Create Supplies Finder page

**Files:**
- Create: `app/learn/supplies-finder/page.tsx`

- [ ] **Step 1: Create the interactive page**

Build a client component that:
- Imports `SUPPLY_MATCHES` from `lib/supplies-data.ts`
- Uses `useTheme()` for colors
- Renders a title section ("Supplies Finder") with subtitle
- Displays a grid of card type buttons (2 columns on desktop, 1 on mobile)
- On click, shows a results panel below with penny sleeve, top loader, one-touch, and pro tip
- Each result item has a label (muted, uppercase) and value (text color)
- Pro tip styled with a green left border accent
- Includes a "Back to Learn" link using the `Header` component pattern
- Follows existing visual design: Bebas Neue headings, IBM Plex Sans body, dark surface cards, green accent, 12-14px border-radius

The page should match the style of existing pages (see `app/decoder/page.tsx`, `app/learn/page.tsx` for reference). Use inline styles and ThemeProvider colors, not Tailwind classes.

- [ ] **Step 2: Verify it builds**

```bash
npx next build
```

Expected: Build succeeds, `/learn/supplies-finder` appears in route list.

- [ ] **Step 3: Commit**

```bash
git add app/learn/supplies-finder/page.tsx
git commit -m "feat: add interactive Supplies Finder page"
```

---

## Chunk 2: Educational Articles

### Task 3: Create migration to seed 4 card care topics

**Files:**
- Create: `scripts/migrations/010-seed-supplies-topics.sql`

- [ ] **Step 1: Write the seed migration**

Insert 4 rows into the `topics` table. Each needs:
- `slug` (text, unique)
- `title` (text)
- `category`: `'supplies'` for all 4
- `summary` (1-2 sentence description)
- `body` (markdown content — practical, step-by-step, beginner-friendly)
- `related_topic_slugs` (text array linking between the 4 articles)
- `sort_order` (integer, starting after existing topics which go up to 5)

Articles to seed:

**1. how-to-sleeve-and-topload** (sort_order: 10)
- Why protection matters for value
- Step-by-step: penny sleeve first (open end up), then slide into top loader
- Common mistakes: wrong size, backwards sleeve, forcing thick cards into standard holders
- Link mention to Supplies Finder for sizing help

**2. how-to-store-cards** (sort_order: 11)
- Short-term storage: top loaders standing upright in BCW 800-count boxes
- Long-term: climate control (cool, dry, no direct sunlight)
- Binders: 9-pocket pages fine for commons, never for high-value cards (ring pressure)
- Graded slabs: stackable, but don't stack too high

**3. how-to-ship-cards** (sort_order: 12)
- PWE (plain white envelope): card in penny sleeve + top loader, taped shut, between cardboard, for low-value cards under ~$20
- Bubble mailer: top loader in team bag, padded, for mid-value cards
- Box shipping: wrap in bubble wrap, box with padding, for high-value and graded cards
- Common mistakes: not taping top loader shut, insufficient padding, no tracking on valuable cards

**4. how-to-handle-cards** (sort_order: 13)
- Clean, dry hands (or wear cotton gloves for high-value)
- Hold cards by edges only — never touch the surface
- Have sleeves ready before opening packs
- Don't stack raw cards face-to-face
- Set cards on clean, smooth surfaces only

All body content should use markdown with `##` headers and `- ` bullet lists (the existing `TopicContent` component renders these). Use `''` for escaped single quotes in SQL strings.

Related topic slugs for cross-linking:
- `how-to-sleeve-and-topload` → `['how-to-store-cards', 'how-to-handle-cards']`
- `how-to-store-cards` → `['how-to-sleeve-and-topload', 'how-to-ship-cards']`
- `how-to-ship-cards` → `['how-to-sleeve-and-topload', 'how-to-store-cards']`
- `how-to-handle-cards` → `['how-to-sleeve-and-topload']`

- [ ] **Step 2: Commit the migration file**

```bash
git add scripts/migrations/010-seed-supplies-topics.sql
git commit -m "feat: add migration to seed card care topic articles"
```

---

### Task 4: Run the migration

**Files:**
- Use: `scripts/run-migration.mjs` (existing)

- [ ] **Step 1: Run the migration against Supabase**

```bash
node scripts/run-migration.mjs scripts/migrations/010-seed-supplies-topics.sql
```

If `run-migration.mjs` doesn't exist or doesn't work, run directly with pg:

```javascript
// Use existing DB connection pattern from other scripts:
// Host: aws-0-us-west-2.pooler.supabase.com
// Port: 6543
// User: postgres.dafctdqkbmzjtkssebwx
// Database: postgres
// SSL: { rejectUnauthorized: false }
```

Expected: 4 rows inserted into `topics` table.

- [ ] **Step 2: Verify topics appear via API**

```bash
curl https://slabstreet.netlify.app/api/learn/topics 2>/dev/null | node -e "const d=require('fs').readFileSync('/dev/stdin','utf8');const t=JSON.parse(d);console.log(t.map(x=>x.slug))"
```

Expected: Should include `how-to-sleeve-and-topload`, `how-to-store-cards`, `how-to-ship-cards`, `how-to-handle-cards` alongside existing topic slugs.

---

## Chunk 3: Site Integration

### Task 5: Verify and restore Learn section links

**Files:**
- Verify: `app/page.tsx`
- Verify: `app/components/layout/Nav.tsx`

- [ ] **Step 1: Check landing page**

Read `app/page.tsx` and confirm the `tools` array includes an entry with `href: '/learn'`. Based on exploration, it already does (the "Glossary" tool card).

- [ ] **Step 2: Check Nav component**

Read `app/components/layout/Nav.tsx` and verify Learn is accessible. The nav currently shows league tabs but may not have a direct Learn link. If Learn is not linked in the nav, it's still accessible from the landing page tool cards, which is fine for now.

- [ ] **Step 3: Add Supplies Finder link to landing page**

Add a new entry to the `tools` array in `app/page.tsx`:

```typescript
{
  href: '/learn/supplies-finder',
  title: 'Supplies Finder',
  description: 'Find the right sleeve, top loader, and case for any card',
  icon: '📦',
},
```

- [ ] **Step 4: Build and verify**

```bash
npx next build
```

Expected: Clean build with all routes present.

- [ ] **Step 5: Commit and push**

```bash
git add app/page.tsx
git commit -m "feat: add Supplies Finder to landing page tools"
git push origin master
```

Expected: Netlify auto-deploys. After deploy, verify:
- `https://slabstreet.netlify.app/learn` loads the glossary
- `https://slabstreet.netlify.app/learn/supplies-finder` loads the finder tool
- `https://slabstreet.netlify.app/learn/how-to-sleeve-and-topload` loads the article
