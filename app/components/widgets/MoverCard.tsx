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
      className="block no-underline transition-colors duration-150"
      style={{
        background: c.surface,
        border: `1px solid ${c.border}`,
        borderRadius: 16,
        padding: 22,
      }}
    >
      <div>
        <div className="font-body text-[10px] font-medium tracking-wider uppercase mb-1.5" style={{ color: c.muted }}>
          {name.split(' ').pop()}
        </div>
        <div className="font-body text-[11px] mb-1" style={{ color: c.text }}>
          {team}
        </div>
        <div className="font-display text-[34px] leading-none" style={{ color: c.text }}>
          {score}
        </div>
        <div className="font-body text-[11px] font-semibold mt-1.5" style={{ color: accentColor }}>
          {isRiser ? '▲' : '▼'} {signal}
        </div>
        {/* Sparkline placeholder */}
        <div className="flex gap-1 items-end h-7 mt-3">
          {bars.map((h, i) => (
            <div
              key={i}
              className="rounded-[3px]"
              style={{ width: 7 }}
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
