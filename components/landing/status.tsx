import { cn } from '@/lib/utils/cn';

export type RequirementStatus = 'met' | 'partial' | 'missing';

export const STATUS_LABELS: Record<RequirementStatus, string> = {
  met: 'Met',
  partial: 'Partial',
  missing: 'Missing',
};

export const STATUS_TEXT: Record<RequirementStatus, string> = {
  met: 'text-accent-hover',
  partial: 'text-warn',
  missing: 'text-danger',
};

const STATUS_PILL: Record<RequirementStatus, string> = {
  met: 'bg-accent-wash text-accent-hover',
  partial: 'bg-warn-wash text-warn',
  missing: 'bg-danger-wash text-danger',
};

export function StatusPill({ status }: { status: RequirementStatus }) {
  return (
    <span
      className={cn(
        'w-14 shrink-0 rounded-md py-1 text-center text-[10px] font-semibold sm:w-16 sm:text-[11px]',
        STATUS_PILL[status]
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
