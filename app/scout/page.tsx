'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '../components/shared/Header';
import { SportPicker } from '../components/shared/SportPicker';
import { EmptyState } from '../components/shared/EmptyState';
import { BoxProductGrid } from '../components/scout/BoxProductGrid';
import { BoxTypePicker } from '../components/scout/BoxTypePicker';
import { BoxDetail } from '../components/scout/BoxDetail';
import { BoxTypeEducation } from '../components/scout/BoxTypeEducation';
import { useTheme } from '../components/ThemeProvider';
import type { SportValue, ScoutProduct, ScoutBoxDetail } from '../../lib/types';

function ScoutContent() {
  const { colors } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();

  const sportParam = searchParams.get('sport') as SportValue | null;
  const productParam = searchParams.get('product');
  const boxParam = searchParams.get('box');

  const [products, setProducts] = useState<ScoutProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ScoutProduct | null>(null);
  const [boxDetail, setBoxDetail] = useState<ScoutBoxDetail | null>(null);
  const [boxPrices, setBoxPrices] = useState<Record<string, number | null>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentStep = boxParam ? 2 : productParam ? 2 : sportParam ? 1 : 0;

  const updateUrl = useCallback((params: Record<string, string | null>) => {
    const sp = new URLSearchParams(searchParams.toString());
    for (const [key, val] of Object.entries(params)) {
      if (val === null) sp.delete(key);
      else sp.set(key, val);
    }
    router.push(`/scout?${sp.toString()}`, { scroll: false });
  }, [router, searchParams]);

  // Fetch products for sport
  useEffect(() => {
    if (!sportParam) return;
    setLoading(true);
    setError(null);
    fetch(`/api/scout/products?sport=${sportParam}`)
      .then(r => r.json())
      .then(data => {
        setProducts(data.products || []);
        if (productParam) {
          const found = (data.products || []).find((p: ScoutProduct) => p.id === productParam);
          if (found) setSelectedProduct(found);
        }
      })
      .catch(() => setError('Failed to load products'))
      .finally(() => setLoading(false));
  }, [sportParam, productParam]);

  // Fetch box detail
  useEffect(() => {
    if (!productParam || !boxParam) {
      setBoxDetail(null);
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`/api/scout/box-detail?productId=${productParam}&configType=${boxParam}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setBoxDetail(data);
      })
      .catch(() => setError('Failed to load box details'))
      .finally(() => setLoading(false));
  }, [productParam, boxParam]);

  // Fetch prices for all config types when product selected
  useEffect(() => {
    if (!selectedProduct) return;
    const prices: Record<string, number | null> = {};
    Promise.all(
      selectedProduct.configTypes.map(ct =>
        fetch(`/api/scout/box-detail?productId=${selectedProduct.id}&configType=${ct}`)
          .then(r => r.json())
          .then(data => { prices[ct] = data.boxConfig?.retailPriceUsd ?? null; })
          .catch(() => { prices[ct] = null; })
      )
    ).then(() => setBoxPrices(prices));
  }, [selectedProduct]);

  // Auto-select first config type when product has configs
  useEffect(() => {
    if (productParam && selectedProduct && !boxParam) {
      const first = selectedProduct.configTypes[0];
      if (first) updateUrl({ box: first });
    }
  }, [productParam, selectedProduct, boxParam, updateUrl]);

  const stepTitles = ['Pick a Sport', 'Find Your Box', 'Box Breakdown'];

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <Header showBack />
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 20px 60px' }}>
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 36, letterSpacing: 3, color: colors.text, margin: '20px 0 4px',
        }}>
          SHELF <span style={{ color: colors.green }}>SCOUT</span>
        </h1>
        <p style={{ fontSize: 13, color: colors.muted, margin: '0 0 16px' }}>
          {currentStep === 0 && "What's in the box? Find out before you buy."}
          {currentStep === 1 && 'Pick the product you see on the shelf.'}
          {currentStep === 2 && (selectedProduct?.name || 'Box details')}
        </p>

        {/* Breadcrumb nav */}
        {currentStep > 0 && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
            <button
              onClick={() => updateUrl({ sport: sportParam, product: null, box: null })}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: colors.green }}
            >
              {sportParam}
            </button>
            {selectedProduct && (
              <>
                <span style={{ color: colors.muted, fontSize: 11 }}>/</span>
                <button
                  onClick={() => updateUrl({ product: productParam, box: null })}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: boxParam ? colors.green : colors.text }}
                >
                  {selectedProduct.name}
                </button>
              </>
            )}
          </div>
        )}

        {error && <EmptyState message={error} actionLabel="Try again" onAction={() => setError(null)} />}

        {/* Step 0: Sport */}
        {currentStep === 0 && (
          <SportPicker
            filterSports={['NBA', 'NFL', 'MLB']}
            onSelect={(sport) => updateUrl({ sport, product: null, box: null })}
          />
        )}

        {/* Step 1: Product Grid */}
        {currentStep === 1 && !productParam && (
          <>
            {products.length === 0 && !loading ? (
              <EmptyState message="No retail products found for this sport yet." />
            ) : (
              <BoxProductGrid
                products={products}
                loading={loading}
                onSelect={(p) => {
                  setSelectedProduct(p);
                  updateUrl({ product: p.id, box: null });
                }}
              />
            )}
            <BoxTypeEducation />
          </>
        )}

        {/* Step 2: Box Detail */}
        {currentStep === 2 && selectedProduct && (
          <>
            <BoxTypePicker
              configTypes={selectedProduct.configTypes}
              prices={boxPrices}
              selected={boxParam}
              onSelect={(ct) => updateUrl({ box: ct })}
            />
            {boxDetail && !loading ? (
              <BoxDetail detail={boxDetail} product={selectedProduct} />
            ) : loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: colors.muted }}>Loading...</div>
            ) : null}
            <BoxTypeEducation />
          </>
        )}
      </div>
    </div>
  );
}

export default function ScoutPage() {
  return (
    <Suspense>
      <ScoutContent />
    </Suspense>
  );
}
