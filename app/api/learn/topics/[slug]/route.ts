import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../../lib/supabase';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const { data: topic, error } = await supabase
    .from('topics')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !topic) {
    return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
  }

  // Resolve related product names
  let relatedProductNames: string[] = [];
  if (topic.related_product_ids && topic.related_product_ids.length > 0) {
    const { data: products } = await supabase
      .from('products')
      .select('name')
      .in('id', topic.related_product_ids);
    relatedProductNames = (products || []).map((p: any) => p.name);
  }

  return NextResponse.json({
    slug: topic.slug,
    title: topic.title,
    category: topic.category,
    summary: topic.summary,
    sortOrder: topic.sort_order,
    body: topic.body,
    relatedProductNames,
    relatedTopicSlugs: topic.related_topic_slugs || [],
  }, {
    headers: { 'Cache-Control': 'public, max-age=86400' },
  });
}
