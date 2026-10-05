import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Button } from '@/components/ui';
import { EvaluationResult } from '@/components/evaluation/evaluation-result';
import { getHistory } from '../history-data';

export default async function HistoryPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const evaluations = await getHistory(session.user.id);

  if (evaluations.length === 0) {
    return (
      <div className="mx-auto flex max-w-[52ch] flex-col items-center py-24 text-center">
        <h1 className="font-display text-[34px] leading-[1.1] font-extrabold tracking-[-0.03em] text-ink">
          No evaluations yet
        </h1>
        <p className="mt-3 leading-relaxed text-ink-secondary">
          Evaluate a job posting to start building your history.
        </p>
        <Link href="/evaluate" className="mt-6">
          <Button variant="primary">Start your first evaluation</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="hidden lg:block">
      <EvaluationResult evaluation={evaluations[0]} />
    </div>
  );
}
