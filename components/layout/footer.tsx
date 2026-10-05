import { Wordmark } from './wordmark';

export function Footer() {
  return (
    <footer className="border-t border-hairline bg-surface">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-5 py-4.5 text-[13px] text-ink-secondary sm:px-10 sm:py-5">
        <Wordmark withMark={false} className="text-[17px]" />
        <span>Powered by Claude</span>
      </div>
    </footer>
  );
}
