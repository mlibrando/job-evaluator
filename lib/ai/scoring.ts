import type {
  JobRequirement,
  MatchLevel,
  RequirementAssessment,
  RequirementCategory,
  RequirementImportance,
  SubscoreBreakdown,
} from '@/types/evaluation';

/**
 * Scoring policy for job evaluations.
 *
 * Claude never states a score. It classifies each extracted requirement into an
 * ordinal match level; everything numeric happens here. Keeping the weights in
 * code means scoring policy can be retuned — and stored evaluations re-scored
 * from their frozen requirements — without touching a prompt.
 */

export const MATCH_POINTS: Record<MatchLevel, number> = {
  direct: 1.0,
  adjacent: 0.7,
  partial: 0.4,
  none: 0,
};

export const IMPORTANCE_WEIGHTS: Record<RequirementImportance, number> = {
  required: 1.0,
  preferred: 0.5,
};

export const CATEGORY_WEIGHTS: Record<RequirementCategory, number> = {
  skill: 0.5,
  experience: 0.3,
  domain: 0.2,
};

/** Match levels that count as "the candidate actually has this". */
const COVERED_MATCHES: readonly MatchLevel[] = ['direct', 'adjacent'];

/**
 * Compute a 0-100 score per category.
 *
 * A category with no requirements scores 0 here — callers must use
 * `getPresentCategories` to exclude it rather than treating that 0 as a result.
 */
export function computeSubscores(
  requirements: JobRequirement[],
  assessments: RequirementAssessment[]
): SubscoreBreakdown {
  const matchById = new Map(assessments.map((a) => [a.requirementId, a.match]));

  const scoreCategory = (category: RequirementCategory): number => {
    const inCategory = requirements.filter((r) => r.category === category);

    let earned = 0;
    let possible = 0;

    for (const requirement of inCategory) {
      const weight = IMPORTANCE_WEIGHTS[requirement.importance];
      const match = matchById.get(requirement.id);
      // An unassessed requirement counts as `none` rather than being skipped —
      // dropping it would silently shrink the denominator and inflate the score.
      earned += MATCH_POINTS[match ?? 'none'] * weight;
      possible += weight;
    }

    if (possible === 0) return 0;
    return Math.round((earned / possible) * 100);
  };

  return {
    skillMatch: scoreCategory('skill'),
    experienceMatch: scoreCategory('experience'),
    domainFit: scoreCategory('domain'),
  };
}

/**
 * Categories that actually have requirements. Categories the job posting never
 * mentioned are excluded from the overall score instead of scoring zero.
 */
export function getPresentCategories(
  requirements: JobRequirement[]
): RequirementCategory[] {
  const categories: RequirementCategory[] = ['skill', 'experience', 'domain'];
  return categories.filter((category) =>
    requirements.some((r) => r.category === category)
  );
}

const SUBSCORE_KEYS: Record<RequirementCategory, keyof SubscoreBreakdown> = {
  skill: 'skillMatch',
  experience: 'experienceMatch',
  domain: 'domainFit',
};

/**
 * Blend the subscores into the headline 0-100 score.
 *
 * Only `presentCategories` contribute; their weights are renormalized to sum to
 * 1 so a posting with no domain requirements isn't penalized for it.
 */
export function computeOverallScore(
  subscores: SubscoreBreakdown,
  presentCategories: RequirementCategory[]
): number {
  const totalWeight = presentCategories.reduce(
    (sum, category) => sum + CATEGORY_WEIGHTS[category],
    0
  );

  if (totalWeight === 0) return 0;

  const weighted = presentCategories.reduce((sum, category) => {
    return sum + subscores[SUBSCORE_KEYS[category]] * CATEGORY_WEIGHTS[category];
  }, 0);

  return Math.round(weighted / totalWeight);
}

/**
 * Requirement coverage: what share of what the posting asked for does the
 * candidate demonstrably have? Counted binary (direct/adjacent = yes), which
 * makes it a different question from `overallScore`'s graded quality blend.
 *
 * Scoped to `required` requirements; falls back to all requirements when a
 * posting yielded only `preferred` ones.
 */
export function computeMatchPercentage(
  requirements: JobRequirement[],
  assessments: RequirementAssessment[]
): number {
  const required = requirements.filter((r) => r.importance === 'required');
  const scope = required.length > 0 ? required : requirements;

  if (scope.length === 0) return 0;

  const matchById = new Map(assessments.map((a) => [a.requirementId, a.match]));

  const covered = scope.filter((requirement) => {
    const match = matchById.get(requirement.id);
    return match !== undefined && COVERED_MATCHES.includes(match);
  }).length;

  return Math.round((covered / scope.length) * 100);
}
