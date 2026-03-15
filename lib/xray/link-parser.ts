// lib/xray/link-parser.ts

export interface ParsedLink {
  marketplace: 'ebay';
  itemId: string;
}

/**
 * Parse a marketplace URL and extract the item ID.
 * Currently supports eBay only.
 *
 * Supported formats:
 *   https://www.ebay.com/itm/123456789012
 *   https://www.ebay.com/itm/some-title/123456789012
 *   https://ebay.com/itm/123456789012?query=params
 *   https://www.ebay.co.uk/itm/123456789012
 *   https://ebay.us/AbCdEf (shortened)
 */
export function parseLink(url: string): ParsedLink | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  // eBay standard: /itm/ followed by optional slug then numeric ID
  const ebayMatch = trimmed.match(
    /ebay\.[a-z.]+\/itm\/(?:[^/]*\/)?(\d{10,14})/i
  );
  if (ebayMatch) {
    return { marketplace: 'ebay', itemId: ebayMatch[1] };
  }

  // eBay shortened: ebay.us/XXXXX or ebay.to/XXXXX
  // These redirect to the full URL — we'll handle them by following redirects
  // in the fetcher. For now, detect them so we can give a helpful message.
  const shortenedMatch = trimmed.match(/ebay\.(us|to)\/([A-Za-z0-9]+)/i);
  if (shortenedMatch) {
    // Return null — the API route will follow the redirect to get the real URL
    return null;
  }

  return null;
}

/**
 * Quick check: does this string look like it could be a marketplace URL?
 */
export function looksLikeUrl(input: string): boolean {
  const trimmed = input.trim();
  return /^https?:\/\//i.test(trimmed) || /^(www\.)?ebay\./i.test(trimmed);
}
