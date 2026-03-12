'use client';

import { useTheme } from '../ThemeProvider';

const BUDGETS = [
  { label: 'Under $25', value: '0-25', sub: 'Packs, hangers' },
  { label: '$25–$50', value: '25-50', sub: 'Blasters' },
  { label: '$50–$100', value: '50-100', sub: 'Megas, hobby lite' },
  { label: '$100–$250', value: '100-250', sub: 'Hobby boxes' },
  { label: '$250+', value: '250-9999', sub: 'Premium hobby' },
  { label: 'Show Everything', value: 'all', sub: 'No budget filter' },
];

interface BudgetPickerProps {
  onSelect: (budget: string) => void;
}

export function BudgetPicker({ onSelect }: BudgetPickerProps) {
  const { colors } = useTheme();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '12px 0' }}>
      {BUDGETS.map((b) => (
        <button
          key={b.value}
          onClick={() => onSelect(b.value)}
          style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '16px', background: colors.surface,
            border: `1px solid ${colors.border}`, borderRadius: 12,
            cursor: 'pointer', color: colors.text, transition: 'border-color 0.15s',
            fontFamily: "'IBM Plex Sans', sans-serif", textAlign: 'left',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = colors.green)}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = colors.border)}
        >
          <span style={{ fontSize: 15, fontWeight: 500 }}>{b.label}</span>
          <span style={{ fontSize: 12, color: colors.muted }}>{b.sub}</span>
        </button>
      ))}
    </div>
  );
}
