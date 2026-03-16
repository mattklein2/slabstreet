'use client';

import { Header } from '../../../components/shared/Header';
import { useTheme } from '../../../components/ThemeProvider';
import { XRayResultDisplay } from '../../../components/xray/XRayResultDisplay';
import { XRayResultSchema } from '../../../components/StructuredData';
import type { XRayResult } from '../../../../lib/xray/types';

export default function XRayResultPage({ result, id }: { result: XRayResult; id: string }) {
  const { colors } = useTheme();

  // Attach resultId for ShareButton
  const resultWithId: XRayResult = { ...result, resultId: id };

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
          {result.identity.player
            ? `Analysis of ${result.identity.player}`
            : 'Card analysis result'}
        </p>

        <XRayResultDisplay result={resultWithId} />
      </main>

      <XRayResultSchema
        result={result}
        url={`https://slabstreet.com/xray/result/${id}`}
      />
    </div>
  );
}
