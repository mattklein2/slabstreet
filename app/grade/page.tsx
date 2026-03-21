'use client';

import { useState } from 'react';
import { Header } from '../components/shared/Header';
import { useTheme } from '../components/ThemeProvider';
import { PopReport } from '../components/xray/PopReport';
import { GradingROI } from '../components/xray/GradingROI';
import type { PriceComps, XRayResult, XRayError } from '../../lib/xray/types';
import type { PSAPopSummary } from '../../lib/psa/types';

type InputMode = 'ebay' | 'manual';

export default function GradePage() {
  const { colors } = useTheme();
  const [mode, setMode] = useState<InputMode>('ebay');

  // eBay mode state
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Results
  const [priceComps, setPriceComps] = useState<PriceComps | null>(null);
  const [popData, setPopData] = useState<PSAPopSummary | null>(null);
  const [popLoading, setPopLoading] = useState(false);
  const [cardLabel, setCardLabel] = useState<string | null>(null);

  const handleEbaySubmit = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setPriceComps(null);
    setPopData(null);
    setCardLabel(null);

    try {
      const res = await fetch('/api/xray', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError((data as XRayError).error || 'Something went wrong');
        return;
      }

      const result = data as XRayResult;
      setPriceComps(result.priceComps);

      // Build card label
      const parts = [result.identity.year, result.identity.brand, result.identity.set, result.identity.player].filter(Boolean);
      setCardLabel(parts.join(' '));

      // Fetch pop data async
      const { identity } = result;
      if (identity.player && identity.year && identity.brand) {
        setPopLoading(true);
        const params = new URLSearchParams();
        if (identity.certNumber) params.set('cert', identity.certNumber);
        if (identity.player) params.set('player', identity.player);
        if (identity.year) params.set('year', identity.year);
        if (identity.brand) params.set('brand', identity.brand);
        if (identity.set) params.set('set', identity.set);

        fetch(`/api/psa/pop?${params}`)
          .then(r => r.json())
          .then(d => setPopData(d.pop || null))
          .catch(() => setPopData(null))
          .finally(() => setPopLoading(false));
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const hasResults = priceComps !== null;

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header showBack />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 20px 60px' }}>
        {/* Title */}
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          letterSpacing: 3,
          color: colors.text,
          margin: '24px 0 8px',
          lineHeight: 1.1,
        }}>
          SHOULD YOU <span style={{ color: colors.green }}>GRADE</span> IT?
        </h1>
        <p style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: 15,
          color: colors.muted,
          margin: '0 0 32px',
          lineHeight: 1.5,
        }}>
          See PSA population data and calculate whether grading your card is worth the cost.
        </p>

        {/* Mode toggle */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
          {(['ebay', 'manual'] as InputMode[]).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                fontFamily: "'IBM Plex Mono', monospace", cursor: 'pointer',
                border: mode === m ? `1px solid ${colors.green}` : `1px solid ${colors.border}`,
                background: mode === m ? `${colors.green}15` : 'transparent',
                color: mode === m ? colors.green : colors.muted,
                textTransform: 'uppercase', letterSpacing: 0.5,
              }}
            >
              {m === 'ebay' ? 'eBay Link' : 'Manual Entry'}
            </button>
          ))}
        </div>

        {/* Input area */}
        {mode === 'ebay' ? (
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            <input
              type="text"
              placeholder="Paste an eBay listing URL..."
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleEbaySubmit()}
              style={{
                flex: 1, padding: '12px 16px', borderRadius: 10, fontSize: 15,
                fontFamily: "'IBM Plex Sans', sans-serif",
                background: colors.surface, color: colors.text,
                border: `1px solid ${colors.border}`,
                outline: 'none',
              }}
            />
            <button
              onClick={handleEbaySubmit}
              disabled={loading || !url.trim()}
              style={{
                padding: '12px 24px', borderRadius: 10, fontSize: 14,
                fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700,
                background: colors.green, color: '#0a0f1a',
                border: 'none', cursor: loading ? 'wait' : 'pointer',
                opacity: loading || !url.trim() ? 0.5 : 1,
                letterSpacing: 1, textTransform: 'uppercase',
              }}
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        ) : (
          <ManualEntry
            colors={colors}
            popData={popData}
            popLoading={popLoading}
            onPopResult={(pop) => setPopData(pop)}
            onPopLoading={(l) => setPopLoading(l)}
          />
        )}

        {error && (
          <div style={{
            padding: '12px 16px', borderRadius: 10,
            background: `${colors.red}15`, border: `1px solid ${colors.red}40`,
            color: colors.red, fontSize: 13,
            fontFamily: "'IBM Plex Sans', sans-serif", marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        {/* Card label */}
        {cardLabel && (
          <p style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 13,
            color: colors.secondary, marginBottom: 16,
          }}>
            Showing results for: <span style={{ color: colors.text, fontWeight: 600 }}>{cardLabel}</span>
          </p>
        )}

        {/* Results */}
        <PopReport popData={popData} loading={popLoading} />

        {(hasResults || mode === 'manual') && (
          <GradingROI priceComps={priceComps} popData={popData} />
        )}
      </div>
    </div>
  );
}

