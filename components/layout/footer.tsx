export function Footer() {
  return (
    <footer className="border-t border-hairline bg-surface">
      <div className="mx-auto max-w-[1120px] px-8 py-8">
        <p className="text-center text-sm text-ink-secondary">
          © {new Date().getFullYear()} Fitly. Powered by Claude AI.
        </p>
      </div>
    </footer>
  );
}
