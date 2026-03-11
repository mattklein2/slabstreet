/**
 * Seed the `cards` table from CardLadder JSONB data stored on players.
 *
 * Usage:
 *   node scripts/seed-cards-from-cardladder.mjs
 *   node scripts/seed-cards-from-cardladder.mjs --league=NBA --limit=50 --dry-run
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { generateCardSlug } from './lib/card-slug.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '..', '.env.local');
const envLines = readFileSync(envPath, 'utf-8').split('\n');
const env = {};
for (const line of envLines) {
  const m = line.match(/^([^#=][^=]*)=(.*)/);
  if (m) env[m[1].trim()] = m[2].trim();
}
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Parse CLI args
const args = Object.fromEntries(
  process.argv.slice(2)
    .filter(a => a.startsWith('--'))
    .map(a => {
      const [key, val] = a.slice(2).split('=');
      return [key, val ?? true];
    })
);

const leagueFilter = args.league || null;
const limit = args.limit ? parseInt(args.limit, 10) : null;
const dryRun = args['dry-run'] === true || args['dry-run'] === 'true';

if (dryRun) {
  console.log('[dry-run] No data will be written to Supabase.');
}

async function fetchAllPlayers() {
  const allPlayers = [];
  const pageSize = 500;
  let from = 0;

  while (true) {
    let query = supabase
      .from('players')
      .select('slug, league, cardladder')
      .not('cardladder', 'is', null)
      .range(from, from + pageSize - 1);

    if (leagueFilter) {
      query = query.eq('league', leagueFilter);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Failed to fetch players:', error.message);
      process.exit(1);
    }

    if (!data || data.length === 0) break;
    allPlayers.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return allPlayers;
}

async function main() {
  let players = await fetchAllPlayers();

  if (limit) {
    players = players.slice(0, limit);
  }

  if (players.length === 0) {
    console.log('No players found with cardladder data.');
    return;
  }

  console.log(`Processing ${players.length} player(s)...`);

  let totalSeeded = 0;

  for (const player of players) {
    const { slug: playerSlug, league, cardladder } = player;
    const cards = cardladder?.cards;

    if (!Array.isArray(cards) || cards.length === 0) {
      continue;
    }

    const rows = [];

    for (const card of cards) {
      const year = card.year;
      const setName = card.set;
      const cardNumber = card.cardNumber;
      const parallel = card.parallel || 'Base';
      const imageUrl = card.image || null;

      if (!year || !setName) {
        continue;
      }

      const slug = generateCardSlug(playerSlug, year, setName, parallel, cardNumber);

      rows.push({
        slug,
        player_slug: playerSlug,
        year: parseInt(year, 10) || null,
        set_name: setName,
        parallel,
        card_number: cardNumber ? String(cardNumber).replace(/^#/, '') : null,
        league: league || 'NBA',
        image_url: imageUrl,
        updated_at: new Date().toISOString(),
      });
    }

    // Deduplicate by slug (keep last occurrence)
    const slugMap = new Map();
    for (const row of rows) {
      slugMap.set(row.slug, row);
    }
    const dedupedRows = [...slugMap.values()];

    if (dedupedRows.length === 0) {
      continue;
    }

    if (dryRun) {
      console.log(`[dry-run] Would upsert ${dedupedRows.length} card(s) for ${playerSlug}`);
      totalSeeded += dedupedRows.length;
      continue;
    }

    const { error: upsertError } = await supabase
      .from('cards')
      .upsert(dedupedRows, { onConflict: 'slug', ignoreDuplicates: false });

    if (upsertError) {
      console.error(`Failed to upsert cards for ${playerSlug}:`, upsertError.message);
      continue;
    }

    console.log(`Seeded ${dedupedRows.length} cards for ${playerSlug}`);
    totalSeeded += dedupedRows.length;
  }

  console.log(`\nDone. Total cards seeded: ${totalSeeded}`);
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
