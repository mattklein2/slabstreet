'use client';

import { useTheme } from '../ThemeProvider';

interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ message, actionLabel, onAction }: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 16,
      padding: '48px 20px',
      color: colors.muted,
      fontSize: 15,
      textAlign: 'center',
      fontFamily: "'IBM Plex Sans', sans-serif",
    }}>
      <p>{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          style={{
            padding: '8px 20px',
            background: 'none',
            border: `1px solid ${colors.green}`,
            borderRadius: 8,
            color: colors.green,
            cursor: 'pointer',
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: 14,
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
