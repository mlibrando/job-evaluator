import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getRateLimitStatus } from '@/lib/rate-limit';

/**
 * GET /api/rate-limit
 * Get current rate limit status for the authenticated user
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      );
    }

    const rateLimitStatus = await getRateLimitStatus(session.user.id);

    return NextResponse.json({
      success: true,
      data: rateLimitStatus,
    });
  } catch (error) {
    console.error('Failed to get rate limit status:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve rate limit status',
        },
      },
      { status: 500 }
    );
  }
}
