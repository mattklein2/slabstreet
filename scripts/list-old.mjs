import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '..', '.env.local');
const env = {};
for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
  const m = line.match(/^([^#=][^=]*)=(.*)/);
  if (m) env[m[1].trim()] = m[2].trim();
}

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const { data } = await sb.from('players').select('slug, name, team, league, score, signal').order('score', { ascending: false });

// Pre-existing = score != 50 or signal != HOLD
const preExisting = data.filter(p => p.score !== 50 || p.signal !== 'HOLD');
console.log(`Pre-existing players (${preExisting.length}):`);
for (const p of preExisting) {
  console.log(`  ${(p.slug||'').padEnd(25)} ${(p.name||'').padEnd(28)} ${(p.team||'').padEnd(6)} ${(p.league||'null').padEnd(6)} ${p.score} ${p.signal}`);
}

// Find potential duplicates: old short slugs that have a matching full-name slug
console.log('\nAll players with score != 50 or non-HOLD signal (old entries):');
const allSlugs = new Set(data.map(p => p.slug));
for (const p of preExisting) {
  // Check if there's a full-name version
  const fullSlug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (fullSlug !== p.slug && allSlugs.has(fullSlug)) {
    console.log(`  DUPLICATE: "${p.slug}" and "${fullSlug}" (${p.name})`);
  }
}
