'use client';

import { useState, useEffect, use } from 'react';
import { Header } from '../../components/shared/Header';
import { Skeleton } from '../../components/shared/Skeleton';
import { EmptyState } from '../../components/shared/EmptyState';
import { TopicContent } from '../../components/learn/TopicContent';
import type { TopicDetail } from '../../../lib/types';

export default function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [topic, setTopic] = useState<TopicDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/learn/topics/${slug}`)
      .then(r => { if (!r.ok) throw new Error('Not found'); return r.json(); })
      .then(data => setTopic(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <Header showBack />
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 20px 40px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 20 }}>
            <Skeleton height={20} width={80} />
            <Skeleton height={36} width="60%" />
            <Skeleton height={200} />
          </div>
        ) : error || !topic ? (
          <EmptyState message="Topic not found." />
        ) : (
          <TopicContent topic={topic} />
        )}
      </div>
    </div>
  );
}
