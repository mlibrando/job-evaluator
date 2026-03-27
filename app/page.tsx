import Link from 'next/link';
import { Button } from '@/components/ui';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-zinc-900 dark:bg-white" />
              <span className="text-xl font-bold text-zinc-900 dark:text-white">
                AI Job Evaluator
              </span>
            </div>
            <Link href="/login">
              <Button variant="primary" size="sm">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-6xl">
              Evaluate Job Postings with{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Power
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
              Upload your resume and get instant, AI-powered analysis of how well you match
              any job posting. Get detailed insights, recommendations, and improve your
              chances of landing your dream job.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/login">
                <Button variant="primary" size="lg">
                  Get Started
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>

          {/* Features */}
          <div id="features" className="mt-32">
            <h2 className="text-center text-3xl font-bold text-zinc-900 dark:text-white">
              How It Works
            </h2>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon="📄"
                title="Upload Your Resume"
                description="Upload your resume in PDF, DOC, or TXT format. We'll securely store it and analyze it against job postings."
              />
              <FeatureCard
                icon="🎯"
                title="Paste Job Description"
                description="Copy any job posting and paste it into our analyzer. Include the job title, company, and full description."
              />
              <FeatureCard
                icon="🤖"
                title="Get AI Analysis"
                description="Our AI analyzes your resume against the job posting and provides detailed insights, match scores, and recommendations."
              />
            </div>
          </div>

          {/* Benefits */}
          <div className="mt-32">
            <h2 className="text-center text-3xl font-bold text-zinc-900 dark:text-white">
              Why Use AI Job Evaluator?
            </h2>
            <div className="mt-12 grid gap-8 md:grid-cols-2">
              <BenefitCard
                title="Save Time"
                description="No more manually comparing your resume to job descriptions. Get instant analysis in seconds."
              />
              <BenefitCard
                title="Improve Your Chances"
                description="Understand your strengths and weaknesses for each position before applying."
              />
              <BenefitCard
                title="Actionable Insights"
                description="Get specific recommendations on how to tailor your resume for each job."
              />
              <BenefitCard
                title="Track Your Applications"
                description="Keep a history of all your evaluations and track which positions are the best fit."
              />
            </div>
          </div>

          {/* CTA */}
          <div className="mt-32 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center sm:p-12">
            <h2 className="text-3xl font-bold text-white">
              Ready to find your perfect job match?
            </h2>
            <p className="mt-4 text-lg text-blue-100">
              Sign in with Google and start evaluating job postings in minutes.
            </p>
            <div className="mt-8">
              <Link href="/login">
                <Button variant="secondary" size="lg">
                  Get Started for Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
            © 2026 AI Job Evaluator. Powered by Claude AI.
          </p>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
    </div>
  );
}

interface BenefitCardProps {
  title: string;
  description: string;
}

function BenefitCard({ title, description }: BenefitCardProps) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
    </div>
  );
}
