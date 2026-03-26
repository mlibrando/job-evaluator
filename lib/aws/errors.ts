import type { ApiError } from '@/types/api';

/**
 * AWS-specific error types
 */
export enum AWSErrorCode {
  // S3 Errors
  S3_UPLOAD_FAILED = 'S3_UPLOAD_FAILED',
  S3_DOWNLOAD_FAILED = 'S3_DOWNLOAD_FAILED',
  S3_DELETE_FAILED = 'S3_DELETE_FAILED',
  S3_FILE_NOT_FOUND = 'S3_FILE_NOT_FOUND',
  S3_ACCESS_DENIED = 'S3_ACCESS_DENIED',

  // DynamoDB Errors
  DYNAMODB_PUT_FAILED = 'DYNAMODB_PUT_FAILED',
  DYNAMODB_GET_FAILED = 'DYNAMODB_GET_FAILED',
  DYNAMODB_UPDATE_FAILED = 'DYNAMODB_UPDATE_FAILED',
  DYNAMODB_DELETE_FAILED = 'DYNAMODB_DELETE_FAILED',
  DYNAMODB_QUERY_FAILED = 'DYNAMODB_QUERY_FAILED',
  ITEM_NOT_FOUND = 'ITEM_NOT_FOUND',

  // General AWS Errors
  AWS_CONFIGURATION_ERROR = 'AWS_CONFIGURATION_ERROR',
  AWS_CREDENTIALS_ERROR = 'AWS_CREDENTIALS_ERROR',
  AWS_NETWORK_ERROR = 'AWS_NETWORK_ERROR',
  AWS_UNKNOWN_ERROR = 'AWS_UNKNOWN_ERROR',
}

export class AWSError extends Error {
  code: AWSErrorCode;
  details?: Record<string, unknown>;
  originalError?: Error;

  constructor(
    code: AWSErrorCode,
    message: string,
    details?: Record<string, unknown>,
    originalError?: Error
  ) {
    super(message);
    this.name = 'AWSError';
    this.code = code;
    this.details = details;
    this.originalError = originalError;
  }

  toApiError(): ApiError {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}

/**
 * Handle AWS SDK errors and convert them to AWSError
 */
export function handleAWSError(error: any, operation: string): AWSError {
  const errorName = error?.name || 'Unknown';
  const errorMessage = error?.message || 'An unknown error occurred';

  // S3 specific errors
  if (errorName === 'NoSuchKey' || errorName === 'NotFound') {
    return new AWSError(
      AWSErrorCode.S3_FILE_NOT_FOUND,
      'The requested file was not found',
      { operation, errorName },
      error
    );
  }

  if (errorName === 'AccessDenied' || errorName === 'Forbidden') {
    return new AWSError(
      AWSErrorCode.S3_ACCESS_DENIED,
      'Access denied to AWS resource',
      { operation, errorName },
      error
    );
  }

  // DynamoDB specific errors
  if (errorName === 'ResourceNotFoundException') {
    return new AWSError(
      AWSErrorCode.ITEM_NOT_FOUND,
      'The requested item was not found',
      { operation, errorName },
      error
    );
  }

  if (errorName === 'ConditionalCheckFailedException') {
    return new AWSError(
      AWSErrorCode.DYNAMODB_UPDATE_FAILED,
      'The conditional check failed',
      { operation, errorName },
      error
    );
  }

  // Credentials errors
  if (
    errorName === 'CredentialsError' ||
    errorName === 'InvalidAccessKeyId' ||
    errorName === 'SignatureDoesNotMatch'
  ) {
    return new AWSError(
      AWSErrorCode.AWS_CREDENTIALS_ERROR,
      'Invalid AWS credentials',
      { operation, errorName },
      error
    );
  }

  // Network errors
  if (
    errorName === 'NetworkingError' ||
    errorName === 'TimeoutError' ||
    errorMessage.includes('ECONNREFUSED') ||
    errorMessage.includes('ETIMEDOUT')
  ) {
    return new AWSError(
      AWSErrorCode.AWS_NETWORK_ERROR,
      'Network error while communicating with AWS',
      { operation, errorName },
      error
    );
  }

  // Default unknown error
  return new AWSError(
    AWSErrorCode.AWS_UNKNOWN_ERROR,
    `AWS operation failed: ${errorMessage}`,
    { operation, errorName },
    error
  );
}

/**
 * Wrap AWS operations with error handling
 */
export async function withAWSErrorHandling<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    throw handleAWSError(error, operation);
  }
}
