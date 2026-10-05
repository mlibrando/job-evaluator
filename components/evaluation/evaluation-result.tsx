'use client';

import { useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import {
  Alert,
  Badge,
  Button,
  Card,
  InsightRow,
  MATCH_LABELS,
  MATCH_TONES,
  ScoreRing,
  SubScoreBar,
  getScoreLabel,
  getScoreTone,
  useDismiss,
  type InsightTone,
  type ScoreTone,
} from '@/components/ui';
import type {
  Evaluation,
  MatchLevel,
  RequirementCategory,
  SubscoreBreakdown,
} from '@/types/evaluation';
import { getPresentCategories } from '@/lib/ai/scoring';
import { resumeFileName } from '@/lib/resume/file-name';
import { cn } from '@/lib/utils/cn';

const SUBSCORE_LABELS: {
  key: keyof SubscoreBreakdown;
  category: RequirementCategory;
  label: string;
}[] = [
  { key: 'skillMatch', category: 'skill', label: 'Skill match' },
  { key: 'experienceMatch', category: 'experience', label: 'Experience' },
  { key: 'domainFit', category: 'domain', label: 'Domain fit' },
];

const MATCH_COUNTS: { match: MatchLevel; label: string }[] = [
  { match: 'direct', label: 'direct' },
  { match: 'adjacent', label: 'adjacent' },
  { match: 'partial', label: 'partial' },
  { match: 'none', label: 'missing' },
];

const TONE_TEXT: Record<ScoreTone | 'neutral', string> = {
  strong: 'text-accent-hover',
  neutral: 'text-ink-secondary',
  warn: 'text-warn',
  danger: 'text-danger',
};

interface EvaluationResultProps {
  evaluation: Evaluation;
}

export function EvaluationResult({ evaluation }: EvaluationResultProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [postingOpen, setPostingOpen] = useState(false);
  const [gapsOnly, setGapsOnly] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useDismiss(menuRef, menuOpen, () => setMenuOpen(false));

  const { analysis } = evaluation;

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/evaluations/${evaluation.evaluationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete evaluation');
      }

      router.push('/history');
      router.refresh();
    } catch (err) {
      console.error('Delete error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setIsDeleting(false);
      setConfirmOpen(false);
    }
  };

  const assessedCategories = getPresentCategories(analysis.requirements ?? []);
  const visibleSubscores = SUBSCORE_LABELS.filter(({ category }) =>
    assessedCategories.includes(category)
  );

  const summaryParagraphs = (analysis.summary ?? '')
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const requirementRows = (analysis.requirements ?? []).map((requirement) => {
    const assessment = analysis.assessments?.find((a) => a.requirementId === requirement.id);
    return { requirement, assessment, match: assessment?.match ?? ('none' as MatchLevel) };
  });
  const gapRows = requirementRows.filter(({ match }) => match !== 'direct');
  const shownRows = gapsOnly ? gapRows : requirementRows;
  const matchCounts = MATCH_COUNTS.map(({ match, label }) => ({
    match,
    label,
    count: requirementRows.filter((row) => row.match === match).length,
  })).filter(({ count }) => count > 0);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const hasInsights =
    analysis.keyInsights?.length || analysis.strengths?.length || analysis.weaknesses?.length;

  return (
    <div className="flex flex-col gap-5">
      {/* Title, badge, actions */}
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-[34px] leading-[1.1] font-extrabold tracking-[-0.03em] text-ink">
              {evaluation.jobTitle}
            </h1>
            <Badge tone={getScoreTone(analysis.overallScore)}>
              {getScoreLabel(analysis.overallScore)}
            </Badge>
          </div>
          <p className="text-sm text-ink-secondary">
            {[
              evaluation.companyName,
              `Evaluated ${formatDate(evaluation.createdAt)}`,
              evaluation.resumeKey && resumeFileName(evaluation.resumeKey),
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {evaluation.jobDescription && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPostingOpen((open) => !open)}
              aria-expanded={postingOpen}
              aria-controls="job-posting"
            >
              {postingOpen ? 'Hide posting' : 'View posting'}
            </Button>
          )}

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="More actions"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline-strong bg-surface text-ink transition-colors hover:border-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <MoreHorizontal size={16} strokeWidth={2} />
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute top-11 right-0 z-20 min-w-52 rounded border border-hairline bg-surface p-1.5 shadow-score"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    setConfirmOpen(true);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-sm px-3 py-2.5 text-left text-sm text-ink-secondary transition-colors hover:bg-surface-sunken hover:text-danger"
                >
                  <Trash2 size={16} strokeWidth={1.5} />
                  Delete evaluation
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {confirmOpen && (
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-lg border border-hairline-strong bg-surface px-6 py-4">
          <p className="text-[15px] leading-normal text-ink">
            Delete this evaluation? This can&apos;t be undone.
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              isLoading={isDeleting}
              className="hover:text-danger"
            >
              Delete evaluation
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setConfirmOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {error && <Alert variant="error">{error}</Alert>}

      {postingOpen && (
        <Card className="flex flex-col gap-3">
          <PanelLabel>Job posting</PanelLabel>
          <div
            id="job-posting"
            className="max-h-[420px] overflow-y-auto text-sm leading-relaxed whitespace-pre-line text-ink-secondary"
          >
            {evaluation.jobDescription}
          </div>
        </Card>
      )}

      {/* Score + summary */}
      <div className="flex flex-wrap gap-4">
        <Card className="flex flex-[1_1_420px] flex-wrap items-center gap-7">
          <div className="shrink-0">
            <ScoreRing score={analysis.overallScore} size={132} stroke={9} />
          </div>
          {visibleSubscores.length > 0 && (
            <div className="flex min-w-0 flex-[1_1_220px] flex-col gap-3.5">
              {visibleSubscores.map(({ key, label }) => (
                <SubScoreBar key={key} label={label} value={analysis.subscores[key]} />
              ))}
            </div>
          )}
        </Card>

        {(summaryParagraphs.length > 0 || matchCounts.length > 0) && (
          <Card className="flex flex-[1_1_320px] flex-col gap-3">
            <PanelLabel>Summary</PanelLabel>
            {summaryParagraphs.map((paragraph, index) => (
              <p key={index} className="text-[15px] leading-[1.6] text-pretty text-ink-secondary">
                {paragraph}
              </p>
            ))}
            {matchCounts.length > 0 && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 font-mono text-xs">
                {matchCounts.map(({ match, label, count }) => (
                  <span key={match} className={TONE_TEXT[MATCH_TONES[match]]}>
                    {count} {label}
                  </span>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>

      {requirementRows.length > 0 && (
        <Card padding="none" className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-track px-6 py-4">
            <h2 className="font-display text-xl tracking-[-0.02em] text-ink">Requirements</h2>
            <div className="flex gap-1.5">
              <FilterPill pressed={!gapsOnly} onClick={() => setGapsOnly(false)}>
                All {requirementRows.length}
              </FilterPill>
              <FilterPill pressed={gapsOnly} onClick={() => setGapsOnly(true)}>
                Gaps only
              </FilterPill>
            </div>
          </div>

          <div className="hidden grid-cols-[84px_minmax(0,1fr)_minmax(0,1.2fr)] gap-5 bg-surface-subtle px-6 py-2.5 font-mono text-[11px] tracking-[0.03em] text-ink-muted uppercase sm:grid">
            <span>Status</span>
            <span>From the posting</span>
            <span>Assessment</span>
          </div>

          {shownRows.length === 0 ? (
            <p className="border-t border-track px-6 py-8 text-center text-sm text-ink-secondary">
              No gaps. Every requirement has direct evidence in your résumé.
            </p>
          ) : (
            shownRows.map(({ requirement, assessment, match }) => (
              <div
                key={requirement.id}
                className="grid items-start gap-2 border-t border-track px-6 py-3.5 text-sm sm:grid-cols-[84px_minmax(0,1fr)_minmax(0,1.2fr)] sm:gap-5"
              >
                <Badge tone={MATCH_TONES[match]} className="w-[84px] justify-center">
                  {MATCH_LABELS[match]}
                </Badge>
                <span className="leading-relaxed font-medium text-ink">
                  {requirement.text}
                  {requirement.importance === 'required' && (
                    <span className="ml-2 font-mono text-[11px] font-normal text-ink-muted">
                      required
                    </span>
                  )}
                </span>
                <span className="leading-relaxed text-ink-secondary">
                  {assessment?.reasoning ?? 'Not assessed.'}
                </span>
              </div>
            ))
          )}
        </Card>
      )}

      {hasInsights ? (
        <div className="flex flex-wrap gap-4">
          {analysis.keyInsights?.length ? (
            <InsightPanel label="Key insights" items={analysis.keyInsights} tone="accent" wide />
          ) : null}
          <InsightPanel label="What's working" items={analysis.strengths} tone="accent" />
          <InsightPanel label="What to fix" items={analysis.weaknesses} tone="warn" />
        </div>
      ) : null}

      {analysis.missingSkills?.length ? (
        <Card className="flex flex-col gap-3">
          <PanelLabel>Missing skills</PanelLabel>
          <div className="flex flex-wrap gap-2">
            {analysis.missingSkills.map((skill, index) => (
              <Badge key={index} tone="danger">
                {skill}
              </Badge>
            ))}
          </div>
        </Card>
      ) : null}

      {analysis.recommendations?.length ? (
        <section className="flex flex-col gap-4 rounded-lg bg-ink p-6 text-page">
          <h2 className="font-mono text-[11px] font-normal tracking-[0.04em] text-accent-soft uppercase">
            Suggested fixes
          </h2>
          <div className="flex flex-wrap gap-3">
            {analysis.recommendations.map((recommendation, index) => (
              <p
                key={index}
                className="flex-[1_1_260px] rounded border border-white/10 p-4 text-sm leading-relaxed text-page/85"
              >
                {recommendation}
              </p>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

/** Placeholder matching the loaded layout, for route loading states. */
export function EvaluationDetailSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-5" aria-hidden="true">
      <div className="flex flex-col gap-3">
        <div className="h-9 w-96 max-w-full rounded bg-surface-sunken" />
        <div className="h-4 w-64 max-w-full rounded bg-surface-sunken" />
      </div>
      <div className="flex flex-wrap gap-4">
        <div className="h-[182px] flex-[1_1_420px] rounded-lg bg-surface-sunken" />
        <div className="h-[182px] flex-[1_1_320px] rounded-lg bg-surface-sunken" />
      </div>
      <div className="h-96 rounded-lg bg-surface-sunken" />
    </div>
  );
}

/** Small monospace eyebrow heading at the top of a panel. */
function PanelLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-mono text-[11px] font-normal tracking-[0.04em] text-ink-muted uppercase">
      {children}
    </h2>
  );
}

function FilterPill({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        'h-8 rounded-full border px-3 text-[13px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        pressed
          ? 'border-ink bg-ink text-white'
          : 'border-hairline bg-surface text-ink-secondary hover:text-ink'
      )}
    >
      {children}
    </button>
  );
}

function InsightPanel({
  label,
  items,
  tone,
  wide = false,
}: {
  label: string;
  items?: string[];
  tone: InsightTone;
  /** Take a full row rather than sharing one with a sibling panel. */
  wide?: boolean;
}) {
  if (!items?.length) return null;

  return (
    <Card className={cn('flex flex-col', wide ? 'basis-full' : 'flex-[1_1_320px]')}>
      <PanelLabel>{label}</PanelLabel>
      <div className="mt-1">
        {items.map((item, index) => (
          <InsightRow key={index} tone={tone} last={index === items.length - 1}>
            {item}
          </InsightRow>
        ))}
      </div>
    </Card>
  );
}
