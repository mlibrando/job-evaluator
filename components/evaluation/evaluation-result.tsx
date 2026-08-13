'use client';

import { useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
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
} from '@/components/ui';
import type {
  Evaluation,
  RequirementCategory,
  SubscoreBreakdown,
} from '@/types/evaluation';
import { getPresentCategories } from '@/lib/ai/scoring';

const SUBSCORE_LABELS: {
  key: keyof SubscoreBreakdown;
  category: RequirementCategory;
  label: string;
}[] = [
  { key: 'skillMatch', category: 'skill', label: 'Skill match' },
  { key: 'experienceMatch', category: 'experience', label: 'Experience' },
  { key: 'domainFit', category: 'domain', label: 'Domain fit' },
];

interface EvaluationResultProps {
  evaluation: Evaluation;
}

export function EvaluationResult({ evaluation }: EvaluationResultProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
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
    } catch (err) {
      console.error('Delete error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setIsDeleting(false);
      setConfirmOpen(false);
    }
  };

  // Only show subscores for categories the posting actually produced
  // requirements for — an unassessed category is excluded from overallScore, so
  // rendering its 0 would read as "scored badly" rather than "never assessed".
  const assessedCategories = getPresentCategories(analysis.requirements ?? []);
  const visibleSubscores = SUBSCORE_LABELS.filter(({ category }) =>
    assessedCategories.includes(category)
  );

  const summaryParagraphs = (analysis.summary ?? '')
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const hasKeyInsights =
    analysis.keyInsights?.length ||
    analysis.strengths?.length ||
    analysis.weaknesses?.length;

  return (
    <div>
      {/* Title, badge, actions */}
      <div className="mb-10 flex flex-wrap items-start justify-between gap-8">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-4">
            <h1 className="font-display text-[40px] leading-[1.15] text-ink">
              {evaluation.jobTitle}
            </h1>
            <Badge tone={getScoreTone(analysis.overallScore)}>
              {getScoreLabel(analysis.overallScore)}
            </Badge>
          </div>
          <p className="mt-2.5 text-[15px] leading-normal">
            {evaluation.companyName && (
              <span className="text-ink">{evaluation.companyName}</span>
            )}
            <span className="text-ink-muted">
              {evaluation.companyName ? ' · ' : ''}
              Evaluated {formatDate(evaluation.createdAt)}
            </span>
          </p>
        </div>

        <div className="ml-auto flex items-center gap-2 pt-1.5">
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="More actions"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="flex h-11 w-11 items-center justify-center rounded-sm border border-transparent text-ink-secondary transition-colors hover:border-hairline-strong hover:text-ink"
            >
              <MoreHorizontal size={20} strokeWidth={1.5} />
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute top-12 right-0 z-20 min-w-52 rounded border border-hairline bg-surface p-1.5 shadow-score"
              >
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setConfirmOpen(true);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-sm px-3 py-2.5 text-left text-[15px] text-ink-secondary transition-colors hover:bg-surface-sunken hover:text-danger"
                >
                  <Trash2 size={16} strokeWidth={1.5} />
                  Delete evaluation
                </button>
              </div>
            )}
          </div>

          <Link href="/evaluate">
            <Button variant="primary">New evaluation</Button>
          </Link>
        </div>
      </div>

      {confirmOpen && (
        <div className="mb-8 flex flex-wrap items-center justify-between gap-6 rounded border border-hairline-strong bg-surface px-6 py-4.5">
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

      {error && (
        <div className="mb-8">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      {/* Score */}
      <div className="mb-16">
        <Card emphasis>
          <div className="flex flex-wrap items-center gap-12">
            <div className="flex shrink-0 flex-col items-center">
              <ScoreRing score={analysis.overallScore} />
            </div>

            {visibleSubscores.length > 0 && (
              <div className="flex min-w-0 max-w-[440px] flex-1 basis-[300px] flex-col gap-5.5">
                {visibleSubscores.map(({ key, label }) => (
                  <SubScoreBar key={key} label={label} value={analysis.subscores[key]} />
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {summaryParagraphs.length > 0 && (
        <Section label="Summary" className="mb-12">
          <div className="flex max-w-[68ch] flex-col gap-5">
            {summaryParagraphs.map((paragraph, index) => (
              <p
                key={index}
                className="text-[17px] leading-[1.7] text-pretty text-ink-secondary"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </Section>
      )}

      {hasKeyInsights ? (
        <Section label="Key insights" className="mb-12">
          <InsightList items={analysis.keyInsights} tone="accent" />
          <SubGroup label="What's working" items={analysis.strengths} tone="accent" />
          <SubGroup label="What to fix" items={analysis.weaknesses} tone="warn" />
        </Section>
      ) : null}

      {analysis.requirements?.length ? (
        <Section label="Requirements" className="mb-12">
          <div className="max-w-[78ch] border-t border-hairline">
            {analysis.requirements.map((requirement, index) => {
              const assessment = analysis.assessments?.find(
                (a) => a.requirementId === requirement.id
              );
              const match = assessment?.match ?? 'none';
              const tone = MATCH_TONES[match];
              const last = index === analysis.requirements.length - 1;

              return (
                <div
                  key={requirement.id}
                  className={`py-4 ${last ? '' : 'border-b border-hairline'}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-base leading-relaxed text-ink">
                      {requirement.text}
                      {requirement.importance === 'required' && (
                        <span className="ml-2 text-[13px] text-ink-muted">required</span>
                      )}
                    </span>
                    <Badge tone={tone === 'neutral' ? 'neutral' : tone} className="shrink-0">
                      {MATCH_LABELS[match]}
                    </Badge>
                  </div>
                  {assessment?.reasoning && (
                    <p className="mt-1.5 text-[15px] leading-relaxed text-ink-secondary">
                      {assessment.reasoning}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </Section>
      ) : null}

      {analysis.missingSkills?.length ? (
        <Section label="Missing skills" className="mb-12">
          <InsightList items={analysis.missingSkills} tone="warn" />
        </Section>
      ) : null}

      {analysis.recommendations?.length ? (
        <Section label="Recommendations" className="mb-12">
          <InsightList items={analysis.recommendations} tone="accent" />
        </Section>
      ) : null}

      <div className="mt-24 flex flex-wrap items-center justify-center gap-3 border-t border-hairline pt-10">
        <Link href="/history">
          <Button variant="secondary">View all evaluations</Button>
        </Link>
        <Link href="/evaluate">
          <Button variant="secondary">Evaluate another job</Button>
        </Link>
      </div>
    </div>
  );
}

/** Uppercase section label above a block of content. */
function Section({
  label,
  className = '',
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={className}>
      <h2 className="mb-4 font-body text-[13px] leading-tight font-medium tracking-[0.1em] uppercase text-ink-muted">
        {label}
      </h2>
      {children}
    </section>
  );
}

/** Secondary label used inside a Section (e.g. "What's working"). */
function SubGroup({
  label,
  items,
  tone,
}: {
  label: string;
  items?: string[];
  tone: InsightTone;
}) {
  if (!items?.length) return null;

  return (
    <div className="mt-8">
      <h3 className="mb-1 font-body text-[13px] leading-tight font-medium tracking-[0.1em] uppercase text-ink-muted">
        {label}
      </h3>
      <InsightList items={items} tone={tone} />
    </div>
  );
}

function InsightList({ items, tone }: { items?: string[]; tone: InsightTone }) {
  if (!items?.length) return null;

  return (
    <div className="max-w-[78ch] border-t border-hairline">
      {items.map((item, index) => (
        <InsightRow key={index} tone={tone} last={index === items.length - 1}>
          {item}
        </InsightRow>
      ))}
    </div>
  );
}
