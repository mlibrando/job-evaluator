import Link from 'next/link';
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-page px-8">
      <div className="w-full max-w-md rounded border border-hairline bg-surface p-10 shadow-score">
        <div className="text-center">
          <h1 className="font-wordmark text-[32px] font-medium text-ink">
            <Link href="/">Fitly</Link>
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-secondary">
            Sign in to see how your résumé matches any job posting.
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <GoogleSignInButton />
        </div>

        <p className="mt-8 text-center text-[13px] leading-relaxed text-ink-muted">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
