'use client';

import { useState, useCallback } from 'react';
import { useTheme } from '../ThemeProvider';
import {
  CARD_SHOWS,
  zipToCoords,
  showsByDistance,
  formatDateRange,
  daysUntil,
  sizeLabel,
  type CardShow,
} from '../../../lib/card-shows';

type ShowWithDistance = CardShow & { distance: number };

export default function CardShowFinder() {
  const { colors } = useTheme();
  const [zip, setZip] = useState('');
  const [results, setResults] = useState<ShowWithDistance[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [radius, setRadius] = useState(500);

  const search = useCallback(async () => {
    const cleaned = zip.replace(/\s/g, '');
    if (!/^\d{5}$/.test(cleaned)) {
      setError('Enter a valid 5-digit zip code');
      return;
    }
    setLoading(true);
    setError('');
    const coords = await zipToCoords(cleaned);
    if (!coords) {
      setError('Zip code not found — try another');
      setLoading(false);
      return;
    }
    const sorted = showsByDistance(coords.lat, coords.lng);
    setResults(sorted);
    setLoading(false);
  }, [zip]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') search();
  };

  // Filter by radius + only future shows
  const filtered = results?.filter(s => {
    const d = daysUntil(s.startDate);
    return s.distance <= radius && (d === null || d >= -1);
  });

  // Group upcoming shows chronologically
  const upcoming = filtered ?? [];

  return (
    <div style={{ width: '100%', maxWidth: 720, margin: '0 auto' }}>
      {/* Search bar */}
      <div style={{
        display: 'flex',
        gap: 10,
        marginBottom: 16,
      }}>
        <input
          type="text"
          value={zip}
          onChange={(e) => setZip(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter zip code"
          maxLength={5}
          style={{
            flex: 1,
            padding: '14px 18px',
            fontSize: 18,
            fontFamily: "'IBM Plex Mono', monospace",
            background: colors.surface,
            color: colors.text,
            border: `1px solid ${colors.border}`,
            borderRadius: 12,
            outline: 'none',
            letterSpacing: 4,
            textAlign: 'center',
          }}
        />
        <button
          onClick={search}
          disabled={loading}
          style={{
            padding: '14px 28px',
            fontSize: 15,
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontWeight: 600,
            background: colors.green,
            color: '#0a0f1a',
            border: 'none',
            borderRadius: 12,
            cursor: loading ? 'wait' : 'pointer',
            transition: 'opacity 0.15s',
            opacity: loading ? 0.6 : 1,
            whiteSpace: 'nowrap',
          }}
        >
          {loading ? 'Searching...' : 'Find Shows'}
        </button>
      </div>

      {error && (
        <p style={{
          color: '#FF6B6B',
          fontSize: 14,
          fontFamily: "'IBM Plex Sans', sans-serif",
          textAlign: 'center',
          margin: '8px 0',
        }}>
          {error}
        </p>
      )}

      {/* Radius filter — only show after search */}
      {results && (
        <div style={{
          display: 'flex',
          gap: 8,
          justifyContent: 'center',
          marginBottom: 24,
          flexWrap: 'wrap',
        }}>
          {[100, 250, 500, 1000].map((r) => (
            <button
              key={r}
              onClick={() => setRadius(r)}
              style={{
                padding: '6px 16px',
                fontSize: 13,
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontWeight: radius === r ? 600 : 400,
                background: radius === r ? colors.green : 'transparent',
                color: radius === r ? '#0a0f1a' : colors.muted,
                border: `1px solid ${radius === r ? colors.green : colors.border}`,
                borderRadius: 20,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {r < 1000 ? `${r} mi` : '1,000+ mi'}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      {results && upcoming.length === 0 && (
        <p style={{
          textAlign: 'center',
          color: colors.muted,
          fontSize: 14,
          fontFamily: "'IBM Plex Sans', sans-serif",
          padding: '32px 0',
        }}>
          No upcoming shows within {radius} miles. Try expanding the radius.
        </p>
      )}

      {upcoming.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {upcoming.map((show) => {
            const days = daysUntil(show.startDate);
            const sz = sizeLabel(show.size);
            const isImminent = days !== null && days >= 0 && days <= 14;

            return (
              <div
                key={show.id}
                style={{
                  background: colors.surface,
                  border: `1px solid ${isImminent ? colors.green : colors.border}`,
                  borderRadius: 14,
                  padding: '20px 22px',
                  transition: 'border-color 0.15s',
                  ...(isImminent ? { boxShadow: `0 0 12px ${colors.green}33` } : {}),
                }}
              >
                {/* Header row */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 12,
                  marginBottom: 8,
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: 22,
                      letterSpacing: 1,
                      color: colors.text,
                      lineHeight: 1.2,
                    }}>
                      {show.name}
                    </div>
                    <div style={{
                      fontSize: 13,
                      fontFamily: "'IBM Plex Sans', sans-serif",
                      color: colors.muted,
                      marginTop: 2,
                    }}>
                      {show.venue} — {show.location}
                    </div>
                  </div>

                  {/* Distance badge */}
                  <div style={{
                    background: colors.green + '18',
                    color: colors.green,
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 13,
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: 8,
                    whiteSpace: 'nowrap',
                  }}>
                    {show.distance} mi
                  </div>
                </div>

                {/* Info row */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px 16px',
                  alignItems: 'center',
                  marginBottom: 10,
                }}>
                  {/* Date */}
                  <span style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 13,
                    color: isImminent ? colors.green : colors.text,
                    fontWeight: 500,
                  }}>
                    {formatDateRange(show.startDate, show.endDate)}
                  </span>

                  {/* Countdown */}
                  {days !== null && days >= 0 && (
                    <span style={{
                      fontSize: 12,
                      fontFamily: "'IBM Plex Sans', sans-serif",
                      color: isImminent ? colors.green : colors.muted,
                      fontWeight: isImminent ? 600 : 400,
                    }}>
                      {days === 0 ? 'TODAY' : days === 1 ? 'TOMORROW' : `in ${days} days`}
                    </span>
                  )}

                  {/* Size badge */}
                  <span style={{
                    fontSize: 12,
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    color: colors.muted,
                  }}>
                    {sz.emoji} {sz.label}
                  </span>

                  {/* Tables */}
                  {show.tables && (
                    <span style={{
                      fontSize: 12,
                      fontFamily: "'IBM Plex Mono', monospace",
                      color: colors.muted,
                    }}>
                      {show.tables}+ tables
                    </span>
                  )}

                  {/* Admission */}
                  {show.admissionPrice && (
                    <span style={{
                      fontSize: 12,
                      fontFamily: "'IBM Plex Mono', monospace",
                      color: colors.muted,
                    }}>
                      {show.admissionPrice} admission
                    </span>
                  )}
                </div>

                {/* Description */}
                <p style={{
                  fontSize: 13,
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  color: colors.muted,
                  lineHeight: 1.5,
                  margin: 0,
                }}>
                  {show.description}
                </p>

                {/* Recurrence + Link */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 10,
                }}>
                  {show.recurrence && (
                    <span style={{
                      fontSize: 11,
                      fontFamily: "'IBM Plex Mono', monospace",
                      color: colors.muted,
                      opacity: 0.7,
                    }}>
                      Repeats: {show.recurrence}
                    </span>
                  )}
                  {show.url && (
                    <a
                      href={show.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: 12,
                        fontFamily: "'IBM Plex Sans', sans-serif",
                        color: colors.green,
                        textDecoration: 'none',
                        fontWeight: 500,
                      }}
                    >
                      Official Site &rarr;
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pre-search state */}
      {!results && !error && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: colors.muted,
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: 14,
          lineHeight: 1.6,
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🗺️</div>
          Enter your zip code to find upcoming card shows near you.
          <br />
          We track {CARD_SHOWS.length} major and regional shows across the US.
        </div>
      )}
    </div>
  );
}
