import type { ReactNode } from 'react';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button';
import { HeroPreview } from '@/components/landing/hero-preview';
import { SAMPLE_OVERALL, SAMPLE_SUB_SCORES, SAMPLE_WEIGHTED_TOTAL } from '@/components/landing/sample';
import { STATUS_LABELS, STATUS_TEXT, type RequirementStatus } from '@/components/landing/status';
import { LandingHeader } from '@/components/layout/landing-header';
import { Wordmark } from '@/components/layout/wordmark';
import { getScoreTone, type ScoreTone } from '@/components/ui';
import { GITHUB_PROFILE_URL, GITHUB_REPO_URL } from '@/lib/site';
import { cn } from '@/lib/utils/cn';

const WRAP = 'mx-auto w-full max-w-[1200px] px-5 md:px-10';

const SECTION_HEADING =
  'm-0 text-[32px] leading-[1.04] font-extrabold tracking-[-0.03em] md:text-5xl md:leading-[1.02]';

const MATCHES: { requirement: string; evidence: string; status: RequirementStatus }[] = [
  { requirement: 'Owned payment or ledger systems', evidence: 'Led reconciliation service rewrite', status: 'met' },
  { requirement: 'Mentored engineers', evidence: 'Onboarded two juniors, no outcomes listed', status: 'partial' },
  { requirement: 'Go or Rust experience', evidence: 'No mention', status: 'missing' },
];

const HISTORY = [
  { score: 87, title: 'Senior Backend Engineer', company: 'Northwind Labs', date: 'Oct 2' },
  { score: 74, title: 'Full-Stack Engineer, Payments', company: 'Harbor Pay', date: 'Sep 28' },
  { score: 52, title: 'Staff Platform Engineer', company: 'Cloudline', date: 'Sep 21' },
];

const HISTORY_SCORE_TEXT: Record<ScoreTone, string> = {
  strong: 'text-ink',
  warn: 'text-warn',
  danger: 'text-danger',
};

const STEPS = [
  {
    title: 'Upload your résumé',
    description: "Upload a PDF once. It's stored privately and reused for later evaluations.",
  },
  {
    title: 'Paste the job posting',
    description: "Copy the full listing text from wherever you found it. Formatting doesn't matter.",
  },
  {
    title: 'Read the report',
    description: 'Each requirement gets a status, and the report suggests what to add or reword on your résumé.',
  },
];

const PIPELINE = [
  {
    label: 'Client',
    title: 'Next.js + React',
    description: 'Upload, paste, and report views. TypeScript throughout.',
  },
  {
    label: 'Server',
    title: 'Route handlers on Vercel',
    description: 'Parses the PDF, builds the prompt, validates the response.',
  },
  {
    label: 'Model',
    title: 'Anthropic Claude API',
    description: 'Returns scores and per-requirement findings as structured JSON.',
  },
];

