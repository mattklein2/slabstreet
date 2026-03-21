'use client';

import { useState, useMemo } from 'react';
import { useTheme } from '../ThemeProvider';
import { calculateROI } from '../../../lib/psa/roi-calculator';
import { getTiersForCompany, SHIPPING_ESTIMATE } from '../../../lib/psa/grading-costs';
import type { PriceComps } from '../../../lib/xray/types';
import type { PSAPopSummary, GradingTier, ROIScenario } from '../../../lib/psa/types';

interface Props {
  priceComps: PriceComps | null;
  popData: PSAPopSummary | null;
}

type Company = 'PSA' | 'BGS' | 'SGC';

export function GradingROI({ priceComps, popData }: Props) {
  const { colors } = useTheme();
  const [company, setCompany] = useState<Company>('PSA');
  const [tierIndex, setTierIndex] = useState(0);
  const [rawOverride, setRawOverride] = useState<string>('');

  const tiers = getTiersForCompany(company);
  const selectedTier = tiers[tierIndex] || tiers[0];

  // When company changes, reset tier to first option
  const handleCompanyChange = (c: Company) => {
    setCompany(c);
    setTierIndex(0);
  };

  // Determine raw value: user override > price comps median
  const rawMedian = priceComps?.raw?.median ?? null;
  const rawValue = rawOverride ? parseFloat(rawOverride) : rawMedian;
  const gradedListings = priceComps?.graded?.listings ?? [];

  const scenarios = useMemo(() => {
    if (rawValue === null || isNaN(rawValue) || rawValue <= 0) return [];
    return calculateROI(rawValue, gradedListings, popData, selectedTier.price, SHIPPING_ESTIMATE);
  }, [rawValue, gradedListings, popData, selectedTier.price]);

  // Don't render if we have no price data at all
  if (!priceComps || (rawMedian === null && gradedListings.length === 0)) return null;

  return (
    <section style={{ background: colors.surface, borderRadius: 14, padding: 24, marginBottom: 16 }}>
      <h2 style={{
        margin: '0 0 16px', fontSize: 14, fontFamily: "'IBM Plex Mono', monospace",
        fontWeight: 600, letterSpacing: 1, color: colors.green, textTransform: 'uppercase',
      }}>
        Should You Grade?
      </h2>

      {/* Controls row */}
      <div style={{
        display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20, alignItems: 'flex-end',
      }}>
        {/* Grader select */}
        <div>
          <label style={labelStyle(colors)}>Grading Company</label>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['PSA', 'BGS', 'SGC'] as Company[]).map(c => (
              <button
                key={c}
                onClick={() => handleCompanyChange(c)}
                style={{
                  padding: '6px 14px', borderRadius: 6, fontSize: 13, fontWeight: 600,
                  fontFamily: "'IBM Plex Mono', monospace", cursor: 'pointer',
                  border: company === c ? `1px solid ${colors.green}` : `1px solid ${colors.border}`,
                  background: company === c ? `${colors.green}15` : 'transparent',
                  color: company === c ? colors.green : colors.muted,
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Tier select */}
        <div>
          <label style={labelStyle(colors)}>Service Tier</label>
          <select
            value={tierIndex}
            onChange={e => setTierIndex(parseInt(e.target.value))}
            style={{
              padding: '6px 10px', borderRadius: 6, fontSize: 13,
              fontFamily: "'IBM Plex Mono', monospace",
              background: colors.bg, color: colors.text,
              border: `1px solid ${colors.border}`, cursor: 'pointer',
            }}
          >
            {tiers.map((t, i) => (
              <option key={i} value={i}>
                {t.tierName} — ${t.price} ({t.turnaroundDays}d)
              </option>
            ))}
          </select>
        </div>

        {/* Raw value override */}
        <div>
          <label style={labelStyle(colors)}>
            Raw Value {rawMedian !== null && !rawOverride ? `(est. $${rawMedian.toFixed(0)})` : ''}
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 14, color: colors.muted, fontFamily: "'IBM Plex Mono', monospace" }}>$</span>
            <input
              type="number"
              placeholder={rawMedian !== null ? rawMedian.toFixed(0) : '0'}
              value={rawOverride}
              onChange={e => setRawOverride(e.target.value)}
              style={{
                width: 80, padding: '6px 8px', borderRadius: 6, fontSize: 13,
                fontFamily: "'IBM Plex Mono', monospace",
                background: colors.bg, color: colors.text,
                border: `1px solid ${colors.border}`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Scenario cards */}
      {scenarios.length > 0 ? (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {scenarios.map(scenario => (
            <ScenarioCard key={scenario.grade} scenario={scenario} colors={colors} company={company} />
          ))}
        </div>
      ) : (
        <p style={{ fontSize: 14, color: colors.muted, fontFamily: "'IBM Plex Sans', sans-serif" }}>
          Enter a raw card value to see grading ROI estimates.
        </p>
      )}

      {/* Disclaimer */}
      <p style={{
        marginTop: 16, marginBottom: 0, fontSize: 11, color: colors.muted,
        fontFamily: "'IBM Plex Sans', sans-serif", lineHeight: 1.5,
      }}>
        Estimates based on recent eBay sales. Grading costs and turnaround times may vary.
        Not financial advice. Shipping estimated at ${SHIPPING_ESTIMATE}.
      </p>
    </section>
  );
}

function labelStyle(colors: any) {
  return {
    display: 'block', fontSize: 11, fontFamily: "'IBM Plex Mono', monospace" as const,
    color: colors.muted, textTransform: 'uppercase' as const, letterSpacing: 0.5,
    marginBottom: 6,
  };
}

function ScenarioCard({ scenario, colors, company }: { scenario: ROIScenario; colors: any; company: Company }) {
  const hasData = scenario.gradedValue !== null;
  const isPositive = hasData && scenario.profit !== null && scenario.profit > 0;
  const accentColor = !hasData ? colors.muted : isPositive ? colors.green : colors.red;
  const totalInvestment = scenario.rawValue + scenario.gradingCost + scenario.shipping;

  return (
    <div style={{
      flex: '1 1 180px', minWidth: 160, padding: 16, borderRadius: 10,
      background: `${colors.border}30`, border: `1px solid ${colors.border}`,
    }}>
      {/* Grade header */}
      <div style={{
        fontSize: 13, fontFamily: "'IBM Plex Mono', monospace",
        fontWeight: 700, color: accentColor, marginBottom: 12,
        textTransform: 'uppercase', letterSpacing: 0.5,
      }}>
        {company} {scenario.grade}
      </div>

      {hasData ? (
        <>
          {/* Graded value */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: colors.muted, fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Graded Value
            </div>
            <div style={{ fontSize: 22, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, color: colors.text }}>
              ${scenario.gradedValue!.toFixed(0)}
            </div>
            <div style={{ fontSize: 11, color: colors.muted, fontFamily: "'IBM Plex Mono', monospace" }}>
              based on {scenario.salesCount} sale{scenario.salesCount !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Investment breakdown */}
          <div style={{ fontSize: 12, color: colors.muted, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 8, lineHeight: 1.8 }}>
            <div>Card: ${scenario.rawValue.toFixed(0)}</div>
            <div>Grading: ${scenario.gradingCost}</div>
            <div>Shipping: ${scenario.shipping}</div>
            <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: 4, color: colors.secondary }}>
              Total: ${totalInvestment.toFixed(0)}
            </div>
          </div>

          {/* Profit / ROI */}
          <div style={{
            padding: '8px 10px', borderRadius: 6,
            background: `${accentColor}12`, border: `1px solid ${accentColor}30`,
          }}>
            <div style={{
              fontSize: 18, fontFamily: "'IBM Plex Mono', monospace",
              fontWeight: 700, color: accentColor,
            }}>
              {scenario.profit! >= 0 ? '+' : ''}${scenario.profit!.toFixed(0)}
            </div>
            <div style={{
              fontSize: 12, fontFamily: "'IBM Plex Mono', monospace",
              color: accentColor,
            }}>
              {scenario.roiPct !== null ? `${scenario.roiPct >= 0 ? '+' : ''}${scenario.roiPct.toFixed(0)}% ROI` : ''}
            </div>
          </div>

          {/* Pop context */}
          {scenario.popPct !== null && (
            <div style={{
              marginTop: 8, fontSize: 11, fontFamily: "'IBM Plex Sans', sans-serif",
              color: colors.muted, lineHeight: 1.5,
            }}>
              {scenario.popPct}% of submissions grade {scenario.grade}
            </div>
          )}
        </>
      ) : (
        <div style={{ fontSize: 13, color: colors.muted, fontFamily: "'IBM Plex Sans', sans-serif" }}>
          Not enough graded sales data at this grade level to estimate value.
        </div>
      )}
    </div>
  );
}
