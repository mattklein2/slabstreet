/**
 * Drop Calendar — upcoming sports card releases.
 * Maintained manually. Last updated: 2026-03-13.
 *
 * Sources: Beckett, Cardboard Connection, Waxstat, Athlon Sports,
 *          Topps.com, Steel City Collectibles
 */

export type Sport =
  | 'Basketball'
  | 'Football'
  | 'Baseball'
  | 'Hockey'
  | 'Soccer'
  | 'F1'
  | 'WNBA';

export type Brand = 'Topps' | 'Panini' | 'Upper Deck' | 'Bowman';

export type BoxType =
  | 'Hobby'
  | 'Jumbo'
  | 'Blaster'
  | 'Mega'
  | 'Hanger'
  | 'Value'
  | 'Retail'
  | 'Super'
  | 'Sapphire'
  | 'FOTL';

export type Tier = 'flagship' | 'mid' | 'premium' | 'ultra-premium';

export interface Drop {
  /** Unique slug for keys */
  slug: string;
  /** Display name, e.g. "2026 Topps Series 1 Baseball" */
  name: string;
  brand: Brand;
  sport: Sport;
  /** ISO date string YYYY-MM-DD, or null if TBA */
  releaseDate: string | null;
  /** Available box formats */
  boxTypes: BoxType[];
  /** Approximate hobby box price in USD, or null if unknown */
  hobbyBoxPrice: number | null;
  /** 2-4 key selling points */
  highlights: string[];
  /** Product tier */
  tier: Tier;
  /** Product year label */
  year: string;
}

