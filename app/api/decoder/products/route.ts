import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export async function GET(request: NextRequest) {
  const sport = request.nextUrl.searchParams.get('sport');

  if (!sport) {
    return NextResponse.json({ error: 'sport parameter required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('products')
    .select('id, name, year, is_flagship, description')
    .eq('sport', sport)
    .order('year', { ascending: false })
    .order('is_flagship', { ascending: false })
    .order('name', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const products = (data || []).map(row => ({
    id: row.id,
    name: row.name,
    year: row.year,
    isFlagship: row.is_flagship,
    description: row.description,
  }));

  return NextResponse.json({ products }, {
    headers: { 'Cache-Control': 'public, max-age=60, s-maxage=60' },
  });
}
