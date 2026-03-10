#!/usr/bin/env node

/**
 * Adds the 'cardladder' JSONB column to the players table in Supabase.
 * Run once: node scripts/add-cardladder-column.mjs
 *
 * This uses the Supabase REST API (rpc) to execute raw SQL.
 * If that fails, you can manually run this SQL in the Supabase dashboard:
 *
 *   ALTER TABLE players ADD COLUMN IF NOT EXISTS cardladder JSONB;
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local
const envPath = resolve(__dirname, '..', '.env.local');
const envLines = readFileSync(envPath, 'utf-8').split('\n');
const env = {};
for (const line of envLines) {
  const m = line.match(/^([^#=][^=]*)=(.*)/);
  if (m) env[m[1].trim()] = m[2].trim();
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function main() {
  console.log('Adding cardladder column to players table...\n');

  // Try using the Supabase REST API to check if column exists
  const testUrl = `${supabaseUrl}/rest/v1/players?select=cardladder&limit=1`;
  const testRes = await fetch(testUrl, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
    },
  });

  if (testRes.ok) {
    console.log('✓ Column "cardladder" already exists in the players table.');
    return;
  }

  const errBody = await testRes.text();
  if (errBody.includes('cardladder')) {
    console.log('Column does not exist yet.');
    console.log('\nPlease run this SQL in the Supabase Dashboard SQL Editor:');
    console.log('  https://supabase.com/dashboard/project/dafctdqkbmzjtkssebwx/sql');
    console.log('\n  ALTER TABLE players ADD COLUMN IF NOT EXISTS cardladder JSONB;\n');
    console.log('After running the SQL, the scraper and API will work.');
  } else {
    console.log('Unexpected response:', errBody);
  }
}

main().catch(err => { console.error('Error:', err); process.exit(1); });
