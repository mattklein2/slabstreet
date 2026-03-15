'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { useUser } from '../../components/UserProvider';

const BG      = '#0a0f1a';
const GREEN   = '#00ff87';
const SURFACE = '#111827';
const BORDER  = '#1e293b';
const MUTED   = '#64748b';
const TEXT    = '#e2e8f0';
const CYAN    = '#38bdf8';
const AMBER   = '#fbbf24';
const RED     = '#ef4444';

interface UserRow {
  id: string;
  display_name: string | null;
  role: string;
  collector_level: string | null;
  favorite_leagues: string[];
  notify_drops: boolean;
  notify_shows: boolean;
  notify_recap: boolean;
  created_at: string;
  updated_at: string;
}

interface DailyCount {
  date: string;  // "2026-03-15"
  count: number;
}

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

function isThisWeek(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return d >= weekAgo;
}

function isThisMonth(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function getDailySignups(users: UserRow[]): DailyCount[] {
  const counts = new Map<string, number>();
  // Last 30 days
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    counts.set(key, 0);
  }
  for (const u of users) {
    const key = new Date(u.created_at).toISOString().split('T')[0];
    if (counts.has(key)) {
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }
  return Array.from(counts.entries()).map(([date, count]) => ({ date, count }));
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function timeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateStr);
}

// ── Stat card ──
function StatCard({ label, value, sub, color = GREEN }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div style={{
      background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14,
      padding: '24px 28px', flex: 1, minWidth: 160,
    }}>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: MUTED, letterSpacing: 2, marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, color, lineHeight: 1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: MUTED, marginTop: 6 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

// ── Mini bar chart (last 30 days) ──
function SignupChart({ data }: { data: DailyCount[] }) {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const barWidth = 100 / data.length;

  return (
    <div style={{
      background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14,
      padding: '24px 28px',
    }}>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: MUTED, letterSpacing: 2, marginBottom: 16 }}>
        SIGNUPS · LAST 30 DAYS
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', height: 120, gap: 2 }}>
        {data.map((d, i) => {
          const height = d.count > 0 ? Math.max((d.count / maxCount) * 100, 4) : 2;
          const isLast7 = i >= data.length - 7;
          return (
            <div
              key={d.date}
              title={`${d.date}: ${d.count} signups`}
              style={{
                flex: 1,
                height: `${height}%`,
                background: d.count > 0 ? (isLast7 ? GREEN : `${GREEN}60`) : `${BORDER}`,
                borderRadius: 2,
                minWidth: 4,
                transition: 'height 0.3s',
                cursor: 'default',
              }}
            />
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: MUTED }}>
          {data[0]?.date?.slice(5)}
        </span>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: MUTED }}>
          Today
        </span>
      </div>
    </div>
  );
}

