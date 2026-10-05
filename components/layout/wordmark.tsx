import { cn } from '@/lib/utils/cn';

interface WordmarkProps {
  withMark?: boolean;
  className?: string;
}

export function Wordmark({ withMark = true, className }: WordmarkProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-[0.4em] font-wordmark leading-none font-extrabold tracking-[-0.03em] text-ink',
        className
      )}
    >
      {withMark && (
        <span
          className="inline-flex size-[1.08em] items-center justify-center rounded-[0.29em] bg-ink"
          aria-hidden="true"
        >
          <span className="size-[0.36em] rounded-full bg-accent" />
        </span>
      )}
      fitly
    </span>
  );
}
