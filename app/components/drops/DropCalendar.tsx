'use client';

import { useState, useMemo } from 'react';
import { useTheme } from '../ThemeProvider';
import {
  DROPS,
  ALL_SPORTS,
  TIER_CONFIG,
  SPORT_ICONS,
  type Drop,
  type Sport,
} from '../../../lib/drops';

/* ── helpers ─────────────────────────────────────────────── */

const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

function daysUntil(iso: string): number {
  const d = new Date(iso + 'T00:00:00');
  return Math.ceil((d.getTime() - TODAY.getTime()) / 86_400_000);
}

function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function countdownLabel(iso: string): string {
  const d = daysUntil(iso);
  if (d < -7) return 'Released';
  if (d < 0) return 'Just dropped';
  if (d === 0) return 'TODAY';
  if (d === 1) return 'Tomorrow';
  if (d <= 7) return `${d} days`;
  if (d <= 30) return `${Math.ceil(d / 7)} weeks`;
  return `${Math.ceil(d / 30)} months`;
}

type TimeGroup = 'just-dropped' | 'this-week' | 'coming-soon' | 'on-the-horizon' | 'tba';

function getTimeGroup(drop: Drop): TimeGroup {
  if (!drop.releaseDate) return 'tba';
  const d = daysUntil(drop.releaseDate);
  if (d < 0) return 'just-dropped';
  if (d <= 7) return 'this-week';
  if (d <= 60) return 'coming-soon';
  return 'on-the-horizon';
}

const GROUP_ORDER: TimeGroup[] = ['this-week', 'coming-soon', 'just-dropped', 'on-the-horizon', 'tba'];
const GROUP_LABELS: Record<TimeGroup, string> = {
  'just-dropped': '🔥 Just Dropped',
  'this-week': '📅 Dropping This Week',
  'coming-soon': '⏳ Coming Soon',
  'on-the-horizon': '🔭 On The Horizon',
  tba: '❓ Date TBA',
};

/* ── components ──────────────────────────────────────────── */

function SportTabs({
  active,
  onChange,
  colors,
}: {
  active: Sport | 'All';
  onChange: (s: Sport | 'All') => void;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  const tabs: (Sport | 'All')[] = ['All', ...ALL_SPORTS];

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
      justifyContent: 'center',
      marginBottom: 32,
    }}>
      {tabs.map((tab) => {
        const isActive = tab === active;
        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            style={{
              background: isActive ? colors.green : colors.surface,
              color: isActive ? '#0a0f1a' : colors.muted,
              border: `1px solid ${isActive ? colors.green : colors.border}`,
              borderRadius: 20,
              padding: '6px 16px',
              fontSize: 13,
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontWeight: isActive ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.15s',
              letterSpacing: 0.5,
            }}
          >
            {tab === 'All' ? '🌐 All' : `${SPORT_ICONS[tab]} ${tab}`}
          </button>
        );
      })}
    </div>
  );
}

