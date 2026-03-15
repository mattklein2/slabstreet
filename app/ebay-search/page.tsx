'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '../components/ThemeProvider';

const CATEGORIES = [
  { value: '261328', label: 'Sports Trading Cards' },
  { value: '213', label: 'All Trading Cards' },
  { value: '261330', label: 'Non-Sport Trading Cards' },
  { value: '183454', label: 'Magic: The Gathering' },
];

const CONDITIONS = [
  { value: '', label: 'Any' },
  { value: '1000', label: 'New' },
  { value: '3000', label: 'Used' },
  { value: '1500', label: 'Open Box' },
];

const LISTING_TYPES = [
  { value: '', label: 'All Listings' },
  { value: 'auction', label: 'Auction Only' },
  { value: 'bin', label: 'Buy It Now Only' },
  { value: 'offers', label: 'Accepts Offers' },
];

const SORT_OPTIONS = [
  { value: '12', label: 'Best Match' },
  { value: '1', label: 'Ending Soonest' },
  { value: '10', label: 'Newly Listed' },
  { value: '15', label: 'Price: Low to High' },
  { value: '16', label: 'Price: High to Low' },
];

const LOCATIONS = [
  { value: '', label: 'Anywhere' },
  { value: '1', label: 'US Only' },
  { value: '2', label: 'North America' },
];

