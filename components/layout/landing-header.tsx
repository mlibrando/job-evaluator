import Link from 'next/link';

export function LandingHeader() {
  return (
    <header className="border-b border-hairline">
      <div className="mx-auto flex max-w-[1120px] items-center px-5 py-5 sm:px-8">
        <Link
          href="/"
          className="font-wordmark text-2xl font-medium tracking-[-0.005em] text-ink sm:text-[26px]"
        >
          Fitly
        </Link>
      </div>
    </header>
  );
}
