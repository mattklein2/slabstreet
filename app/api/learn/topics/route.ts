import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export async function GET() {
  const { data, error } = await supabase
    .from('topics')
    .select('slug, title, category, summary, sort_order')
    .order('category', { ascending: true })
    .order('sort_order', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const topics = (data || []).map(row => ({
    slug: row.slug,
    title: row.title,
    category: row.category,
    summary: row.summary,
    sortOrder: row.sort_order,
  }));

  return NextResponse.json({ topics }, {
    headers: { 'Cache-Control': 'public, max-age=86400' },
  });
}
