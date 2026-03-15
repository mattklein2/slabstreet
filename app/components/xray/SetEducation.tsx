// app/components/xray/SetEducation.tsx
'use client';

import { useTheme } from '../ThemeProvider';

interface Props {
  education: {
    setDescription: string | null;
    parallelDescription: string | null;
    flagshipContext: string | null;
  };
  productName: string | null;
}

export function SetEducation({ education, productName }: Props) {
  const { colors } = useTheme();

  const hasContent = education.setDescription || education.parallelDescription || education.flagshipContext;
  if (!hasContent) return null;

  return (
    <section style={{
      background: colors.surface,
      borderRadius: 14,
      padding: 24,
      marginBottom: 16,
    }}>
      <h2 style={{
        margin: '0 0 16px',
        fontSize: 14,
        fontFamily: "'IBM Plex Mono', monospace",
        fontWeight: 600,
        letterSpacing: 1,
        color: colors.green,
        textTransform: 'uppercase',
      }}>
        {productName ? `About ${productName}` : 'Set Education'}
      </h2>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        fontSize: 14,
        fontFamily: "'IBM Plex Sans', sans-serif",
        color: colors.secondary,
        lineHeight: 1.6,
      }}>
        {education.flagshipContext && (
          <p style={{ margin: 0, color: colors.amber }}>
            {education.flagshipContext}
          </p>
        )}
        {education.setDescription && (
          <p style={{ margin: 0 }}>
            {education.setDescription}
          </p>
        )}
        {education.parallelDescription && (
          <p style={{ margin: 0 }}>
            {education.parallelDescription}
          </p>
        )}
      </div>
    </section>
  );
}
