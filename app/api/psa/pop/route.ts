// app/api/psa/pop/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getPopForCard } from '../../../../lib/psa/pop-lookup';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cert = searchParams.get('cert');
  const player = searchParams.get('player');
  const year = searchParams.get('year');
  const brand = searchParams.get('brand');
  const set = searchParams.get('set');

  try {
    const pop = await getPopForCard(cert, player, year, brand, set);
    return NextResponse.json({ pop });
  } catch (err: any) {
    console.error('[psa/pop] error:', err.message);
    return NextResponse.json({ pop: null });
  }
}
