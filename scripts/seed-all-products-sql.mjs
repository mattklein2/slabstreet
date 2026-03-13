#!/usr/bin/env node

/**
 * Generate SQL to insert all products, then execute via Supabase RPC.
 * Works around RLS by using the rpc endpoint with a raw SQL function,
 * or outputs SQL for manual execution in Supabase SQL Editor.
 *
 * Usage:
 *   node scripts/seed-all-products-sql.mjs          # outputs SQL
 *   node scripts/seed-all-products-sql.mjs --exec   # tries to execute via API
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const envPath = resolve(ROOT, '.env.local');
const env = {};
if (existsSync(envPath)) {
  readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
    const m = line.match(/^([^#=][^=]*)=(.*)/);
    if (m) env[m[1].trim()] = m[2].trim();
  });
}

const PANINI = 'b0000000-0000-0000-0000-000000000001';
const TOPPS = 'b0000000-0000-0000-0000-000000000002';
const UPPER_DECK = 'b0000000-0000-0000-0000-000000000003';

const products = [
  // NBA 2024-25
  { id: 'c0000000-0000-0000-0000-000000000009', brand_id: PANINI, name: 'Hoops', sport: 'NBA', year: '2024-25', is_flagship: false, description: 'The entry-level NBA product. First cards of the season, affordable packs, and a great starting point for beginners.', pros_cons: { pros: ['Most affordable NBA product', 'First rookies of the season', 'Easy to find at retail', 'Fun insert sets'], cons: ['Low resale value', 'No chrome finish', 'Base cards worth very little'] } },
  { id: 'c0000000-0000-0000-0000-00000000000a', brand_id: PANINI, name: 'Select', sport: 'NBA', year: '2024-25', is_flagship: false, description: 'Premium NBA product with tiered card design — Concourse, Premier, and Courtside levels. Strong parallel rainbow.', pros_cons: { pros: ['Three-tier card design looks great', 'Strong resale on color parallels', 'Multiple hits per hobby box', 'Tie-dye parallels are iconic'], cons: ['Expensive hobby boxes ($500+)', 'Confusing tier system for beginners', 'Retail hard to find'] } },
  { id: 'c0000000-0000-0000-0000-00000000000b', brand_id: PANINI, name: 'Mosaic', sport: 'NBA', year: '2024-25', is_flagship: false, description: 'Mid-tier chrome product with mosaic pattern design. Popular for its colorful parallels and accessible price point.', pros_cons: { pros: ['Distinctive mosaic pattern', 'Good parallel variety', 'More affordable than Prizm', 'Strong retail availability'], cons: ['Not as prestigious as Prizm', 'Hobby boxes still pricey', 'Base cards have modest value'] } },
  { id: 'c0000000-0000-0000-0000-00000000000c', brand_id: PANINI, name: 'Court Kings', sport: 'NBA', year: '2024-25', is_flagship: false, description: 'Art-themed basketball product with painted card designs. Unique aesthetic that stands out from traditional chrome products.', pros_cons: { pros: ['Beautiful artistic card design', 'Unique in the market', 'Numbered rookie parallels', 'Fresh Points inserts are popular'], cons: ['Niche collector appeal', 'Lower resale than Prizm/Select', 'Limited retail availability'] } },
  { id: 'c0000000-0000-0000-0000-00000000000d', brand_id: PANINI, name: 'Contenders', sport: 'NBA', year: '2024-25', is_flagship: false, description: 'Ticket-themed basketball product. Known for Rookie Ticket autographs — one of the most collected rookie auto sets.', pros_cons: { pros: ['Iconic Rookie Ticket autos', 'Strong auto checklist', 'Good mix of veterans and rookies', 'Playoff Ticket parallels are popular'], cons: ['Non-chrome base cards', 'Expensive for what you get', 'Value concentrated in autos'] } },
  // NBA 2025-26
  { id: 'c0000000-0000-0000-0000-000000000018', brand_id: PANINI, name: 'Prizm', sport: 'NBA', year: '2025-26', is_flagship: true, description: 'The flagship basketball card product. Massive parallel rainbow, iconic Silver Prizm, strong resale value across all levels.', pros_cons: { pros: ['Best resale value in basketball', 'Iconic Silver Prizm parallel', 'Huge parallel rainbow', 'Strong rookie card demand'], cons: ['Expensive hobby boxes ($300+)', 'Retail is hard to find', 'High print run on base cards'] } },
  { id: 'c0000000-0000-0000-0000-000000000019', brand_id: PANINI, name: 'Donruss', sport: 'NBA', year: '2025-26', is_flagship: false, description: 'Budget-friendly basketball product. Good entry point with Rated Rookies and fun inserts.', pros_cons: { pros: ['Affordable entry point', 'Rated Rookies are iconic', 'Fun insert sets'], cons: ['Lower resale than Prizm', 'No licensed NBA logos', 'Base cards have little value'] } },
  { id: 'c0000000-0000-0000-0000-00000000001a', brand_id: PANINI, name: 'Hoops', sport: 'NBA', year: '2025-26', is_flagship: false, description: 'The entry-level NBA product. First cards of the season, affordable packs, and a great starting point for beginners.', pros_cons: { pros: ['Most affordable NBA product', 'First rookies of the season', 'Easy to find at retail', 'Fun insert sets'], cons: ['Low resale value', 'No chrome finish', 'Base cards worth very little'] } },
  { id: 'c0000000-0000-0000-0000-00000000001b', brand_id: PANINI, name: 'Optic', sport: 'NBA', year: '2025-26', is_flagship: false, description: 'Chrome version of Donruss. Better parallels and finish than base Donruss with strong collector demand.', pros_cons: { pros: ['Chromium finish looks premium', 'Rated Rookies in chrome', 'Good parallel variety'], cons: ['More expensive than Donruss', 'Still no NBA logos', 'Hobby boxes are pricey'] } },
  { id: 'c0000000-0000-0000-0000-00000000001c', brand_id: PANINI, name: 'Select', sport: 'NBA', year: '2025-26', is_flagship: false, description: 'Premium NBA product with tiered card design — Concourse, Premier, and Courtside levels.', pros_cons: { pros: ['Three-tier card design', 'Strong resale on color parallels', 'Tie-dye parallels are iconic'], cons: ['Expensive hobby boxes', 'Confusing tier system', 'Retail hard to find'] } },
  { id: 'c0000000-0000-0000-0000-00000000001d', brand_id: PANINI, name: 'Mosaic', sport: 'NBA', year: '2025-26', is_flagship: false, description: 'Mid-tier chrome product with mosaic pattern design. Popular for its colorful parallels.', pros_cons: { pros: ['Distinctive mosaic pattern', 'Good parallel variety', 'More affordable than Prizm'], cons: ['Not as prestigious as Prizm', 'Hobby boxes still pricey'] } },
  // NFL 2024
  { id: 'c0000000-0000-0000-0000-00000000000e', brand_id: PANINI, name: 'Select', sport: 'NFL', year: '2024', is_flagship: false, description: 'Premium football product with tiered card design — Club, Field, and Premier levels. Strong parallel rainbow.', pros_cons: { pros: ['Three-tier design is popular', 'Strong parallel variety', 'Tie-dye and Zebra parallels are sought after'], cons: ['Very expensive hobby boxes', 'Complex tier system', 'Retail is scarce'] } },
  { id: 'c0000000-0000-0000-0000-00000000000f', brand_id: PANINI, name: 'Mosaic', sport: 'NFL', year: '2024', is_flagship: false, description: 'Mid-tier chrome football product with mosaic pattern. Accessible price point with good parallel variety.', pros_cons: { pros: ['Affordable chrome product', 'Colorful parallels', 'Good retail availability', 'Genesis parallels are popular'], cons: ['Not as premium as Prizm', 'Base card values are low', 'Over-produced in some formats'] } },
  { id: 'c0000000-0000-0000-0000-000000000010', brand_id: PANINI, name: 'Optic', sport: 'NFL', year: '2024', is_flagship: false, description: 'Chrome version of Donruss Football. Rated Rookies in chrome finish with a strong parallel rainbow.', pros_cons: { pros: ['Chrome Rated Rookies', 'Good parallel variety', 'Strong collector demand'], cons: ['No NFL team logos', 'Expensive hobby boxes', 'Late season release'] } },
  { id: 'c0000000-0000-0000-0000-000000000011', brand_id: PANINI, name: 'Score', sport: 'NFL', year: '2024', is_flagship: false, description: 'The most affordable NFL product. Great for beginners and young collectors. First product of the football season.', pros_cons: { pros: ['Cheapest NFL product', 'First cards of the season', 'Great for kids and new collectors', 'Large set to build'], cons: ['Very low resale value', 'No chrome or premium finish', 'No autographs in retail'] } },
  { id: 'c0000000-0000-0000-0000-000000000012', brand_id: PANINI, name: 'Contenders', sport: 'NFL', year: '2024', is_flagship: false, description: 'Ticket-themed football product. Known for Rookie Ticket autographs — the most collected rookie auto set in football.', pros_cons: { pros: ['Iconic Rookie Ticket autos', 'Best auto checklist in football', 'Playoff Ticket parallels'], cons: ['Non-chrome base cards', 'Very expensive', 'Value concentrated in QB autos'] } },
  // NFL 2025
  { id: 'c0000000-0000-0000-0000-00000000001e', brand_id: PANINI, name: 'Prizm', sport: 'NFL', year: '2025', is_flagship: true, description: 'The flagship football card product. Huge parallel rainbow and the most collected football product.', pros_cons: { pros: ['Most collected football product', 'Strong rookie QB demand', 'Massive parallel rainbow'], cons: ['Very expensive hobby boxes', 'Retail extremely hard to find', 'Market depends on QB class'] } },
  { id: 'c0000000-0000-0000-0000-00000000001f', brand_id: PANINI, name: 'Donruss', sport: 'NFL', year: '2025', is_flagship: false, description: 'Budget football product with Rated Rookies. Great for new collectors.', pros_cons: { pros: ['Affordable', 'Rated Rookies are popular', 'Easy to find at retail'], cons: ['No NFL team logos', 'Lower resale value', 'Base cards worth very little'] } },
  { id: 'c0000000-0000-0000-0000-000000000020', brand_id: PANINI, name: 'Score', sport: 'NFL', year: '2025', is_flagship: false, description: 'The most affordable NFL product. First cards of the football season.', pros_cons: { pros: ['Cheapest NFL product', 'First cards of the season', 'Great for beginners'], cons: ['Very low resale value', 'No premium finish', 'No autographs in retail'] } },
  { id: 'c0000000-0000-0000-0000-000000000021', brand_id: PANINI, name: 'Select', sport: 'NFL', year: '2025', is_flagship: false, description: 'Premium football product with tiered card design.', pros_cons: { pros: ['Three-tier design', 'Strong parallel variety', 'Tie-dye and Zebra parallels'], cons: ['Very expensive hobby boxes', 'Complex tier system', 'Retail is scarce'] } },
  { id: 'c0000000-0000-0000-0000-000000000022', brand_id: PANINI, name: 'Mosaic', sport: 'NFL', year: '2025', is_flagship: false, description: 'Mid-tier chrome football product with mosaic pattern.', pros_cons: { pros: ['Affordable chrome product', 'Colorful parallels', 'Genesis parallels are popular'], cons: ['Not as premium as Prizm', 'Base card values low'] } },
  { id: 'c0000000-0000-0000-0000-000000000023', brand_id: PANINI, name: 'Optic', sport: 'NFL', year: '2025', is_flagship: false, description: 'Chrome version of Donruss Football. Rated Rookies in chrome finish.', pros_cons: { pros: ['Chrome Rated Rookies', 'Good parallel variety', 'Strong collector demand'], cons: ['No NFL team logos', 'Expensive hobby boxes'] } },
  { id: 'c0000000-0000-0000-0000-000000000024', brand_id: PANINI, name: 'Contenders', sport: 'NFL', year: '2025', is_flagship: false, description: 'Ticket-themed football product with Rookie Ticket autographs.', pros_cons: { pros: ['Iconic Rookie Ticket autos', 'Best auto checklist in football'], cons: ['Non-chrome base cards', 'Very expensive', 'Value concentrated in QB autos'] } },
  // MLB 2024
  { id: 'c0000000-0000-0000-0000-000000000013', brand_id: TOPPS, name: 'Topps Series 1', sport: 'MLB', year: '2024', is_flagship: true, description: 'The base Topps baseball product for 2024.', pros_cons: { pros: ['Most affordable flagship', 'Licensed MLB product', 'Huge checklist', 'Easy to find'], cons: ['Base cards are common', 'Chrome versions preferred', 'Low ceiling per box'] } },
  { id: 'c0000000-0000-0000-0000-000000000014', brand_id: TOPPS, name: 'Topps Series 2', sport: 'MLB', year: '2024', is_flagship: true, description: 'Second half of the Topps base set.', pros_cons: { pros: ['Completes the base set', 'Licensed MLB product', 'Late-season rookies'], cons: ['Less excitement than Series 1', 'Lower demand', 'Base cards common'] } },
  { id: 'c0000000-0000-0000-0000-000000000015', brand_id: TOPPS, name: 'Bowman', sport: 'MLB', year: '2024', is_flagship: false, description: 'The premier prospect product. First licensed cards for minor league players.', pros_cons: { pros: ['First prospect cards (Bowman 1st)', 'Huge upside on prospects', 'Most important prospect product'], cons: ['Prospect risk', 'Expensive hobby boxes', 'Long wait for payoff'] } },
  { id: 'c0000000-0000-0000-0000-000000000016', brand_id: TOPPS, name: 'Topps Heritage', sport: 'MLB', year: '2024', is_flagship: false, description: 'Retro-themed product using classic Topps designs from the past.', pros_cons: { pros: ['Classic retro designs', 'Short prints create chase', 'Real One autographs'], cons: ['Niche appeal', 'Low base card values', 'Short prints frustrating'] } },
  // MLB 2025
  { id: 'c0000000-0000-0000-0000-000000000025', brand_id: TOPPS, name: 'Topps Series 2', sport: 'MLB', year: '2025', is_flagship: true, description: 'Second half of the 2025 Topps base set.', pros_cons: { pros: ['Completes the base set', 'Licensed MLB product', 'Late-season rookies'], cons: ['Less excitement than Series 1', 'Lower demand', 'Base cards common'] } },
  { id: 'c0000000-0000-0000-0000-000000000026', brand_id: TOPPS, name: 'Topps Chrome', sport: 'MLB', year: '2025', is_flagship: true, description: 'The flagship chrome baseball product for 2025.', pros_cons: { pros: ['Best baseball chrome product', 'Iconic refractor parallels', 'Strong rookie demand'], cons: ['Expensive hobby boxes', 'Retail sells out fast'] } },
  { id: 'c0000000-0000-0000-0000-000000000027', brand_id: TOPPS, name: 'Bowman', sport: 'MLB', year: '2025', is_flagship: false, description: 'The premier prospect product for 2025.', pros_cons: { pros: ['First prospect cards', 'Huge upside on prospects', 'Most important prospect product'], cons: ['Prospect risk', 'Expensive hobby boxes'] } },
  { id: 'c0000000-0000-0000-0000-000000000028', brand_id: TOPPS, name: 'Topps Heritage', sport: 'MLB', year: '2025', is_flagship: false, description: 'Retro-themed product using classic Topps designs.', pros_cons: { pros: ['Classic retro designs', 'Short prints create chase'], cons: ['Niche appeal', 'Low base card values'] } },
  // NHL 2024-25
  { id: 'c0000000-0000-0000-0000-000000000017', brand_id: UPPER_DECK, name: 'Upper Deck Series 2', sport: 'NHL', year: '2024-25', is_flagship: true, description: 'Second half of the flagship hockey set.', pros_cons: { pros: ['Young Guns rookies', 'Licensed NHL product', 'Completes the base set'], cons: ['Less excitement than S1', 'Smaller market', 'Base cards low value'] } },
  { id: 'c0000000-0000-0000-0000-000000000029', brand_id: UPPER_DECK, name: 'O-Pee-Chee', sport: 'NHL', year: '2024-25', is_flagship: false, description: 'Classic Canadian hockey brand. Affordable entry point.', pros_cons: { pros: ['Affordable packs', 'Retro Canadian brand', 'Large set'], cons: ['Very low resale', 'Non-chrome base cards'] } },
  // NHL 2025-26
  { id: 'c0000000-0000-0000-0000-00000000002a', brand_id: UPPER_DECK, name: 'Upper Deck Series 1', sport: 'NHL', year: '2025-26', is_flagship: true, description: 'The flagship hockey card product for the new season.', pros_cons: { pros: ['Young Guns are iconic', 'Licensed NHL product'], cons: ['Smaller market', 'Hobby boxes expensive', 'Base cards low value'] } },
  { id: 'c0000000-0000-0000-0000-00000000002b', brand_id: UPPER_DECK, name: 'Upper Deck Series 2', sport: 'NHL', year: '2025-26', is_flagship: true, description: 'Second half of the 2025-26 flagship hockey set.', pros_cons: { pros: ['Young Guns rookies', 'Licensed NHL product'], cons: ['Less excitement than S1', 'Smaller market'] } },
  { id: 'c0000000-0000-0000-0000-00000000002c', brand_id: UPPER_DECK, name: 'O-Pee-Chee', sport: 'NHL', year: '2025-26', is_flagship: false, description: 'Classic Canadian hockey brand for the new season.', pros_cons: { pros: ['Affordable packs', 'Retro Canadian brand'], cons: ['Very low resale', 'Non-chrome base cards'] } },
];

// Generate SQL
const lines = ['-- Seed all products (run in Supabase SQL Editor)', ''];
for (const p of products) {
  const esc = (s) => s.replace(/'/g, "''");
  lines.push(`INSERT INTO products (id, brand_id, name, sport, year, is_flagship, description, pros_cons) VALUES ('${p.id}', '${p.brand_id}', '${esc(p.name)}', '${p.sport}', '${p.year}', ${p.is_flagship}, '${esc(p.description)}', '${esc(JSON.stringify(p.pros_cons))}'::jsonb) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, brand_id=EXCLUDED.brand_id, sport=EXCLUDED.sport, year=EXCLUDED.year, is_flagship=EXCLUDED.is_flagship, description=EXCLUDED.description, pros_cons=EXCLUDED.pros_cons;`);
}

const sql = lines.join('\n');

if (process.argv.includes('--exec')) {
  // Execute via Supabase REST API using the anon key with a raw SQL approach
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const resp = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': key, 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({ query: sql }),
  });
  console.log(resp.status, await resp.text());
} else {
  console.log(sql);
}
