'use client';

import { useTheme } from '../ThemeProvider';

interface NewsCardProps {
  headline: string;
  source: string;
  url: string;
  category: string;
  time: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  RELEASE: '#00ff87',
  SALE: '#fb923c',
  GRADING: '#38bdf8',
  MARKET: '#f0b429',
  BREAKS: '#a78bfa',
  NEWS: '#8899aa',
};

export default function NewsCard({ headline, source, url, category, time }: NewsCardProps) {
  const { colors: c } = useTheme();
  const catColor = CATEGORY_COLORS[category] || CATEGORY_COLORS.NEWS;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block no-underline rounded transition-colors duration-150"
      style={{ background: c.bg, border: `1px solid ${c.border}` }}
    >
      <div className="p-5">
        <div
          className="font-mono text-[10px] tracking-wider mb-2"
          style={{ color: catColor }}
        >
          {category}
        </div>
        <div
          className="font-mono text-[13px] leading-snug mb-2 line-clamp-2"
          style={{ color: c.text }}
        >
          {headline}
        </div>
        <div className="font-mono text-[10px]" style={{ color: c.muted }}>
          {time} · {source}
        </div>
      </div>
    </a>
  );
}
