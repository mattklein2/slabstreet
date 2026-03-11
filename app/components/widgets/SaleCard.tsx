'use client';

import { useTheme } from '../ThemeProvider';

interface SaleCardProps {
  playerName: string;
  playerSlug: string;
  title: string;
  price: number;
  date: string;
  imageUrl: string;
}

export default function SaleCard({ playerName, playerSlug, title, price, date, imageUrl }: SaleCardProps) {
  const { colors: c } = useTheme();

  return (
    <a
      href={`/players/${playerSlug}`}
      className="block no-underline rounded transition-colors duration-150"
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderLeft: `3px solid ${c.green}`,
        minWidth: '160px',
      }}
    >
      <div className="p-5">
        {/* Thumbnail */}
        {imageUrl && (
          <div className="mb-2">
            <img
              src={imageUrl}
              alt={title}
              className="rounded object-cover"
              width={64}
              height={64}
              style={{ width: 64, height: 64 }}
            />
          </div>
        )}

        {/* Card title / description */}
        <div
          className="font-body text-[11px] line-clamp-2 mb-1"
          style={{ color: c.text }}
        >
          {title}
        </div>

        {/* Player name */}
        <div
          className="font-body text-[10px] mb-2"
          style={{ color: c.muted }}
        >
          {playerName}
        </div>

        {/* Price */}
        <div
          className="font-display text-[22px] leading-none"
          style={{ color: c.green }}
        >
          ${price.toFixed(2)}
        </div>

        {/* Date */}
        <div
          className="font-body text-[10px] mt-1.5"
          style={{ color: c.muted }}
        >
          {date}
        </div>
      </div>
    </a>
  );
}
