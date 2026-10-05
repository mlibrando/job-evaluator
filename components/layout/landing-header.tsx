'use client';

import { useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useDismiss } from '@/components/ui';
import { GITHUB_REPO_URL } from '@/lib/site';
import { Wordmark } from './wordmark';

const NAV_LINKS = [
  { href: '#report', label: 'Sample report' },
  { href: '#how', label: 'How it works' },
  { href: '#built', label: "How it's built" },
];

const SIGN_IN_CLASS =
  'inline-flex h-11 items-center rounded-full bg-ink px-4 text-sm font-medium text-white transition-colors hover:bg-ink/85 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-page md:h-10';

export function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useDismiss(headerRef, menuOpen, closeMenu);

  return (
    <header ref={headerRef} className="relative z-20 border-b border-hairline bg-page">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-6 px-5 py-3 md:px-10 md:py-4">
        <Link href="/" aria-label="Fitly home" className="rounded-sm">
          <Wordmark className="text-[22px] md:text-2xl" />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-7 text-sm md:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <a key={href} href={href} className="text-ink-secondary transition-colors hover:text-ink">
              {label}
            </a>
          ))}
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink-secondary transition-colors hover:text-ink"
          >
            GitHub
          </a>
          <Link href="/login" className={SIGN_IN_CLASS}>
            Sign in
          </Link>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <Link href="/login" className={SIGN_IN_CLASS}>
            Sign in
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="landing-menu"
            className="inline-flex size-11 items-center justify-center rounded-full border border-hairline text-ink transition-colors hover:border-hairline-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {menuOpen ? <X size={18} strokeWidth={1.8} /> : <Menu size={18} strokeWidth={1.8} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="landing-menu"
          aria-label="Main"
          className="absolute inset-x-0 top-full border-b border-hairline bg-page px-5 pt-2 pb-5 shadow-score md:hidden"
        >
          <ul className="flex flex-col">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <a
                  href={href}
                  onClick={closeMenu}
                  className="flex min-h-12 items-center border-b border-hairline text-base text-ink"
                >
                  {label}
                </a>
              </li>
            ))}
            <li>
              <a
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMenu}
                className="flex min-h-12 items-center text-base text-ink"
              >
                GitHub
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
