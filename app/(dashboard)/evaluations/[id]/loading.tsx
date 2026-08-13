import { Card, Spinner } from '@/components/ui';

export default function EvaluationLoading() {
  return (
    <div className="mx-auto max-w-[1120px] px-8 pt-14 pb-24">
      {/* Mirrors the loaded layout: title block, then the emphasis score card. */}
      <div className="mb-10 animate-pulse">
        <div className="mb-3 h-11 w-80 max-w-full rounded bg-surface-sunken" />
        <div className="h-5 w-56 max-w-full rounded bg-surface-sunken" />
      </div>

      <Card emphasis>
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <Spinner size="lg" />
          <p className="text-ink-secondary">Loading evaluation results...</p>
        </div>
      </Card>
    </div>
  );
}
