'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { SignOutButton } from '@/components/auth/sign-out-button';
import { Button } from '@/components/ui';

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href={session ? '/dashboard' : '/'} className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-zinc-900 dark:bg-white" />
              <span className="text-xl font-bold text-zinc-900 dark:text-white">
                AI Job Evaluator
              </span>
            </Link>

            {session && (
              <nav className="hidden md:flex items-center gap-6">
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                >
                  Dashboard
                </Link>
                <Link
                  href="/evaluate"
                  className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                >
                  New Evaluation
                </Link>
                <Link
                  href="/history"
                  className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                >
                  History
                </Link>
              </nav>
            )}
          </div>

          <div className="flex items-center gap-4">
            {session ? (
              <>
                <div className="hidden sm:block text-sm text-zinc-600 dark:text-zinc-400">
                  {session.user?.email}
                </div>
                <SignOutButton className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800">
                  Sign Out
                </SignOutButton>
              </>
            ) : (
              <Link href="/login">
                <Button variant="primary" size="sm">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
