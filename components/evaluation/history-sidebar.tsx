'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import { getScoreTone, type ScoreTone } from '@/components/ui';
import { cn } from '@/lib/utils/cn';

export interface HistoryItem {
  evaluationId: string;
  jobTitle: string;
  companyName?: string;
  createdAt: string;
  /** Pre-formatted on the server, e.g. "Oct 2". */
  dateLabel: string;
  overallScore: number;
}

type SortBy = 'date' | 'score' | 'lowest';

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'date', label: 'Recent' },
  { value: 'score', label: 'Highest' },
  { value: 'lowest', label: 'Lowest' },
];

const SCORE_TEXT: Record<ScoreTone, string> = {
  strong: 'text-ink',
  warn: 'text-warn',
  danger: 'text-danger',
};

interface HistorySidebarProps {
  evaluations: HistoryItem[];
}
export function HistorySidebar({ evaluations }: HistorySidebarProps) {
  const pathname = usePathname();
  const listRef = useRef<HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('date');

  const detailMatch = pathname.match(/^\/evaluations\/([^/]+)/);
  const activeId = detailMatch
    ? decodeURIComponent(detailMatch[1])
    : evaluations[0]?.evaluationId;

  const visible = useMemo(() => {
    const searchLower = searchQuery.trim().toLowerCase();

    const filtered = evaluations.filter(
      (evaluation) =>
        !searchLower ||
        evaluation.jobTitle.toLowerCase().includes(searchLower) ||
        evaluation.companyName?.toLowerCase().includes(searchLower)
    );

    return filtered.sort((a, b) => {
      if (sortBy === 'score') return b.overallScore - a.overallScore;
      if (sortBy === 'lowest') return a.overallScore - b.overallScore;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [evaluations, searchQuery, sortBy]);

  useEffect(() => {
    const list = listRef.current;
    const row = list?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!list || !row) return;

    const above = row.offsetTop < list.scrollTop;
    const below = row.offsetTop + row.offsetHeight > list.scrollTop + list.clientHeight;
    if (above || below) {
      list.scrollTop = row.offsetTop - list.clientHeight / 3;
    }
  }, [activeId]);

  return (
    <aside
      className={cn(
        'w-full shrink-0 flex-col gap-3 px-4 pt-6 pb-4 sm:px-7 lg:sticky lg:top-0 lg:max-h-screen lg:w-80 lg:pr-4 lg:pb-6',
        detailMatch ? 'hidden lg:flex' : 'flex'
      )}
    >
      <div className="flex items-center justify-between gap-3 px-2">
        <h2 className="font-mono text-[11px] font-normal tracking-[0.04em] text-ink-muted uppercase">
          History · {evaluations.length}
        </h2>
        <label className="flex items-center gap-1 font-mono text-[11px] text-ink-muted">
          Sort:
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="cursor-pointer rounded-sm bg-transparent py-1 text-ink-secondary hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {SORT_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="relative">
        <Search
          size={16}
          strokeWidth={1.75}
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-muted"
        />
        <input
          type="search"
          aria-label="Search by job title or company"
          placeholder="Search title or company"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-10 w-full rounded-full border border-hairline bg-surface pr-4 pl-10 text-sm text-ink transition-colors placeholder:text-ink-muted focus:border-hairline-strong focus:outline-none"
        />
      </div>

      <nav
        ref={listRef}
        aria-label="Evaluation history"
        className="relative -mx-1 flex flex-col gap-1 overflow-y-auto px-1 pb-1 lg:min-h-0 lg:flex-1"
      >
        {visible.length === 0 ? (
          <p className="px-2 py-8 text-center text-sm text-ink-secondary">
            No evaluations match that search.
          </p>
        ) : (
          visible.map((evaluation) => {
            const active = evaluation.evaluationId === activeId;
            return (
              <Link
                key={evaluation.evaluationId}
                href={`/evaluations/${evaluation.evaluationId}`}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 rounded border p-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                  active ? 'border-accent bg-surface' : 'border-transparent hover:bg-surface/70'
                )}
              >
                <span
                  className={cn(
                    'w-10 shrink-0 font-display text-xl font-extrabold tracking-[-0.03em]',
                    SCORE_TEXT[getScoreTone(evaluation.overallScore)]
                  )}
                >
                  {evaluation.overallScore}
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="line-clamp-2 text-sm leading-snug font-medium text-ink">
                    {evaluation.jobTitle}
                  </span>
                  <span className="truncate text-xs text-ink-secondary">
                    {evaluation.companyName && `${evaluation.companyName} · `}
                    {evaluation.dateLabel}
                  </span>
                </span>
              </Link>
            );
          })
        )}
      </nav>
    </aside>
  );
}

export function HistorySidebarSkeleton() {
  return (
    <div className="hidden w-80 shrink-0 flex-col gap-3 pt-6 pr-4 pl-7 lg:flex" aria-hidden="true">
      <div className="mx-2 h-4 w-24 animate-pulse rounded bg-surface-sunken" />
      <div className="h-10 animate-pulse rounded-full bg-surface-sunken" />
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="flex animate-pulse items-center gap-3 p-3">
          <div className="h-6 w-8 rounded bg-surface-sunken" />
          <div className="flex flex-1 flex-col gap-1.5">
            <div className="h-3.5 w-4/5 rounded bg-surface-sunken" />
            <div className="h-3 w-1/2 rounded bg-surface-sunken" />
          </div>
        </div>
      ))}
    </div>
  );
}
