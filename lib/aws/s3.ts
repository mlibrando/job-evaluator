import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { withAWSErrorHandling } from './errors';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export interface UploadFileParams {
  file: Buffer;
  key: string;
  contentType: string;
  metadata?: Record<string, string>;
}

export interface UploadFileResult {
  key: string;
  bucket: string;
  url: string;
}

/**
 * Upload a file to S3
 */
export async function uploadFile({
  file,
  key,
  contentType,
  metadata,
}: UploadFileParams): Promise<UploadFileResult> {
  return withAWSErrorHandling('S3.uploadFile', async () => {
    const bucket = process.env.S3_BUCKET_NAME!;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file,
      ContentType: contentType,
      Metadata: metadata,
    });

    await s3Client.send(command);

    return {
      key,
      bucket,
      url: `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
    };
  });
}

/**
 * Generate a signed URL for downloading a file from S3
 */
export async function getSignedDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  return withAWSErrorHandling('S3.getSignedDownloadUrl', async () => {
    const bucket = process.env.S3_BUCKET_NAME!;

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    return getSignedUrl(s3Client, command, { expiresIn });
  });
}

/**
 * Delete a file from S3
 */
export async function deleteFile(key: string): Promise<void> {
  return withAWSErrorHandling('S3.deleteFile', async () => {
    const bucket = process.env.S3_BUCKET_NAME!;

    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    await s3Client.send(command);
  });
}

/**
 * Check if a file exists in S3
 */
export async function fileExists(key: string): Promise<boolean> {
  return withAWSErrorHandling('S3.fileExists', async () => {
    const bucket = process.env.S3_BUCKET_NAME!;

    try {
      const command = new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      await s3Client.send(command);
      return true;
    } catch (error) {
      if ((error as any).name === 'NotFound') {
        return false;
      }
      throw error;
    }
  });
}

/**
 * Generate a unique key for a resume file
 */
export function generateResumeKey(userId: string, filename: string): string {
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `resumes/${userId}/${timestamp}-${sanitizedFilename}`;
}
