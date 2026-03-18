'use client';

import { useTheme } from '../ThemeProvider';
import { SPORTS, type SportValue } from '../../../lib/types';

interface SportPickerProps {
  onSelect: (sport: SportValue) => void;
  filterSports?: SportValue[];
}

export function SportPicker({ onSelect, filterSports }: SportPickerProps) {
  const { colors } = useTheme();
  const sports = filterSports ? SPORTS.filter(s => filterSports.includes(s.value)) : SPORTS;

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 16,
      padding: '20px 0',
      maxWidth: 480,
      margin: '0 auto',
    }}>
      {sports.map((sport) => (
        <button
          key={sport.value}
          onClick={() => onSelect(sport.value)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            padding: '24px 16px',
            width: 'calc(33.333% - 12px)',
            minWidth: 120,
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: 16,
            cursor: 'pointer',
            transition: 'border-color 0.15s',
            color: colors.text,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = colors.green)}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = colors.border)}
        >
          <span style={{ fontSize: 32 }}>{sport.icon}</span>
          <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, fontWeight: 500 }}>
            {sport.label}
          </span>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: colors.muted }}>
            {sport.value}
          </span>
        </button>
      ))}
    </div>
  );
}
