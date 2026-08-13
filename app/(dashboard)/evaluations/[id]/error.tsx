'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button, Card, Alert } from '@/components/ui';

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
    <div className="mx-auto max-w-[1120px] px-8 pt-14 pb-24">
      <div className="mb-10">
        <h1 className="font-display text-[40px] leading-[1.15] text-ink">
          Error loading evaluation
        </h1>
        <p className="mt-2.5 text-[15px] text-ink-muted">
          We encountered a problem loading this evaluation.
        </p>
      </div>

      <div className="mb-8">
        <Alert variant="error">{error.message || 'An unexpected error occurred'}</Alert>
      </div>

      <Card>
        <div className="flex flex-col items-center gap-4 py-8">
          <p className="max-w-[52ch] text-center leading-relaxed text-ink-secondary">
            This evaluation could not be loaded. It may have been deleted, or you may not
            have permission to view it.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Button variant="secondary" onClick={reset}>
              Try again
            </Button>
            <Link href="/history">
              <Button variant="primary">View all evaluations</Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
