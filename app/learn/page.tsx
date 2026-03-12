'use client';

import { useState, useEffect } from 'react';
import { Header } from '../components/shared/Header';
import { Skeleton } from '../components/shared/Skeleton';
import { EmptyState } from '../components/shared/EmptyState';
import { TopicCard } from '../components/learn/TopicCard';
import { useTheme } from '../components/ThemeProvider';
import type { TopicItem } from '../../lib/types';

export default function LearnPage() {
  const { colors } = useTheme();
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/learn/topics')
      .then(r => r.json())
      .then(data => setTopics(data.topics || []))
      .finally(() => setLoading(false));
  }, []);

  const concepts = topics.filter(t => t.category === 'concept');
  const products = topics.filter(t => t.category === 'product');

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <Header showBack />
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 20px 40px' }}>
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 36, letterSpacing: 2, color: colors.text, margin: '16px 0 24px',
        }}>
          Learn the Hobby
        </h1>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {Array.from({ length: 4 }, (_, i) => (<Skeleton key={i} height={120} borderRadius={12} />))}
          </div>
        ) : topics.length === 0 ? (
          <EmptyState message="Topics coming soon." />
        ) : (
          <>
            {concepts.length > 0 && (
              <section>
                <h2 style={{
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: 12,
                  color: colors.muted, letterSpacing: 1, textTransform: 'uppercase', margin: '0 0 12px',
                }}>
                  Key Concepts
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12, marginBottom: 28 }}>
                  {concepts.map(t => <TopicCard key={t.slug} topic={t} />)}
                </div>
              </section>
            )}
            {products.length > 0 && (
              <section>
                <h2 style={{
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: 12,
                  color: colors.muted, letterSpacing: 1, textTransform: 'uppercase', margin: '0 0 12px',
                }}>
                  Products
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                  {products.map(t => <TopicCard key={t.slug} topic={t} />)}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
