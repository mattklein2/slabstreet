# User Accounts & Authentication Design

**Date:** 2026-03-14
**Status:** Approved

## Overview

Add user accounts to SlabStreet with Supabase Auth. Users can sign up, build a progressive profile (X-style — all fields optional), and opt into notification preferences. Three admin accounts get elevated access to `/admin`. All existing tools remain accessible without an account.

## Authentication

### Sign-up (`/signup`)
- Email + password form
- "Continue with Google" and "Continue with Apple" social login buttons
- Supabase sends email verification after signup
- On first login, redirect to `/profile`
- Triggers a one-time welcome email (see Welcome Email section)

### Login (`/login`)
- Email + password, or social login (Google/Apple)
- "Forgot password?" link — uses Supabase's built-in password reset flow
- After login, redirect back to the page they came from

### Session Management
- Long-lived sessions (weeks/months) — users stay logged in until they explicitly log out
- `@supabase/ssr` handles cookies for server-side auth
- `middleware.ts` refreshes the auth session on every request
- `UserProvider` context (modeled after existing `ThemeProvider`) exposes `useUser()` hook app-wide

### OAuth Callback
- `app/auth/callback/route.ts` handles the redirect from Google/Apple after social login

## Database: `profiles` Table

Auto-created when a user signs up (via Supabase trigger). All fields optional except `id` and `role`.

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| `id` | uuid | — | PK, matches Supabase `auth.users.id` |
| `role` | text | `'user'` | `'user'` or `'admin'` |
| `display_name` | text | null | Optional display name |
| `zip_code` | text | null | Auto-fills Show Finder |
| `favorite_leagues` | text[] | `{}` | e.g. `['NBA','NFL']` |
| `favorite_teams` | text[] | `{}` | e.g. `['Lakers','Chiefs']` |
| `favorite_players` | text[] | `{}` | e.g. `['LeBron James']` |
| `collector_level` | text | null | `'beginner'`, `'intermediate'`, `'advanced'`, `'expert'` |
| `notify_drops` | boolean | false | Opt-in: new drop alerts |
| `notify_shows` | boolean | false | Opt-in: card show reminders near me |
| `notify_recap` | boolean | false | Opt-in: weekly market recap |
| `created_at` | timestamptz | `now()` | Auto-set |
| `updated_at` | timestamptz | `now()` | Auto-updated on changes |

### Row Level Security (RLS)
- Users can SELECT and UPDATE their own profile row only
- Admins can SELECT all profiles
- INSERT handled by database trigger (not client)

### Admin Setup
- 3 accounts (Matt + 2 partners) get `role = 'admin'` set directly in Supabase dashboard
- No self-service admin creation — manual only

## Profile Page (`/profile`)

X-style progressive profile. Everything optional, fill in over time. Auto-saves on change (no save button).

### Sections

**Account Info**
- Display name (text input)
- Email (read-only, from auth)
- Collector level (dropdown: Beginner / Intermediate / Advanced / Expert)

**My Interests**
- Favorite leagues: pill toggles for NBA, NFL, MLB, F1, WNBA, Soccer
- Favorite teams: text input, add multiple (type and enter)
- Favorite players: same pattern as teams

**My Location**
- Zip code (used to auto-fill Show Finder)

**Notifications**
- Toggle switches:
  - New drop alerts
  - Card show reminders near me
  - Weekly market recap

**Account Actions**
- Log out
- Delete account (with confirmation modal)

## Navigation Changes

### Logged Out
- Right side of nav: "Sign In" button (after search and theme toggle)

### Logged In
- Right side of nav: user avatar/initials circle
- Click opens dropdown menu:
  - Profile
  - Admin (only visible for `role = 'admin'`)
  - Log Out

## Admin & Access Control

### Protected
- `/admin` — checks `role` column, redirects non-admins to home

### Open (no auth required)
- All tools: Decoder, Show Finder, Glossary, Drop Calendar
- All content pages
- Account adds personalization, not access restrictions

### Future-ready
- When ready to charge for premium tools, add a `tier` column (`'free'` / `'pro'`) and gate specific pages — not in scope now

## Welcome Email

Triggered once on first signup. Not a drip campaign — just a single warm welcome.

**Content:**
- Thank you for joining SlabStreet
- Brief description of what we're building (collector education and tools)
- Highlight the available tools (Decoder, Show Finder, Glossary)
- Mention that more features are coming
- No promotional spam, no follow-up sequence

**Implementation:** Supabase Auth email templates (configured in Supabase dashboard) or a simple API route that sends via Resend/similar on the signup trigger.

## Files & Architecture

### New Files
| File | Purpose |
|------|---------|
| `lib/supabase-server.ts` | Server-side Supabase client with cookie handling |
| `lib/supabase-browser.ts` | Browser-side Supabase client |
| `app/components/UserProvider.tsx` | Auth context, `useUser()` hook |
| `app/login/page.tsx` | Login page |
| `app/signup/page.tsx` | Signup page |
| `app/profile/page.tsx` | Profile page |
| `app/auth/callback/route.ts` | OAuth callback handler |
| `middleware.ts` | Session refresh on every request |

### Modified Files
| File | Change |
|------|--------|
| `app/components/layout/Nav.tsx` | Add Sign In button / user dropdown menu |
| `app/admin/page.tsx` | Add admin role check, redirect non-admins |
| `app/layout.tsx` | Wrap app with `UserProvider` |

### New Package
- `@supabase/ssr` — server-side auth with cookies for Next.js

### Replaced File
- `lib/supabase.ts` → split into `lib/supabase-server.ts` and `lib/supabase-browser.ts`
  - Existing imports updated to use the appropriate client

## Not In Scope
- Payment/billing (future Layer 3)
- Collection tracker (future feature)
- Actual email sending infrastructure (store preferences now, build sending later)
- Public user profiles (profiles are private for now)
