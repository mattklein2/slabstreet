export function WebsiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'SlabStreet',
    url: 'https://slabstreet.com',
    description: 'Free sports card tools for collectors. Identify cards, check sold prices, find shows, and learn the hobby.',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://slabstreet.com/ebay-search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function XRayResultSchema({ result, url }: { result: { identity: { player: string | null; year: string | null; brand: string | null; parallel: string | null }; listing: { price: number; currency: string; imageUrl: string; itemUrl: string } }; url: string }) {
  const name = [result.identity.year, result.identity.brand, result.identity.player]
    .filter(Boolean).join(' ');
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: name || 'Sports Card',
    description: `Card X-Ray analysis: ${result.identity.parallel || 'Base'} parallel`,
    image: result.listing.imageUrl || undefined,
    url,
    brand: result.identity.brand
      ? { '@type': 'Brand', name: result.identity.brand }
      : undefined,
    offers: {
      '@type': 'Offer',
      price: result.listing.price,
      priceCurrency: result.listing.currency,
      url: result.listing.itemUrl,
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function WebAppSchema({ name, url, description }: { name: string; url: string; description: string }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    url,
    description,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
