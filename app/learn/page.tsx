'use client';

import { useState, useMemo, useRef } from 'react';
import { Header } from '../components/shared/Header';
import { useTheme } from '../components/ThemeProvider';
import { GLOSSARY, groupByLetter, type GlossaryTerm } from '../../lib/glossary';

export default function LearnPage() {
  const { colors } = useTheme();
  const [search, setSearch] = useState('');
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const filtered = useMemo(() => {
    if (!search.trim()) return GLOSSARY;
    const q = search.toLowerCase();
    return GLOSSARY.filter(
      (t) => t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q),
    );
  }, [search]);

  const grouped = useMemo(() => groupByLetter(filtered), [filtered]);

  // Sorted letter keys: # first, then A-Z
  const letters = useMemo(() => {
    const keys = Array.from(grouped.keys());
    keys.sort((a, b) => {
      if (a === '#') return -1;
      if (b === '#') return 1;
      return a.localeCompare(b);
    });
    return keys;
  }, [grouped]);

  // All available letters for the alphabet nav
  const allLetters = useMemo(() => {
    const allGrouped = groupByLetter(GLOSSARY);
    const keys = Array.from(allGrouped.keys());
    keys.sort((a, b) => {
      if (a === '#') return -1;
      if (b === '#') return 1;
      return a.localeCompare(b);
    });
    return keys;
  }, []);

  function scrollToLetter(letter: string) {
    setSearch('');
    setTimeout(() => {
      sectionRefs.current[letter]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  function handleRelatedClick(term: string) {
    setSearch('');
    setExpandedTerm(term);
    // Find the letter group
    const match = GLOSSARY.find((t) => t.term === term);
    if (match) {
      const letter = /[0-9]/.test(match.term[0]) ? '#' : match.term[0].toUpperCase();
      setTimeout(() => {
        sectionRefs.current[letter]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  }

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <Header showBack />
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 20px 60px' }}>
        {/* Title */}
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 36,
          letterSpacing: 2,
          color: colors.text,
          margin: '16px 0 4px',
        }}>
          Glossary
        </h1>
        <p style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 12,
          color: colors.muted,
          letterSpacing: 1,
          textTransform: 'uppercase',
          margin: '0 0 24px',
        }}>
          {GLOSSARY.length} terms every collector should know
        </p>

        {/* Search */}
        <div style={{ position: 'sticky', top: 0, zIndex: 10, paddingBottom: 12, background: colors.bg }}>
          <input
            type="text"
            placeholder="Search terms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: 15,
              fontFamily: "'IBM Plex Sans', sans-serif",
              background: colors.surface,
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: 12,
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = colors.green; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = colors.border; }}
          />

          {/* Alphabet nav — only show when not searching */}
          {!search.trim() && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 4,
              marginTop: 10,
              justifyContent: 'center',
            }}>
              {allLetters.map((letter) => (
                <button
                  key={letter}
                  onClick={() => scrollToLetter(letter)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: grouped.has(letter) ? colors.green : colors.muted,
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 18,
                    cursor: 'pointer',
                    padding: '2px 6px',
                    opacity: grouped.has(letter) ? 1 : 0.3,
                    transition: 'opacity 0.15s',
                  }}
                >
                  {letter}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <p style={{
            textAlign: 'center',
            color: colors.muted,
            fontSize: 14,
            padding: '48px 0',
          }}>
            No terms match &ldquo;{search}&rdquo;
          </p>
        ) : (
          letters.map((letter) => (
            <div
              key={letter}
              ref={(el) => { sectionRefs.current[letter] = el; }}
              style={{ scrollMarginTop: 120 }}
            >
              {/* Letter header */}
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 28,
                color: colors.green,
                letterSpacing: 2,
                margin: '32px 0 12px',
                paddingBottom: 8,
                borderBottom: `1px solid ${colors.border}`,
              }}>
                {letter}
              </div>

              {/* Terms */}
              {grouped.get(letter)!.map((t) => (
                <TermRow
                  key={t.term}
                  term={t}
                  colors={colors}
                  expanded={expandedTerm === t.term}
                  onToggle={() => setExpandedTerm(expandedTerm === t.term ? null : t.term)}
                  onRelatedClick={handleRelatedClick}
                />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ── Term Row ────────────────────────────────────────────── */

function TermRow({
  term,
  colors,
  expanded,
  onToggle,
  onRelatedClick,
}: {
  term: GlossaryTerm;
  colors: ReturnType<typeof useTheme>['colors'];
  expanded: boolean;
  onToggle: () => void;
  onRelatedClick: (term: string) => void;
}) {
  return (
    <div
      style={{
        padding: '14px 16px',
        background: expanded ? colors.surface : 'transparent',
        borderRadius: 12,
        marginBottom: 4,
        cursor: 'pointer',
        transition: 'background 0.15s',
      }}
      onClick={onToggle}
      onMouseEnter={(e) => {
        if (!expanded) e.currentTarget.style.background = colors.surface;
      }}
      onMouseLeave={(e) => {
        if (!expanded) e.currentTarget.style.background = 'transparent';
      }}
    >
      {/* Term name */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}>
        <span style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: 16,
          fontWeight: 700,
          color: colors.text,
        }}>
          {term.term}
        </span>
        <span style={{
          fontSize: 12,
          color: colors.muted,
          transition: 'transform 0.15s',
          transform: expanded ? 'rotate(180deg)' : 'rotate(0)',
          flexShrink: 0,
        }}>
          ▼
        </span>
      </div>

      {/* Definition (always visible as preview or full) */}
      <p style={{
        fontSize: 14,
        color: colors.secondary,
        lineHeight: 1.6,
        margin: '6px 0 0',
        overflow: expanded ? 'visible' : 'hidden',
        display: expanded ? 'block' : '-webkit-box',
        WebkitLineClamp: expanded ? undefined : 2,
        WebkitBoxOrient: expanded ? undefined : 'vertical',
      }}>
        {term.definition}
      </p>

      {/* Related terms */}
      {expanded && term.related && term.related.length > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 6,
          marginTop: 10,
        }}>
          <span style={{
            fontSize: 11,
            fontFamily: "'IBM Plex Mono', monospace",
            color: colors.muted,
            letterSpacing: 0.5,
            alignSelf: 'center',
          }}>
            Related:
          </span>
          {term.related.map((r) => (
            <button
              key={r}
              onClick={(e) => {
                e.stopPropagation();
                onRelatedClick(r);
              }}
              style={{
                fontSize: 11,
                fontFamily: "'IBM Plex Mono', monospace",
                color: colors.green,
                background: `${colors.green}12`,
                border: `1px solid ${colors.green}30`,
                borderRadius: 6,
                padding: '3px 8px',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = `${colors.green}25`; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = `${colors.green}12`; }}
            >
              {r}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
