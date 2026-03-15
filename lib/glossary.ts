/**
 * Sports card collecting glossary.
 * Static data — no database needed.
 * Last updated: 2026-03-15.
 */

export interface GlossaryTerm {
  term: string;
  definition: string;
  /** Optional related terms (by exact term name) */
  related?: string[];
}

export const GLOSSARY: GlossaryTerm[] = [
  // #
  { term: '1/1', definition: 'A card with only one copy in existence. The most rare and valuable parallel. Also called a "one-of-one." Always serial numbered 1/1.', related: ['Serial Numbered', 'Parallel', 'Superfractor', 'Logoman'] },
  { term: '1st Bowman', definition: 'A player\'s first card in a Bowman product, marked with a "1st" logo. The most important prospect card in baseball — values can skyrocket if the player makes it to the majors.', related: ['Prospect', 'Bowman'] },

  // A
  { term: 'Acetate', definition: 'A card printed on clear or semi-transparent plastic instead of cardboard. Creates a see-through effect. Premium inserts and parallels often use acetate for a high-end look.', related: ['Insert'] },
  { term: 'Auto', definition: 'Short for autograph. A card that has been signed by the player. Can be "on-card" (signed directly) or "sticker auto" (signed on a sticker applied to the card).', related: ['On-Card Auto', 'Sticker Auto', 'RPA'] },

  // B
  { term: 'Base Card', definition: 'The standard, most common version of a card in a set. No special color, finish, or numbering. The foundation that parallels are variations of.', related: ['Parallel', 'Short Print (SP)'] },
  { term: 'BGS', definition: 'Beckett Grading Services. Grades cards on a 1-10 scale with sub-grades for centering, corners, edges, and surface. A BGS 9.5 "Gem Mint" or BGS 10 "Pristine" are top grades.', related: ['Grading', 'PSA', 'SGC'] },
  { term: 'Blaster Box', definition: 'A retail box typically sold at Target, Walmart, etc. Usually $20-$40 with fewer packs and lower hit odds than hobby boxes. Some parallels are blaster-exclusive.', related: ['Hobby Box', 'Retail', 'Mega Box', 'Hanger'] },
  { term: 'BMWT', definition: 'Bubble Mailer With Tracking. A shipping method where the card is sent in a padded bubble mailer with a tracking number. Safer than PWE for valuable cards.', related: ['PWE'] },
  { term: 'Booklet', definition: 'An oversized card that folds open like a book, usually featuring multiple patches, autographs, or both. Found in premium and ultra-premium products.', related: ['Patch', 'Auto', 'RPA'] },
  { term: 'Bowman', definition: 'A Topps brand focused on prospects and first-year players. "1st Bowman Chrome" is the most important card for baseball prospects. Also produces football and other sports.', related: ['1st Bowman', 'Prospect', 'Chrome'] },
  { term: 'Box Break', definition: 'Opening a box of cards, often streamed live. In a "group break," multiple collectors buy spots (by team or pick order) and split the cards pulled.', related: ['Rip', 'Group Break', 'Random Team'] },
  { term: 'Break Tax', definition: 'The premium you pay above a card\'s raw value when buying a spot in a group break. Breakers charge more than the box cost to cover labor, shipping, and profit.', related: ['Box Break', 'Group Break'] },
  { term: 'Brick', definition: 'A card that has little to no value and is hard to sell. Also used for a stack of cards rubber-banded together.' },
  { term: 'Buy It Now (BIN)', definition: 'A fixed-price eBay listing where you can purchase immediately without waiting for an auction to end. Sellers often price higher than auction values.', related: ['Comps'] },

  // C
  { term: 'Card Show', definition: 'An in-person event where dealers and collectors buy, sell, and trade cards. Ranges from small local shows to massive events like The National. Great for finding deals.', related: ['The National'] },
  { term: 'Case', definition: 'A sealed box containing multiple hobby boxes (usually 12). Buying a full case improves odds of hitting big cards. "Case hit" means roughly 1 per case.', related: ['Hobby Box', 'Case Hit'] },
  { term: 'Case Hit', definition: 'A card so rare that on average only one appears per sealed case (usually 12 boxes). Examples include Downtown and Kaboom inserts.', related: ['Case', 'Insert', 'Downtown', 'Kaboom'] },
  { term: 'Cello Pack', definition: 'A pack wrapped in cellophane, typically with more cards than a standard pack. Also called a "value pack" or "fat pack" at retail. A step up from a single hanger.', related: ['Retail', 'Hanger', 'Fat Pack'] },
  { term: 'Centering', definition: 'How well-centered the image is on the card relative to the borders. A key factor in grading. Perfect centering means equal borders on all sides. Measured as a ratio like 50/50 (perfect) or 60/40.', related: ['Grading', 'Gem Mint'] },
  { term: 'Checklist', definition: 'The complete list of all cards in a product, including base cards, inserts, autographs, and parallels. Published by the manufacturer before or at release.' },
  { term: 'Chrome', definition: 'A card stock with a glossy, reflective finish. Topps Chrome and Bowman Chrome are the most popular chrome products. Chrome cards are the basis for refractor parallels.', related: ['Refractor', 'Bowman'] },
  { term: 'Color Match', definition: 'When a card\'s serial number matches a meaningful number — like a jersey number (/99 card numbered 23/99 for a player who wears #23). Adds a premium to the card\'s value.', related: ['Serial Numbered', 'Jersey Number'] },
  { term: 'Comps', definition: 'Short for "comparables." Recent sale prices of the same card used to determine fair market value. Usually pulled from eBay sold listings. The best way to price a card.', related: ['Buy It Now (BIN)'] },
  { term: 'Concourse / Premier / Courtside', definition: 'The three tiers of Panini Select base cards, in order of increasing rarity and value. Courtside is the most desirable.', related: ['Select'] },
  { term: 'Condition Sensitive', definition: 'A card type prone to showing imperfections — chrome cards chip easily, black-bordered cards show whitening, and acetate cards scratch. Important to know before buying raw.', related: ['Chrome', 'Raw', 'Grading'] },
  { term: 'Contenders', definition: 'A Panini brand known for its "Rookie Ticket" autograph cards with an event-ticket design. A staple of football card collecting.', related: ['Auto', 'Rookie Card (RC)'] },
  { term: 'Cracked Ice', definition: 'A prismatic parallel with a pattern resembling cracked ice. Found in Panini Select, Contenders, and other products.', related: ['Parallel', 'Prizm'] },

  // D
  { term: 'Damaged', definition: 'A card with visible flaws — creases, stains, tears, or heavy corner wear. Significantly reduces value. Grading services assign low grades (1-4) to damaged cards.', related: ['Grading'] },
  { term: 'Die-Cut', definition: 'A card with a non-standard shape — the edges are cut into a special design rather than a standard rectangle. Usually rarer and more valuable.', related: ['Parallel'] },
  { term: 'Ding', definition: 'A small nick or dent on a card, usually on the edges or corners. Can lower a grade by a full point or more. Hard to see in photos — inspect carefully when buying raw.', related: ['Raw', 'Grading'] },
  { term: 'Donruss', definition: 'A Panini brand that produces base-level, affordable card products. Known for Rated Rookie (RR) cards and the Optic chrome version.', related: ['Optic', 'Rated Rookie'] },
  { term: 'Downtown', definition: 'A highly sought-after case hit insert featuring a player with a city skyline background. One of the most valuable inserts in modern cards.', related: ['Case Hit', 'Insert'] },

  // E
  { term: 'Edge Wear', definition: 'Damage along the edges of a card — small nicks, fraying, or whitening. A common flaw that lowers grades. Chrome cards are especially prone to edge chipping.', related: ['Grading', 'Condition Sensitive'] },
  { term: 'Error Card', definition: 'A card printed with a mistake — wrong photo, misspelled name, wrong stats. Some error cards are corrected in later print runs, making the error version scarcer and valuable.', related: ['Variation'] },
  { term: 'Exclusive', definition: 'A card or parallel only available in a specific product format. Hobby-exclusive parallels can\'t be found in retail, and vice versa. Drives demand for specific box types.', related: ['Hobby Box', 'Retail'] },

  // F
  { term: 'Fat Pack', definition: 'A retail pack with more cards than a standard pack, usually 20-30 cards. Also called a "value pack" or "cello pack." Some include exclusive parallels.', related: ['Retail', 'Cello Pack', 'Hanger'] },
  { term: 'First Bowman', definition: 'See "1st Bowman."', related: ['1st Bowman'] },
  { term: 'Flagship', definition: 'The main, most widely available product from a brand. Examples: Topps Series 1/2 (baseball), Prizm (basketball/football), Upper Deck Series 1/2 (hockey). Usually the most affordable.', related: ['Tier'] },
  { term: 'Flip', definition: 'Buying a card or box with the intent to quickly resell for profit. "Flipping" is a common hobby activity but carries risk if the market dips.', related: ['Investing'] },
  { term: 'FOTL', definition: 'First Off The Line. A premium version of a hobby box that ships before the standard release. Often includes exclusive parallels not found elsewhere.', related: ['Hobby Box', 'Exclusive'] },

  // G
  { term: 'Gem Mint', definition: 'The highest practical grade a card can receive — PSA 10 or BGS 9.5. Near-perfect condition with flawless corners, edges, surface, and centering.', related: ['Grading', 'PSA', 'BGS', 'Pop Report'] },
  { term: 'Gem Rate', definition: 'The percentage of submitted cards that receive a PSA 10 or BGS 9.5 grade. A high gem rate (60%+) means the card grades well; a low rate (<30%) means it\'s condition-sensitive.', related: ['Grading', 'Pop Report', 'Condition Sensitive'] },
  { term: 'Gold Vinyl', definition: 'An ultra-rare 1/1 parallel in Topps products featuring a textured gold vinyl surface. One of the most valuable non-auto cards in any Topps set.', related: ['1/1', 'Superfractor'] },
  { term: 'Grading', definition: 'The process of having a card professionally evaluated and encased in a tamper-proof slab with a numerical grade (1-10). Major graders include PSA, BGS, SGC, and CGC.', related: ['PSA', 'BGS', 'SGC', 'Slab', 'Sub'] },
  { term: 'Green Parallel', definition: 'A colored parallel — specifics vary by product. In Prizm, Green is typically /75. Colors indicate different print runs and rarity levels.', related: ['Parallel', 'Print Run'] },
  { term: 'Group Break', definition: 'A box or case break where multiple collectors buy spots and split the cards. Spots can be sold by team ("pick your team"), division, or random assignment. A way to access expensive boxes affordably.', related: ['Box Break', 'Random Team', 'Break Tax'] },

  // H
  { term: 'Hanger', definition: 'A retail pack format that hangs on a peg hook in stores. Usually 20-30 cards, priced between a single pack and a blaster box. Some products include hanger-exclusive parallels.', related: ['Retail', 'Blaster Box', 'Fat Pack'] },
  { term: 'Hit', definition: 'Any card of significant value pulled from a pack — usually an autograph, memorabilia/relic card, or low-numbered parallel. "Guaranteed hit" means the box promises at least one.', related: ['Auto', 'Relic'] },
  { term: 'Hobby Box', definition: 'A box sold through authorized hobby shops and online dealers. Higher price but better odds of hits (autos, relics, numbered parallels) than retail.', related: ['Blaster Box', 'Retail', 'FOTL'] },
  { term: 'Hobby Exclusive', definition: 'A parallel or insert that can only be found in hobby boxes, not retail. Usually the more desirable colored parallels. A key reason hobby boxes cost more.', related: ['Hobby Box', 'Exclusive'] },
  { term: 'HOF', definition: 'Hall of Fame / Hall of Famer. Cards of HOF players hold long-term value. "Future HOF" is used speculatively for current stars expected to be inducted.', related: ['Vintage'] },

  // I
  { term: 'Immaculate', definition: 'A Panini ultra-premium brand featuring on-card autographs, high-end patches, and very low print runs. One of the most expensive boxes in any sport.', related: ['Tier', 'Patch', 'On-Card Auto'] },
  { term: 'Insert', definition: 'A special card that is not part of the base set, inserted at specific odds. Examples: Downtown, Kaboom, Silver Prizm. Some inserts are more valuable than the base autos.', related: ['Downtown', 'Kaboom', 'Case Hit'] },
  { term: 'Investing', definition: 'Buying cards primarily for potential financial return rather than collecting. Carries real risk — card values can drop significantly if a player gets injured or underperforms.', related: ['Flip', 'PC'] },

  // J
  { term: 'Jersey Number', definition: 'When a serial-numbered card\'s number matches the player\'s jersey number (e.g., card 12/99 for Tom Brady who wore #12). Highly sought after and commands a premium.', related: ['Serial Numbered', 'Color Match'] },
  { term: 'Jumbo Box', definition: 'A larger hobby box format with more packs and guaranteed hits. Also called "HTA" (Hobby Traded Authorized). Typically the highest-end hobby format before going ultra-premium.', related: ['Hobby Box'] },
  { term: 'Junk Wax Era', definition: 'The late 1980s to early 1990s when card companies massively overproduced. Cards from this era (1987-1993) are generally worth very little because millions were printed.', related: ['Vintage'] },

  // K
  { term: 'Kaboom', definition: 'A colorful, pop-art style case hit insert from Panini. Features bold colors and comic-book aesthetics. One of the most iconic modern inserts.', related: ['Case Hit', 'Insert'] },

  // L
  { term: 'Laundry Tag', definition: 'A memorabilia card containing the actual washing instruction tag from a game-worn jersey. Extremely rare — usually 1/1 — and highly valued by collectors.', related: ['Relic', 'Patch', '1/1'] },
  { term: 'LCS', definition: 'Local Card Shop. An independently owned hobby shop that sells cards, supplies, and often hosts breaks and events. Supporting your LCS is a hobby tradition.', related: ['Hobby Box', 'Card Show'] },
  { term: 'Logoman', definition: 'A memorabilia card containing the NBA/NFL/MLB logo patch from a game-worn jersey. Always a 1/1 and among the most valuable cards in any product.', related: ['1/1', 'Patch', 'Relic'] },
  { term: 'Lot', definition: 'A group of cards sold together as one listing, usually on eBay. Can be a good way to buy commons or build a collection cheaply. "Lot of 10 rookies" means 10 cards in one sale.', related: ['Comps'] },

  // M
  { term: 'Mega Box', definition: 'A retail box format larger than a blaster, often with exclusive parallels. Typically $40-$80. Found at Target, Walmart, and similar retailers.', related: ['Blaster Box', 'Retail'] },
  { term: 'Memorabilia', definition: 'See "Relic." A card containing game-used or player-worn material.', related: ['Relic', 'Patch'] },
  { term: 'Mojo', definition: 'A special refractor-style parallel in Topps Bowman products with an extra-bright, almost holographic shine. The Bowman Chrome equivalent of a silver prizm.', related: ['Refractor', 'Bowman'] },
  { term: 'Mosaic', definition: 'A Panini brand with a distinctive geometric mosaic design pattern. Similar to Prizm but with unique parallels and inserts. Popular mid-tier product.', related: ['Prizm', 'Tier'] },

  // N
  { term: 'National Treasures', definition: 'Panini\'s flagship ultra-premium brand. Features the most coveted RPAs (Rookie Patch Autos) in football, basketball, and baseball. Boxes can cost $1,000+.', related: ['RPA', 'Tier', 'Patch', 'Auto'] },
  { term: 'Numbered', definition: 'See "Serial Numbered."', related: ['Serial Numbered'] },

  // O
  { term: 'Odds', definition: 'The probability of pulling a specific card type from a pack, printed on the wrapper or published in the checklist. "1:24 packs" means you\'ll find one in roughly every 24 packs.', related: ['Insert', 'Hit'] },
  { term: 'On-Card Auto', definition: 'An autograph signed directly on the card surface, not on a sticker. Generally more valuable than sticker autos because they look cleaner and feel more authentic.', related: ['Auto', 'Sticker Auto'] },
  { term: 'One-Touch', definition: 'A rigid magnetic card holder used for protection and display. Comes in various thicknesses measured in "points" (pt) to fit different card types.', related: ['Top Loader', 'Penny Sleeve'] },
  { term: 'Optic', definition: 'The chrome version of Donruss. Features a glossy, refractor-like finish on the same card designs as base Donruss. Rated Rookie Optic cards are popular among collectors.', related: ['Donruss', 'Chrome', 'Rated Rookie'] },

  // P
  { term: 'Pack Fresh', definition: 'A card in perfect condition, as if it just came out of the pack. No handling damage, clean edges, sharp corners. A good sign when buying raw cards.', related: ['Raw', 'Grading'] },
  { term: 'Parallel', definition: 'A variation of a base card with a different color, pattern, or finish. Parallels form a "rainbow" from common (unnumbered) to rare (1/1). The core of modern card collecting.', related: ['Base Card', 'Serial Numbered', 'Rainbow'] },
  { term: 'Patch', definition: 'A memorabilia card containing a piece of a game-worn jersey patch, often multi-colored. More valuable than plain jersey relic cards. Multi-color patches ("sick patches") are the most desirable.', related: ['Relic', 'Logoman', 'Laundry Tag'] },
  { term: 'PC', definition: 'Personal Collection. Cards you keep because you like them, not to flip for profit. "He\'s in my PC" means you collect that player. The heart of the hobby.', related: ['Investing', 'Player Collector'] },
  { term: 'Penny Sleeve', definition: 'A thin, inexpensive plastic sleeve used as the first layer of card protection. Cards go in a penny sleeve before being placed in a top loader or one-touch.', related: ['Top Loader', 'One-Touch'] },
  { term: 'Pick Your Team (PYT)', definition: 'A group break format where participants choose which team\'s cards they receive. Popular teams (Cowboys, Lakers) cost more. You get every card pulled for your team.', related: ['Group Break', 'Random Team'] },
  { term: 'Pink Shimmer', definition: 'A FOTL-exclusive parallel found in some Panini products. Usually very low-numbered (/3 or /5) and highly collectible.', related: ['FOTL', 'Parallel'] },
  { term: 'Player Collector', definition: 'Someone who collects every card of a specific player — all parallels, inserts, autos, and relics. Also called "player collecting" or "supercollecting."', related: ['PC', 'Rainbow'] },
  { term: 'Pop Report', definition: 'A database showing how many copies of a card have been graded at each grade level. PSA\'s pop report is the most referenced. Low pop = fewer graded copies = potentially more valuable.', related: ['PSA', 'Grading', 'Gem Rate'] },
  { term: 'Print Run', definition: 'The total number of copies made of a specific card. A "/25" card has a print run of 25. Lower print runs = higher rarity and value.', related: ['Serial Numbered'] },
  { term: 'Printing Plate', definition: 'The actual metal plate used to print a card, inserted into packs as a 1/1 collectible. Comes in four colors (cyan, magenta, yellow, black). Cool novelty item.', related: ['1/1'] },
  { term: 'Prizm', definition: 'Panini\'s flagship chrome-style brand. "Prizm" also refers to the shiny, refractive parallels within the product. Silver Prizm is the most iconic.', related: ['Chrome', 'Refractor', 'Silver Prizm'] },
  { term: 'Prospect', definition: 'A player who hasn\'t reached the major leagues yet. Prospect cards (especially 1st Bowman Chrome) can be extremely valuable if the player breaks out.', related: ['Rookie Card (RC)', '1st Bowman'] },
  { term: 'PSA', definition: 'Professional Sports Authenticator. The most popular card grading service. Grades on a 1-10 scale, with PSA 10 (Gem Mint) being the highest.', related: ['Grading', 'BGS', 'SGC', 'Pop Report'] },
  { term: 'PWE', definition: 'Plain White Envelope. A cheap shipping method where the card is sent in a regular envelope with stamp. Risk of bending — fine for low-value cards, not for anything over $20.', related: ['BMWT'] },

  // R
  { term: 'Rainbow', definition: 'The complete set of all parallel variations for a single card. Collecting a full rainbow (every color/numbered version) is a popular pursuit. Can range from 10 to 60+ parallels.', related: ['Parallel', 'Player Collector'] },
  { term: 'Random Team', definition: 'A group break format where teams are randomly assigned to participants instead of chosen. Cheaper than Pick Your Team but you can\'t control which team you get.', related: ['Group Break', 'Pick Your Team (PYT)'] },
  { term: 'Rated Rookie', definition: 'Donruss\'s iconic rookie card designation, marked with the "RR" logo. One of the most recognized rookie card brands in the hobby, dating back to the 1980s.', related: ['Donruss', 'Rookie Card (RC)'] },
  { term: 'Raw', definition: 'An ungraded card — not encased in a slab. "Raw value" is what the card is worth without a grade. Buying raw and grading yourself can be profitable if the card grades well.', related: ['Grading', 'Slab', 'Pack Fresh'] },
  { term: 'Redemption', definition: 'A placeholder card for an autograph the manufacturer hasn\'t received yet. You redeem it on the manufacturer\'s website and they mail the real card later — sometimes months or years later.', related: ['Auto'] },
  { term: 'Refractor', definition: 'A parallel with a prismatic, rainbow-like shine when tilted. The hallmark of Topps Chrome products. Variations include Gold, Orange, Red, and Superfractor.', related: ['Chrome', 'Superfractor'] },
  { term: 'Relic', definition: 'A card containing a piece of game-used or player-worn material — usually jersey, but can include bat, shoe, hat, or other equipment. Plain white jersey pieces are least valuable.', related: ['Patch', 'Logoman', 'Laundry Tag'] },
  { term: 'Retail', definition: 'Cards sold at mass-market stores (Target, Walmart, etc.) in blasters, megas, hangers, and other formats. Lower price point with different parallel sets than hobby.', related: ['Blaster Box', 'Mega Box', 'Hobby Box', 'Hanger'] },
  { term: 'Rip', definition: 'Slang for opening packs or boxes of cards. "Let\'s rip some packs" means opening them to see what\'s inside.', related: ['Box Break'] },
  { term: 'Rookie Card (RC)', definition: 'A player\'s first officially licensed card, marked with an "RC" logo. The most important card for most players — rookie cards drive the hobby market.', related: ['Prospect', 'Rated Rookie', '1st Bowman'] },
  { term: 'RPA', definition: 'Rookie Patch Auto. A card combining a rookie designation, game-used patch, and autograph. Considered the pinnacle card for any player\'s rookie year. National Treasures RPAs are the gold standard.', related: ['Rookie Card (RC)', 'Patch', 'Auto', 'National Treasures'] },

  // S
  { term: 'Select', definition: 'A popular Panini brand featuring three tiers of base cards (Concourse, Premier, Courtside) with extensive Prizm parallel rainbows.', related: ['Concourse / Premier / Courtside', 'Prizm'] },
  { term: 'Serial Numbered', definition: 'A card stamped with its individual number out of the total print run (e.g., 15/25 means card #15 of 25 made). Lower numbers and "jersey number" matches add value.', related: ['Print Run', '1/1', 'Color Match', 'Jersey Number'] },
  { term: 'SGC', definition: 'Sportscard Guaranty Corporation. A grading company known for fast turnaround and attractive tuxedo-style slabs. Growing in popularity.', related: ['Grading', 'PSA', 'BGS'] },
  { term: 'Short Print (SP)', definition: 'A card intentionally produced in smaller quantities than the standard base cards. "SSP" means Super Short Print — even rarer. Often look identical to base cards, making them hard to identify.', related: ['Base Card', 'Variation'] },
  { term: 'Silver Prizm', definition: 'The most iconic and popular parallel in the Panini Prizm line. Unnumbered but rarer than base. The silver sheen is instantly recognizable. The "must-have" rookie parallel.', related: ['Prizm', 'Parallel'] },
  { term: 'Slab', definition: 'The hard plastic case a card is sealed in after being professionally graded. "Slabbed" means the card has been graded and encased.', related: ['Grading', 'PSA'] },
  { term: 'SSP', definition: 'Super Short Print. Even rarer than a Short Print (SP). Usually an image variation or special design that\'s very hard to pull. Can be worth significantly more than the regular version.', related: ['Short Print (SP)', 'Variation'] },
  { term: 'Sticker Auto', definition: 'An autograph signed on a sticker that is then applied to the card. Generally less valuable than on-card autos. Common in mass-produced products.', related: ['Auto', 'On-Card Auto'] },
  { term: 'Sub', definition: 'Short for "submission" — sending cards to a grading company. "I\'m subbing these to PSA" means sending them for grading. Turnaround times range from days (express) to months (economy).', related: ['Grading', 'PSA', 'BGS'] },
  { term: 'Superfractor', definition: 'The rarest Topps Chrome parallel — always a 1/1. Features a gold reflective surface. The holy grail of any Topps Chrome set.', related: ['Refractor', '1/1', 'Chrome'] },
  { term: 'Surface', definition: 'The front and back face of a card. Graders check for scratches, print defects, and other imperfections. Chrome cards are especially prone to surface scratches.', related: ['Grading', 'Condition Sensitive'] },

  // T
  { term: 'Team Bag', definition: 'A resealable plastic bag sized for a stack of cards (usually 100+). Used for organizing and protecting bulk cards, team lots, or sets. Bigger than a penny sleeve, smaller than a box.', related: ['Penny Sleeve'] },
  { term: 'The National', definition: 'The National Sports Collectors Convention. The largest annual sports card show in the US. Held in a different city each summer. Features exclusive cards, major dealers, and manufacturer booths.', related: ['Card Show'] },
  { term: 'Tier', definition: 'A product\'s price/quality level. Flagship (cheapest, widest release), Mid-Tier, Premium, and Ultra-Premium (most expensive, fewest cards per box).', related: ['Hobby Box', 'Flagship'] },
  { term: 'Top Loader', definition: 'A rigid plastic card holder that provides more protection than a penny sleeve. Cards go in a penny sleeve first, then into the top loader. The standard way to ship and store singles.', related: ['Penny Sleeve', 'One-Touch'] },
  { term: 'True Rookie', definition: 'A player\'s official rookie card from their actual rookie season — not a prospect card, not a pre-rookie. Only cards marked "RC" are true rookies.', related: ['Rookie Card (RC)', 'Prospect'] },
  { term: 'Turnaround Time', definition: 'How long it takes a grading company to grade and return your cards. Ranges from 5 days (super express, $150+/card) to 6+ months (economy, $20-30/card).', related: ['Grading', 'Sub'] },

  // V
  { term: 'Variation', definition: 'A card that looks like the base version but has a subtle difference — photo, background color, or design element. Some variations (especially SSPs) are very valuable.', related: ['Short Print (SP)', 'SSP', 'Error Card'] },
  { term: 'Vintage', definition: 'Generally cards from the 1970s and earlier, though some extend the definition to pre-2000. Vintage cards are graded on a different curve — a PSA 7 vintage card can be very valuable.', related: ['Junk Wax Era', 'HOF'] },

  // W
  { term: 'Wax', definition: 'Slang for unopened packs or boxes of cards. Comes from the wax paper wrappers used on vintage packs. "Buying wax" means buying sealed product.', related: ['Rip'] },

  // Y
  { term: 'Young Guns', definition: 'Upper Deck\'s iconic NHL rookie card subset. The most chased rookie cards in hockey, found in UD Series 1 and Series 2.', related: ['Rookie Card (RC)'] },
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
