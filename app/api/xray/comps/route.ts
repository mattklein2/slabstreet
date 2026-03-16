// app/api/xray/comps/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { getPriceComps } from '../../../../lib/xray/price-comps';
import type { CardIdentity, XRayResult } from '../../../../lib/xray/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const resultId = searchParams.get('resultId');
    const parallelId = searchParams.get('parallelId');

    if (!resultId || !parallelId) {
      return NextResponse.json(
        { error: 'Missing resultId or parallelId' },
        { status: 400 },
      );
    }

    // Load stored result
    const { data: resultRow } = await supabase
      .from('xray_results')
      .select('result_data')
      .eq('id', resultId)
      .maybeSingle();

    if (!resultRow) {
      return NextResponse.json(
        { error: 'Result not found' },
        { status: 404 },
      );
    }

    const storedResult: XRayResult = resultRow.result_data;

    // Get parallel name from DB
    const { data: parallel } = await supabase
      .from('parallels')
      .select('name, description')
      .eq('id', parallelId)
      .maybeSingle();

    if (!parallel) {
      return NextResponse.json(
        { error: 'Parallel not found' },
        { status: 404 },
      );
    }

    // Build synthetic identity with corrected parallel name
    const identity: CardIdentity = {
      ...storedResult.identity,
      parallel: parallel.name,
    };

    // Fetch price comps for the new parallel
    const priceComps = await getPriceComps(
      identity,
      storedResult.listing.price,
      parallelId,
      storedResult.listing.itemId,
    );

    // Update stored result with correction
    const updatedRainbow = storedResult.rainbow.map(entry => ({
      ...entry,
      isCurrentCard: entry.parallelId === parallelId,
    }));

    const updatedResult: XRayResult = {
      ...storedResult,
      rainbow: updatedRainbow,
      priceComps,
      matchedParallel: storedResult.rainbow
        .filter(r => r.parallelId === parallelId)
        .map(r => ({
          parallelId: r.parallelId,
          parallelName: r.name,
          colorHex: r.colorHex,
          printRun: r.printRun,
          serialNumbered: r.serialNumbered,
          rarityRank: r.rarityRank,
          isOneOfOne: r.isOneOfOne,
          description: r.description || '',
          boxExclusivity: r.boxExclusivity,
        }))[0] || storedResult.matchedParallel,
      education: {
        ...storedResult.education,
        parallelDescription: parallel.description || null,
      },
    };

    // Persist correction (fire-and-forget)
    supabase.from('xray_results').update({
      result_data: updatedResult,
      match_status: updatedResult.matchedParallel ? 'matched' : storedResult.status,
    }).eq('id', resultId).then(({ error }) => {
      if (error) console.error('xray_results update error:', error.message);
    });

    return NextResponse.json({
      priceComps,
      parallelDescription: parallel.description || null,
    });
  } catch (err: any) {
    console.error('Comps refetch error:', err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 },
    );
  }
}
