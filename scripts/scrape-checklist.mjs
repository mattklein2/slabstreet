#!/usr/bin/env node

/**
 * Cardboard Connection checklist scraper.
 *
 * Fetches a Cardboard Connection product checklist page, saves the raw HTML,
 * and parses out parallel and insert set information.
 *
 * Usage:
 *   node scripts/scrape-checklist.mjs "https://www.cardboardconnection.com/2024-25-panini-prizm-basketball-cards"
 *   node scripts/scrape-checklist.mjs --batch data/checklist-urls-nba.txt
 *
 * Output:
 *   data/checklists/{sport}/{year}-{brand}-{product}.html  (raw HTML)
 *   data/checklists/{sport}/{year}-{brand}-{product}.json  (parsed parallels + inserts)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
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

/**
 * Parse odds from text like "1:288 hobby packs" or "Odds: 1:48".
 */
function parseOdds(text) {
  const m = text.match(/\b(\d+:\d+(?:\s+(?:hobby|retail|blaster|mega|fat|cello|hanger)\s*(?:packs?|boxes?)?)?)(?:\b|$)/i);
  return m ? m[1].trim() : null;
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
 * Heuristic: is this text likely an insert section header?
 */
function isInsertSectionHeader(text) {
  const t = text.toLowerCase().trim();
  return (
    t.startsWith('insert') ||
    t === 'insert cards:' ||
    t === 'insert cards' ||
    t === 'inserts:' ||
    t === 'inserts' ||
    t === 'insert sets' ||
    t === 'insert sets:'
  );
}

/**
 * Main page parser using cheerio.
 * Tries multiple strategies to extract parallel and insert data.
 * Returns { parallels: [...], inserts: [...] }
 */
function parseChecklistPage(html) {
  const $ = cheerio.load(html);
  const parallels = [];
  const inserts = [];
  const seen = new Set();

  // Track elements that belong to the insert section so strategies 2-4 skip them
  const insertElements = new Set();

  function addParallel(parsed) {
    if (!parsed || !parsed.name) return;
    const key = parsed.name.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    parallels.push(parsed);
  }

  // ── First pass: Find insert section boundaries and extract insert data ──
  $('h2, h3, h4, strong, b, p').each((_, el) => {
    const headText = $(el).text().trim();
    if (!isInsertSectionHeader(headText)) return;

    // Mark this element as part of insert section
    insertElements.add(el);

    // Walk sibling elements after the insert header to find sub-headers and their parallel lists
    let current = $(el).next();
    // If the header is inside a <p> or <strong>, walk from the parent
    const parentTag = $(el).prop('tagName')?.toLowerCase();
    if (['strong', 'b'].includes(parentTag) || ['strong', 'b'].includes($(el).prop('tagName')?.toLowerCase())) {
      current = $(el).parent().next();
    }

    let currentInsert = null;

    for (let i = 0; i < 100; i++) {
      if (!current.length) break;
      const tag = current.prop('tagName')?.toLowerCase();
      const text = current.text().trim();

      // Stop if we hit another major section header (parallels, autographs, etc.)
      if (['h2'].includes(tag) && !isInsertSectionHeader(text)) break;
      if (tag === 'h2' || (tag === 'h3' && isParallelHeader(text))) break;

      // Mark this element as belonging to insert section
      insertElements.add(current[0]);

      // Check if this is an insert sub-header (H3, H4, or bold text)
      const isSubHeader =
        ['h3', 'h4'].includes(tag) ||
        (tag === 'p' && current.find('strong, b').length > 0 && text.length < 100 && !text.includes('/'));

      if (isSubHeader && !isInsertSectionHeader(text) && !isParallelHeader(text)) {
        // Save previous insert if it exists
        if (currentInsert) {
          inserts.push(currentInsert);
        }

        // Extract the insert name — use the bold text if it's a <p> with <strong>
        let insertName = text;
        if (tag === 'p') {
          const boldText = current.find('strong, b').first().text().trim();
          if (boldText) insertName = boldText;
        }

        // Clean up the insert name (remove trailing colons, "Cards" suffix, etc.)
        insertName = insertName.replace(/[:]+$/, '').replace(/\s+Cards?\s*$/i, '').trim();

        // Try to extract odds from the header text
        const odds = parseOdds(text);

        // Try to extract exclusivity from the header text
        const excl = parseExclusivity(text);

        currentInsert = {
          name: insertName,
          parallels: [],
          odds: odds,
          exclusivity: excl,
        };
      } else if (currentInsert) {
        // Look for parallel lists under the current insert
        if (tag === 'ul' || tag === 'ol') {
          current.find('li').each((_, li) => {
            insertElements.add(li);
            const parsed = parseParallelLine($(li).text());
            if (parsed) currentInsert.parallels.push(parsed);
          });
        } else if (tag === 'p' && !isSubHeader) {
          // Check for comma-separated parallels or odds info in paragraph text
          const oddsFromP = parseOdds(text);
          if (oddsFromP && !currentInsert.odds) {
            currentInsert.odds = oddsFromP;
          }
          // Try to parse parallel lines from the paragraph
          if (parsePrintRun(text) || parseExclusivity(text)) {
            text.split(/[,\n]/).forEach(chunk => {
              const parsed = parseParallelLine(chunk);
              if (parsed) currentInsert.parallels.push(parsed);
            });
          }
        }
      }

      current = current.next();
    }

    // Don't forget the last insert
    if (currentInsert) {
      inserts.push(currentInsert);
    }
  });

  // ── Strategy 1: Find "Parallels" section headers and scrape the following list ──
  $('h2, h3, h4, strong, b, p').each((_, el) => {
    if (insertElements.has(el)) return; // Skip insert section elements
    const headText = $(el).text().trim();
    if (!isParallelHeader(headText)) return;

    // Walk siblings/children after the header to find lists or paragraphs
    let sibling = $(el).parent();

    // Try the next sibling elements
    let target = $(el).next();
    for (let i = 0; i < 10; i++) {
      if (!target.length) break;
      if (insertElements.has(target[0])) break; // Stop at insert section
      const tag = target.prop('tagName')?.toLowerCase();
      if (tag === 'ul' || tag === 'ol') {
        target.find('li').each((_, li) => {
          if (insertElements.has(li)) return;
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
    if (insertElements.has(el)) return; // Skip insert section elements
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
    if (insertElements.has(table)) return; // Skip insert section elements
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

  return { parallels, inserts };
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

      // Handle 429 Too Many Requests with exponential backoff
      if (res.status === 429) {
        const backoffMs = 30000 * Math.pow(2, attempt - 1); // 30s, 60s, 120s
        console.warn(`HTTP 429 Too Many Requests — backing off ${backoffMs / 1000}s...`);
        await new Promise(r => setTimeout(r, backoffMs));
        continue;
      }

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

  throw new Error(`Failed to fetch ${url} after ${retries} attempts`);
}

// ── Process a single URL ─────────────────────────────────────────────────────

async function processUrl(url, index, total) {
  // Validate URL
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`Invalid URL: ${url}`);
  }

  if (!parsed.hostname.includes('cardboardconnection.com')) {
    console.warn(`Warning: URL hostname is "${parsed.hostname}" — expected cardboardconnection.com`);
  }

  // Detect sport
  const urlSlug = parsed.pathname.replace(/^\//, '').replace(/\/$/, '');
  const sportInfo = detectSport(urlSlug);
  if (!sportInfo) {
    throw new Error(`Could not detect sport from URL slug: "${urlSlug}"`);
  }

  const { sport, subdir } = sportInfo;
  const stem = stemFromUrl(url);
  const outDir = resolve(ROOT, 'data', 'checklists', subdir);

  // Ensure output directory exists
  mkdirSync(outDir, { recursive: true });

  const htmlPath = resolve(outDir, `${stem}.html`);
  const jsonPath = resolve(outDir, `${stem}.json`);

  // Fetch HTML
  const html = await fetchWithRetry(url);

  // Save raw HTML
  writeFileSync(htmlPath, html, 'utf-8');

  // Parse
  const $ = cheerio.load(html);
  const slugMeta = parseSlugMeta(stem);
  const meta = extractPageMeta($, slugMeta);

  const { parallels, inserts } = parseChecklistPage(html);

  const label = stem.length > 40 ? stem.slice(0, 40) + '...' : stem;
  if (total > 1) {
    console.log(`[${index}/${total}] ${label} — ${parallels.length} parallels, ${inserts.length} inserts`);
  } else {
    console.log(`Found ${parallels.length} parallel(s) and ${inserts.length} insert set(s)`);
  }

  const output = {
    url,
    scrapedAt: new Date().toISOString(),
    brand: meta.brand,
    product: meta.product,
    sport,
    year: meta.year,
    parallels,
    inserts,
  };

  writeFileSync(jsonPath, JSON.stringify(output, null, 2), 'utf-8');

  if (total === 1) {
    console.log(`HTML saved to: ${htmlPath}`);
    console.log(`JSON saved to: ${jsonPath}`);

    if (parallels.length === 0 && inserts.length === 0) {
      console.warn('No parallels or inserts extracted — the page structure may not match expected patterns.');
      console.warn('Inspect the raw HTML file for clues and consider updating the parser.');
    } else {
      if (parallels.length > 0) {
        console.log('\nSample parallels:');
        parallels.slice(0, 5).forEach(p => {
          const pr = p.printRun ? `/${p.printRun}` : p.serialNumbered ? 'serial' : 'unnumbered';
          const excl = p.exclusivity ? ` [${p.exclusivity}]` : '';
          console.log(`  ${p.name} — ${pr}${excl}`);
        });
        if (parallels.length > 5) console.log(`  ... and ${parallels.length - 5} more`);
      }

      if (inserts.length > 0) {
        console.log('\nInsert sets:');
        inserts.slice(0, 5).forEach(ins => {
          const pCount = ins.parallels.length;
          const odds = ins.odds ? ` (${ins.odds})` : '';
          const excl = ins.exclusivity ? ` [${ins.exclusivity}]` : '';
          console.log(`  ${ins.name} — ${pCount} parallel(s)${odds}${excl}`);
        });
        if (inserts.length > 5) console.log(`  ... and ${inserts.length - 5} more`);
      }
    }
  }

  return { parallels: parallels.length, inserts: inserts.length };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  // Check for --batch mode
  const batchIdx = args.indexOf('--batch');
  if (batchIdx !== -1) {
    const batchFile = args[batchIdx + 1];
    if (!batchFile) {
      console.error('Usage: node scripts/scrape-checklist.mjs --batch <url-list-file>');
      process.exit(1);
    }

    const batchPath = resolve(process.cwd(), batchFile);
    if (!existsSync(batchPath)) {
      console.error(`Batch file not found: ${batchPath}`);
      process.exit(1);
    }

    const lines = readFileSync(batchPath, 'utf-8')
      .split('\n')
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('#'));

    console.log(`Batch mode: ${lines.length} URL(s) to process\n`);

    const failedUrls = [];
    let successCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const url = lines[i];

      // Rate limit: 5-second delay between requests (skip for first)
      if (i > 0) {
        console.log('Waiting 5s between requests...');
        await new Promise(r => setTimeout(r, 5000));
      }

      try {
        await processUrl(url, i + 1, lines.length);
        successCount++;
      } catch (err) {
        console.error(`[${i + 1}/${lines.length}] FAILED: ${url}`);
        console.error(`  Error: ${err.message}`);
        failedUrls.push(url);
      }
    }

    console.log(`\nBatch complete: ${successCount}/${lines.length} succeeded`);

    if (failedUrls.length > 0) {
      const failedPath = batchPath.replace(/(\.\w+)?$/, '-failed.txt');
      writeFileSync(failedPath, failedUrls.join('\n') + '\n', 'utf-8');
      console.log(`${failedUrls.length} failed URL(s) written to: ${failedPath}`);
    }

    return;
  }

  // Single URL mode
  const url = args[0];
  if (!url) {
    console.error('Usage: node scripts/scrape-checklist.mjs <cardboardconnection-url>');
    console.error('       node scripts/scrape-checklist.mjs --batch <url-list-file>');
    process.exit(1);
  }

  // ── Rate limit: pause 1.5s before fetching (polite crawl) ──
  console.log('Waiting 1.5s before fetching (rate limiting)...');
  await new Promise(r => setTimeout(r, 1500));

  await processUrl(url, 1, 1);
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
