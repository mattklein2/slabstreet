'use client';

import { useTheme } from '../ThemeProvider';

interface MoverCardProps {
  name: string;
  slug: string;
  team: string;
  score: number;
  signal: 'BUY' | 'SELL' | string;
  league: string;
}

export default function MoverCard({ name, slug, team, score, signal }: MoverCardProps) {
  const { colors: c } = useTheme();
  const isRiser = signal === 'BUY';
  const accentColor = isRiser ? c.green : c.red;

  // Placeholder sparkline bars — static heights seeded from score
  const bars = Array.from({ length: 6 }, (_, i) => {
    const base = ((score * (i + 1) * 7) % 60) + 20;
    return Math.min(base + (i * 5), 100);
  });

  return (
    <a
      href={`/players/${slug}`}
      className="block no-underline rounded transition-colors duration-150"
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderLeft: `3px solid ${accentColor}`,
      }}
    >
      <div className="p-3">
        <div className="font-mono text-[10px] tracking-wider mb-1" style={{ color: c.muted }}>
          {name.split(' ').pop()?.toUpperCase()}
        </div>
        <div className="font-mono text-[11px] mb-0.5" style={{ color: c.text }}>
          {team}
        </div>
        <div className="font-display text-[28px] leading-none" style={{ color: c.text }}>
          {score}
        </div>
        <div className="font-mono text-[11px] font-semibold mt-1" style={{ color: accentColor }}>
          {isRiser ? '▲' : '▼'} {signal}
        </div>
        {/* Sparkline placeholder */}
        <div className="flex gap-0.5 items-end h-5 mt-1.5">
          {bars.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-[1px]"
              style={{
                height: `${h}%`,
                background: i >= 4 ? accentColor : c.border,
                opacity: i >= 4 ? (i === 5 ? 1 : 0.6) : 0.4,
              }}
            />
          ))}
        </div>
      </div>
    </a>
  );
}
