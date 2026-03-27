import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { analyzeJobPost } from '@/lib/ai';
import { createEvaluation } from '@/lib/aws/dynamodb';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { evaluateRequestSchema } from '@/lib/validation';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

/**
 * Extract text from resume file in S3
 */
async function extractResumeText(resumeKey: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: resumeKey,
  });

  const response = await s3Client.send(command);
  const bodyContents = await response.Body?.transformToString();

  if (!bodyContents) {
    throw new Error('Failed to read resume file');
  }

  return bodyContents;
}

/**
 * POST /api/evaluate
 * Evaluate a job posting against a resume using AI
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

    const body = await request.json();

    // Validate request body with Zod
    const validationResult = evaluateRequestSchema.safeParse(body);

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
            message: 'Invalid request data',
            details: { errors },
          },
        },
        { status: 400 }
      );
    }

    const { jobTitle, jobDescription, companyName, resumeKey } = validationResult.data;

    // Security: Verify the resume belongs to the user
    if (!resumeKey.startsWith(`resumes/${session.user.id}/`)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to use this resume',
          },
        },
        { status: 403 }
      );
    }

    // Extract text from resume
    const resumeText = await extractResumeText(resumeKey);

    // Analyze with Claude
    const analysis = await analyzeJobPost({
      jobTitle,
      jobDescription,
      companyName,
      resumeText,
    });

    // Generate resume URL
    const resumeUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${resumeKey}`;

    // Save evaluation to DynamoDB
    const evaluation = await createEvaluation({
      evaluationId: crypto.randomUUID(),
      userId: session.user.id,
      jobTitle,
      jobDescription,
      companyName,
      resumeUrl,
      resumeKey,
      analysis: {
        overallScore: analysis.overallScore,
        matchPercentage: analysis.matchPercentage,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        missingSkills: analysis.missingSkills,
        recommendations: analysis.recommendations,
        summary: analysis.summary,
        keyInsights: analysis.keyInsights,
      },
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: {
        evaluationId: evaluation.evaluationId,
        analysis: evaluation.analysis,
        createdAt: evaluation.createdAt,
      },
    });
  } catch (error) {
    console.error('Evaluation failed:', error);

    // Handle AI-specific errors
    if (error && typeof error === 'object' && 'code' in error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: (error as any).code,
            message: (error as any).message,
            details: (error as any).details,
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'EVALUATION_FAILED',
          message: 'Failed to evaluate job posting',
          details: error instanceof Error ? { message: error.message } : undefined,
        },
      },
      { status: 500 }
    );
  }
}
