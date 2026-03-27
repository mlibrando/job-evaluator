import { Card, CardContent, Spinner } from '@/components/ui';

export default function HistoryLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="h-9 w-64 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mb-2" />
        <div className="h-6 w-96 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
      </div>

      <Card>
        <CardContent className="py-16">
          <div className="flex flex-col items-center justify-center gap-4">
            <Spinner size="lg" />
            <p className="text-zinc-600 dark:text-zinc-400">Loading evaluations...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
