/**
 * Sports card collecting glossary.
 * Static data — no database needed.
 * Last updated: 2026-03-13.
 */

export interface GlossaryTerm {
  term: string;
  definition: string;
  /** Optional related terms (by exact term name) */
  related?: string[];
}

export const GLOSSARY: GlossaryTerm[] = [
  { term: '1/1', definition: 'A card with only one copy in existence. The most rare and valuable parallel. Also called a "one-of-one." Always serial numbered 1/1.', related: ['Serial Numbered', 'Parallel'] },
  { term: 'Auto', definition: 'Short for autograph. A card that has been signed by the player. Can be "on-card" (signed directly) or "sticker auto" (signed on a sticker applied to the card).', related: ['On-Card Auto', 'Sticker Auto'] },
  { term: 'Base Card', definition: 'The standard, most common version of a card in a set. No special color, finish, or numbering. The foundation that parallels are variations of.', related: ['Parallel', 'Short Print'] },
  { term: 'Blaster Box', definition: 'A retail box typically sold at Target, Walmart, etc. Usually $20-$40 with fewer packs and lower hit odds than hobby boxes. Some parallels are blaster-exclusive.', related: ['Hobby Box', 'Retail'] },
  { term: 'Box Break', definition: 'Opening a box of cards, often streamed live. In a "group break," multiple collectors buy spots (by team or pick order) and split the cards pulled.', related: ['Rip'] },
  { term: 'Brick', definition: 'A card that has little to no value and is hard to sell. Also used for a stack of cards rubber-banded together.' },
  { term: 'Case', definition: 'A sealed box containing multiple hobby boxes (usually 12). Buying a full case improves odds of hitting big cards. "Case hit" means roughly 1 per case.', related: ['Hobby Box'] },
  { term: 'Case Hit', definition: 'A card so rare that on average only one appears per sealed case (usually 12 boxes). Examples include Downtown and Kaboom inserts.', related: ['Case', 'Insert'] },
  { term: 'Centering', definition: 'How well-centered the image is on the card relative to the borders. A key factor in grading. Perfect centering means equal borders on all sides.', related: ['Grading'] },
  { term: 'Checklist', definition: 'The complete list of all cards in a product, including base cards, inserts, autographs, and parallels. Published by the manufacturer before or at release.' },
  { term: 'Chrome', definition: 'A card stock with a glossy, reflective finish. Topps Chrome and Bowman Chrome are the most popular chrome products. Chrome cards are the basis for refractor parallels.', related: ['Refractor'] },
  { term: 'Comps', definition: 'Short for "comparables." Recent sale prices of the same card used to determine fair market value. Usually pulled from eBay sold listings.' },
  { term: 'Concourse / Premier / Courtside', definition: 'The three tiers of Panini Select base cards, in order of increasing rarity and value. Courtside is the most desirable.', related: ['Select'] },
  { term: 'Cracked Ice', definition: 'A prismatic parallel with a pattern resembling cracked ice. Found in Panini Select, Contenders, and other products.', related: ['Parallel', 'Prizm'] },
  { term: 'Die-Cut', definition: 'A card with a non-standard shape — the edges are cut into a special design rather than a standard rectangle. Usually rarer and more valuable.' },
  { term: 'Downtown', definition: 'A highly sought-after case hit insert featuring a player with a city skyline background. One of the most valuable inserts in modern cards.', related: ['Case Hit', 'Insert'] },
  { term: 'FOTL', definition: 'First Off The Line. A premium version of a hobby box that ships before the standard release. Often includes exclusive parallels not found elsewhere.', related: ['Hobby Box'] },
  { term: 'Gem Mint', definition: 'The highest practical grade a card can receive — PSA 10 or BGS 9.5. Near-perfect condition with flawless corners, edges, surface, and centering.', related: ['Grading', 'PSA', 'BGS'] },
  { term: 'Grading', definition: 'The process of having a card professionally evaluated and encased in a tamper-proof slab with a numerical grade (1-10). Major graders include PSA, BGS, SGC, and CGC.', related: ['PSA', 'BGS', 'SGC', 'Slab'] },
  { term: 'Green Parallel', definition: 'A colored parallel — specifics vary by product. In Prizm, Green is typically /75. Colors indicate different print runs and rarity levels.', related: ['Parallel', 'Print Run'] },
  { term: 'Hobby Box', definition: 'A box sold through authorized hobby shops and online dealers. Higher price but better odds of hits (autos, relics, numbered parallels) than retail.', related: ['Blaster Box', 'Retail'] },
  { term: 'Hit', definition: 'Any card of significant value pulled from a pack — usually an autograph, memorabilia/relic card, or low-numbered parallel.' },
  { term: 'Insert', definition: 'A special card that is not part of the base set, inserted at specific odds. Examples: Downtown, Kaboom, Silver Prizm. Some inserts are more valuable than the base autos.', related: ['Downtown', 'Kaboom'] },
  { term: 'Jumbo Box', definition: 'A larger hobby box format with more packs and guaranteed hits. Also called "HTA" (Hobby Traded Authorized). Typically the highest-end retail format.', related: ['Hobby Box'] },
  { term: 'Kaboom', definition: 'A colorful, pop-art style case hit insert from Panini. Features bold colors and comic-book aesthetics. One of the most iconic modern inserts.', related: ['Case Hit', 'Insert'] },
  { term: 'Logoman', definition: 'A memorabilia card containing the NBA/NFL/MLB logo patch from a game-worn jersey. Always a 1/1 and among the most valuable cards in any product.', related: ['1/1', 'Patch', 'Relic'] },
  { term: 'Mega Box', definition: 'A retail box format larger than a blaster, often with exclusive parallels. Typically $40-$80. Found at Target, Walmart, and similar retailers.', related: ['Blaster Box', 'Retail'] },
  { term: 'Numbered', definition: 'See "Serial Numbered."', related: ['Serial Numbered'] },
  { term: 'On-Card Auto', definition: 'An autograph signed directly on the card surface, not on a sticker. Generally more valuable than sticker autos because they look cleaner and feel more authentic.', related: ['Auto', 'Sticker Auto'] },
  { term: 'One-Touch', definition: 'A rigid magnetic card holder used for protection and display. Comes in various thicknesses measured in "points" (pt) to fit different card types.' },
  { term: 'Parallel', definition: 'A variation of a base card with a different color, pattern, or finish. Parallels form a "rainbow" from common (unnumbered) to rare (1/1). The core of modern card collecting.', related: ['Base Card', 'Serial Numbered', 'Rainbow'] },
  { term: 'Patch', definition: 'A memorabilia card containing a piece of a game-worn jersey patch, often multi-colored. More valuable than plain jersey relic cards.', related: ['Relic', 'Logoman'] },
  { term: 'Penny Sleeve', definition: 'A thin, inexpensive plastic sleeve used as the first layer of card protection. Cards go in a penny sleeve before being placed in a top loader or one-touch.' },
  { term: 'Pink Shimmer', definition: 'A FOTL-exclusive parallel found in some Panini products. Usually very low-numbered (/3 or /5) and highly collectible.', related: ['FOTL', 'Parallel'] },
  { term: 'Print Run', definition: 'The total number of copies made of a specific card. A "/25" card has a print run of 25. Lower print runs = higher rarity and value.', related: ['Serial Numbered'] },
  { term: 'Prizm', definition: 'Panini\'s flagship chrome-style brand. "Prizm" also refers to the shiny, refractive parallels within the product. Silver Prizm is the most iconic.', related: ['Chrome', 'Refractor', 'Silver Prizm'] },
  { term: 'Prospect', definition: 'A player who hasn\'t reached the major leagues yet. Prospect cards (especially 1st Bowman Chrome) can be extremely valuable if the player breaks out.', related: ['Rookie Card'] },
  { term: 'PSA', definition: 'Professional Sports Authenticator. The most popular card grading service. Grades on a 1-10 scale, with PSA 10 (Gem Mint) being the highest.', related: ['Grading', 'BGS', 'SGC'] },
  { term: 'BGS', definition: 'Beckett Grading Services. Grades cards on a 1-10 scale with sub-grades for centering, corners, edges, and surface. A BGS 9.5 "Gem Mint" or BGS 10 "Pristine" are top grades.', related: ['Grading', 'PSA'] },
  { term: 'SGC', definition: 'Sportscard Guaranty Corporation. A grading company known for fast turnaround and attractive tuxedo-style slabs. Growing in popularity.', related: ['Grading', 'PSA', 'BGS'] },
  { term: 'Rainbow', definition: 'The complete set of all parallel variations for a single card. Collecting a full rainbow (every color/numbered version) is a popular pursuit.', related: ['Parallel'] },
  { term: 'Raw', definition: 'An ungraded card — not encased in a slab. "Raw value" is what the card is worth without a grade.', related: ['Grading', 'Slab'] },
  { term: 'Refractor', definition: 'A parallel with a prismatic, rainbow-like shine when tilted. The hallmark of Topps Chrome products. Variations include Gold, Orange, Red, and Superfractor.', related: ['Chrome', 'Superfractor'] },
  { term: 'Relic', definition: 'A card containing a piece of game-used or player-worn material — usually jersey, but can include bat, shoe, hat, or other equipment.', related: ['Patch', 'Logoman'] },
  { term: 'Retail', definition: 'Cards sold at mass-market stores (Target, Walmart, etc.) in blasters, megas, hangers, and other formats. Lower price point with different parallel sets than hobby.', related: ['Blaster Box', 'Mega Box', 'Hobby Box'] },
  { term: 'Rip', definition: 'Slang for opening packs or boxes of cards. "Let\'s rip some packs" means opening them to see what\'s inside.', related: ['Box Break'] },
  { term: 'Rookie Card (RC)', definition: 'A player\'s first officially licensed card, marked with an "RC" logo. The most important card for most players — rookie cards drive the hobby market.', related: ['Prospect'] },
  { term: 'RPA', definition: 'Rookie Patch Auto. A card combining a rookie designation, game-used patch, and autograph. Considered the pinnacle card for any player\'s rookie year.', related: ['Rookie Card', 'Patch', 'Auto'] },
  { term: 'Select', definition: 'A popular Panini brand featuring three tiers of base cards (Concourse, Premier, Courtside) with extensive Prizm parallel rainbows.', related: ['Concourse / Premier / Courtside', 'Prizm'] },
  { term: 'Serial Numbered', definition: 'A card stamped with its individual number out of the total print run (e.g., 15/25 means card #15 of 25 made). Lower numbers and "jersey number" matches add value.', related: ['Print Run', '1/1'] },
  { term: 'Short Print (SP)', definition: 'A card intentionally produced in smaller quantities than the standard base cards. "SSP" means Super Short Print — even rarer.', related: ['Base Card'] },
  { term: 'Silver Prizm', definition: 'The most iconic and popular parallel in the Panini Prizm line. Unnumbered but rarer than base. The silver sheen is instantly recognizable.', related: ['Prizm', 'Parallel'] },
  { term: 'Slab', definition: 'The hard plastic case a card is sealed in after being professionally graded. "Slabbed" means the card has been graded and encased.', related: ['Grading', 'PSA'] },
  { term: 'Sticker Auto', definition: 'An autograph signed on a sticker that is then applied to the card. Generally less valuable than on-card autos. Common in mass-produced products.', related: ['Auto', 'On-Card Auto'] },
  { term: 'Superfractor', definition: 'The rarest Topps Chrome parallel — always a 1/1. Features a gold reflective surface. The holy grail of any Topps Chrome set.', related: ['Refractor', '1/1', 'Chrome'] },
  { term: 'Tier', definition: 'A product\'s price/quality level. Flagship (cheapest, widest release), Mid-Tier, Premium, and Ultra-Premium (most expensive, fewest cards per box).', related: ['Hobby Box'] },
  { term: 'Top Loader', definition: 'A rigid plastic card holder that provides more protection than a penny sleeve. Cards go in a penny sleeve first, then into the top loader.', related: ['Penny Sleeve', 'One-Touch'] },
  { term: 'Wax', definition: 'Slang for unopened packs or boxes of cards. Comes from the wax paper wrappers used on vintage packs. "Buying wax" means buying sealed product.' },
  { term: 'Young Guns', definition: 'Upper Deck\'s iconic NHL rookie card subset. The most chased rookie cards in hockey, found in UD Series 1 and Series 2.' },
];

/** Group terms by first letter */
export function groupByLetter(terms: GlossaryTerm[]): Map<string, GlossaryTerm[]> {
  const groups = new Map<string, GlossaryTerm[]>();
  for (const t of terms) {
    const letter = t.term[0].toUpperCase();
    // Group numbers under '#'
    const key = /[0-9]/.test(letter) ? '#' : letter;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(t);
  }
  return groups;
}
