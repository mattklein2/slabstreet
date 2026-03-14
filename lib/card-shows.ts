/**
 * Card Show Finder — static data + zip-to-distance logic.
 *
 * Major / regional shows only. Not every small mall show — these are
 * the ones worth traveling for.
 *
 * Sources: CardShowHub, Hall of Cards, Sports Collectors Digest,
 *          individual show websites, Beckett.
 */

// ── Types ──────────────────────────────────────────────────────────

export type ShowSize = 'mega' | 'major' | 'regional';

export interface CardShow {
  id: string;
  name: string;
  /** City, State */
  location: string;
  venue: string;
  /** Latitude for distance calc */
  lat: number;
  /** Longitude for distance calc */
  lng: number;
  /** ISO date strings — null if TBA */
  startDate: string | null;
  endDate: string | null;
  /** How often it repeats — null if one-off */
  recurrence: string | null;
  /** Approximate dealer table count */
  tables: number | null;
  size: ShowSize;
  /** Link to official site or event page */
  url: string | null;
  /** One-liner about the show */
  description: string;
  /** General admission price, or null if free/unknown */
  admissionPrice: string | null;
}

// ── Show Data ──────────────────────────────────────────────────────

export const CARD_SHOWS: CardShow[] = [
  // ═══ MEGA (1000+ tables / national significance) ═══

  {
    id: 'nscc-2026',
    name: 'The National (NSCC)',
    location: 'Rosemont, IL',
    venue: 'Donald E. Stephens Convention Center',
    lat: 41.9842,
    lng: -87.8643,
    startDate: '2026-07-29',
    endDate: '2026-08-02',
    recurrence: 'Annual (late July)',
    tables: 800,
    size: 'mega',
    url: 'https://www.nsccshow.com',
    description: 'The Super Bowl of card shows. 800+ booths, every major brand, grading companies, and 40,000+ attendees. The biggest event in the hobby.',
    admissionPrice: '$30',
  },
  {
    id: 'dallas-mar-2026',
    name: 'Dallas Card Show',
    location: 'Allen, TX',
    venue: 'Delta Hotels by Marriott Dallas Allen',
    lat: 33.1032,
    lng: -96.6706,
    startDate: '2026-03-12',
    endDate: '2026-03-15',
    recurrence: '6x per year',
    tables: 700,
    size: 'mega',
    url: 'https://www.dallascardshow.com',
    description: 'One of the largest regional shows in the country. 700+ tables, auction houses, PSA/BGS grading on-site, and Trade Night.',
    admissionPrice: '$15',
  },
  {
    id: 'dallas-jun-2026',
    name: 'Dallas Card Show',
    location: 'Allen, TX',
    venue: 'Delta Hotels by Marriott Dallas Allen',
    lat: 33.1032,
    lng: -96.6706,
    startDate: '2026-06-11',
    endDate: '2026-06-14',
    recurrence: '6x per year',
    tables: 700,
    size: 'mega',
    url: 'https://www.dallascardshow.com',
    description: 'One of the largest regional shows in the country. 700+ tables, auction houses, PSA/BGS grading on-site, and Trade Night.',
    admissionPrice: '$15',
  },
  {
    id: 'dallas-sep-2026',
    name: 'Dallas Card Show',
    location: 'Allen, TX',
    venue: 'Delta Hotels by Marriott Dallas Allen',
    lat: 33.1032,
    lng: -96.6706,
    startDate: '2026-09-10',
    endDate: '2026-09-13',
    recurrence: '6x per year',
    tables: 700,
    size: 'mega',
    url: 'https://www.dallascardshow.com',
    description: 'One of the largest regional shows in the country. 700+ tables, auction houses, PSA/BGS grading on-site, and Trade Night.',
    admissionPrice: '$15',
  },

  // ═══ MAJOR (200–500 tables / multi-day) ═══

  {
    id: 'wccs-feb-2026',
    name: 'West Coast Card Show',
    location: 'Ontario, CA',
    venue: 'Ontario Convention Center',
    lat: 34.0633,
    lng: -117.6509,
    startDate: '2026-02-12',
    endDate: '2026-02-15',
    recurrence: '2-3x per year',
    tables: 500,
    size: 'major',
    url: 'https://westcoastcardshow.com',
    description: 'West Coast flagship show. 500+ tables across sports, Pokémon, and entertainment. The epicenter of SoCal card culture.',
    admissionPrice: '$20',
  },
  {
    id: 'wccs-may-2026',
    name: 'West Coast Card Show',
    location: 'Ontario, CA',
    venue: 'Ontario Convention Center',
    lat: 34.0633,
    lng: -117.6509,
    startDate: '2026-05-28',
    endDate: '2026-05-31',
    recurrence: '2-3x per year',
    tables: 500,
    size: 'major',
    url: 'https://westcoastcardshow.com',
    description: 'West Coast flagship show. 500+ tables across sports, Pokémon, and entertainment. The epicenter of SoCal card culture.',
    admissionPrice: '$20',
  },
  {
    id: 'philly-apr-2026',
    name: 'Philly Card Show',
    location: 'Philadelphia, PA',
    venue: 'Greater Philadelphia Expo Center',
    lat: 40.1851,
    lng: -75.2499,
    startDate: '2026-04-11',
    endDate: '2026-04-12',
    recurrence: '2x per year',
    tables: 250,
    size: 'major',
    url: null,
    description: '250+ tables in the heart of the East Coast card market. Strong vintage presence and regional dealers.',
    admissionPrice: '$10',
  },
  {
    id: 'philly-nov-2026',
    name: 'Philly Non-Sports & Sports Card Show',
    location: 'Fort Washington, PA',
    venue: 'Fort Washington Expo Center',
    lat: 40.1382,
    lng: -75.2071,
    startDate: '2026-11-07',
    endDate: '2026-11-08',
    recurrence: 'Annual (fall)',
    tables: 300,
    size: 'major',
    url: null,
    description: '300+ tables. One of the East Coast\'s largest fall shows. Mix of sports and non-sports cards.',
    admissionPrice: '$10',
  },
  {
    id: 'ne-expo-may-2026',
    name: 'Northeast Sports Card Expo',
    location: 'Stamford, CT',
    venue: 'Chelsea Piers: Stamford',
    lat: 41.0534,
    lng: -73.5387,
    startDate: '2026-05-02',
    endDate: '2026-05-03',
    recurrence: '2-3x per year',
    tables: 200,
    size: 'major',
    url: 'https://www.northeastcardexpo.com',
    description: 'Premier Northeast show. 200+ tables, grading on-site, autograph guests. Early entry available.',
    admissionPrice: '$15',
  },
  {
    id: 'ne-expo-sep-2026',
    name: 'Northeast Sports Card Expo',
    location: 'Stamford, CT',
    venue: 'Chelsea Piers: Stamford',
    lat: 41.0534,
    lng: -73.5387,
    startDate: '2026-09-12',
    endDate: '2026-09-13',
    recurrence: '2-3x per year',
    tables: 200,
    size: 'major',
    url: 'https://www.northeastcardexpo.com',
    description: 'Premier Northeast show. 200+ tables, grading on-site, autograph guests. Early entry available.',
    admissionPrice: '$15',
  },
  {
    id: 'lv-feb-2026',
    name: 'Las Vegas Card Show',
    location: 'Las Vegas, NV',
    venue: 'Las Vegas Convention Center',
    lat: 36.1281,
    lng: -115.1527,
    startDate: '2026-02-07',
    endDate: '2026-02-09',
    recurrence: '2x per year',
    tables: 200,
    size: 'major',
    url: null,
    description: '200+ tables timed around Super Bowl LXI. Dealers bring heavy vintage and modern football inventory.',
    admissionPrice: '$15',
  },
  {
    id: 'houston-may-2026',
    name: 'Houston Card Show',
    location: 'Houston, TX',
    venue: 'NRG Center',
    lat: 29.6847,
    lng: -95.4107,
    startDate: '2026-05-16',
    endDate: '2026-05-17',
    recurrence: '2-3x per year',
    tables: 200,
    size: 'major',
    url: null,
    description: '200+ tables with autograph guests. Major hub for Texas collectors outside of Dallas.',
    admissionPrice: '$10',
  },
  {
    id: 'chicago-nov-2026',
    name: 'Chicago Card Show',
    location: 'Chicago, IL',
    venue: 'Odeum Expo Center',
    lat: 41.7508,
    lng: -88.1535,
    startDate: '2026-11-21',
    endDate: '2026-11-22',
    recurrence: 'Annual (fall)',
    tables: 225,
    size: 'major',
    url: null,
    description: '225+ tables. Chicago\'s largest non-National show. Strong Midwest dealer attendance.',
    admissionPrice: '$10',
  },
  {
    id: 'megafest-mar-2026',
    name: 'Trading Card Megafest Explosion',
    location: 'Hollywood, FL',
    venue: 'Seminole Hard Rock Hotel & Casino',
    lat: 26.0510,
    lng: -80.2104,
    startDate: '2026-03-14',
    endDate: '2026-03-15',
    recurrence: 'Annual',
    tables: 250,
    size: 'major',
    url: null,
    description: '250+ tables at the Hard Rock. South Florida\'s flagship card show with celebrity autograph sessions.',
    admissionPrice: '$15',
  },

  // ═══ REGIONAL (100–200 tables / 1-2 day) ═══

  {
    id: 'az-spring-2026',
    name: 'Arizona State Card Show',
    location: 'Phoenix, AZ',
    venue: 'Arizona State Fairgrounds',
    lat: 33.4676,
    lng: -112.0975,
    startDate: '2026-03-07',
    endDate: '2026-03-08',
    recurrence: 'Annual (Spring Training)',
    tables: 150,
    size: 'regional',
    url: null,
    description: 'Timed with MLB Spring Training. Strong baseball focus with vintage and autograph dealers.',
    admissionPrice: '$10',
  },
  {
    id: 'atlanta-may-2026',
    name: 'Atlanta Card Show',
    location: 'Atlanta, GA',
    venue: 'Gas South Convention Center',
    lat: 33.9617,
    lng: -84.0683,
    startDate: '2026-05-09',
    endDate: '2026-05-10',
    recurrence: '2-3x per year',
    tables: 150,
    size: 'regional',
    url: null,
    description: 'Southeast hub show. 150+ tables with strong basketball and football inventory.',
    admissionPrice: '$10',
  },
  {
    id: 'bay-area-apr-2026',
    name: 'Bay Area Sports Card Show',
    location: 'San Jose, CA',
    venue: 'Santa Clara Convention Center',
    lat: 37.3939,
    lng: -121.9746,
    startDate: '2026-04-18',
    endDate: '2026-04-19',
    recurrence: '2x per year',
    tables: 150,
    size: 'regional',
    url: null,
    description: 'NorCal\'s biggest show. 150+ tables with Bay Area dealers and grading services.',
    admissionPrice: '$10',
  },
  {
    id: 'seattle-jun-2026',
    name: 'Seattle Card Show',
    location: 'Seattle, WA',
    venue: 'Seattle Convention Center',
    lat: 47.6115,
    lng: -122.3317,
    startDate: '2026-06-20',
    endDate: '2026-06-21',
    recurrence: '2x per year',
    tables: 120,
    size: 'regional',
    url: null,
    description: 'Pacific Northwest hub. Growing show with 120+ tables and strong basketball focus.',
    admissionPrice: '$10',
  },
  {
    id: 'denver-apr-2026',
    name: 'Mile High Card Show',
    location: 'Denver, CO',
    venue: 'National Western Complex',
    lat: 39.7817,
    lng: -104.9719,
    startDate: '2026-04-25',
    endDate: '2026-04-26',
    recurrence: '2x per year',
    tables: 130,
    size: 'regional',
    url: null,
    description: 'Rocky Mountain region\'s primary show. Growing fast with 130+ tables.',
    admissionPrice: '$8',
  },
  {
    id: 'detroit-may-2026',
    name: 'Motor City Card Show',
    location: 'Novi, MI',
    venue: 'Suburban Collection Showplace',
    lat: 42.4809,
    lng: -83.4755,
    startDate: '2026-05-30',
    endDate: '2026-05-31',
    recurrence: '2x per year',
    tables: 150,
    size: 'regional',
    url: null,
    description: 'Michigan\'s biggest show. 150+ tables with strong vintage baseball and hockey presence.',
    admissionPrice: '$10',
  },
  {
    id: 'minneapolis-jun-2026',
    name: 'Twin Cities Card Show',
    location: 'Minneapolis, MN',
    venue: 'Minneapolis Convention Center',
    lat: 44.9692,
    lng: -93.2735,
    startDate: '2026-06-06',
    endDate: '2026-06-07',
    recurrence: '2x per year',
    tables: 120,
    size: 'regional',
    url: null,
    description: 'Upper Midwest hub. 120+ tables with strong hockey and football inventory.',
    admissionPrice: '$8',
  },
  {
    id: 'nashville-apr-2026',
    name: 'Nashville Card Show',
    location: 'Nashville, TN',
    venue: 'Nashville Fairgrounds',
    lat: 36.1341,
    lng: -86.7631,
    startDate: '2026-04-04',
    endDate: '2026-04-05',
    recurrence: '2x per year',
    tables: 100,
    size: 'regional',
    url: null,
    description: 'Growing mid-South show. 100+ tables with diverse sports mix.',
    admissionPrice: '$8',
  },
];

