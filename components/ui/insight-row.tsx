import type { ReactNode } from 'react';

export type InsightTone = 'accent' | 'warn' | 'danger' | 'neutral';

interface InsightRowProps {
  children: ReactNode;
  tone?: InsightTone;
  /** Suppress the bottom hairline on the final row of a group. */
  last?: boolean;
}

const DOT_TONES: Record<InsightTone, string> = {
  accent: 'bg-accent',
  warn: 'bg-warn',
  danger: 'bg-danger',
  neutral: 'bg-ink-muted',
};

/** One hairline-separated point: a small coloured dot beside a line of text. */
export function InsightRow({ children, tone = 'accent', last = false }: InsightRowProps) {
  return (
    <div
      className={`flex items-start gap-3 py-4 ${last ? '' : 'border-b border-hairline'}`}
    >
      <span
        className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${DOT_TONES[tone]}`}
        aria-hidden="true"
      />
      <div className="text-base leading-relaxed text-ink-secondary">{children}</div>
    </div>
  );
}
