'use client';

import { useState } from 'react';
import { useTheme } from '../ThemeProvider';

export function ShareButton({ resultId }: { resultId: string }) {
  const { colors } = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = `https://slabstreet.com/xray/result/${resultId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 16px',
        borderRadius: 10,
        border: `1px solid ${colors.green}40`,
        background: copied ? `${colors.green}20` : 'transparent',
        color: colors.green,
        fontSize: 13,
        fontFamily: "'IBM Plex Mono', monospace",
        cursor: 'pointer',
        transition: 'background 0.2s',
      }}
    >
      {copied ? 'Copied!' : 'Share'}
    </button>
  );
}
