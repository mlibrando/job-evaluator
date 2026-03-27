'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button, Card, CardContent, Alert } from '@/components/ui';

export default function EvaluationError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Evaluation page error:', error);
  }, [error]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            Error Loading Evaluation
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            We encountered a problem loading this evaluation.
          </p>
        </div>

        <Alert variant="error">
          {error.message || 'An unexpected error occurred'}
        </Alert>

        <Card>
          <CardContent className="py-8">
            <div className="flex flex-col items-center gap-4">
              <div className="text-6xl">⚠️</div>
              <p className="text-center text-zinc-600 dark:text-zinc-400">
                This evaluation could not be loaded. It may have been deleted or you may not have permission to view it.
              </p>
              <div className="flex gap-4 mt-4">
                <Button variant="outline" onClick={reset}>
                  Try Again
                </Button>
                <Link href="/history">
                  <Button variant="primary">
                    View All Evaluations
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
