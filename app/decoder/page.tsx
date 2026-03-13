'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '../components/shared/Header';
import { SportPicker } from '../components/shared/SportPicker';
import { StepIndicator } from '../components/shared/StepIndicator';
import { EmptyState } from '../components/shared/EmptyState';
import { ProductGrid } from '../components/decoder/ProductGrid';
import { ParallelList } from '../components/decoder/ParallelList';
import { DecoderResult } from '../components/decoder/DecoderResult';
import { useTheme } from '../components/ThemeProvider';
import type { SportValue, ProductItem, ParallelItem } from '../../lib/types';

function DecoderContent() {
  const { colors } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();

  const sportParam = searchParams.get('sport') as SportValue | null;
  const productParam = searchParams.get('product');
  const parallelParam = searchParams.get('parallel');

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [parallels, setParallels] = useState<ParallelItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [selectedParallel, setSelectedParallel] = useState<ParallelItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentStep = parallelParam ? 3 : productParam ? 2 : sportParam ? 1 : 0;

  const breadcrumbs: string[] = [];
  if (sportParam) breadcrumbs.push(sportParam);
  if (selectedProduct) breadcrumbs.push(`${selectedProduct.name} ${selectedProduct.year}`);
  if (selectedParallel) breadcrumbs.push(selectedParallel.name);

  const updateUrl = useCallback((params: Record<string, string | null>) => {
    const sp = new URLSearchParams(searchParams.toString());
    for (const [key, val] of Object.entries(params)) {
      if (val === null) sp.delete(key);
      else sp.set(key, val);
    }
    router.push(`/decoder?${sp.toString()}`, { scroll: false });
  }, [router, searchParams]);

  useEffect(() => {
    if (!sportParam) return;
    setLoading(true);
    setError(null);
    fetch(`/api/decoder/products?sport=${sportParam}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        setProducts(data.products || []);
        if (productParam) {
          const found = (data.products || []).find((p: ProductItem) => p.id === productParam);
          if (found) setSelectedProduct(found);
        }
      })
      .catch(() => setError('Failed to load products'))
      .finally(() => setLoading(false));
  }, [sportParam, productParam]);

  useEffect(() => {
    if (!productParam) return;
    setLoading(true);
    setError(null);
    fetch(`/api/decoder/parallels?productId=${productParam}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        setParallels(data.parallels || []);
        if (parallelParam) {
          const found = (data.parallels || []).find((p: ParallelItem) => p.id === parallelParam);
          if (found) setSelectedParallel(found);
        }
      })
      .catch(() => setError('Failed to load parallels'))
      .finally(() => setLoading(false));
  }, [productParam, parallelParam]);

  const stepTitles = ['Pick a Sport', 'Pick a Product', 'Match Your Card', 'Your Card'];

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <Header showBack />
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '0 20px 40px' }}>
        <StepIndicator
          totalSteps={4}
          currentStep={currentStep}
          breadcrumbs={breadcrumbs}
          onBreadcrumbClick={(i) => {
            if (i === 0) updateUrl({ sport: sportParam, product: null, parallel: null });
            else if (i === 1) updateUrl({ product: productParam, parallel: null });
          }}
        />
        <h2 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 28, letterSpacing: 2, color: colors.text, margin: '16px 0 8px',
        }}>
          {stepTitles[currentStep]}
        </h2>

        {error && <EmptyState message={error} actionLabel="Try again" onAction={() => setError(null)} />}

        {currentStep === 0 && (
          <SportPicker onSelect={(sport) => updateUrl({ sport, product: null, parallel: null })} />
        )}

        {currentStep === 1 && (
          <ProductGrid products={products} loading={loading}
            onSelect={(product) => { setSelectedProduct(product); updateUrl({ product: product.id, parallel: null }); }}
          />
        )}

        {currentStep === 2 && !parallelParam && (
          <>
            {parallels.length === 0 && !loading ? (
              <EmptyState message="No parallel data for this product yet." />
            ) : (
              <ParallelList parallels={parallels} loading={loading}
                onSelect={(parallel) => { setSelectedParallel(parallel); updateUrl({ parallel: parallel.id }); }}
              />
            )}
          </>
        )}

        {currentStep === 3 && selectedParallel && selectedProduct && (
          <DecoderResult
            parallel={selectedParallel} allParallels={parallels}
            productName={selectedProduct.name} productYear={selectedProduct.year}
          />
        )}
      </div>
    </div>
  );
}

export default function DecoderPage() {
  return (
    <Suspense>
      <DecoderContent />
    </Suspense>
  );
}
