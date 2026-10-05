import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Card, getScoreTone, type ScoreTone } from '@/components/ui';
import { ResumePreviewButton } from '@/components/evaluation/resume-preview-button';
import { getUserEvaluations } from '@/lib/aws/dynamodb';
import { getRateLimitStatus } from '@/lib/rate-limit';
import { resumeFileName } from '@/lib/resume/file-name';
import { cn } from '@/lib/utils/cn';
import type { Evaluation } from '@/types/evaluation';

const EVALUATION_FETCH_LIMIT = 500;
const RECENT_COUNT = 4;

const EYEBROW = 'font-mono text-[10px] tracking-[0.04em] text-ink-muted uppercase sm:text-[11px]';

const PILL_LINK =
  'inline-flex items-center justify-center gap-2 rounded-full border font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-page';

const SCORE_TEXT: Record<ScoreTone, string> = {
  strong: 'text-accent-hover',
  warn: 'text-warn',
  danger: 'text-danger',
};

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
  const thisMonthCount = evaluations.filter((e) => e.createdAt.startsWith(thisMonthPrefix)).length;

  const averageFit = evaluations.length
    ? Math.round(
      evaluations.reduce((sum, e) => sum + e.analysis.overallScore, 0) / evaluations.length,
    )
    : null;
  const best = evaluations.reduce<Evaluation | null>(
    (top, e) => (!top || e.analysis.overallScore > top.analysis.overallScore ? e : top),
    null,
  );

  const recent = evaluations.slice(0, RECENT_COUNT);
  const latest = evaluations[0];
  const firstName = session.user?.name?.split(' ')[0] ?? session.user?.email;

  const today = now
    .toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    })
    .toUpperCase();
  const monthStart = now.toLocaleDateString('en-US', { month: 'short' }) + ' 1';

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-5 pt-7 pb-10 sm:gap-7 sm:px-10 sm:pt-12 sm:pb-18">
      <div className="flex flex-col gap-6 pb-2 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:pb-0">
        <div className="flex flex-col gap-2.5">
          <span className="font-mono text-[11px] tracking-[0.04em] text-ink-muted sm:text-xs">
            {today}
          </span>
          <h1 className="text-4xl leading-none font-extrabold tracking-[-0.035em] text-ink sm:text-5xl">
            Welcome back, {firstName}.
          </h1>
          <p className="text-sm leading-normal text-ink-secondary sm:text-[15px]">
            {thisMonthCount === 0
              ? 'No evaluations run this month yet.'
              : `You've run ${thisMonthCount} ${thisMonthCount === 1 ? 'evaluation' : 'evaluations'} this month.`}
            {!latest?.resumeKey &&
              ' Please upload a resume in PDF format to start evaluating job postings.'}
          </p>
        </div>
        <Link
          href="/evaluate"
          className={cn(
            PILL_LINK,
            'h-12.5 border-transparent bg-accent px-5 text-[15px] text-white hover:bg-accent-hover sm:h-12',
          )}
        >
          <Plus size={16} strokeWidth={2} aria-hidden="true" />
          New evaluation
        </Link>
      </div>

      <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-4">
        <section className="flex min-w-0 flex-wrap items-center gap-4.5 rounded-lg bg-ink p-5 text-page sm:flex-[1.4_1_380px] sm:gap-7 sm:p-6">
          <AverageRing score={averageFit} />
          <div className="flex flex-[1_1_180px] flex-col gap-1.5 sm:gap-2">
            <h2 className="font-mono text-[10px] font-normal tracking-[0.04em] text-accent-soft sm:text-[11px]">
              AVERAGE FIT · ALL TIME
            </h2>
            <p className="text-[13px] leading-normal text-page/80 sm:text-[15px]">
              {evaluations.length === 0
                ? 'Run your first evaluation to see how you match.'
                : `Across ${evaluations.length} ${evaluations.length === 1 ? 'evaluation' : 'evaluations'}.`}
              {best && (
                <span className="hidden sm:inline">
                  {' '}
                  Your best was {best.analysis.overallScore} for {roleLabel(best)}.
                </span>
              )}
            </p>
          </div>
        </section>

        <div className="flex gap-2.5 sm:contents">
          <StatTile
            label="Evaluations"
            mobileLabel="Total"
            value={evaluations.length}
            unit="total"
          />
          <StatTile
            label="This month"
            value={thisMonthCount}
            unit={`since ${monthStart}`}
            dim={thisMonthCount === 0}
          />
          <StatTile
            label="Best match"
            mobileLabel="Best"
            value={best?.analysis.overallScore ?? null}
            detail={best ? roleLabel(best) : undefined}
            highlight
          />
        </div>
      </div>

      {(latest?.resumeKey || rateLimit) && (
        <div className="flex flex-col gap-3.5 rounded-lg border border-hairline bg-surface p-4 sm:flex-row sm:flex-wrap sm:gap-4 sm:border-0 sm:bg-transparent sm:p-0">
          {latest?.resumeKey && (
            <Card
              padding="none"
              className="flex min-w-0 flex-col gap-3.5 border-0 sm:flex-[2_1_460px] sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 sm:border sm:px-5.5 sm:py-5"
            >
              <div className="flex min-w-0 flex-[1_1_220px] items-center gap-3 sm:gap-4">
                <span
                  aria-hidden="true"
                  className="inline-flex h-11.5 w-9.5 shrink-0 items-end justify-center rounded-sm border border-hairline bg-page pb-1.5 font-mono text-[8px] font-medium text-danger sm:h-13 sm:w-11 sm:text-[9px]"
                >
                  {fileExtension(latest.resumeKey)}
                </span>
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="truncate text-sm font-medium text-ink sm:text-[15px]">
                    {resumeFileName(latest.resumeKey)}
                  </span>
                  <span className="text-xs text-ink-secondary sm:text-[13px]">
                    · updated {formatDate(latest.createdAt)}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <ResumePreviewButton resumeKey={latest.resumeKey} className="flex-1 sm:flex-none" />
                <Link
                  href="/evaluate"
                  className={cn(
                    PILL_LINK,
                    'h-11 flex-1 border-hairline-strong bg-surface px-5 text-[15px] text-ink hover:border-ink sm:flex-none',
                  )}
                >
                  Replace
                </Link>
              </div>
            </Card>
          )}

          {rateLimit && (
            <Card
              padding="none"
              className={cn(
                'flex min-w-0 flex-col justify-center gap-2 border-0 sm:flex-[1_1_260px] sm:gap-2.5 sm:border sm:px-5.5 sm:py-5',
                latest?.resumeKey && 'border-t border-track pt-3 sm:border-hairline',
              )}
            >
              <div className={cn(EYEBROW, 'flex justify-between gap-3')}>
                <span>Hourly checks</span>
                <span className="text-ink">
                  {rateLimit.remaining} / {rateLimit.limit} left
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-track sm:h-[7px]">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{
                    width: `${(rateLimit.remaining / rateLimit.limit) * 100}%`,
                  }}
                />
              </div>
              <span className="hidden text-xs text-ink-secondary sm:block">
                {resetLabel(rateLimit.reset, now)}
              </span>
            </Card>
          )}
        </div>
      )}

      <section className="flex flex-col gap-4 pt-4 sm:gap-0 sm:overflow-hidden sm:rounded-lg sm:border sm:border-hairline sm:bg-surface sm:pt-0">
        <div className="flex flex-wrap items-baseline justify-between gap-3 sm:items-center sm:border-b sm:border-track sm:px-6 sm:py-4.5">
          <h2 className="text-[22px] tracking-[-0.02em] text-ink">Recent evaluations</h2>
          {evaluations.length > 0 && (
            <Link
              href="/history"
              className="rounded-sm text-sm font-medium text-accent hover:text-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              View all
              <span className="hidden sm:inline"> {evaluations.length}</span>
            </Link>
          )}
        </div>

        {recent.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-hairline bg-surface sm:rounded-none sm:border-0">
            <div
              className={cn(
                EYEBROW,
                'hidden gap-5 bg-surface-subtle px-6 py-2.5 tracking-[0.03em] sm:flex',
              )}
            >
              <span className="w-14">Score</span>
              <span className="flex-1">Role</span>
              <span className="w-[110px]">Gaps</span>
              <span className="w-24 text-right">Date</span>
            </div>
            {recent.map((evaluation, index) => (
              <EvaluationRow
                key={evaluation.evaluationId}
                evaluation={evaluation}
                first={index === 0}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-hairline bg-surface px-4 py-8 sm:rounded-none sm:border-0 sm:px-6 sm:py-10">
            <p className="text-sm text-ink-secondary sm:text-[15px]">
              No evaluations yet. Upload a résumé and paste a job posting to see how you match.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function AverageRing({ score }: { score: number | null }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const filled = ((score ?? 0) / 100) * circumference;

  return (
    <div className="relative size-24 shrink-0 sm:size-31">
      <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden="true">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          strokeWidth="10"
          className="stroke-white/15"
        />
        {score !== null && (
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circumference}`}
            className="stroke-accent-bright"
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-[34px] leading-none font-extrabold tracking-[-0.04em] sm:text-[42px]">
          {score ?? '—'}
        </span>
        <span className="hidden font-mono text-[11px] text-page/55 sm:block">avg fit</span>
      </div>
    </div>
  );
}

interface StatTileProps {
  label: string;
  mobileLabel?: string;
  value: number | null;
  unit?: string;
  detail?: string;
  dim?: boolean;
  highlight?: boolean;
}

function StatTile({ label, mobileLabel, value, unit, detail, dim, highlight }: StatTileProps) {
  return (
    <div
      className={cn(
        'flex min-w-0 flex-1 flex-col justify-between gap-3 rounded-[14px] border p-3.5 sm:flex-[1_1_180px] sm:gap-5 sm:rounded-lg sm:p-5.5',
        highlight
          ? 'border-accent-wash bg-accent-wash text-accent-hover'
          : 'border-hairline bg-surface',
      )}
    >
      <span className={cn(EYEBROW, highlight && 'text-accent-hover')}>
        {mobileLabel ? (
          <>
            <span className="sm:hidden">{mobileLabel}</span>
            <span className="hidden sm:inline">{label}</span>
          </>
        ) : (
          label
        )}
      </span>
      <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-2">
        <span
          className={cn(
            'font-display text-[34px] leading-none font-extrabold tracking-[-0.04em] sm:text-[52px]',
            highlight ? 'text-accent-hover' : dim ? 'text-ink-muted' : 'text-ink',
          )}
        >
          {value ?? '—'}
        </span>
        {unit && <span className="hidden text-[13px] text-ink-secondary sm:inline">{unit}</span>}
        {detail && <span className="hidden truncate text-xs sm:block sm:basis-full">{detail}</span>}
      </div>
    </div>
  );
}

function EvaluationRow({ evaluation, first }: { evaluation: Evaluation; first: boolean }) {
  const { analysis } = evaluation;
  const tone = getScoreTone(analysis.overallScore);
  const gaps = countGaps(evaluation);
  const gapsLabel = gaps === 0 ? 'No gaps' : `${gaps} ${gaps === 1 ? 'gap' : 'gaps'}`;
  const date = formatShortDate(evaluation.createdAt);

  return (
    <Link
      href={`/evaluations/${evaluation.evaluationId}`}
      className={cn(
        'flex items-center gap-3.5 px-4 py-3.5 text-ink transition-colors hover:bg-surface-subtle focus:outline-none focus-visible:bg-surface-subtle sm:gap-5 sm:px-6 sm:py-4',
        !first && 'border-t border-track',
        first && 'sm:border-t sm:border-track',
      )}
    >
      <span
        className={cn(
          'w-10 shrink-0 font-display text-[26px] font-extrabold tracking-[-0.03em] sm:w-14 sm:text-[28px]',
          SCORE_TEXT[tone],
        )}
      >
        {analysis.overallScore}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
        <span className="truncate text-sm font-medium sm:text-[15px]">{evaluation.jobTitle}</span>
        <span className="truncate text-xs text-ink-secondary sm:hidden">
          {[evaluation.companyName, date, gapsLabel].filter(Boolean).join(' · ')}
        </span>
        {evaluation.companyName && (
          <span className="hidden truncate text-[13px] text-ink-secondary sm:block">
            {evaluation.companyName}
          </span>
        )}
      </span>
      <span className="hidden w-[110px] sm:block">
        <span className={cn('rounded-md px-2 py-1 text-xs font-semibold', gapTone(gaps))}>
          {gapsLabel}
        </span>
      </span>
      <span className="hidden w-24 text-right font-mono text-xs text-ink-muted sm:block">
        {date}
      </span>
    </Link>
  );
}

function gapTone(gaps: number): string {
  if (gaps === 0) return 'bg-accent-wash text-accent-hover';
  if (gaps <= 2) return 'bg-warn-wash text-warn';
  return 'bg-danger-wash text-danger';
}

function roleLabel({ jobTitle, companyName }: Evaluation): string {
  return companyName ? `${jobTitle} at ${companyName}` : jobTitle;
}

// Evaluations stored before the requirement-level rewrite have no assessments.
function countGaps({ analysis }: Evaluation): number {
  if (analysis.assessments?.length) {
    return analysis.assessments.filter((a) => a.match === 'none').length;
  }
  return analysis.missingSkills?.length ?? 0;
}

function fileExtension(resumeKey: string): string {
  const match = resumeKey.match(/\.([a-z0-9]+)$/i);
  return match ? match[1].toUpperCase() : 'FILE';
}

function resetLabel(reset: number, now: Date): string {
  const minutes = Math.ceil((reset - now.getTime()) / 60_000);
  if (minutes <= 1) return 'Resets within a minute';
  return `Resets in ${minutes} min`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatShortDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}
