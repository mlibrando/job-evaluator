'use client';

import { useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { LogOut, Menu, X } from 'lucide-react';
import { SignOutButton } from '@/components/auth/sign-out-button';
import { Button, useDismiss } from '@/components/ui';
import { cn } from '@/lib/utils/cn';
import { Wordmark } from './wordmark';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard', matches: [] },
  { href: '/evaluate', label: 'New evaluation', matches: [] },
  { href: '/history', label: 'History', matches: ['/evaluations'] },
];

/**
 * App shell header.
 *
 * Self-contained — it reads the session itself and takes no props, so any page
 * can drop it in.
 */
export function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const closeUserMenu = useCallback(() => setUserMenuOpen(false), []);
  const closeNav = useCallback(() => setNavOpen(false), []);

  useDismiss(userMenuRef, userMenuOpen, closeUserMenu);
  useDismiss(headerRef, navOpen, closeNav);

  const email = session?.user?.email ?? '';
  const initials = email.slice(0, 2).toUpperCase();

  const isActive = (href: string, matches: string[]) =>
    [href, ...matches].some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  return (
    <header ref={headerRef} className="relative z-20 border-b border-hairline bg-surface">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-5 px-5 py-2.5 sm:px-10 sm:py-3">
        <div className="flex min-w-0 items-center gap-7">
          <Link
            href={session ? '/dashboard' : '/'}
            aria-label="Fitly home"
            className="rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Wordmark className="text-[21px]" />
          </Link>

          {session && (
            <nav aria-label="Main" className="hidden items-center gap-1 text-sm md:flex">
              {NAV_LINKS.map(({ href, label, matches }) => {
                const active = isActive(href, matches);
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'rounded-sm px-3 py-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                      active ? 'bg-page font-medium text-ink' : 'text-ink-secondary hover:text-ink',
                    )}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2">
          {session ? (
            <>
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((open) => !open)}
                  aria-label="Account menu"
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                  className="flex items-center gap-3 rounded-full py-1 pl-2 text-ink-secondary transition-colors hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <span className="hidden text-[13px] whitespace-nowrap sm:block">{email}</span>
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-sunken font-mono text-xs text-ink-secondary sm:size-[34px]">
                    {initials}
                  </span>
                </button>

                {userMenuOpen && (
                  <div
                    role="menu"
                    className="absolute top-12 right-0 z-20 min-w-52 rounded border border-hairline bg-surface p-1.5 shadow-score"
                  >
                    <SignOutButton className="flex w-full items-center gap-2.5 rounded-sm px-3 py-2.5 text-left text-[15px] text-ink-secondary transition-colors hover:bg-surface-sunken hover:text-danger">
                      <LogOut size={16} strokeWidth={1.5} />
                      Sign out
                    </SignOutButton>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setNavOpen((open) => !open)}
                aria-label={navOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={navOpen}
                aria-controls="app-menu"
                className="inline-flex size-11 items-center justify-center rounded-full border border-hairline text-ink transition-colors hover:border-hairline-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-accent md:hidden"
              >
                {navOpen ? <X size={18} strokeWidth={1.8} /> : <Menu size={18} strokeWidth={1.8} />}
              </button>
            </>
          ) : (
            <Link href="/login">
              <Button variant="primary" size="sm">
                Sign in
              </Button>
            </Link>
          )}
        </div>
      </div>

      {session && navOpen && (
        <nav
          id="app-menu"
          aria-label="Main"
          className="absolute inset-x-0 top-full border-b border-hairline bg-surface px-5 pt-2 pb-5 shadow-score md:hidden"
        >
          <ul className="flex flex-col">
            {NAV_LINKS.map(({ href, label, matches }, index) => {
              const active = isActive(href, matches);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={closeNav}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex min-h-12 items-center text-base',
                      index < NAV_LINKS.length - 1 && 'border-b border-hairline',
                      active ? 'font-medium text-ink' : 'text-ink-secondary',
                    )}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}
