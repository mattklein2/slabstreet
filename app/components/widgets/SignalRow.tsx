'use client';

import { useTheme } from '../ThemeProvider';

interface SignalRowProps {
  signal: string;
  name: string;
  slug: string;
  team: string;
  score: number;
}

const SIGNAL_COLORS: Record<string, { bg: string; text: string }> = {
  BUY:  { bg: '#00ff87', text: '#090b0f' },
  SELL: { bg: '#ff3b5c', text: '#090b0f' },
  HOLD: { bg: '#f0b429', text: '#090b0f' },
};

export default function SignalRow({ signal, name, slug, team, score }: SignalRowProps) {
  const { colors: c } = useTheme();
  const sc = SIGNAL_COLORS[signal] || SIGNAL_COLORS.HOLD;

  return (
    <a
      href={`/players/${slug}`}
      className="flex items-center justify-between rounded px-4 py-3 no-underline"
      style={{ background: c.bg, border: `1px solid ${c.border}` }}
    >
      <div className="flex items-center gap-2.5">
        <span
          className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-sm"
          style={{ background: sc.bg, color: sc.text }}
        >
          {signal}
        </span>
        <div>
          <div className="font-mono text-xs" style={{ color: c.text }}>{name}</div>
          <div className="font-mono text-[9px] mt-0.5" style={{ color: c.muted }}>
            {team} · Score: {score}
          </div>
        </div>
      </div>
      <div className="font-mono text-[11px]" style={{ color: sc.bg }}>
        {score}
      </div>
    </a>
  );
}
