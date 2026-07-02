import { cn } from "@/lib/utils";

export function AuthShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <main className="auth-gradient flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 shadow-glow">
            <span className="text-xl font-bold text-primary">C</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="glass-card p-6">{children}</div>
      </div>
    </main>
  );
}

export function AuthField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-muted-foreground"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export function authInputClass(className?: string) {
  return cn(
    "flex h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 text-sm text-foreground placeholder:text-muted-foreground transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
    className,
  );
}

export function AuthButton({
  children,
  loading,
  type = "submit",
}: {
  children: React.ReactNode;
  loading?: boolean;
  type?: "submit" | "button";
}) {
  return (
    <button
      type={type}
      disabled={loading}
      className="flex h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:bg-primary/90 disabled:opacity-60"
    >
      {children}
    </button>
  );
}

export function AuthError({ message }: { message: string }) {
  return (
    <p className="rounded-lg bg-expense/10 px-3 py-2 text-sm text-expense">
      {message}
    </p>
  );
}
