'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '../components/ThemeProvider';
import { useUser } from '../components/UserProvider';

const LEAGUES = ['NBA', 'NFL', 'MLB', 'F1', 'WNBA', 'Soccer'];
const COLLECTOR_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

export default function ProfilePage() {
  const { colors } = useTheme();
  const { user, profile, loading, signOut, refreshProfile } = useUser();
  const router = useRouter();

  const [displayName, setDisplayName] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [collectorLevel, setCollectorLevel] = useState('');
  const [favoriteLeagues, setFavoriteLeagues] = useState<string[]>([]);
  const [favoriteTeams, setFavoriteTeams] = useState<string[]>([]);
  const [favoritePlayers, setFavoritePlayers] = useState<string[]>([]);
  const [notifyDrops, setNotifyDrops] = useState(false);
  const [notifyShows, setNotifyShows] = useState(false);
  const [notifyRecap, setNotifyRecap] = useState(false);
  const [teamInput, setTeamInput] = useState('');
  const [playerInput, setPlayerInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Populate form from profile
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setZipCode(profile.zip_code || '');
      setCollectorLevel(profile.collector_level || '');
      setFavoriteLeagues(profile.favorite_leagues || []);
      setFavoriteTeams(profile.favorite_teams || []);
      setFavoritePlayers(profile.favorite_players || []);
      setNotifyDrops(profile.notify_drops);
      setNotifyShows(profile.notify_shows);
      setNotifyRecap(profile.notify_recap);
    }
  }, [profile]);

  // Save all profile fields at once via server-side API route
  async function handleSave() {
    if (!user) return;
    setSaving(true);
    setSaveStatus('idle');

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: displayName || null,
          zip_code: zipCode || null,
          collector_level: collectorLevel || null,
          favorite_leagues: favoriteLeagues,
          favorite_teams: favoriteTeams,
          favorite_players: favoritePlayers,
          notify_drops: notifyDrops,
          notify_shows: notifyShows,
          notify_recap: notifyRecap,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error('Save error:', res.status, body.error);
        setSaveStatus('error');
      } else {
        await refreshProfile();
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch (err) {
      console.error('Save network error:', err);
      setSaveStatus('error');
    }
    setSaving(false);
  }

  // Redirect if not logged in
  if (!loading && !user) {
    router.push('/login?redirect=/profile');
    return null;
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'IBM Plex Sans', sans-serif",
        color: colors.muted,
      }}>
        Loading...
      </div>
    );
  }

  function toggleLeague(league: string) {
    setFavoriteLeagues(prev =>
      prev.includes(league) ? prev.filter(l => l !== league) : [...prev, league]
    );
  }

  function addTeam() {
    const t = teamInput.trim();
    if (t && !favoriteTeams.includes(t)) {
      setFavoriteTeams(prev => [...prev, t]);
      setTeamInput('');
    }
  }

  function removeTeam(team: string) {
    setFavoriteTeams(prev => prev.filter(t => t !== team));
  }

  function addPlayer() {
    const p = playerInput.trim();
    if (p && !favoritePlayers.includes(p)) {
      setFavoritePlayers(prev => [...prev, p]);
      setPlayerInput('');
    }
  }

  function removePlayer(player: string) {
    setFavoritePlayers(prev => prev.filter(p => p !== player));
  }

  async function handleDeleteAccount() {
    // Sign out and let them know — actual account deletion requires Supabase admin API
    await signOut();
    router.push('/');
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    fontSize: 14,
    fontFamily: "'IBM Plex Sans', sans-serif",
    background: colors.bg,
    color: colors.text,
    border: `1px solid ${colors.border}`,
    borderRadius: 10,
    outline: 'none',
    boxSizing: 'border-box' as const,
  };

  const labelStyle = {
    display: 'block' as const,
    fontFamily: "'IBM Plex Sans', sans-serif",
    fontSize: 12,
    fontWeight: 500,
    color: colors.muted,
    marginBottom: 6,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  };

  const sectionStyle = {
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: 14,
    padding: '24px 22px',
    marginBottom: 16,
  };

  const sectionTitle = {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 20,
    letterSpacing: 1,
    color: colors.text,
    margin: '0 0 16px',
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '32px 20px 64px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: 13,
            color: colors.muted,
          }}>
            &larr; Back to SlabStreet
          </span>
        </Link>
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 32,
          letterSpacing: 2,
          color: colors.text,
          margin: '12px 0 4px',
        }}>
          Your Profile
        </h1>
        <p style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: 14,
          color: colors.muted,
          margin: 0,
        }}>
          Fill in what you want, skip the rest.
        </p>
      </div>

      {/* Save Button — sticky at top */}
      <div style={{
        position: 'sticky',
        top: 56,
        zIndex: 40,
        marginBottom: 16,
      }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%',
            padding: '14px',
            fontSize: 16,
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontWeight: 700,
            background: saveStatus === 'saved' ? '#22c55e' : saveStatus === 'error' ? '#FF6B6B' : colors.green,
            color: '#0a0f1a',
            border: 'none',
            borderRadius: 12,
            cursor: saving ? 'wait' : 'pointer',
            opacity: saving ? 0.7 : 1,
            transition: 'all 0.2s',
            letterSpacing: 1,
          }}
        >
          {saving ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : saveStatus === 'error' ? 'Error — Try Again' : 'Save Profile'}
        </button>
      </div>

      {/* Account Info */}
      <div style={sectionStyle}>
        <h2 style={sectionTitle}>Account Info</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="What should we call you?"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={user?.email || ''}
              readOnly
              style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }}
            />
          </div>
          <div>
            <label style={labelStyle}>Collector Level</label>
            <select
              value={collectorLevel}
              onChange={(e) => setCollectorLevel(e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="">Select your level...</option>
              {COLLECTOR_LEVELS.map(l => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* My Interests */}
      <div style={sectionStyle}>
        <h2 style={sectionTitle}>My Interests</h2>

        {/* Leagues */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Favorite Leagues</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {LEAGUES.map(league => {
              const active = favoriteLeagues.includes(league);
              return (
                <button
                  key={league}
                  onClick={() => toggleLeague(league)}
                  style={{
                    padding: '6px 16px',
                    fontSize: 13,
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    fontWeight: active ? 600 : 400,
                    background: active ? colors.green : 'transparent',
                    color: active ? '#0a0f1a' : colors.muted,
                    border: `1px solid ${active ? colors.green : colors.border}`,
                    borderRadius: 20,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {league}
                </button>
              );
            })}
          </div>
        </div>

        {/* Teams */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Favorite Teams</label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input
              type="text"
              value={teamInput}
              onChange={(e) => setTeamInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTeam())}
              placeholder="Type a team name and press Enter"
              style={{ ...inputStyle, flex: 1 }}
            />
          </div>
          {favoriteTeams.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {favoriteTeams.map(team => (
                <span
                  key={team}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 12px',
                    fontSize: 13,
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    background: colors.green + '18',
                    color: colors.green,
                    borderRadius: 16,
                  }}
                >
                  {team}
                  <button
                    onClick={() => removeTeam(team)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: colors.green,
                      cursor: 'pointer',
                      padding: 0,
                      fontSize: 16,
                      lineHeight: 1,
                    }}
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Players */}
        <div>
          <label style={labelStyle}>Favorite Players</label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input
              type="text"
              value={playerInput}
              onChange={(e) => setPlayerInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPlayer())}
              placeholder="Type a player name and press Enter"
              style={{ ...inputStyle, flex: 1 }}
            />
          </div>
          {favoritePlayers.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {favoritePlayers.map(player => (
                <span
                  key={player}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 12px',
                    fontSize: 13,
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    background: colors.cyan + '18',
                    color: colors.cyan,
                    borderRadius: 16,
                  }}
                >
                  {player}
                  <button
                    onClick={() => removePlayer(player)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: colors.cyan,
                      cursor: 'pointer',
                      padding: 0,
                      fontSize: 16,
                      lineHeight: 1,
                    }}
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* My Location */}
      <div style={sectionStyle}>
        <h2 style={sectionTitle}>My Location</h2>
        <div>
          <label style={labelStyle}>Zip Code</label>
          <input
            type="text"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            placeholder="Used to auto-fill Show Finder"
            maxLength={5}
            style={{ ...inputStyle, maxWidth: 200, letterSpacing: 4, textAlign: 'center' }}
          />
        </div>
      </div>

      {/* Notifications */}
      <div style={sectionStyle}>
        <h2 style={sectionTitle}>Notifications</h2>
        <p style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: 13,
          color: colors.muted,
          margin: '0 0 16px',
        }}>
          We&apos;ll only email you about things you opt into. No spam, ever.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { key: 'notify_drops', label: 'New Drop Alerts', desc: 'When new products hit the market', value: notifyDrops, set: setNotifyDrops },
            { key: 'notify_shows', label: 'Card Show Reminders', desc: 'Upcoming shows near your zip code', value: notifyShows, set: setNotifyShows },
            { key: 'notify_recap', label: 'Weekly Market Recap', desc: 'A summary of what moved this week', value: notifyRecap, set: setNotifyRecap },
          ].map(({ key, label, desc, value, set }) => (
            <div
              key={key}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 0',
                borderBottom: `1px solid ${colors.border}`,
              }}
            >
              <div>
                <div style={{
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontSize: 14,
                  fontWeight: 500,
                  color: colors.text,
                }}>
                  {label}
                </div>
                <div style={{
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontSize: 12,
                  color: colors.muted,
                  marginTop: 2,
                }}>
                  {desc}
                </div>
              </div>
              <button
                onClick={() => set(!value)}
                style={{
                  width: 44,
                  height: 24,
                  borderRadius: 12,
                  border: 'none',
                  background: value ? colors.green : colors.border,
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background 0.2s',
                  flexShrink: 0,
                }}
              >
                <div style={{
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  background: '#fff',
                  position: 'absolute',
                  top: 3,
                  left: value ? 23 : 3,
                  transition: 'left 0.2s',
                }} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Account Actions */}
      <div style={sectionStyle}>
        <h2 style={sectionTitle}>Account</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            onClick={async () => {
              await signOut();
              router.push('/');
            }}
            style={{
              padding: '12px',
              fontSize: 14,
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontWeight: 500,
              background: 'transparent',
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: 10,
              cursor: 'pointer',
            }}
          >
            Log Out
          </button>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                padding: '12px',
                fontSize: 14,
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontWeight: 500,
                background: 'transparent',
                color: '#FF6B6B',
                border: `1px solid ${colors.border}`,
                borderRadius: 10,
                cursor: 'pointer',
              }}
            >
              Delete Account
            </button>
          ) : (
            <div style={{
              padding: 16,
              background: '#FF6B6B11',
              border: '1px solid #FF6B6B44',
              borderRadius: 10,
              textAlign: 'center',
            }}>
              <p style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: 14,
                color: colors.text,
                margin: '0 0 12px',
              }}>
                Are you sure? This can&apos;t be undone.
              </p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{
                    padding: '8px 20px',
                    fontSize: 13,
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    background: 'transparent',
                    color: colors.muted,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 8,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  style={{
                    padding: '8px 20px',
                    fontSize: 13,
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    fontWeight: 600,
                    background: '#FF6B6B',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                  }}
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
