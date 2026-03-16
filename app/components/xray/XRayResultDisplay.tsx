'use client';

import { useState, useRef, useCallback } from 'react';
import { useTheme } from '../ThemeProvider';
import { CardIdentitySection } from './CardIdentitySection';
import { RarityRainbow } from './RarityRainbow';
import { PriceContext } from './PriceContext';
import { SetEducation } from './SetEducation';
import { ShareButton } from './ShareButton';
import type { XRayResult, PriceComps } from '../../../lib/xray/types';

export function XRayResultDisplay({ result }: { result: XRayResult }) {
  const { colors } = useTheme();
  const [selectedParallelId, setSelectedParallelId] = useState<string | null>(null);
  const [overridePriceComps, setOverridePriceComps] = useState<PriceComps | null>(null);
  const [overrideParallelDesc, setOverrideParallelDesc] = useState<string | null>(null);
  const [compsLoading, setCompsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Derive active rainbow with updated isCurrentCard
  const activeRainbow = selectedParallelId
    ? result.rainbow.map(entry => ({
        ...entry,
        isCurrentCard: entry.parallelId === selectedParallelId,
      }))
    : result.rainbow;

  // Derive active education with swapped parallelDescription
  const activeEducation = overrideParallelDesc !== null
    ? { ...result.education, parallelDescription: overrideParallelDesc }
    : result.education;

  // Derive active price comps
  const activePriceComps = overridePriceComps !== undefined && selectedParallelId
    ? overridePriceComps
    : result.priceComps;

  const canSelectParallel = result.rainbow.length > 0 && result.status !== 'unmatched';
  const isInsert = result.matchedCardSet?.type === 'insert' || result.matchedCardSet?.type === 'subset';
  const isInsertFallback = isInsert && result.rainbow.length > 0 && !result.rainbow.some(r => r.isCurrentCard);

  const handleParallelSelect = useCallback((parallelId: string) => {
    // Skip if already selected
    const currentEntry = result.rainbow.find(r => r.isCurrentCard);
    if (currentEntry?.parallelId === parallelId && !selectedParallelId) return;
    if (selectedParallelId === parallelId) return;

    // Instant UI update
    setSelectedParallelId(parallelId);
    const selectedEntry = result.rainbow.find(r => r.parallelId === parallelId);
    setOverrideParallelDesc(selectedEntry?.description ?? null);

    // Abort previous fetch
    if (abortRef.current) abortRef.current.abort();

    // Only fetch comps if we have a resultId
    if (!result.resultId) return;

    const controller = new AbortController();
    abortRef.current = controller;
    setCompsLoading(true);
    setOverridePriceComps(null);

    fetch(`/api/xray/comps?resultId=${result.resultId}&parallelId=${parallelId}`, {
      signal: controller.signal,
    })
      .then(res => res.json())
      .then(data => {
        if (!controller.signal.aborted) {
          setOverridePriceComps(data.priceComps ?? null);
          setCompsLoading(false);
        }
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          setCompsLoading(false);
        }
      });
  }, [result, selectedParallelId]);

  return (
    <>
      {/* Match status banner */}
      {result.status === 'unmatched' && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 10,
          background: `${colors.amber}15`,
          border: `1px solid ${colors.amber}40`,
          color: colors.amber,
          fontSize: 13,
          fontFamily: "'IBM Plex Sans', sans-serif",
          marginBottom: 16,
        }}>
          We couldn&apos;t match this card in our database yet. Showing what we could extract from the listing.
        </div>
      )}

      {result.status === 'partial' && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 10,
          background: `${colors.amber}15`,
          border: `1px solid ${colors.amber}40`,
          color: colors.amber,
          fontSize: 13,
          fontFamily: "'IBM Plex Sans', sans-serif",
          marginBottom: 16,
        }}>
          We found the set but couldn&apos;t match the specific parallel. The rainbow below shows all parallels in this set.
        </div>
      )}

      {/* Section 1: Card Identity */}
      <CardIdentitySection identity={result.identity} listing={result.listing} />

      {/* Section 2: Rarity Rainbow */}
      <RarityRainbow
        rainbow={activeRainbow}
        product={result.product}
        cardSetName={result.matchedCardSet?.cardSetName}
        cardSetType={result.matchedCardSet?.type}
        cardSetOdds={result.matchedCardSet?.odds}
        cardSetDescription={result.matchedCardSet?.description}
        isInsertFallback={isInsertFallback}
        onParallelSelect={canSelectParallel && !isInsertFallback ? handleParallelSelect : undefined}
      />

      {/* Section 3: Price Context */}
      <PriceContext priceComps={activePriceComps} loading={compsLoading} />

      {/* Section 4: Set Education */}
      <SetEducation
        education={activeEducation}
        productName={result.product?.productName || null}
      />

      {/* Disclaimer */}
      <div style={{
        padding: '12px 16px',
        borderRadius: 10,
        background: `${colors.border}30`,
        border: `1px solid ${colors.border}`,
        marginTop: 20,
      }}>
        <p style={{
          margin: 0,
          fontSize: 12,
          fontFamily: "'IBM Plex Sans', sans-serif",
          color: colors.muted,
          lineHeight: 1.5,
        }}>
          Our analysis is only as good as the seller&apos;s listing. If the title, item specifics, or photos are inaccurate, our results may be too. That said, based on what the seller has provided, this is the best identification and pricing data available.
        </p>
      </div>

      {/* Share + Source link */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        marginTop: 16,
      }}>
        {result.resultId && <ShareButton resultId={result.resultId} />}
        <a
          href={result.listing.itemUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 13,
            fontFamily: "'IBM Plex Mono', monospace",
            color: colors.cyan,
            textDecoration: 'none',
          }}
        >
          View original listing on eBay
        </a>
      </div>
    </>
  );
}
