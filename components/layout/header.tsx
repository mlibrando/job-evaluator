'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import { SignOutButton } from '@/components/auth/sign-out-button';
import { Button, useDismiss } from '@/components/ui';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/evaluate', label: 'New evaluation' },
  { href: '/history', label: 'History' },
];

/**
 * App shell header.
 *
 * Self-contained — it reads the session itself and takes no props, so any page
 * (including the landing page, once that's overhauled) can drop it in.
 */
export function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useDismiss(menuRef, menuOpen, () => setMenuOpen(false));

  const email = session?.user?.email ?? '';
  const initials = email.slice(0, 2).toUpperCase();

  return (
    <header className="border-b border-hairline bg-surface">
      <div className="mx-auto flex h-16 max-w-[1120px] items-center justify-between gap-8 px-8">
        <div className="flex min-w-0 items-center gap-10">
          <Link
            href={session ? '/dashboard' : '/'}
            className="font-wordmark text-[26px] font-medium whitespace-nowrap text-ink"
          >
            Fitly
          </Link>

          {session && (
            <nav className="hidden items-center gap-7 md:flex">
              {NAV_LINKS.map(({ href, label }) => {
                const active = pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`text-[15px] transition-colors hover:text-ink ${
                      active ? 'font-medium text-ink' : 'text-ink-secondary'
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          {session ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="flex items-center gap-3 rounded-sm py-1 pl-2 text-ink-secondary transition-colors hover:text-ink"
              >
                <span className="hidden text-sm whitespace-nowrap sm:block">{email}</span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-sunken text-[13px]">
                  {initials}
                </span>
              </button>

              {menuOpen && (
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
          ) : (
            <Link href="/login">
              <Button variant="primary" size="sm">
                Sign in
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
