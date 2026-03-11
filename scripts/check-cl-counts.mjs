import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '..', '.env.local');
const envText = readFileSync(envPath, 'utf-8');
const env = {};
for (const line of envText.split(/\r?\n/)) {
  const idx = line.indexOf('=');
  if (idx > 0 && !line.startsWith('#')) {
    env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
}

const s = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const { data: all } = await s.from('players').select('name, league, cardladder').not('cardladder', 'is', null);

let totalScraped = 0;
let totalAvailable = 0;
const perLeague = {};

for (const p of all) {
  const cl = typeof p.cardladder === 'string' ? JSON.parse(p.cardladder) : p.cardladder;
  const count = cl?.cards?.length || 0;
  const total = cl?.totalCards || 0;
  totalScraped += count;
  totalAvailable += total;
  const lg = p.league || 'OTHER';
  if (!perLeague[lg]) perLeague[lg] = { scraped: 0, totalOnCL: 0, players: 0 };
  perLeague[lg].scraped += count;
  perLeague[lg].totalOnCL += total;
  perLeague[lg].players += 1;
}

console.log('Cards already scraped into cardladder.cards[]:', totalScraped);
console.log('CardLadder totalCards field sum:', totalAvailable);
console.log('\nPer league:');
for (const [lg, d] of Object.entries(perLeague).sort((a, b) => b[1].totalOnCL - a[1].totalOnCL)) {
  console.log(`  ${lg.padEnd(12)} players: ${String(d.players).padStart(4)} | scraped cards: ${String(d.scraped).padStart(6)} | CL totalCards: ${String(d.totalOnCL).padStart(8)}`);
}

// Also check cards table
const { count: cardsInTable } = await s.from('cards').select('*', { count: 'exact', head: true });
console.log('\nCards currently in cards table:', cardsInTable);
