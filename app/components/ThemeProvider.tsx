'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggle: () => void;
  colors: typeof darkColors;
}

const darkColors = {
  bg:      '#090b0f',
  surface: '#0f1318',
  border:  '#1e2530',
  green:   '#00ff87',
  cyan:    '#38bdf8',
  amber:   '#f59e0b',
  red:     '#ff3b5c',
  text:    '#e8edf5',
  muted:   '#8899aa',
  purple:  '#a78bfa',
  orange:  '#fb923c',
  navBg:   '#090b0f',
};

const lightColors = {
  bg:      '#f4f6f8',
  surface: '#ffffff',
  border:  '#dde3ec',
  green:   '#00b86b',
  cyan:    '#0284c7',
  amber:   '#d97706',
  red:     '#e11d48',
  text:    '#0a0f1a',
  muted:   '#64748b',
  purple:  '#7c3aed',
  orange:  '#ea580c',
  navBg:   '#ffffff',
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggle: () => {},
  colors: darkColors,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');

  // Load saved preference on mount
  useEffect(() => {
    const saved = localStorage.getItem('slabstreet-theme') as Theme | null;
    if (saved === 'light' || saved === 'dark') setTheme(saved);
  }, []);

  function toggle() {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('slabstreet-theme', next);
      return next;
    });
  }

  const colors = theme === 'dark' ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, toggle, colors }}>
      <div style={{ background: colors.bg, minHeight: '100vh', transition: 'background 0.2s, color 0.2s' }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
