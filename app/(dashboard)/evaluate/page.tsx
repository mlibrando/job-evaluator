'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Textarea, Alert } from '@/components/ui';
import { ResumeUpload } from '@/components/evaluation/resume-upload';

export default function EvaluatePage() {
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
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
          New Evaluation
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Upload your resume and paste the job description to get AI-powered insights.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Resume Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Your Resume</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingResume ? (
              <div className="py-8 text-center text-zinc-600 dark:text-zinc-400">
                Loading...
              </div>
            ) : existingResumeKey && useExistingResume && !resumeFile ? (
              <div className="space-y-4">
                <Alert variant="info">
                  Using your previously uploaded resume. Upload a new file to update it.
                </Alert>
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
              <ResumeUpload
                file={resumeFile}
                onFileSelect={setResumeFile}
                disabled={isSubmitting}
              />
            )}
          </CardContent>
        </Card>

        {/* Job Details */}
        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Job Title"
              placeholder="e.g., Senior Software Engineer"
              value={formData.jobTitle}
              onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
              disabled={isSubmitting}
              required
              helperText={`${formData.jobTitle.length}/200 characters`}
            />

            <Input
              label="Company Name"
              placeholder="e.g., Acme Corp (optional)"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              disabled={isSubmitting}
              helperText={formData.companyName ? `${formData.companyName.length}/100 characters` : undefined}
            />

            <Textarea
              label="Job Description"
              placeholder="Paste the full job description here..."
              value={formData.jobDescription}
              onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
              disabled={isSubmitting}
              rows={12}
              required
              helperText={`${formData.jobDescription.length}/10,000 characters (minimum 50)`}
            />
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert variant="error">
            {error}
          </Alert>
        )}

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
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
            {isSubmitting ? 'Analyzing...' : 'Analyze Job Match'}
          </Button>
        </div>
      </form>
    </div>
  );
}
