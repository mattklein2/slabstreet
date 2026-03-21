// lib/psa/pop-lookup.ts

import { supabase } from '../supabase';
import type { PSAPopData, PSAPopSummary, PopGradeEntry } from './types';

const PSA_BASE = 'https://api.psacard.com/publicapi';
const CACHE_TTL_DAYS = 7;

function getHeaders(): Record<string, string> {
  const token = process.env.PSA_API_TOKEN;
  if (!token) throw new Error('PSA_API_TOKEN not configured');
  return {
    'Authorization': `bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Build a normalized cache key from card identity fields.
 */
function buildCacheKey(player: string, year: string, brand: string, set: string): string {
  return [player, year, brand, set]
    .map(s => s.toLowerCase().replace(/[^a-z0-9]/g, ''))
    .join('|');
}

/**
 * Fetch PSA population data by specID.
 */
async function getPopBySpecId(specId: number): Promise<{ description: string; popData: PSAPopData } | null> {
  try {
    const res = await fetch(`${PSA_BASE}/pop/GetPSASpecPopulation/${specId}`, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      console.error(`[psa-pop] API error for specId ${specId}: ${res.status}`);
      return null;
    }
    const data = await res.json();
    if (!data?.PSAPop) return null;

    const pop = data.PSAPop;
    return {
      description: data.Description || '',
      popData: {
        specId,
        description: data.Description || '',
        total: pop.Total || 0,
        auth: pop.Auth || 0,
        grade1: pop.Grade1 || 0,
        grade1_5: pop.Grade15 || 0,
        grade2: pop.Grade2 || 0,
        grade2_5: pop.Grade25 || 0,
        grade3: pop.Grade3 || 0,
        grade3_5: pop.Grade35 || 0,
        grade4: pop.Grade4 || 0,
        grade4_5: pop.Grade45 || 0,
        grade5: pop.Grade5 || 0,
        grade5_5: pop.Grade55 || 0,
        grade6: pop.Grade6 || 0,
        grade6_5: pop.Grade65 || 0,
        grade7: pop.Grade7 || 0,
        grade7_5: pop.Grade75 || 0,
        grade8: pop.Grade8 || 0,
        grade8_5: pop.Grade85 || 0,
        grade9: pop.Grade9 || 0,
        grade9_5: pop.Grade95 || 0,
        grade10: pop.Grade10 || 0,
        grade1q: pop.Grade1Q || 0,
        grade2q: pop.Grade2Q || 0,
        grade3q: pop.Grade3Q || 0,
        grade4q: pop.Grade4Q || 0,
        grade5q: pop.Grade5Q || 0,
        grade6q: pop.Grade6Q || 0,
        grade7q: pop.Grade7Q || 0,
        grade8q: pop.Grade8Q || 0,
        grade9q: pop.Grade9Q || 0,
        grade10q: pop.Grade10Q || 0,
      },
    };
  } catch (err: any) {
    console.error('[psa-pop] getPopBySpecId error:', err.message);
    return null;
  }
}

/**
 * Look up cert → get specID → get pop data. Uses 2 API calls.
 */
async function getPopByCert(certNumber: string): Promise<{ specId: number; description: string; popData: PSAPopData } | null> {
  try {
    const certRes = await fetch(`${PSA_BASE}/cert/GetByCertNumber/${certNumber}`, {
      headers: getHeaders(),
    });
    if (!certRes.ok) {
      console.error(`[psa-pop] cert lookup error: ${certRes.status}`);
      return null;
    }
    const certData = await certRes.json();
    const specId = certData?.PSACert?.SpecID;
    if (!specId) {
      console.log(`[psa-pop] no SpecID in cert response for ${certNumber}`);
      return null;
    }

    const popResult = await getPopBySpecId(specId);
    if (!popResult) return null;

    return { specId, ...popResult };
  } catch (err: any) {
    console.error('[psa-pop] getPopByCert error:', err.message);
    return null;
  }
}

/**
 * Check the pop_cache table for cached data.
 */
async function getCachedPop(cacheKey: string): Promise<PSAPopSummary | null> {
  const cutoff = new Date(Date.now() - CACHE_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('pop_cache')
    .select('*')
    .eq('cache_key', cacheKey)
    .gt('fetched_at', cutoff)
    .maybeSingle();

  if (error || !data) return null;

  console.log(`[psa-pop] CACHE HIT for ${cacheKey}`);
  return popDataToSummary(data.spec_id, data.spec_desc || '', data.grade_data as PSAPopData);
}

/**
 * Store pop data in the cache.
 */
async function setCachedPop(
  cacheKey: string,
  specId: number,
  description: string,
  popData: PSAPopData,
): Promise<void> {
  const { error } = await supabase
    .from('pop_cache')
    .upsert({
      cache_key: cacheKey,
      spec_id: specId,
      spec_desc: description,
      grade_data: popData,
      fetched_at: new Date().toISOString(),
    }, { onConflict: 'cache_key' });

  if (error) {
    console.error('[psa-pop] cache upsert error:', error.message);
  }
}

/**
 * Convert raw pop data into a UI-friendly summary.
 */
function popDataToSummary(specId: number, description: string, pop: PSAPopData): PSAPopSummary {
  const total = pop.total || 1; // avoid division by zero

  // Build grade entries for whole grades (most useful for the UI)
  const gradeEntries: PopGradeEntry[] = [
    { grade: '10', count: pop.grade10 + (pop.grade10q || 0), pct: 0 },
    { grade: '9.5', count: pop.grade9_5 || 0, pct: 0 },
    { grade: '9', count: pop.grade9 + (pop.grade9q || 0), pct: 0 },
    { grade: '8.5', count: pop.grade8_5 || 0, pct: 0 },
    { grade: '8', count: pop.grade8 + (pop.grade8q || 0), pct: 0 },
    { grade: '7', count: pop.grade7 + (pop.grade7q || 0), pct: 0 },
    { grade: '6', count: pop.grade6 + (pop.grade6q || 0), pct: 0 },
    { grade: '5', count: pop.grade5 + (pop.grade5q || 0), pct: 0 },
    { grade: '4', count: pop.grade4 + (pop.grade4q || 0), pct: 0 },
    { grade: '≤3', count: (pop.grade1 + pop.grade1_5 + pop.grade2 + pop.grade2_5 + pop.grade3 + pop.grade3_5 +
      (pop.grade1q || 0) + (pop.grade2q || 0) + (pop.grade3q || 0)), pct: 0 },
  ];

  // Calculate percentages
  for (const entry of gradeEntries) {
    entry.pct = Math.round((entry.count / total) * 1000) / 10; // one decimal
  }

  // Filter out grades with 0 count
  const nonZeroGrades = gradeEntries.filter(e => e.count > 0);

  return {
    specId,
    description,
    totalGraded: pop.total,
    grades: nonZeroGrades,
  };
}

/**
 * Main entry point: get pop data for a card.
 * Tries cache first, then cert lookup if available, then cache-only fallback.
 */
export async function getPopForCard(
  certNumber: string | null,
  player: string | null,
  year: string | null,
  brand: string | null,
  set: string | null,
): Promise<PSAPopSummary | null> {
  // Need at least player + year + brand to build a meaningful cache key
  if (!player || !year || !brand) return null;

  const cacheKey = buildCacheKey(player, year, brand, set || '');

  // 1. Check cache
  const cached = await getCachedPop(cacheKey);
  if (cached) return cached;

  // 2. If we have a cert number, do the cert → specID → pop lookup
  if (certNumber) {
    const result = await getPopByCert(certNumber);
    if (result) {
      // Cache for future lookups (including raw cards with same identity)
      setCachedPop(cacheKey, result.specId, result.description, result.popData);
      return popDataToSummary(result.specId, result.description, result.popData);
    }
  }

  // 3. No cert and no cache — can't get pop data
  console.log(`[psa-pop] No pop data available for ${cacheKey} (no cert, no cache)`);
  return null;
}
