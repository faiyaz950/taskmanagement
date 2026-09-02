/**
 * Standard content wrapper for every page inside the app shell: a sticky
 * page header with title/description/actions, then the page body.
 */
export default function PageShell({
  title,
  description,
  actions,
  children,
  width = "wide",
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  width?: "wide" | "narrow";
}) {
  const maxWidth = width === "narrow" ? "max-w-3xl" : "max-w-6xl";

  return (
    <>
      <header className="sticky top-14 z-20 border-b border-[var(--border)] bg-[var(--background)]/85 backdrop-blur-lg md:top-0">
        <div className={`mx-auto flex ${maxWidth} flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8`}>
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight sm:text-[22px]">{title}</h1>
            {description && <p className="mt-0.5 text-sm text-[var(--muted)]">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </div>
      </header>

      <main className={`mx-auto ${maxWidth} animate-fade-up px-4 py-6 sm:px-6 lg:px-8`}>{children}</main>
    </>
  );
}
