import { CATEGORY_WEIGHTS } from '@/lib/ai/scoring';

/**
 * Sub-scores for the sample report shown on the landing page. Shared by the
 * hero preview and the weighted-scoring breakdown so the numbers agree, and
 * chosen so the overall works out to the 87 the hero shows.
 */
export const SAMPLE_SUB_SCORES = [
  { label: 'Skills', value: 91, weight: CATEGORY_WEIGHTS.skill },
  { label: 'Experience', value: 84, weight: CATEGORY_WEIGHTS.experience },
  { label: 'Domain', value: 83, weight: CATEGORY_WEIGHTS.domain },
];

export const SAMPLE_WEIGHTED_TOTAL = SAMPLE_SUB_SCORES.reduce(
  (sum, { value, weight }) => sum + value * weight,
  0
);

export const SAMPLE_OVERALL = Math.round(SAMPLE_WEIGHTED_TOTAL);
