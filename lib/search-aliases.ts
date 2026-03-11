/**
 * Brand/manufacturer → product line aliases for card search.
 * When a user searches "panini", we expand to also match all Panini brand names.
 * When they search "ud", we expand to "upper deck", etc.
 */

const BRAND_ALIASES: Record<string, string[]> = {
  // Panini brands
  panini: [
    'Prizm', 'Select', 'Mosaic', 'Donruss', 'Optic', 'Contenders', 'National Treasures',
    'Flawless', 'Immaculate', 'Chronicles', 'Court Kings', 'Crown Royale', 'Obsidian',
    'Spectra', 'Revolution', 'Hoops', 'Prestige', 'Absolute', 'Certified', 'Cornerstones',
    'Diamond Kings', 'Excalibur', 'One and One', 'Clearly Donruss', 'Score',
    'Brilliance', 'Crusade', 'Innovation', 'Studio',
  ],
  // Topps brands
  topps: [
    'Topps', 'Topps Chrome', 'Topps Heritage', 'Topps Finest', 'Topps Update',
    'Topps Traded', 'Topps Tiffany', 'Topps Now', 'Topps Project 2020',
    'Bowman', 'Bowman Chrome', 'Bowman Draft', 'Bowman Sterling', 'Bowman Platinum',
    'Bowman University Chrome', 'Stadium Club', 'Allen & Ginter', 'Goudey',
  ],
  // Upper Deck brands
  'upper deck': [
    'Upper Deck', 'SP Authentic', 'SPx', 'Exquisite Collection', 'Ultimate Collection',
    'Fleer', 'Fleer Tradition', 'Flair', 'Metal Universe', 'E-X', 'Skybox',
    'Collector\'s Choice',
  ],
  ud: [
    'Upper Deck', 'SP Authentic', 'SPx', 'Exquisite Collection', 'Ultimate Collection',
    'Fleer', 'Flair', 'Metal Universe', 'E-X', 'Skybox',
  ],
  // Common abbreviations
  nt: ['National Treasures'],
  rpa: ['National Treasures', 'Flawless', 'Immaculate'],
  chrome: ['Topps Chrome', 'Bowman Chrome', 'Topps Chrome F1', 'Topps Merlin Chrome'],
  heritage: ['Topps Heritage'],
  finest: ['Topps Finest', 'Finest'],
  bowman: [
    'Bowman', 'Bowman Chrome', 'Bowman Draft', 'Bowman Sterling', 'Bowman Platinum',
    'Bowman University Chrome', 'Bowman\'s Best', 'Bowman 1st Edition',
  ],
  fleer: ['Fleer', 'Fleer Glossy', 'Fleer Tradition', 'Fleer Update', 'Flair', 'Flair Showcase'],
  optic: ['Optic', 'Donruss Optic', 'Contenders Optic'],
};

/**
 * Expand a search word into additional set_name patterns if it matches a brand alias.
 * Returns an array of set name patterns to OR together, or null if no alias matched.
 */
export function expandSearchWord(word: string): string[] | null {
  const lower = word.toLowerCase();
  const aliases = BRAND_ALIASES[lower];
  if (!aliases) return null;
  return aliases;
}

/**
 * Expand search words, replacing brand keywords with their product lines.
 * Returns the expanded words array where brand names become multiple OR conditions.
 */
export function expandSearchWords(words: string[]): { word: string; isExpanded: boolean; expansions?: string[] }[] {
  return words.map(word => {
    const expansions = expandSearchWord(word);
    if (expansions) {
      return { word, isExpanded: true, expansions };
    }
    return { word, isExpanded: false };
  });
}