function ManualEntry({ colors, popData, popLoading, onPopResult, onPopLoading }: {
  colors: any;
  popData: PSAPopSummary | null;
  popLoading: boolean;
  onPopResult: (pop: PSAPopSummary | null) => void;
  onPopLoading: (loading: boolean) => void;
}) {
  const [player, setPlayer] = useState('');
  const [year, setYear] = useState('');
  const [brand, setBrand] = useState('');
  const [set, setSet] = useState('');
  const [cert, setCert] = useState('');

  const handleSearch = async () => {
    if (!player.trim() && !cert.trim()) return;

    onPopLoading(true);
    onPopResult(null);

    const params = new URLSearchParams();
    if (cert.trim()) params.set('cert', cert.trim());
    if (player.trim()) params.set('player', player.trim());
    if (year.trim()) params.set('year', year.trim());
    if (brand.trim()) params.set('brand', brand.trim());
    if (set.trim()) params.set('set', set.trim());

    try {
      const res = await fetch(`/api/psa/pop?${params}`);
      const data = await res.json();
      onPopResult(data.pop || null);
    } catch {
      onPopResult(null);
    } finally {
      onPopLoading(false);
    }
  };

  const inputStyle = {
    padding: '10px 14px', borderRadius: 8, fontSize: 14,
    fontFamily: "'IBM Plex Sans', sans-serif" as const,
    background: colors.surface, color: colors.text,
    border: `1px solid ${colors.border}`, outline: 'none',
    width: '100%',
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <label style={fieldLabel(colors)}>Player Name</label>
          <input placeholder="e.g. Victor Wembanyama" value={player} onChange={e => setPlayer(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={fieldLabel(colors)}>PSA Cert Number</label>
          <input placeholder="e.g. 71234567 (optional)" value={cert} onChange={e => setCert(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={fieldLabel(colors)}>Year</label>
          <input placeholder="e.g. 2023-24" value={year} onChange={e => setYear(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={fieldLabel(colors)}>Brand</label>
          <input placeholder="e.g. Panini" value={brand} onChange={e => setBrand(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={fieldLabel(colors)}>Set</label>
          <input placeholder="e.g. Prizm" value={set} onChange={e => setSet(e.target.value)} style={inputStyle} />
        </div>
      </div>
      <button
        onClick={handleSearch}
        disabled={popLoading || (!player.trim() && !cert.trim())}
        style={{
          padding: '10px 24px', borderRadius: 10, fontSize: 14,
          fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700,
          background: colors.green, color: '#0a0f1a',
          border: 'none', cursor: popLoading ? 'wait' : 'pointer',
          opacity: popLoading || (!player.trim() && !cert.trim()) ? 0.5 : 1,
          letterSpacing: 1, textTransform: 'uppercase',
        }}
      >
        {popLoading ? 'Looking up...' : 'Look Up'}
      </button>
    </div>
  );
}

function fieldLabel(colors: any) {
  return {
    display: 'block' as const, fontSize: 11,
    fontFamily: "'IBM Plex Mono', monospace" as const,
    color: colors.muted, textTransform: 'uppercase' as const,
    letterSpacing: 0.5, marginBottom: 6,
  };
}
