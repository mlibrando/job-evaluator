import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { getUserEvaluations } from '@/lib/aws/dynamodb';

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  // Check if user has any evaluations
  const { evaluations } = await getUserEvaluations(session.user.id);
  const hasEvaluations = evaluations.length > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
          Welcome back, {session.user?.name || session.user?.email}!
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Evaluate job postings and track your application progress.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Link href="/evaluate" className="block">
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                New Evaluation
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Upload a resume and evaluate a job posting
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/history" className="block">
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                View History
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                See all your past evaluations and results
              </p>
            </CardContent>
          </Card>
        </Link>

        <Card className="h-full">
          <CardContent className="pt-6">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
              Quick Stats
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              Track your evaluation usage
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">This month:</span>
                <span className="font-medium text-zinc-900 dark:text-white">0 evaluations</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">Rate limit:</span>
                <span className="font-medium text-zinc-900 dark:text-white">10/hour</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-semibold text-sm">
                1
              </div>
              <div>
                <h4 className="font-medium text-zinc-900 dark:text-white">
                  Start a New Evaluation
                </h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Click "New Evaluation" to upload your resume and paste a job description.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-semibold text-sm">
                2
              </div>
              <div>
                <h4 className="font-medium text-zinc-900 dark:text-white">
                  Get AI Analysis
                </h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Our AI will analyze your fit for the position and provide detailed insights.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-semibold text-sm">
                3
              </div>
              <div>
                <h4 className="font-medium text-zinc-900 dark:text-white">
                  Review & Apply
                </h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Use the insights to tailor your application and improve your chances.
                </p>
              </div>
            </div>
          </div>
          {!hasEvaluations && (
            <div className="mt-6">
              <Link href="/evaluate">
                <Button variant="primary">
                  Start Your First Evaluation
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
