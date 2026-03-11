import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get('q');

  if (!q || q.trim().length < 2) {
    return NextResponse.json({ players: [] });
  }

  const pattern = `%${q.trim()}%`;

  try {
    const { data, error } = await supabase
      .from('players')
      .select('name, slug, team, score, signal, league')
      .eq('active', true)
      .or(`name.ilike.${pattern},slug.ilike.${pattern},team.ilike.${pattern}`)
      .order('score', { ascending: false })
      .limit(20);

    if (error) {
      console.error('[players/search] Supabase error:', error);
      return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
    }

    return NextResponse.json({ players: data ?? [] });
  } catch (err) {
    console.error('[players/search] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
