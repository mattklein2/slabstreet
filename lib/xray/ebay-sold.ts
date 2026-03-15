// lib/xray/ebay-sold.ts

import * as cheerio from 'cheerio';
import type { CardIdentity } from './types';

const GRADERS = ['PSA', 'BGS', 'SGC', 'CGC', 'CSG', 'HGA'];
const GRADE_RE = new RegExp(`\\b(${GRADERS.join('|')})\\s*(\\d+\\.?\\d*)\\b`, 'i');

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
  $('li.s-card[data-listingid]').each((_i, el) => {
    const card = $(el);

    // Title: inside .s-card__title > first span (excludes "Opens in a new window or tab")
    const titleSpan = card.find('.s-card__title .su-styled-text').first();
    const title = titleSpan.text().trim();
    if (!title) return;

    // URL: the title link (a.s-card__link with /itm/ in href)
    const linkEl = card.find('a.s-card__link[href*="/itm/"]').first();
    let itemUrl = linkEl.attr('href') || '';
    if (!itemUrl) return;
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
