import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { EvaluationForm } from '@/components/evaluation/evaluation-form';
import { getUserEvaluations } from '@/lib/aws/dynamodb';
import { getRateLimitStatus } from '@/lib/rate-limit';

export default async function EvaluatePage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const [latest, rateLimit] = await Promise.all([
    getUserEvaluations(session.user.id, 1)
      .then((result) => result.evaluations?.[0] ?? null)
      .catch((error) => {
        console.error('Failed to fetch last resume:', error);
        return null;
      }),
    getRateLimitStatus(session.user.id).catch((error) => {
      console.error('Failed to fetch rate limit status:', error);
      return null;
    }),
  ]);

  const resumeOnFile = latest?.resumeKey
    ? { key: latest.resumeKey, updatedAt: latest.createdAt }
    : null;

  return <EvaluationForm rateLimit={rateLimit} resumeOnFile={resumeOnFile} />;
}
