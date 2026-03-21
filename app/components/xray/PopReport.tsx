'use client';

import { useTheme } from '../ThemeProvider';
import type { PSAPopSummary } from '../../../lib/psa/types';

interface Props {
  popData: PSAPopSummary | null;
  currentGrade?: string | null;
  loading?: boolean;
}

export function PopReport({ popData, currentGrade, loading }: Props) {
  const { colors } = useTheme();

  if (loading) {
    return (
      <section style={{ background: colors.surface, borderRadius: 14, padding: 24, marginBottom: 16 }}>
        <h2 style={{
          margin: 0, fontSize: 14, fontFamily: "'IBM Plex Mono', monospace",
          fontWeight: 600, letterSpacing: 1, color: colors.green, textTransform: 'uppercase',
        }}>
          PSA Population
        </h2>
        <p style={{ marginTop: 12, fontSize: 14, color: colors.muted, fontFamily: "'IBM Plex Mono', monospace" }}>
          Looking up population data...
        </p>
      </section>
    );
  }

  if (!popData) return null;

  const maxCount = Math.max(...popData.grades.map(g => g.count), 1);

  return (
    <section style={{ background: colors.surface, borderRadius: 14, padding: 24, marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
        <h2 style={{
          margin: 0, fontSize: 14, fontFamily: "'IBM Plex Mono', monospace",
          fontWeight: 600, letterSpacing: 1, color: colors.green, textTransform: 'uppercase',
        }}>
          PSA Population
        </h2>
        <span style={{
          fontSize: 13, fontFamily: "'IBM Plex Mono', monospace",
          color: colors.muted,
        }}>
          {popData.totalGraded.toLocaleString()} total graded
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {popData.grades.map(entry => {
          const isCurrentGrade = currentGrade && entry.grade === currentGrade;
          const barWidth = Math.max((entry.count / maxCount) * 100, 2);
          const barColor = isCurrentGrade ? colors.green : colors.cyan;

          return (
            <div key={entry.grade} style={{
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{
                fontSize: 12, fontFamily: "'IBM Plex Mono', monospace",
                fontWeight: isCurrentGrade ? 700 : 500,
                color: isCurrentGrade ? colors.green : colors.secondary,
                minWidth: 32, textAlign: 'right',
              }}>
                {entry.grade}
              </span>

              <div style={{
                flex: 1, height: 18, borderRadius: 4,
                background: `${colors.border}60`, overflow: 'hidden',
                position: 'relative',
              }}>
                <div style={{
                  width: `${barWidth}%`, height: '100%', borderRadius: 4,
                  background: isCurrentGrade ? `${barColor}40` : `${barColor}30`,
                  border: isCurrentGrade ? `1px solid ${barColor}60` : 'none',
                  transition: 'width 0.3s ease',
                }} />
              </div>

              <span style={{
                fontSize: 12, fontFamily: "'IBM Plex Mono', monospace",
                fontWeight: isCurrentGrade ? 700 : 400,
                color: isCurrentGrade ? colors.green : colors.muted,
                minWidth: 60, textAlign: 'right',
              }}>
                {entry.count.toLocaleString()}
              </span>

              <span style={{
                fontSize: 11, fontFamily: "'IBM Plex Mono', monospace",
                color: colors.muted, minWidth: 42, textAlign: 'right',
              }}>
                {entry.pct}%
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
