import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FileText } from 'lucide-react';
import { Badge, Button, Card, getScoreTone } from '@/components/ui';
import { getUserEvaluations } from '@/lib/aws/dynamodb';
import { getRateLimitStatus } from '@/lib/rate-limit';
import type { Evaluation } from '@/types/evaluation';

const EVALUATION_FETCH_LIMIT = 500;
const RECENT_COUNT = 4;

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const [evaluations, rateLimit] = await Promise.all([
    getUserEvaluations(session.user.id, EVALUATION_FETCH_LIMIT)
      .then((result) => result.evaluations ?? [])
      .catch((error) => {
        console.error('Failed to fetch evaluations:', error);
        return [] as Evaluation[];
      }),
    getRateLimitStatus(session.user.id).catch((error) => {
      console.error('Failed to fetch rate limit status:', error);
      return null;
    }),
  ]);

  const now = new Date();
  const thisMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const thisMonthCount = evaluations.filter((e) =>
    e.createdAt.startsWith(thisMonthPrefix)
  ).length;

  const scores = evaluations.map((evals) => evals.analysis.overallScore);
  const averageFit = scores.length
    ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
    : null;
  const bestMatch = scores.length ? Math.max(...scores) : null;

  const recent = evaluations.slice(0, RECENT_COUNT);
  const latest = evaluations[0];

  return (
    <div className="mx-auto max-w-[1120px] px-8 pt-16 pb-28">
      <div className="flex flex-wrap items-end justify-between gap-8">
        <div>
          <h1 className="font-display text-[44px] leading-[1.1] tracking-[-0.01em] text-ink">
            Welcome back, {session.user?.name?.split(' ')[0] ?? session.user?.email}
          </h1>
          <p className="mt-2.5 text-base leading-relaxed text-ink-secondary">
            You&apos;ve run {thisMonthCount} {thisMonthCount === 1 ? 'evaluation' : 'evaluations'}{' '}
            this month.
            {rateLimit &&
              ` You have ${rateLimit.remaining} of ${rateLimit.limit} checks left this hour.`}
          </p>
        </div>
        <Link href="/evaluate">
          <Button variant="primary">Start evaluation</Button>
        </Link>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Evaluations run" value={evaluations.length} />
        <Stat label="This month" value={thisMonthCount} />
        <Stat label="Average fit" value={averageFit} />
        <Stat label="Best match" value={bestMatch} />
      </div>

      {latest && (
        <Card className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-3.5">
              <FileText size={20} strokeWidth={1.5} className="shrink-0 text-ink-secondary" />
              <div>
                <div className="text-[15px] font-medium text-ink">
                  {resumeFileName(latest.resumeKey)}
                </div>
                <div className="mt-0.5 text-sm text-ink-muted">
                  Résumé on file · updated {formatDate(latest.createdAt)}
                </div>
              </div>
            </div>
            <Link href="/evaluate" className="text-sm text-ink-secondary hover:text-accent">
              Replace
            </Link>
          </div>
        </Card>
      )}

      <div className="mt-16">
        <div className="flex items-baseline justify-between gap-6 border-b border-hairline pb-4">
          <h2 className="font-display text-3xl leading-tight text-ink">Recent evaluations</h2>
          {evaluations.length > 0 && (
            <Link href="/history" className="text-sm text-ink-secondary hover:text-accent">
              View all
            </Link>
          )}
        </div>

        {recent.length > 0 ? (
          <div className="flex flex-col">
            {recent.map((evaluation, index) => (
              <EvaluationRow
                key={evaluation.evaluationId}
                evaluation={evaluation}
                last={index === recent.length - 1}
              />
            ))}
          </div>
        ) : (
          <div className="py-10">
            <p className="text-ink-secondary">
              No evaluations yet. Upload a résumé and paste a job posting to see how you match.
            </p>
            <div className="mt-6">
              <Link href="/evaluate">
                <Button variant="primary">Start your first evaluation</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | null }) {
  return (
    <Card>
      <div className="text-[13px] font-medium tracking-[0.1em] uppercase text-ink-muted">
        {label}
      </div>
      <div className="mt-4 font-display text-[56px] leading-none tracking-[-0.02em] text-ink">
        {value ?? '—'}
      </div>
    </Card>
  );
}

function EvaluationRow({ evaluation, last }: { evaluation: Evaluation; last: boolean }) {
  const { analysis } = evaluation;
  const gaps = countGaps(evaluation);

  return (
    <Link
      href={`/evaluations/${evaluation.evaluationId}`}
      className={`flex flex-wrap items-center justify-between gap-6 py-5.5 ${
        last ? '' : 'border-b border-hairline'
      }`}
    >
      <div>
        <div className="text-base text-ink">
          {evaluation.jobTitle}
          {evaluation.companyName && ` · ${evaluation.companyName}`}
        </div>
        <div className="mt-1 text-sm text-ink-muted">
          Evaluated {formatDate(evaluation.createdAt)} · {gaps} {gaps === 1 ? 'gap' : 'gaps'}
        </div>
      </div>
      <Badge tone={getScoreTone(analysis.overallScore)}>{analysis.overallScore}/100</Badge>
    </Link>
  );
}

// Evaluations stored before the requirement-level rewrite have no assessments.
function countGaps({ analysis }: Evaluation): number {
  if (analysis.assessments?.length) {
    return analysis.assessments.filter((a) => a.match === 'none').length;
  }
  return analysis.missingSkills?.length ?? 0;
}

// Keys are `resumes/<userId>/<timestamp>-<original name>`.
function resumeFileName(resumeKey: string): string {
  const segment = resumeKey.split('/').pop() ?? resumeKey;
  return segment.replace(/^\d+-/, '');
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
