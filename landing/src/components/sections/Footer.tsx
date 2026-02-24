export function Footer() {
  return (
    <footer className="border-t border-brand-border py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 md:flex-row md:justify-between">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/statis-mark.svg"
            alt="Statis"
            width={28}
            height={28}
            className="opacity-80"
          />
          <span className="text-sm font-medium text-white/80">Statis</span>
        </div>

        <nav className="flex gap-6 text-sm text-brand-muted">
          <a href="https://statis.dev" className="transition-colors hover:text-white">
            Home
          </a>
          <a href="#" className="transition-colors hover:text-white">
            Docs
          </a>
          <a href="#" className="transition-colors hover:text-white">
            GitHub
          </a>
        </nav>

        <p className="text-xs text-brand-muted/60">
          &copy; {new Date().getFullYear()} Statis. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
