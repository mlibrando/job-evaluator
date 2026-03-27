import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getEvaluation } from '@/lib/aws/dynamodb';
import { EvaluationResult } from '@/components/evaluation/evaluation-result';

interface EvaluationPageProps {
  params: Promise<{ id: string }>;
}

export default async function EvaluationPage({ params }: EvaluationPageProps) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const { id } = await params;
  const evaluation = await getEvaluation(id, session.user.id);

  if (!evaluation) {
    redirect('/dashboard');
  }

  // Verify ownership
  if (evaluation.userId !== session.user.id) {
    redirect('/dashboard');
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <EvaluationResult evaluation={evaluation} />
    </div>
  );
}
