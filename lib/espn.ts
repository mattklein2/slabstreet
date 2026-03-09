// ─────────────────────────────────────────────────────────────
// SHARED ESPN UTILITIES
// Reusable functions for interacting with ESPN's free API.
// ─────────────────────────────────────────────────────────────

/** Search ESPN for a player by name, returns ESPN athlete id + display name. */
export async function searchEspnPlayer(
  name: string,
  sport: string,
  league: string,
): Promise<{ id: string; name: string } | null> {
  try {
    const url = `https://site.api.espn.com/apis/common/v3/search?query=${encodeURIComponent(name)}&type=player&sport=${sport}&league=${league}&limit=5`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();

    const items = data.items || data.results || [];
    if (items.length === 0) return null;

    const first = items[0];
    return {
      id: first.id || first.$ref?.match(/athletes\/(\d+)/)?.[1] || '',
      name: first.displayName || first.name || name,
    };
  } catch {
    return null;
  }
}
