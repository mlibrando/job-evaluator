'use client';

import { useEffect, useState } from 'react';
import { getScoreColor } from './score-tone';

interface SubScoreBarProps {
  label: string;
  value: number;
}

/** Labelled 0-100 track. Fills from 0 on mount, matching the score ring. */
export function SubScoreBar({ label, value }: SubScoreBarProps) {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(value), 20);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="w-full">
      <div className="mb-1.5 flex justify-between">
        <span className="text-[13px] font-medium uppercase tracking-[0.1em] text-ink-secondary">
          {label}
        </span>
        <span className="text-[13px] font-medium text-ink">{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-[3px] bg-track">
        <div
          className="h-full rounded-[3px]"
          style={{
            width: `${animated}%`,
            background: getScoreColor(value),
            transition: 'width 800ms ease-out, background-color 300ms ease',
          }}
        />
      </div>
    </div>
  );
}
