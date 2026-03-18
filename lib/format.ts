// lib/format.ts

const CONFIG_TYPE_LABELS: Record<string, string> = {
  hobby_box: 'Hobby Box',
  blaster: 'Blaster Box',
  mega_box: 'Mega Box',
  hanger: 'Hanger Pack',
  fat_pack: 'Fat Pack',
  cello: 'Cello Pack',
  retail_box: 'Retail Box',
  value_pack: 'Value Pack',
  gravity_feed: 'Gravity Feed',
};

export function formatConfigType(configType: string): string {
  return CONFIG_TYPE_LABELS[configType] || configType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function formatPrintRun(printRun: number | null): string {
  if (printRun === null) return 'Unlimited';
  if (printRun === 1) return '1/1';
  return `/${printRun}`;
}

export function formatPrice(price: number | null): string {
  if (price === null) return 'Price unavailable';
  return `$${price.toFixed(2)}`;
}

// Maps box config_type DB values to the labels used in parallels.box_exclusivity
export const CONFIG_TYPE_TO_EXCLUSIVITY: Record<string, string[]> = {
  blaster:      ['Blaster', 'Retail Blaster', 'Retail', 'Value Blaster', 'All'],
  mega_box:     ['Mega Box', 'Mega', 'Retail Mega', 'Hobby Mega', 'Celebration Mega', 'All'],
  hanger:       ['Hanger', 'Hanger Pack', 'All'],
  fat_pack:     ['Fat Pack', 'Fat Pack/Cello', 'All'],
  cello:        ['Cello', 'Cello Pack', 'Fat Pack/Cello', 'All'],
  value_pack:   ['Value Pack', 'All'],
  gravity_feed: ['Gravity Feed', 'All'],
  retail_box:   ['Retail', 'Retail Box', 'All'],
  hobby_box:    ['Hobby', 'Hobby Box', 'Hobby International', 'All'],
};

export function exclusivityMatchesConfig(boxExclusivity: string[] | null, configType: string): boolean {
  if (!boxExclusivity) return true; // null = available everywhere
  const matchLabels = CONFIG_TYPE_TO_EXCLUSIVITY[configType] || ['All'];
  return boxExclusivity.some(val => matchLabels.includes(val));
}

export const BOX_TYPE_DESCRIPTIONS: Record<string, { name: string; description: string }> = {
  blaster: {
    name: 'Blaster Box',
    description: 'The most common retail box. Usually 6-8 packs, found at Target, Walmart, and most retailers. Great entry point — affordable and sometimes has retail-exclusive parallels you can\'t get in hobby boxes.',
  },
  mega_box: {
    name: 'Mega Box',
    description: 'A bigger retail box with more packs and often exclusive parallels not found in blasters or hobby. Usually Target or Walmart exclusive. More expensive but better odds at hitting something special.',
  },
  hanger: {
    name: 'Hanger Pack',
    description: 'A single large pack (usually 20-30 cards) that hangs on a peg hook. Cheapest way to rip — good for scratching the itch without committing to a full box.',
  },
  fat_pack: {
    name: 'Fat Pack',
    description: 'Similar to a hanger — a jumbo single pack with extra cards. Sometimes called "value packs." Good for building your base set collection.',
  },
  cello: {
    name: 'Cello Pack',
    description: 'A clear-wrapped pack where you can see some cards through the packaging. Usually contains more cards than a standard pack.',
  },
  value_pack: {
    name: 'Value Pack',
    description: 'Budget-friendly multi-pack bundle. Good card count for the price, but usually lower odds of hitting rare parallels.',
  },
  gravity_feed: {
    name: 'Gravity Feed',
    description: 'Small single packs sold from a gravity-fed display box at the register. Impulse buy territory — cheap but low odds.',
  },
  hobby_box: {
    name: 'Hobby Box',
    description: 'The premium option, sold at card shops and online. Guaranteed autographs or relics. Expensive but best odds. Not found at Target/Walmart.',
  },
};