const INFRA = [
  { label: 'Auth', title: 'Google OAuth', short: 'Google OAuth' },
  { label: 'Files', title: 'AWS S3 for résumé PDFs', short: 'S3 · résumés' },
  { label: 'Data', title: 'DynamoDB for evaluations', short: 'DynamoDB · evaluations' },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-page">
      <LandingHeader />

      <main className="flex-1">
        <section
          className={`${WRAP} flex flex-col gap-10 pt-11 pb-10 md:pt-[88px] md:pb-24 xl:flex-row xl:items-center xl:gap-14`}
        >
          <div className="flex min-w-0 flex-col gap-[22px] md:gap-7 xl:flex-1">
            <h1 className="m-0 text-[44px] leading-none font-extrabold tracking-[-0.035em] md:text-[68px] md:leading-[0.98]">
              Check your résumé against the job before you apply.
            </h1>
            <p className="m-0 max-w-[480px] text-base leading-[1.55] text-ink-secondary md:text-[19px]">
              Fitly evaluates your résumé against a job description using a standardized requirement rubric. It objectively maps your strengths and qualification gaps to calculate a reliable, repeatable fit score.
            </p>
            <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-3">
              <GoogleSignInButton variant="ink" size="lg" />
              <a
                href="#report"
                className="inline-flex h-13 items-center justify-center rounded-full border border-hairline-strong px-[22px] text-base font-medium text-ink transition-colors hover:border-ink"
              >
                See a sample report
              </a>
            </div>
          </div>

          <div className="min-w-0 xl:flex-[1.3]">
            <HeroPreview />
          </div>
        </section>

        <section id="report" className="scroll-mt-4 border-t border-hairline">
          <div className={`${WRAP} flex flex-col gap-14 py-16 md:gap-24 md:pt-[104px] md:pb-28`}>
            <h2 className={cn(SECTION_HEADING, 'max-w-[620px]')}>
              Scores are tied to specific lines on your résumé.
            </h2>

            <FeatureRow
              title="Requirement matching"
              description="Each requirement is marked met, partial, or missing."
              media={
                <Figure>
                  <div className="hidden overflow-hidden rounded border border-track md:block">
                    <div className="flex gap-4 bg-surface-subtle px-4 py-2.5 font-mono text-[11px] text-ink-muted">
                      <span className="flex-[1.2]">FROM THE POSTING</span>
                      <span className="flex-1">FROM YOUR RÉSUMÉ</span>
                      <span className="w-16 text-right">STATUS</span>
                    </div>
                    {MATCHES.map(({ requirement, evidence, status }) => (
                      <div
                        key={requirement}
                        className="flex items-center gap-4 border-t border-track px-4 py-3.5 text-[13px]"
                      >
                        <span className="flex-[1.2] font-medium">{requirement}</span>
                        <span className="flex-1 text-ink-secondary">{evidence}</span>
                        <span className={cn('w-16 text-right font-semibold', STATUS_TEXT[status])}>
                          {STATUS_LABELS[status]}
                        </span>
                      </div>
                    ))}
                  </div>
                  <ul className="flex flex-col gap-2.5 md:hidden">
                    {MATCHES.map(({ requirement, evidence, status }) => (
                      <li
                        key={requirement}
                        className="flex flex-col gap-1 rounded-[10px] border border-track p-3"
                      >
                        <div className="flex justify-between gap-2">
                          <span className="text-[13px] font-medium">{requirement}</span>
                          <span className={cn('text-xs font-semibold', STATUS_TEXT[status])}>
                            {STATUS_LABELS[status]}
                          </span>
                        </div>
                        <span className="text-xs text-ink-secondary">{evidence}</span>
                      </li>
                    ))}
                  </ul>
                </Figure>
              }
            />

            <FeatureRow
              title="Weighted scoring"
              description="Skills, experience, and domain are scored separately."
              mediaSide="right"
              textFirstOnMobile
              media={
                <div className="flex flex-col rounded-lg bg-accent p-5 text-white tabular-nums md:px-10 md:py-9">
                  {SAMPLE_SUB_SCORES.map(({ label, value, weight }, i) => (
                    <div
                      key={label}
                      className={cn(
                        'grid grid-cols-[minmax(0,1fr)_auto_auto] items-baseline gap-x-4 border-b py-3 md:gap-x-7 md:py-3.5',
                        i === SAMPLE_SUB_SCORES.length - 1 ? 'border-white/60' : 'border-white/25'
                      )}
                    >
                      <span className="text-sm md:text-base">{label}</span>
                      <span className="text-sm text-white/80 md:text-base">
                        {value} × {weight.toFixed(2)}
                      </span>
                      <span className="min-w-12 text-right text-lg font-semibold md:min-w-16 md:text-[22px]">
                        {(value * weight).toFixed(1)}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-baseline justify-between gap-4 pt-3.5 md:pt-[18px]">
                    <span className="text-sm md:text-base">Overall</span>
                    <span className="flex items-baseline gap-3.5">
                      <span className="text-sm text-white/80 md:text-base">
                        {SAMPLE_WEIGHTED_TOTAL.toFixed(1)} →
                      </span>
                      <span className="font-display text-5xl leading-none font-extrabold tracking-[-0.03em] md:text-[64px]">
                        {SAMPLE_OVERALL}
                      </span>
                    </span>
                  </div>
                </div>
              }
            />

            <FeatureRow
              title="Plain-language summary"
              description="A short, actionable written summary."
              media={
                <Figure>
                  <p className="m-0 rounded border border-track bg-surface-subtle p-4 text-sm leading-relaxed text-ink md:p-[18px] md:text-[15px]">
                    You match the core backend work and the payments domain well. A hiring manager
                    will probably notice that Kubernetes and Go are missing. It&apos;s worth applying.
                    If you have any container experience, mention it in your cover note.
                  </p>
                </Figure>
              }
            />

            <FeatureRow
              title="History"
              description="Past evaluations stay in your history."
              mediaSide="right"
              media={
                <Figure>
                  <ul className="flex flex-col">
                    {HISTORY.map(({ score, title, company, date }, i) => (
                      <li
                        key={title}
                        className={cn(
                          'flex items-center gap-3.5 py-2.5 md:gap-4 md:py-3',
                          i > 0 && 'border-t border-track'
                        )}
                      >
                        <span
                          className={cn(
                            'w-9 font-display text-xl font-extrabold md:w-11 md:text-[22px]',
                            HISTORY_SCORE_TEXT[getScoreTone(score)]
                          )}
                        >
                          {score}
                        </span>
                        <div className="flex flex-1 flex-col">
                          <span className="text-[13px] font-medium md:text-sm">{title}</span>
                          <span className="text-xs text-ink-secondary">{company}</span>
                        </div>
                        <span className="hidden font-mono text-[11px] text-ink-muted md:inline">{date}</span>
                      </li>
                    ))}
                  </ul>
                </Figure>
              }
            />
          </div>
        </section>

        <section id="how" className="scroll-mt-4 border-t border-hairline">
          <div className={`${WRAP} flex flex-col gap-7 py-14 md:gap-12 md:py-24`}>
            <h2 className={SECTION_HEADING}>How it works</h2>
            <ol className="grid grid-cols-1 gap-7 md:grid-cols-3 md:gap-5">
              {STEPS.map(({ title, description }, i) => (
                <li
                  key={title}
                  className="flex flex-col gap-2.5 border-t-2 border-ink pt-4 md:gap-3.5 md:pt-5"
                >
                  <span className="font-mono text-xs text-accent-hover md:text-[13px]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="m-0 text-xl md:text-2xl">{title}</h3>
                  <p className="m-0 text-sm leading-[1.55] text-ink-secondary md:text-[15px]">
                    {description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="built" className="scroll-mt-4 bg-ink text-page">
          <div className={`${WRAP} flex flex-col gap-6 py-16 md:gap-14 md:py-[104px]`}>
            <div className="flex flex-col gap-6 md:flex-row md:flex-wrap md:items-end md:justify-between md:gap-8">
              <div className="flex max-w-[640px] flex-col gap-6 md:gap-4">
                <span className="font-mono text-[11px] tracking-[0.04em] text-accent-soft md:text-xs">
                  HOW IT&apos;S BUILT
                </span>
                <h2 className={SECTION_HEADING}>A small app, built end to end.</h2>
              </div>
              <p className="m-0 max-w-[400px] text-[15px] leading-relaxed text-page/70 md:text-base">
                Google sign-in, résumé storage in S3, a Claude API call that returns structured JSON,
                and saved evaluations in DynamoDB.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2 md:flex-row md:items-stretch md:gap-3">
                {PIPELINE.map(({ label, title, description }, i) => {
                  const isModel = i === PIPELINE.length - 1;
                  return (
                    <div key={label} className="contents">
                      <div
                        className={cn(
                          'flex flex-col gap-1.5 rounded border p-4 md:flex-1 md:gap-2.5 md:rounded-[14px] md:p-5',
                          isModel ? 'border-accent bg-accent/12' : 'border-white/10'
                        )}
                      >
                        <span
                          className={cn(
                            'font-mono text-[10px] uppercase md:text-[11px]',
                            isModel ? 'text-accent-soft' : 'text-page/50'
                          )}
                        >
                          {label}
                        </span>
                        <span className="text-[15px] font-semibold md:text-[17px]">{title}</span>
                        <span className="text-[13px] leading-normal text-page/70">{description}</span>
                      </div>
                      {!isModel && (
                        <div className="flex shrink-0 items-center justify-center text-ink-secondary" aria-hidden="true">
                          <ArrowDown size={20} strokeWidth={1.6} className="md:hidden" />
                          <ArrowRight size={24} strokeWidth={1.6} className="hidden md:block" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <ul className="flex flex-wrap gap-2 md:hidden">
                {INFRA.map(({ short }) => (
                  <li
                    key={short}
                    className="rounded-full border border-white/10 px-3 py-2 font-mono text-xs"
                  >
                    {short}
                  </li>
                ))}
              </ul>
              <ul className="hidden gap-3 md:flex">
                {INFRA.map(({ label, title }) => (
                  <li
                    key={label}
                    className="flex flex-1 flex-col gap-2.5 rounded-[14px] border border-white/10 p-5"
                  >
                    <span className="font-mono text-[11px] text-page/50 uppercase">{label}</span>
                    <span className="text-[17px] font-semibold">{title}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-[18px] border-t border-white/10 pt-7 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-8 md:pt-10">
              <div className="flex items-center gap-3.5 md:flex-[1_1_420px] md:gap-[18px]">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent font-display text-xl font-extrabold text-white md:size-14 md:text-[22px]">
                  M
                </span>
                <div className="flex flex-col gap-[3px] md:gap-1">
                  <span className="text-[15px] font-semibold md:text-[17px]">Designed and built by Mike</span>
                  <span className="text-[13px] text-page/70 md:text-sm">
                    Full-stack developer<span className="md:hidden">, available for contract work.</span>
                    <span className="hidden md:inline">. TypeScript, React, NestJS, Python. Available for contract work.</span>
                  </span>
                </div>
              </div>
              <a
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-page px-[18px] text-[15px] font-medium text-ink transition-colors hover:bg-white md:min-h-11 md:text-sm"
              >
                Source on GitHub
              </a>
            </div>
          </div>
        </section>

        <section className={`${WRAP} flex flex-col items-center gap-5 py-16 text-center md:gap-7 md:py-28`}>
          <h2 className="m-0 max-w-[720px] text-4xl leading-none font-extrabold tracking-[-0.035em] md:text-[56px]">
            Got a posting open in another tab?
          </h2>
          <p className="m-0 text-[15px] text-ink-secondary md:text-[17px]">
            Check it against your résumé before you write the cover letter.
          </p>
          <GoogleSignInButton variant="ink" size="lg" className="self-stretch sm:self-auto" />
        </section>
      </main>

      <footer className="border-t border-hairline">
        <div className={`${WRAP} flex flex-wrap items-center justify-between gap-4 py-5 text-[13px] text-ink-secondary md:py-6`}>
          <Wordmark withMark={false} className="text-[17px] md:text-lg" />
          <div className="flex gap-5">
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-secondary transition-colors hover:text-ink"
            >
              GitHub
            </a>
            <a
              href={GITHUB_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden text-ink-secondary transition-colors hover:text-ink md:inline"
            >
              Built by Mike
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface FeatureRowProps {
  title: string;
  description: string;
  media: ReactNode;
  /** Side the media sits on from `lg` up. Below that it stacks above the text. */
  mediaSide?: 'left' | 'right';
  /** Stack the text above the media below `lg` instead. */
  textFirstOnMobile?: boolean;
}

function FeatureRow({
  title,
  description,
  media,
  mediaSide = 'left',
  textFirstOnMobile = false,
}: FeatureRowProps) {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-14">
      <div className="min-w-0 lg:flex-[1.6]">{media}</div>
      <div
        className={cn(
          'flex min-w-0 flex-col gap-3 lg:flex-1 lg:gap-3.5',
          textFirstOnMobile && 'order-first',
          mediaSide === 'right' ? 'lg:order-first' : 'lg:order-none'
        )}
      >
        <h3 className="m-0 text-[22px] leading-[1.2] tracking-[-0.02em] md:text-[30px] md:leading-[1.15]">
          {title}
        </h3>
        <p className="m-0 text-[15px] leading-relaxed text-ink-secondary md:text-base">{description}</p>
      </div>
    </div>
  );
}

function Figure({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-hairline bg-surface p-4 shadow-[0_30px_60px_-36px_rgba(17,18,20,0.35)] md:p-6">
      {children}
    </div>
  );
}
