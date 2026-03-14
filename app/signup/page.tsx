'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '../components/ThemeProvider';
import { createClient } from '@/lib/supabase-browser';

export default function SignupPage() {
  const { colors } = useTheme();
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/profile`,
      },
    });

    if (signupError) {
      setError(signupError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  async function handleSocialLogin(provider: 'google' | 'apple') {
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/profile`,
      },
    });

    if (oauthError) {
      setError(oauthError.message);
    }
  }

  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}>
        <div style={{
          background: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: 16,
          padding: '48px 40px',
          maxWidth: 420,
          width: '100%',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
          <h2 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 28,
            color: colors.text,
            letterSpacing: 1,
            margin: '0 0 12px',
          }}>
            Check Your Email
          </h2>
          <p style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: 14,
            color: colors.muted,
            lineHeight: 1.6,
          }}>
            We sent a confirmation link to <strong style={{ color: colors.text }}>{email}</strong>.
            Click the link to activate your account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: 16,
        padding: '48px 40px',
        maxWidth: 420,
        width: '100%',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 32,
              letterSpacing: 2,
              color: colors.green,
            }}>
              SLABSTREET
            </span>
          </Link>
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 24,
            color: colors.text,
            letterSpacing: 1,
            margin: '16px 0 4px',
          }}>
            Create Your Account
          </h1>
          <p style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: 14,
            color: colors.muted,
            margin: 0,
          }}>
            Join the community of smart collectors
          </p>
        </div>

        {/* Social Login Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          <button
            onClick={() => handleSocialLogin('google')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              padding: '12px 16px',
              fontSize: 14,
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontWeight: 500,
              background: 'transparent',
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: 10,
              cursor: 'pointer',
              transition: 'border-color 0.15s',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
          <button
            onClick={() => handleSocialLogin('apple')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              padding: '12px 16px',
              fontSize: 14,
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontWeight: 500,
              background: 'transparent',
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: 10,
              cursor: 'pointer',
              transition: 'border-color 0.15s',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={colors.text}>
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            Continue with Apple
          </button>
        </div>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          margin: '24px 0',
        }}>
          <div style={{ flex: 1, height: 1, background: colors.border }} />
          <span style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: 12,
            color: colors.muted,
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}>
            or
          </span>
          <div style={{ flex: 1, height: 1, background: colors.border }} />
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{
              display: 'block',
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: 12,
              fontWeight: 500,
              color: colors.muted,
              marginBottom: 6,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: 14,
                fontFamily: "'IBM Plex Sans', sans-serif",
                background: colors.bg,
                color: colors.text,
                border: `1px solid ${colors.border}`,
                borderRadius: 10,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div>
            <label style={{
              display: 'block',
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: 12,
              fontWeight: 500,
              color: colors.muted,
              marginBottom: 6,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="At least 6 characters"
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: 14,
                fontFamily: "'IBM Plex Sans', sans-serif",
                background: colors.bg,
                color: colors.text,
                border: `1px solid ${colors.border}`,
                borderRadius: 10,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {error && (
            <p style={{
              color: '#FF6B6B',
              fontSize: 13,
              fontFamily: "'IBM Plex Sans', sans-serif",
              margin: 0,
            }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '14px',
              fontSize: 15,
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontWeight: 600,
              background: colors.green,
              color: '#0a0f1a',
              border: 'none',
              borderRadius: 10,
              cursor: loading ? 'wait' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'opacity 0.15s',
              marginTop: 4,
            }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Login link */}
        <p style={{
          textAlign: 'center',
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: 13,
          color: colors.muted,
          marginTop: 24,
          marginBottom: 0,
        }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: colors.green, textDecoration: 'none', fontWeight: 500 }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
