'use client';

import { useEffect, useState } from 'react';

interface RateLimitIndicatorProps {
  limit: number;
  remaining: number;
  reset: number;
}

export function RateLimitIndicator({ limit, remaining, reset }: RateLimitIndicatorProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const updateTimeLeft = () => {
      const now = Date.now();
      const seconds = Math.max(0, Math.ceil((reset - now) / 1000));

      if (seconds === 0) {
        setTimeLeft('Reset');
        return;
      }

      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;

      if (minutes > 0) {
        setTimeLeft(`${minutes}m ${remainingSeconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [reset]);

  const percentage = (remaining / limit) * 100;
  const isLow = percentage <= 20;
  const isMedium = percentage > 20 && percentage <= 50;

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          API Usage
        </span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          Resets in {timeLeft}
        </span>
      </div>

      <div className="flex items-center justify-between mb-1">
        <span className={`text-xl font-bold ${
          isLow ? 'text-red-600 dark:text-red-400' :
          isMedium ? 'text-yellow-600 dark:text-yellow-400' :
          'text-green-600 dark:text-green-400'
        }`}>
          {remaining}
        </span>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          / {limit} remaining
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-zinc-200 rounded-full overflow-hidden dark:bg-zinc-700">
        <div
          className={`h-full transition-all duration-300 ${
            isLow ? 'bg-red-500' :
            isMedium ? 'bg-yellow-500' :
            'bg-green-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {isLow && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">
          ⚠️ You're running low on API requests
        </p>
      )}
    </div>
  );
}
