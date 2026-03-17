// app/components/xray/CardIdentitySection.tsx
'use client';

import { useTheme } from '../ThemeProvider';
import type { CardIdentity, EbayListingData } from '../../../lib/xray/types';

interface Props {
  identity: CardIdentity;
  listing: EbayListingData;
}

export function CardIdentitySection({ identity, listing }: Props) {
  const { colors } = useTheme();

  const fields: { label: string; value: string | null; highlight?: boolean }[] = [
    { label: 'Player', value: identity.player },
    { label: 'Year', value: identity.year },
    { label: 'Set', value: [identity.brand, identity.set].filter(Boolean).join(' ') || null },
    { label: 'Parallel', value: identity.parallel || 'Base' },
    { label: 'Insert', value: identity.insert || null },
    { label: 'Card #', value: identity.cardNumber ? `#${identity.cardNumber}` : null },
    { label: 'Rookie', value: identity.isRookie ? 'Yes' : null },
    {
      label: 'Grade',
      value: identity.isGraded
        ? `${identity.grader || '?'} ${identity.grade || '?'}`
        : 'Raw (ungraded)',
    },
  ];

  return (
    <section style={{
      background: colors.surface,
      borderRadius: 14,
      padding: 24,
      height: '100%',
      boxSizing: 'border-box' as const,
    }}>
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Card image */}
        {listing.imageUrl && (
          <img
            src={listing.imageUrl}
            alt={listing.title}
            style={{
              width: 140,
              height: 'auto',
              borderRadius: 10,
              border: `1px solid ${colors.border}`,
            }}
          />
        )}

        {/* Identity fields */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <h2 style={{
            margin: '0 0 16px',
            fontSize: 14,
            fontFamily: "'IBM Plex Mono', monospace",
            fontWeight: 600,
            letterSpacing: 1,
            color: colors.green,
            textTransform: 'uppercase',
          }}>
            Card Identity
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {fields.filter(f => f.value).map(field => (
              <div key={field.label} style={{ display: 'flex', gap: 12 }}>
                <span style={{
                  width: 80,
                  fontSize: 12,
                  fontFamily: "'IBM Plex Mono', monospace",
                  color: colors.muted,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  flexShrink: 0,
                  paddingTop: 2,
                }}>
                  {field.label}
                </span>
                <span style={{
                  fontSize: 15,
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  color: colors.text,
                  fontWeight: 500,
                }}>
                  {field.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
