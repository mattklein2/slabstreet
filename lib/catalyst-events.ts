// ─────────────────────────────────────────────────────────────
// CATALYST LOOK-AHEAD — UPCOMING MARKET-MOVING EVENTS
// Static calendar of known events that historically drive card
// market movement.  Updated once a year with new season dates.
// ─────────────────────────────────────────────────────────────

import type { LeagueId } from './leagues';

export type EventCategory =
  | 'playoffs'
  | 'allstar'
  | 'draft'
  | 'freeagency'
  | 'award'
  | 'season'
  | 'international';

export interface CatalystEvent {
  id: string;
  date: string;            // 'YYYY-MM-DD'
  endDate?: string;        // for multi-day events
  title: string;
  description: string;     // 1-2 sentence market-impact angle
  leagues: LeagueId[];
  category: EventCategory;
  impact: 'high' | 'medium';
}

// ─── 2026 EVENT CALENDAR ─────────────────────────────────────

const EVENTS_2026: CatalystEvent[] = [

  // ──── NBA ────────────────────────────────────────────────
  {
    id: 'nba-allstar-2026',
    date: '2026-02-15',
    title: 'NBA All-Star Game',
    description: 'All-Star selections drive short-term demand spikes for featured players\' cards, especially first-time selections.',
    leagues: ['NBA'],
    category: 'allstar',
    impact: 'high',
  },
  {
    id: 'nba-trade-deadline-2026',
    date: '2026-02-05',
    title: 'NBA Trade Deadline',
    description: 'Players traded to contenders see immediate card price jumps. Watch for stars moving to bigger markets.',
    leagues: ['NBA'],
    category: 'freeagency',
    impact: 'high',
  },
  {
    id: 'nba-playin-2026',
    date: '2026-04-14',
    endDate: '2026-04-17',
    title: 'NBA Play-In Tournament',
    description: 'Breakout performances in win-or-go-home games create quick card market reactions.',
    leagues: ['NBA'],
    category: 'playoffs',
    impact: 'medium',
  },
  {
    id: 'nba-playoffs-2026',
    date: '2026-04-18',
    title: 'NBA Playoffs Begin',
    description: 'Playoff performers see sustained demand increases. Deep runs by young stars can 2-3× card values.',
    leagues: ['NBA'],
    category: 'playoffs',
    impact: 'high',
  },
  {
    id: 'nba-finals-2026',
    date: '2026-06-03',
    title: 'NBA Finals Begin',
    description: 'Finals MVP candidates see massive card spikes. Position before the series starts for maximum upside.',
    leagues: ['NBA'],
    category: 'playoffs',
    impact: 'high',
  },
  {
    id: 'nba-draft-2026',
    date: '2026-06-24',
    title: 'NBA Draft',
    description: 'Top picks generate instant hobby buzz. College standouts\' cards spike on draft night — buy before, sell into the hype.',
    leagues: ['NBA'],
    category: 'draft',
    impact: 'high',
  },
  {
    id: 'nba-freeagency-2026',
    date: '2026-06-30',
    title: 'NBA Free Agency Opens',
    description: 'Stars signing with new teams trigger card repricing. Market shift happens within hours of announcements.',
    leagues: ['NBA'],
    category: 'freeagency',
    impact: 'high',
  },

  // ──── NFL ────────────────────────────────────────────────
  {
    id: 'nfl-freeagency-2026',
    date: '2026-03-11',
    title: 'NFL Free Agency Opens',
    description: 'QBs and skill players signing with new teams see immediate card price movement. Biggest movers land in playoff-contending markets.',
    leagues: ['NFL'],
    category: 'freeagency',
    impact: 'high',
  },
  {
    id: 'nfl-draft-2026',
    date: '2026-04-23',
    endDate: '2026-04-25',
    title: 'NFL Draft — Pittsburgh',
    description: 'First-round QBs and skill players generate massive hobby demand. Landing spot matters as much as draft position for card values.',
    leagues: ['NFL'],
    category: 'draft',
    impact: 'high',
  },
  {
    id: 'nfl-hof-game-2026',
    date: '2026-07-30',
    title: 'NFL Hall of Fame Game',
    description: 'Kicks off the preseason in Canton. HOF inductees see legacy card spikes around induction weekend.',
    leagues: ['NFL'],
    category: 'award',
    impact: 'medium',
  },
  {
    id: 'nfl-training-camp-2026',
    date: '2026-07-21',
    title: 'NFL Training Camps Open',
    description: 'Rookie standouts and position battles generate early-season buzz. Camp hype drives speculative buying.',
    leagues: ['NFL'],
    category: 'season',
    impact: 'medium',
  },
  {
    id: 'nfl-preseason-2026',
    date: '2026-08-06',
    title: 'NFL Preseason Begins',
    description: 'First live game action for rookies. Breakout preseason performances create buying windows before regular season pricing.',
    leagues: ['NFL'],
    category: 'season',
    impact: 'medium',
  },
  {
    id: 'nfl-season-2026',
    date: '2026-09-10',
    title: 'NFL Regular Season Kickoff',
    description: 'Season opener historically boosts card market volume across the board. Early-season breakouts drive the biggest gains.',
    leagues: ['NFL'],
    category: 'season',
    impact: 'high',
  },
  {
    id: 'nfl-playoffs-2027',
    date: '2027-01-16',
    title: 'NFL Playoffs Begin',
    description: 'Playoff contenders\' star players see price increases as postseason approaches. Wild Card weekend creates volatile card markets.',
    leagues: ['NFL'],
    category: 'playoffs',
    impact: 'high',
  },
  {
    id: 'superbowl-lxi',
    date: '2027-02-14',
    title: 'Super Bowl LXI — Los Angeles',
    description: 'Super Bowl MVP cards can double overnight. Position on likely participants before conference championships.',
    leagues: ['NFL'],
    category: 'playoffs',
    impact: 'high',
  },

  // ──── MLB ────────────────────────────────────────────────
  {
    id: 'mlb-opening-day-2026',
    date: '2026-03-26',
    title: 'MLB Opening Day',
    description: 'Baseball card market wakes up with the season. Early-season hot starters drive the first wave of buying.',
    leagues: ['MLB'],
    category: 'season',
    impact: 'high',
  },
  {
    id: 'mlb-allstar-2026',
    date: '2026-07-14',
    title: 'MLB All-Star Game — Philadelphia',
    description: 'All-Star selections validate first-half breakouts. First-time All-Stars see the biggest card bumps.',
    leagues: ['MLB'],
    category: 'allstar',
    impact: 'high',
  },
  {
    id: 'mlb-hof-induction-2026',
    date: '2026-07-26',
    title: 'Baseball Hall of Fame Induction',
    description: 'HOF inductees\' vintage and rookie cards spike around Cooperstown weekend. Beltrán, Jones, and Kent enter in 2026.',
    leagues: ['MLB'],
    category: 'award',
    impact: 'high',
  },
  {
    id: 'mlb-trade-deadline-2026',
    date: '2026-08-03',
    title: 'MLB Trade Deadline',
    description: 'Stars traded to contenders see immediate card demand. Prospects included in deals get fresh attention from the hobby.',
    leagues: ['MLB'],
    category: 'freeagency',
    impact: 'high',
  },
  {
    id: 'mlb-playoffs-2026',
    date: '2026-10-01',
    title: 'MLB Postseason Begins',
    description: 'October baseball drives peak card demand. Clutch performers become hobby heroes — position on likely playoff rosters early.',
    leagues: ['MLB'],
    category: 'playoffs',
    impact: 'high',
  },

  // ──── NHL ────────────────────────────────────────────────
  {
    id: 'nhl-trade-deadline-2026',
    date: '2026-03-06',
    title: 'NHL Trade Deadline',
    description: 'Rental players headed to contenders see short-term card spikes. Watch for goalies and top-6 forwards on the move.',
    leagues: ['NHL'],
    category: 'freeagency',
    impact: 'medium',
  },
  {
    id: 'nhl-playoffs-2026',
    date: '2026-04-18',
    title: 'Stanley Cup Playoffs Begin',
    description: 'Playoff hockey drives hockey card demand to its yearly peak. Goaltenders who go on runs see outsized card gains.',
    leagues: ['NHL'],
    category: 'playoffs',
    impact: 'high',
  },
  {
    id: 'nhl-draft-2026',
    date: '2026-06-26',
    endDate: '2026-06-27',
    title: 'NHL Draft',
    description: 'Top prospects enter the hobby spotlight. First-round picks\' Young Guns cards become immediate targets for collectors.',
    leagues: ['NHL'],
    category: 'draft',
    impact: 'medium',
  },
  {
    id: 'nhl-freeagency-2026',
    date: '2026-07-01',
    title: 'NHL Free Agency Opens',
    description: 'Big-name signings reshape team rosters and card demand. Stars joining Canadian markets see amplified hobby interest.',
    leagues: ['NHL'],
    category: 'freeagency',
    impact: 'medium',
  },

  // ──── F1 ─────────────────────────────────────────────────
  {
    id: 'f1-season-start-2026',
    date: '2026-03-08',
    title: 'F1 Season Opener — Australia',
    description: 'New regulation era begins in 2026 with overhauled cars. Early winners under new rules will see card demand surge.',
    leagues: ['F1'],
    category: 'season',
    impact: 'high',
  },
  {
    id: 'f1-monaco-2026',
    date: '2026-06-07',
    title: 'F1 Monaco Grand Prix',
    description: 'The crown jewel of motorsport. Monaco winners join an elite club — their cards carry a lasting premium.',
    leagues: ['F1'],
    category: 'season',
    impact: 'medium',
  },
  {
    id: 'f1-season-end-2026',
    date: '2026-12-06',
    title: 'F1 Season Finale — Abu Dhabi',
    description: 'Championship-deciding races create the biggest F1 card moments. WDC winners\' cards peak around the final race.',
    leagues: ['F1'],
    category: 'season',
    impact: 'high',
  },

  // ──── WNBA ───────────────────────────────────────────────
  {
    id: 'wnba-draft-2026',
    date: '2026-04-13',
    title: 'WNBA Draft',
    description: 'The WNBA card market is booming. Top picks generate immediate demand — especially with the expanded media coverage.',
    leagues: ['WNBA'],
    category: 'draft',
    impact: 'high',
  },
  {
    id: 'wnba-season-2026',
    date: '2026-05-08',
    title: 'WNBA Season Tips Off',
    description: 'Season 30 begins with expanded rosters and more games. Early-season standouts in the growing WNBA card market see quick gains.',
    leagues: ['WNBA'],
    category: 'season',
    impact: 'medium',
  },
  {
    id: 'wnba-allstar-2026',
    date: '2026-07-25',
    title: 'WNBA All-Star Game — Chicago',
    description: 'All-Star selections boost player visibility and card demand. The WNBA hobby is still young — first-time All-Stars offer value.',
    leagues: ['WNBA'],
    category: 'allstar',
    impact: 'medium',
  },
  {
    id: 'wnba-playoffs-2026',
    date: '2026-09-27',
    title: 'WNBA Playoffs Begin',
    description: 'Playoff performances cement legacies in the growing WNBA market. Championship runs create lasting card value.',
    leagues: ['WNBA'],
    category: 'playoffs',
    impact: 'medium',
  },
];

// ─── HELPERS ─────────────────────────────────────────────────

/**
 * Returns events from today forward, optionally filtered by league.
 * Sorted by date ascending (soonest first).
 */
export function getUpcomingEvents(league?: LeagueId): CatalystEvent[] {
  const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'

  return EVENTS_2026
    .filter((e) => {
      // Include events whose end date (or date) is today or later
      const eventEnd = e.endDate ?? e.date;
      if (eventEnd < today) return false;
      if (league && !e.leagues.includes(league)) return false;
      return true;
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Returns ALL events (including past) for reference. Sorted by date.
 */
export function getAllEvents(league?: LeagueId): CatalystEvent[] {
  return EVENTS_2026
    .filter((e) => !league || e.leagues.includes(league))
    .sort((a, b) => a.date.localeCompare(b.date));
}
