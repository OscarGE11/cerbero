import { DashboardNav } from "./dashboard-nav";

export function DashboardShell({
  children,
  userEmail,
}: {
  children: React.ReactNode;
  userEmail?: string | null;
}) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-white/[0.06] bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex shrink-0 items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20">
                <span className="text-sm font-bold text-primary">C</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold">Cerbero</p>
                {userEmail && (
                  <p className="truncate text-xs text-muted-foreground">
                    {userEmail}
                  </p>
                )}
              </div>
            </div>
            <DashboardNav />
          </div>
          <form action="/auth/signout" method="post" className="shrink-0">
            <button
              type="submit"
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-white/[0.05] hover:text-foreground"
            >
              Salir
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        {children}
      </main>
    </div>
  );
}
