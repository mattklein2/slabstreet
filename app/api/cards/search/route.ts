import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export interface CardResult {
  id: string;
  playerSlug: string;
  year: number;
  setName: string;
  parallel: string | null;
  cardNumber: string | null;
  numberedTo: number | null;
  league: string;
  imageUrl: string | null;
  slug: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const q = searchParams.get('q');
  const league = searchParams.get('league');
  const limitParam = searchParams.get('limit');

  if (!q || q.trim().length === 0) {
    return NextResponse.json(
      { error: 'Query parameter "q" is required' },
      { status: 400 }
    );
  }

  // Sanitize and split into words
  const sanitized = q.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const words = sanitized.split(/\s+/).filter((w) => w.length > 0);

  if (words.length === 0) {
    return NextResponse.json({ cards: [], total: 0 });
  }

  // Clamp limit between 1 and 50
  const limit = Math.min(50, Math.max(1, parseInt(limitParam ?? '20', 10) || 20));

  try {
    let query = supabase.from('cards').select('*', { count: 'exact' });

    // AND across words, OR across columns per word
    for (const word of words) {
      const pattern = `%${word}%`;
      query = query.or(
        `player_slug.ilike.${pattern},set_name.ilike.${pattern},slug.ilike.${pattern},parallel.ilike.${pattern}`
      );
    }

    if (league) {
      query = query.eq('league', league);
    }

    query = query.order('year', { ascending: false }).order('set_name', { ascending: true }).limit(limit);

    const { data, error, count } = await query;

    if (error) {
      console.error('[cards/search] Supabase error:', error);
      return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
    }

    const cards: CardResult[] = (data ?? []).map((row: Record<string, unknown>) => ({
      id: row.id as string,
      playerSlug: row.player_slug as string,
      year: row.year as number,
      setName: row.set_name as string,
      parallel: (row.parallel ?? null) as string | null,
      cardNumber: (row.card_number ?? null) as string | null,
      numberedTo: (row.numbered_to ?? null) as number | null,
      league: row.league as string,
      imageUrl: (row.image_url ?? null) as string | null,
      slug: row.slug as string,
    }));

    return NextResponse.json({ cards, total: count ?? cards.length });
  } catch (err) {
    console.error('[cards/search] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
