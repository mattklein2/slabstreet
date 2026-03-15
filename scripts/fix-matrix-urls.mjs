import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const matrixPath = path.join(__dirname, '../data/product-matrix.json');

const data = JSON.parse(readFileSync(matrixPath, 'utf8'));
const BASE = 'https://www.cardboardconnection.com';

// ──────────────────────────────────────────────────────────────────────────────
// Product slug maps
// ──────────────────────────────────────────────────────────────────────────────

// NBA – Panini slug overrides (name → slug segment)
const NBA_PANINI_SLUG = {
  'Optic':               'donruss-optic',
  'Donruss':             'donruss',
  'National Treasures':  'national-treasures',
  'Court Kings':         'court-kings',
  'Crown Royale':        'crown-royale',
};

// NBA – Topps slug overrides
const NBA_TOPPS_SLUG = {
  'Topps Basketball':         '', // flagship → no product slug
  'Topps Chrome Basketball':  'chrome',
  'Topps Finest Basketball':  'finest',
};

// NFL – which products use "football-cards" (no "nfl") vs "football-nfl-cards"
const NFL_NO_NFL_SUFFIX = new Set([
  'Select', 'Donruss', 'Contenders', 'Score',
  'National Treasures', 'Flawless', 'Immaculate',
  'Phoenix', 'Chronicles', 'Plates & Patches', 'Limited',
]);

const NFL_PANINI_SLUG = {
  'Optic':          'donruss-optic',
  'Plates & Patches': 'plates-and-patches',
};

// MLB – Topps slug overrides (handles "Topps Foo" → "foo" segment)
const MLB_TOPPS_SLUG = {
  'Topps Series 1':       'series-1',
  'Topps Series 2':       'series-2',
  'Topps Update':         'update-series',
  'Topps Chrome':         'chrome',
  'Heritage':             'heritage',
  'Finest':               'finest',
  'Stadium Club':         'stadium-club',
  'Gypsy Queen':          'gypsy-queen',
  'Allen & Ginter':       'allen-ginter',
  'Museum Collection':    'museum-collection',
  'Tier One':             'tier-one',
  'Tribute':              'tribute',
  'Diamond Icons':        'diamond-icons',
};

// MLB – Bowman slug overrides
const MLB_BOWMAN_SLUG = {
  'Bowman':         '',           // no extra slug → {year}-bowman-baseball-cards
  'Bowman Chrome':  'chrome',
  "Bowman's Best":  null,         // special: {year}-bowmans-best-baseball-cards
};

// F1 – Topps slug overrides
const F1_TOPPS_SLUG = {
  'Topps Chrome F1':          'chrome',
  'Topps Flagship F1':        '',         // no product slug
  'Topps Dynasty F1':         'dynasty',
  'Topps Finest F1':          'finest',
  'Topps Chrome Sapphire F1': 'chrome-sapphire',
};

// WNBA – name → slug (strip " WNBA" suffix, lowercase)
const WNBA_PANINI_SLUG = {
  'Prizm WNBA':   'prizm',
  'Select WNBA':  'select',
  'Hoops WNBA':   'hoops',
  'Donruss WNBA': 'donruss',
  'Origins WNBA': 'origins',
};

// ──────────────────────────────────────────────────────────────────────────────
// Generic slug helper: "Some Name" → "some-name"
// ──────────────────────────────────────────────────────────────────────────────
function toSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// ──────────────────────────────────────────────────────────────────────────────
// URL generators per sport
// ──────────────────────────────────────────────────────────────────────────────

function nbaUrl(product) {
  const { brand, name, year } = product;

  if (brand === 'Topps') {
    const slug = NBA_TOPPS_SLUG[name];
    if (slug === undefined) {
      // fallback: strip "Topps " prefix and lowercase
      const fallback = toSlug(name.replace(/^Topps\s+/i, '').replace(/\s+Basketball$/i, ''));
      return `${BASE}/${year}-topps-${fallback}-basketball-cards`;
    }
    if (slug === '') {
      return `${BASE}/${year}-topps-basketball-cards`;
    }
    return `${BASE}/${year}-topps-${slug}-basketball-cards`;
  }

  // Panini (default)
  const slug = NBA_PANINI_SLUG[name] ?? toSlug(name);
  return `${BASE}/${year}-panini-${slug}-basketball-nba-cards`;
}

