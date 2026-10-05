import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { auth } from '@/lib/auth';
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
    <>
      {/* The history sidebar is hidden on mobile while viewing a detail. */}
      <Link
        href="/history"
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-ink-secondary hover:text-ink lg:hidden"
      >
        <ArrowLeft size={16} strokeWidth={1.75} aria-hidden="true" />
        All evaluations
      </Link>
      <EvaluationResult evaluation={evaluation} />
    </>
  );
}
