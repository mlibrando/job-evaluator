export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          © {new Date().getFullYear()} AI Job Evaluator. Powered by Claude AI.
        </p>
      </div>
    </footer>
  );
}
