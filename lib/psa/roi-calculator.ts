// lib/psa/roi-calculator.ts

import type { CompListing } from '../xray/types';
import type { PSAPopSummary, ROIScenario } from './types';
import { SHIPPING_ESTIMATE } from './grading-costs';

/**
 * Group graded listings by grade level and compute median price per grade.
 */
function getMedianByGrade(gradedListings: CompListing[]): Map<string, { median: number; count: number }> {
  const byGrade = new Map<string, number[]>();

  for (const listing of gradedListings) {
    if (!listing.gradeInfo) continue;
    const grade = listing.gradeInfo.grade;
    if (!byGrade.has(grade)) byGrade.set(grade, []);
    byGrade.get(grade)!.push(listing.price);
  }

  const result = new Map<string, { median: number; count: number }>();
  for (const [grade, prices] of byGrade) {
    prices.sort((a, b) => a - b);
    const median = prices[Math.floor(prices.length / 2)];
    result.set(grade, { median, count: prices.length });
  }

  return result;
}

/**
 * Calculate ROI scenarios for grading a raw card.
 */
export function calculateROI(
  rawMedian: number,
  gradedListings: CompListing[],
  popData: PSAPopSummary | null,
  gradingCost: number,
  shipping: number = SHIPPING_ESTIMATE,
): ROIScenario[] {
  const gradeMedians = getMedianByGrade(gradedListings);
  const targetGrades = ['10', '9', '8'];

  return targetGrades.map(grade => {
    const gradeData = gradeMedians.get(grade);
    const gradedValue = gradeData?.median ?? null;
    const salesCount = gradeData?.count ?? 0;

    // Find pop percentage for this grade
    let popPct: number | null = null;
    if (popData) {
      const popEntry = popData.grades.find(g => g.grade === grade);
      popPct = popEntry?.pct ?? 0;
    }

    // Calculate profit and ROI
    let profit: number | null = null;
    let roiPct: number | null = null;
    if (gradedValue !== null) {
      const totalInvestment = rawMedian + gradingCost + shipping;
      profit = Math.round((gradedValue - totalInvestment) * 100) / 100;
      roiPct = totalInvestment > 0
        ? Math.round((profit / totalInvestment) * 1000) / 10
        : null;
    }

    return {
      grade,
      gradedValue,
      rawValue: rawMedian,
      gradingCost,
      shipping,
      profit,
      roiPct,
      popPct,
      salesCount,
    };
  });
}