// ── Distance helpers ───────────────────────────────────────────────

/** Haversine distance in miles between two lat/lng points */
export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Zip code lookup via free zippopotam.us API — returns lat/lng or null */
export async function zipToCoords(zip: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(`https://api.zippopotam.us/us/${zip}`);
    if (!res.ok) return null;
    const data = await res.json();
    const place = data.places?.[0];
    if (!place) return null;
    return { lat: parseFloat(place.latitude), lng: parseFloat(place.longitude) };
  } catch {
    return null;
  }
}

/** Sort shows by distance from a point, returns shows with distance attached */
export function showsByDistance(
  lat: number,
  lng: number,
  shows: CardShow[] = CARD_SHOWS,
): (CardShow & { distance: number })[] {
  return shows
    .map(show => ({
      ...show,
      distance: Math.round(haversineDistance(lat, lng, show.lat, show.lng)),
    }))
    .sort((a, b) => a.distance - b.distance);
}

/** Format a date range nicely */
export function formatDateRange(start: string | null, end: string | null): string {
  if (!start) return 'Date TBA';
  const s = new Date(start + 'T00:00:00');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  if (!end || start === end) {
    return `${months[s.getMonth()]} ${s.getDate()}, ${s.getFullYear()}`;
  }
  const e = new Date(end + 'T00:00:00');
  if (s.getMonth() === e.getMonth()) {
    return `${months[s.getMonth()]} ${s.getDate()}–${e.getDate()}, ${s.getFullYear()}`;
  }
  return `${months[s.getMonth()]} ${s.getDate()} – ${months[e.getMonth()]} ${e.getDate()}, ${s.getFullYear()}`;
}

/** Days until a show starts (negative = already happened) */
export function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

/** Size label with emoji */
export function sizeLabel(size: ShowSize): { emoji: string; label: string } {
  switch (size) {
    case 'mega': return { emoji: '🏟️', label: 'Mega Show' };
    case 'major': return { emoji: '🎪', label: 'Major Show' };
    case 'regional': return { emoji: '📍', label: 'Regional Show' };
  }
}
