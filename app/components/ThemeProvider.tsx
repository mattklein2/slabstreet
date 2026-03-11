'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggle: () => void;
  colors: typeof darkColors;
}

const darkColors = {
  bg:        '#0a0f1a',
  surface:   '#111827',
  border:    '#1e2a3a',
  green:     '#00ff87',
  cyan:      '#38bdf8',
  amber:     '#f59e0b',
  red:       '#ff3b5c',
  text:      '#e8edf5',
  secondary: '#c8d3e0',
  muted:     '#556677',
  dimmed:    '#445566',
  purple:    '#a78bfa',
  orange:    '#fb923c',
  navBg:     '#0a0f1a',
};

const lightColors = {
  bg:        '#f8f9fb',
  surface:   '#ffffff',
  border:    '#e5e7eb',
  green:     '#16a34a',
  cyan:      '#0284c7',
  amber:     '#d97706',
  red:       '#e11d48',
  text:      '#111827',
  secondary: '#374151',
  muted:     '#9ca3af',
  dimmed:    '#d1d5db',
  purple:    '#7c3aed',
  orange:    '#ea580c',
  navBg:     '#ffffff',
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggle: () => {},
  colors: lightColors,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read the theme that the blocking script already applied to <html>
    const saved = localStorage.getItem('slabstreet-theme') as Theme | null;
    if (saved === 'light' || saved === 'dark') {
      setTheme(saved);
    }
    setMounted(true);
  }, []);

  function toggle() {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('slabstreet-theme', next);
      document.documentElement.setAttribute('data-theme', next);
      return next;
    });
  }

  // Use light colors until mounted to match server render — prevents flash
  const colors = mounted
    ? (theme === 'dark' ? darkColors : lightColors)
    : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, toggle, colors }}>
      <div style={{ background: colors.bg, minHeight: '100vh', transition: mounted ? 'background 0.2s, color 0.2s' : 'none' }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
