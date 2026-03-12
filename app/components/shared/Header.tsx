'use client';

import Link from 'next/link';
import { useTheme } from '../ThemeProvider';

interface HeaderProps {
  showBack?: boolean;
}

export function Header({ showBack = false }: HeaderProps) {
  const { colors } = useTheme();

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      padding: '16px 20px',
      gap: 12,
    }}>
      {showBack && (
        <Link href="/" style={{ color: colors.muted, textDecoration: 'none', fontSize: 20 }}>
          ←
        </Link>
      )}
      <Link href="/" style={{ textDecoration: 'none' }}>
        <span style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 24,
          letterSpacing: 4,
          color: colors.green,
        }}>
          SLABSTREET
        </span>
      </Link>
    </header>
  );
}
