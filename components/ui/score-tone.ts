import type { MatchLevel } from '@/types/evaluation';

/**
 * The single score-to-colour rule for the whole app.
 *
 * The design uses one set of thresholds for the score ring, the sub-score bars
 * and the match badge, so they live here rather than being re-derived per
 * component (which is how the old page ended up with three helpers that could
 * disagree).
 */
export type ScoreTone = 'strong' | 'warn' | 'danger';

export function getScoreTone(score: number): ScoreTone {
  if (score >= 70) return 'strong';
  if (score >= 50) return 'warn';
  return 'danger';
}

/** CSS colour value, for SVG strokes and inline bar fills. */
const TONE_COLORS: Record<ScoreTone, string> = {
  strong: 'var(--color-accent)',
  warn: 'var(--color-warn)',
  danger: 'var(--color-danger)',
};

export function getScoreColor(score: number): string {
  return TONE_COLORS[getScoreTone(score)];
}

const TONE_LABELS: Record<ScoreTone, string> = {
  strong: 'Strong match',
  warn: 'Partial match',
  danger: 'Weak match',
};

export function getScoreLabel(score: number): string {
  return TONE_LABELS[getScoreTone(score)];
}

/**
 * How each per-requirement match level reads. `adjacent` is deliberately
 * neutral rather than green — it's transferable evidence, not the thing itself.
 */
export const MATCH_TONES: Record<MatchLevel, ScoreTone | 'neutral'> = {
  direct: 'strong',
  adjacent: 'neutral',
  partial: 'warn',
  none: 'danger',
};

export const MATCH_LABELS: Record<MatchLevel, string> = {
  direct: 'Direct',
  adjacent: 'Adjacent',
  partial: 'Partial',
  none: 'None',
};
