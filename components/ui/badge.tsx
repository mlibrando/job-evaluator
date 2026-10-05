import type { ReactNode } from 'react';

export type BadgeTone = 'neutral' | 'strong' | 'warn' | 'danger';

interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-surface-sunken text-ink-secondary',
  strong: 'bg-accent-wash text-accent-hover',
  warn: 'bg-warn-wash text-warn',
  danger: 'bg-danger-wash text-danger',
};

export function Badge({ tone = 'neutral', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
