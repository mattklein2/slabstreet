import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q');
  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const url = `https://autosug.ebay.com/autosug?sId=0&kwd=${encodeURIComponent(q)}&_sacat=261328&fmt=osr`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'SlabStreet/1.0' },
    });
    const data = await res.json();
    const suggestions: string[] = Array.isArray(data) && Array.isArray(data[1]) ? data[1] : [];
    return NextResponse.json(suggestions.slice(0, 8));
  } catch {
    return NextResponse.json([]);
  }
}
