import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/*
  GET /api/sales?player=victor-wembanyama&limit=50

  Returns recent card sales for a player from the card_sales table.
  Joins with cards table to get card metadata.
  Sorted by sold_date descending (most recent first).
*/

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const playerSlug = searchParams.get('player') || '';
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10) || 50, 200);

  if (!playerSlug) {
    return NextResponse.json({ error: 'player= required', sales: [] }, { status: 400 });
  }

  // Get all cards for this player
  const { data: cards, error: cardsErr } = await supabase
    .from('cards')
    .select('id, set_name, parallel, card_number, year, image_url, cardladder_slug')
    .eq('player_slug', playerSlug);

  if (cardsErr || !cards || cards.length === 0) {
    return NextResponse.json({ sales: [], total: 0 });
  }

  const cardIds = cards.map(c => c.id);
  const cardMap = new Map(cards.map(c => [c.id, c]));

  // Fetch sales for all of this player's cards
  const { data: sales, error: salesErr, count } = await supabase
    .from('card_sales')
    .select('*', { count: 'exact' })
    .in('card_id', cardIds)
    .order('sold_date', { ascending: false })
    .limit(limit);

  if (salesErr) {
    return NextResponse.json({ error: salesErr.message, sales: [] }, { status: 500 });
  }

  // Enrich with card metadata
  const enriched = (sales || []).map(s => {
    const card = cardMap.get(s.card_id);
    const cardLabel = card
      ? `${card.year} ${card.set_name}${card.parallel && card.parallel !== 'Base' ? ` ${card.parallel}` : ''}${card.card_number ? ` #${card.card_number}` : ''}`
      : '';
    return {
      id: s.id,
      card: cardLabel,
      grade: s.grade || 'RAW',
      grader: s.grader || null,
      gradeNumber: s.grade_number || null,
      price: parseFloat(s.price),
      date: s.sold_date ? s.sold_date.slice(0, 10) : '',
      platform: s.platform || 'eBay',
      url: s.listing_url || '',
      image: s.image_url || card?.image_url || '',
    };
  });

  // Price stats
  const prices = enriched.map(s => s.price).filter(p => p > 0).sort((a, b) => a - b);
  const stats = prices.length > 0 ? {
    low: prices[0],
    high: prices[prices.length - 1],
    median: prices[Math.floor(prices.length / 2)],
    avg: Math.round((prices.reduce((a, b) => a + b, 0) / prices.length) * 100) / 100,
    total: count || sales?.length || 0,
  } : null;

  return NextResponse.json({
    sales: enriched,
    stats,
    total: count || sales?.length || 0,
  });
}
