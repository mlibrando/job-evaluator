import { Spinner } from '@/components/ui';
import { EvaluationDetailSkeleton } from '@/components/evaluation/evaluation-result';

export default function HistoryLoading() {
  return (
    <>
      {/* Mobile shows the list here, and its skeleton is desktop-only. */}
      <div className="flex justify-center py-16 lg:hidden">
        <Spinner size="lg" />
      </div>
      <div className="hidden lg:block">
        <EvaluationDetailSkeleton />
      </div>
    </>
  );
}
