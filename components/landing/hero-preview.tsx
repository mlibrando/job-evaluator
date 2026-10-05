import { Badge, ScoreRing, SubScoreBar } from '@/components/ui';
import { cn } from '@/lib/utils/cn';
import { SAMPLE_OVERALL, SAMPLE_SUB_SCORES } from './sample';
import { StatusPill, type RequirementStatus } from './status';

interface PreviewRequirement {
  status: RequirementStatus;
  title: string;
  shortTitle: string;
  evidence: string;
  onMobile: boolean;
}

const REQUIREMENTS: PreviewRequirement[] = [
  {
    status: 'met',
    title: '5+ years building backend services in TypeScript',
    shortTitle: '5+ years TypeScript backend',
    evidence: '"6 years of NestJS services handling card payments at a neobank"',
    onMobile: true,
  },
  {
    status: 'met',
    title: 'PostgreSQL schema design and query tuning',
    shortTitle: 'PostgreSQL schema design',
    evidence: '"Cut p95 ledger query time by reworking indexes"',
    onMobile: false,
  },
  {
    status: 'partial',
    title: 'Event-driven systems (Kafka or similar)',
    shortTitle: 'Event-driven systems',
    evidence: 'Mentions queues, but no scale or ownership detail',
    onMobile: true,
  },
  {
    status: 'missing',
    title: 'Kubernetes in production',
    shortTitle: 'Kubernetes in production',
    evidence: 'Not mentioned in the résumé',
    onMobile: true,
  },
];

export function HeroPreview() {
  return (
    <div
      role="img"
      aria-label={`Sample Fitly report for a Senior Backend Engineer role: ${SAMPLE_OVERALL} out of 100, with ${SAMPLE_SUB_SCORES.map(({ label, value }) => `${label.toLowerCase()} ${value}`).join(', ')}, and each requirement marked met, partial or missing.`}
      className="relative pb-14 sm:pb-[72px]"
    >
      <div className="overflow-hidden rounded-lg border border-hairline bg-surface shadow-[0_40px_80px_-40px_rgba(17,18,20,0.35)]">
        <div className="hidden items-center justify-between border-b border-track px-5 py-3 sm:flex">
          <div className="flex items-center gap-5 text-[13px]">
            <span className="font-wordmark text-[17px] font-extrabold tracking-[-0.03em]">fitly</span>
            <span className="font-medium text-ink">Evaluations</span>
            <span className="text-ink-muted">New</span>
          </div>
          <span className="flex size-7 items-center justify-center rounded-full bg-surface-sunken font-mono text-[11px] text-ink-secondary">
            JD
          </span>
        </div>

        <div className="flex flex-col gap-4 p-[18px] sm:gap-[22px] sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1 sm:gap-1.5">
              <div className="font-display text-[19px] font-bold tracking-[-0.02em] sm:text-[26px]">
                Senior Backend Engineer
              </div>
              <div className="text-xs text-ink-secondary sm:text-[13px]">
                Northwind Labs · <span className="hidden sm:inline">Evaluated </span>Oct 2
                <span className="hidden sm:inline">, 2026</span>
              </div>
            </div>
            <Badge tone="strong" className="shrink-0">
              Strong fit
            </Badge>
          </div>

          <div className="flex items-center gap-[18px] sm:flex-wrap sm:gap-7 sm:rounded sm:border sm:border-track sm:bg-surface-subtle sm:p-[18px]">
            <div className="shrink-0 sm:hidden">
              <ScoreRing score={SAMPLE_OVERALL} size={88} stroke={9} />
            </div>
            <div className="hidden shrink-0 sm:block">
              <ScoreRing score={SAMPLE_OVERALL} size={112} stroke={9} />
            </div>
            <div className="flex flex-1 flex-col gap-2.5 sm:basis-[220px] sm:gap-3">
              {SAMPLE_SUB_SCORES.map(({ label, value }) => (
                <SubScoreBar key={label} label={label} value={value} />
              ))}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="hidden pb-2 font-mono text-[11px] tracking-[0.04em] text-ink-muted sm:block">
              REQUIREMENTS · 4 OF 9 SHOWN
            </div>
            {REQUIREMENTS.map((requirement) => (
              <div
                key={requirement.title}
                className={cn(
                  'items-start gap-2.5 border-t border-track py-2.5 sm:flex sm:gap-3.5 sm:py-3',
                  requirement.onMobile ? 'flex' : 'hidden'
                )}
              >
                <StatusPill status={requirement.status} />
                <div className="flex flex-col gap-[3px]">
                  <span className="text-[13px] font-medium sm:text-sm">
                    <span className="sm:hidden">{requirement.shortTitle}</span>
                    <span className="hidden sm:inline">{requirement.title}</span>
                  </span>
                  <span className="hidden text-xs text-ink-secondary sm:block">
                    {requirement.evidence}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute -right-1.5 bottom-0 flex w-[250px] flex-col gap-1.5 rounded bg-ink px-4 py-3.5 text-white shadow-[0_20px_40px_-20px_rgba(17,18,20,0.5)] sm:right-auto sm:-left-7 sm:w-auto sm:max-w-[300px] sm:gap-2 sm:px-[18px] sm:py-4">
        <span className="font-mono text-[10px] tracking-[0.04em] text-accent-soft sm:text-[11px]">
          SUGGESTED FIX
        </span>
        <span className="text-xs leading-normal text-page/90 sm:text-[13px]">
          If you ran containers on EKS in your 2024 role, say so.
          <span className="hidden sm:inline"> It&apos;s the largest gap for this posting.</span>
        </span>
      </div>
    </div>
  );
}