// ── User table ──
function UserTable({ users }: { users: UserRow[] }) {
  const sorted = [...users].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div style={{
      background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14,
      padding: '24px 28px', overflowX: 'auto',
    }}>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: MUTED, letterSpacing: 2, marginBottom: 16 }}>
        ALL USERS · {users.length} TOTAL
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
            {['User', 'Role', 'Level', 'Leagues', 'Notifications', 'Joined', ''].map(h => (
              <th key={h} style={{
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: MUTED,
                letterSpacing: 1.5, textAlign: 'left', padding: '8px 12px', fontWeight: 500,
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map(u => (
            <tr key={u.id} style={{ borderBottom: `1px solid ${BORDER}20` }}>
              <td style={{ padding: '12px', fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, color: TEXT }}>
                {u.display_name || <span style={{ color: MUTED, fontStyle: 'italic' }}>No name</span>}
              </td>
              <td style={{ padding: '12px' }}>
                <span style={{
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 600,
                  color: u.role === 'admin' ? AMBER : GREEN,
                  background: u.role === 'admin' ? `${AMBER}15` : `${GREEN}15`,
                  border: `1px solid ${u.role === 'admin' ? AMBER : GREEN}30`,
                  padding: '2px 8px', borderRadius: 4,
                }}>
                  {u.role.toUpperCase()}
                </span>
              </td>
              <td style={{ padding: '12px', fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: MUTED }}>
                {u.collector_level || '—'}
              </td>
              <td style={{ padding: '12px' }}>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {u.favorite_leagues?.length > 0 ? u.favorite_leagues.map(l => (
                    <span key={l} style={{
                      fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
                      color: CYAN, background: `${CYAN}12`, border: `1px solid ${CYAN}30`,
                      padding: '1px 6px', borderRadius: 3,
                    }}>{l}</span>
                  )) : <span style={{ color: MUTED, fontSize: 11 }}>—</span>}
                </div>
              </td>
              <td style={{ padding: '12px' }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  {u.notify_drops && <span title="Product Drops" style={{ fontSize: 14 }}>📦</span>}
                  {u.notify_shows && <span title="Card Shows" style={{ fontSize: 14 }}>🗺️</span>}
                  {u.notify_recap && <span title="Weekly Recap" style={{ fontSize: 14 }}>📊</span>}
                  {!u.notify_drops && !u.notify_shows && !u.notify_recap && (
                    <span style={{ color: MUTED, fontSize: 11 }}>none</span>
                  )}
                </div>
              </td>
              <td style={{ padding: '12px' }}>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: TEXT }}>
                  {timeAgo(u.created_at)}
                </div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: MUTED }}>
                  {formatDate(u.created_at)} · {formatTime(u.created_at)}
                </div>
              </td>
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: MUTED, fontFamily: "'IBM Plex Sans', sans-serif" }}>
                No users yet. They&apos;ll show up here when people sign up.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ── Main dashboard ──
export default function AdminDashboard() {
  const { user, profile, loading: authLoading } = useUser();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    async function fetchUsers(retries = 3): Promise<void> {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        if (fetchError.message.includes('AbortError') && retries > 0) {
          await new Promise(r => setTimeout(r, 500));
          return fetchUsers(retries - 1);
        }
        setError(fetchError.message);
      } else {
        setUsers(data || []);
      }
      setLoading(false);
    }

    fetchUsers();
  }, [authLoading]);

  if (authLoading || loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG }}>
        <p style={{ color: MUTED, fontFamily: "'IBM Plex Sans', sans-serif" }}>Loading...</p>
      </div>
    );
  }

  const totalUsers = users.length;
  const todayCount = users.filter(u => isToday(u.created_at)).length;
  const weekCount = users.filter(u => isThisWeek(u.created_at)).length;
  const monthCount = users.filter(u => isThisMonth(u.created_at)).length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const dailyData = getDailySignups(users);

  return (
    <div style={{ minHeight: '100vh', background: BG, color: TEXT, fontFamily: "'IBM Plex Sans', sans-serif" }}>

      {/* Nav */}
      <nav style={{
        borderBottom: `1px solid ${BORDER}`, padding: '0 24px', height: 58,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, background: BG, zIndex: 100,
      }}>
        <a href="/" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 3, color: GREEN, textDecoration: 'none' }}>
          SLABSTREET
        </a>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: MUTED, letterSpacing: 2 }}>
          ADMIN DASHBOARD
        </span>
        <a href="/" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: MUTED, textDecoration: 'none', letterSpacing: 1 }}>
          ← Back to Home
        </a>
      </nav>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* Title */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: MUTED, letterSpacing: 3, marginBottom: 8 }}>
            User Analytics
          </div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, letterSpacing: 2, color: TEXT, lineHeight: 1 }}>
            ADMIN DASHBOARD
          </div>
        </div>

        {error && (
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, padding: '12px 16px',
            borderRadius: 8, marginBottom: 24, background: `${RED}15`,
            border: `1px solid ${RED}`, color: RED,
          }}>
            Error loading users: {error}
          </div>
        )}

        {/* Stat cards */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <StatCard label="TOTAL USERS" value={totalUsers} sub={`${adminCount} admin${adminCount !== 1 ? 's' : ''}`} />
          <StatCard label="TODAY" value={todayCount} color={todayCount > 0 ? GREEN : MUTED} />
          <StatCard label="THIS WEEK" value={weekCount} color={weekCount > 0 ? CYAN : MUTED} />
          <StatCard label="THIS MONTH" value={monthCount} color={monthCount > 0 ? AMBER : MUTED} />
        </div>

        {/* Signup chart */}
        <div style={{ marginBottom: 24 }}>
          <SignupChart data={dailyData} />
        </div>

        {/* User table */}
        <UserTable users={users} />
      </div>
    </div>
  );
}
