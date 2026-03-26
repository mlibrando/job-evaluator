import type { ApiError } from '@/types/api';

export class RateLimitError extends Error {
  limit: number;
  remaining: number;
  reset: number;

  constructor(limit: number, remaining: number, reset: number) {
    super('Rate limit exceeded');
    this.name = 'RateLimitError';
    this.limit = limit;
    this.remaining = remaining;
    this.reset = reset;
  }

  toApiError(): ApiError {
    return {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again later.',
      details: {
        limit: this.limit,
        remaining: this.remaining,
        reset: this.reset,
        resetDate: new Date(this.reset).toISOString(),
      },
    };
  }

  getRetryAfter(): number {
    return Math.ceil((this.reset - Date.now()) / 1000);
  }
}