export default function EbaySearchPage() {
  const { colors } = useTheme();

  const [keywords, setKeywords] = useState('');
  const [category, setCategory] = useState('261328');
  const [excludeWords, setExcludeWords] = useState('');
  const [condition, setCondition] = useState('');
  const [listingType, setListingType] = useState('');
  const [sort, setSort] = useState('12');
  const [location, setLocation] = useState('1');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [soldOnly, setSoldOnly] = useState(false);
  const [freeShipping, setFreeShipping] = useState(false);
  const [returnsAccepted, setReturnsAccepted] = useState(false);
  const [excludeLots, setExcludeLots] = useState(false);
  const [excludeReprints, setExcludeReprints] = useState(false);
  const [gradedOnly, setGradedOnly] = useState(false);
  const [rawOnly, setRawOnly] = useState(false);

  function buildUrl(): string {
    const params = new URLSearchParams();

    let kw = keywords.trim();
    if (gradedOnly) kw += ' (PSA,BGS,SGC,CGC)';
    params.set('_nkw', kw);

    params.set('_sacat', category);
    params.set('_sop', sort);

    if (condition) params.set('LH_ItemCondition', condition);
    if (location === '1') params.set('LH_PrefLoc', '1');
    if (location === '2') params.set('LH_PrefLoc', '2');
    if (soldOnly) {
      params.set('LH_Sold', '1');
      params.set('LH_Complete', '1');
    }
    if (freeShipping) params.set('LH_FS', '1');
    if (returnsAccepted) params.set('LH_Returns', '1');
    if (listingType === 'auction') params.set('LH_Auction', '1');
    if (listingType === 'bin') params.set('LH_BIN', '1');
    if (listingType === 'offers') params.set('LH_BO', '1');
    if (minPrice) params.set('_udlo', minPrice);
    if (maxPrice) params.set('_udhi', maxPrice);

    const exclusions: string[] = [];
    if (excludeWords.trim()) exclusions.push(...excludeWords.trim().split(/\s+/));
    if (excludeLots) exclusions.push('lot', 'lots', 'bundle', 'bulk');
    if (excludeReprints) exclusions.push('reprint', 'rp', 'custom', 'novelty');
    if (rawOnly) exclusions.push('PSA', 'BGS', 'SGC', 'CGC', 'CSG', 'HGA', 'graded', 'slab');
    if (exclusions.length > 0) params.set('_ex_kw', exclusions.join(' '));

    params.set('_ipg', '120');
    return `https://www.ebay.com/sch/i.html?${params.toString()}`;
  }

  function handleSearch() {
    if (!keywords.trim()) return;
    window.open(buildUrl(), '_blank');
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    fontSize: 14,
    fontFamily: "'IBM Plex Sans', sans-serif",
    background: colors.bg,
    color: colors.text,
    border: `1px solid ${colors.border}`,
    borderRadius: 10,
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 10,
    fontWeight: 500,
    color: colors.muted,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  };

  const sectionStyle: React.CSSProperties = {
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: 14,
    padding: '24px 22px',
    marginBottom: 16,
  };

  const sectionTitle: React.CSSProperties = {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 20,
    letterSpacing: 1,
    color: colors.text,
    margin: '0 0 16px',
  };

  function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
      <button
        onClick={onClick}
        style={{
          padding: '6px 14px',
          fontSize: 12,
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontWeight: active ? 600 : 400,
          background: active ? colors.green : 'transparent',
          color: active ? '#0a0f1a' : colors.muted,
          border: `1px solid ${active ? colors.green : colors.border}`,
          borderRadius: 20,
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}
      >
        {label}
      </button>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 20px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: colors.muted }}>
            &larr; Back to SlabStreet
          </span>
        </Link>
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 42,
          letterSpacing: 2,
          color: colors.text,
          margin: '12px 0 4px',
          lineHeight: 1,
        }}>
          CARD SEARCH
        </h1>
        <p style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: 14,
          color: colors.muted,
          margin: 0,
        }}>
          Build the perfect eBay search. Fill in what you want, skip the rest.
        </p>
      </div>

      {/* Sticky Search Button */}
      <div style={{ position: 'sticky', top: 56, zIndex: 40, marginBottom: 16 }}>
        <button
          onClick={handleSearch}
          disabled={!keywords.trim()}
          style={{
            width: '100%',
            padding: '16px',
            fontSize: 18,
            fontFamily: "'Bebas Neue', sans-serif",
            fontWeight: 700,
            letterSpacing: 3,
            background: keywords.trim() ? colors.green : colors.border,
            color: keywords.trim() ? '#0a0f1a' : colors.muted,
            border: 'none',
            borderRadius: 12,
            cursor: keywords.trim() ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
          }}
        >
          SEARCH EBAY
        </button>
      </div>

      {/* Keywords */}
      <div style={sectionStyle}>
        <h2 style={sectionTitle}>What Are You Looking For?</h2>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Keywords</label>
          <input
            type="text"
            value={keywords}
            onChange={e => setKeywords(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="e.g. 2024 Prizm Caleb Williams rookie"
            style={{ ...inputStyle, fontSize: 16, padding: '14px 16px' }}
          />
          <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, color: colors.muted, marginTop: 6 }}>
            Tip: Be specific — include year, product name, and player
          </div>
        </div>
        <div>
          <label style={labelStyle}>Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      </div>

      {/* Card Filters */}
      <div style={sectionStyle}>
        <h2 style={sectionTitle}>Card Filters</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          <Chip label="Sold Listings Only" active={soldOnly} onClick={() => setSoldOnly(!soldOnly)} />
          <Chip label="Graded Only" active={gradedOnly} onClick={() => { setGradedOnly(!gradedOnly); if (!gradedOnly) setRawOnly(false); }} />
          <Chip label="Raw Only" active={rawOnly} onClick={() => { setRawOnly(!rawOnly); if (!rawOnly) setGradedOnly(false); }} />
          <Chip label="Exclude Lots" active={excludeLots} onClick={() => setExcludeLots(!excludeLots)} />
          <Chip label="Exclude Reprints" active={excludeReprints} onClick={() => setExcludeReprints(!excludeReprints)} />
        </div>
        <div>
          <label style={labelStyle}>Exclude Keywords</label>
          <input
            type="text"
            value={excludeWords}
            onChange={e => setExcludeWords(e.target.value)}
            placeholder="e.g. digital auto autograph"
            style={inputStyle}
          />
          <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, color: colors.muted, marginTop: 6 }}>
            Words separated by spaces — results with these words will be filtered out
          </div>
        </div>
      </div>

      {/* Listing Options */}
      <div style={sectionStyle}>
        <h2 style={sectionTitle}>Listing Options</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={labelStyle}>Listing Type</label>
            <select value={listingType} onChange={e => setListingType(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
              {LISTING_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Sort By</label>
            <select value={sort} onChange={e => setSort(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
              {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Condition</label>
            <select value={condition} onChange={e => setCondition(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
              {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Seller Location</label>
            <select value={location} onChange={e => setLocation(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
              {LOCATIONS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
          <Chip label="Free Shipping" active={freeShipping} onClick={() => setFreeShipping(!freeShipping)} />
          <Chip label="Returns Accepted" active={returnsAccepted} onClick={() => setReturnsAccepted(!returnsAccepted)} />
        </div>
      </div>

      {/* Price Range */}
      <div style={sectionStyle}>
        <h2 style={sectionTitle}>Price Range</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={labelStyle}>Min Price ($)</label>
            <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="No minimum" min="0" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Max Price ($)</label>
            <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="No maximum" min="0" style={inputStyle} />
          </div>
        </div>
      </div>

      {/* Pro Tips */}
      <div style={{ ...sectionStyle, background: `${colors.green}08`, border: `1px solid ${colors.green}20` }}>
        <h2 style={{ ...sectionTitle, color: colors.green, fontSize: 16 }}>Pro Tips</h2>
        <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: colors.muted, lineHeight: 1.8 }}>
          <div style={{ marginBottom: 6 }}><strong style={{ color: colors.text }}>Ending Soonest + Auction</strong> — Find deals others miss. High bid count = real market price.</div>
          <div style={{ marginBottom: 6 }}><strong style={{ color: colors.text }}>US Only</strong> — Cuts most scammers, avoids tariffs, guarantees easy returns.</div>
          <div style={{ marginBottom: 6 }}><strong style={{ color: colors.text }}>Sold Listings</strong> — See what cards actually sold for, not what sellers dream of.</div>
          <div><strong style={{ color: colors.text }}>Exclude Lots</strong> — Filters out bulk listings so you only see individual cards.</div>
        </div>
      </div>

      {/* Bottom Search Button */}
      <button
        onClick={handleSearch}
        disabled={!keywords.trim()}
        style={{
          width: '100%',
          padding: '16px',
          fontSize: 18,
          fontFamily: "'Bebas Neue', sans-serif",
          fontWeight: 700,
          letterSpacing: 3,
          background: keywords.trim() ? colors.green : colors.border,
          color: keywords.trim() ? '#0a0f1a' : colors.muted,
          border: 'none',
          borderRadius: 12,
          cursor: keywords.trim() ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s',
        }}
      >
        SEARCH EBAY
      </button>
    </div>
  );
}