function DropCard({ drop, colors }: { drop: Drop; colors: ReturnType<typeof useTheme>['colors'] }) {
  const tier = TIER_CONFIG[drop.tier];
  const hasDate = !!drop.releaseDate;
  const isPast = hasDate && daysUntil(drop.releaseDate!) < 0;
  const isImminent = hasDate && daysUntil(drop.releaseDate!) >= 0 && daysUntil(drop.releaseDate!) <= 7;

  return (
    <div
      style={{
        background: colors.surface,
        border: `1px solid ${isImminent ? colors.green : colors.border}`,
        borderRadius: 16,
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        transition: 'border-color 0.15s, transform 0.15s',
        opacity: isPast ? 0.7 : 1,
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = colors.green;
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = isImminent ? colors.green : colors.border;
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Top row: sport icon + tier badge + countdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 20 }}>{SPORT_ICONS[drop.sport]}</span>
        <span style={{
          fontSize: 10,
          fontFamily: "'IBM Plex Mono', monospace",
          fontWeight: 700,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          color: tier.color,
          background: `${tier.color}18`,
          padding: '3px 8px',
          borderRadius: 6,
        }}>
          {tier.label}
        </span>
        <span style={{
          fontSize: 10,
          fontFamily: "'IBM Plex Mono', monospace",
          letterSpacing: 1,
          textTransform: 'uppercase',
          color: colors.muted,
          background: `${colors.muted}18`,
          padding: '3px 8px',
          borderRadius: 6,
        }}>
          {drop.sport}
        </span>
        <span style={{ marginLeft: 'auto' }}>
          {hasDate && (
            <span style={{
              fontSize: 11,
              fontFamily: "'IBM Plex Mono', monospace",
              fontWeight: 700,
              color: isImminent ? colors.green : isPast ? colors.muted : colors.amber,
              letterSpacing: 0.5,
            }}>
              {countdownLabel(drop.releaseDate!)}
            </span>
          )}
        </span>
      </div>

      {/* Product name */}
      <h3 style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 22,
        letterSpacing: 1.5,
        color: colors.text,
        margin: 0,
        lineHeight: 1.1,
      }}>
        {drop.name}
      </h3>

      {/* Date + price row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
      }}>
        {hasDate && (
          <span style={{
            fontSize: 12,
            fontFamily: "'IBM Plex Mono', monospace",
            color: colors.secondary,
          }}>
            {formatDate(drop.releaseDate!)}
          </span>
        )}
        {!hasDate && (
          <span style={{
            fontSize: 12,
            fontFamily: "'IBM Plex Mono', monospace",
            color: colors.muted,
          }}>
            Release date TBA
          </span>
        )}
        {drop.hobbyBoxPrice && (
          <span style={{
            fontSize: 12,
            fontFamily: "'IBM Plex Mono', monospace",
            color: colors.green,
            fontWeight: 700,
          }}>
            ~${drop.hobbyBoxPrice} hobby
          </span>
        )}
      </div>

      {/* Highlights */}
      <ul style={{
        margin: 0,
        paddingLeft: 18,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}>
        {drop.highlights.map((h, i) => (
          <li key={i} style={{
            fontSize: 13,
            color: colors.secondary,
            lineHeight: 1.4,
            fontFamily: "'IBM Plex Sans', sans-serif",
          }}>
            {h}
          </li>
        ))}
      </ul>

      {/* Box types */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 'auto',
      }}>
        {drop.boxTypes.map((bt) => (
          <span key={bt} style={{
            fontSize: 10,
            fontFamily: "'IBM Plex Mono', monospace",
            color: colors.muted,
            border: `1px solid ${colors.border}`,
            borderRadius: 4,
            padding: '2px 6px',
            letterSpacing: 0.5,
          }}>
            {bt}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── main export ─────────────────────────────────────────── */

export default function DropCalendar() {
  const { colors } = useTheme();
  const [sportFilter, setSportFilter] = useState<Sport | 'All'>('All');

  const grouped = useMemo(() => {
    const filtered = sportFilter === 'All'
      ? DROPS
      : DROPS.filter((d) => d.sport === sportFilter);

    const groups = new Map<TimeGroup, Drop[]>();
    for (const drop of filtered) {
      const g = getTimeGroup(drop);
      if (!groups.has(g)) groups.set(g, []);
      groups.get(g)!.push(drop);
    }

    // Sort each group by date (nulls last)
    for (const [, drops] of groups) {
      drops.sort((a, b) => {
        if (!a.releaseDate && !b.releaseDate) return 0;
        if (!a.releaseDate) return 1;
        if (!b.releaseDate) return -1;
        return a.releaseDate.localeCompare(b.releaseDate);
      });
    }

    return GROUP_ORDER
      .filter((g) => groups.has(g))
      .map((g) => ({ group: g, label: GROUP_LABELS[g], drops: groups.get(g)! }));
  }, [sportFilter]);

  return (
    <section style={{ width: '100%', maxWidth: 960, marginTop: 48 }}>
      {/* Section header */}
      <h2 style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 'clamp(1.8rem, 5vw, 2.5rem)',
        letterSpacing: 4,
        color: colors.text,
        textAlign: 'center',
        marginBottom: 8,
      }}>
        Upcoming Drops
      </h2>
      <p style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 'clamp(0.6rem, 1.5vw, 0.75rem)',
        letterSpacing: 3,
        color: colors.muted,
        textTransform: 'uppercase',
        textAlign: 'center',
        marginBottom: 32,
      }}>
        Every release worth knowing about
      </p>

      <SportTabs active={sportFilter} onChange={setSportFilter} colors={colors} />

      {grouped.length === 0 && (
        <p style={{
          textAlign: 'center',
          color: colors.muted,
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: 14,
          padding: '48px 0',
        }}>
          No upcoming drops for {sportFilter}. Check back soon.
        </p>
      )}

      {grouped.map(({ group, label, drops }) => (
        <div key={group} style={{ marginBottom: 40 }}>
          <h3 style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: 16,
            fontWeight: 700,
            color: colors.secondary,
            marginBottom: 16,
            paddingBottom: 8,
            borderBottom: `1px solid ${colors.border}`,
          }}>
            {label}
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
          }}>
            {drops.map((drop) => (
              <DropCard key={drop.slug} drop={drop} colors={colors} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
