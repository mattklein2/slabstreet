'use client';

import Link from 'next/link';
import { useTheme } from '../ThemeProvider';
import type { TopicItem } from '../../../lib/types';

interface TopicCardProps {
  topic: TopicItem;
}

export function TopicCard({ topic }: TopicCardProps) {
  const { colors } = useTheme();

  return (
    <Link href={`/learn/${topic.slug}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: 12, padding: '20px 16px',
        cursor: 'pointer', transition: 'border-color 0.15s', height: '100%',
      }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = colors.green)}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = colors.border)}
      >
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
          color: colors.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6,
        }}>
          {topic.category}
        </div>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: colors.text, margin: '0 0 6px' }}>{topic.title}</h3>
        <p style={{ fontSize: 13, color: colors.secondary, lineHeight: 1.5, margin: 0 }}>{topic.summary}</p>
      </div>
    </Link>
  );
}
