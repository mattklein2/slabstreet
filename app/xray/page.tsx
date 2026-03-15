// app/xray/page.tsx
'use client';

import { useState } from 'react';
import { Header } from '../components/shared/Header';
import { useTheme } from '../components/ThemeProvider';
import { XRayInput } from '../components/xray/XRayInput';
import { CardIdentitySection } from '../components/xray/CardIdentitySection';
import { RarityRainbow } from '../components/xray/RarityRainbow';
import { PriceContext } from '../components/xray/PriceContext';
import { SetEducation } from '../components/xray/SetEducation';
import type { XRayResult, XRayError } from '../../lib/xray/types';

export default function XRayPage() {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<XRayResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (url: string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/xray', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError((data as XRayError).error || 'Something went wrong');
        return;
      }

      setResult(data as XRayResult);
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.bg,
      color: colors.text,
    }}>
      <Header showBack />

      <main style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: '24px 16px 80px',
      }}>
        {/* Title */}
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 36,
          letterSpacing: 3,
          color: colors.text,
          margin: '0 0 4px',
        }}>
          CARD X-RAY
        </h1>
        <p style={{
          fontSize: 15,
          fontFamily: "'IBM Plex Sans', sans-serif",
          color: colors.muted,
          margin: '0 0 24px',
        }}>
          Paste any eBay listing to see exactly what you're looking at.
        </p>

        {/* Input */}
        <XRayInput onSubmit={handleSubmit} loading={loading} />

        {/* Loading state */}
        {loading && (
          <div style={{
            textAlign: 'center',
            padding: '48px 0',
            color: colors.muted,
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 14,
          }}>
            Analyzing listing...
          </div>
        )}

        {/* Error state */}
        {error && (
          <div style={{
            padding: 20,
            borderRadius: 14,
            background: `${colors.red}15`,
            border: `1px solid ${colors.red}40`,
            color: colors.red,
            fontSize: 14,
            fontFamily: "'IBM Plex Sans', sans-serif",
            marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
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
                We couldn't match this card in our database yet. Showing what we could extract from the listing.
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
                We found the set but couldn't match the specific parallel. The rainbow below shows all parallels in this set.
              </div>
            )}

            {/* Section 1: Card Identity */}
            <CardIdentitySection identity={result.identity} listing={result.listing} />

            {/* Section 2: Rarity Rainbow */}
            <RarityRainbow
              rainbow={result.rainbow}
              product={result.product}
              cardSetName={result.matchedCardSet?.cardSetName}
              cardSetType={result.matchedCardSet?.type}
            />

            {/* Section 4: Price Context */}
            <PriceContext priceComps={result.priceComps} />

            {/* Section 5: Set Education */}
            <SetEducation
              education={result.education}
              productName={result.product?.productName || null}
            />

            {/* Source link */}
            <div style={{
              textAlign: 'center',
              marginTop: 24,
            }}>
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
        )}
      </main>
    </div>
  );
}
