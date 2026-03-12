'use client';

import { useTheme } from '../ThemeProvider';

const STORES = [
  { label: 'Walmart', value: 'Walmart' },
  { label: 'Target', value: 'Target' },
  { label: 'Amazon / Fanatics', value: 'amazon_fanatics' },
  { label: 'Local Hobby Shop', value: 'Hobby Shop' },
  { label: 'Online (any)', value: 'all' },
  { label: "I don't know yet", value: 'all' },
];

interface StorePickerProps {
  onSelect: (store: string) => void;
}

export function StorePicker({ onSelect }: StorePickerProps) {
  const { colors } = useTheme();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '12px 0' }}>
      {STORES.map((s) => (
        <button
          key={s.label}
          onClick={() => onSelect(s.value)}
          style={{
            padding: '16px', background: colors.surface,
            border: `1px solid ${colors.border}`, borderRadius: 12,
            cursor: 'pointer', color: colors.text, transition: 'border-color 0.15s',
            fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 15, fontWeight: 500, textAlign: 'left',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = colors.green)}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = colors.border)}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
