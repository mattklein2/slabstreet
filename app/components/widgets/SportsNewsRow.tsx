'use client';

import { useTheme } from '../ThemeProvider';

interface SportsNewsRowProps {
  title: string;
  link: string;
  source: string;
  time: string;
  league: string;
  featured?: boolean;
}

const SOURCE_COLORS: Record<string, string> = {
  ESPN: '#ff3b5c',
  'Bleacher Report': '#f0b429',
  'The Athletic': '#a78bfa',
  'CBS Sports': '#38bdf8',
  'Yahoo Sports': '#7c3aed',
  'NBC Sports': '#00ff87',
  'Fox Sports': '#fb923c',
  'NBA.com': '#0066cc',
  'HoopsHype': '#ff6b35',
};

export default function SportsNewsRow({
  title,
  link,
  source,
  time,
  league,
  featured = false,
}: SportsNewsRowProps) {
  const { colors: c } = useTheme();
  const sourceColor = SOURCE_COLORS[source] || '#8899aa';

  if (featured) {
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="block no-underline rounded-md overflow-hidden transition-all duration-150 hover:brightness-110"
        style={{
          background: c.bg,
          border: `1px solid ${c.border}`,
        }}
      >
        <div
          style={{ height: 3, background: c.green }}
        />
        <div className="px-5 py-4">
          <div
            className="font-body text-[17px] leading-snug font-semibold line-clamp-3"
            style={{ color: c.text }}
          >
            {title}
          </div>
          <div className="flex items-center gap-2 mt-2.5">
            <span
              className="font-body text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase"
              style={{ background: sourceColor, color: '#fff' }}
            >
              {source}
            </span>
            <span
              className="font-body text-[10px]"
              style={{ color: c.muted }}
            >
              {time}
            </span>
            <span
              className="font-body text-[9px] px-1.5 py-0.5 rounded-sm"
              style={{ background: `${c.muted}22`, color: c.muted, border: `1px solid ${c.muted}33` }}
            >
              {league}
            </span>
          </div>
        </div>
      </a>
    );
  }

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
          className="font-body text-[13px] leading-snug line-clamp-2 font-medium"
          style={{ color: c.text }}
        >
          {title}
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <span
            className="font-body text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase"
            style={{ background: sourceColor, color: '#fff' }}
          >
            {source}
          </span>
          <span
            className="font-body text-[10px]"
            style={{ color: c.muted }}
          >
            {time}
          </span>
          <span
            className="font-body text-[9px] px-1.5 py-0.5 rounded-sm"
            style={{ background: `${c.muted}22`, color: c.muted, border: `1px solid ${c.muted}33` }}
          >
            {league}
          </span>
        </div>
      </div>
    </a>
  );
}
