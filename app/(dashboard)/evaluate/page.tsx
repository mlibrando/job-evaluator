import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { EvaluationForm } from '@/components/evaluation/evaluation-form';
import { getRateLimitStatus } from '@/lib/rate-limit';

export default async function EvaluatePage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const rateLimit = await getRateLimitStatus(session.user.id).catch((error) => {
    console.error('Failed to fetch rate limit status:', error);
    return null;
  });

  return <EvaluationForm rateLimit={rateLimit} />;
}
