import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export async function GET(request: NextRequest) {
  const productId = request.nextUrl.searchParams.get('productId');

  if (!productId) {
    return NextResponse.json({ error: 'productId parameter required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('parallels')
    .select('id, name, color_hex, print_run, serial_numbered, rarity_rank, is_one_of_one, description, special_attributes, box_exclusivity')
    .eq('product_id', productId)
    .order('rarity_rank', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const totalParallels = (data || []).length;
  const parallels = (data || []).map(row => ({
    id: row.id,
    name: row.name,
    colorHex: row.color_hex,
    printRun: row.print_run,
    serialNumbered: row.serial_numbered,
    rarityRank: row.rarity_rank,
    isOneOfOne: row.is_one_of_one,
    description: row.description,
    specialAttributes: row.special_attributes,
    boxExclusivity: row.box_exclusivity,
    totalParallels,
  }));

  return NextResponse.json({ parallels, totalParallels }, {
    headers: { 'Cache-Control': 'no-store', 'CDN-Cache-Control': 'no-store', 'Netlify-CDN-Cache-Control': 'no-store' },
  });
}
