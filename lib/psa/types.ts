// lib/psa/types.ts

/** Raw PSA population data from the API (grade counts) */
export interface PSAPopData {
  specId: number;
  description: string;
  total: number;
  auth: number;
  grade1: number;
  grade1_5: number;
  grade2: number;
  grade2_5: number;
  grade3: number;
  grade3_5: number;
  grade4: number;
  grade4_5: number;
  grade5: number;
  grade5_5: number;
  grade6: number;
  grade6_5: number;
  grade7: number;
  grade7_5: number;
  grade8: number;
  grade8_5: number;
  grade9: number;
  grade9_5: number;
  grade10: number;
  // Qualifier variants (e.g. PSA 9(Q) — meets grade with a qualifier)
  grade1q: number;
  grade2q: number;
  grade3q: number;
  grade4q: number;
  grade5q: number;
  grade6q: number;
  grade7q: number;
  grade8q: number;
  grade9q: number;
  grade10q: number;
}

/** Simplified grade distribution entry for UI display */
export interface PopGradeEntry {
  grade: string;    // "10", "9", "8", etc.
  count: number;
  pct: number;      // percentage of total
}

/** Summarized pop data for components */
export interface PSAPopSummary {
  specId: number;
  description: string;
  totalGraded: number;
  grades: PopGradeEntry[];  // sorted high to low (10, 9, 8...)
}

/** A grading company's service tier */
export interface GradingTier {
  company: 'PSA' | 'BGS' | 'SGC';
  tierName: string;
  price: number;
  turnaroundDays: number;
}

/** ROI scenario for a specific grade outcome */
export interface ROIScenario {
  grade: string;           // "10", "9", "8"
  gradedValue: number | null;  // estimated value if graded at this level (null = insufficient data)
  rawValue: number;
  gradingCost: number;
  shipping: number;
  profit: number | null;
  roiPct: number | null;
  popPct: number | null;   // % of submissions grading at this level (null if no pop data)
  salesCount: number;       // number of graded sales at this level we based the estimate on
}
