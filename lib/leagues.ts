// ─────────────────────────────────────────────────────────────
// LEAGUE CONFIGURATION
// Single source of truth for all league-specific behavior.
// To add a new league: add one entry to the LEAGUES map below.
// ─────────────────────────────────────────────────────────────

export type LeagueId = 'NBA' | 'NFL' | 'MLB' | 'F1' | 'NHL' | 'WNBA';

export interface LeagueConfig {
  id: LeagueId;
  name: string;
  positions: string[];
  defaultStats: { label: string; val: string }[];
  seasonLabel: string;

  // The Odds API
  oddsApiSportKey: string | null;   // championship outrights key
  oddsApiGameKey: string | null;    // game-level odds key (h2h, spreads, totals)
  oddsApiMarketLabel: string;

  // ESPN free API
  espnSport: string | null;
  espnLeague: string | null;
  espnStandingsSeason: string;

  // Team success scoring
  teamSuccess: {
    playoffSeeds: number;
    usesConferences: boolean;
  };

  // Accent color for league branding (tab underlines, widget borders, etc.)
  accentColor: string;

  // News RSS feeds (league-specific; card market feeds are always included)
  rssFeeds: { url: string; source: string }[];

  // Social momentum accounts (league-specific insiders + team accounts)
  socialAccounts: {
    insiders: string[];
    teams: string[];
  };
}

// Accent color for the ALL/firehose view (slab green)
export const ALL_ACCENT_COLOR = '#00ff87';

// ─── SHARED CARD MARKET ACCOUNTS (used by all leagues) ───
export const SHARED_SOCIAL_ACCOUNTS = {
  card_market: [
    'BleekerTrading', 'GoldinAuctions', 'PWCCAuctions', 'houseofcards_',
    'CardboardConnection', 'BeckettMedia', 'psacard', 'PaniniAmerica',
    'ToppsCards', 'UpperDeckSports',
  ],
  card_influencers: [
    'GaryVee', 'AltXYZ', 'CardLadder', 'geographicsports', 'icebergcollect',
  ],
};

// ─── SHARED CARD MARKET RSS FEEDS ───
const CARD_MARKET_FEEDS = [
  { url: 'https://www.beckett.com/feed', source: 'Beckett' },
  { url: 'https://www.sportscardsinvestor.com/feed/', source: 'Sports Card Investor' },
];

// ─── LEAGUE DEFINITIONS ─────────────────────────────────────

