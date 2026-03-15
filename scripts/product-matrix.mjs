#!/usr/bin/env node
/**
 * product-matrix.mjs
 * CLI helper to query/filter data/product-matrix.json
 *
 * Usage:
 *   node scripts/product-matrix.mjs --stats
 *   node scripts/product-matrix.mjs --sport=NBA
 *   node scripts/product-matrix.mjs --tier=1
 *   node scripts/product-matrix.mjs --status=pending
 *   node scripts/product-matrix.mjs --sport=NBA --tier=1 --status=seeded
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const matrixPath = resolve(__dirname, "../data/product-matrix.json");

function loadMatrix() {
  try {
    const raw = readFileSync(matrixPath, "utf8");
    return JSON.parse(raw).products;
  } catch (err) {
    console.error(`Error loading product matrix: ${err.message}`);
    process.exit(1);
  }
}

function parseArgs(argv) {
  const args = {};
  for (const arg of argv.slice(2)) {
    if (arg.startsWith("--")) {
      const [key, value] = arg.slice(2).split("=");
      args[key] = value ?? true;
    }
  }
  return args;
}

function printStats(products) {
  const bySport  = {};
  const byTier   = {};
  const byStatus = {};

  for (const p of products) {
    bySport[p.sport]   = (bySport[p.sport]   ?? 0) + 1;
    byTier[p.tier]     = (byTier[p.tier]     ?? 0) + 1;
    byStatus[p.status] = (byStatus[p.status] ?? 0) + 1;
  }

  console.log("=== PRODUCT MATRIX STATS ===");
  console.log(`Total: ${products.length} products\n`);

  console.log("By Sport:");
  for (const [sport, count] of Object.entries(bySport).sort()) {
    console.log(`  ${sport}: ${count}`);
  }

  console.log("\nBy Tier:");
  for (const [tier, count] of Object.entries(byTier).sort()) {
    console.log(`  Tier ${tier}: ${count}`);
  }

  console.log("\nBy Status:");
  for (const [status, count] of Object.entries(byStatus).sort()) {
    console.log(`  ${status}: ${count}`);
  }
}

function printTable(products) {
  if (products.length === 0) {
    console.log("No products match the given filters.");
    return;
  }

  const col = (s, w) => String(s ?? "").padEnd(w).slice(0, w);

  const header = [
    col("Sport", 6),
    col("Year", 8),
    col("Brand", 8),
    col("Name", 28),
    col("Tier", 5),
    col("Status", 8),
    col("ExistingProductId", 38),
  ].join("  ");

  console.log(header);
  console.log("-".repeat(header.length));

  for (const p of products) {
    console.log([
      col(p.sport, 6),
      col(p.year, 8),
      col(p.brand, 8),
      col(p.name, 28),
      col(p.tier, 5),
      col(p.status, 8),
      col(p.existingProductId ?? "(none)", 38),
    ].join("  "));
  }

  console.log(`\n${products.length} product(s) shown.`);
}

function main() {
  const args = parseArgs(process.argv);
  const all  = loadMatrix();

  // Apply filters
  let filtered = all;
  if (args.sport)  filtered = filtered.filter(p => p.sport.toLowerCase()  === args.sport.toLowerCase());
  if (args.tier)   filtered = filtered.filter(p => String(p.tier)          === String(args.tier));
  if (args.status) filtered = filtered.filter(p => p.status.toLowerCase() === args.status.toLowerCase());
  if (args.brand)  filtered = filtered.filter(p => p.brand.toLowerCase()  === args.brand.toLowerCase());
  if (args.year)   filtered = filtered.filter(p => p.year                  === args.year);

  if (args.stats) {
    printStats(filtered);
  } else if (Object.keys(args).length === 0) {
    // No args — show full stats
    printStats(filtered);
  } else {
    printTable(filtered);
  }
}

main();
