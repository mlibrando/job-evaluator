import { Card, CardHeader, CardContent, Spinner } from '@/components/ui';

export default function EvaluationLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="animate-pulse">
          <div className="h-9 w-64 bg-zinc-200 dark:bg-zinc-800 rounded mb-2" />
          <div className="h-6 w-40 bg-zinc-200 dark:bg-zinc-800 rounded mb-2" />
          <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded" />
        </div>

        {/* Loading Card */}
        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center gap-4">
              <Spinner size="lg" />
              <p className="text-zinc-600 dark:text-zinc-400">Loading evaluation results...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
