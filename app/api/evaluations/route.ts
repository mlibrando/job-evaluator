import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserEvaluations } from '@/lib/aws/dynamodb';

/**
 * GET /api/evaluations
 * Get all evaluations for the authenticated user
 */
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const lastKey = searchParams.get('lastKey');

    // Parse lastKey if provided
    let lastEvaluatedKey: Record<string, any> | undefined;
    if (lastKey) {
      try {
        lastEvaluatedKey = JSON.parse(decodeURIComponent(lastKey));
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_REQUEST',
              message: 'Invalid lastKey parameter',
            },
          },
          { status: 400 }
        );
      }
    }

    const result = await getUserEvaluations(
      session.user.id,
      limit,
      lastEvaluatedKey
    );

    return NextResponse.json({
      success: true,
      data: {
        evaluations: result.evaluations,
        nextKey: result.lastKey ? encodeURIComponent(JSON.stringify(result.lastKey)) : null,
        hasMore: !!result.lastKey,
      },
    });
  } catch (error) {
    console.error('Failed to get evaluations:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_FAILED',
          message: 'Failed to retrieve evaluations',
          details: error instanceof Error ? { message: error.message } : undefined,
        },
      },
      { status: 500 }
    );
  }
}
