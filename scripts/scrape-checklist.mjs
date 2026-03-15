#!/usr/bin/env node

/**
 * Cardboard Connection checklist scraper.
 *
 * Fetches a Cardboard Connection product checklist page, saves the raw HTML,
 * and parses out parallel information (name, print run, exclusivity, etc.).
 *
 * Usage:
 *   node scripts/scrape-checklist.mjs "https://www.cardboardconnection.com/2024-25-panini-prizm-basketball-cards"
 *
 * Output:
 *   data/checklists/{sport}/{year}-{brand}-{product}.html  (raw HTML)
 *   data/checklists/{sport}/{year}-{brand}-{product}.json  (parsed parallels)
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Detect sport + subdirectory from the URL slug.
 * Returns { sport, subdir } or null if unrecognized.
 */
function detectSport(urlSlug) {
  const s = urlSlug.toLowerCase();
  if (s.includes('basketball') || s.includes('-nba')) return { sport: 'NBA', subdir: 'nba' };
  if (s.includes('football') || s.includes('-nfl'))   return { sport: 'NFL', subdir: 'nfl' };
  if (s.includes('baseball') || s.includes('-mlb'))   return { sport: 'MLB', subdir: 'mlb' };
  if (s.includes('formula') || s.includes('-f1'))     return { sport: 'F1',  subdir: 'f1'  };
  if (s.includes('wnba'))                             return { sport: 'WNBA', subdir: 'wnba' };
  return null;
}

/**
 * Derive a safe filename stem from a URL.
 * e.g. "https://www.cardboardconnection.com/2024-25-panini-prizm-basketball-cards"
 *   → "2024-25-panini-prizm-basketball-cards"
 * Then strip the trailing "-cards" suffix if present.
 */
