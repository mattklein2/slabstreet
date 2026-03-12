import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const sport = params.get('sport');
  const budgetMin = params.get('budgetMin');
  const budgetMax = params.get('budgetMax');
  const store = params.get('store');

  if (!sport) {
    return NextResponse.json({ error: 'sport parameter required' }, { status: 400 });
  }

  // Build query: products joined with box_configurations
  let query = supabase
    .from('box_configurations')
    .select(`
      id,
      config_type,
      retail_price_usd,
      packs_per_box,
      cards_per_pack,
      guaranteed_hits,
      odds_auto,
      odds_relic,
      odds_numbered,
      description,
      pros_cons,
      products!inner (
        id,
        name,
        year,
        is_flagship,
        pros_cons,
        sport
      )
    `)
    .eq('products.sport', sport);

  // Budget filter
  if (budgetMin) {
    query = query.gte('retail_price_usd', parseFloat(budgetMin));
  }
  if (budgetMax) {
    query = query.lte('retail_price_usd', parseFloat(budgetMax));
  }

  query = query.order('retail_price_usd', { ascending: true });

  const { data: boxData, error: boxError } = await query;

  if (boxError) {
    return NextResponse.json({ error: boxError.message }, { status: 500 });
  }

  // If store filter, get matching retailer mappings
  let retailerMap: Record<string, { name: string; notes: string | null; configTypes: string[] }> = {};

  if (store && store !== 'all') {
    const storeNames = store === 'amazon_fanatics' ? ['Amazon', 'Fanatics'] : [store];

    const { data: prData } = await supabase
      .from('product_retailers')
      .select(`
        product_id,
        config_types,
        notes,
        retailers!inner (
          name
        )
      `)
      .in('retailers.name', storeNames);

    if (prData) {
      for (const row of prData as any[]) {
        const key = `${row.product_id}`;
        const retailer = row.retailers as any;
        if (!retailerMap[key]) {
          retailerMap[key] = { name: retailer.name, notes: row.notes, configTypes: row.config_types || [] };
        } else {
          retailerMap[key].configTypes.push(...(row.config_types || []));
        }
      }
    }
  }

  // Shape results
  const results = (boxData || [])
    .filter((row: any) => {
      if (!store || store === 'all') return true;
      const product = row.products as any;
      const mapping = retailerMap[product.id];
      if (!mapping) return false;
      return mapping.configTypes.includes(row.config_type);
    })
    .map((row: any) => {
      const product = row.products as any;
      const mapping = retailerMap[product.id];
      return {
        product: {
          id: product.id,
          name: product.name,
          year: product.year,
          isFlagship: product.is_flagship,
          prosCons: product.pros_cons,
        },
        boxConfig: {
          id: row.id,
          configType: row.config_type,
          retailPriceUsd: row.retail_price_usd,
          packsPerBox: row.packs_per_box,
          cardsPerPack: row.cards_per_pack,
          guaranteedHits: row.guaranteed_hits,
          oddsAuto: row.odds_auto,
          oddsRelic: row.odds_relic,
          oddsNumbered: row.odds_numbered,
          description: row.description,
          prosCons: row.pros_cons,
        },
        retailer: mapping ? { name: mapping.name, notes: mapping.notes } : null,
      };
    })
    // Sort: flagship first, then price
    .sort((a: any, b: any) => {
      if (a.product.isFlagship !== b.product.isFlagship) return a.product.isFlagship ? -1 : 1;
      return (a.boxConfig.retailPriceUsd || 0) - (b.boxConfig.retailPriceUsd || 0);
    });

  return NextResponse.json({ results }, {
    headers: { 'Cache-Control': 'public, max-age=3600' },
  });
}
