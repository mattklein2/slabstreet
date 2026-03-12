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
