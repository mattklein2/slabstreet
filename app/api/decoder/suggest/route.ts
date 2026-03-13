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
    const cleaned = suggestions
      .map(s => {
        // Remove all words that appear in the context
        let words = s.toLowerCase().split(/\s+/);
        words = words.filter(w => !contextWords.includes(w));
        return words.join(' ').replace(/^[^a-z]+/i, '').trim();
      })
      .filter(s => {
        if (s.length === 0) return false;
        // Must have at least 2 words (first + last name)
        if (s.split(/\s+/).length < 2) return false;
        // Skip results with numbers (card #s, years)
        if (/\d/.test(s)) return false;
        // Only keep results where all words look like name parts (2-4 words, all alpha)
        const words = s.split(/\s+/);
        if (words.length > 4) return false;
        const nameish = words.every(w => /^[a-z'.()-]+$/i.test(w));
        if (!nameish) return false;
        // Skip results that still contain product/brand/card terms
        const skip = ['topps', 'panini', 'chrome', 'prizm', 'donruss', 'optic', 'select', 'mosaic', 'hoops', 'bowman', 'heritage', 'finest', 'basketball', 'football', 'baseball', 'hockey', 'nba', 'nfl', 'mlb', 'nhl', 'auto', 'rookie', 'card', 'lot', 'psa', 'base', 'refractor', 'parallel', 'insert', 'blue', 'red', 'green', 'gold', 'silver', 'purple', 'orange', 'black', 'pink', 'target', 'walmart', 'scan', 'slam', 'kings', 'aces', 'diamante', 'foil', 'holo', 'wave', 'all', 'xs', 'whoas', 'mega', 'blaster', 'hobby', 'jumbo', 'case', 'box', 'pack', 'break', 'rip'];
        if (skip.some(w => words.includes(w))) return false;
        return true;
      });
    const unique = [...new Set(cleaned)];
    return NextResponse.json(unique.slice(0, 8));
  } catch {
    return NextResponse.json([]);
  }
}
