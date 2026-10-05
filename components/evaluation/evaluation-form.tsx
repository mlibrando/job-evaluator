'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, Clipboard } from 'lucide-react';
import { Button, Input, Textarea, Alert } from '@/components/ui';
import { ResumeUpload, type ResumeOnFile } from '@/components/evaluation/resume-upload';
import { cn } from '@/lib/utils/cn';
import type { RateLimitResult } from '@/lib/rate-limit';

interface EvaluationFormProps {
  rateLimit: RateLimitResult | null;
  resumeOnFile: ResumeOnFile | null;
}

const JOB_TITLE_MAX = 200;
const COMPANY_MAX = 100;
const DESCRIPTION_MIN = 50;
const DESCRIPTION_MAX = 3000;

const EYEBROW = 'font-mono text-[11px] tracking-[0.04em] text-ink-muted uppercase sm:text-xs';
const COUNTER = 'font-mono text-[11px] text-ink-muted';

const REPORT_ITEMS = [
  { title: 'Overall and sub-scores', detail: 'Skills, experience and domain fit.' },
  {
    title: 'Requirement check',
    detail: 'Met, partial or missing, with the line from your résumé.',
  },
  { title: 'Suggested fixes', detail: 'What to add or reword before you apply.' },
];

export function EvaluationForm({ rateLimit, resumeOnFile }: EvaluationFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    jobTitle: '',
    companyName: '',
    jobDescription: '',
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resumeReady = Boolean(resumeFile || resumeOnFile);
  const descriptionLength = formData.jobDescription.length;

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setFormData((current) => ({ ...current, jobDescription: text }));
      }
    } catch (err) {
      console.error('Failed to read clipboard:', err);
      setError('Couldn’t read your clipboard. Paste the posting into the box instead.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.jobTitle.trim()) {
      setError('Job title is required');
      return;
    }
    if (formData.jobTitle.length > JOB_TITLE_MAX) {
      setError('Job title must be less than 200 characters');
      return;
    }
    if (!formData.jobDescription.trim()) {
      setError('Job description is required');
      return;
    }
    if (descriptionLength < DESCRIPTION_MIN) {
      setError('Job description must be at least 50 characters');
      return;
    }
    if (descriptionLength > DESCRIPTION_MAX) {
      setError('Job description must be less than 3,000 characters');
      return;
    }
    if (formData.companyName && formData.companyName.length > COMPANY_MAX) {
      setError('Company name must be less than 100 characters');
      return;
    }
    if (!resumeReady) {
      setError('Please upload your résumé');
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
        resumeKey = resumeOnFile!.key;
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
    <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-5 pt-7 pb-8 sm:gap-9 sm:px-10 sm:pt-12 sm:pb-18">
      <div className="flex flex-col gap-2.5 pb-1.5 sm:pb-0">
        <span className={EYEBROW}>New evaluation</span>
        <h1 className="text-4xl leading-none font-extrabold tracking-[-0.035em] text-ink sm:text-5xl">
          What are you applying for?
        </h1>
        {!resumeOnFile && (
          <p className="text-sm leading-normal text-ink-secondary sm:text-[15px]">
            Add your résumé and paste the job posting.
          </p>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-7"
      >
        <div className="flex min-w-0 flex-col gap-4 sm:gap-5 lg:flex-1">
          <FormSection step="01" title="Résumé" aside={resumeReady && <ReadyPill />}>
            <ResumeUpload
              file={resumeFile}
              onFileSelect={setResumeFile}
              resumeOnFile={resumeOnFile}
              disabled={isSubmitting}
            />
          </FormSection>

          <FormSection step="02" title="Job posting">
            <div className="flex flex-col gap-4 sm:flex-row">
              <Input
                label="Job title"
                labelAside={
                  <span className={COUNTER}>
                    {formData.jobTitle.length} / {JOB_TITLE_MAX}
                  </span>
                }
                placeholder="Senior Software Engineer"
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                disabled={isSubmitting}
                required
              />

              <Input
                label="Company"
                labelAside={
                  formData.companyName ? (
                    <span className={COUNTER}>
                      {formData.companyName.length} / {COMPANY_MAX}
                    </span>
                  ) : (
                    <span className="text-xs text-ink-muted">Optional</span>
                  )
                }
                placeholder="Acme Corp"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                disabled={isSubmitting}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Textarea
                label="Job description"
                labelAside={
                  <PasteButton
                    onClick={handlePaste}
                    disabled={isSubmitting}
                    className="hidden sm:inline-flex"
                  />
                }
                placeholder="Paste the whole listing, including responsibilities, requirements and nice-to-haves. Formatting doesn’t matter."
                value={formData.jobDescription}
                onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                disabled={isSubmitting}
                rows={12}
                className="min-h-60 sm:min-h-75"
                required
              />
              <div className="flex items-center justify-between gap-3">
                <PasteButton onClick={handlePaste} disabled={isSubmitting} className="sm:hidden" />
                <DescriptionMeter length={descriptionLength} />
                <span className={COUNTER}>
                  {descriptionLength.toLocaleString('en-US')} / 3,000 · min {DESCRIPTION_MIN}
                </span>
              </div>
            </div>
          </FormSection>
        </div>

        <aside className="flex flex-col gap-4 lg:w-[380px] lg:shrink-0">
          <div className="flex flex-col gap-3 rounded-lg bg-ink p-4.5 text-page sm:gap-4.5 sm:p-6">
            <span className="font-mono text-[10px] tracking-[0.04em] text-accent-soft sm:text-[11px]">
              YOUR REPORT WILL INCLUDE
            </span>
            <p className="text-[13px] leading-relaxed text-page/85 sm:hidden">
              Overall and sub-scores, a met / partial / missing check for each requirement with
              the line from your résumé, and suggested fixes.
            </p>
            <ol className="hidden flex-col gap-3.5 sm:flex">
              {REPORT_ITEMS.map((item, index) => (
                <li key={item.title} className="flex items-start gap-3">
                  <span className="shrink-0 pt-px font-mono text-xs text-accent-bright">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="flex flex-col gap-[3px]">
                    <span className="text-sm font-semibold">{item.title}</span>
                    <span className="text-[13px] leading-normal text-page/70">{item.detail}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="flex flex-col gap-2.5 pt-1 sm:gap-3.5 sm:rounded-lg sm:border sm:border-hairline sm:bg-surface sm:p-5 sm:pt-5">
            {error && <Alert variant="error">{error}</Alert>}
            <Button type="submit" size="lg" disabled={isSubmitting} isLoading={isSubmitting}>
              {isSubmitting ? (
                'Evaluating'
              ) : (
                <>
                  Evaluate match
                  <ArrowRight
                    size={16}
                    strokeWidth={2}
                    aria-hidden="true"
                    className="hidden sm:block"
                  />
                </>
              )}
            </Button>
            <div className="flex items-center justify-between sm:flex-col sm:items-stretch sm:gap-3.5">
              <Link
                href="/dashboard"
                aria-disabled={isSubmitting}
                className={cn(
                  'rounded-sm px-1 py-2.5 text-sm text-ink-secondary transition-colors hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:self-center sm:px-2.5 sm:py-1.5',
                  isSubmitting && 'pointer-events-none opacity-50',
                )}
              >
                Cancel
              </Link>
              {rateLimit && <ChecksLeft rateLimit={rateLimit} />}
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}

function FormSection({
  step,
  title,
  aside,
  children,
}: {
  step: string;
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-hairline bg-surface p-4.5 sm:gap-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <span
            aria-hidden="true"
            className="inline-flex size-7 items-center justify-center rounded-full bg-ink font-mono text-[11px] text-white sm:size-7.5 sm:text-xs"
          >
            {step}
          </span>
          <h2 className="text-xl tracking-[-0.02em] text-ink sm:text-[22px]">{title}</h2>
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

function ReadyPill() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-wash px-2.5 py-1 text-[11px] font-semibold text-accent-hover sm:py-[5px] sm:text-xs">
      <Check size={12} strokeWidth={3} aria-hidden="true" className="hidden sm:block" />
      Ready
    </span>
  );
}

function PasteButton({
  onClick,
  disabled,
  className,
}: {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex h-10 items-center gap-1.5 rounded-full border border-hairline-strong bg-surface px-3 text-[13px] text-ink transition-colors hover:border-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50 sm:h-8.5',
        className,
      )}
    >
      <Clipboard size={14} strokeWidth={1.8} aria-hidden="true" />
      <span className="sm:hidden">Paste</span>
      <span className="hidden sm:inline">Paste from clipboard</span>
    </button>
  );
}

// Fills toward the 3,000-character limit; turns accent once past the minimum.
function DescriptionMeter({ length }: { length: number }) {
  const percent = Math.min(length / DESCRIPTION_MAX, 1) * 100;

  return (
    <div aria-hidden="true" className="hidden h-1 max-w-[220px] flex-1 overflow-hidden rounded-full bg-track sm:block">
      <div
        className={cn('h-full rounded-full', length >= DESCRIPTION_MIN ? 'bg-accent' : 'bg-ink-muted')}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

function ChecksLeft({ rateLimit }: { rateLimit: RateLimitResult }) {
  return (
    <>
      <span className={cn(COUNTER, 'sm:hidden')}>
        {rateLimit.remaining} / {rateLimit.limit} checks left this hour
      </span>
      <div className="hidden flex-col gap-2 border-t border-track pt-3.5 sm:flex">
        <div className="flex justify-between gap-3 font-mono text-[11px] tracking-[0.03em] text-ink-muted">
          <span>HOURLY CHECKS</span>
          <span className="text-ink">
            {rateLimit.remaining} / {rateLimit.limit} left
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-track">
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${(rateLimit.remaining / rateLimit.limit) * 100}%` }}
          />
        </div>
      </div>
    </>
  );
}
