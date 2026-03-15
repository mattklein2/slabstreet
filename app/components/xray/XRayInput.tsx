// app/components/xray/XRayInput.tsx
'use client';

import { useState } from 'react';
import { useTheme } from '../ThemeProvider';

interface XRayInputProps {
  onSubmit: (url: string) => void;
  loading: boolean;
}

export function XRayInput({ onSubmit, loading }: XRayInputProps) {
  const { colors } = useTheme();
  const [url, setUrl] = useState('');

  const handleSubmit = () => {
    const trimmed = url.trim();
    if (trimmed) onSubmit(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) handleSubmit();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    // Auto-submit on paste
    const pasted = e.clipboardData.getData('text').trim();
    if (pasted && /ebay\./i.test(pasted)) {
      setTimeout(() => onSubmit(pasted), 100);
    }
  };

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{
        display: 'flex',
        gap: 12,
        alignItems: 'stretch',
      }}>
        <input
          type="text"
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="Paste an eBay listing URL..."
          disabled={loading}
          style={{
            flex: 1,
            padding: '16px 20px',
            fontSize: 16,
            fontFamily: "'IBM Plex Sans', sans-serif",
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: 12,
            color: colors.text,
            outline: 'none',
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !url.trim()}
          style={{
            padding: '16px 28px',
            fontSize: 14,
            fontFamily: "'IBM Plex Mono', monospace",
            fontWeight: 600,
            letterSpacing: 1,
            background: loading ? colors.muted : colors.green,
            color: '#0a0f1a',
            border: 'none',
            borderRadius: 12,
            cursor: loading ? 'wait' : 'pointer',
            opacity: !url.trim() ? 0.5 : 1,
            whiteSpace: 'nowrap',
          }}
        >
          {loading ? 'ANALYZING...' : 'X-RAY'}
        </button>
      </div>
      <p style={{
        marginTop: 8,
        fontSize: 13,
        color: colors.muted,
        fontFamily: "'IBM Plex Sans', sans-serif",
      }}>
        Works with any eBay sports card listing. More marketplaces coming soon.
      </p>
    </div>
  );
}
