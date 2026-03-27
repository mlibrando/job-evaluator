import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSignedDownloadUrl, fileExists } from '@/lib/aws/s3';

/**
 * GET /api/resume/[key]
 * Get a signed URL for downloading a resume
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
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

    const { key } = await params;

    if (!key) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Resume key is required',
          },
        },
        { status: 400 }
      );
    }

    // Decode the key (in case it's URL encoded)
    const decodedKey = decodeURIComponent(key);

    // Security: Verify the resume belongs to the user
    if (!decodedKey.startsWith(`resumes/${session.user.id}/`)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to access this resume',
          },
        },
        { status: 403 }
      );
    }

    // Check if file exists
    const exists = await fileExists(decodedKey);

    if (!exists) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Resume not found',
          },
        },
        { status: 404 }
      );
    }

    // Generate signed URL (valid for 1 hour)
    const signedUrl = await getSignedDownloadUrl(decodedKey, 3600);

    return NextResponse.json({
      success: true,
      data: {
        url: signedUrl,
        expiresIn: 3600,
      },
    });
  } catch (error) {
    console.error('Resume retrieval failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'RETRIEVAL_FAILED',
          message: 'Failed to retrieve resume',
          details: error instanceof Error ? { message: error.message } : undefined,
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/resume/[key]
 * Delete a resume from S3
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
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

    const { key } = await params;

    if (!key) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Resume key is required',
          },
        },
        { status: 400 }
      );
    }

    const decodedKey = decodeURIComponent(key);

    // Security: Verify the resume belongs to the user
    if (!decodedKey.startsWith(`resumes/${session.user.id}/`)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to delete this resume',
          },
        },
        { status: 403 }
      );
    }

    const { deleteFile } = await import('@/lib/aws/s3');
    await deleteFile(decodedKey);

    return NextResponse.json({
      success: true,
      data: {
        message: 'Resume deleted successfully',
      },
    });
  } catch (error) {
    console.error('Resume deletion failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DELETION_FAILED',
          message: 'Failed to delete resume',
          details: error instanceof Error ? { message: error.message } : undefined,
        },
      },
      { status: 500 }
    );
  }
}
