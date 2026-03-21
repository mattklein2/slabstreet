'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../ThemeProvider';
import { CardIdentitySection } from './CardIdentitySection';
import { RarityRainbow } from './RarityRainbow';
import { CardInsights } from './CardInsights';
import { PriceContext } from './PriceContext';
import { PopReport } from './PopReport';
import { GradingROI } from './GradingROI';
import { ShareButton } from './ShareButton';
import type { XRayResult } from '../../../lib/xray/types';
import type { PSAPopSummary } from '../../../lib/psa/types';

export function XRayResultDisplay({ result }: { result: XRayResult }) {
  const { colors } = useTheme();
  const [selectedParallelId, setSelectedParallelId] = useState<string | null>(null);
  const [overrideParallelDesc, setOverrideParallelDesc] = useState<string | null>(null);
  const [popData, setPopData] = useState<PSAPopSummary | null>(null);
  const [popLoading, setPopLoading] = useState(false);

  // Fetch PSA pop data async (non-blocking, after main result renders)
  useEffect(() => {
    const { identity } = result;
    if (!identity.player || !identity.year || !identity.brand) return;

    setPopLoading(true);
    const params = new URLSearchParams();
    if (identity.certNumber) params.set('cert', identity.certNumber);
    if (identity.player) params.set('player', identity.player);
    if (identity.year) params.set('year', identity.year);
    if (identity.brand) params.set('brand', identity.brand);
    if (identity.set) params.set('set', identity.set);

    fetch(`/api/psa/pop?${params}`)
      .then(res => res.json())
      .then(data => setPopData(data.pop || null))
      .catch(() => setPopData(null))
      .finally(() => setPopLoading(false));
  }, [result]);

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

  // Derive active matched parallel when user clicks a different one in the rainbow
  const activeParallel = selectedParallelId
    ? (() => {
        const entry = result.rainbow.find(r => r.parallelId === selectedParallelId);
        if (!entry) return result.matchedParallel;
        return {
          parallelId: entry.parallelId,
          parallelName: entry.name,
          colorHex: entry.colorHex,
          printRun: entry.printRun,
          serialNumbered: entry.serialNumbered,
          rarityRank: entry.rarityRank,
          isOneOfOne: entry.isOneOfOne,
          description: entry.description || '',
          boxExclusivity: entry.boxExclusivity,
        };
      })()
    : result.matchedParallel;

  const canSelectParallel = result.rainbow.length > 0 && result.status !== 'unmatched';
  const isInsert = result.matchedCardSet?.type === 'insert' || result.matchedCardSet?.type === 'subset';
  const isInsertFallback = isInsert && result.rainbow.length > 0 && !result.rainbow.some(r => r.isCurrentCard);

  const handleParallelSelect = useCallback((parallelId: string) => {
    const currentEntry = result.rainbow.find(r => r.isCurrentCard);
    if (currentEntry?.parallelId === parallelId && !selectedParallelId) return;
    if (selectedParallelId === parallelId) return;

    setSelectedParallelId(parallelId);
    const selectedEntry = result.rainbow.find(r => r.parallelId === parallelId);
    setOverrideParallelDesc(selectedEntry?.description ?? null);
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

      {/* Top row: Card Identity (left) + Card Insights (right) */}
      <div style={{
        display: 'flex',
        gap: 16,
        marginBottom: 16,
        alignItems: 'stretch',
        flexWrap: 'wrap',
      }}>
        <div style={{ flex: '1 1 340px', minWidth: 0 }}>
          <CardIdentitySection identity={result.identity} listing={result.listing} />
        </div>
        <div style={{ flex: '1 1 300px', minWidth: 0 }}>
          <CardInsights
            identity={result.identity}
            product={result.product}
            matchedParallel={activeParallel}
            matchedCardSet={result.matchedCardSet}
            rainbow={activeRainbow}
            education={activeEducation}
          />
        </div>
      </div>

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
      <PriceContext priceComps={result.priceComps} />

      {/* Section 4: PSA Population Report */}
      <PopReport
        popData={popData}
        currentGrade={result.identity.grade}
        loading={popLoading}
      />

      {/* Section 5: Grading ROI Calculator */}
      <GradingROI
        priceComps={result.priceComps}
        popData={popData}
      />

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
