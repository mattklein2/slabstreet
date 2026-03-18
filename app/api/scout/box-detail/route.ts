import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { exclusivityMatchesConfig } from '../../../../lib/format';

export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get('productId');
  const configType = req.nextUrl.searchParams.get('configType');
  if (!productId || !configType) {
    return NextResponse.json({ error: 'productId and configType required' }, { status: 400 });
  }

  // 1. Fetch box configuration
  const { data: boxCfg } = await supabase
    .from('box_configurations')
    .select('*')
    .eq('product_id', productId)
    .eq('config_type', configType)
    .single();

  if (!boxCfg) {
    return NextResponse.json({ error: 'Box configuration not found' }, { status: 404 });
  }

  // 2. Fetch all parallels via card_sets
  const { data: cardSets } = await supabase
    .from('card_sets')
    .select('id, name, type, odds, is_autographed, is_memorabilia, box_exclusivity')
    .eq('product_id', productId);

  const cardSetIds = (cardSets || []).map(cs => cs.id);

  let allParallels: any[] = [];
  if (cardSetIds.length > 0) {
    const { data: pars } = await supabase
      .from('parallels')
      .select('id, name, color_hex, print_run, serial_numbered, rarity_rank, is_one_of_one, description, box_exclusivity')
      .in('card_set_id', cardSetIds)
      .order('rarity_rank', { ascending: false });
    allParallels = pars || [];
  }

  const totalParallels = allParallels.length;

  // 3. Filter parallels by box_exclusivity matching this config type
  const matchingParallels = allParallels.filter(p =>
    exclusivityMatchesConfig(p.box_exclusivity, configType)
  );

  // 4. Determine which parallels are exclusive to this box type
  const formatParallel = (p: any) => {
    const excl = p.box_exclusivity;
    const isExclusive = excl && excl.length > 0 && !excl.includes('All') && excl.length <= 2;
    return {
      id: p.id,
      name: p.name,
      colorHex: p.color_hex,
      printRun: p.print_run,
      serialNumbered: p.serial_numbered,
      rarityRank: p.rarity_rank,
      isOneOfOne: p.is_one_of_one,
      description: p.description || '',
      specialAttributes: null,
      boxExclusivity: p.box_exclusivity,
      totalParallels,
      isExclusive,
    };
  };

  const parallels = matchingParallels.map(formatParallel);

  // 5. Big game hunting: top 5 rarest
  const bigGameHunting = [...parallels]
    .sort((a, b) => b.rarityRank - a.rarityRank)
    .slice(0, 5);

  // 6. Filter inserts by box_exclusivity
  const inserts = (cardSets || [])
    .filter(cs => cs.type !== 'base')
    .filter(cs => exclusivityMatchesConfig(cs.box_exclusivity, configType))
    .map(cs => ({
      name: cs.name,
      type: cs.type,
      odds: cs.odds,
      isAutographed: cs.is_autographed || false,
      isMemorabilia: cs.is_memorabilia || false,
    }));

  return NextResponse.json({
    boxConfig: {
      configType: boxCfg.config_type,
      retailPriceUsd: boxCfg.retail_price_usd,
      packsPerBox: boxCfg.packs_per_box,
      cardsPerPack: boxCfg.cards_per_pack,
      guaranteedHits: boxCfg.guaranteed_hits,
      oddsAuto: boxCfg.odds_auto,
      oddsRelic: boxCfg.odds_relic,
      oddsNumbered: boxCfg.odds_numbered,
      description: boxCfg.description || '',
    },
    parallels,
    totalParallels,
    inserts,
    bigGameHunting,
  });
}
