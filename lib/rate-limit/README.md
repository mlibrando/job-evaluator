# Rate Limiting

This module implements per-user rate limiting using DynamoDB for storage.

## Configuration

Rate limits are configured via environment variables:

- `RATE_LIMIT_MAX_REQUESTS`: Maximum number of requests per window (default: 10)
- `RATE_LIMIT_WINDOW_MS`: Time window in milliseconds (default: 3600000 = 1 hour)

## Usage

### In Middleware

Rate limiting is automatically applied to the following routes via middleware:
- `/api/evaluate`
- `/api/resume`

When rate limit is exceeded, returns 429 with headers:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining (0 when exceeded)
- `X-RateLimit-Reset`: Timestamp when limit resets
- `Retry-After`: Seconds until reset

### In API Routes

```typescript
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const session = await auth();

  const rateLimitResult = await checkRateLimit(session.user.id);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }

  // Process request...
}
```

### Getting Status Without Incrementing

```typescript
import { getRateLimitStatus } from '@/lib/rate-limit';

const status = await getRateLimitStatus(userId);
console.log(`Remaining: ${status.remaining}/${status.limit}`);
```

## UI Components

Use the `RateLimitIndicator` component to show users their current usage:

```tsx
import { RateLimitIndicator } from '@/components/ui/rate-limit-indicator';

<RateLimitIndicator
  limit={10}
  remaining={5}
  reset={Date.now() + 3600000}
/>
```

## DynamoDB Schema

Rate limit data is stored in the `rate-limits` table with TTL enabled for automatic cleanup.
