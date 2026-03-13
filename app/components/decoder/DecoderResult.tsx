'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../ThemeProvider';
import { RarityBadge } from '../shared/RarityBadge';
import { ExpandableSection } from '../shared/ExpandableSection';
import { formatPrintRun } from '../../../lib/format';
import { getRarityLevel } from '../../../lib/rarity';
import type { ParallelItem } from '../../../lib/types';

function buildEbayUrl(year: string, productName: string, parallelName: string, playerName: string): string {
  const terms = [year, productName, parallelName, playerName].filter(Boolean).join(' ');
  const encoded = encodeURIComponent(terms);
  return `https://www.ebay.com/sch/i.html?_nkw=${encoded}&_sacat=261328`;
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

interface DecoderResultProps {
  parallel: ParallelItem;
  allParallels: ParallelItem[];
  productName: string;
  productYear: string;
  brandName?: string;
}

export function DecoderResult({ parallel, allParallels, productName, productYear, brandName }: DecoderResultProps) {
  const { colors } = useTheme();
  const level = getRarityLevel(parallel.rarityRank, parallel.totalParallels, parallel.isOneOfOne);
  const [playerName, setPlayerName] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function fetchSuggestions(query: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const ctx = encodeURIComponent(`${productYear} ${productName}`);
        const res = await fetch(`/api/decoder/suggest?q=${encodeURIComponent(query)}&context=${ctx}`);
        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
        setHighlightIdx(-1);
      } catch { setSuggestions([]); }
    }, 200);
  }

  function selectSuggestion(val: string) {
    setPlayerName(val);
    setShowSuggestions(false);
    setSuggestions([]);
  }

  return (
    <div style={{ padding: '12px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 12,
          background: parallel.colorHex || colors.muted,
          border: `1px solid ${colors.border}`, flexShrink: 0,
        }} />
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 600, margin: 0, color: colors.text }}>{parallel.name}</h2>
          <p style={{ fontSize: 13, color: colors.muted, margin: '2px 0 0' }}>{brandName ? `${brandName} · ` : ''}{productName} {productYear}</p>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <RarityBadge rarityRank={parallel.rarityRank} totalParallels={parallel.totalParallels} isOneOfOne={parallel.isOneOfOne} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 16 }}>
        {[
          { label: 'Print Run', value: formatPrintRun(parallel.printRun) },
          { label: 'Rarity', value: parallel.rarityRank === 1 ? `Most common of ${parallel.totalParallels}` : `${ordinal(parallel.totalParallels - parallel.rarityRank + 1)} rarest of ${parallel.totalParallels}` },
          { label: 'Serial Numbered', value: parallel.serialNumbered ? 'Yes' : 'No' },
          { label: 'Found In', value: parallel.boxExclusivity?.includes('All') ? 'All box types' : parallel.boxExclusivity?.join(', ') || 'Unknown' },
        ].map((stat) => (
          <div key={stat.label} style={{
            padding: '10px 12px', background: colors.surface,
            borderRadius: 10, border: `1px solid ${colors.border}`,
          }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: colors.muted, marginBottom: 2 }}>{stat.label}</div>
            <div style={{ fontSize: 15, fontWeight: 500, color: colors.text }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Rarity bar */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: colors.muted, marginBottom: 6 }}>RARITY POSITION</div>
        <div style={{ height: 8, background: colors.surface, borderRadius: 4, border: `1px solid ${colors.border}`, position: 'relative', overflow: 'visible' }}>
          <div style={{
            position: 'absolute',
            left: `${(parallel.rarityRank / parallel.totalParallels) * 100}%`,
            top: -2, width: 12, height: 12, borderRadius: '50%',
            background: colors.green, transform: 'translateX(-50%)',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: colors.muted, marginTop: 4, fontFamily: "'IBM Plex Mono', monospace" }}>
          <span>Common</span><span>1/1</span>
        </div>
      </div>

      {/* eBay lookup */}
      <div style={{
        padding: 16, background: colors.surface, borderRadius: 12,
        border: `1px solid ${colors.border}`, marginBottom: 16,
      }}>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: colors.muted, marginBottom: 8 }}>LOOK UP VALUE</div>
        <div ref={wrapperRef} style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Enter player name..."
            value={playerName}
            onChange={(e) => { setPlayerName(e.target.value); fetchSuggestions(e.target.value); }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setHighlightIdx(i => Math.min(i + 1, suggestions.length - 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setHighlightIdx(i => Math.max(i - 1, -1));
              } else if (e.key === 'Enter') {
                if (highlightIdx >= 0 && suggestions[highlightIdx]) {
                  selectSuggestion(suggestions[highlightIdx]);
                } else if (playerName.trim()) {
                  setShowSuggestions(false);
                  window.open(buildEbayUrl(productYear, productName, parallel.name, playerName.trim()), '_blank');
                }
              } else if (e.key === 'Escape') {
                setShowSuggestions(false);
              }
            }}
            onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
            style={{
              width: '100%', padding: '10px 12px', fontSize: 15,
              background: colors.bg, color: colors.text,
              border: `1px solid ${colors.border}`, borderRadius: 8,
              outline: 'none', boxSizing: 'border-box',
              fontFamily: "'IBM Plex Sans', sans-serif",
            }}
          />
          {showSuggestions && suggestions.length > 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
              background: colors.surface, border: `1px solid ${colors.border}`,
              borderRadius: 8, marginTop: 4, overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}>
              {suggestions.map((s, i) => (
                <div
                  key={s}
                  onMouseDown={() => selectSuggestion(s)}
                  onMouseEnter={() => setHighlightIdx(i)}
                  style={{
                    padding: '8px 12px', fontSize: 14, cursor: 'pointer',
                    color: colors.text, fontFamily: "'IBM Plex Sans', sans-serif",
                    background: i === highlightIdx ? `${colors.green}20` : 'transparent',
                  }}
                >
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>
        <a
          href={playerName.trim() ? buildEbayUrl(productYear, productName, parallel.name, playerName.trim()) : undefined}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => { if (!playerName.trim()) e.preventDefault(); }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            marginTop: 10, padding: '11px 16px', borderRadius: 8,
            background: playerName.trim() ? colors.green : colors.border,
            color: playerName.trim() ? colors.bg : colors.muted,
            fontSize: 14, fontWeight: 600, textDecoration: 'none',
            cursor: playerName.trim() ? 'pointer' : 'not-allowed',
            transition: 'background 0.15s, color 0.15s',
            fontFamily: "'IBM Plex Sans', sans-serif",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          Search eBay Listings
        </a>
        {playerName.trim() && (
          <p style={{ fontSize: 11, color: colors.muted, marginTop: 6, textAlign: 'center' }}>
            Opens eBay in a new tab — {productYear} {productName} {parallel.name} {playerName.trim()}
          </p>
        )}
      </div>

      <ExpandableSection title="What does this mean?">
        <p>
          {parallel.isOneOfOne
            ? `This is a 1-of-1 card — only one exists in the entire world. It's the rarest type of card you can pull.`
            : parallel.printRun
              ? `Only ${parallel.printRun} of these cards were printed. ${parallel.serialNumbered ? 'Each one is stamped with a unique number.' : ''} Out of ${parallel.totalParallels} parallel versions, yours is the ${ordinal(parallel.totalParallels - parallel.rarityRank + 1)} rarest.`
              : `This parallel has an unlimited print run — there's no set number that were made. Out of ${parallel.totalParallels} parallels for this product, yours is the ${parallel.rarityRank === 1 ? 'most common' : ordinal(parallel.totalParallels - parallel.rarityRank + 1) + ' rarest'}.`
          }
        </p>
        {parallel.description && <p style={{ marginTop: 8 }}>{parallel.description}</p>}
      </ExpandableSection>

      <ExpandableSection title="Full rarity hierarchy">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {allParallels.map((p) => (
            <div key={p.id} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 6,
              background: p.id === parallel.id ? `${colors.green}15` : 'transparent',
              border: p.id === parallel.id ? `1px solid ${colors.green}40` : '1px solid transparent',
            }}>
              <div style={{ width: 16, height: 16, borderRadius: 3, background: p.colorHex || colors.muted, flexShrink: 0 }} />
              <span style={{ fontSize: 13, flex: 1, color: p.id === parallel.id ? colors.green : colors.text }}>{p.name}</span>
              <span style={{ fontSize: 11, color: colors.muted, fontFamily: "'IBM Plex Mono', monospace" }}>{formatPrintRun(p.printRun)}</span>
              {p.id === parallel.id && <span style={{ fontSize: 10, color: colors.green, fontWeight: 600 }}>YOU</span>}
            </div>
          ))}
        </div>
      </ExpandableSection>
    </div>
  );
}
