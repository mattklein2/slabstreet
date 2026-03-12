'use client';

import { useState } from 'react';
import { useTheme } from '../ThemeProvider';

interface ExpandableSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function ExpandableSection({ title, children, defaultOpen = false }: ExpandableSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const { colors } = useTheme();

  return (
    <div style={{ borderTop: `1px solid ${colors.border}`, marginTop: 12 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: '100%',
          padding: '12px 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: colors.green,
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: 14,
          fontWeight: 500,
          textAlign: 'left',
        }}
      >
        <span style={{
          display: 'inline-block',
          transition: 'transform 0.15s',
          transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
          fontSize: 10,
        }}>
          ▶
        </span>
        {title}
      </button>
      {open && (
        <div style={{ padding: '0 0 12px 18px', color: colors.secondary, fontSize: 14, lineHeight: 1.7 }}>
          {children}
        </div>
      )}
    </div>
  );
}
