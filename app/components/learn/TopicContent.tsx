'use client';

import Link from 'next/link';
import { useTheme } from '../ThemeProvider';
import type { TopicDetail } from '../../../lib/types';

interface TopicContentProps {
  topic: TopicDetail;
}

export function TopicContent({ topic }: TopicContentProps) {
  const { colors } = useTheme();

  const renderInline = (text: string): React.ReactNode => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ color: colors.text, fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const renderMarkdown = (md: string) => {
    const lines = md.split('\n');
    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i].trim();

      if (line.startsWith('## ')) {
        elements.push(<h2 key={i} style={{ fontSize: 20, fontWeight: 600, color: colors.text, margin: '24px 0 8px' }}>{line.slice(3)}</h2>);
      } else if (line.startsWith('### ')) {
        elements.push(<h3 key={i} style={{ fontSize: 16, fontWeight: 600, color: colors.text, margin: '20px 0 6px' }}>{line.slice(4)}</h3>);
      } else if (line.startsWith('- ')) {
        const items: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('- ')) {
          items.push(lines[i].trim().slice(2));
          i++;
        }
        elements.push(
          <ul key={`ul-${i}`} style={{ paddingLeft: 20, margin: '8px 0', color: colors.secondary, fontSize: 14, lineHeight: 1.8 }}>
            {items.map((item, j) => <li key={j}>{renderInline(item)}</li>)}
          </ul>
        );
        continue;
      } else if (line.length > 0) {
        elements.push(<p key={i} style={{ color: colors.secondary, fontSize: 14, lineHeight: 1.8, margin: '8px 0' }}>{renderInline(line)}</p>);
      }
      i++;
    }
    return elements;
  };

  return (
    <div>
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
        color: colors.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8,
      }}>
        {topic.category}
      </div>

      <h1 style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 32, letterSpacing: 2, color: colors.text, margin: '0 0 20px',
      }}>
        {topic.title}
      </h1>

      <div>{renderMarkdown(topic.body)}</div>

      {topic.relatedProductNames.length > 0 && (
        <div style={{ marginTop: 32, padding: '16px', background: colors.surface, borderRadius: 12, border: `1px solid ${colors.border}` }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: colors.muted, marginBottom: 8 }}>RELATED PRODUCTS</div>
          <div style={{ fontSize: 14, color: colors.text }}>{topic.relatedProductNames.join(' · ')}</div>
        </div>
      )}

      {topic.relatedTopicSlugs.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: colors.muted, marginBottom: 8 }}>KEEP READING</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {topic.relatedTopicSlugs.map((slug) => (
              <Link key={slug} href={`/learn/${slug}`}
                style={{
                  padding: '6px 12px', background: colors.surface,
                  border: `1px solid ${colors.border}`, borderRadius: 8,
                  color: colors.green, fontSize: 13, textDecoration: 'none',
                }}
              >
                {slug.replace(/-/g, ' ')}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
