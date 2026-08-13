import { Spinner } from '@/components/ui';

export default function HistoryLoading() {
  return (
    <div className="mx-auto max-w-[1120px] px-8 pt-16 pb-28">
      <div className="animate-pulse">
        <div className="h-11 w-80 max-w-full rounded bg-surface-sunken" />
        <div className="mt-3 h-5 w-[28rem] max-w-full rounded bg-surface-sunken" />
      </div>

      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <Spinner size="lg" />
        <p className="text-ink-secondary">Loading evaluations...</p>
      </div>
    </div>
  );
}
