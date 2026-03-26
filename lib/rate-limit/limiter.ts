import { getRateLimit, updateRateLimit } from '@/lib/aws/dynamodb';

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

/**
 * Check if a user has exceeded their rate limit
 */
export async function checkRateLimit(
  userId: string,
  config?: RateLimitConfig
): Promise<RateLimitResult> {
  const maxRequests = config?.maxRequests ?? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10');
  const windowMs = config?.windowMs ?? parseInt(process.env.RATE_LIMIT_WINDOW_MS || '3600000');

  const now = Date.now();
  const windowStart = now - windowMs;

  // Get current rate limit data
  const rateLimit = await getRateLimit(userId);

  // If no record exists or window has expired, create new window
  if (!rateLimit || rateLimit.windowStart < windowStart) {
    await updateRateLimit(userId, now, 1);

    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      reset: now + windowMs,
    };
  }

  // Check if limit exceeded
  if (rateLimit.requestCount >= maxRequests) {
    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      reset: rateLimit.windowStart + windowMs,
    };
  }

  // Increment request count
  await updateRateLimit(userId, rateLimit.windowStart, rateLimit.requestCount + 1);

  return {
    success: true,
    limit: maxRequests,
    remaining: maxRequests - (rateLimit.requestCount + 1),
    reset: rateLimit.windowStart + windowMs,
  };
}

/**
 * Get current rate limit status without incrementing
 */
export async function getRateLimitStatus(
  userId: string,
  config?: RateLimitConfig
): Promise<RateLimitResult> {
  const maxRequests = config?.maxRequests ?? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10');
  const windowMs = config?.windowMs ?? parseInt(process.env.RATE_LIMIT_WINDOW_MS || '3600000');

  const now = Date.now();
  const windowStart = now - windowMs;

  const rateLimit = await getRateLimit(userId);

  // If no record exists or window has expired
  if (!rateLimit || rateLimit.windowStart < windowStart) {
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests,
      reset: now + windowMs,
    };
  }

  return {
    success: rateLimit.requestCount < maxRequests,
    limit: maxRequests,
    remaining: Math.max(0, maxRequests - rateLimit.requestCount),
    reset: rateLimit.windowStart + windowMs,
  };
}
