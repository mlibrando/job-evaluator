import { Suspense } from 'react';
import { auth } from '@/lib/auth';
import { HistorySidebar, HistorySidebarSkeleton } from '@/components/evaluation/history-sidebar';
import type { HistoryItem } from '@/components/evaluation/history-sidebar';
import { getHistory } from './history-data';

export default function EvaluationsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col lg:flex-row lg:items-start">
      <Suspense fallback={<HistorySidebarSkeleton />}>
        <SidebarLoader />
      </Suspense>
      <div className="min-w-0 flex-1 px-4 pt-6 pb-16 sm:px-7 lg:pt-7 lg:pl-4">{children}</div>
    </div>
  );
}

async function SidebarLoader() {
  const session = await auth();
  if (!session) return null;

  const evaluations = await getHistory(session.user.id);
  if (evaluations.length === 0) return null;

  const now = new Date();
  const items: HistoryItem[] = evaluations.map((evaluation) => ({
    evaluationId: evaluation.evaluationId,
    jobTitle: evaluation.jobTitle,
    companyName: evaluation.companyName,
    createdAt: evaluation.createdAt,
    dateLabel: formatShortDate(evaluation.createdAt, now),
    overallScore: evaluation.analysis.overallScore,
  }));

  return <HistorySidebar evaluations={items} />;
}

// "Oct 2" for this year, "Oct 2, 2025" otherwise. Formatted on the server so the
// client component doesn't risk a locale/timezone hydration mismatch.
function formatShortDate(dateString: string, now: Date): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(date.getFullYear() === now.getFullYear() ? {} : { year: 'numeric' }),
  });
}
