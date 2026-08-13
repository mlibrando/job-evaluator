'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText } from 'lucide-react';
import { Button, Card, Input, Textarea, Alert } from '@/components/ui';
import { ResumeUpload } from '@/components/evaluation/resume-upload';
import type { RateLimitResult } from '@/lib/rate-limit';

interface EvaluationFormProps {
  rateLimit: RateLimitResult | null;
}

export function EvaluationForm({ rateLimit }: EvaluationFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    jobTitle: '',
    companyName: '',
    jobDescription: '',
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [existingResumeKey, setExistingResumeKey] = useState<string | null>(null);
  const [useExistingResume, setUseExistingResume] = useState(false);
  const [isLoadingResume, setIsLoadingResume] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's last resume on mount
  useEffect(() => {
    async function fetchLastResume() {
      try {
        const response = await fetch('/api/evaluations?limit=1');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.evaluations?.length > 0) {
            const lastEvaluation = data.data.evaluations[0];
            if (lastEvaluation.resumeKey) {
              setExistingResumeKey(lastEvaluation.resumeKey);
              setUseExistingResume(true);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch last resume:', err);
      } finally {
        setIsLoadingResume(false);
      }
    }

    fetchLastResume();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.jobTitle.trim()) {
      setError('Job title is required');
      return;
    }
    if (formData.jobTitle.length > 200) {
      setError('Job title must be less than 200 characters');
      return;
    }
    if (!formData.jobDescription.trim()) {
      setError('Job description is required');
      return;
    }
    if (formData.jobDescription.length < 50) {
      setError('Job description must be at least 50 characters');
      return;
    }
    if (formData.jobDescription.length > 3000) {
      setError('Job description must be less than 3,000 characters');
      return;
    }
    if (formData.companyName && formData.companyName.length > 100) {
      setError('Company name must be less than 100 characters');
      return;
    }
    if (!resumeFile && !useExistingResume) {
      setError('Please upload your resume or use your existing resume');
      return;
    }

    setIsSubmitting(true);

    try {
      let resumeKey: string;

      // Step 1: Upload resume if new file provided
      if (resumeFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', resumeFile);

        const uploadResponse = await fetch('/api/resume/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json();
          throw new Error(uploadError.error?.message || uploadError.error || 'Failed to upload resume');
        }

        const uploadResult = await uploadResponse.json();
        resumeKey = uploadResult.data?.key || uploadResult.key;
      } else {
        // Use existing resume
        resumeKey = existingResumeKey!;
      }

      // Step 2: Submit evaluation
      const evaluateResponse = await fetch('/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobTitle: formData.jobTitle,
          companyName: formData.companyName || undefined,
          jobDescription: formData.jobDescription,
          resumeKey,
        }),
      });

      if (!evaluateResponse.ok) {
        const evaluateError = await evaluateResponse.json().catch(() => ({ error: { message: 'Failed to evaluate job posting' } }));
        const errorMessage = evaluateError.error?.message || evaluateError.message || 'Failed to evaluate job posting';
        throw new Error(errorMessage);
      }

      const result = await evaluateResponse.json();
      const evaluationId = result.data?.evaluationId || result.evaluationId;

      // Redirect to results page
      router.push(`/evaluations/${evaluationId}`);
    } catch (err) {
      console.error('Evaluation error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-[800px] px-8 pt-16 pb-28">
      <h1 className="font-display text-[44px] leading-[1.1] tracking-[-0.01em] text-ink">
        New evaluation
      </h1>
      <p className="mt-2.5 max-w-[60ch] text-base leading-relaxed text-ink-secondary">
        Add your résumé and a job posting to see how well they match.
      </p>

      <form onSubmit={handleSubmit}>
        <section className="mt-14">
          <StepLabel>Step 1 — Your résumé</StepLabel>

          {isLoadingResume ? (
            <p className="py-8 text-center text-ink-secondary">Loading…</p>
          ) : existingResumeKey && useExistingResume && !resumeFile ? (
            <div className="mt-5 space-y-3">
              <Card className="px-5 py-4.5">
                <div className="flex items-center gap-3.5">
                  <FileText size={20} strokeWidth={1.5} className="shrink-0 text-ink-secondary" />
                  <div className="min-w-0">
                    <div className="truncate text-[15px] font-medium text-ink">
                      {resumeFileName(existingResumeKey)}
                    </div>
                    <div className="mt-0.5 text-sm text-ink-muted">
                      On file — used unless you replace it below
                    </div>
                  </div>
                </div>
              </Card>
              <ResumeUpload
                file={resumeFile}
                onFileSelect={(file) => {
                  setResumeFile(file);
                  if (file) {
                    setUseExistingResume(false);
                  }
                }}
                disabled={isSubmitting}
              />
            </div>
          ) : (
            <div className="mt-5">
              <ResumeUpload
                file={resumeFile}
                onFileSelect={setResumeFile}
                disabled={isSubmitting}
              />
            </div>
          )}
        </section>

        <section className="mt-14">
          <StepLabel>Step 2 — The job posting</StepLabel>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Input
              label="Job title"
              placeholder="Senior software engineer"
              value={formData.jobTitle}
              onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
              disabled={isSubmitting}
              required
              helperText={`${formData.jobTitle.length}/200 characters`}
            />

            <Input
              label="Company (optional)"
              placeholder="Acme Corp"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              disabled={isSubmitting}
              helperText={formData.companyName ? `${formData.companyName.length}/100 characters` : undefined}
            />
          </div>

          <div className="mt-6">
            <Textarea
              label="Job description"
              placeholder="Paste the full posting — responsibilities, requirements, and qualifications."
              value={formData.jobDescription}
              onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
              disabled={isSubmitting}
              rows={12}
              required
              helperText={
                <span className="flex items-baseline justify-between gap-4">
                  <span>{formData.jobDescription.length}/3,000 characters</span>
                  <span>
                    {formData.jobDescription.length >= 50
                      ? 'Ready to analyze'
                      : 'Minimum 50 characters'}
                  </span>
                </span>
              }
            />
          </div>
        </section>

        {error && (
          <div className="mt-8">
            <Alert variant="error">{error}</Alert>
          </div>
        )}

        <div className="mt-12 flex flex-wrap items-center justify-between gap-6 border-t border-hairline pt-6">
          <span className="text-sm text-ink-muted">
            {rateLimit
              ? `${rateLimit.remaining} / ${rateLimit.limit} evaluations remaining this hour`
              : ''}
          </span>
          <div className="flex items-center gap-5">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push('/dashboard')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              {isSubmitting ? 'Analyzing…' : 'Analyze job match'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

function StepLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b border-hairline pb-3.5 text-[13px] font-medium tracking-[0.1em] uppercase text-ink-muted">
      {children}
    </div>
  );
}

// Keys are `resumes/<userId>/<timestamp>-<original name>`.
function resumeFileName(resumeKey: string): string {
  const segment = resumeKey.split('/').pop() ?? resumeKey;
  return segment.replace(/^\d+-/, '');
}
