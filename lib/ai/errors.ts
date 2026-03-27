import type { ApiError } from '@/types/api';

export enum AIErrorCode {
  API_KEY_MISSING = 'AI_API_KEY_MISSING',
  API_REQUEST_FAILED = 'AI_API_REQUEST_FAILED',
  RATE_LIMIT_EXCEEDED = 'AI_RATE_LIMIT_EXCEEDED',
  INVALID_RESPONSE = 'AI_INVALID_RESPONSE',
  PARSING_FAILED = 'AI_PARSING_FAILED',
  CONTEXT_TOO_LONG = 'AI_CONTEXT_TOO_LONG',
  UNKNOWN_ERROR = 'AI_UNKNOWN_ERROR',
}

export class AIError extends Error {
  code: AIErrorCode;
  details?: Record<string, unknown>;
  originalError?: Error;

  constructor(
    code: AIErrorCode,
    message: string,
    details?: Record<string, unknown>,
    originalError?: Error
  ) {
    super(message);
    this.name = 'AIError';
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
 * Handle Anthropic API errors
 */
export function handleAnthropicError(error: any): AIError {
  const errorType = error?.type || error?.error?.type || 'unknown';
  const errorMessage = error?.message || error?.error?.message || 'An unknown error occurred';

  // Rate limit errors
  if (errorType === 'rate_limit_error' || error?.status === 429) {
    return new AIError(
      AIErrorCode.RATE_LIMIT_EXCEEDED,
      'AI API rate limit exceeded. Please try again later.',
      { errorType, status: error?.status },
      error
    );
  }

  // Authentication errors
  if (errorType === 'authentication_error' || error?.status === 401) {
    return new AIError(
      AIErrorCode.API_KEY_MISSING,
      'AI API authentication failed. Please check your API key.',
      { errorType, status: error?.status },
      error
    );
  }

  // Context length errors
  if (errorType === 'invalid_request_error' && errorMessage.includes('maximum context length')) {
    return new AIError(
      AIErrorCode.CONTEXT_TOO_LONG,
      'The job description or resume is too long. Please shorten it and try again.',
      { errorType },
      error
    );
  }

  // Invalid request
  if (errorType === 'invalid_request_error') {
    return new AIError(
      AIErrorCode.API_REQUEST_FAILED,
      `Invalid request to AI API: ${errorMessage}`,
      { errorType },
      error
    );
  }

  // Network or server errors
  if (error?.status >= 500) {
    return new AIError(
      AIErrorCode.API_REQUEST_FAILED,
      'AI service is temporarily unavailable. Please try again later.',
      { errorType, status: error?.status },
      error
    );
  }

  // Default unknown error
  return new AIError(
    AIErrorCode.UNKNOWN_ERROR,
    `AI analysis failed: ${errorMessage}`,
    { errorType },
    error
  );
}

/**
 * Wrap AI operations with error handling
 */
export async function withAIErrorHandling<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    throw handleAnthropicError(error);
  }
}
