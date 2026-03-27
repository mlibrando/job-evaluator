import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserEvaluations } from '@/lib/aws/dynamodb';
import { EvaluationList } from '@/components/evaluation/evaluation-list';

export default async function HistoryPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const { evaluations } = await getUserEvaluations(session.user.id, 50);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
          Evaluation History
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          View and manage all your job evaluations
        </p>
      </div>

      <EvaluationList evaluations={evaluations} />
    </div>
  );
}
