'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight, Search } from 'lucide-react';
import { Badge, Button, Input, getScoreTone } from '@/components/ui';
import type { Evaluation } from '@/types/evaluation';

type SortBy = 'date' | 'score' | 'lowest';

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'date', label: 'Newest first' },
  { value: 'score', label: 'Highest score' },
  { value: 'lowest', label: 'Lowest score' },
];

interface EvaluationListProps {
  evaluations: Evaluation[];
}

export function EvaluationList({ evaluations }: EvaluationListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('date');

  const filteredEvaluations = useMemo(() => {
    const searchLower = searchQuery.trim().toLowerCase();

    const filtered = evaluations.filter(
      (evaluation) =>
        !searchLower ||
        evaluation.jobTitle.toLowerCase().includes(searchLower) ||
        evaluation.companyName?.toLowerCase().includes(searchLower)
    );

    return filtered.sort((a, b) => {
      if (sortBy === 'score') return b.analysis.overallScore - a.analysis.overallScore;
      if (sortBy === 'lowest') return a.analysis.overallScore - b.analysis.overallScore;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [evaluations, searchQuery, sortBy]);

  if (evaluations.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-ink-secondary">
          No evaluations yet. Evaluate job posting to start building your history.
        </p>
        <div className="mt-6">
          <Link href="/evaluate">
            <Button variant="primary">Start your first evaluation</Button>
          </Link>
        </div>
      </div>
    );
  }

  const query = searchQuery.trim();
  const countLabel = query
    ? `${filteredEvaluations.length} ${
        filteredEvaluations.length === 1 ? 'evaluation' : 'evaluations'
      } matching "${query}"`
    : `All ${evaluations.length} evaluations`;

  return (
    <div>
      <div className="mt-10 flex flex-wrap items-center gap-4">
        <div className="relative min-w-60 flex-1 basis-80">
          <Search
            size={18}
            strokeWidth={1.5}
            aria-hidden="true"
            className="pointer-events-none absolute top-3.5 left-3.5 z-10 text-ink-muted"
          />
          <Input
            placeholder="Search by job title or company"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          aria-label="Sort evaluations"
          className="h-11 cursor-pointer rounded-sm border border-hairline bg-surface px-3.5 text-[15px] text-ink focus:outline-none"
        >
          {SORT_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-8 border-b border-hairline pb-3.5 text-[13px] font-medium tracking-[0.1em] uppercase text-ink-muted">
        {countLabel}
      </div>

      {filteredEvaluations.length === 0 ? (
        <p className="py-16 text-center text-ink-secondary">
          No evaluations match that search.
        </p>
      ) : (
        filteredEvaluations.map((evaluation) => (
          <Link
            key={evaluation.evaluationId}
            href={`/evaluations/${evaluation.evaluationId}`}
            className="grid grid-cols-[1fr_auto_auto] items-center gap-7 border-b border-hairline px-1 py-5.5 transition-colors hover:bg-surface-sunken/50"
          >
            <div className="min-w-0">
              <div className="line-clamp-2 text-base leading-snug font-medium text-ink">
                {evaluation.jobTitle}
              </div>
              <div className="mt-1 text-sm text-ink-secondary">
                {evaluation.companyName && `${evaluation.companyName} · `}
                {formatDate(evaluation.createdAt)}
              </div>
              {evaluation.analysis.summary && (
                <div className="mt-2 max-w-[68ch] truncate text-sm leading-normal text-ink-muted">
                  {evaluation.analysis.summary}
                </div>
              )}
            </div>
            <Badge tone={getScoreTone(evaluation.analysis.overallScore)}>
              {evaluation.analysis.overallScore}/100
            </Badge>
            <ChevronRight size={18} strokeWidth={1.5} className="text-ink-muted" />
          </Link>
        ))
      )}
    </div>
  );
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
