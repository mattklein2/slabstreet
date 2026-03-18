import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export async function GET(req: NextRequest) {
  const sport = req.nextUrl.searchParams.get('sport');
  if (!sport) return NextResponse.json({ error: 'sport required' }, { status: 400 });

  // Get products that have box_configurations
  const { data: configs, error: cfgErr } = await supabase
    .from('box_configurations')
    .select('product_id, config_type, products!inner(id, name, year, sport, is_flagship, image_url, brands(name))')
    .eq('products.sport', sport);

  if (cfgErr || !configs) {
    return NextResponse.json({ error: cfgErr?.message || 'Failed to fetch' }, { status: 500 });
  }

  // Group by product, collect config types
  const productMap = new Map<string, {
    id: string; name: string; year: string; brandName: string;
    imageUrl: string | null; isFlagship: boolean; configTypes: Set<string>;
  }>();

  for (const cfg of configs) {
    const p = cfg.products as any;
    if (!productMap.has(p.id)) {
      productMap.set(p.id, {
        id: p.id,
        name: p.name,
        year: p.year,
        brandName: p.brands?.name || '',
        imageUrl: p.image_url,
        isFlagship: p.is_flagship,
        configTypes: new Set(),
      });
    }
    productMap.get(p.id)!.configTypes.add(cfg.config_type);
  }

  const products = [...productMap.values()]
    .map(p => ({ ...p, configTypes: [...p.configTypes] }))
    .sort((a, b) => {
      if (a.year !== b.year) return b.year.localeCompare(a.year);
      if (a.isFlagship !== b.isFlagship) return a.isFlagship ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

  return NextResponse.json({ products });
}
