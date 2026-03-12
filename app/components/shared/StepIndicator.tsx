'use client';

import { useTheme } from '../ThemeProvider';

interface StepIndicatorProps {
  totalSteps: number;
  currentStep: number;
  breadcrumbs: string[];
  onBreadcrumbClick: (stepIndex: number) => void;
}

export function StepIndicator({ totalSteps, currentStep, breadcrumbs, onBreadcrumbClick }: StepIndicatorProps) {
  const { colors } = useTheme();

  return (
    <div style={{ padding: '8px 0' }}>
      {/* Dots */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 8 }}>
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: i <= currentStep ? colors.green : colors.border,
              transition: 'background 0.2s',
            }}
          />
        ))}
      </div>
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <div style={{
          display: 'flex',
          gap: 4,
          justifyContent: 'center',
          flexWrap: 'wrap',
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 12,
          color: colors.muted,
        }}>
          {breadcrumbs.map((crumb, i) => (
            <span key={i}>
              {i > 0 && <span style={{ margin: '0 4px' }}>›</span>}
              <button
                onClick={() => onBreadcrumbClick(i)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: i < currentStep ? colors.green : colors.text,
                  cursor: i < currentStep ? 'pointer' : 'default',
                  fontFamily: 'inherit',
                  fontSize: 'inherit',
                  padding: 0,
                  textDecoration: i < currentStep ? 'underline' : 'none',
                }}
              >
                {crumb}
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
