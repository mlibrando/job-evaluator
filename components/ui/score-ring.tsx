'use client';

import { useEffect, useState } from 'react';
import { getScoreColor } from './score-tone';

interface ScoreRingProps {
  score: number;
  size?: number;
  stroke?: number;
}

/**
 * Circular score dial. Sweeps from empty to `score` on mount by transitioning
 * strokeDashoffset — starting at 0 rather than jumping straight to the value.
 */
export function ScoreRing({ score, size = 160, stroke = 8 }: ScoreRingProps) {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(score), 20);
    return () => clearTimeout(timer);
  }, [score]);

  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animated / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-track)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getScoreColor(score)}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 800ms ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-[56px] leading-none tracking-[-0.02em] text-ink">
          {score}
        </span>
        <span className="mt-1 text-sm text-ink-muted">/100</span>
      </div>
    </div>
  );
}
