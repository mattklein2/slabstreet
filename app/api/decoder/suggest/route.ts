import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q');
  const context = request.nextUrl.searchParams.get('context') || '';
  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const searchTerms = context ? `${context} ${q}` : q;
    const url = `https://autosug.ebay.com/autosug?sId=0&kwd=${encodeURIComponent(searchTerms)}&_sacat=261328&fmt=osr`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'SlabStreet/1.0' },
    });
    const data = await res.json();
    const suggestions: string[] = Array.isArray(data) && Array.isArray(data[1]) ? data[1] : [];
    // Strip context words from suggestions so user sees clean player names
    const contextWords = context ? context.toLowerCase().split(/\s+/) : [];
    const queryLower = q.toLowerCase().trim();
    const cleaned = suggestions
      .map(s => {
        // Remove all words that appear in the context
        let words = s.toLowerCase().split(/\s+/);
        words = words.filter(w => !contextWords.includes(w));
        return words.join(' ').replace(/^[^a-z]+/i, '').trim();
      })
      .filter(s => {
        if (s.length === 0) return false;
        const words = s.split(/\s+/);
        // Must have at least 2 words (first + last name)
        if (words.length < 2 || words.length > 4) return false;
        // Skip results with numbers (card #s, years)
        if (/\d/.test(s)) return false;
        // All words must look like name parts (alpha, apostrophes, hyphens)
        if (!words.every(w => /^[a-z'.()-]+$/i.test(w))) return false;
        // KEY FILTER: user's query must be a prefix of at least one word.
        // e.g. typing "pat" matches "patrick mahomes" but not "scan and slam"
        if (!words.some(w => w.startsWith(queryLower))) return false;
        // Skip known non-name terms (brands, card jargon, teams, colors, etc.)
        const skip = new Set(['topps', 'panini', 'chrome', 'prizm', 'donruss', 'optic', 'select', 'mosaic', 'hoops', 'bowman', 'heritage', 'finest', 'upper', 'deck', 'basketball', 'football', 'baseball', 'hockey', 'formula', 'racing', 'wnba', 'nba', 'nfl', 'mlb', 'nhl', 'auto', 'autograph', 'signed', 'rookie', 'card', 'cards', 'lot', 'psa', 'bgs', 'sgc', 'cgc', 'base', 'refractor', 'parallel', 'insert', 'patch', 'jersey', 'relic', 'memorabilia', 'swatch', 'blue', 'red', 'green', 'gold', 'silver', 'purple', 'orange', 'black', 'pink', 'white', 'yellow', 'bronze', 'platinum', 'sapphire', 'ruby', 'emerald', 'target', 'walmart', 'scan', 'slam', 'kings', 'aces', 'diamante', 'foil', 'holo', 'wave', 'mega', 'blaster', 'hobby', 'jumbo', 'case', 'box', 'pack', 'break', 'rip', 'cello', 'fat', 'hanger', 'anniversary', 'edition', 'series', 'set', 'complete', 'graded', 'raw', 'slab', 'team', 'draft', 'picks', 'midnight', 'variation', 'short', 'print', 'sp', 'ssp', 'turbo', 'attax', 'sticker', 'album', 'helmet', 'race', 'grand', 'prix', 'constructor', 'driver', 'circuit', 'comic', 'court']);
        if (words.some(w => skip.has(w))) return false;
        return true;
      });
    const unique = [...new Set(cleaned)];
    return NextResponse.json(unique.slice(0, 8));
  } catch {
    return NextResponse.json([]);
  }
}
