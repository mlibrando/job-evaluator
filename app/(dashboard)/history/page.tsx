import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserEvaluations } from '@/lib/aws/dynamodb';
import { EvaluationList } from '@/components/evaluation/evaluation-list';

// Matches the dashboard's ceiling so the two pages report the same totals.
const EVALUATION_FETCH_LIMIT = 500;

export default async function HistoryPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const { evaluations } = await getUserEvaluations(session.user.id, EVALUATION_FETCH_LIMIT);

  return (
    <div className="mx-auto max-w-[1120px] px-8 pt-16 pb-28">
      <h1 className="font-display text-[44px] leading-[1.1] tracking-[-0.01em] text-ink">
        Evaluation history
      </h1>
      <p className="mt-2.5 max-w-[60ch] text-base leading-relaxed text-ink-secondary">
        Every posting you&apos;ve scored. Search by title or company, or sort to find the
        closest matches.
      </p>

      <EvaluationList evaluations={evaluations} />
    </div>
  );
}
