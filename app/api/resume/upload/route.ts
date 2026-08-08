import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { uploadFile, generateResumeKey } from '@/lib/aws/s3';
import { resumeFileSchema } from '@/lib/validation';

const PDF_SIGNATURE = [0x25, 0x50, 0x44, 0x46, 0x2d];

function hasPdfSignature(bytes: Uint8Array): boolean {
  if (bytes.length < PDF_SIGNATURE.length) return false;
  return PDF_SIGNATURE.every((byte, index) => bytes[index] === byte);
}

/**
 * POST /api/resume/upload
 * Upload a resume file to S3
 */
export async function POST(request: NextRequest) {
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

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'No file provided',
          },
        },
        { status: 400 }
      );
    }

    // Validate file with Zod
    const validationResult = resumeFileSchema.safeParse({
      name: file.name,
      size: file.size,
      type: file.type,
    });

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid file',
            details: { errors },
          },
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (!hasPdfSignature(buffer)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_FILE_TYPE',
            message:
              'This file is not a valid PDF. Please upload a PDF resume.',
          },
        },
        { status: 400 }
      );
    }

    // Generate S3 key
    const key = generateResumeKey(session.user.id, file.name);

    // Upload to S3
    const uploadResult = await uploadFile({
      file: buffer,
      key,
      contentType: file.type,
      metadata: {
        userId: session.user.id,
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        key: uploadResult.key,
        url: uploadResult.url,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      },
    });
  } catch (error) {
    console.error('Resume upload failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UPLOAD_FAILED',
          message: 'Failed to upload resume',
          details: error instanceof Error ? { message: error.message } : undefined,
        },
      },
      { status: 500 }
    );
  }
}
