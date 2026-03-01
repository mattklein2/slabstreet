import { NextResponse } from 'next/server';

/*
  Two endpoints in one route:

  GET /api/psa?cert=12345678
  → Returns full cert details for a single graded card
  → Used to verify a specific card (cert number lookup)

  GET /api/psa?subject=Victor+Wembanyama&year=2023&brand=Prizm
  → Returns population report data for a player/set combo
  → Used to power the Scarcity pillar

  PSA API base: https://api.psacard.com/publicapi/
  Free tier: 100 calls/day — results cached 24hrs to preserve quota
*/

const PSA_BASE = 'https://api.psacard.com/publicapi';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cert    = searchParams.get('cert');
  const subject = searchParams.get('subject');

  const token = process.env.PSA_API_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: 'PSA_API_TOKEN not configured' },
      { status: 500 }
    );
  }

  const headers = {
    'Authorization': `bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // ── CERT LOOKUP ──────────────────────────────────────────
  // GET /api/psa?cert=12345678
  if (cert) {
    try {
      const res = await fetch(
        `${PSA_BASE}/cert/GetByCertNumber/${cert}`,
        { headers, next: { revalidate: 86400 } } // cache 24hrs
      );

      if (!res.ok) {
        return NextResponse.json(
          { error: `PSA API error: ${res.status}` },
          { status: res.status }
        );
      }

      const data = await res.json();
      return NextResponse.json({ cert: data });

    } catch (err) {
      console.error('PSA cert lookup error:', err);
      return NextResponse.json({ error: 'Failed to fetch cert data' }, { status: 500 });
    }
  }

  // ── POPULATION LOOKUP ────────────────────────────────────
  // GET /api/psa?subject=Victor+Wembanyama
  if (subject) {
    try {
      // PSA pop report — search by subject name
      // Returns all graded cards matching the subject with grade counts
      const encoded = encodeURIComponent(subject);
      const res = await fetch(
        `${PSA_BASE}/pop/GetItemsSummaryBySubject/${encoded}`,
        { headers, next: { revalidate: 86400 } } // cache 24hrs
      );

      if (!res.ok) {
        return NextResponse.json(
          { error: `PSA API error: ${res.status}` },
          { status: res.status }
        );
      }

      const data = await res.json();
      return NextResponse.json({ population: data });

    } catch (err) {
      console.error('PSA population lookup error:', err);
      return NextResponse.json({ error: 'Failed to fetch population data' }, { status: 500 });
    }
  }

  return NextResponse.json(
    { error: 'Provide either cert= or subject= parameter' },
    { status: 400 }
  );
}
