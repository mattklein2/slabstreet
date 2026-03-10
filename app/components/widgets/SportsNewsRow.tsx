'use client';

import { useTheme } from '../ThemeProvider';

interface SportsNewsRowProps {
  title: string;
  link: string;
  source: string;
  time: string;
  league: string;
}

const SOURCE_COLORS: Record<string, string> = {
  ESPN: '#ff3b5c',
  'Bleacher Report': '#f0b429',
  'The Athletic': '#a78bfa',
  'CBS Sports': '#38bdf8',
  'Yahoo Sports': '#7c3aed',
  'NBC Sports': '#00ff87',
  'Fox Sports': '#fb923c',
};

export default function SportsNewsRow({ title, link, source, time, league }: SportsNewsRowProps) {
  const { colors: c } = useTheme();
  const sourceColor = SOURCE_COLORS[source] || '#8899aa';

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="block no-underline rounded transition-colors duration-150 hover:brightness-110"
      style={{ background: c.bg, border: `1px solid ${c.border}` }}
    >
      <div className="px-5 py-3">
        <div
          className="font-mono text-[12px] leading-snug line-clamp-2"
          style={{ color: c.text }}
        >
          {title}
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <span
            className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-sm"
            style={{ background: sourceColor, color: '#090b0f' }}
          >
            {source}
          </span>
          <span
            className="font-mono text-[10px]"
            style={{ color: c.muted }}
          >
            {time}
          </span>
          <span
            className="font-mono text-[9px] px-1.5 py-0.5 rounded-sm"
            style={{ background: `${c.muted}22`, color: c.muted, border: `1px solid ${c.muted}33` }}
          >
            {league}
          </span>
        </div>
      </div>
    </a>
  );
}
