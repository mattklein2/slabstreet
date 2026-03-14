'use client';

import Link from 'next/link';
import { useTheme } from './components/ThemeProvider';
import DropCalendar from './components/drops/DropCalendar';

const tools = [
  {
    href: '/decoder',
    title: 'What Did I Pull?',
    description: 'Identify any card by matching its color and pattern',
    icon: '🔍',
  },
  {
    href: '/shows',
    title: 'Card Show Finder',
    description: 'Find major shows and conventions near your zip code',
    icon: '🗺️',
  },
  {
    href: '/learn',
    title: 'Glossary',
    description: 'Every term a collector needs to know, from A to Z',
    icon: '📚',
  },
];

export default function HomePage() {
  const { colors } = useTheme();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: '4rem 1.25rem 2rem',
      fontFamily: "'IBM Plex Sans', sans-serif",
      position: 'relative',
    }}>
      {/* Logo */}
      <h1 style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 'clamp(3rem, 8vw, 6rem)',
        letterSpacing: 8,
        color: colors.green,
        marginBottom: 4,
        lineHeight: 1,
      }}>
        SLABSTREET
      </h1>

      {/* Tagline */}
      <p style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 'clamp(0.65rem, 2vw, 0.85rem)',
        letterSpacing: 4,
        color: colors.muted,
        textTransform: 'uppercase',
        marginBottom: 48,
      }}>
        Smart collecting starts here
      </p>

      {/* Tool Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 20,
        width: '100%',
        maxWidth: 960,
      }}>
        {tools.map((tool) => (
          <Link key={tool.href} href={tool.href} style={{ textDecoration: 'none' }}>
            <div style={{
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: 16,
              padding: '32px 24px',
              cursor: 'pointer',
              transition: 'border-color 0.15s, transform 0.15s',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colors.green;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.border;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span style={{ fontSize: 36 }}>{tool.icon}</span>
              <h2 style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 28,
                letterSpacing: 2,
                color: colors.text,
                margin: 0,
              }}>
                {tool.title}
              </h2>
              <p style={{
                color: colors.muted,
                fontSize: 14,
                lineHeight: 1.5,
                margin: 0,
              }}>
                {tool.description}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Drop Calendar */}
      <DropCalendar />

      {/* Footer */}
      <div style={{
        marginTop: 'auto',
        paddingTop: 48,
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '0.65rem',
        color: colors.muted,
        letterSpacing: 2,
        opacity: 0.5,
      }}>
        slabstreet.io
      </div>
    </div>
  );
}