function nflUrl(product) {
  const { name, year } = product;
  const slug = NFL_PANINI_SLUG[name] ?? toSlug(name);
  const suffix = NFL_NO_NFL_SUFFIX.has(name) ? 'football-cards' : 'football-nfl-cards';
  return `${BASE}/${year}-panini-${slug}-${suffix}`;
}

function mlbUrl(product) {
  const { brand, name, year } = product;

  if (brand === 'Bowman') {
    // Special cases
    if (name === "Bowman's Best") {
      return `${BASE}/${year}-bowmans-best-baseball-cards`;
    }
    const slug = MLB_BOWMAN_SLUG[name];
    if (slug === '') {
      return `${BASE}/${year}-bowman-baseball-cards`;
    }
    if (slug !== undefined) {
      return `${BASE}/${year}-bowman-${slug}-baseball-cards`;
    }
    // fallback
    const fallback = toSlug(name.replace(/^Bowman\s+/i, ''));
    return `${BASE}/${year}-bowman-${fallback}-baseball-cards`;
  }

  if (brand === 'Panini') {
    const slug = toSlug(name);
    return `${BASE}/${year}-panini-${slug}-baseball-cards`;
  }

  // Topps (default)
  if (MLB_TOPPS_SLUG[name] !== undefined) {
    const slug = MLB_TOPPS_SLUG[name];
    return `${BASE}/${year}-topps-${slug}-baseball-cards`;
  }
  // Allen & Ginter special (no "topps-" prefix)
  if (name === 'Allen & Ginter') {
    return `${BASE}/${year}-topps-allen-ginter-baseball-cards`;
  }
  // Fallback: strip leading "Topps " from name
  const fallback = toSlug(name.replace(/^Topps\s+/i, ''));
  return `${BASE}/${year}-topps-${fallback}-baseball-cards`;
}

function f1Url(product) {
  const { name, year } = product;
  const slug = F1_TOPPS_SLUG[name];

  if (slug === undefined) {
    const fallback = toSlug(name.replace(/\s+F1$/i, '').replace(/^Topps\s+/i, ''));
    return `${BASE}/${year}-topps-${fallback}-formula-1-cards`;
  }
  if (slug === '') {
    return `${BASE}/${year}-topps-formula-1-cards`;
  }
  return `${BASE}/${year}-topps-${slug}-formula-1-cards`;
}

function wnbaUrl(product) {
  const { name, year } = product;
  const slug = WNBA_PANINI_SLUG[name] ?? toSlug(name.replace(/\s+WNBA$/i, ''));
  return `${BASE}/${year}-panini-${slug}-wnba-basketball-cards`;
}

// ──────────────────────────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────────────────────────

let changed = 0;
let unchanged = 0;

data.products = data.products.map(product => {
  let newUrl;

  switch (product.sport) {
    case 'NBA':  newUrl = nbaUrl(product);  break;
    case 'NFL':  newUrl = nflUrl(product);  break;
    case 'MLB':  newUrl = mlbUrl(product);  break;
    case 'F1':   newUrl = f1Url(product);   break;
    case 'WNBA': newUrl = wnbaUrl(product); break;
    default:
      console.warn(`Unknown sport: ${product.sport} for ${product.name}`);
      return product;
  }

  if (newUrl !== product.checklistUrl) {
    console.log(`CHANGED [${product.sport}] ${product.year} ${product.brand} ${product.name}`);
    console.log(`  OLD: ${product.checklistUrl}`);
    console.log(`  NEW: ${newUrl}`);
    changed++;
  } else {
    unchanged++;
  }

  return { ...product, checklistUrl: newUrl };
});

writeFileSync(matrixPath, JSON.stringify(data, null, 2));

console.log('\n──────────────────────────────────────────────');
console.log(`Summary: ${changed} URLs changed, ${unchanged} already correct`);
console.log(`Total products: ${data.products.length}`);
console.log('Matrix written to data/product-matrix.json');
