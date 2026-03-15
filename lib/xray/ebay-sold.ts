// lib/xray/ebay-sold.ts

import * as cheerio from 'cheerio';
import type { CardIdentity } from './types';

const GRADERS = ['PSA', 'BGS', 'SGC', 'CGC', 'CSG', 'HGA'];
const GRADE_RE = new RegExp(`\\b(${GRADERS.join('|')})\\s*(\\d+\\.?\\d*)\\b`, 'i');

/**
 * Normalize a string for fuzzy matching: lowercase, strip special chars, collapse spaces.
 */
function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * Check if all words from `needle` appear in `haystack` (order-independent).
 */
function containsAllWords(haystack: string, needle: string): boolean {
  const hWords = normalize(haystack).split(' ');
  const nWords = normalize(needle).split(' ');
  return nWords.every(w => hWords.some(hw => hw.includes(w) || w.includes(hw)));
}

/**
 * Post-filter sold listings to only include items that actually match the card identity.
 * Checks player name (required), parallel name (if not base), and year.
 */
export function filterSoldItems(items: SoldItem[], identity: CardIdentity): SoldItem[] {
  return items.filter(item => {
    const titleLower = normalize(item.title);

    // Player name MUST appear in title (check last name at minimum)
    if (identity.player) {
      const playerParts = normalize(identity.player).split(' ');
      // Last name must match; for common names also check first name
      const lastName = playerParts[playerParts.length - 1];
      if (!titleLower.includes(lastName)) return false;
    }

    // Year should appear (2-digit or 4-digit)
    if (identity.year) {
      const y4 = identity.year;            // "2024"
      const y2 = identity.year.slice(-2);  // "24"
      if (!titleLower.includes(y4) && !titleLower.includes(y2)) return false;
    }

    // Parallel should appear in title (unless base)
    if (identity.parallel && identity.parallel.toLowerCase() !== 'base') {
      // Some parallels have multi-word names like "Neon Blue Prizm"
      // Check if the key words appear (not necessarily contiguous)
      if (!containsAllWords(item.title, identity.parallel)) return false;
    }

    // Filter out lot listings (multi-card sales skew prices)
    if (/\b(lot|bundle|bulk|set of|complete set)\b/i.test(item.title)) return false;

    return true;
  });
}

export interface SoldItem {
  title: string;
  price: number;
  date: string;       // "Mar 14, 2026"
  url: string;
  condition: 'raw' | 'graded';
  grader: string | null;
  grade: string | null;
}

/**
 * Build a search query from card identity for sold listings.
 * Omits brand (eBay set names include it). Includes parallel unless "Base".
 */
export function buildSoldQuery(identity: CardIdentity): string | null {
  const parts: string[] = [];
  if (identity.year) parts.push(identity.year);
  if (identity.set) {
    // Clean set name: strip brand/year that eBay often includes
    const cleanSet = identity.set
      .replace(/\b(panini|topps|upper\s*deck|bowman|donruss|leaf|fleer|score)\b/gi, '')
      .replace(/\b20\d{2}(?:-\d{2})?\b/g, '')
      .trim()
      .replace(/\s+/g, ' ');
    if (cleanSet) parts.push(cleanSet);
  }
  if (identity.player) parts.push(identity.player);
  if (identity.parallel && identity.parallel.toLowerCase() !== 'base') {
    parts.push(identity.parallel);
  }
  if (identity.insert) {
    parts.push(identity.insert);
  }
  // Need at least 3 parts for a meaningful query
  return parts.length >= 3 ? parts.join(' ') : null;
}

/**
 * Detect grading info from a listing title.
 */
function detectGrade(title: string): Pick<SoldItem, 'condition' | 'grader' | 'grade'> {
  const match = title.match(GRADE_RE);
  if (match) {
    return { condition: 'graded', grader: match[1].toUpperCase(), grade: match[2] };
  }
  return { condition: 'raw', grader: null, grade: null };
}

/**
 * Scrape eBay sold listings page for a given query.
 * Returns up to 60 sold items sorted by most recent.
 */
export async function searchSoldListings(query: string): Promise<SoldItem[]> {
  const encoded = encodeURIComponent(query);
  const url = `https://www.ebay.com/sch/i.html?_nkw=${encoded}&_sacat=261328&LH_Sold=1&LH_Complete=1&_sop=13&_ipg=120`;

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });

  if (!res.ok) {
    console.error('eBay sold page fetch error:', res.status);
    return [];
  }

  const html = await res.text();
  const $ = cheerio.load(html);
  const items: SoldItem[] = [];

  // Each sold listing is an <li> with class "s-card" and a data-listingid attribute.
  // This excludes ads, "Have one to sell?" blocks, and other non-listing elements.
  $('li.s-card[data-listingid]:not([data-sponsored])').each((_i, el) => {
    const card = $(el);

    // Title: inside .s-card__title > first span (excludes "Opens in a new window or tab")
    const titleSpan = card.find('.s-card__title .su-styled-text').first();
    const title = titleSpan.text().trim();
    if (!title) return;

    // Skip sponsored "Shop on eBay" items
    if (/shop on ebay/i.test(title)) return;

    // URL: the title link (a.s-card__link with /itm/ in href)
    const linkEl = card.find('a.s-card__link[href*="/itm/"]').first();
    let itemUrl = linkEl.attr('href') || '';
    if (!itemUrl) return;

    // Skip non-item URLs (sponsored store links)
    if (!itemUrl.includes('/itm/')) return;
    // Clean URL: strip tracking params, keep just the item page
    const itemIdMatch = itemUrl.match(/\/itm\/(\d+)/);
    if (itemIdMatch) {
      itemUrl = `https://www.ebay.com/itm/${itemIdMatch[1]}`;
    }

    // Price: in span.s-card__price
    const priceText = card.find('.s-card__price').first().text().trim();
    const priceMatch = priceText.match(/\$([\d,]+\.?\d*)/);
    if (!priceMatch) return;
    const price = parseFloat(priceMatch[1].replace(/,/g, ''));
    if (price < 0.01) return;

    // Sold date: in span with "Sold" text inside .s-card__caption
    const captionText = card.find('.s-card__caption').text().trim();
    const dateMatch = captionText.match(/Sold\s+([A-Z][a-z]+\s+\d{1,2},?\s+\d{4})/i);
    const date = dateMatch ? dateMatch[1].trim() : '';

    const gradeInfo = detectGrade(title);

    items.push({
      title,
      price,
      date,
      url: itemUrl,
      ...gradeInfo,
    });
  });

  return items.slice(0, 60);
}