const LEAGUES: Record<LeagueId, LeagueConfig> = {

  NBA: {
    id: 'NBA',
    name: 'NBA',
    positions: ['GUARD', 'POINT GUARD', 'SHOOTING GUARD', 'SMALL FORWARD', 'POWER FORWARD', 'FORWARD', 'CENTER'],
    defaultStats: [
      { label: 'PPG', val: '' }, { label: 'RPG', val: '' }, { label: 'APG', val: '' },
      { label: 'FG%', val: '' }, { label: 'GP', val: '' },
    ],
    seasonLabel: '2025\u201326 Season Stats',
    oddsApiSportKey: 'basketball_nba_championship_winner',
    oddsApiGameKey: 'basketball_nba',
    oddsApiMarketLabel: 'NBA Champion',
    espnSport: 'basketball',
    espnLeague: 'nba',
    espnStandingsSeason: '2026',
    accentColor: '#1d4ed8',
    teamSuccess: { playoffSeeds: 10, usesConferences: true },
    rssFeeds: [
      { url: 'https://www.espn.com/espn/rss/nba/news', source: 'ESPN' },
      { url: 'https://hoopshype.com/feed/', source: 'HoopsHype' },
      { url: 'https://www.nba.com/feeds/news/rss.xml', source: 'NBA.com' },
      { url: 'https://bleacherreport.com/nba.rss', source: 'Bleacher Report' },
    ],
    socialAccounts: {
      insiders: ['wojespn', 'ShamsCharania', 'ChrisBHaynes', 'TheAthletic', 'ESPNStatsInfo', 'NBAonTNT', 'NBATV', 'NBA'],
      teams: ['spurs', 'Lakers', 'memgrizz', 'Timberwolves', 'celtics', 'warriors', 'nuggets', 'Suns', 'sixers', 'Bucks'],
    },
  },

  NFL: {
    id: 'NFL',
    name: 'NFL',
    positions: ['QUARTERBACK', 'RUNNING BACK', 'WIDE RECEIVER', 'TIGHT END', 'OFFENSIVE LINEMAN', 'DEFENSIVE END', 'LINEBACKER', 'CORNERBACK', 'SAFETY', 'KICKER'],
    defaultStats: [
      { label: 'PASS YDS', val: '' }, { label: 'PASS TD', val: '' }, { label: 'RUSH YDS', val: '' },
      { label: 'REC YDS', val: '' }, { label: 'GP', val: '' },
    ],
    seasonLabel: '2026 Season Stats',
    oddsApiSportKey: 'americanfootball_nfl_super_bowl_winner',
    oddsApiGameKey: 'americanfootball_nfl',
    oddsApiMarketLabel: 'Super Bowl Champion',
    espnSport: 'football',
    espnLeague: 'nfl',
    espnStandingsSeason: '2026',
    accentColor: '#16a34a',
    teamSuccess: { playoffSeeds: 7, usesConferences: true },
    rssFeeds: [
      { url: 'https://www.espn.com/espn/rss/nfl/news', source: 'ESPN' },
      { url: 'https://bleacherreport.com/nfl.rss', source: 'Bleacher Report' },
    ],
    socialAccounts: {
      insiders: ['AdamSchefter', 'RapSheet', 'TomPelissero', 'NFL', 'NFLNetwork', 'ESPNStatsInfo'],
      teams: ['Chiefs', 'Eagles', '49ers', 'Cowboys', 'Ravens', 'Bills', 'Dolphins', 'Lions'],
    },
  },

  MLB: {
    id: 'MLB',
    name: 'MLB',
    positions: ['PITCHER', 'CATCHER', 'FIRST BASE', 'SECOND BASE', 'SHORTSTOP', 'THIRD BASE', 'OUTFIELD', 'DESIGNATED HITTER'],
    defaultStats: [
      { label: 'AVG', val: '' }, { label: 'HR', val: '' }, { label: 'RBI', val: '' },
      { label: 'OPS', val: '' }, { label: 'GP', val: '' },
    ],
    seasonLabel: '2026 Season Stats',
    oddsApiSportKey: 'baseball_mlb_world_series_winner',
    oddsApiGameKey: 'baseball_mlb',
    oddsApiMarketLabel: 'World Series Champion',
    espnSport: 'baseball',
    espnLeague: 'mlb',
    espnStandingsSeason: '2026',
    accentColor: '#dc2626',
    teamSuccess: { playoffSeeds: 6, usesConferences: false },
    rssFeeds: [
      { url: 'https://www.espn.com/espn/rss/mlb/news', source: 'ESPN' },
      { url: 'https://bleacherreport.com/mlb.rss', source: 'Bleacher Report' },
    ],
    socialAccounts: {
      insiders: ['JeffPassan', 'Ken_Rosenthal', 'JonHeyman', 'MLB', 'MLBNetwork', 'ESPNStatsInfo'],
      teams: ['Yankees', 'Dodgers', 'RedSox', 'Cubs', 'Braves', 'Astros', 'Phillies', 'Padres'],
    },
  },

  F1: {
    id: 'F1',
    name: 'F1',
    positions: ['DRIVER'],
    defaultStats: [
      { label: 'WDC', val: '' }, { label: 'Wins', val: '' }, { label: 'Poles', val: '' },
      { label: 'Podiums', val: '' }, { label: 'Age', val: '' },
    ],
    seasonLabel: '2026 Season Stats',
    oddsApiSportKey: null, // F1 championship odds not widely available on The Odds API
    oddsApiGameKey: null,
    oddsApiMarketLabel: 'F1 WDC',
    espnSport: 'racing',
    espnLeague: 'f1',
    espnStandingsSeason: '2026',
    accentColor: '#e11d48',
    teamSuccess: { playoffSeeds: 0, usesConferences: false },
    rssFeeds: [
      { url: 'https://www.espn.com/espn/rss/f1/news', source: 'ESPN' },
      { url: 'https://bleacherreport.com/formula-1.rss', source: 'Bleacher Report' },
    ],
    socialAccounts: {
      insiders: ['F1', 'SkySportsF1', 'autabortsport', 'ChrisMedlandF1', 'LawrenceBarretto'],
      teams: ['McLarenF1', 'reaborning', 'ScuderiaFerrari', 'MercedesAMGF1', 'OracleRedBull'],
    },
  },

  NHL: {
    id: 'NHL',
    name: 'NHL',
    positions: ['CENTER', 'LEFT WING', 'RIGHT WING', 'DEFENSEMAN', 'GOALTENDER'],
    defaultStats: [
      { label: 'G', val: '' }, { label: 'A', val: '' }, { label: 'PTS', val: '' },
      { label: '+/-', val: '' }, { label: 'GP', val: '' },
    ],
    seasonLabel: '2025\u201326 Season Stats',
    oddsApiSportKey: 'icehockey_nhl_championship_winner',
    oddsApiGameKey: 'icehockey_nhl',
    oddsApiMarketLabel: 'Stanley Cup Champion',
    espnSport: 'hockey',
    espnLeague: 'nhl',
    espnStandingsSeason: '2026',
    accentColor: '#0f172a',
    teamSuccess: { playoffSeeds: 8, usesConferences: true },
    rssFeeds: [
      { url: 'https://www.espn.com/espn/rss/nhl/news', source: 'ESPN' },
      { url: 'https://bleacherreport.com/nhl.rss', source: 'Bleacher Report' },
    ],
    socialAccounts: {
      insiders: ['PierreVLeBrun', 'FriedgeHNIC', 'DarrenDreger', 'NHL', 'NHLNetwork', 'ESPNStatsInfo'],
      teams: ['EdmontonOilers', 'NHLFlyers', 'NHLBruins', 'MapleLeafs', 'NYRangers', 'Avalanche'],
    },
  },
  WNBA: {
    id: 'WNBA',
    name: 'WNBA',
    positions: ['GUARD', 'FORWARD', 'CENTER'],
    defaultStats: [
      { label: 'PPG', val: '' }, { label: 'RPG', val: '' }, { label: 'APG', val: '' },
      { label: 'FG%', val: '' }, { label: 'GP', val: '' },
    ],
    seasonLabel: '2026 Season Stats',
    oddsApiSportKey: 'basketball_wnba_championship_winner',
    oddsApiGameKey: 'basketball_wnba',
    oddsApiMarketLabel: 'WNBA Champion',
    espnSport: 'basketball',
    espnLeague: 'wnba',
    espnStandingsSeason: '2026',
    accentColor: '#f97316',
    teamSuccess: { playoffSeeds: 8, usesConferences: false },
    rssFeeds: [
      { url: 'https://www.espn.com/espn/rss/wnba/news', source: 'ESPN' },
    ],
    socialAccounts: {
      insiders: ['WNBA', 'espabortnW', 'AlexaPhilbeck', 'MechellVoepel', 'HowardMegdal', 'JustWomensSports'],
      teams: ['IndianaFever', 'LASparks', 'NYLiberty', 'seabortstorm', 'LVAces', 'ConnecticutSun'],
    },
  },
};

// ─── HELPERS ─────────────────────────────────────────────────

export function getLeagueConfig(leagueId: string): LeagueConfig {
  return LEAGUES[leagueId as LeagueId] ?? LEAGUES.NBA;
}

export function getAllLeagueIds(): LeagueId[] {
  return Object.keys(LEAGUES) as LeagueId[];
}

export function getSocialAccountsForLeague(leagueId: string): string[] {
  const config = getLeagueConfig(leagueId);
  return [
    ...config.socialAccounts.insiders,
    ...SHARED_SOCIAL_ACCOUNTS.card_market,
    ...SHARED_SOCIAL_ACCOUNTS.card_influencers,
    ...config.socialAccounts.teams,
  ];
}

export function getRssFeedsForLeague(leagueId: string): { url: string; source: string }[] {
  const config = getLeagueConfig(leagueId);
  return [...config.rssFeeds, ...CARD_MARKET_FEEDS];
}
