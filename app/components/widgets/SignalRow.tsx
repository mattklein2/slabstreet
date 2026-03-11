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
  BUY:  { bg: '#00ff8718', text: '#00ff87' },
  SELL: { bg: '#ff3b5c18', text: '#ff3b5c' },
  HOLD: { bg: '#f0b42918', text: '#f0b429' },
};

export default function SignalRow({ signal, name, slug, team, score }: SignalRowProps) {
  const { colors: c } = useTheme();
  const sc = SIGNAL_COLORS[signal] || SIGNAL_COLORS.HOLD;

  return (
    <a
      href={`/players/${slug}`}
      className="flex items-center justify-between no-underline"
      style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 12, padding: '12px 18px' }}
    >
      <div className="flex items-center gap-2.5">
        <span
          className="font-mono text-[10px] font-bold px-1.5 py-0.5"
          style={{ borderRadius: 6 }}
          style={{ background: sc.bg, color: sc.text }}
        >
          {signal}
        </span>
        <div>
          <div className="font-body text-[13px] font-medium" style={{ color: c.text }}>{name}</div>
          <div className="font-body text-[10px] mt-0.5" style={{ color: c.muted }}>
            {team} · Score: {score}
          </div>
        </div>
      </div>
      <div className="font-mono" style={{ color: sc.text, fontSize: 15, fontWeight: 600 }}>
        {score}
      </div>
    </a>
  );
}
