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

  $('[data-viewport]').each((_i, el) => {
    const container = $(el);
    const titleEl = container.find('a[href*="/itm/"]');
    const title = titleEl.text().trim();
    const itemUrl = titleEl.attr('href') || '';

    if (!title || !itemUrl) return;

    // Extract price — look for dollar amounts in the item text
    const text = container.text();
    const priceMatches = text.match(/\$[\d,]+\.?\d*/g);
    if (!priceMatches || priceMatches.length === 0) return;

    // First price match in the listing area is typically the sale price
    const price = parseFloat(priceMatches[0].replace(/[$,]/g, ''));

    // Filter shipping-only / test listings
    if (price < 1) return;

    // Extract sold date
    const dateMatch = text.match(/Sold\s+([\w]+\s+\d+,?\s*\d*)/i);
    const date = dateMatch ? dateMatch[1].replace(/\s+/g, ' ').trim() : '';

    const gradeInfo = detectGrade(title);

    items.push({
      title,
      price,
      date,
      url: itemUrl.startsWith('http') ? itemUrl : `https://www.ebay.com${itemUrl}`,
      ...gradeInfo,
    });
  });

  return items.slice(0, 60);
}
