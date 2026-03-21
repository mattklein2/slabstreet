// lib/psa/grading-costs.ts

import type { GradingTier } from './types';

export const GRADING_TIERS: GradingTier[] = [
  // PSA
  { company: 'PSA', tierName: 'Value',         price: 25,  turnaroundDays: 45 },
  { company: 'PSA', tierName: 'Regular',       price: 50,  turnaroundDays: 20 },
  { company: 'PSA', tierName: 'Express',        price: 150, turnaroundDays: 10 },
  { company: 'PSA', tierName: 'Super Express',  price: 300, turnaroundDays: 5 },
  // BGS
  { company: 'BGS', tierName: 'Standard',  price: 25,  turnaroundDays: 50 },
  { company: 'BGS', tierName: 'Express',   price: 100, turnaroundDays: 10 },
  { company: 'BGS', tierName: 'Premium',   price: 250, turnaroundDays: 5 },
  // SGC
  { company: 'SGC', tierName: 'Economy',   price: 20,  turnaroundDays: 60 },
  { company: 'SGC', tierName: 'Standard',  price: 30,  turnaroundDays: 30 },
  { company: 'SGC', tierName: 'Express',   price: 50,  turnaroundDays: 15 },
];

export const SHIPPING_ESTIMATE = 15; // round trip estimate

export function getTiersForCompany(company: 'PSA' | 'BGS' | 'SGC'): GradingTier[] {
  return GRADING_TIERS.filter(t => t.company === company);
}
