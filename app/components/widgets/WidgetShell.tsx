'use client';

import { useTheme } from '../ThemeProvider';
import type { ReactNode } from 'react';

interface WidgetShellProps {
  title: string;
  icon: string;
  accentColor: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  badge?: ReactNode;
  children: ReactNode;
}

export default function WidgetShell({
  title,
  icon,
  accentColor,
  viewAllHref,
  viewAllLabel = 'View All →',
  badge,
  children,
}: WidgetShellProps) {
  const { colors: c } = useTheme();

  return (
    <div
      className="rounded-md"
      style={{
        background: c.surface,
        border: `1px solid ${c.border}`,
        borderTop: `2px solid ${accentColor}`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2.5">
          <span className="text-base leading-none">{icon}</span>
          <span
            className="font-body text-[13px] font-medium tracking-widest uppercase"
            style={{ color: accentColor }}
          >
            {title}
          </span>
          {badge}
        </div>
        {viewAllHref && (
          <a
            href={viewAllHref}
            className="font-body text-[11px] no-underline hover:underline"
            style={{ color: c.muted }}
          >
            {viewAllLabel}
          </a>
        )}
      </div>
      {/* Content */}
      <div className="px-6 pb-5">
        {children}
      </div>
    </div>
  );
}

export function WidgetSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="rounded h-12"
          style={{
            background: 'linear-gradient(90deg, var(--border) 25%, var(--surface) 50%, var(--border) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s ease-in-out infinite',
          }}
        />
      ))}
    </div>
  );
}

export function WidgetError({ message }: { message: string }) {
  return (
    <div className="py-8 text-center font-body text-xs" style={{ color: 'var(--muted)' }}>
      {message}
    </div>
  );
}

export function WidgetEmpty({ message }: { message: string }) {
  return (
    <div className="py-8 text-center font-body text-xs" style={{ color: 'var(--muted)' }}>
      {message}
    </div>
  );
}
