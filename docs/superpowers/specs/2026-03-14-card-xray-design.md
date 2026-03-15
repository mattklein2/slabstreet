# Card X-Ray — Link-Based Card Intelligence Tool

**Date:** 2026-03-14
**Status:** Approved

## Overview

Paste any card marketplace link and get a complete breakdown of exactly what the card is, how rare it is, what it's graded, and what the market says about it. Not financial advice — just full transparency on every dimension of the card so collectors can make informed decisions.

## Problem

A beginner sees a listing like "2023-24 Panini Prizm Victor Wembanyama Silver RC #235 PSA 10" and has no idea:
- What set is Prizm and is it good?
- What is a Silver parallel and is it rare?
- Are there 30 other versions of this exact card that look almost identical?
- Is PSA 10 actually hard to get for this card?
- Is the asking price in line with what these actually sell for?

Card X-Ray answers all of that from a single link.

## Core Flow

1. User pastes a marketplace link (eBay first, others later)
2. System extracts listing data (title, price, images, item specifics)
3. Card identity parser identifies: player, year, brand, set, parallel, card number, grade info
4. Database matcher finds the product + parallel in our catalog
5. System pulls: parallel rainbow position, print runs, pop reports, recent sold prices
6. Everything is displayed in plain English with education baked in

## What the User Sees

### Section 1: Card Identity
Plain-English breakdown of every element:
- **Player:** Victor Wembanyama
- **Year:** 2023-24
- **Set:** Panini Prizm (flagship basketball product, released annually, one of the most collected sets)
- **Parallel:** Silver Prizm (chrome refractor finish, unnumbered but scarce)
- **Card Number:** #235
- **Rookie Card:** Yes — first officially licensed card

### Section 2: Rarity — Where This Card Sits
The parallel rainbow for this set, with this card highlighted:
- Base (unlimited) — COMMON
- Silver Prizm ← **YOU ARE HERE** — UNCOMMON
- Red White Blue /99
- Blue /199
- Green /75
- Gold /10 — RARE
- Black /1 — 1/1

Shows: rarity rank position (e.g., "#8 of 32 parallels"), print run, box exclusivity.

Factual context statements (not financial advice):
- "This is an unnumbered parallel with no confirmed print run"
- "Only 10 of the Gold parallel exist"
- "This parallel is exclusive to hobby boxes"

### Section 3: Grading Intel
If the card is graded:
- What grading company (PSA, BGS, SGC) and what the grade means
- Pop report: how many of this exact card have been graded at each level
- "PSA has graded 12,847 of this card. 4,231 received a PSA 10 (33%)"
- Context: "PSA 10 is common for this card" vs "Only 12 PSA 10s exist — this is hard to gem"

If raw:
- "This card is ungraded. Here's what grading could mean for this card..."
- Pop data showing grade distribution
- Price differential between raw and graded

### Section 4: Price Context
Recent sold listings for the same card (same parallel, same condition):
- Last 5-10 sold prices with dates
- Low / median / high range
- Current listing price vs sold average
- Factual statements: "This card is listed at $85. The median recent sale for this card in this condition is $62."

### Section 5: Set Education
Brief overview of the set this card belongs to:
- What Prizm is, when it releases, why collectors care
- How many total cards in the set
- Flagship vs non-flagship context
- Links to related glossary terms

## Architecture

### Module 1: Link Parser
- Extract item ID from URL (eBay item IDs are 12-digit numbers)
- Handle URL formats: ebay.com/itm/*, ebay.us/m/*, shortened links
- Future: COMC, MySlabs, card shop sites

### Module 2: Listing Data Fetcher
- eBay Browse API `getItem` endpoint for structured listing data
- Extract: title, price, images, condition, seller info, Item Specifics
- Item Specifics provide structured fields: Sport, Player/Athlete, Year, Set, Card Number, Parallel/Variety, Graded, Grader, Grade
- Cache listing data (listings don't change frequently)

### Module 3: Card Identity Parser
Two-pass approach:
1. **Structured pass:** Use eBay Item Specifics if available (~70% of listings fill these out)
2. **Title parse fallback:** Rules-based parser for the remaining 30%

Title parser dictionaries:
- Brands: Panini, Topps, Upper Deck, Bowman, Leaf, Sage, etc.
- Sets: Prizm, Chrome, Select, Optic, Mosaic, National Treasures, Donruss, etc.
- Parallels: Silver, Gold, Red, Blue, Green, Black, Cracked Ice, Shimmer, etc.
- Year patterns: 2023-24, 2023, '23
- Card number patterns: #235, No. 235, Card 235
- Grade patterns: PSA 10, BGS 9.5, SGC 10, CGC 9.5
- Condition: Raw, Ungraded, Mint, NM
- Junk words to strip: INVEST, GOAT, HOT, fire emoji, etc.

Output: `{ player, year, brand, set, parallel, cardNumber, isRookie, isGraded, grader, grade }`

### Module 4: Database Matcher
- Match parsed identity against products table (brand + set + year + sport)
- If product matched, pull all parallels for that product
- Match specific parallel by name
- Return: rarity rank, print run, total parallels, box exclusivity, product details

### Module 5: Pop Report Fetcher
- PSA cert verification / population lookup
- BGS population data
- Pull live, cache in our database
- Store: card identifier → { grade_level: count } mapping
- Build our own pop database over time from cached lookups

### Module 6: Price Comp Engine
- eBay Browse API search for completed/sold listings
- Filter to same card + same parallel + same condition
- Calculate: low, median, high, count
- Compare listing price to sold median
- Cache results (refresh daily)

### Module 7: Education Renderer
- Map set/product to educational content from our topics table
- Map parallel to plain-English description from our parallels data
- Map grade to explanation from glossary
- Inline glossary term links throughout
- Generate factual context statements about rarity and pricing

## Data Requirements

### Already Have
- 500+ products with parallel rainbows and rarity rankings
- eBay Browse API credentials and integration
- Glossary with 74 collector terms
- Topics table for educational content

### Need to Build
- PSA/BGS pop report integration (data fetching + caching table)
- Card identity parser (dictionaries + parsing logic)
- eBay `getItem` integration (currently only use search, not item lookup)
- Price comp caching layer
- Expanded product database (500 → thousands over time)

### Database Additions
- `card_lookups` table — log every lookup for analytics + gap identification
- `pop_reports` table — cached PSA/BGS population data
- `price_comps` table — cached sold listing price data

## Phase 1 Scope (Build First)

- eBay links only
- Card identity parsing (Item Specifics + title fallback)
- Database matching against existing products/parallels
- Parallel rainbow display with rarity positioning
- Price comps from eBay sold listings
- Education layer for matched cards
- Graceful fallback for unmatched cards (show what we know from eBay data)

## Phase 2 (Later)

- PSA/BGS pop report integration
- Grading price differential analysis
- Player-wide card view (Level 2 — every set this player appears in)
- Additional marketplace support (COMC, MySlabs)
- Unmatched card learning (use failed lookups to prioritize new product additions)
- "Cards like this" recommendations

## Technical Notes

- Route: `/xray` (clean, short, memorable)
- Single input: paste box at top of page
- Server-side API route for eBay API calls (keeps credentials secure)
- Client-side rendering for results display
- All styling via ThemeProvider inline styles (consistent with rest of site)
- Mobile-first — people will use this while browsing eBay on their phone