export const DROPS: Drop[] = [
  // ── RECENTLY RELEASED (context for "just dropped") ─────────
  {
    slug: 'topps-series1-baseball-2026',
    name: '2026 Topps Series 1 Baseball',
    brand: 'Topps',
    sport: 'Baseball',
    releaseDate: '2026-02-11',
    boxTypes: ['Hobby', 'Jumbo', 'Blaster', 'Mega', 'Hanger', 'Value', 'Super'],
    hobbyBoxPrice: 110,
    highlights: [
      '75th anniversary flagship set',
      '350-card base set with rookies & future stars',
      '1 auto or relic per hobby box',
    ],
    tier: 'flagship',
    year: '2026',
  },
  {
    slug: 'panini-prizm-football-2025',
    name: '2025 Panini Prizm Football',
    brand: 'Panini',
    sport: 'Football',
    releaseDate: '2026-02-02',
    boxTypes: ['Hobby', 'Blaster', 'Mega', 'Hanger'],
    hobbyBoxPrice: 400,
    highlights: [
      'Potentially the LAST Panini Prizm NFL release',
      '2 autos per hobby box',
      'Sanders, Ward, Hunter rookie class',
    ],
    tier: 'premium',
    year: '2025',
  },
  {
    slug: 'topps-finest-basketball-2025-26',
    name: '2025-26 Topps Finest Basketball',
    brand: 'Topps',
    sport: 'Basketball',
    releaseDate: '2026-02-26',
    boxTypes: ['Hobby'],
    hobbyBoxPrice: 480,
    highlights: [
      'Topps returns to NBA — first Finest set',
      '2 autos per hobby box',
      'Refractor parallels + Headliners inserts',
    ],
    tier: 'premium',
    year: '2025-26',
  },
  {
    slug: 'topps-chrome-f1-2025',
    name: '2025 Topps Chrome Formula 1',
    brand: 'Topps',
    sport: 'F1',
    releaseDate: '2026-01-22',
    boxTypes: ['Hobby', 'Value', 'Blaster'],
    hobbyBoxPrice: 250,
    highlights: [
      'Celebrates 75 years of Formula 1',
      'Most F1 autos in Topps F1 history',
      '200-card base: F1, F2, F3 drivers',
    ],
    tier: 'mid',
    year: '2025',
  },
  {
    slug: 'upper-deck-series2-hockey-2025-26',
    name: '2025-26 Upper Deck Series 2 Hockey',
    brand: 'Upper Deck',
    sport: 'Hockey',
    releaseDate: '2026-03-04',
    boxTypes: ['Hobby', 'Blaster', 'Retail'],
    hobbyBoxPrice: 120,
    highlights: [
      'Young Guns rookie cards — most chased NHL rookies',
      'Canvas inserts, UD Exclusives parallels',
    ],
    tier: 'flagship',
    year: '2025-26',
  },

  // ── MARCH 2026 ─────────────────────────────────────────────
  {
    slug: 'panini-one-and-one-wnba-2025',
    name: '2025 Panini One and One WNBA',
    brand: 'Panini',
    sport: 'WNBA',
    releaseDate: '2026-03-04',
    boxTypes: ['Hobby', 'FOTL'],
    hobbyBoxPrice: 200,
    highlights: [
      'Premium single-pack auto product',
      '1 guaranteed autograph per box',
      'On-card autos from top WNBA stars',
    ],
    tier: 'premium',
    year: '2025',
  },
  {
    slug: 'bowmans-best-baseball-2025',
    name: "2025 Bowman's Best Baseball",
    brand: 'Bowman',
    sport: 'Baseball',
    releaseDate: '2026-03-11',
    boxTypes: ['Hobby'],
    hobbyBoxPrice: 200,
    highlights: [
      'All-chrome prospect & rookie product',
      '4 on-card autos per hobby box',
      'Deep refractor rainbow chase',
    ],
    tier: 'premium',
    year: '2025',
  },
  {
    slug: 'panini-prizm-black-football-2025',
    name: '2025 Panini Prizm Black Football',
    brand: 'Panini',
    sport: 'Football',
    releaseDate: '2026-03-18',
    boxTypes: ['Hobby'],
    hobbyBoxPrice: 390,
    highlights: [
      'Ultra-premium black-themed design',
      '3 autos per hobby box',
      'One of the last Panini NFL products',
    ],
    tier: 'ultra-premium',
    year: '2025',
  },
  {
    slug: 'panini-contenders-euroleague-2025-26',
    name: '2025-26 Panini Contenders EuroLeague',
    brand: 'Panini',
    sport: 'Basketball',
    releaseDate: '2026-03-18',
    boxTypes: ['Hobby'],
    hobbyBoxPrice: 150,
    highlights: [
      'European basketball stars & prospects',
      'Rookie Ticket autographs',
      'Contenders parallel chase',
    ],
    tier: 'mid',
    year: '2025-26',
  },
  {
    slug: 'topps-heritage-baseball-2026',
    name: '2026 Topps Heritage Baseball',
    brand: 'Topps',
    sport: 'Baseball',
    releaseDate: '2026-03-18',
    boxTypes: ['Hobby', 'Blaster', 'Hanger', 'Value'],
    hobbyBoxPrice: 110,
    highlights: [
      'Retro design inspired by classic 1977 Topps',
      'Real One Autographs (Red Ink /77)',
      'Short print chase — popular with set builders',
    ],
    tier: 'flagship',
    year: '2026',
  },
  {
    slug: 'panini-prizm-wnba-2025',
    name: '2025 Panini Prizm WNBA',
    brand: 'Panini',
    sport: 'WNBA',
    releaseDate: '2026-03-25',
    boxTypes: ['Hobby', 'Blaster'],
    hobbyBoxPrice: 835,
    highlights: [
      '2 autos per hobby box',
      '24 Prizm parallels per box',
      'Clark, Reese, Brink rookie year cards',
    ],
    tier: 'premium',
    year: '2025',
  },
  {
    slug: 'panini-prizm-fifa-soccer-2025-26',
    name: '2025-26 Panini Prizm FIFA Soccer',
    brand: 'Panini',
    sport: 'Soccer',
    releaseDate: '2026-03-27',
    boxTypes: ['Hobby'],
    hobbyBoxPrice: 300,
    highlights: [
      '1 auto per hobby box',
      '25+ top world clubs featured',
      'Road to 2026 FIFA World Cup tie-ins',
    ],
    tier: 'mid',
    year: '2025-26',
  },

  // ── APRIL 2026 ─────────────────────────────────────────────
  {
    slug: 'panini-select-wnba-2025',
    name: '2025 Panini Select WNBA',
    brand: 'Panini',
    sport: 'WNBA',
    releaseDate: '2026-04-01',
    boxTypes: ['Hobby'],
    hobbyBoxPrice: 250,
    highlights: [
      '3 autos or mem cards per hobby box',
      'Tiered Select design (Concourse / Premier / Courtside)',
      'Growing WNBA collector market',
    ],
    tier: 'premium',
    year: '2025',
  },
  {
    slug: 'opc-platinum-hockey-2025-26',
    name: '2025-26 O-Pee-Chee Platinum Hockey',
    brand: 'Upper Deck',
    sport: 'Hockey',
    releaseDate: '2026-04-29',
    boxTypes: ['Hobby'],
    hobbyBoxPrice: 300,
    highlights: [
      'Chrome-style hockey cards with deep parallel rainbow',
      'Rookie autos from top 2025-26 NHL rookies',
      'Seismic Gold and Neon parallels',
    ],
    tier: 'premium',
    year: '2025-26',
  },

  // ── MAY 2026 ───────────────────────────────────────────────
  {
    slug: 'bowman-baseball-2026',
    name: '2026 Bowman Baseball',
    brand: 'Bowman',
    sport: 'Baseball',
    releaseDate: '2026-05-07',
    boxTypes: ['Hobby', 'Jumbo', 'Blaster', 'Mega', 'Retail', 'Sapphire'],
    hobbyBoxPrice: 200,
    highlights: [
      'THE prospect product — 1st Bowman cards for top picks',
      '1st Bowman Chrome autographs',
      'Sapphire Edition drops May 30',
    ],
    tier: 'flagship',
    year: '2026',
  },

  // ── JUNE 2026 ──────────────────────────────────────────────
  {
    slug: 'topps-series2-baseball-2026',
    name: '2026 Topps Series 2 Baseball',
    brand: 'Topps',
    sport: 'Baseball',
    releaseDate: '2026-06-12',
    boxTypes: ['Hobby', 'Jumbo', 'Blaster', 'Mega', 'Hanger', 'Retail'],
    hobbyBoxPrice: 110,
    highlights: [
      'Flagship Series 2 — more rookies & veterans',
      '1 auto or relic per hobby box',
      'Continues 75th anniversary parallels',
    ],
    tier: 'flagship',
    year: '2026',
  },

  // ── JULY 2026 ──────────────────────────────────────────────
  {
    slug: 'topps-chrome-baseball-2026',
    name: '2026 Topps Chrome Baseball',
    brand: 'Topps',
    sport: 'Baseball',
    releaseDate: '2026-07-30',
    boxTypes: ['Hobby', 'Jumbo', 'Blaster', 'Mega', 'Value'],
    hobbyBoxPrice: 280,
    highlights: [
      'Chrome refractor flagship — the premium standard',
      'Up to 3 Chrome autos per hobby box',
      'Most popular modern baseball card product',
    ],
    tier: 'premium',
    year: '2026',
  },
  {
    slug: 'upper-deck-sp-authentic-hockey-2025-26',
    name: '2025-26 Upper Deck SP Authentic Hockey',
    brand: 'Upper Deck',
    sport: 'Hockey',
    releaseDate: '2026-07-30',
    boxTypes: ['Hobby'],
    hobbyBoxPrice: 350,
    highlights: [
      'Premium on-card autos — Future Watch rookies',
      'Sign of the Times multi-player autos',
      'One of the most collected hockey products',
    ],
    tier: 'premium',
    year: '2025-26',
  },

  // ── SEPTEMBER 2026 ─────────────────────────────────────────
  {
    slug: 'bowman-chrome-baseball-2026',
    name: '2026 Bowman Chrome Baseball',
    brand: 'Bowman',
    sport: 'Baseball',
    releaseDate: '2026-09-10',
    boxTypes: ['Hobby', 'Mega'],
    hobbyBoxPrice: 290,
    highlights: [
      '2 Chrome autos guaranteed per hobby box',
      'All-chrome prospect platform',
      'Key product for prospect investors',
    ],
    tier: 'premium',
    year: '2026',
  },
  {
    slug: 'panini-prizm-football-2026',
    name: '2026 Panini Prizm Football',
    brand: 'Panini',
    sport: 'Football',
    releaseDate: '2026-09-15',
    boxTypes: ['Hobby', 'Blaster', 'Mega', 'Hanger'],
    hobbyBoxPrice: null,
    highlights: [
      'Could be the FINAL Panini NFL Prizm ever',
      'Silver Prizm parallels remain king of modern football',
      'Date projected — not yet confirmed',
    ],
    tier: 'premium',
    year: '2026',
  },

  // ── TBA ────────────────────────────────────────────────────
  {
    slug: 'panini-noir-fifa-2025-26',
    name: '2025-26 Panini Noir Road to FIFA World Cup',
    brand: 'Panini',
    sport: 'Soccer',
    releaseDate: null,
    boxTypes: ['Hobby'],
    hobbyBoxPrice: 500,
    highlights: [
      'Ultra-premium: 3 autos + 2 memorabilia per box',
      'Features Messi, Mbappé, Haaland',
      'Road to 2026 FIFA World Cup theme',
    ],
    tier: 'ultra-premium',
    year: '2025-26',
  },
  {
    slug: 'panini-select-fifa-2025-26',
    name: '2025-26 Panini Select Road to FIFA World Cup',
    brand: 'Panini',
    sport: 'Soccer',
    releaseDate: null,
    boxTypes: ['Hobby'],
    hobbyBoxPrice: 300,
    highlights: [
      'Tiered Select design (Concourse / Premier / Field Level)',
      'World Cup 2026 anticipation drives demand',
    ],
    tier: 'mid',
    year: '2025-26',
  },
  {
    slug: 'topps-football-2026',
    name: '2026 Topps Football',
    brand: 'Topps',
    sport: 'Football',
    releaseDate: null,
    boxTypes: ['Hobby', 'Blaster', 'Mega'],
    hobbyBoxPrice: null,
    highlights: [
      'Topps entering NFL market — historic first',
      'First Topps NFL product in modern licensing era',
      'Date TBA — projected late 2026',
    ],
    tier: 'flagship',
    year: '2026',
  },
];

/** All sports in display order */
export const ALL_SPORTS: Sport[] = [
  'Basketball',
  'Football',
  'Baseball',
  'Hockey',
  'Soccer',
  'F1',
  'WNBA',
];

/** Tier display config */
export const TIER_CONFIG: Record<Tier, { label: string; color: string }> = {
  flagship: { label: 'Flagship', color: '#38bdf8' },
  mid: { label: 'Mid-Tier', color: '#a78bfa' },
  premium: { label: 'Premium', color: '#f59e0b' },
  'ultra-premium': { label: 'Ultra-Premium', color: '#ff3b5c' },
};

/** Sport emoji map */
export const SPORT_ICONS: Record<Sport, string> = {
  Basketball: '🏀',
  Football: '🏈',
  Baseball: '⚾',
  Hockey: '🏒',
  Soccer: '⚽',
  F1: '🏎️',
  WNBA: '🏀',
};
