'use client';

import Link from 'next/link';
import { useTheme } from '../components/ThemeProvider';
import CardShowFinder from '../components/shows/CardShowFinder';

export default function ShowsPage() {
  const { colors } = useTheme();

  return (
    <div style={{
      minHeight: '100vh',
      padding: '0 1.25rem 2rem',
      fontFamily: "'IBM Plex Sans', sans-serif",
    }}>
      {/* Nav */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '16px 0',
        marginBottom: 8,
      }}>
        <Link href="/" style={{
          color: colors.green,
          textDecoration: 'none',
          fontSize: 20,
          fontFamily: "'IBM Plex Mono', monospace",
        }}>
          &larr;
        </Link>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 22,
            letterSpacing: 4,
            color: colors.green,
          }}>
            SLABSTREET
          </span>
        </Link>
      </nav>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 'clamp(2rem, 6vw, 3rem)',
          letterSpacing: 3,
          color: colors.text,
          margin: '0 0 8px',
        }}>
          Card Show Finder
        </h1>
        <p style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 13,
          color: colors.muted,
          letterSpacing: 2,
          textTransform: 'uppercase',
        }}>
          Major shows &amp; conventions near you
        </p>
      </div>

      <CardShowFinder />
    </div>
  );
}
