# SlabStreet

Sports card collector education platform. Next.js 16 App Router, React 19, TypeScript, Tailwind v4, Supabase backend. Deployed on Netlify.

## Communication Rules
- Be concise. No filler, no summaries, no restating what I said.
- Skip explanations unless I ask "why."
- Don't add docstrings, comments, or type annotations to code you didn't change.
- I'm non-technical — when I DO need explanations, keep them simple.

## Working Rules
- If an approach isn't working, STOP and rethink. Don't push through a broken path.
- Never say "done" without verifying the change actually works (build, test, or demonstrate).
- When given a bug report, just fix it — diagnose from logs/errors, don't ask me to investigate.
- Find root causes. No band-aid fixes.
- If the optimal approach hits a wall, TELL ME before falling back to a workaround. I can log in, sign up, fix permissions, or whatever is needed to do it the right way.

## Build & Run
- `npm run build && npm run start` (Turbopack dev server crashes on Windows)
- preview_start doesn't work on Windows — use Bash for servers, Chrome MCP or Netlify deploy for visual verification
- `.env.local` has all keys (Supabase, eBay, PSA, X/Twitter, Anthropic, Firebase)

## Conventions
- camelCase for API fields, snake_case for DB columns
- Theme: inline styles via `useTheme()` hook, NOT CSS classes
- Dark palette: `#0a0f1a` bg, `#111827` surfaces, `#00ff87` accent
- Fonts: Bebas Neue (display), IBM Plex Sans (body), IBM Plex Mono (data)
- 12-16px border-radius, spacious padding

## Key Files
- `app/components/ThemeProvider.tsx` — color system
- `app/components/UserProvider.tsx` — auth context (has retry + delay)
- `app/components/layout/Nav.tsx` — nav with league tabs, auth
- `middleware.ts` — Supabase session refresh

## Live Routes
- `/xray` — Card X-Ray (flagship: eBay link → identity + rarity + comps)
- `/decoder` — What Did I Pull? (color/pattern ID)
- `/shows` — Card Show Finder (zip-based)
- `/ebay-search` — eBay search builder
- `/learn` — Glossary (100+ terms)
- `/admin/dashboard` — user analytics (admin only)

## Important
- Don't over-filter sold comps data — capture all sales, even rare cards with only 2 sales
- Supabase Auth with profiles table, RLS policies in place
- DATABASE_URL uses Supabase pooler
