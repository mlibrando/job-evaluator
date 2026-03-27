import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getEvaluation, deleteEvaluation } from '@/lib/aws/dynamodb';

/**
 * GET /api/evaluations/[id]
 * Get a single evaluation by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Evaluation ID is required',
          },
        },
        { status: 400 }
      );
    }

    const evaluation = await getEvaluation(id);

    if (!evaluation) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Evaluation not found',
          },
        },
        { status: 404 }
      );
    }

    // Security: Verify the evaluation belongs to the user
    if (evaluation.userId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to access this evaluation',
          },
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: evaluation,
    });
  } catch (error) {
    console.error('Failed to get evaluation:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_FAILED',
          message: 'Failed to retrieve evaluation',
          details: error instanceof Error ? { message: error.message } : undefined,
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/evaluations/[id]
 * Delete an evaluation
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Evaluation ID is required',
          },
        },
        { status: 400 }
      );
    }

    // Get evaluation first to verify ownership
    const evaluation = await getEvaluation(id);

    if (!evaluation) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Evaluation not found',
          },
        },
        { status: 404 }
      );
    }

    // Security: Verify the evaluation belongs to the user
    if (evaluation.userId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to delete this evaluation',
          },
        },
        { status: 403 }
      );
    }

    await deleteEvaluation(id);

    return NextResponse.json({
      success: true,
      data: {
        message: 'Evaluation deleted successfully',
      },
    });
  } catch (error) {
    console.error('Failed to delete evaluation:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DELETE_FAILED',
          message: 'Failed to delete evaluation',
          details: error instanceof Error ? { message: error.message } : undefined,
        },
      },
      { status: 500 }
    );
  }
}
