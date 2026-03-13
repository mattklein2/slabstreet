#!/usr/bin/env node

/**
 * Seed complete 2025 Bowman Chrome Baseball parallel data.
 * Three subsets: Base Veterans/Rookies (27), Chrome Prospects (54), Mega Box Mojo (12).
 * Sources: Beckett, Cardboard Connection, ChecklistInsider, BaseballCardPedia.
 *
 * Usage:
 *   node scripts/seed-bowman-chrome-2025-mlb.mjs
 *   node scripts/seed-bowman-chrome-2025-mlb.mjs --dry-run
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

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

const DRY_RUN = process.argv.includes('--dry-run');
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const PRODUCT_ID = 'c0000000-0000-0000-0000-000000000033'; // 2025 Bowman Chrome MLB

const HOBBY = 'Hobby';
const BREAKER = 'Breaker Box';
const MEGA = 'Mega Box';
const ALL_HOBBY = [HOBBY, BREAKER];

let rank = 0;
const r = () => ++rank;

const parallels = [
  // ══════════════════════════════════════════════════════════
  // BASE VETERANS/ROOKIES (100 cards) — 27 parallels
  // ══════════════════════════════════════════════════════════
  { name: 'Base', color_hex: '#FFFFFF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [HOBBY, BREAKER, MEGA], description: 'Standard chrome base card; 100-card Veterans/Rookies set' },
  { name: 'Pearl Refractor', color_hex: '#F5F0E8', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [HOBBY], description: 'Pearlescent white finish; ultra-rare Pearl Pack insert (~1:10 cases)' },
  { name: 'Refractor', color_hex: '#C0C0C0', print_run: 499, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: ALL_HOBBY, description: 'Standard silver refractor /499' },
  { name: 'Geometric Refractor', color_hex: '#A8A8A8', print_run: 499, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [BREAKER], description: 'Geometric patterned background /499; Breaker exclusive' },
  { name: 'Pulsar Refractor', color_hex: '#D4D4FF', print_run: 399, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [HOBBY], description: 'Pulsing light pattern refractor /399; Hobby exclusive' },
  { name: 'Fuchsia Refractor', color_hex: '#FF00FF', print_run: 299, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: ALL_HOBBY, description: 'Bright fuchsia refractor /299' },
  { name: 'Fuchsia Wave Refractor', color_hex: '#FF00FF', print_run: 299, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [HOBBY], description: 'Fuchsia with wave texture /299; Hobby exclusive' },
  { name: 'Purple Geometric Refractor', color_hex: '#800080', print_run: 250, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [BREAKER], description: 'Purple with geometric background /250; Breaker exclusive' },
  { name: 'Aqua RayWave Refractor', color_hex: '#00CED1', print_run: 199, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: ALL_HOBBY, description: 'Aqua/teal with raywave pattern /199' },
  { name: 'Blue Refractor', color_hex: '#0066CC', print_run: 150, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: ALL_HOBBY, description: 'Classic blue refractor /150' },
  { name: 'Blue Wave Refractor', color_hex: '#0066CC', print_run: 150, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [HOBBY], description: 'Blue with wave texture /150; Hobby exclusive' },
  { name: 'Blue Geometric Refractor', color_hex: '#0066CC', print_run: 150, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [BREAKER], description: 'Blue with geometric background /150; Breaker exclusive' },
  { name: 'Aqua Geometric Refractor', color_hex: '#00CED1', print_run: 125, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [BREAKER], description: 'Aqua with geometric background /125; Breaker exclusive' },
  { name: 'Wave Refractor', color_hex: '#C0C0C0', print_run: 100, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [HOBBY], description: 'Silver wave texture refractor /100; Hobby exclusive' },
  { name: 'Green Refractor', color_hex: '#00AA00', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: ALL_HOBBY, description: 'Green refractor /99' },
  { name: 'Green Wave Refractor', color_hex: '#00AA00', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: ALL_HOBBY, description: 'Green with wave texture /99' },
  { name: 'Green Geometric Refractor', color_hex: '#00AA00', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [BREAKER], description: 'Green with geometric background /99; Breaker exclusive' },
  { name: 'Yellow Refractor', color_hex: '#FFD700', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: ALL_HOBBY, description: 'Yellow refractor /75' },
  { name: 'Yellow Geometric Refractor', color_hex: '#FFD700', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [BREAKER], description: 'Yellow with geometric background /75; Breaker exclusive' },
  { name: 'Gold Refractor', color_hex: '#DAA520', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: ALL_HOBBY, description: 'Gold metallic refractor /50' },
  { name: 'Gold Geometric Refractor', color_hex: '#DAA520', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [BREAKER], description: 'Gold with geometric background /50; Breaker exclusive' },
  { name: 'Orange Refractor', color_hex: '#FF6600', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: ALL_HOBBY, description: 'Orange refractor /25' },
  { name: 'Orange Geometric Refractor', color_hex: '#FF6600', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [BREAKER], description: 'Orange with geometric background /25; Breaker exclusive' },
  { name: 'Black Refractor', color_hex: '#1A1A1A', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: ALL_HOBBY, description: 'Black refractor /10' },
  { name: 'Black Geometric Refractor', color_hex: '#1A1A1A', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [BREAKER], description: 'Black with geometric background /10; Breaker exclusive' },
  { name: 'Red Refractor', color_hex: '#CC0000', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: ALL_HOBBY, description: 'Red refractor /5' },
  { name: 'Red Geometric Refractor', color_hex: '#CC0000', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [BREAKER], description: 'Red with geometric background /5; Breaker exclusive' },
  { name: 'SuperFractor', color_hex: '#FFD700', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: r(), box_exclusivity: ALL_HOBBY, description: 'Gold 1-of-1 SuperFractor, the ultimate chase card' },

  // ══════════════════════════════════════════════════════════
  // CHROME PROSPECTS (100 cards) — 54 parallels
  // ══════════════════════════════════════════════════════════
  { name: 'Prospect Base', color_hex: '#FFFFFF', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [HOBBY, BREAKER, MEGA], description: 'Standard chrome prospect card; 100-card Chrome Prospects set' },
  { name: 'Prospect Mini-Diamond Refractor', color_hex: '#E8E8E8', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [HOBBY], description: 'Diamond-cut texture prospect; Hobby exclusive (~1:6 packs)' },
  { name: 'Prospect Shimmer Refractor', color_hex: '#E0E0E0', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [HOBBY], description: 'Shimmering surface prospect; Hobby exclusive (~1:11 packs)' },
  { name: 'Prospect Pearl Refractor', color_hex: '#F5F0E8', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [HOBBY], description: 'Pearlescent finish prospect; Pearl Pack (~1:10 cases)' },
  { name: 'Prospect Gum Ball Refractor', color_hex: '#FF69B4', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [HOBBY], description: 'Snack-themed Variety Pack exclusive' },
  { name: 'Prospect Peanuts Refractor', color_hex: '#D2A060', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [HOBBY], description: 'Snack-themed Variety Pack exclusive' },
  { name: 'Prospect Popcorn Refractor', color_hex: '#FFFACD', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [HOBBY], description: 'Snack-themed Variety Pack exclusive' },
  { name: 'Prospect Sunflower Seeds Refractor', color_hex: '#808000', print_run: null, serial_numbered: false, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [HOBBY], description: 'Snack-themed Variety Pack exclusive' },
  { name: 'Prospect Refractor', color_hex: '#C0C0C0', print_run: 499, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: ALL_HOBBY, description: 'Standard silver prospect refractor /499' },
  { name: 'Prospect Geometric Refractor', color_hex: '#A8A8A8', print_run: 499, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [BREAKER], description: 'Geometric patterned prospect /499; Breaker exclusive' },
  { name: 'Prospect Pulsar Refractor', color_hex: '#D4D4FF', print_run: 399, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [HOBBY], description: 'Pulsing light pattern prospect /399; Hobby exclusive' },
  { name: 'Prospect Speckle Refractor', color_hex: '#B8B8B8', print_run: 299, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: ALL_HOBBY, description: 'Speckled texture prospect /299' },
  { name: 'Prospect Fuchsia Shimmer Refractor', color_hex: '#FF00FF', print_run: 299, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [HOBBY], description: 'Fuchsia with shimmer texture prospect /299; Hobby exclusive' },
  { name: 'Prospect Fuchsia Geometric Refractor', color_hex: '#FF00FF', print_run: 299, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [BREAKER], description: 'Fuchsia with geometric background prospect /299; Breaker exclusive' },
  { name: 'Prospect Purple Refractor', color_hex: '#800080', print_run: 250, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: ALL_HOBBY, description: 'Purple prospect refractor /250' },
  { name: 'Prospect Purple Shimmer Refractor', color_hex: '#800080', print_run: 250, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [HOBBY], description: 'Purple with shimmer texture prospect /250; Hobby exclusive' },
  { name: 'Prospect Purple Pulsar Refractor', color_hex: '#800080', print_run: 250, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [HOBBY], description: 'Purple with pulsar light effect prospect /250; Hobby exclusive' },
  { name: 'Prospect Purple Wave Refractor', color_hex: '#800080', print_run: 250, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [HOBBY], description: 'Purple with wave texture prospect /250; Hobby exclusive' },
  { name: 'Prospect Purple Geometric Refractor', color_hex: '#800080', print_run: 250, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [BREAKER], description: 'Purple with geometric background prospect /250; Breaker exclusive' },
  { name: 'Prospect Blue Refractor', color_hex: '#0066CC', print_run: 150, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: ALL_HOBBY, description: 'Blue prospect refractor /150' },
  { name: 'Prospect Blue Wave Refractor', color_hex: '#0066CC', print_run: 150, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [HOBBY], description: 'Blue with wave texture prospect /150; Hobby exclusive' },
  { name: 'Prospect Reptilian Blue Refractor', color_hex: '#0066CC', print_run: 150, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [HOBBY], description: 'Blue with reptilian scale texture prospect /150; Hobby exclusive' },
  { name: 'Prospect Blue Geometric Refractor', color_hex: '#0066CC', print_run: 150, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [BREAKER], description: 'Blue with geometric background prospect /150; Breaker exclusive' },
  { name: 'Prospect Aqua Refractor', color_hex: '#00CED1', print_run: 125, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: ALL_HOBBY, description: 'Aqua/teal prospect refractor /125' },
  { name: 'Prospect Aqua Pulsar Refractor', color_hex: '#00CED1', print_run: 125, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [HOBBY], description: 'Aqua with pulsar effect prospect /125; Hobby exclusive' },
  { name: 'Prospect Aqua Geometric Refractor', color_hex: '#00CED1', print_run: 125, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [BREAKER], description: 'Aqua with geometric background prospect /125; Breaker exclusive' },
  { name: 'Prospect Green Refractor', color_hex: '#00AA00', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: ALL_HOBBY, description: 'Green prospect refractor /99' },
  { name: 'Prospect Reptilian Green Refractor', color_hex: '#00AA00', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [HOBBY], description: 'Green with reptilian scale texture prospect /99; Hobby exclusive' },
  { name: 'Prospect Green Shimmer Refractor', color_hex: '#00AA00', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [HOBBY], description: 'Green with shimmer texture prospect /99; Hobby exclusive' },
  { name: 'Prospect Green Wave Refractor', color_hex: '#00AA00', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [HOBBY], description: 'Green with wave texture prospect /99; Hobby exclusive' },
  { name: 'Prospect Green Geometric Refractor', color_hex: '#00AA00', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [BREAKER], description: 'Green with geometric background prospect /99; Breaker exclusive' },
  { name: 'Prospect Green Lava Refractor', color_hex: '#228B22', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [BREAKER], description: 'Green with lava flow texture prospect /99; Breaker exclusive' },
  { name: 'Prospect Yellow Refractor', color_hex: '#FFD700', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: ALL_HOBBY, description: 'Yellow prospect refractor /75' },
  { name: 'Prospect Yellow Wave Refractor', color_hex: '#FFD700', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [HOBBY], description: 'Yellow with wave texture prospect /75; Hobby exclusive' },
  { name: 'Prospect Yellow Geometric Refractor', color_hex: '#FFD700', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [BREAKER], description: 'Yellow with geometric background prospect /75; Breaker exclusive' },
  { name: 'Prospect Gold Refractor', color_hex: '#DAA520', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: ALL_HOBBY, description: 'Gold metallic prospect refractor /50' },
  { name: 'Prospect Gold Shimmer Refractor', color_hex: '#DAA520', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [HOBBY], description: 'Gold with shimmer texture prospect /50; Hobby exclusive' },
  { name: 'Prospect Reptilian Gold Refractor', color_hex: '#DAA520', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [HOBBY], description: 'Gold with reptilian scale texture prospect /50; Hobby exclusive' },
  { name: 'Prospect Gold Wave Refractor', color_hex: '#DAA520', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [HOBBY], description: 'Gold with wave texture prospect /50; Hobby exclusive' },
  { name: 'Prospect Gold Geometric Refractor', color_hex: '#DAA520', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [BREAKER], description: 'Gold with geometric background prospect /50; Breaker exclusive' },
  { name: 'Prospect Orange Refractor', color_hex: '#FF6600', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: ALL_HOBBY, description: 'Orange prospect refractor /25' },
  { name: 'Prospect Reptilian Orange Refractor', color_hex: '#FF6600', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [HOBBY], description: 'Orange with reptilian scale texture prospect /25; Hobby exclusive' },
  { name: 'Prospect Orange Shimmer Refractor', color_hex: '#FF6600', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [HOBBY], description: 'Orange with shimmer texture prospect /25; Hobby exclusive' },
  { name: 'Prospect Orange Wave Refractor', color_hex: '#FF6600', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [HOBBY], description: 'Orange with wave texture prospect /25; Hobby exclusive' },
  { name: 'Prospect Orange Geometric Refractor', color_hex: '#FF6600', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [BREAKER], description: 'Orange with geometric background prospect /25; Breaker exclusive' },
  { name: 'Prospect Black Refractor', color_hex: '#1A1A1A', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: ALL_HOBBY, description: 'Black prospect refractor /10' },
  { name: 'Prospect Reptilian Black Refractor', color_hex: '#1A1A1A', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [HOBBY], description: 'Black with reptilian scale texture prospect /10; Hobby exclusive' },
  { name: 'Prospect Black Wave Refractor', color_hex: '#1A1A1A', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [HOBBY], description: 'Black with wave texture prospect /10; Hobby exclusive' },
  { name: 'Prospect Black Geometric Refractor', color_hex: '#1A1A1A', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [BREAKER], description: 'Black with geometric background prospect /10; Breaker exclusive' },
  { name: 'Prospect Red Refractor', color_hex: '#CC0000', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: ALL_HOBBY, description: 'Red prospect refractor /5' },
  { name: 'Prospect Reptilian Red Refractor', color_hex: '#CC0000', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [HOBBY], description: 'Red with reptilian scale texture prospect /5; Hobby exclusive' },
  { name: 'Prospect Red Shimmer Refractor', color_hex: '#CC0000', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [HOBBY], description: 'Red with shimmer texture prospect /5; Hobby exclusive' },
  { name: 'Prospect Red Wave Refractor', color_hex: '#CC0000', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [HOBBY], description: 'Red with wave texture prospect /5; Hobby exclusive' },
  { name: 'Prospect Red Geometric Refractor', color_hex: '#CC0000', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [BREAKER], description: 'Red with geometric background prospect /5; Breaker exclusive' },
  { name: 'Prospect SuperFractor', color_hex: '#FFD700', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: r(), box_exclusivity: ALL_HOBBY, description: 'Gold 1-of-1 prospect SuperFractor, the ultimate chase' },

  // ══════════════════════════════════════════════════════════
  // MEGA BOX MOJO PARALLELS — 12 parallels
  // ══════════════════════════════════════════════════════════
  { name: 'Aqua Mojo Refractor', color_hex: '#00CED1', print_run: 299, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [MEGA], description: 'Aqua with Mojo geometric pattern /299; Mega Box exclusive' },
  { name: 'Purple Mojo Refractor', color_hex: '#800080', print_run: 250, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [MEGA], description: 'Purple Mojo geometric pattern /250; Mega Box exclusive' },
  { name: 'Pink Mojo Refractor', color_hex: '#FF69B4', print_run: 199, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [MEGA], description: 'Pink Mojo geometric pattern /199; Mega Box exclusive' },
  { name: 'Blue Mojo Refractor', color_hex: '#0066CC', print_run: 150, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [MEGA], description: 'Blue Mojo geometric pattern /150; Mega Box exclusive' },
  { name: 'Steel Metal Mojo Refractor', color_hex: '#71797E', print_run: 100, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [MEGA], description: 'Steel/metallic Mojo finish /100; Mega Box exclusive (new for 2025)' },
  { name: 'Green Mojo Refractor', color_hex: '#00AA00', print_run: 99, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [MEGA], description: 'Green Mojo geometric pattern /99; Mega Box exclusive' },
  { name: 'Yellow Mojo Refractor', color_hex: '#FFD700', print_run: 75, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [MEGA], description: 'Yellow Mojo geometric pattern /75; Mega Box exclusive' },
  { name: 'Gold Mojo Refractor', color_hex: '#DAA520', print_run: 50, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [MEGA], description: 'Gold Mojo geometric pattern /50; Mega Box exclusive' },
  { name: 'Orange Mojo Refractor', color_hex: '#FF6600', print_run: 25, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [MEGA], description: 'Orange Mojo geometric pattern /25; Mega Box exclusive' },
  { name: 'Black Mojo Refractor', color_hex: '#1A1A1A', print_run: 10, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [MEGA], description: 'Black Mojo /10; Mega Box exclusive (new for 2025)' },
  { name: 'Red Mojo Refractor', color_hex: '#CC0000', print_run: 5, serial_numbered: true, is_one_of_one: false, rarity_rank: r(), box_exclusivity: [MEGA], description: 'Red Mojo geometric pattern /5; Mega Box exclusive' },
  { name: 'Rose Gold Mojo Refractor', color_hex: '#B76E79', print_run: 1, serial_numbered: true, is_one_of_one: true, rarity_rank: r(), box_exclusivity: [MEGA], description: 'Rose gold 1-of-1 Mojo; Mega Box ultimate chase' },
];

async function main() {
  console.log(`Seeding 2025 Bowman Chrome MLB Parallels: ${parallels.length} parallels\n`);

  if (DRY_RUN) {
    console.log('DRY RUN — no changes made.\n');
    const base = parallels.filter(p => !p.name.startsWith('Prospect') && !p.name.includes('Mojo'));
    const prospect = parallels.filter(p => p.name.startsWith('Prospect'));
    const mojo = parallels.filter(p => p.name.includes('Mojo'));
    console.log(`Base Veterans/Rookies: ${base.length}`);
    console.log(`Chrome Prospects: ${prospect.length}`);
    console.log(`Mega Box Mojo: ${mojo.length}`);
    console.log(`Total: ${parallels.length}`);
    return;
  }

  // First, create the product if it doesn't exist
  const product = {
    id: PRODUCT_ID,
    brand_id: 'b0000000-0000-0000-0000-000000000004', // Bowman
    name: 'Bowman Chrome',
    sport: 'MLB',
    year: '2025',
    description: 'The premier chrome prospect card product. Features 1st Bowman Chrome cards of top draft picks and international prospects. Deep refractor rainbow with Hobby, Breaker, and Mega Box exclusive parallels.',
    release_date: '2025-10-08',
    is_flagship: true,
    pros_cons: {
      pros: ['1st Bowman Chrome prospect cards', 'Deep refractor rainbow (93 parallels)', 'Mega Box Mojo exclusives', 'Key product for prospect collectors'],
      cons: ['Higher price point', 'Prospect value is speculative', 'Many Hobby/Breaker exclusives'],
    },
  };

  const { error: prodErr } = await supabase.from('products').upsert(product, { onConflict: 'id' });
  if (prodErr) console.error('Product upsert error:', prodErr.message);
  else console.log(`✓ Product created/updated: ${product.name} ${product.year}`);

  // Delete old parallels
  const { error: delErr } = await supabase.from('parallels').delete().eq('product_id', PRODUCT_ID);
  if (delErr) { console.error('Delete error:', delErr.message); return; }
  console.log('Deleted old parallels for 2025 Bowman Chrome MLB');

  // Insert in batches
  const rows = parallels.map(p => ({
    product_id: PRODUCT_ID,
    name: p.name,
    color_hex: p.color_hex,
    print_run: p.print_run,
    serial_numbered: p.serial_numbered,
    is_one_of_one: p.is_one_of_one,
    rarity_rank: p.rarity_rank,
    description: p.description,
    box_exclusivity: p.box_exclusivity,
    special_attributes: null,
  }));

  const BATCH_SIZE = 50;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('parallels').insert(batch);
    if (error) console.error(`Batch error at ${i}:`, error.message);
    else inserted += batch.length;
  }

  console.log(`\nInserted ${inserted}/${parallels.length} parallels`);
  const { count } = await supabase.from('parallels').select('*', { count: 'exact', head: true }).eq('product_id', PRODUCT_ID);
  console.log(`Verified: ${count} parallels in DB for 2025 Bowman Chrome MLB`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
