'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '../ThemeProvider';
import { useUser } from '../UserProvider';
import NavSearch from '../NavSearch';
import { getAllLeagueIds, getLeagueConfig, ALL_ACCENT_COLOR } from '@/lib/leagues';
import type { LeagueId } from '@/lib/leagues';

type LeagueFilter = 'ALL' | LeagueId;
const TABS: LeagueFilter[] = ['ALL', ...getAllLeagueIds()];

function getTabHref(tab: LeagueFilter): string {
  return tab === 'ALL' ? '/' : `/${tab.toLowerCase()}`;
}

export default function Nav() {
  const { theme, toggle, colors: c } = useTheme();
  const { user, profile, loading, signOut } = useUser();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  function isActive(tab: LeagueFilter): boolean {
    if (tab === 'ALL') return pathname === '/';
    return pathname === `/${tab.toLowerCase()}`;
  }

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: c.bg,
        borderBottom: `1px solid ${c.border}`,
        height: 56,
        padding: '0 16px',
      }}
    >
      {/* Left: Logo */}
      <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <a href="/" style={{ textDecoration: 'none' }}>
          <span
            className="font-display"
            style={{ fontSize: 18, letterSpacing: 3, color: c.text }}
          >
            SLAB<span style={{ color: c.green }}>STREET</span>
          </span>
        </a>
      </div>

      {/* Center: League Tabs — hidden on mobile */}
      <div
        className="nav-tabs"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          overflowX: 'auto',
        }}
      >
        {TABS.map((tab) => {
          const active = isActive(tab);
          return (
            <Link
              key={tab}
              href={getTabHref(tab)}
              className="font-body"
              style={{
                flexShrink: 0,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s',
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: 1.5,
                fontWeight: 500,
                padding: '6px 12px',
                borderRadius: 8,
                cursor: 'pointer',
                color: active ? c.green : c.muted,
                background: active ? `${c.green}12` : 'transparent',
              }}
            >
              {tab}
            </Link>
          );
        })}
      </div>

      {/* Right: Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        {/* Search — hidden on mobile */}
        <div className="nav-search">
          <NavSearch />
        </div>

        {/* LIVE indicator — hidden on mobile */}
        <div
          className="nav-live font-body"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 9,
            fontWeight: 500,
            letterSpacing: 1.5,
            color: c.green,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              display: 'inline-block',
              background: c.green,
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
          LIVE
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggle}
          title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          style={{
            display: 'flex',
            alignItems: 'center',
            height: 24,
            width: 44,
            borderRadius: 12,
            padding: '0 2px',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 0.2s',
            background: c.surface,
            border: `1px solid ${c.border}`,
          }}
        >
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 9,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              transition: 'transform 0.2s',
              background: c.green,
              transform: theme === 'dark' ? 'translateX(0)' : 'translateX(20px)',
            }}
          >
            {theme === 'dark' ? '🌙' : '☀️'}
          </div>
        </button>

        {/* Auth */}
        {!loading && !user && (
          <Link
            href="/login"
            style={{
              padding: '6px 12px',
              fontSize: 11,
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontWeight: 600,
              background: c.green,
              color: '#0a0f1a',
              borderRadius: 8,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            Sign Up / Sign In
          </Link>
        )}

        {!loading && user && (
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                background: c.green + '22',
                border: `2px solid ${c.green}`,
                color: c.green,
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textTransform: 'uppercase',
              }}
            >
              {(profile?.display_name?.[0] || user.email?.[0] || 'U')}
            </button>

            {menuOpen && (
              <div style={{
                position: 'absolute',
                top: 40,
                right: 0,
                background: c.surface,
                border: `1px solid ${c.border}`,
                borderRadius: 10,
                padding: '6px 0',
                minWidth: 160,
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                zIndex: 100,
              }}>
                <div style={{
                  padding: '8px 16px 10px',
                  borderBottom: `1px solid ${c.border}`,
                  marginBottom: 4,
                }}>
                  <div style={{
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    fontSize: 13,
                    fontWeight: 600,
                    color: c.text,
                  }}>
                    {profile?.display_name || 'Collector'}
                  </div>
                  <div style={{
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    fontSize: 11,
                    color: c.muted,
                    marginTop: 2,
                  }}>
                    {user.email}
                  </div>
                </div>

                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: 'block',
                    padding: '8px 16px',
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    fontSize: 13,
                    color: c.text,
                    textDecoration: 'none',
                  }}
                >
                  Profile
                </Link>

                {profile?.role === 'admin' && (
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display: 'block',
                      padding: '8px 16px',
                      fontFamily: "'IBM Plex Sans', sans-serif",
                      fontSize: 13,
                      color: c.text,
                      textDecoration: 'none',
                    }}
                  >
                    Admin
                  </Link>
                )}

                <button
                  onClick={async () => {
                    setMenuOpen(false);
                    await signOut();
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '8px 16px',
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    fontSize: 13,
                    color: c.muted,
                    background: 'none',
                    border: 'none',
                    borderTop: `1px solid ${c.border}`,
                    marginTop: 4,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .nav-tabs { display: none !important; }
          .nav-search { display: none !important; }
          .nav-live { display: none !important; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .nav-search { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
