'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '../components/shared/Header';
import { SportPicker } from '../components/shared/SportPicker';
import { StepIndicator } from '../components/shared/StepIndicator';
import { EmptyState } from '../components/shared/EmptyState';
import { Skeleton } from '../components/shared/Skeleton';
import { BudgetPicker } from '../components/guide/BudgetPicker';
import { StorePicker } from '../components/guide/StorePicker';
import { BoxCard } from '../components/guide/BoxCard';
import { useTheme } from '../components/ThemeProvider';
import type { SportValue, BoxResult } from '../../lib/types';

function GuideContent() {
  const { colors } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();

  const sportParam = searchParams.get('sport') as SportValue | null;
  const budgetParam = searchParams.get('budget');
  const storeParam = searchParams.get('store');

  const [results, setResults] = useState<BoxResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentStep = storeParam ? 3 : budgetParam ? 2 : sportParam ? 1 : 0;

  const breadcrumbs: string[] = [];
  if (sportParam) breadcrumbs.push(sportParam);
  if (budgetParam) breadcrumbs.push(budgetParam === 'all' ? 'Any budget' : `$${budgetParam.replace('-', '–')}`);
  if (storeParam) breadcrumbs.push(storeParam === 'all' ? 'Any store' : storeParam);

  const updateUrl = useCallback((params: Record<string, string | null>) => {
    const sp = new URLSearchParams(searchParams.toString());
    for (const [key, val] of Object.entries(params)) {
      if (val === null) sp.delete(key);
      else sp.set(key, val);
    }
    router.push(`/guide?${sp.toString()}`, { scroll: false });
  }, [router, searchParams]);

  useEffect(() => {
    if (!sportParam || !budgetParam || !storeParam) return;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({ sport: sportParam, store: storeParam });
    if (budgetParam !== 'all') {
      const [min, max] = budgetParam.split('-');
      params.set('budgetMin', min);
      params.set('budgetMax', max);
    }

    fetch(`/api/guide/recommend?${params}`)
      .then(r => r.json())
      .then(data => setResults(data.results || []))
      .catch(() => setError('Failed to load recommendations'))
      .finally(() => setLoading(false));
  }, [sportParam, budgetParam, storeParam]);

  const stepTitles = ['Pick a Sport', "What's Your Budget?", 'Where Are You Shopping?', 'Your Best Options'];
  const resetFilters = () => updateUrl({ sport: sportParam, budget: null, store: null });

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <Header showBack />
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 20px 40px' }}>
        <StepIndicator totalSteps={4} currentStep={currentStep} breadcrumbs={breadcrumbs}
          onBreadcrumbClick={(i) => {
            if (i === 0) updateUrl({ sport: sportParam, budget: null, store: null });
            else if (i === 1) updateUrl({ budget: budgetParam, store: null });
          }}
        />
        <h2 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 28, letterSpacing: 2, color: colors.text, margin: '16px 0 8px',
        }}>
          {stepTitles[currentStep]}
        </h2>

        {error && <EmptyState message={error} actionLabel="Try again" onAction={() => setError(null)} />}

        {currentStep === 0 && <SportPicker onSelect={(sport) => updateUrl({ sport, budget: null, store: null })} />}
        {currentStep === 1 && <BudgetPicker onSelect={(budget) => updateUrl({ budget, store: null })} />}
        {currentStep === 2 && <StorePicker onSelect={(store) => updateUrl({ store })} />}

        {currentStep === 3 && (
          <>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {Array.from({ length: 3 }, (_, i) => (<Skeleton key={i} height={200} borderRadius={14} />))}
              </div>
            ) : results.length === 0 ? (
              <EmptyState message="No boxes match your filters. Try a different budget or store." actionLabel="Reset filters" onAction={resetFilters} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {results.map((r, i) => (<BoxCard key={`${r.product.id}-${r.boxConfig.id}-${i}`} result={r} />))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function GuidePage() {
  return (<Suspense><GuideContent /></Suspense>);
}
