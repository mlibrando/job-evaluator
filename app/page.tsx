import Image from 'next/image';
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button';
import { PercentIcon, TargetIcon, ListIcon, HistoryIcon } from '@/components/icons';

const WRAP = 'mx-auto max-w-[1120px] px-8';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-page">
      {/* Header — bare wordmark. No nav, no sign-in link: the CTA lives in the
          hero and the bottom section, matching the design exactly. */}
      <header className="border-b border-hairline">
        <div className={`${WRAP} flex items-center py-5`}>
          <span className="font-wordmark text-[26px] font-medium tracking-[-0.005em] text-ink">
            Fitly
          </span>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                'repeating-linear-gradient(to bottom, rgba(26,26,24,0.03) 0, rgba(26,26,24,0.03) 1px, transparent 1px, transparent 28px)',
            }}
            aria-hidden="true"
          />

          <div className={`${WRAP} relative`}>
            <div className="flex flex-col items-center pt-28">
              <h1 className="font-display max-w-[680px] text-center text-[clamp(40px,9vw,68px)] leading-[1.05] tracking-[-0.01em] text-ink">
                Stop applying blind
              </h1>
              <p className="mt-6 max-w-[56ch] text-center text-lg leading-[1.65] text-pretty text-ink-secondary">
                Upload your résumé, paste any job posting, and see exactly where you match
                and what you&apos;re missing.
              </p>
              <div className="mt-8">
                <GoogleSignInButton />
              </div>
            </div>

            <div className="mt-16 flex justify-center">
              <div className="w-full max-w-[960px] overflow-hidden rounded-lg bg-surface shadow-hero">
                <Image
                  src="/hero-evaluation.png"
                  alt="Evaluation result for a Senior Backend Engineer posting: an 87 out of 100 score with skill match, experience, and domain fit sub-scores."
                  width={1120}
                  height={537}
                  className="h-auto w-full"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className={`${WRAP} pt-28 pb-14`}>
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-3">
            <Step
              number={1}
              title="Upload your résumé"
              description="PDF, stored securely."
            />
            <Step
              number={2}
              title="Paste the job posting"
              description="Just paste the listing."
            />
            <Step
              number={3}
              title="Read the breakdown"
              description="Your match, strengths, and gaps."
            />
          </div>
        </section>

        {/* Feature grid */}
        <section className={`${WRAP} pb-14`}>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FeatureCard
              icon={<PercentIcon />}
              title="Weighted scoring"
              description="Separate scores for skills, experience, and domain fit."
            />
            <FeatureCard
              icon={<TargetIcon />}
              title="Gap analysis"
              description="See what your résumé is missing."
            />
            <FeatureCard
              icon={<ListIcon />}
              title="Plain-language summary"
              description="Understand your match without the jargon."
            />
            <FeatureCard
              icon={<HistoryIcon />}
              title="Evaluation history"
              description="Keep your previous evaluations in one place."
            />
          </div>
        </section>

        {/* Tech strip */}
        <section className="border-y border-hairline">
          <div className={`${WRAP} p-8 text-center text-sm leading-relaxed text-pretty text-ink-muted`}>
            Built with Next.js, TypeScript, and the Anthropic Claude API. Deployed on Vercel
            with AWS S3 and DynamoDB.
          </div>
        </section>

        {/* Bottom CTA */}
        <section className={`${WRAP} flex flex-col items-center py-28`}>
          <h2 className="font-display text-center text-[40px] leading-[1.15] text-ink">
            Know before you apply
          </h2>
          <div className="mt-8">
            <GoogleSignInButton />
          </div>
        </section>
      </main>

      <footer className="border-t border-hairline">
        <div className={`${WRAP} flex flex-wrap items-center justify-between gap-6 p-8 text-sm text-ink-muted`}>
          <span className="font-wordmark text-ink">Fitly</span>
          <a
            href="https://github.com/mlibrando/job-evaluator"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink-muted hover:text-accent"
          >
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}

interface StepProps {
  number: number;
  title: string;
  description: string;
}

function Step({ number, title, description }: StepProps) {
  return (
    <div>
      <div className="font-display text-4xl leading-none text-ink-muted">{number}</div>
      <div className="mt-5 text-lg font-medium text-ink">{title}</div>
      <div className="mt-2 max-w-[34ch] text-base leading-relaxed text-ink-secondary">
        {description}
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="rounded border border-hairline bg-surface p-6">
      <div className="text-ink-secondary">{icon}</div>
      <div className="mt-5 text-lg font-medium text-ink">{title}</div>
      <div className="mt-2 text-base leading-relaxed text-ink-secondary">{description}</div>
    </div>
  );
}
