'use client';

import { useState, useEffect } from 'react';
import { useTheme } from './ThemeProvider';

type NewsItem = {
  headline: string;
  source: string;
  url: string;
  category: string;
  time: string;
};

const CATEGORY_CONFIG: Record<string, { color: string; colorKey: keyof ReturnType<typeof useColors> }> = {};

function useColors() {
  const { colors } = useTheme();
  return colors;
}

export default function HomeNews() {
  const { colors: c } = useTheme();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    setIsMobile(mq.matches);
    function onChange(e: MediaQueryListEvent) { setIsMobile(e.matches); }
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    fetch('/api/news/cards')
      .then(r => r.json())
      .then(d => { setNews(d.news || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function getCategoryColor(cat: string): string {
    switch (cat) {
      case 'RELEASE': return c.green;
      case 'SALE':    return c.amber;
      case 'GRADING': return c.cyan;
      case 'MARKET':  return c.purple;
      case 'BREAKS':  return c.orange;
      default:        return c.muted;
    }
  }

  if (loading) {
    return (
      <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: c.muted, textAlign: 'center', padding: 40 }}>
        Loading card market news...
      </div>
    );
  }

  if (news.length === 0) return null;

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 14, flexWrap: 'wrap', gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: c.green,
            letterSpacing: 2, fontWeight: 600,
          }}>CARD MARKET NEWS</span>
          <span style={{
            width: 6, height: 6, borderRadius: '50%', background: c.green,
            display: 'inline-block', animation: 'pulse 2s infinite',
          }} />
        </div>
        <span style={{
          fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, color: c.muted, letterSpacing: 1,
        }}>LIVE FEED</span>
      </div>

      {/* News list */}
      <div style={{
        background: c.surface, border: `1px solid ${c.border}`,
        borderTop: `3px solid ${c.green}`, borderRadius: 4,
        overflow: 'hidden',
      }}>
        {news.map((item, i) => {
          const catColor = getCategoryColor(item.category);
          return (
            <a
              key={i}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'flex-start', gap: isMobile ? 10 : 14,
                padding: isMobile ? '12px 12px' : '12px 16px',
                borderBottom: i < news.length - 1 ? `1px solid ${c.border}22` : 'none',
                textDecoration: 'none', transition: 'background 0.1s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = `${c.green}08`)}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {/* Category badge */}
              <span style={{
                fontFamily: 'IBM Plex Mono, monospace', fontSize: 8, color: catColor,
                border: `1px solid ${catColor}`, padding: '2px 5px', borderRadius: 2,
                letterSpacing: 1, flexShrink: 0, marginTop: 2, whiteSpace: 'nowrap',
              }}>{item.category}</span>

              {/* Content */}
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{
                  fontFamily: 'IBM Plex Mono, monospace', fontSize: isMobile ? 11 : 12,
                  color: c.text, lineHeight: 1.5,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>{item.headline}</div>
                <div style={{
                  fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, color: c.muted,
                  marginTop: 4, display: 'flex', gap: 8,
                }}>
                  <span style={{ color: c.green }}>{item.source}</span>
                  <span>·</span>
                  <span>{item.time}</span>
                </div>
              </div>
            </a>
          );
        })}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
