import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = {};
for (const line of readFileSync(resolve(__dirname, '..', '.env.local'), 'utf-8').split('\n')) {
  const m = line.match(/^([^#=][^=]*)=(.*)/);
  if (m) env[m[1].trim()] = m[2].trim();
}
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// ── 1. Fix leagues on the 26 pre-existing players ────────────
const NBA_SLUGS = ['wemby', 'ant', 'ja', 'luka'];
const NFL_SLUGS = ['mahomes', 'burrow', 'calebwilliams', 'anthonyrichardson', 'kylermurray'];
const F1_SLUGS  = [
  'verstappen', 'norris', 'hamilton', 'piastri', 'leclerc', 'antonelli',
  'russell', 'alonso', 'bearman', 'sainz', 'lawson', 'bortoleto',
  'doohan', 'hulkenberg', 'hadjar', 'colapinto', 'tsunoda',
];

console.log('Fixing leagues on pre-existing players...');

let r;
r = await sb.from('players').update({ league: 'NBA' }).in('slug', NBA_SLUGS);
console.log(`  NBA (${NBA_SLUGS.length}): ${r.error ? 'ERROR ' + r.error.message : 'OK'}`);

r = await sb.from('players').update({ league: 'NFL' }).in('slug', NFL_SLUGS);
console.log(`  NFL (${NFL_SLUGS.length}): ${r.error ? 'ERROR ' + r.error.message : 'OK'}`);

r = await sb.from('players').update({ league: 'F1' }).in('slug', F1_SLUGS);
console.log(`  F1  (${F1_SLUGS.length}): ${r.error ? 'ERROR ' + r.error.message : 'OK'}`);

// ── 2. Delete seed-created duplicates (keep the originals with custom scores) ──
const DUPES_TO_DELETE = [
  // NBA dupes
  'victor-wembanyama', 'anthony-edwards', 'ja-morant', 'luka-doncic',
  // NFL dupes
  'patrick-mahomes', 'joe-burrow', 'caleb-williams', 'anthony-richardson', 'kyler-murray',
  // F1 dupes
  'max-verstappen', 'lando-norris', 'lewis-hamilton', 'oscar-piastri',
  'charles-leclerc', 'andrea-kimi-antonelli', 'george-russell', 'fernando-alonso',
  'oliver-bearman', 'carlos-sainz', 'liam-lawson', 'gabriel-bortoleto',
  'jack-doohan', 'nico-hulkenberg', 'isack-hadjar', 'yuki-tsunoda',
];

console.log(`\nDeleting ${DUPES_TO_DELETE.length} seed duplicates...`);
r = await sb.from('players').delete().in('slug', DUPES_TO_DELETE);
console.log(`  ${r.error ? 'ERROR ' + r.error.message : 'OK'}`);

// ── 3. Verify ────────────────────────────────────────────────
console.log('\nVerifying...');
const { data, count } = await sb.from('players').select('slug, name, team, league, score', { count: 'exact' });
const nullLeague = data.filter(p => !p.league);
const byLeague = {};
for (const p of data) { byLeague[p.league || 'null'] = (byLeague[p.league || 'null'] || 0) + 1; }

console.log(`  Total players: ${data.length}`);
console.log(`  By league:`, byLeague);
if (nullLeague.length) {
  console.log(`  WARNING: ${nullLeague.length} players with null league:`);
  nullLeague.forEach(p => console.log(`    ${p.slug} - ${p.name}`));
}

// Check the original players are correct
const originals = [...NBA_SLUGS, ...NFL_SLUGS, ...F1_SLUGS];
const { data: check } = await sb.from('players').select('slug, name, league, score').in('slug', originals);
console.log('\nOriginal players after fix:');
for (const p of (check || [])) {
  console.log(`  ${p.slug.padEnd(22)} ${p.league.padEnd(4)} ${p.score} ${p.name}`);
}
