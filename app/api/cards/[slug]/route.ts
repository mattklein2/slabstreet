import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// ── Types ────────────────────────────────────────────────────

interface CardDetail {
  id: string;
  playerSlug: string;
  year: number;
  setName: string;
  parallel: string | null;
  cardNumber: string | null;
  numberedTo: number | null;
  league: string;
  imageUrl: string | null;
  cardladderSlug: string | null;
  slug: string;
}

interface SaleEntry {
  price: number;
  date: string;
  platform: string;
  imageUrl: string | null;
  listingUrl: string | null;
}

type SalesByGrade = Record<string, SaleEntry[]>;

interface PriceByGrade {
  grade: string;
  avg: number;
  count: number;
  latest: number;
}

interface LastSale {
  price: number;
  date: string;
  grade: string;
}

interface CardStats {
  totalSales: number;
  avgPrice: number;
  lastSale: LastSale | null;
  priceByGrade: PriceByGrade[];
}

// ── Route handler ────────────────────────────────────────────

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    // ── Fetch card by slug ──────────────────────────────────
    const { data: card, error: cardError } = await supabase
      .from('cards')
      .select('*')
      .eq('slug', slug)
      .single();

    if (cardError || !card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    // ── Fetch sales for this card ───────────────────────────
    const { data: salesRows, error: salesError } = await supabase
      .from('card_sales')
      .select('*')
      .eq('card_id', card.id)
      .order('sold_date', { ascending: false });

    if (salesError) {
      console.error('Supabase query error (card_sales):', salesError);
      return NextResponse.json({ error: 'Failed to fetch sales data' }, { status: 500 });
    }

    const sales = salesRows || [];

    // ── Group sales by grade ────────────────────────────────
    const salesByGrade: SalesByGrade = {};

    for (const sale of sales) {
      const gradeKey: string = sale.grade ?? 'Raw';

      if (!salesByGrade[gradeKey]) {
        salesByGrade[gradeKey] = [];
      }

      salesByGrade[gradeKey].push({
        price: typeof sale.price === 'number' ? sale.price : parseFloat(sale.price) || 0,
        date: sale.sold_date ?? '',
        platform: sale.platform ?? '',
        imageUrl: sale.image_url ?? null,
        listingUrl: sale.listing_url ?? null,
      });
    }

    // ── Compute aggregate stats ─────────────────────────────
    const totalSales = sales.length;

    const allPrices = sales.map((s) =>
      typeof s.price === 'number' ? s.price : parseFloat(s.price) || 0
    );

    const avgPrice =
      totalSales > 0
        ? Math.round((allPrices.reduce((sum, p) => sum + p, 0) / totalSales) * 100) / 100
        : 0;

    let lastSale: LastSale | null = null;
    if (sales.length > 0) {
      const first = sales[0]; // already sorted by sold_date DESC
      lastSale = {
        price: typeof first.price === 'number' ? first.price : parseFloat(first.price) || 0,
        date: first.sold_date ?? '',
        grade: first.grade ?? 'Raw',
      };
    }

    const priceByGrade: PriceByGrade[] = Object.entries(salesByGrade).map(
      ([grade, gradeSales]) => {
        const prices = gradeSales.map((s) => s.price);
        const count = prices.length;
        const avg =
          count > 0
            ? Math.round((prices.reduce((sum, p) => sum + p, 0) / count) * 100) / 100
            : 0;
        const latest = gradeSales[0]?.price ?? 0; // already ordered by date DESC
        return { grade, avg, count, latest };
      }
    );

    // ── Map card columns to CardDetail ──────────────────────
    const cardDetail: CardDetail = {
      id: card.id,
      playerSlug: card.player_slug ?? card.playerSlug ?? '',
      year: card.year,
      setName: card.set_name ?? card.setName ?? '',
      parallel: card.parallel ?? null,
      cardNumber: card.card_number ?? card.cardNumber ?? null,
      numberedTo: card.numbered_to ?? card.numberedTo ?? null,
      league: card.league ?? '',
      imageUrl: card.image_url ?? card.imageUrl ?? null,
      cardladderSlug: card.cardladder_slug ?? card.cardladderSlug ?? null,
      slug: card.slug,
    };

    return NextResponse.json({
      card: cardDetail,
      sales: salesByGrade,
      stats: {
        totalSales,
        avgPrice,
        lastSale,
        priceByGrade,
      } satisfies CardStats,
    });
  } catch (err) {
    console.error('Unexpected error in /api/cards/[slug]:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
