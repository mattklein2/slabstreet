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

// Fix remaining null-league F1 players
const F1_FIX = ['stroll', 'albon', 'gasly', 'ocon', 'magnussen'];
console.log('Fixing remaining null-league F1 drivers...');
const r = await sb.from('players').update({ league: 'F1' }).in('slug', F1_FIX);
console.log(`  ${r.error ? 'ERROR ' + r.error.message : 'OK'}`);

// Also delete their seed duplicates if any
const F1_DUPES = ['lance-stroll', 'alexander-albon', 'pierre-gasly', 'esteban-ocon', 'kevin-magnussen'];
const r2 = await sb.from('players').delete().in('slug', F1_DUPES);
console.log(`  Deleted dupes: ${r2.error ? 'ERROR ' + r2.error.message : 'OK'}`);

// Get accurate totals (paginate past 1000 limit)
console.log('\nCounting by league...');
for (const league of ['NBA', 'NFL', 'MLB', 'NHL', 'F1']) {
  const { count } = await sb.from('players').select('slug', { count: 'exact', head: true }).eq('league', league);
  console.log(`  ${league}: ${count}`);
}
const { count: nullCount } = await sb.from('players').select('slug', { count: 'exact', head: true }).is('league', null);
console.log(`  null: ${nullCount}`);
const { count: total } = await sb.from('players').select('slug', { count: 'exact', head: true });
console.log(`  TOTAL: ${total}`);
