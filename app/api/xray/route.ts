// app/api/xray/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { supabase } from '../../../lib/supabase';
import { parseLink, looksLikeUrl } from '../../../lib/xray/link-parser';
import { getItem } from '../../../lib/xray/ebay-client';
import { parseCardIdentity } from '../../../lib/xray/card-identity';
import { matchCard } from '../../../lib/xray/db-matcher';
import { getPriceComps } from '../../../lib/xray/price-comps';
import type { EbayListingData, XRayResult, XRayError } from '../../../lib/xray/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url: string = body.url || '';

    // Validate input
    if (!url || !looksLikeUrl(url)) {
      return NextResponse.json(
        { error: 'Please paste a valid eBay listing URL', code: 'INVALID_URL' } as XRayError,
        { status: 400 },
      );
    }

    // Parse URL to get item ID
    const parsed = parseLink(url);
    if (!parsed) {
      return NextResponse.json(
        { error: 'Could not extract item ID from URL. Please paste a full eBay listing URL (e.g., ebay.com/itm/...)', code: 'INVALID_URL' } as XRayError,
        { status: 400 },
      );
    }

    if (parsed.marketplace !== 'ebay') {
      return NextResponse.json(
        { error: 'Only eBay links are supported right now. More marketplaces coming soon.', code: 'UNSUPPORTED_MARKETPLACE' } as XRayError,
        { status: 400 },
      );
    }

    // Fetch listing from eBay
    let ebayItem;
    try {
      ebayItem = await getItem(parsed.itemId);
    } catch (err: any) {
      console.error('eBay getItem failed:', err.message);
      return NextResponse.json(
        { error: 'Could not fetch this eBay listing. It may have ended or been removed.', code: 'EBAY_ERROR' } as XRayError,
        { status: 502 },
      );
    }

    // Transform eBay response to our format
    const itemSpecifics: Record<string, string> = {};
    if (ebayItem.localizedAspects) {
      for (const aspect of ebayItem.localizedAspects) {
        itemSpecifics[aspect.name] = aspect.value;
      }
    }

    const listing: EbayListingData = {
      itemId: parsed.itemId,
      title: ebayItem.title || '',
      price: parseFloat(ebayItem.price?.value || '0'),
      currency: ebayItem.price?.currency || 'USD',
      condition: ebayItem.condition || '',
      imageUrl: ebayItem.image?.imageUrl || '',
      itemUrl: ebayItem.itemWebUrl || '',
      seller: ebayItem.seller?.username || '',
      itemSpecifics,
      listingType: ebayItem.buyingOptions?.[0] || 'FIXED_PRICE',
    };

    // Parse card identity
    const identity = parseCardIdentity(listing);

    // Match against our database
    const match = await matchCard(identity);

    // Get price comps
    const priceComps = await getPriceComps(
      identity,
      listing.price,
      match.parallel?.parallelId || null,
      parsed.itemId,
    );

    // Build education blurbs
    const education = {
      setDescription: match.product?.description || null,
      parallelDescription: match.parallel?.description || null,
      flagshipContext: match.product?.isFlagship
        ? `${match.product.productName} is a flagship product — one of the most collected and recognized sets in the hobby.`
        : null,
      insertDescription: match.cardSet?.type === 'insert'
        ? match.cardSet.description || `${match.cardSet.cardSetName} is an insert set${match.cardSet.odds ? ` found at ${match.cardSet.odds}` : ''}.`
        : null,
    };

    // Determine match status
    let status: XRayResult['status'] = 'unmatched';
    if (match.product && match.parallel) status = 'matched';
    else if (match.product) status = 'partial';

    const result: XRayResult = {
      status,
      listing,
      identity,
      product: match.product,
      matchedParallel: match.parallel,
      matchedCardSet: match.cardSet,
      rainbow: match.rainbow,
      priceComps,
      education,
    };

    // Save result for shareable URL
    const { data: existing } = await supabase
      .from('xray_results')
      .select('id')
      .eq('ebay_item_id', parsed.itemId)
      .maybeSingle();

    const resultId = existing?.id || nanoid(12);

    await supabase.from('xray_results').upsert({
      id: resultId,
      ebay_item_id: parsed.itemId,
      match_status: status,
      result_data: result,
      player_name: identity.player,
      year: identity.year,
      product_name: match.product?.productName || null,
      sport: identity.sport,
    }, { onConflict: 'ebay_item_id' });

    // Log lookup for analytics (fire-and-forget, don't block response)
    supabase.from('card_lookups').insert({
      url,
      ebay_item_id: parsed.itemId,
      match_status: status,
      product_id: match.product?.productId || null,
      parallel_id: match.parallel?.parallelId || null,
      parsed_identity: identity,
    }).then(({ error: logErr }) => {
      if (logErr) console.error('card_lookups insert error:', logErr.message);
    });

    return NextResponse.json({ ...result, resultId });
  } catch (err: any) {
    console.error('X-Ray error:', err);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.', code: 'SERVER_ERROR' } as XRayError,
      { status: 500 },
    );
  }
}
