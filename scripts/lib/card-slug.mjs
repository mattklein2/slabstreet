/**
 * Generate a URL-safe slug for a card.
 * Format: {playerSlug}-{year}-{setName}-{parallel}-{cardNumber}
 * Example: luka-doncic-2018-prizm-silver-280
 */
export function generateCardSlug(playerSlug, year, setName, parallel, cardNumber) {
  const parts = [playerSlug, String(year)];
  if (setName) parts.push(slugify(setName));
  if (parallel && parallel !== 'Base') parts.push(slugify(parallel));
  if (cardNumber) parts.push(String(cardNumber).replace(/^#/, ''));
  return parts.join('-');
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
