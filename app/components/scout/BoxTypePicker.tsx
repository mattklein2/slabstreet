'use client';

import { useTheme } from '../ThemeProvider';
import { formatConfigType, formatPrice, BOX_TYPE_DESCRIPTIONS } from '../../../lib/format';

interface BoxTypePickerProps {
  configTypes: string[];
  prices: Record<string, number | null>;
  selected: string | null;
  onSelect: (configType: string) => void;
}

export function BoxTypePicker({ configTypes, prices, selected, onSelect }: BoxTypePickerProps) {
  const { colors } = useTheme();

  if (configTypes.length <= 1) return null;

  return (
    <div style={{ display: 'flex', gap: 8, padding: '8px 0', overflowX: 'auto' }}>
      {configTypes.map(ct => {
        const active = ct === selected;
        const desc = BOX_TYPE_DESCRIPTIONS[ct];
        return (
          <button
            key={ct}
            onClick={() => onSelect(ct)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              padding: '10px 16px',
              background: active ? colors.green + '15' : colors.surface,
              border: `1px solid ${active ? colors.green : colors.border}`,
              borderRadius: 10,
              cursor: 'pointer',
              color: active ? colors.green : colors.text,
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600 }}>
              {desc?.name || formatConfigType(ct)}
            </span>
            {prices[ct] !== undefined && (
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                color: active ? colors.green : colors.muted,
              }}>
                {formatPrice(prices[ct])}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
