# User Accounts & Authentication Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add user accounts with Supabase Auth, progressive profiles, admin roles, and notification preferences.

**Architecture:** Supabase Auth handles signup/login/sessions via `@supabase/ssr`. A `profiles` table stores optional user data. `UserProvider` context (mirroring existing `ThemeProvider`) makes auth state available app-wide. Long-lived sessions keep users logged in.

**Tech Stack:** Supabase Auth, @supabase/ssr, Next.js 16 App Router, React 19 Context API

**Spec:** `docs/superpowers/specs/2026-03-14-user-accounts-auth-design.md`

---

## Task 1: Install @supabase/ssr and create Supabase clients

**Files:**
- Modify: `package.json`
- Create: `lib/supabase-browser.ts`
- Create: `lib/supabase-server.ts`
- Modify: all files importing from `lib/supabase.ts`

- [ ] **Step 1: Install @supabase/ssr**

```bash
npm install @supabase/ssr
```

- [ ] **Step 2: Create browser-side client**

Create `lib/supabase-browser.ts`:
```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 3: Create server-side client**

Create `lib/supabase-server.ts`:
```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
}
```

- [ ] **Step 4: Update all existing imports**

Find all files importing from `lib/supabase` and update:
- Server components / API routes → `import { createClient } from '@/lib/supabase-server'`
- Client components → `import { createClient } from '@/lib/supabase-browser'`
- Each call site needs `const supabase = createClient()` (server) or `const supabase = createClient()` (browser)
- Server-side calls: `const supabase = await createClient()`

- [ ] **Step 5: Verify build passes**

```bash
npx next build
```

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: split Supabase client into browser/server with @supabase/ssr"
```

---

## Task 2: Create middleware for session refresh

**Files:**
- Create: `middleware.ts` (project root)

- [ ] **Step 1: Create middleware**

Create `middleware.ts` at project root:
```typescript
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
```

- [ ] **Step 2: Verify build**
- [ ] **Step 3: Commit**

---

## Task 3: Create UserProvider context

**Files:**
- Create: `app/components/UserProvider.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create UserProvider**

Model after ThemeProvider. Provides `user`, `profile`, `loading`, `signOut` via `useUser()` hook.
- Listen to `onAuthStateChange` for login/logout events
- Fetch profile from `profiles` table when user is authenticated
- Handle hydration with `mounted` state

- [ ] **Step 2: Wrap app in UserProvider**

Modify `app/layout.tsx` to nest `UserProvider` inside `ThemeProvider`.

- [ ] **Step 3: Verify build**
- [ ] **Step 4: Commit**

---

## Task 4: Create profiles table in Supabase

**Files:**
- Create: `scripts/migrations/009-create-profiles-table.sql`

- [ ] **Step 1: Write migration SQL**

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  display_name TEXT,
  zip_code TEXT,
  favorite_leagues TEXT[] DEFAULT '{}',
  favorite_teams TEXT[] DEFAULT '{}',
  favorite_players TEXT[] DEFAULT '{}',
  collector_level TEXT CHECK (collector_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  notify_drops BOOLEAN DEFAULT FALSE,
  notify_shows BOOLEAN DEFAULT FALSE,
  notify_recap BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

- [ ] **Step 2: Run migration in Supabase dashboard**
- [ ] **Step 3: Commit migration file**

---

## Task 5: Create signup page

**Files:**
- Create: `app/signup/page.tsx`

- [ ] **Step 1: Build signup page**

Full-page form with:
- Email + password fields
- "Continue with Google" button
- "Continue with Apple" button
- Link to /login for existing users
- Uses SlabStreet dark theme styling (inline styles, colors from useTheme)
- On success, redirect to /profile

- [ ] **Step 2: Verify build and test manually**
- [ ] **Step 3: Commit**

---

## Task 6: Create login page

**Files:**
- Create: `app/login/page.tsx`

- [ ] **Step 1: Build login page**

Similar layout to signup:
- Email + password fields
- Social login buttons
- "Forgot password?" link (triggers Supabase reset)
- Link to /signup for new users
- Redirects back to previous page on success

- [ ] **Step 2: Verify build and test**
- [ ] **Step 3: Commit**

---

## Task 7: Create OAuth callback route

**Files:**
- Create: `app/auth/callback/route.ts`

- [ ] **Step 1: Create callback handler**

Handles the redirect from Google/Apple OAuth:
```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
```

- [ ] **Step 2: Commit**

---

## Task 8: Create profile page

**Files:**
- Create: `app/profile/page.tsx`

- [ ] **Step 1: Build profile page**

Sections (all fields optional, auto-save on change):
- Account Info: display name, email (read-only), collector level dropdown
- My Interests: league pill toggles, favorite teams (tag input), favorite players (tag input)
- My Location: zip code
- Notifications: toggle switches for drops, shows, recap
- Account Actions: log out, delete account

- [ ] **Step 2: Verify build and test**
- [ ] **Step 3: Commit**

---

## Task 9: Update Nav with auth UI

**Files:**
- Modify: `app/components/layout/Nav.tsx`

- [ ] **Step 1: Add auth state to Nav**

- Import `useUser()` from UserProvider
- Logged out: show "Sign In" button on right side
- Logged in: show user initials avatar circle
- Click avatar: dropdown with Profile, Admin (if admin), Log Out

- [ ] **Step 2: Verify build and test**
- [ ] **Step 3: Commit**

---

## Task 10: Protect admin page

**Files:**
- Modify: `app/admin/page.tsx`

- [ ] **Step 1: Add admin check**

- Use `useUser()` hook to check `profile?.role === 'admin'`
- If not admin or not logged in, redirect to home
- Show loading state while checking auth

- [ ] **Step 2: Verify build**
- [ ] **Step 3: Commit**

---

## Task 11: Configure Supabase Auth settings

- [ ] **Step 1: Configure in Supabase dashboard**
  - Enable Google OAuth provider
  - Enable Apple OAuth provider
  - Set JWT expiry to long-lived (e.g., 604800 seconds = 7 days)
  - Configure email templates (confirmation, welcome)
  - Set redirect URLs for OAuth callbacks

- [ ] **Step 2: Add OAuth redirect URL to .env.local if needed**

---

## Task 12: Final integration and push

- [ ] **Step 1: Full build verification**
```bash
npx next build
```

- [ ] **Step 2: Push all commits**
```bash
git push
```