function stemFromUrl(url) {
  const parsed = new URL(url);
  let slug = parsed.pathname.replace(/^\//, '').replace(/\/$/, '');
  slug = slug.replace(/-cards$/, '');
  return slug;
}

/**
 * Extract year/brand/product from the URL slug.
 * Pattern: {YEAR}-{BRAND}-{PRODUCT}-{SPORT}
 * e.g. "2024-25-panini-prizm-basketball" → { year: "2024-25", brand: "Panini", product: "Prizm" }
 *
 * This is best-effort — the slug is used as fallback when the page title is absent.
 */
function parseSlugMeta(slug) {
  // Known year patterns: 2024, 2024-25, 2025-26
  const yearMatch = slug.match(/^(\d{4}(?:-\d{2})?)-/);
  const year = yearMatch ? yearMatch[1] : null;

  // Sport keywords to strip from the end
  const sportKeywords = ['basketball', 'football', 'baseball', 'formula', 'wnba', 'nba', 'nfl', 'mlb', 'f1'];

  let rest = year ? slug.slice(yearMatch[0].length) : slug;

  // Remove sport keyword from the end
  for (const kw of sportKeywords) {
    if (rest.endsWith(`-${kw}`)) {
      rest = rest.slice(0, -(kw.length + 1));
      break;
    }
  }

  // Now rest is "{brand}-{product...}"
  // Brand is almost always the first token
  const parts = rest.split('-');
  const brand = parts.length > 0 ? capitalize(parts[0]) : null;
  const product = parts.length > 1 ? parts.slice(1).map(capitalize).join(' ') : null;

  return { year, brand, product };
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ── Print-run / exclusivity parsers ──────────────────────────────────────────

/**
 * Parse print run info from a text fragment.
 * Returns { printRun, serialNumbered, isOneOfOne } or null if no match.
 */
function parsePrintRun(text) {
  const t = text.toLowerCase();

  // 1/1 variants
  if (/\b1\/1\b/.test(t) || /\bone[\s-]of[\s-]one\b/.test(t)) {
    return { printRun: 1, serialNumbered: true, isOneOfOne: true };
  }

  // #/99 or /99
  const slashMatch = t.match(/(?:#\s*\/|\/)\s*(\d+)/);
  if (slashMatch) {
    const n = parseInt(slashMatch[1], 10);
    return { printRun: n, serialNumbered: true, isOneOfOne: n === 1 };
  }

  // "numbered to 99" / "numbered #/99" / "numbered 99"
  const numberedMatch = t.match(/numbered(?:\s+(?:to|#\s*\/))?\s+(\d+)/);
  if (numberedMatch) {
    const n = parseInt(numberedMatch[1], 10);
    return { printRun: n, serialNumbered: true, isOneOfOne: n === 1 };
  }

  // "serial numbered" without explicit count
  if (/serial[\s-]?numbered/.test(t)) {
    return { printRun: null, serialNumbered: true, isOneOfOne: false };
  }

  return null;
}

/**
 * Parse exclusivity note from a text fragment.
 * Returns "Hobby" | "Retail" | "FOTL" | "Blaster" | "Mega" | null.
 */
function parseExclusivity(text) {
  const t = text.toLowerCase();
  if (/\bfotl\b/.test(t) || /first\s+off\s+the\s+line/i.test(t)) return 'FOTL';
  if (/\bhobby\b/.test(t)) return 'Hobby';
  if (/\bretail\b/.test(t)) return 'Retail';
  if (/\bblaster\b/.test(t)) return 'Blaster';
  if (/\bmega\s*box\b/.test(t)) return 'Mega';
  return null;
}

/**
 * Given a raw text line or bullet representing a parallel, extract structured data.
 */
function parseParallelLine(rawText) {
  const text = rawText.trim();
  if (!text) return null;

  const prInfo = parsePrintRun(text) || { printRun: null, serialNumbered: false, isOneOfOne: false };
  const exclusivity = parseExclusivity(text);

  // Derive a clean parallel name by stripping the print-run and exclusivity noise
  let name = text
    // Remove parenthetical notes
    .replace(/\([^)]*\)/g, '')
    // Remove "- #/99" style suffixes
    .replace(/[-–]\s*#?\s*\/\s*\d+/g, '')
    // Remove "numbered to N" / "numbered N"
    .replace(/numbered(?:\s+(?:to|#\s*\/)?)?\s*\d*/gi, '')
    // Remove serial-numbered
    .replace(/serial[\s-]?numbered/gi, '')
    // Remove 1/1 / one of one
    .replace(/\b1\/1\b/gi, '')
    .replace(/one[\s-]of[\s-]one/gi, '')
    // Remove exclusivity phrases
    .replace(/hobby\s*(only|exclusive)?/gi, '')
    .replace(/retail\s*(only|exclusive)?/gi, '')
    .replace(/fotl/gi, '')
    .replace(/first\s+off\s+the\s+line/gi, '')
    .replace(/blaster/gi, '')
    .replace(/mega\s*box/gi, '')
    // Clean up leftover punctuation
    .replace(/[-–:,]+\s*$/, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  if (!name) return null;

  return { name, ...prInfo, exclusivity };
}

// ── HTML parsing ──────────────────────────────────────────────────────────────

/**
 * Heuristic: is this text likely a parallel section header?
 */
function isParallelHeader(text) {
  const t = text.toLowerCase().trim();
  return (
    t.startsWith('parallel') ||
    t === 'parallel cards:' ||
    t === 'parallels:' ||
    t === 'parallels' ||
    t === 'parallel cards' ||
    t === 'color variations' ||
    t === 'color variations:'
  );
}

/**
 * Main page parser using cheerio.
 * Tries multiple strategies to extract parallel data.
 */
function parseChecklistPage(html) {
  const $ = cheerio.load(html);
  const parallels = [];
  const seen = new Set();

  function addParallel(parsed) {
    if (!parsed || !parsed.name) return;
    const key = parsed.name.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    parallels.push(parsed);
  }

  // ── Strategy 1: Find "Parallels" section headers and scrape the following list ──
  $('h2, h3, h4, strong, b, p').each((_, el) => {
    const headText = $(el).text().trim();
    if (!isParallelHeader(headText)) return;

    // Walk siblings/children after the header to find lists or paragraphs
    let sibling = $(el).parent();

    // Try the next sibling elements
    let target = $(el).next();
    for (let i = 0; i < 10; i++) {
      if (!target.length) break;
      const tag = target.prop('tagName')?.toLowerCase();
      if (tag === 'ul' || tag === 'ol') {
        target.find('li').each((_, li) => {
          addParallel(parseParallelLine($(li).text()));
        });
        break;
      }
      if (tag === 'p') {
        const text = target.text().trim();
        if (!text || isParallelHeader(text)) { target = target.next(); continue; }
        // Some pages list parallels comma-separated in a paragraph
        text.split(/[,\n]/).forEach(chunk => addParallel(parseParallelLine(chunk)));
        break;
      }
      // If we hit another major header, stop
      if (['h2', 'h3', 'h4'].includes(tag)) break;
      target = target.next();
    }
  });

  // ── Strategy 2: Scan all <li> items across the page for parallel-like entries ──
  // Heuristic: li items that mention a print run or known exclusivity are likely parallels
  $('li').each((_, el) => {
    const text = $(el).text().trim();
    if (!text || text.length > 200) return; // skip very long items (card descriptions)
    const prInfo = parsePrintRun(text);
    const excl = parseExclusivity(text);
    if (prInfo || excl) {
      addParallel(parseParallelLine(text));
    }
  });

  // ── Strategy 3: Look for tables with parallel data ──
  $('table').each((_, table) => {
    const headers = $(table)
      .find('th')
      .map((_, th) => $(th).text().toLowerCase().trim())
      .get();

    // Look for tables that have a "parallel" or "variation" column
    const parallelColIdx = headers.findIndex(h =>
      h.includes('parallel') || h.includes('variation') || h.includes('color')
    );
    if (parallelColIdx === -1) return;

    $(table).find('tbody tr').each((_, row) => {
      const cells = $(row).find('td');
      const nameCell = $(cells[parallelColIdx]).text().trim();
      if (!nameCell) return;

      // Check other cells for print run / exclusivity info
      const rowText = $(row).text();
      const prInfo = parsePrintRun(rowText) || { printRun: null, serialNumbered: false, isOneOfOne: false };
      const exclusivity = parseExclusivity(rowText);

      const key = nameCell.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        parallels.push({ name: nameCell, ...prInfo, exclusivity });
      }
    });
  });

  // ── Strategy 4: Inline text scan — look for "– Name - #/NN" patterns ──
  // Common in Cardboard Connection prose sections
  const bodyText = $('article, .entry-content, main, #content').text();
  const inlinePattern = /[-–]\s*([A-Z][A-Za-z\s]+?)(?:\s*[-–]\s*(?:#?\/\d+|1\/1|numbered to \d+))?(?:\s*\([^)]*\))?/g;
  // This pattern is intentionally conservative — only extract if print run is explicit
  const inlineWithPrintRun = /([A-Z][A-Za-z\s]+?)\s*[-–:]\s*(#?\/\d+|1\/1|numbered(?:\s+(?:to\s+)?\d+))/gi;
  let m;
  while ((m = inlineWithPrintRun.exec(bodyText)) !== null) {
    const rawName = m[1].trim();
    const rawPrint = m[2];
    if (rawName.split(' ').length > 6) continue; // skip long phrases that aren't parallel names
    const prInfo = parsePrintRun(rawPrint) || { printRun: null, serialNumbered: false, isOneOfOne: false };
    const key = rawName.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      parallels.push({ name: rawName, ...prInfo, exclusivity: null });
    }
  }

  return parallels;
}

/**
 * Attempt to extract sport, year, brand, product from the page title.
 * Falls back to slug-derived values.
 */
function extractPageMeta($, slugMeta) {
  // Try <title> tag or og:title
  const title =
    $('meta[property="og:title"]').attr('content') ||
    $('title').text() ||
    '';

  // Cardboard Connection titles look like:
  // "2024-25 Panini Prizm Basketball Cards Checklist"
  const titleMatch = title.match(/^(\d{4}(?:-\d{2})?)\s+(.+?)\s+(?:basketball|football|baseball|formula|wnba|nba|nfl|mlb|f1)\s+cards?/i);
  if (titleMatch) {
    const year = titleMatch[1];
    const rest = titleMatch[2].trim().split(/\s+/);
    const brand = rest[0];
    const product = rest.slice(1).join(' ') || slugMeta.product;
    return { year, brand, product };
  }

  return slugMeta;
}

// ── Fetch with retry ──────────────────────────────────────────────────────────

async function fetchWithRetry(url, retries = 3, delayMs = 2000) {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  ];
  const ua = userAgents[0];

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Fetching (attempt ${attempt}): ${url}`);
      const res = await fetch(url, {
        headers: {
          'User-Agent': ua,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }

      const html = await res.text();
      console.log(`Fetched ${html.length.toLocaleString()} bytes`);
      return html;
    } catch (err) {
      console.error(`Attempt ${attempt} failed: ${err.message}`);
      if (attempt < retries) {
        const wait = delayMs * attempt;
        console.log(`Waiting ${wait}ms before retry...`);
        await new Promise(r => setTimeout(r, wait));
      } else {
        throw err;
      }
    }
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const url = process.argv[2];
  if (!url) {
    console.error('Usage: node scripts/scrape-checklist.mjs <cardboardconnection-url>');
    process.exit(1);
  }

  // Validate URL
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    console.error(`Invalid URL: ${url}`);
    process.exit(1);
  }

  if (!parsed.hostname.includes('cardboardconnection.com')) {
    console.warn(`Warning: URL hostname is "${parsed.hostname}" — expected cardboardconnection.com`);
  }

  // Detect sport
  const urlSlug = parsed.pathname.replace(/^\//, '').replace(/\/$/, '');
  const sportInfo = detectSport(urlSlug);
  if (!sportInfo) {
    console.error(`Could not detect sport from URL slug: "${urlSlug}"`);
    console.error('Supported: basketball/nba, football/nfl, baseball/mlb, formula/f1, wnba');
    process.exit(1);
  }

  const { sport, subdir } = sportInfo;
  const stem = stemFromUrl(url);
  const outDir = resolve(ROOT, 'data', 'checklists', subdir);

  // Ensure output directory exists
  mkdirSync(outDir, { recursive: true });

  const htmlPath = resolve(outDir, `${stem}.html`);
  const jsonPath = resolve(outDir, `${stem}.json`);

  // ── Rate limit: pause 1.5s before fetching (polite crawl) ──
  console.log('Waiting 1.5s before fetching (rate limiting)...');
  await new Promise(r => setTimeout(r, 1500));

  // Fetch HTML
  const html = await fetchWithRetry(url);

  // Save raw HTML
  writeFileSync(htmlPath, html, 'utf-8');
  console.log(`HTML saved to: ${htmlPath}`);

  // Parse
  const $ = cheerio.load(html);
  const slugMeta = parseSlugMeta(stem);
  const meta = extractPageMeta($, slugMeta);

  const parallels = parseChecklistPage(html);
  console.log(`Found ${parallels.length} parallel(s)`);

  const output = {
    url,
    scrapedAt: new Date().toISOString(),
    brand: meta.brand,
    product: meta.product,
    sport,
    year: meta.year,
    parallels,
  };

  writeFileSync(jsonPath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`JSON saved to: ${jsonPath}`);

  if (parallels.length === 0) {
    console.warn('No parallels extracted — the page structure may not match expected patterns.');
    console.warn('Inspect the raw HTML file for clues and consider updating the parser.');
  } else {
    console.log('\nSample parallels:');
    parallels.slice(0, 5).forEach(p => {
      const pr = p.printRun ? `/${p.printRun}` : p.serialNumbered ? 'serial' : 'unnumbered';
      const excl = p.exclusivity ? ` [${p.exclusivity}]` : '';
      console.log(`  ${p.name} — ${pr}${excl}`);
    });
    if (parallels.length > 5) console.log(`  ... and ${parallels.length - 5} more`);
  }
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
