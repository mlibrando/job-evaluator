import { z } from 'zod';

/**
 * Evaluation Request Validation
 */
export const evaluateRequestSchema = z.object({
  jobTitle: z
    .string()
    .min(1, 'Job title is required')
    .max(200, 'Job title must be less than 200 characters')
    .trim(),
  jobDescription: z
    .string()
    .min(50, 'Job description must be at least 50 characters')
    .max(3000, 'Job description must be less than 3,000 characters')
    .trim(),
  companyName: z
    .string()
    .max(100, 'Company name must be less than 100 characters')
    .trim()
    .optional()
    .or(z.literal('')),
  resumeKey: z
    .string()
    .min(1, 'Resume key is required')
    .regex(/^resumes\/[a-f0-9-]+\/\d+-/, 'Invalid resume key format'),
  // Optional. When supplied, a repeated request with the same key returns the
  // stored evaluation instead of re-running the analysis.
  idempotencyKey: z
    .string()
    .min(8, 'Idempotency key must be at least 8 characters')
    .max(128, 'Idempotency key must be less than 128 characters')
    .regex(
      /^[A-Za-z0-9_-]+$/,
      'Idempotency key may only contain letters, numbers, hyphens, and underscores'
    )
    .optional(),
});

export type EvaluateRequest = z.infer<typeof evaluateRequestSchema>;

/**
 * Resume File Validation
 */
export const resumeFileSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  size: z
    .number()
    .min(1, 'File must not be empty')
    .max(5 * 1024 * 1024, 'File size must be less than 5MB'),
  type: z.literal('application/pdf', { message: 'File must be a PDF' }),
});

/**
 * Evaluation Query Parameters
 */
export const evaluationQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .pipe(z.number().min(1).max(100)),
  cursor: z.string().optional(),
});

/**
 * User Input Validation
 */
export const userInputSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters').optional(),
});

/**
 * Search Query Validation
 */
export const searchQuerySchema = z.object({
  query: z
    .string()
    .max(200, 'Search query must be less than 200 characters')
    .trim()
    .optional(),
  sortBy: z.enum(['date', 'score']).optional().default('date'),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;
